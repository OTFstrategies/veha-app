/**
 * Employee conflict detection module
 *
 * Detects scheduling conflicts where an employee is assigned to
 * multiple overlapping tasks (double-booking).
 */

import { parseISO, differenceInCalendarDays, max, min } from 'date-fns'
import type { Task, TaskAssignment } from '@/types/projects'

/**
 * Information about a scheduling conflict
 */
export interface ConflictInfo {
  taskId: string
  taskName: string
  projectName: string
  startDate: string
  endDate: string
  overlapDays: number
}

/**
 * Extended task with project context for conflict detection
 */
export interface TaskWithProject extends Task {
  projectId: string
  projectName: string
}

/**
 * Calculates the number of overlapping days between two date ranges
 *
 * @param start1 - Start date of first range
 * @param end1 - End date of first range
 * @param start2 - Start date of second range
 * @param end2 - End date of second range
 * @returns Number of overlapping days (0 if no overlap)
 */
export function calculateOverlapDays(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): number {
  const startDate1 = parseISO(start1)
  const endDate1 = parseISO(end1)
  const startDate2 = parseISO(start2)
  const endDate2 = parseISO(end2)

  // Find the overlap range
  const overlapStart = max([startDate1, startDate2])
  const overlapEnd = min([endDate1, endDate2])

  // If overlap start is after overlap end, there's no overlap
  if (overlapStart > overlapEnd) {
    return 0
  }

  // Calculate days of overlap (inclusive)
  return differenceInCalendarDays(overlapEnd, overlapStart) + 1
}

/**
 * Checks if two date ranges overlap
 *
 * @param start1 - Start date of first range (ISO string)
 * @param end1 - End date of first range (ISO string)
 * @param start2 - Start date of second range (ISO string)
 * @param end2 - End date of second range (ISO string)
 * @returns True if the date ranges overlap
 */
export function dateRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const startDate1 = parseISO(start1)
  const endDate1 = parseISO(end1)
  const startDate2 = parseISO(start2)
  const endDate2 = parseISO(end2)

  // Two ranges overlap if one starts before the other ends
  return startDate1 <= endDate2 && startDate2 <= endDate1
}

/**
 * Detects if an employee is double-booked during a specific period
 *
 * This function checks if assigning an employee to a task during the
 * specified date range would conflict with their existing assignments.
 *
 * @param employeeId - The employee ID to check
 * @param startDate - Proposed start date (ISO string)
 * @param endDate - Proposed end date (ISO string)
 * @param assignments - All existing task assignments
 * @param tasks - All tasks (used to get task dates and names)
 * @param excludeTaskId - Optional task ID to exclude from conflict check
 *                        (useful when checking a task's own assignment)
 * @returns Array of conflicts found
 */
export function detectEmployeeConflicts(
  employeeId: string,
  startDate: string,
  endDate: string,
  assignments: TaskAssignment[],
  tasks: Task[],
  excludeTaskId?: string
): ConflictInfo[] {
  const conflicts: ConflictInfo[] = []

  // Build a map of tasks for quick lookup
  const taskMap = new Map(tasks.map((t) => [t.id, t]))

  // Find all assignments for this employee from the provided assignments
  // Note: assignments might be passed as a flat list from all tasks
  const employeeAssignments = assignments.filter((a) => a.employeeId === employeeId)

  // Also check assignments embedded in tasks
  for (const task of tasks) {
    if (task.id === excludeTaskId) continue

    const taskAssignments = task.assignments.filter((a) => a.employeeId === employeeId)

    for (const assignment of taskAssignments) {
      // Check if this task overlaps with the proposed period
      if (dateRangesOverlap(startDate, endDate, task.startDate, task.endDate)) {
        const overlapDays = calculateOverlapDays(
          startDate,
          endDate,
          task.startDate,
          task.endDate
        )

        conflicts.push({
          taskId: task.id,
          taskName: task.name,
          projectName: '', // Will be populated if using TaskWithProject
          startDate: task.startDate,
          endDate: task.endDate,
          overlapDays,
        })
      }
    }
  }

  return conflicts
}

/**
 * Detects employee conflicts with full project context
 *
 * @param employeeId - The employee ID to check
 * @param startDate - Proposed start date (ISO string)
 * @param endDate - Proposed end date (ISO string)
 * @param tasksWithProjects - All tasks with project information
 * @param excludeTaskId - Optional task ID to exclude from conflict check
 * @returns Array of conflicts found with project names populated
 */
export function detectEmployeeConflictsWithProjects(
  employeeId: string,
  startDate: string,
  endDate: string,
  tasksWithProjects: TaskWithProject[],
  excludeTaskId?: string
): ConflictInfo[] {
  const conflicts: ConflictInfo[] = []

  for (const task of tasksWithProjects) {
    if (task.id === excludeTaskId) continue

    // Check if this employee is assigned to this task
    const isAssigned = task.assignments.some((a) => a.employeeId === employeeId)
    if (!isAssigned) continue

    // Check if this task overlaps with the proposed period
    if (dateRangesOverlap(startDate, endDate, task.startDate, task.endDate)) {
      const overlapDays = calculateOverlapDays(
        startDate,
        endDate,
        task.startDate,
        task.endDate
      )

      conflicts.push({
        taskId: task.id,
        taskName: task.name,
        projectName: task.projectName,
        startDate: task.startDate,
        endDate: task.endDate,
        overlapDays,
      })
    }
  }

  return conflicts
}

/**
 * Gets all conflicts for an employee across all their assignments
 *
 * This function finds any tasks where the same employee is double-booked,
 * returning pairs of conflicting tasks.
 *
 * @param employeeId - The employee ID to check
 * @param tasksWithProjects - All tasks with project information
 * @returns Array of conflict pairs
 */
export function getAllEmployeeConflicts(
  employeeId: string,
  tasksWithProjects: TaskWithProject[]
): Array<{ task1: ConflictInfo; task2: ConflictInfo }> {
  const conflictPairs: Array<{ task1: ConflictInfo; task2: ConflictInfo }> = []

  // Get all tasks assigned to this employee
  const employeeTasks = tasksWithProjects.filter((task) =>
    task.assignments.some((a) => a.employeeId === employeeId)
  )

  // Check each pair of tasks for overlap
  for (let i = 0; i < employeeTasks.length; i++) {
    for (let j = i + 1; j < employeeTasks.length; j++) {
      const task1 = employeeTasks[i]
      const task2 = employeeTasks[j]

      if (dateRangesOverlap(task1.startDate, task1.endDate, task2.startDate, task2.endDate)) {
        const overlapDays = calculateOverlapDays(
          task1.startDate,
          task1.endDate,
          task2.startDate,
          task2.endDate
        )

        conflictPairs.push({
          task1: {
            taskId: task1.id,
            taskName: task1.name,
            projectName: task1.projectName,
            startDate: task1.startDate,
            endDate: task1.endDate,
            overlapDays,
          },
          task2: {
            taskId: task2.id,
            taskName: task2.name,
            projectName: task2.projectName,
            startDate: task2.startDate,
            endDate: task2.endDate,
            overlapDays,
          },
        })
      }
    }
  }

  return conflictPairs
}

/**
 * Checks if an employee has any conflicts in the given period
 *
 * @param employeeId - The employee ID to check
 * @param startDate - Start date to check (ISO string)
 * @param endDate - End date to check (ISO string)
 * @param tasks - All tasks
 * @returns True if the employee has conflicts in the period
 */
export function hasEmployeeConflict(
  employeeId: string,
  startDate: string,
  endDate: string,
  tasks: Task[]
): boolean {
  const conflicts = detectEmployeeConflicts(employeeId, startDate, endDate, [], tasks)
  return conflicts.length > 0
}

/**
 * Gets the total overbooked days for an employee in a period
 *
 * @param employeeId - The employee ID to check
 * @param startDate - Start date (ISO string)
 * @param endDate - End date (ISO string)
 * @param tasks - All tasks
 * @returns Total number of overbooked days
 */
export function getOverbookedDays(
  employeeId: string,
  startDate: string,
  endDate: string,
  tasks: Task[]
): number {
  const conflicts = detectEmployeeConflicts(employeeId, startDate, endDate, [], tasks)
  return conflicts.reduce((total, conflict) => total + conflict.overlapDays, 0)
}

/**
 * Validates that an assignment doesn't create conflicts
 *
 * @param employeeId - The employee ID to assign
 * @param taskId - The task to assign to
 * @param tasks - All tasks
 * @returns Object with isValid flag and conflicts array
 */
export function validateAssignment(
  employeeId: string,
  taskId: string,
  tasks: Task[]
): { isValid: boolean; conflicts: ConflictInfo[] } {
  const task = tasks.find((t) => t.id === taskId)

  if (!task) {
    return { isValid: true, conflicts: [] }
  }

  const conflicts = detectEmployeeConflicts(
    employeeId,
    task.startDate,
    task.endDate,
    [],
    tasks,
    taskId // Exclude the task being assigned
  )

  return {
    isValid: conflicts.length === 0,
    conflicts,
  }
}
