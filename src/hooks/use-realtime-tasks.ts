import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeToTaskChanges, unsubscribeFromChannel } from '@/lib/supabase/realtime'
import { taskKeys } from '@/queries/tasks'
import type { Task, TaskConstraintType } from '@/types/projects'
import type { Task as DbTask } from '@/types/database'

/**
 * Hook to subscribe to real-time task updates for a project.
 * Uses optimistic updates for instant UI feedback on remote changes.
 */
export function useRealtimeTasks(projectId: string | null): void {
  const queryClient = useQueryClient()

  React.useEffect(() => {
    if (!projectId) return

    const channel = subscribeToTaskChanges(projectId, {
      // On insert: invalidate to refetch full list with relations
      // (we need the full task with dependencies/assignments from server)
      onInsert: () => {
        queryClient.invalidateQueries({ queryKey: taskKeys.list(projectId) })
      },

      // On update: optimistically update cache for instant UI feedback
      onUpdate: (payload) => {
        // Cast payload to database task type
        const updatedTask = payload as Partial<DbTask> & { id: string }

        queryClient.setQueryData<Task[]>(
          taskKeys.list(projectId),
          (oldTasks) => {
            if (!oldTasks) return oldTasks
            return oldTasks.map((task): Task =>
              task.id === updatedTask.id
                ? {
                    ...task,
                    // Map database fields to frontend Task fields (only if present in payload)
                    ...(updatedTask.name !== undefined && { name: updatedTask.name }),
                    ...(updatedTask.description !== undefined && { description: updatedTask.description ?? '' }),
                    ...(updatedTask.start_date !== undefined && { startDate: updatedTask.start_date }),
                    ...(updatedTask.end_date !== undefined && { endDate: updatedTask.end_date }),
                    ...(updatedTask.duration !== undefined && { duration: updatedTask.duration }),
                    ...(updatedTask.progress !== undefined && { progress: updatedTask.progress }),
                    ...(updatedTask.status !== undefined && { status: updatedTask.status }),
                    ...(updatedTask.priority !== undefined && { priority: updatedTask.priority }),
                    ...(updatedTask.is_milestone !== undefined && { isMilestone: updatedTask.is_milestone }),
                    ...(updatedTask.is_summary !== undefined && { isSummary: updatedTask.is_summary }),
                    ...(updatedTask.sort_order !== undefined && { sortOrder: updatedTask.sort_order }),
                    ...(updatedTask.parent_id !== undefined && { parentId: updatedTask.parent_id }),
                    // Baseline fields
                    ...(updatedTask.baseline_start_date !== undefined && { baselineStartDate: updatedTask.baseline_start_date }),
                    ...(updatedTask.baseline_end_date !== undefined && { baselineEndDate: updatedTask.baseline_end_date }),
                    ...(updatedTask.baseline_duration !== undefined && { baselineDuration: updatedTask.baseline_duration }),
                    ...(updatedTask.is_baseline_set !== undefined && { isBaselineSet: updatedTask.is_baseline_set }),
                    ...(updatedTask.baseline_set_at !== undefined && { baselineSetAt: updatedTask.baseline_set_at }),
                    ...(updatedTask.variance_start_days !== undefined && { varianceStartDays: updatedTask.variance_start_days }),
                    ...(updatedTask.variance_end_days !== undefined && { varianceEndDays: updatedTask.variance_end_days }),
                    // Constraint fields
                    ...(updatedTask.constraint_type !== undefined && { constraintType: updatedTask.constraint_type as TaskConstraintType }),
                    ...(updatedTask.constraint_date !== undefined && { constraintDate: updatedTask.constraint_date }),
                    ...(updatedTask.calendar_id !== undefined && { calendarId: updatedTask.calendar_id }),
                  }
                : task
            )
          }
        )
      },

      // On delete: optimistically remove from cache for instant UI feedback
      onDelete: (taskId) => {
        queryClient.setQueryData<Task[]>(
          taskKeys.list(projectId),
          (oldTasks) => {
            if (!oldTasks) return oldTasks
            return oldTasks.filter((task) => task.id !== taskId)
          }
        )
      },
    })

    // Cleanup on unmount or projectId change
    return () => {
      unsubscribeFromChannel(channel)
    }
  }, [projectId, queryClient])
}
