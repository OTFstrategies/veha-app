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
// Types
// =============================================================================

export type ResourceType = "medewerkers" | "middelen";

// Types for query results (matching what Supabase returns)
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
  estimated_hours?: number;
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
  available_hours?: number;
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
  estimated_hours?: number;
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

/**
 * Extract the first element from Supabase query result
 * Supabase can return either a single object or an array depending on the relation
 */
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
      estimated_hours: task.estimated_hours,
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
 * Calculate hours for a task on a specific day
 * If task spans multiple days, distribute hours evenly
 */
function calculateTaskHoursForDay(task: NormalizedTask): number {
  if (!task.estimated_hours) return 0;

  const taskStart = parseISO(task.start_date);
  const taskEnd = parseISO(task.end_date);

  // Calculate business days (Mon-Fri) the task spans
  let businessDays = 0;
  const currentDate = new Date(taskStart);

  while (currentDate <= taskEnd) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (businessDays === 0) return task.estimated_hours;
  return task.estimated_hours / businessDays;
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
    hours: calculateTaskHoursForDay(assignment.task),
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
      plannedHours: 0,
      availableHours: 8, // Default 8 hours
    };
  }

  // Add availability data
  for (const availability of employee.employee_availability ?? []) {
    const dateStr = availability.date;
    if (schedule[dateStr]) {
      const transformedAvailability = transformAvailability(availability);
      if (transformedAvailability) {
        schedule[dateStr].availability = transformedAvailability;
        schedule[dateStr].availableHours = 0; // Not available
      } else if (availability.available_hours !== undefined) {
        schedule[dateStr].availableHours = availability.available_hours;
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
          const dayTask = transformAssignmentToTask(assignment);
          schedule[dateStr].tasks.push(dayTask);
          schedule[dateStr].plannedHours = (schedule[dateStr].plannedHours ?? 0) + (dayTask.hours ?? 0);
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
// Query hook
// =============================================================================

/**
 * Unified resource week planning hook
 * Supports both employees (medewerkers) and equipment (middelen)
 */
export function useResourceWeekPlanning(
  weekStart: Date,
  resourceType: ResourceType
) {
  const supabase = createClient();
  const { workspaceId } = useCurrentWorkspace();

  // Calculate week dates (Mon-Fri)
  const weekMonday = startOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDates: string[] = [];
  for (let i = 0; i < 5; i++) {
    weekDates.push(format(addDays(weekMonday, i), "yyyy-MM-dd"));
  }

  const startDate = weekDates[0] as string;
  const endDate = weekDates[weekDates.length - 1] as string;

  return useQuery({
    queryKey: ["resources-weekplanning", workspaceId, startDate, resourceType],
    queryFn: async (): Promise<WeekEmployee[]> => {
      if (!workspaceId) {
        return [];
      }

      // Equipment (middelen)
      if (resourceType === "middelen") {
        // Fetch equipment with basic info
        const { data: equipmentData, error: equipmentError } = await supabase
          .from("equipment")
          .select("id, name, equipment_type, status, daily_capacity_hours")
          .eq("workspace_id", workspaceId)
          .eq("is_active", true)
          .order("name");

        if (equipmentError) {
          throw equipmentError;
        }

        // Map equipment type to display name
        const equipmentTypeLabels: Record<string, string> = {
          voertuig: "Voertuig",
          machine: "Machine",
          gereedschap: "Gereedschap",
        };

        // Transform equipment to WeekEmployee format (reusing the same structure)
        const equipment: WeekEmployee[] = (equipmentData ?? []).map((item) => {
          // Build empty schedule for the week
          const schedule: EmployeeSchedule = {};
          for (const dateStr of weekDates) {
            schedule[dateStr] = {
              availability: null,
              tasks: [],
              plannedHours: 0,
              availableHours: item.daily_capacity_hours || 8,
            };
          }

          return {
            id: item.id,
            name: item.name,
            role: equipmentTypeLabels[item.equipment_type] || item.equipment_type,
            color: "#6b7280", // Default gray color for equipment
            schedule,
          };
        });

        return equipment;
      }

      // Employees (medewerkers) - use existing logic
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
            estimated_hours,
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
