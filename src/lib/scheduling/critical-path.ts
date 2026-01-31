/**
 * Critical Path Method (CPM) implementation
 *
 * The Critical Path Method identifies the longest sequence of dependent tasks
 * that determines the minimum project duration. Tasks on the critical path
 * have zero float/slack, meaning any delay will delay the entire project.
 */

import { parseISO, differenceInCalendarDays } from 'date-fns'
import type { Task, TaskDependency, DependencyType } from '@/types/projects'

/**
 * Scheduling information for a task calculated during CPM analysis
 */
export interface TaskScheduleInfo {
  taskId: string
  duration: number
  earlyStart: number
  earlyFinish: number
  lateStart: number
  lateFinish: number
  totalFloat: number
  freeFloat: number
  isCritical: boolean
}

/**
 * Result of critical path analysis
 */
export interface CriticalPathResult {
  criticalPath: string[]
  scheduleInfo: Map<string, TaskScheduleInfo>
  projectDuration: number
}

/**
 * Converts a date string to a day number relative to project start
 *
 * @param dateStr - Date string in ISO format
 * @param projectStartDate - Project start date
 * @returns Number of days from project start (0-indexed)
 */
function dateToDay(dateStr: string, projectStartDate: Date): number {
  const date = parseISO(dateStr)
  return differenceInCalendarDays(date, projectStartDate)
}

/**
 * Builds a map of predecessors for each task
 *
 * @param tasks - All tasks
 * @returns Map where key is task ID and value is array of predecessor info
 */
function buildPredecessorMap(
  tasks: Task[]
): Map<string, Array<{ predecessorId: string; type: DependencyType; lag: number }>> {
  const predMap = new Map<
    string,
    Array<{ predecessorId: string; type: DependencyType; lag: number }>
  >()

  for (const task of tasks) {
    const preds = task.dependencies.map((dep) => ({
      predecessorId: dep.predecessorId,
      type: dep.type,
      lag: dep.lag,
    }))
    predMap.set(task.id, preds)
  }

  return predMap
}

/**
 * Builds a map of successors for each task
 *
 * @param tasks - All tasks
 * @returns Map where key is task ID and value is array of successor info
 */
function buildSuccessorMap(
  tasks: Task[]
): Map<string, Array<{ successorId: string; type: DependencyType; lag: number }>> {
  const succMap = new Map<
    string,
    Array<{ successorId: string; type: DependencyType; lag: number }>
  >()

  // Initialize empty arrays for all tasks
  for (const task of tasks) {
    succMap.set(task.id, [])
  }

  // Populate successors from dependencies
  for (const task of tasks) {
    for (const dep of task.dependencies) {
      const successors = succMap.get(dep.predecessorId)
      if (successors) {
        successors.push({
          successorId: task.id,
          type: dep.type,
          lag: dep.lag,
        })
      }
    }
  }

  return succMap
}

/**
 * Performs topological sort on tasks based on dependencies
 *
 * @param tasks - All tasks
 * @returns Array of task IDs in topological order
 */
function topologicalSort(tasks: Task[]): string[] {
  const result: string[] = []
  const visited = new Set<string>()
  const visiting = new Set<string>()

  const predecessorMap = buildPredecessorMap(tasks)
  const taskMap = new Map(tasks.map((t) => [t.id, t]))

  function visit(taskId: string): void {
    if (visited.has(taskId)) return
    if (visiting.has(taskId)) {
      // Cycle detected - skip (cycles should be prevented by validation)
      return
    }

    visiting.add(taskId)

    const preds = predecessorMap.get(taskId) ?? []
    for (const pred of preds) {
      if (taskMap.has(pred.predecessorId)) {
        visit(pred.predecessorId)
      }
    }

    visiting.delete(taskId)
    visited.add(taskId)
    result.push(taskId)
  }

  for (const task of tasks) {
    visit(task.id)
  }

  return result
}

/**
 * Calculates early start based on dependency type
 *
 * @param predEarlyStart - Predecessor's early start
 * @param predEarlyFinish - Predecessor's early finish
 * @param predDuration - Predecessor's duration
 * @param succDuration - Successor's duration
 * @param type - Dependency type
 * @param lag - Lag days
 * @returns Calculated early start for successor
 */
function calculateEarlyStart(
  predEarlyStart: number,
  predEarlyFinish: number,
  predDuration: number,
  succDuration: number,
  type: DependencyType,
  lag: number
): number {
  switch (type) {
    case 'FS':
      // Finish-to-Start: ES = predecessor EF + lag + 1
      return predEarlyFinish + lag + 1

    case 'SS':
      // Start-to-Start: ES = predecessor ES + lag
      return predEarlyStart + lag

    case 'FF':
      // Finish-to-Finish: EF must be >= predecessor EF + lag
      // So ES = predecessor EF + lag - duration + 1
      return predEarlyFinish + lag - succDuration + 1

    case 'SF':
      // Start-to-Finish: EF must be >= predecessor ES + lag
      // So ES = predecessor ES + lag - duration + 1
      return predEarlyStart + lag - succDuration + 1

    default:
      return predEarlyFinish + lag + 1
  }
}

/**
 * Calculates late finish based on dependency type
 *
 * @param succLateStart - Successor's late start
 * @param succLateFinish - Successor's late finish
 * @param predDuration - Predecessor's duration
 * @param succDuration - Successor's duration
 * @param type - Dependency type
 * @param lag - Lag days
 * @returns Calculated late finish for predecessor
 */
function calculateLateFinish(
  succLateStart: number,
  succLateFinish: number,
  predDuration: number,
  succDuration: number,
  type: DependencyType,
  lag: number
): number {
  switch (type) {
    case 'FS':
      // Finish-to-Start: LF = successor LS - lag - 1
      return succLateStart - lag - 1

    case 'SS':
      // Start-to-Start: LS must be <= successor LS - lag
      // So LF = successor LS - lag + duration - 1
      return succLateStart - lag + predDuration - 1

    case 'FF':
      // Finish-to-Finish: LF = successor LF - lag
      return succLateFinish - lag

    case 'SF':
      // Start-to-Finish: LS must be <= successor LF - lag
      // So LF = successor LF - lag + duration - 1
      return succLateFinish - lag + predDuration - 1

    default:
      return succLateStart - lag - 1
  }
}

/**
 * Forward pass: Calculate Early Start (ES) and Early Finish (EF) for all tasks
 *
 * @param tasks - All tasks
 * @param sortedTaskIds - Tasks in topological order
 * @param projectStartDate - Project start date
 * @returns Map of task ID to { earlyStart, earlyFinish, duration }
 */
function forwardPass(
  tasks: Task[],
  sortedTaskIds: string[],
  projectStartDate: Date
): Map<string, { earlyStart: number; earlyFinish: number; duration: number }> {
  const taskMap = new Map(tasks.map((t) => [t.id, t]))
  const predecessorMap = buildPredecessorMap(tasks)
  const result = new Map<string, { earlyStart: number; earlyFinish: number; duration: number }>()

  for (const taskId of sortedTaskIds) {
    const task = taskMap.get(taskId)
    if (!task) continue

    const duration = task.duration
    const preds = predecessorMap.get(taskId) ?? []

    let earlyStart = 0

    if (preds.length === 0) {
      // No predecessors: use task's start date relative to project start
      earlyStart = dateToDay(task.startDate, projectStartDate)
    } else {
      // Has predecessors: calculate based on all constraints
      for (const pred of preds) {
        const predInfo = result.get(pred.predecessorId)
        if (!predInfo) continue

        const calculatedES = calculateEarlyStart(
          predInfo.earlyStart,
          predInfo.earlyFinish,
          predInfo.duration,
          duration,
          pred.type,
          pred.lag
        )

        earlyStart = Math.max(earlyStart, calculatedES)
      }
    }

    const earlyFinish = earlyStart + duration - 1

    result.set(taskId, { earlyStart, earlyFinish, duration })
  }

  return result
}

/**
 * Backward pass: Calculate Late Start (LS) and Late Finish (LF) for all tasks
 *
 * @param tasks - All tasks
 * @param sortedTaskIds - Tasks in topological order
 * @param forwardResults - Results from forward pass
 * @param projectEndDay - Project end day number
 * @returns Map of task ID to { lateStart, lateFinish }
 */
function backwardPass(
  tasks: Task[],
  sortedTaskIds: string[],
  forwardResults: Map<string, { earlyStart: number; earlyFinish: number; duration: number }>,
  projectEndDay: number
): Map<string, { lateStart: number; lateFinish: number }> {
  const taskMap = new Map(tasks.map((t) => [t.id, t]))
  const successorMap = buildSuccessorMap(tasks)
  const result = new Map<string, { lateStart: number; lateFinish: number }>()

  // Process in reverse topological order
  const reversedTaskIds = [...sortedTaskIds].reverse()

  for (const taskId of reversedTaskIds) {
    const task = taskMap.get(taskId)
    if (!task) continue

    const forwardInfo = forwardResults.get(taskId)
    if (!forwardInfo) continue

    const duration = forwardInfo.duration
    const succs = successorMap.get(taskId) ?? []

    let lateFinish = projectEndDay

    if (succs.length === 0) {
      // No successors: late finish is project end
      lateFinish = projectEndDay
    } else {
      // Has successors: calculate based on all constraints
      for (const succ of succs) {
        const succLateInfo = result.get(succ.successorId)
        const succForwardInfo = forwardResults.get(succ.successorId)
        if (!succLateInfo || !succForwardInfo) continue

        const calculatedLF = calculateLateFinish(
          succLateInfo.lateStart,
          succLateInfo.lateFinish,
          duration,
          succForwardInfo.duration,
          succ.type,
          succ.lag
        )

        lateFinish = Math.min(lateFinish, calculatedLF)
      }
    }

    const lateStart = lateFinish - duration + 1

    result.set(taskId, { lateStart, lateFinish })
  }

  return result
}

/**
 * Calculates the critical path using forward/backward pass algorithm
 *
 * The Critical Path Method works as follows:
 * 1. Forward pass: Calculate Early Start (ES) and Early Finish (EF) for each task
 *    - ES = maximum of (predecessor EF + lag + 1) for all predecessors
 *    - EF = ES + duration - 1
 *
 * 2. Backward pass: Calculate Late Start (LS) and Late Finish (LF) for each task
 *    - LF = minimum of (successor LS - lag - 1) for all successors
 *    - LS = LF - duration + 1
 *
 * 3. Calculate Total Float (slack) for each task:
 *    - Total Float = LS - ES = LF - EF
 *
 * 4. Tasks where Total Float = 0 are on the critical path
 *
 * @param tasks - All tasks in the project
 * @param dependencies - Optional parameter (extracted from tasks if not provided)
 * @returns Array of task IDs that form the critical path
 */
export function calculateCriticalPath(
  tasks: Task[],
  dependencies?: TaskDependency[]
): string[] {
  if (tasks.length === 0) return []

  const result = calculateCriticalPathDetailed(tasks, dependencies)
  return result.criticalPath
}

/**
 * Calculates detailed critical path analysis with all scheduling information
 *
 * @param tasks - All tasks in the project
 * @param dependencies - Optional parameter (extracted from tasks if not provided)
 * @returns Detailed critical path result including schedule info for all tasks
 */
export function calculateCriticalPathDetailed(
  tasks: Task[],
  dependencies?: TaskDependency[]
): CriticalPathResult {
  if (tasks.length === 0) {
    return {
      criticalPath: [],
      scheduleInfo: new Map(),
      projectDuration: 0,
    }
  }

  // Find the earliest start date among all tasks to use as project start
  const projectStartDate = tasks.reduce((earliest, task) => {
    const taskStart = parseISO(task.startDate)
    return taskStart < earliest ? taskStart : earliest
  }, parseISO(tasks[0].startDate))

  // Topological sort
  const sortedTaskIds = topologicalSort(tasks)

  // Forward pass
  const forwardResults = forwardPass(tasks, sortedTaskIds, projectStartDate)

  // Find project end day (maximum EF)
  let projectEndDay = 0
  for (const info of forwardResults.values()) {
    projectEndDay = Math.max(projectEndDay, info.earlyFinish)
  }

  // Backward pass
  const backwardResults = backwardPass(tasks, sortedTaskIds, forwardResults, projectEndDay)

  // Calculate floats and identify critical path
  const scheduleInfo = new Map<string, TaskScheduleInfo>()
  const criticalPath: string[] = []
  const successorMap = buildSuccessorMap(tasks)

  for (const taskId of sortedTaskIds) {
    const forward = forwardResults.get(taskId)
    const backward = backwardResults.get(taskId)

    if (!forward || !backward) continue

    const totalFloat = backward.lateStart - forward.earlyStart

    // Calculate free float (slack until next task)
    let freeFloat = totalFloat
    const succs = successorMap.get(taskId) ?? []

    if (succs.length > 0) {
      let minSuccEarlyStart = Infinity
      for (const succ of succs) {
        const succForward = forwardResults.get(succ.successorId)
        if (succForward) {
          // For FS dependencies: free float = successor ES - EF - lag - 1
          const calcFreeFloat =
            succForward.earlyStart - forward.earlyFinish - succ.lag - 1
          minSuccEarlyStart = Math.min(minSuccEarlyStart, calcFreeFloat)
        }
      }
      if (minSuccEarlyStart !== Infinity) {
        freeFloat = Math.max(0, minSuccEarlyStart)
      }
    }

    const isCritical = totalFloat === 0

    const info: TaskScheduleInfo = {
      taskId,
      duration: forward.duration,
      earlyStart: forward.earlyStart,
      earlyFinish: forward.earlyFinish,
      lateStart: backward.lateStart,
      lateFinish: backward.lateFinish,
      totalFloat,
      freeFloat,
      isCritical,
    }

    scheduleInfo.set(taskId, info)

    if (isCritical) {
      criticalPath.push(taskId)
    }
  }

  return {
    criticalPath,
    scheduleInfo,
    projectDuration: projectEndDay + 1, // Convert from 0-indexed days to duration
  }
}

/**
 * Gets the total project duration based on critical path analysis
 *
 * @param tasks - All tasks in the project
 * @returns Total project duration in days
 */
export function getProjectDuration(tasks: Task[]): number {
  const result = calculateCriticalPathDetailed(tasks)
  return result.projectDuration
}

/**
 * Gets the float/slack for a specific task
 *
 * @param taskId - The task ID to check
 * @param tasks - All tasks in the project
 * @returns Total float in days, or 0 if task not found
 */
export function getTaskFloat(taskId: string, tasks: Task[]): number {
  const result = calculateCriticalPathDetailed(tasks)
  const info = result.scheduleInfo.get(taskId)
  return info?.totalFloat ?? 0
}

/**
 * Checks if a specific task is on the critical path
 *
 * @param taskId - The task ID to check
 * @param tasks - All tasks in the project
 * @returns True if the task is on the critical path
 */
export function isTaskCritical(taskId: string, tasks: Task[]): boolean {
  const criticalPath = calculateCriticalPath(tasks)
  return criticalPath.includes(taskId)
}
