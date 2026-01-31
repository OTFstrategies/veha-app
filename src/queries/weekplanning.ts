"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { format, addDays, startOfWeek, parseISO, isWithinInterval } from "date-fns";
import type {
  WeekEmployee,
  EmployeeSchedule,
  DayTask,
  DayAvailability,
  AvailabilityStatus,
} from "@/types/weekplanning";

// =============================================================================
// Types for query results (matching what Supabase returns)
// =============================================================================

interface ClientFromQuery {
  id: string;
  name: string;
}

interface ProjectFromQuery {
  id: string;
  name: string;
  workspace_id: string;
  client: ClientFromQuery | ClientFromQuery[];
}

interface TaskFromQuery {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  project: ProjectFromQuery | ProjectFromQuery[];
}

interface AssignmentFromQuery {
  id: string;
  employee_id: string;
  task: TaskFromQuery | TaskFromQuery[];
}

interface AvailabilityFromQuery {
  id: string;
  date: string;
  status: string;
  notes: string | null;
}

interface EmployeeFromQuery {
  id: string;
  name: string;
  role: string;
  color: string;
  is_active: boolean;
  employee_availability: AvailabilityFromQuery[];
}

// Normalized types for internal use
interface NormalizedProject {
  id: string;
  name: string;
  workspace_id: string;
  clientName: string;
}

interface NormalizedTask {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  project: NormalizedProject;
}

interface NormalizedAssignment {
  id: string;
  employee_id: string;
  task: NormalizedTask;
}

// =============================================================================
// Helper functions
// =============================================================================

function extractFirst<T>(data: T | T[] | null | undefined): T | null {
  if (!data) return null;
  if (Array.isArray(data)) return data[0] ?? null;
  return data;
}

/**
 * Normalize the Supabase query result to a consistent structure
 */
function normalizeAssignment(raw: AssignmentFromQuery): NormalizedAssignment | null {
  const task = extractFirst(raw.task);
  if (!task) return null;

  const project = extractFirst(task.project);
  if (!project) return null;

  const client = extractFirst(project.client);

  return {
    id: raw.id,
    employee_id: raw.employee_id,
    task: {
      id: task.id,
      name: task.name,
      start_date: task.start_date,
      end_date: task.end_date,
      status: task.status,
      project: {
        id: project.id,
        name: project.name,
        workspace_id: project.workspace_id,
        clientName: client?.name ?? "Onbekende klant",
      },
    },
  };
}

/**
 * Check if a task overlaps with a specific date
 */
function taskOverlapsDate(task: NormalizedTask, dateStr: string): boolean {
  const date = parseISO(dateStr);
  const taskStart = parseISO(task.start_date);
  const taskEnd = parseISO(task.end_date);

  return isWithinInterval(date, { start: taskStart, end: taskEnd });
}

/**
 * Transform raw availability data to DayAvailability format
 */
function transformAvailability(
  availability: AvailabilityFromQuery
): DayAvailability | null {
  // Only show non-available statuses (skip 'beschikbaar')
  if (availability.status === "beschikbaar") {
    return null;
  }

  return {
    status: availability.status as AvailabilityStatus,
    notes: availability.notes ?? "",
  };
}

/**
 * Transform assignment to DayTask format
 */
function transformAssignmentToTask(assignment: NormalizedAssignment): DayTask {
  return {
    id: assignment.task.id,
    name: assignment.task.name,
    projectId: assignment.task.project.id,
    projectName: assignment.task.project.name,
    clientName: assignment.task.project.clientName,
  };
}

/**
 * Build schedule map for an employee
 */
function buildEmployeeSchedule(
  employee: EmployeeFromQuery,
  assignments: NormalizedAssignment[],
  weekDates: string[]
): EmployeeSchedule {
  const schedule: EmployeeSchedule = {};

  // Initialize all dates with empty entries
  for (const dateStr of weekDates) {
    schedule[dateStr] = {
      availability: null,
      tasks: [],
    };
  }

  // Add availability data
  for (const availability of employee.employee_availability ?? []) {
    const dateStr = availability.date;
    if (schedule[dateStr]) {
      const transformedAvailability = transformAvailability(availability);
      if (transformedAvailability) {
        schedule[dateStr].availability = transformedAvailability;
      }
    }
  }

  // Add task data for each day
  for (const assignment of assignments) {
    for (const dateStr of weekDates) {
      // Check if task is active on this date
      if (taskOverlapsDate(assignment.task, dateStr)) {
        // Only add tasks if employee is available (no non-available status)
        if (!schedule[dateStr].availability) {
          schedule[dateStr].tasks.push(transformAssignmentToTask(assignment));
        }
      }
    }
  }

  return schedule;
}

/**
 * Get role display name in Dutch
 */
function getRoleDisplayName(role: string): string {
  const roleMap: Record<string, string> = {
    uitvoerder: "Uitvoerder",
    voorman: "Voorman",
    specialist: "Specialist",
    projectleider: "Projectleider",
  };
  return roleMap[role] ?? role;
}

// =============================================================================
// Query hooks
// =============================================================================

/**
 * Fetch all employees with their schedules for the week
 * Aggregates task assignments and availability records
 */
export function useWeekPlanning(weekStart: Date) {
  const supabase = createClient();
  const { workspaceId } = useCurrentWorkspace();

  // Calculate week dates (Mon-Fri)
  const weekMonday = startOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDates: string[] = [];
  for (let i = 0; i < 5; i++) {
    weekDates.push(format(addDays(weekMonday, i), "yyyy-MM-dd"));
  }

  const startDate = weekDates[0];
  const endDate = weekDates[weekDates.length - 1];

  return useQuery({
    queryKey: ["week-planning", workspaceId, startDate],
    queryFn: async (): Promise<WeekEmployee[]> => {
      if (!workspaceId) {
        return [];
      }

      // Fetch employees with their availability for the week
      const { data: employeesData, error: employeesError } = await supabase
        .from("employees")
        .select(
          `
          id,
          name,
          role,
          color,
          is_active,
          employee_availability (
            id,
            date,
            status,
            notes
          )
        `
        )
        .eq("workspace_id", workspaceId)
        .eq("is_active", true)
        .gte("employee_availability.date", startDate)
        .lte("employee_availability.date", endDate)
        .order("name");

      if (employeesError) {
        throw employeesError;
      }

      // Fetch all task assignments for employees in this workspace
      // We need tasks that overlap with our week
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("task_assignments")
        .select(
          `
          id,
          employee_id,
          task:tasks (
            id,
            name,
            start_date,
            end_date,
            status,
            project:projects (
              id,
              name,
              workspace_id,
              client:clients (
                id,
                name
              )
            )
          )
        `
        )
        .lte("task.start_date", endDate)
        .gte("task.end_date", startDate);

      if (assignmentsError) {
        throw assignmentsError;
      }

      // Normalize and filter assignments to only include those from current workspace
      const normalizedAssignments: NormalizedAssignment[] = [];
      for (const raw of (assignmentsData ?? []) as AssignmentFromQuery[]) {
        const normalized = normalizeAssignment(raw);
        if (
          normalized &&
          normalized.task.project.workspace_id === workspaceId &&
          normalized.task.status !== "done"
        ) {
          normalizedAssignments.push(normalized);
        }
      }

      // Group assignments by employee_id
      const assignmentsByEmployee = new Map<string, NormalizedAssignment[]>();
      for (const assignment of normalizedAssignments) {
        const existing = assignmentsByEmployee.get(assignment.employee_id) ?? [];
        existing.push(assignment);
        assignmentsByEmployee.set(assignment.employee_id, existing);
      }

      // Transform to WeekEmployee format
      const employees: WeekEmployee[] = ((employeesData ?? []) as EmployeeFromQuery[]).map(
        (employee) => {
          const employeeAssignments =
            assignmentsByEmployee.get(employee.id) ?? [];

          return {
            id: employee.id,
            name: employee.name,
            role: getRoleDisplayName(employee.role),
            color: employee.color,
            schedule: buildEmployeeSchedule(
              employee,
              employeeAssignments,
              weekDates
            ),
          };
        }
      );

      return employees;
    },
    enabled: !!workspaceId,
    staleTime: 60 * 1000, // 1 minute - schedule data changes frequently during planning
  });
}
