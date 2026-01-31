/**
 * Scheduling Engine
 *
 * This module provides scheduling functionality for project task management:
 * - Auto-scheduling: Automatically recalculates task dates when dependencies change
 * - Critical Path: Identifies the critical path through the project
 * - Conflict Detection: Detects employee double-booking conflicts
 */

// Auto-scheduling exports
export {
  recalculateTaskDates,
  calculateSuccessorDates,
  buildSuccessorMap,
  validateDependencyNoCycle,
  calculateDuration,
} from './auto-schedule'

export type { TaskDateUpdate } from './auto-schedule'

// Critical Path Method exports
export {
  calculateCriticalPath,
  calculateCriticalPathDetailed,
  getProjectDuration,
  getTaskFloat,
  isTaskCritical,
} from './critical-path'

export type { TaskScheduleInfo, CriticalPathResult } from './critical-path'

// Conflict Detection exports
export {
  detectEmployeeConflicts,
  detectEmployeeConflictsWithProjects,
  getAllEmployeeConflicts,
  hasEmployeeConflict,
  getOverbookedDays,
  validateAssignment,
  calculateOverlapDays,
  dateRangesOverlap,
} from './conflict-detection'

export type { ConflictInfo, TaskWithProject } from './conflict-detection'
