import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  detectEmployeeConflicts,
  getAllEmployeeConflicts,
  type ConflictInfo,
} from '@/lib/scheduling'
import { useProject } from './projects'
import { useEmployees } from './employees'
import { useCurrentWorkspace } from '@/hooks/use-workspace'
import type { Task } from '@/types/projects'

// =============================================================================
// Query Keys
// =============================================================================

export const conflictKeys = {
  all: ['conflicts'] as const,
  project: (projectId: string) => [...conflictKeys.all, 'project', projectId] as const,
  employee: (employeeId: string) => [...conflictKeys.all, 'employee', employeeId] as const,
}

// =============================================================================
// Types
// =============================================================================

/**
 * Enhanced conflict info with both tasks involved
 */
export interface ProjectConflict {
  id: string
  employeeId: string
  employeeName: string
  task1Id: string
  task1Name: string
  task2Id: string
  task2Name: string
  overlapStart: string
  overlapEnd: string
  overlapDays: number
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * Get all scheduling conflicts for a project
 *
 * Detects all employee double-bookings within the project's tasks.
 */
export function useProjectConflicts(projectId: string) {
  const { data: project, isLoading: projectLoading } = useProject(projectId)
  const { workspaceId } = useCurrentWorkspace()
  const { data: employees, isLoading: employeesLoading } = useEmployees(workspaceId)

  return useQuery({
    queryKey: conflictKeys.project(projectId),
    queryFn: (): ProjectConflict[] => {
      if (!project?.tasks || !employees) return []

      const conflicts: ProjectConflict[] = []

      // Get unique employee IDs from all task assignments
      const employeeIds = new Set<string>()
      project.tasks.forEach((task) => {
        task.assignments.forEach((assignment) => {
          employeeIds.add(assignment.employeeId)
        })
      })

      // For each employee, check for conflicts between their assigned tasks
      employeeIds.forEach((employeeId) => {
        const employee = employees.find((e) => e.id === employeeId)
        if (!employee) return

        // Get all tasks assigned to this employee
        const employeeTasks = project.tasks.filter((task) =>
          task.assignments.some((a) => a.employeeId === employeeId)
        )

        // Check each pair of tasks for overlap
        for (let i = 0; i < employeeTasks.length; i++) {
          for (let j = i + 1; j < employeeTasks.length; j++) {
            const task1 = employeeTasks[i]
            const task2 = employeeTasks[j]

            // Check for date overlap
            const start1 = new Date(task1.startDate)
            const end1 = new Date(task1.endDate)
            const start2 = new Date(task2.startDate)
            const end2 = new Date(task2.endDate)

            // Tasks overlap if one starts before the other ends
            if (start1 <= end2 && start2 <= end1) {
              // Calculate overlap period
              const overlapStart = start1 > start2 ? task1.startDate : task2.startDate
              const overlapEnd = end1 < end2 ? task1.endDate : task2.endDate

              // Calculate overlap days
              const overlapStartDate = new Date(overlapStart)
              const overlapEndDate = new Date(overlapEnd)
              const overlapDays =
                Math.ceil(
                  (overlapEndDate.getTime() - overlapStartDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                ) + 1

              conflicts.push({
                id: `${employeeId}-${task1.id}-${task2.id}`,
                employeeId,
                employeeName: employee.name,
                task1Id: task1.id,
                task1Name: task1.name,
                task2Id: task2.id,
                task2Name: task2.name,
                overlapStart,
                overlapEnd,
                overlapDays,
              })
            }
          }
        }
      })

      return conflicts
    },
    enabled: !!project && !!employees && !projectLoading && !employeesLoading,
    staleTime: 1000 * 30, // 30 seconds cache
  })
}

/**
 * Get conflicts grouped by employee for a project
 *
 * Returns a Map where keys are employee IDs and values are arrays of conflicts
 * involving that employee.
 */
export function useConflictsByEmployee(projectId: string) {
  const { data: conflicts } = useProjectConflicts(projectId)

  return React.useMemo(() => {
    const byEmployee = new Map<string, ProjectConflict[]>()

    if (!conflicts) return byEmployee

    conflicts.forEach((conflict) => {
      const existing = byEmployee.get(conflict.employeeId) || []
      byEmployee.set(conflict.employeeId, [...existing, conflict])
    })

    return byEmployee
  }, [conflicts])
}

/**
 * Check if a new assignment would create a conflict
 *
 * @param employeeId - Employee to assign
 * @param taskId - Task to assign to
 * @param tasks - All tasks in the project
 * @returns Conflict info if a conflict would be created, null otherwise
 */
export function checkAssignmentConflict(
  employeeId: string,
  taskId: string,
  tasks: Task[]
): ConflictInfo | null {
  const targetTask = tasks.find((t) => t.id === taskId)
  if (!targetTask) return null

  // Get all other tasks assigned to this employee
  const employeeTasks = tasks.filter(
    (task) =>
      task.id !== taskId &&
      task.assignments.some((a) => a.employeeId === employeeId)
  )

  // Check each task for overlap with the target task
  for (const task of employeeTasks) {
    const start1 = new Date(targetTask.startDate)
    const end1 = new Date(targetTask.endDate)
    const start2 = new Date(task.startDate)
    const end2 = new Date(task.endDate)

    // Check for overlap
    if (start1 <= end2 && start2 <= end1) {
      // Calculate overlap
      const overlapStart = start1 > start2 ? targetTask.startDate : task.startDate
      const overlapEnd = end1 < end2 ? targetTask.endDate : task.endDate

      const overlapStartDate = new Date(overlapStart)
      const overlapEndDate = new Date(overlapEnd)
      const overlapDays =
        Math.ceil(
          (overlapEndDate.getTime() - overlapStartDate.getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1

      return {
        taskId: task.id,
        taskName: task.name,
        projectName: '', // Not available in this context
        startDate: task.startDate,
        endDate: task.endDate,
        overlapDays,
      }
    }
  }

  return null
}

/**
 * Get the total number of conflicts in a project
 */
export function useProjectConflictCount(projectId: string) {
  const { data: conflicts } = useProjectConflicts(projectId)
  return conflicts?.length ?? 0
}
