/**
 * Auto-scheduling module for task date recalculation
 *
 * When task dependencies change, this module handles cascading date updates
 * to ensure all dependent tasks maintain proper scheduling relationships.
 */

import { addDays, differenceInCalendarDays, parseISO, format } from 'date-fns'
import type { Task, TaskDependency, DependencyType } from '@/types/projects'

/**
 * Represents a calculated date update for a task
 */
export interface TaskDateUpdate {
  startDate: string
  endDate: string
}

/**
 * Calculates the successor task's start date based on dependency type
 *
 * Dependency types:
 * - FS (Finish-to-Start): Successor starts after predecessor finishes
 * - SS (Start-to-Start): Successor starts when predecessor starts
 * - FF (Finish-to-Finish): Successor finishes when predecessor finishes
 * - SF (Start-to-Finish): Successor finishes when predecessor starts
 *
 * @param predecessorStartDate - Start date of the predecessor task
 * @param predecessorEndDate - End date of the predecessor task
 * @param successorDuration - Duration of the successor task in days
 * @param dependencyType - Type of dependency relationship
 * @param lag - Number of days to add (can be negative)
 * @returns Calculated start and end dates for the successor
 */
export function calculateSuccessorDates(
  predecessorStartDate: string,
  predecessorEndDate: string,
  successorDuration: number,
  dependencyType: DependencyType,
  lag: number
): TaskDateUpdate {
  const predStart = parseISO(predecessorStartDate)
  const predEnd = parseISO(predecessorEndDate)

  let successorStart: Date
  let successorEnd: Date

  switch (dependencyType) {
    case 'FS':
      // Finish-to-Start: Successor starts after predecessor ends
      successorStart = addDays(predEnd, lag + 1)
      successorEnd = addDays(successorStart, successorDuration - 1)
      break

    case 'SS':
      // Start-to-Start: Successor starts when predecessor starts
      successorStart = addDays(predStart, lag)
      successorEnd = addDays(successorStart, successorDuration - 1)
      break

    case 'FF':
      // Finish-to-Finish: Successor ends when predecessor ends
      successorEnd = addDays(predEnd, lag)
      successorStart = addDays(successorEnd, -(successorDuration - 1))
      break

    case 'SF':
      // Start-to-Finish: Successor ends when predecessor starts
      successorEnd = addDays(predStart, lag)
      successorStart = addDays(successorEnd, -(successorDuration - 1))
      break

    default:
      // Default to FS behavior
      successorStart = addDays(predEnd, lag + 1)
      successorEnd = addDays(successorStart, successorDuration - 1)
  }

  return {
    startDate: format(successorStart, 'yyyy-MM-dd'),
    endDate: format(successorEnd, 'yyyy-MM-dd'),
  }
}

/**
 * Builds a map of task IDs to their successor task IDs
 *
 * @param tasks - All tasks in the project
 * @returns Map where key is predecessor ID and value is array of successor IDs
 */
export function buildSuccessorMap(tasks: Task[]): Map<string, string[]> {
  const successorMap = new Map<string, string[]>()

  for (const task of tasks) {
    for (const dep of task.dependencies) {
      const predecessorId = dep.predecessorId
      const successors = successorMap.get(predecessorId) ?? []
      successors.push(task.id)
      successorMap.set(predecessorId, successors)
    }
  }

  return successorMap
}

/**
 * Finds a task by ID from the tasks array
 *
 * @param taskId - The task ID to find
 * @param tasks - Array of tasks to search
 * @returns The found task or undefined
 */
function findTask(taskId: string, tasks: Task[]): Task | undefined {
  return tasks.find((t) => t.id === taskId)
}

/**
 * Gets all dependencies for a specific task
 *
 * @param taskId - The task ID to get dependencies for
 * @param tasks - Array of all tasks
 * @returns Array of dependencies where this task is the successor
 */
function getTaskDependencies(taskId: string, tasks: Task[]): TaskDependency[] {
  const task = findTask(taskId, tasks)
  return task?.dependencies ?? []
}

/**
 * Calculates the latest required start date based on all predecessor constraints
 *
 * When a task has multiple predecessors, we need to find the date that satisfies
 * all dependency constraints (i.e., the latest calculated start date).
 *
 * @param taskId - The successor task ID
 * @param tasks - All tasks
 * @param updates - Current date updates being calculated
 * @returns The calculated start and end dates, or null if no dependencies
 */
function calculateConstrainedDates(
  taskId: string,
  tasks: Task[],
  updates: Map<string, TaskDateUpdate>
): TaskDateUpdate | null {
  const task = findTask(taskId, tasks)
  if (!task) return null

  const dependencies = getTaskDependencies(taskId, tasks)
  if (dependencies.length === 0) return null

  let latestStart: Date | null = null
  let latestEnd: Date | null = null

  for (const dep of dependencies) {
    const predecessor = findTask(dep.predecessorId, tasks)
    if (!predecessor) continue

    // Use updated dates if available, otherwise use original dates
    const predDates = updates.get(dep.predecessorId)
    const predStartDate = predDates?.startDate ?? predecessor.startDate
    const predEndDate = predDates?.endDate ?? predecessor.endDate

    const calculated = calculateSuccessorDates(
      predStartDate,
      predEndDate,
      task.duration,
      dep.type,
      dep.lag
    )

    const calcStart = parseISO(calculated.startDate)
    const calcEnd = parseISO(calculated.endDate)

    // Take the latest start date to satisfy all constraints
    if (latestStart === null || calcStart > latestStart) {
      latestStart = calcStart
      latestEnd = calcEnd
    }
  }

  if (latestStart === null || latestEnd === null) return null

  return {
    startDate: format(latestStart, 'yyyy-MM-dd'),
    endDate: format(latestEnd, 'yyyy-MM-dd'),
  }
}

/**
 * Recalculates task dates when dependencies change
 *
 * This function performs a cascading update starting from the specified task.
 * When a task's dates change, all of its successors need to be recalculated,
 * and their successors, and so on.
 *
 * Algorithm:
 * 1. Start with the changed task
 * 2. Find all tasks that depend on the changed task (successors)
 * 3. For each successor, calculate new dates based on predecessor constraints
 * 4. If dates changed, add successor to the processing queue
 * 5. Repeat until no more changes
 *
 * @param taskId - The ID of the task that changed (trigger for recalculation)
 * @param tasks - All tasks in the project
 * @param dependencies - All dependencies (optional, extracted from tasks if not provided)
 * @returns Map of task IDs to their new calculated dates
 */
export function recalculateTaskDates(
  taskId: string,
  tasks: Task[],
  _dependencies?: TaskDependency[] // Kept for API compatibility
): Map<string, TaskDateUpdate> {
  const updates = new Map<string, TaskDateUpdate>()
  const successorMap = buildSuccessorMap(tasks)

  // Queue of tasks to process
  const queue: string[] = []
  const processed = new Set<string>()

  // Start by adding all successors of the changed task to the queue
  const initialSuccessors = successorMap.get(taskId) ?? []
  queue.push(...initialSuccessors)

  // Process the queue using BFS
  while (queue.length > 0) {
    const currentTaskId = queue.shift()!

    // Skip if already processed to avoid infinite loops
    if (processed.has(currentTaskId)) continue
    processed.add(currentTaskId)

    const currentTask = findTask(currentTaskId, tasks)
    if (!currentTask) continue

    // Calculate new dates based on all predecessor constraints
    const newDates = calculateConstrainedDates(currentTaskId, tasks, updates)
    if (!newDates) continue

    // Check if dates actually changed
    const datesChanged =
      newDates.startDate !== currentTask.startDate ||
      newDates.endDate !== currentTask.endDate

    // Also check against any previous update for this task
    const prevUpdate = updates.get(currentTaskId)
    const updatesChanged =
      prevUpdate &&
      (newDates.startDate !== prevUpdate.startDate ||
        newDates.endDate !== prevUpdate.endDate)

    if (datesChanged || updatesChanged) {
      updates.set(currentTaskId, newDates)

      // Add successors of this task to the queue for cascading
      const successors = successorMap.get(currentTaskId) ?? []
      for (const successorId of successors) {
        if (!processed.has(successorId)) {
          queue.push(successorId)
        }
      }
    }
  }

  return updates
}

/**
 * Validates that a dependency does not create a circular reference
 *
 * @param predecessorId - The proposed predecessor task ID
 * @param successorId - The proposed successor task ID
 * @param tasks - All tasks in the project
 * @returns True if the dependency is valid (no circular reference)
 */
export function validateDependencyNoCycle(
  predecessorId: string,
  successorId: string,
  tasks: Task[]
): boolean {
  // Cannot depend on itself
  if (predecessorId === successorId) return false

  const successorMap = buildSuccessorMap(tasks)

  // Check if successor is already a predecessor of predecessor (would create cycle)
  const visited = new Set<string>()
  const queue = [successorId]

  while (queue.length > 0) {
    const currentId = queue.shift()!

    if (visited.has(currentId)) continue
    visited.add(currentId)

    const successors = successorMap.get(currentId) ?? []
    for (const successor of successors) {
      if (successor === predecessorId) {
        // Found a cycle: successor -> ... -> predecessor
        return false
      }
      queue.push(successor)
    }
  }

  return true
}

/**
 * Calculates the duration between two dates in calendar days (inclusive)
 *
 * @param startDate - Start date string in ISO format
 * @param endDate - End date string in ISO format
 * @returns Duration in days (minimum 1)
 */
export function calculateDuration(startDate: string, endDate: string): number {
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  return Math.max(1, differenceInCalendarDays(end, start) + 1)
}
