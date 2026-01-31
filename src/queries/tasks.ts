import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Task, TaskDependency, TaskAssignment, TaskStatus, TaskPriority, DependencyType } from '@/types/projects'
import type { Task as DbTask } from '@/types/database'
import { projectKeys } from './projects'

// =============================================================================
// Query Keys
// =============================================================================

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (projectId: string) => [...taskKeys.lists(), projectId] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
}

// =============================================================================
// Type Transformations
// =============================================================================

interface DbTaskWithRelations extends DbTask {
  task_dependencies: Array<{
    id: string
    predecessor_id: string
    dependency_type: string
    lag_days: number
    tasks: { name: string } | null
  }>
  task_assignments: Array<{
    id: string
    employee_id: string
    planned_hours: number
    actual_hours: number
    employees: { name: string; color: string } | null
  }>
}

function transformDependency(dep: DbTaskWithRelations['task_dependencies'][0]): TaskDependency {
  return {
    id: dep.id,
    predecessorId: dep.predecessor_id,
    predecessorName: dep.tasks?.name ?? 'Unknown',
    type: dep.dependency_type as DependencyType,
    lag: dep.lag_days,
  }
}

function transformAssignment(assignment: DbTaskWithRelations['task_assignments'][0]): TaskAssignment {
  return {
    id: assignment.id,
    employeeId: assignment.employee_id,
    employeeName: assignment.employees?.name ?? 'Unknown',
    employeeColor: assignment.employees?.color ?? '#6b7280',
    plannedHours: assignment.planned_hours,
    actualHours: assignment.actual_hours,
  }
}

function transformTask(dbTask: DbTaskWithRelations): Task {
  return {
    id: dbTask.id,
    wbs: dbTask.wbs,
    name: dbTask.name,
    description: dbTask.description ?? '',
    startDate: dbTask.start_date,
    endDate: dbTask.end_date,
    duration: dbTask.duration,
    progress: dbTask.progress,
    isMilestone: dbTask.is_milestone,
    isSummary: dbTask.is_summary,
    status: dbTask.status,
    priority: dbTask.priority,
    sortOrder: dbTask.sort_order,
    parentId: dbTask.parent_id,
    dependencies: dbTask.task_dependencies?.map(transformDependency) ?? [],
    assignments: dbTask.task_assignments?.map(transformAssignment) ?? [],
  }
}

// =============================================================================
// Queries
// =============================================================================

/**
 * Fetch all tasks for a project
 */
export function useTasks(projectId: string) {
  return useQuery({
    queryKey: taskKeys.list(projectId),
    queryFn: async (): Promise<Task[]> => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_dependencies!task_dependencies_successor_id_fkey (
            id,
            predecessor_id,
            dependency_type,
            lag_days,
            tasks!task_dependencies_predecessor_id_fkey (name)
          ),
          task_assignments (
            id,
            employee_id,
            planned_hours,
            actual_hours,
            employees (name, color)
          )
        `)
        .eq('project_id', projectId)
        .order('sort_order', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch tasks: ${error.message}`)
      }

      return (data as DbTaskWithRelations[]).map(transformTask)
    },
    enabled: Boolean(projectId),
  })
}

// =============================================================================
// Mutations
// =============================================================================

interface CreateTaskInput {
  projectId: string
  parentId?: string | null
  name: string
  description?: string
  startDate: string
  endDate: string
  duration: number
  isMilestone?: boolean
  status?: TaskStatus
  priority?: TaskPriority
}

/**
 * Create a new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateTaskInput): Promise<Task> => {
      const supabase = createClient()

      // Get the next sort order for the project
      const { data: existingTasks } = await supabase
        .from('tasks')
        .select('sort_order')
        .eq('project_id', input.projectId)
        .order('sort_order', { ascending: false })
        .limit(1)

      const nextSortOrder = existingTasks && existingTasks.length > 0
        ? existingTasks[0].sort_order + 1
        : 1

      // Generate WBS number
      let wbs = `${nextSortOrder}`
      if (input.parentId) {
        const { data: parentTask } = await supabase
          .from('tasks')
          .select('wbs')
          .eq('id', input.parentId)
          .single()

        if (parentTask) {
          // Count sibling tasks to get child number
          const { count } = await supabase
            .from('tasks')
            .select('id', { count: 'exact', head: true })
            .eq('parent_id', input.parentId)

          wbs = `${parentTask.wbs}.${(count ?? 0) + 1}`
        }
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          project_id: input.projectId,
          parent_id: input.parentId ?? null,
          wbs,
          name: input.name,
          description: input.description ?? null,
          start_date: input.startDate,
          end_date: input.endDate,
          duration: input.duration,
          progress: 0,
          is_milestone: input.isMilestone ?? false,
          is_summary: false,
          status: input.status ?? 'todo',
          priority: input.priority ?? 'normal',
          sort_order: nextSortOrder,
        })
        .select(`
          *,
          task_dependencies!task_dependencies_successor_id_fkey (
            id,
            predecessor_id,
            dependency_type,
            lag_days,
            tasks!task_dependencies_predecessor_id_fkey (name)
          ),
          task_assignments (
            id,
            employee_id,
            planned_hours,
            actual_hours,
            employees (name, color)
          )
        `)
        .single()

      if (error) {
        throw new Error(`Failed to create task: ${error.message}`)
      }

      return transformTask(data as DbTaskWithRelations)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list(variables.projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) })
    },
  })
}

interface UpdateTaskInput {
  id: string
  projectId: string
  name?: string
  description?: string
  startDate?: string
  endDate?: string
  duration?: number
  progress?: number
  isMilestone?: boolean
  isSummary?: boolean
  status?: TaskStatus
  priority?: TaskPriority
  parentId?: string | null
  sortOrder?: number
}

/**
 * Update an existing task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateTaskInput): Promise<Task> => {
      const supabase = createClient()

      const updateData: Record<string, unknown> = {}
      if (input.name !== undefined) updateData.name = input.name
      if (input.description !== undefined) updateData.description = input.description
      if (input.startDate !== undefined) updateData.start_date = input.startDate
      if (input.endDate !== undefined) updateData.end_date = input.endDate
      if (input.duration !== undefined) updateData.duration = input.duration
      if (input.progress !== undefined) updateData.progress = input.progress
      if (input.isMilestone !== undefined) updateData.is_milestone = input.isMilestone
      if (input.isSummary !== undefined) updateData.is_summary = input.isSummary
      if (input.status !== undefined) updateData.status = input.status
      if (input.priority !== undefined) updateData.priority = input.priority
      if (input.parentId !== undefined) updateData.parent_id = input.parentId
      if (input.sortOrder !== undefined) updateData.sort_order = input.sortOrder

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', input.id)
        .select(`
          *,
          task_dependencies!task_dependencies_successor_id_fkey (
            id,
            predecessor_id,
            dependency_type,
            lag_days,
            tasks!task_dependencies_predecessor_id_fkey (name)
          ),
          task_assignments (
            id,
            employee_id,
            planned_hours,
            actual_hours,
            employees (name, color)
          )
        `)
        .single()

      if (error) {
        throw new Error(`Failed to update task: ${error.message}`)
      }

      return transformTask(data as DbTaskWithRelations)
    },
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(input.projectId) })

      // Snapshot the previous value
      const previousProject = queryClient.getQueryData(projectKeys.detail(input.projectId))

      // Optimistically update the cache
      queryClient.setQueryData(projectKeys.detail(input.projectId), (old: unknown) => {
        if (!old || typeof old !== 'object' || !('tasks' in old)) return old
        const project = old as { tasks: Task[] }

        return {
          ...project,
          tasks: project.tasks.map(task =>
            task.id === input.id
              ? {
                  ...task,
                  ...(input.name !== undefined && { name: input.name }),
                  ...(input.description !== undefined && { description: input.description }),
                  ...(input.startDate !== undefined && { startDate: input.startDate }),
                  ...(input.endDate !== undefined && { endDate: input.endDate }),
                  ...(input.duration !== undefined && { duration: input.duration }),
                  ...(input.progress !== undefined && { progress: input.progress }),
                  ...(input.status !== undefined && { status: input.status }),
                  ...(input.priority !== undefined && { priority: input.priority }),
                }
              : task
          ),
        }
      })

      return { previousProject }
    },
    onError: (_error, input, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(projectKeys.detail(input.projectId), context.previousProject)
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list(variables.projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) })
    },
  })
}

interface DeleteTaskInput {
  id: string
  projectId: string
}

/**
 * Delete a task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: DeleteTaskInput): Promise<void> => {
      const supabase = createClient()

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', input.id)

      if (error) {
        throw new Error(`Failed to delete task: ${error.message}`)
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list(variables.projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) })
    },
  })
}

// =============================================================================
// Dependency Mutations
// =============================================================================

interface AddDependencyInput {
  projectId: string
  taskId: string
  predecessorId: string
  type: DependencyType
  lagDays?: number
}

/**
 * Add a dependency between tasks
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
