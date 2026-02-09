// Barrel export - all task query modules
// Shared items
export { taskKeys } from './tasks-crud'
export { transformTask, transformDependency, transformAssignment } from './tasks-crud'
export type { DbTaskWithRelations } from './tasks-crud'

// CRUD hooks
export { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useUpdateTaskDates, useSetProjectBaseline, useClearProjectBaseline } from './tasks-crud'

// Dependency hooks
export type { DependencyPreview } from './tasks-dependencies'
export { usePreviewDependencyChanges, useAddDependencyWithCascade, useAddDependency, useRemoveDependency } from './tasks-dependencies'

// History hooks
export { useUndoTaskChanges, useRedoTaskChanges } from './tasks-history'

// Scheduling hooks
export { useCriticalPath } from './tasks-scheduling'
