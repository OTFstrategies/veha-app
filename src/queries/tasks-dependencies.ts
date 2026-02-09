import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Task, TaskStatus, TaskPriority, DependencyType } from '@/types/projects'
import { projectKeys } from './projects'
import { recalculateTaskDates, validateDependencyNoCycle } from '@/lib/scheduling'
import { useTaskHistoryStore, type TaskSnapshot } from '@/stores/task-history-store'
import { taskKeys } from './tasks-crud'

// =============================================================================
// Dependency Types
// =============================================================================

/**
 * Preview of a task date change when adding a dependency
 */
export interface DependencyPreview {
  taskId: string
  taskName: string
  oldStartDate: string
  oldEndDate: string
  newStartDate: string
  newEndDate: string
}

interface PreviewDependencyInput {
  projectId: string
  taskId: string
  predecessorId: string
  type: DependencyType
  lag: number
}

interface AddDependencyWithCascadeInput {
  projectId: string
  taskId: string
  predecessorId: string
  type: DependencyType
  lag: number
  previews: DependencyPreview[]
}

// =============================================================================
// Dependency Mutations
// =============================================================================

/**
 * Preview dependency changes without applying them
 * Calculates which tasks will be affected and their new dates
 */
export function usePreviewDependencyChanges() {
  return useMutation({
    mutationFn: async ({
      projectId,
      taskId,
      predecessorId,
      type,
      lag,
    }: PreviewDependencyInput): Promise<DependencyPreview[]> => {
      const supabase = createClient()

      // 1. Fetch all tasks for the project
      const { data: dbTasks, error } = await supabase
        .from('tasks')
        .select(`
          id,
          name,
          start_date,
          end_date,
          duration,
          task_dependencies!task_dependencies_successor_id_fkey (
            predecessor_id,
            dependency_type,
            lag_days
          )
        `)
        .eq('project_id', projectId)

      if (error) {
        throw new Error(`Failed to fetch tasks: ${error.message}`)
      }

      // 2. Transform to scheduler format
      const tasks: Task[] = dbTasks.map((t) => ({
        id: t.id,
        wbs: '',
        name: t.name,
        description: '',
        startDate: t.start_date,
        endDate: t.end_date,
        duration: t.duration,
        progress: 0,
        isMilestone: false,
        isSummary: false,
        status: 'todo' as TaskStatus,
        priority: 'normal' as TaskPriority,
        sortOrder: 0,
        parentId: null,
        dependencies: (t.task_dependencies || []).map((dep) => ({
          id: '',
          predecessorId: dep.predecessor_id,
          predecessorName: '',
          type: dep.dependency_type as DependencyType,
          lag: dep.lag_days,
        })),
        assignments: [],
        // Baseline fields (not relevant for scheduling validation)
        baselineStartDate: null,
        baselineEndDate: null,
        baselineDuration: null,
        isBaselineSet: false,
        baselineSetAt: null,
        varianceStartDays: 0,
        varianceEndDays: 0,
        // Constraint fields
        constraintType: 'ASAP' as const,
        constraintDate: null,
        calendarId: null,
      }))

      // 3. Validate no cycle would be created
      if (!validateDependencyNoCycle(predecessorId, taskId, tasks)) {
        throw new Error('Deze dependency zou een circulaire afhankelijkheid creeren')
      }

      // 4. Simulate the new dependency by adding it to the target task
      const simulatedTasks = tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            dependencies: [
              ...t.dependencies,
              {
                id: 'temp',
                predecessorId,
                predecessorName: '',
                type,
                lag,
              },
            ],
          }
        }
        return t
      })

      // 5. Calculate new dates using the scheduling engine
      const updates = recalculateTaskDates(taskId, simulatedTasks)

      // 6. Build preview results
      const previews: DependencyPreview[] = []
      updates.forEach((update, updatedTaskId) => {
        const originalTask = dbTasks.find((t) => t.id === updatedTaskId)
        if (originalTask) {
          previews.push({
            taskId: updatedTaskId,
            taskName: originalTask.name,
            oldStartDate: originalTask.start_date,
            oldEndDate: originalTask.end_date,
            newStartDate: update.startDate,
            newEndDate: update.endDate,
          })
        }
      })

      return previews
    },
  })
}

/**
 * Add a dependency with cascading date updates
 * Stores previous state for undo functionality
 */
export function useAddDependencyWithCascade() {
  const queryClient = useQueryClient()
  const pushState = useTaskHistoryStore((state) => state.pushState)

  return useMutation({
    mutationFn: async ({
      projectId: _projectId, // Kept for API compatibility
      taskId,
      predecessorId,
      type,
      lag,
      previews,
    }: AddDependencyWithCascadeInput): Promise<{ affectedCount: number }> => {
      const supabase = createClient()

      // 1. Save current state for undo
      const currentSnapshots: TaskSnapshot[] = previews.map((p) => ({
        id: p.taskId,
        startDate: p.oldStartDate,
        endDate: p.oldEndDate,
      }))
      pushState('Dependency toegevoegd', currentSnapshots)

      // 2. Add the dependency
      const { error: depError } = await supabase
        .from('task_dependencies')
        .insert({
          predecessor_id: predecessorId,
          successor_id: taskId,
          dependency_type: type,
          lag_days: lag,
        })

      if (depError) {
        throw new Error(`Failed to add dependency: ${depError.message}`)
      }

      // 3. Update all affected task dates
      for (const preview of previews) {
        const { error: updateError } = await supabase
          .from('tasks')
          .update({
            start_date: preview.newStartDate,
            end_date: preview.newEndDate,
          })
          .eq('id', preview.taskId)

        if (updateError) {
          throw new Error(`Failed to update task dates: ${updateError.message}`)
        }
      }

      return { affectedCount: previews.length }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list(variables.projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) })
    },
  })
}

interface AddDependencyInput {
  projectId: string
  taskId: string
  predecessorId: string
  type: DependencyType
  lagDays?: number
}

/**
 * Add a dependency between tasks (simple, without cascade)
 */
export function useAddDependency() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AddDependencyInput): Promise<void> => {
      const supabase = createClient()

      const { error } = await supabase
        .from('task_dependencies')
        .insert({
          predecessor_id: input.predecessorId,
          successor_id: input.taskId,
          dependency_type: input.type,
          lag_days: input.lagDays ?? 0,
        })

      if (error) {
        throw new Error(`Failed to add dependency: ${error.message}`)
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list(variables.projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) })
    },
  })
}

interface RemoveDependencyInput {
  projectId: string
  dependencyId: string
}

/**
 * Remove a dependency between tasks
 */
export function useRemoveDependency() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: RemoveDependencyInput): Promise<void> => {
      const supabase = createClient()

      const { error } = await supabase
        .from('task_dependencies')
        .delete()
        .eq('id', input.dependencyId)

      if (error) {
        throw new Error(`Failed to remove dependency: ${error.message}`)
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list(variables.projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) })
    },
  })
}
