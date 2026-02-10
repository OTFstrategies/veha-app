"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { getInitials } from "@/lib/format";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  isWithinInterval,
  parseISO,
} from "date-fns";
import type {
  DashboardStats,
  TodayTaskGroup,
  TodayTask,
  ActiveProject,
  CapacityEntry,
  Assignee,
  CapacityStatus,
  TaskStatus,
} from "@/types/dashboard";

// =============================================================================
// Query Keys
// =============================================================================

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: (workspaceId: string) =>
    [...dashboardKeys.all, "stats", workspaceId] as const,
  todayTasks: (workspaceId: string) =>
    [...dashboardKeys.all, "todayTasks", workspaceId] as const,
  activeProjects: (workspaceId: string) =>
    [...dashboardKeys.all, "activeProjects", workspaceId] as const,
  capacity: (workspaceId: string) =>
    [...dashboardKeys.all, "capacity", workspaceId] as const,
};

// =============================================================================
// Query Return Types (matching Supabase select)
// =============================================================================

interface EmployeePartial {
  id: string;
  name: string;
  color: string;
}

interface TaskAssignmentWithEmployee {
  employee: EmployeePartial | EmployeePartial[];
}

interface TaskFromQuery {
  id: string;
  name: string;
  progress: number;
  status: TaskStatus;
  start_date: string;
  end_date: string;
  task_assignments: TaskAssignmentWithEmployee[];
}

interface ProjectWithTasksFromQuery {
  id: string;
  name: string;
  client: { name: string } | { name: string }[] | null;
  tasks: TaskFromQuery[];
}

// =============================================================================
// Helper Functions
// =============================================================================


function getCapacityStatus(
  plannedHours: number,
  availableHours: number
): CapacityStatus {
  if (availableHours === 0) return "underutilized";
  const utilization = (plannedHours / availableHours) * 100;
  if (utilization > 100) return "overbooked";
  if (utilization >= 70) return "optimal";
  return "underutilized";
}

function extractEmployee(employee: EmployeePartial | EmployeePartial[]): EmployeePartial | null {
  if (Array.isArray(employee)) {
    return employee[0] ?? null;
  }
  return employee ?? null;
}

function extractClientName(client: { name: string } | { name: string }[] | null): string {
  if (!client) return "Onbekende klant";
  if (Array.isArray(client)) {
    return client[0]?.name ?? "Onbekende klant";
  }
  return client.name ?? "Onbekende klant";
}

// =============================================================================
// Dashboard Stats Query
// =============================================================================

export function useDashboardStats() {
  const supabase = createClient();
  const { workspaceId } = useCurrentWorkspace();

  return useQuery({
    queryKey: dashboardKeys.stats(workspaceId ?? ""),
    queryFn: async (): Promise<DashboardStats> => {
      if (!workspaceId) {
        throw new Error("No workspace selected");
      }

      const today = format(new Date(), "yyyy-MM-dd");
      const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");

      // Fetch active projects
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("id, status, created_at, progress, end_date")
        .eq("workspace_id", workspaceId)
        .eq("status", "actief");

      if (projectsError) throw projectsError;

      // Fetch tasks for today (filtered by workspace projects)
      const projectIds = projects?.map((p) => p.id) ?? [];

      // Skip query if no active projects
      const { data: todayTasks, error: tasksError } = projectIds.length > 0
        ? await supabase
            .from("tasks")
            .select("id, status, project_id")
            .in("project_id", projectIds)
            .lte("start_date", today)
            .gte("end_date", today)
        : { data: [], error: null };

      if (tasksError) throw tasksError;

      const todayTasksFiltered = todayTasks ?? [];

      // Fetch employees
      const { data: employees, error: employeesError } = await supabase
        .from("employees")
        .select("id, is_active")
        .eq("workspace_id", workspaceId)
        .eq("is_active", true);

      if (employeesError) throw employeesError;

      // Fetch availability for today
      const { data: availability, error: availabilityError } = await supabase
        .from("employee_availability")
        .select("employee_id, status")
        .eq("date", today);

      if (availabilityError) throw availabilityError;

      // Calculate available employees (not on leave/sick)
      const unavailableEmployeeIds = new Set(
        availability
          ?.filter((a) => a.status !== "beschikbaar")
          .map((a) => a.employee_id) ?? []
      );

      const availableEmployees =
        employees?.filter((e) => !unavailableEmployeeIds.has(e.id)).length ?? 0;

      // Calculate projects needing attention (behind schedule)
      const projectsNeedingAttention = projects?.filter((p) => {
        const endDate = new Date(p.end_date);
        const now = new Date();
        // Project is delayed if end date passed and not 100% complete
        // or if progress is significantly behind expected
        if (endDate < now && p.progress < 100) return true;
        return false;
      }).length ?? 0;

      // Count new projects this month
      const newThisMonth =
        projects?.filter((p) => p.created_at >= monthStart).length ?? 0;

      // Count completed tasks today
      const completedToday = todayTasksFiltered.filter(
        (t) => t.status === "done"
      ).length;

      return {
        activeProjects: {
          count: projects?.length ?? 0,
          newThisMonth,
        },
        todayTasks: {
          count: todayTasksFiltered.length,
          completed: completedToday,
        },
        availableEmployees: {
          available: availableEmployees,
          total: employees?.length ?? 0,
        },
        attentionNeeded: {
          count: projectsNeedingAttention,
        },
      };
    },
    enabled: !!workspaceId,
    staleTime: 60 * 1000, // 1 minute - stats are time-sensitive
  });
}

// =============================================================================
// Today Tasks Query
// =============================================================================

export function useTodayTasks() {
  const supabase = createClient();
  const { workspaceId } = useCurrentWorkspace();

  return useQuery({
    queryKey: dashboardKeys.todayTasks(workspaceId ?? ""),
    queryFn: async (): Promise<TodayTaskGroup[]> => {
      if (!workspaceId) {
        throw new Error("No workspace selected");
      }

      // Fetch active projects with their tasks that are active today
      const { data: projects, error } = await supabase
        .from("projects")
        .select(
          `
          id,
          name,
          client:clients (name),
          tasks (
            id,
            name,
            progress,
            status,
            start_date,
            end_date,
            task_assignments (
              employee:employees (
                id,
                name,
                color
              )
            )
          )
        `
        )
        .eq("workspace_id", workspaceId)
        .eq("status", "actief");

      if (error) throw error;

      // Filter and transform the data
      const taskGroups: TodayTaskGroup[] = [];

      for (const project of (projects ?? []) as unknown as ProjectWithTasksFromQuery[]) {
        // Filter tasks that are active today
        const todayTasks = project.tasks?.filter(
          (task) => {
            const startDate = parseISO(task.start_date);
            const endDate = parseISO(task.end_date);
            const todayDate = new Date();
            return isWithinInterval(todayDate, { start: startDate, end: endDate });
          }
        ) ?? [];

        if (todayTasks.length > 0) {
          const transformedTasks: TodayTask[] = todayTasks.map((task) => ({
            id: task.id,
            name: task.name,
            progress: task.progress,
            status: task.status,
            assignees: (task.task_assignments ?? []).map((ta): Assignee => {
              const employee = extractEmployee(ta.employee);
              return {
                id: employee?.id ?? "",
                name: employee?.name ?? "",
                color: employee?.color ?? "#6b7280",
                initials: employee ? getInitials(employee.name) : "??",
              };
            }).filter(a => a.id),
          }));

          taskGroups.push({
            projectId: project.id,
            projectName: project.name,
            clientName: extractClientName(project.client),
            tasks: transformedTasks,
          });
        }
      }

      return taskGroups;
    },
    enabled: !!workspaceId,
    staleTime: 60 * 1000, // 1 minute - task data changes frequently
  });
}

// =============================================================================
// Active Projects Query
// =============================================================================

interface ActiveProjectFromQuery {
  id: string;
  name: string;
  progress: number;
  start_date: string;
  end_date: string;
  status: "gepland" | "actief" | "on-hold" | "afgerond" | "geannuleerd";
  client: { name: string } | { name: string }[] | null;
  tasks: Array<{
    task_assignments: TaskAssignmentWithEmployee[];
  }>;
}

export function useActiveProjects() {
  const supabase = createClient();
  const { workspaceId } = useCurrentWorkspace();

  return useQuery({
    queryKey: dashboardKeys.activeProjects(workspaceId ?? ""),
    queryFn: async (): Promise<ActiveProject[]> => {
      if (!workspaceId) {
        throw new Error("No workspace selected");
      }

      // Fetch active projects with client and assignments
      const { data: projects, error } = await supabase
        .from("projects")
        .select(
          `
          id,
          name,
          progress,
          start_date,
          end_date,
          status,
          client:clients (name),
          tasks (
            task_assignments (
              employee:employees (
                id,
                name,
                color
              )
            )
          )
        `
        )
        .eq("workspace_id", workspaceId)
        .eq("status", "actief")
        .order("end_date", { ascending: true });

      if (error) throw error;

      return ((projects ?? []) as unknown as ActiveProjectFromQuery[]).map((project): ActiveProject => {
        // Collect unique assignees from all tasks
        const assigneeMap = new Map<string, Assignee>();

        for (const task of project.tasks ?? []) {
          for (const ta of task.task_assignments ?? []) {
            const employee = extractEmployee(ta.employee);
            if (employee && !assigneeMap.has(employee.id)) {
              assigneeMap.set(employee.id, {
                id: employee.id,
                name: employee.name,
                color: employee.color,
                initials: getInitials(employee.name),
              });
            }
          }
        }

        // Check if project is delayed
        const endDate = new Date(project.end_date);
        const now = new Date();
        const isDelayed = endDate < now && project.progress < 100;

        return {
          id: project.id,
          name: project.name,
          clientName: extractClientName(project.client),
          progress: project.progress,
          startDate: project.start_date,
          endDate: project.end_date,
          status: project.status,
          isDelayed,
          assignees: Array.from(assigneeMap.values()),
        };
      });
    },
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000, // 2 minutes - project data is relatively stable
  });
}

// =============================================================================
// Capacity Query
// =============================================================================

export function useCapacity() {
  const supabase = createClient();
  const { workspaceId } = useCurrentWorkspace();

  return useQuery({
    queryKey: dashboardKeys.capacity(workspaceId ?? ""),
    queryFn: async (): Promise<CapacityEntry[]> => {
      if (!workspaceId) {
        throw new Error("No workspace selected");
      }

      const today = new Date();
      const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
      const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");

      // Fetch active employees
      const { data: employees, error: employeesError } = await supabase
        .from("employees")
        .select("id, name, role, color, weekly_capacity")
        .eq("workspace_id", workspaceId)
        .eq("is_active", true);

      if (employeesError) throw employeesError;

      // Fetch task assignments for this week
      const { data: assignments, error: assignmentsError } = await supabase
        .from("task_assignments")
        .select(
          `
          employee_id,
          planned_hours,
          task:tasks (
            start_date,
            end_date
          )
        `
        );

      if (assignmentsError) throw assignmentsError;

      // Fetch availability for this week (to reduce available hours)
      const { data: availability, error: availabilityError } = await supabase
        .from("employee_availability")
        .select("employee_id, date, status")
        .gte("date", weekStart)
        .lte("date", weekEnd);

      if (availabilityError) throw availabilityError;

      // Calculate capacity for each employee
      return (employees ?? []).map((employee): CapacityEntry => {
        // Calculate planned hours for this week
        const employeeAssignments = (assignments ?? []).filter((a) => {
          if (a.employee_id !== employee.id) return false;
          const task = a.task as { start_date: string; end_date: string } | { start_date: string; end_date: string }[] | null;

          // Handle both single object and array from Supabase
          const taskData = Array.isArray(task) ? task[0] : task;
          if (!taskData) return false;

          // Check if task overlaps with this week
          const taskStart = parseISO(taskData.start_date);
          const taskEnd = parseISO(taskData.end_date);
          const weekStartDate = parseISO(weekStart);
          const weekEndDate = parseISO(weekEnd);

          return taskStart <= weekEndDate && taskEnd >= weekStartDate;
        });

        const plannedHours = employeeAssignments.reduce(
          (sum, a) => sum + a.planned_hours,
          0
        );

        // Calculate available hours (reduce for days off)
        const daysOff =
          availability?.filter(
            (a) =>
              a.employee_id === employee.id && a.status !== "beschikbaar"
          ).length ?? 0;

        // Assuming 8 hours per day, 5 days a week
        const hoursPerDay = employee.weekly_capacity / 5;
        const availableHours = Math.max(0, employee.weekly_capacity - daysOff * hoursPerDay);

        const utilizationPercent =
          availableHours > 0
            ? Math.round((plannedHours / availableHours) * 100)
            : 0;

        return {
          id: employee.id,
          name: employee.name,
          role: employee.role,
          color: employee.color,
          plannedHours,
          availableHours,
          utilizationPercent,
          status: getCapacityStatus(plannedHours, availableHours),
        };
      });
    },
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000, // 2 minutes - capacity data changes during planning
  });
}
