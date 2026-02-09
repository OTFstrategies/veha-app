import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { projectKeys } from './projects'
import { useTaskHistoryStore } from '@/stores/task-history-store'
import { taskKeys } from './tasks-crud'

// =============================================================================
// Undo/Redo Mutations
// =============================================================================

/**
 * Undo the last task date changes
 */
export function useUndoTaskChanges() {
  const queryClient = useQueryClient()
  const undo = useTaskHistoryStore((state) => state.undo)
  const canUndo = useTaskHistoryStore((state) => state.canUndo)

  return useMutation({
    mutationFn: async (_projectId: string) => {
      if (!canUndo()) {
        throw new Error('Niets om ongedaan te maken')
      }

      const entry = undo()
      if (!entry) {
        throw new Error('Geen geschiedenis gevonden')
      }

      const supabase = createClient()

      // Restore all snapshots
      for (const snapshot of entry.snapshots) {
        const { error } = await supabase
          .from('tasks')
          .update({
            start_date: snapshot.startDate,
            end_date: snapshot.endDate,
          })
          .eq('id', snapshot.id)

        if (error) {
          throw new Error(`Failed to restore task: ${error.message}`)
        }
      }

      return entry
    },
    onSuccess: (_data, projectId) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list(projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
    },
  })
}

/**
 * Redo the last undone task date changes
 */
export function useRedoTaskChanges() {
  const queryClient = useQueryClient()
  const redo = useTaskHistoryStore((state) => state.redo)
  const canRedo = useTaskHistoryStore((state) => state.canRedo)

  return useMutation({
    mutationFn: async (_projectId: string) => {
      if (!canRedo()) {
        throw new Error('Niets om opnieuw te doen')
      }

      const entry = redo()
      if (!entry) {
        throw new Error('Geen geschiedenis gevonden')
      }

      const supabase = createClient()

      // Restore all snapshots from the redo entry
      for (const snapshot of entry.snapshots) {
        const { error } = await supabase
          .from('tasks')
          .update({
            start_date: snapshot.startDate,
            end_date: snapshot.endDate,
          })
          .eq('id', snapshot.id)

        if (error) {
          throw new Error(`Failed to restore task: ${error.message}`)
        }
      }

      return entry
    },
    onSuccess: (_data, projectId) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list(projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
    },
  })
}
