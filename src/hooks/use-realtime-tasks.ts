import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeToTaskChanges, unsubscribeFromChannel } from '@/lib/supabase/realtime'
import { taskKeys } from '@/queries/tasks'

/**
 * Hook to subscribe to real-time task updates for a project.
 * Automatically invalidates queries when tasks change remotely.
 */
export function useRealtimeTasks(projectId: string | null): void {
  const queryClient = useQueryClient()

  React.useEffect(() => {
    if (!projectId) return

    const channel = subscribeToTaskChanges(projectId, {
      // On insert: invalidate to refetch full list with relations
      onInsert: () => {
        queryClient.invalidateQueries({ queryKey: taskKeys.list(projectId) })
      },

      // On update: invalidate to ensure consistency
      // Note: Could optimistically update cache here for faster UX
      onUpdate: () => {
        queryClient.invalidateQueries({ queryKey: taskKeys.list(projectId) })
      },

      // On delete: invalidate to remove from cache
      onDelete: () => {
        queryClient.invalidateQueries({ queryKey: taskKeys.list(projectId) })
      },
    })

    // Cleanup on unmount or projectId change
    return () => {
      unsubscribeFromChannel(channel)
    }
  }, [projectId, queryClient])
}
