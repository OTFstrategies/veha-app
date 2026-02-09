import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Task, TaskDependency, TaskAssignment, TaskStatus, TaskPriority, DependencyType } from '@/types/projects'
import type { Task as DbTask } from '@/types/database'
import { projectKeys } from './projects'
import { useTaskHistoryStore } from '@/stores/task-history-store'

// =============================================================================
// Query Keys
// =============================================================================

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (projectId: string) => [...taskKeys.lists(), projectId] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  criticalPath: (projectId: string) => [...taskKeys.all, 'critical-path', projectId] as const,
}

// =============================================================================
// Type Transformations
// =============================================================================

export interface DbTaskWithRelations extends DbTask {
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

export function transformDependency(dep: DbTaskWithRelations['task_dependencies'][0]): TaskDependency {
  return {
    id: dep.id,
    predecessorId: dep.predecessor_id,
    predecessorName: dep.tasks?.name ?? 'Unknown',
    type: dep.dependency_type as DependencyType,
    lag: dep.lag_days,
  }
}

export function transformAssignment(assignment: DbTaskWithRelations['task_assignments'][0]): TaskAssignment {
  return {
    id: assignment.id,
    employeeId: assignment.employee_id,
    employeeName: assignment.employees?.name ?? 'Unknown',
    employeeColor: assignment.employees?.color ?? '#6b7280',
    plannedHours: assignment.planned_hours,
    actualHours: assignment.actual_hours,
  }
}

export function transformTask(dbTask: DbTaskWithRelations): Task {
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
    // Baseline fields
    baselineStartDate: dbTask.baseline_start_date ?? null,
    baselineEndDate: dbTask.baseline_end_date ?? null,
    baselineDuration: dbTask.baseline_duration ?? null,
    isBaselineSet: dbTask.is_baseline_set ?? false,
    baselineSetAt: dbTask.baseline_set_at ?? null,
    varianceStartDays: dbTask.variance_start_days ?? 0,
    varianceEndDays: dbTask.variance_end_days ?? 0,
    // Constraint fields
    constraintType: (dbTask.constraint_type as import('@/types/projects').TaskConstraintType) ?? 'ASAP',
    constraintDate: dbTask.constraint_date ?? null,
    calendarId: dbTask.calendar_id ?? null,
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
    staleTime: 2 * 60 * 1000, // 2 minutes - task data may change during planning
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
// Task Date Updates (Drag/Resize)
// =============================================================================

interface UpdateTaskDatesInput {
  taskId: string
  projectId: string
  startDate: string
  endDate: string
}

/**
 * Update task dates from drag/resize operations
 * Stores previous state for undo functionality
 */
export function useUpdateTaskDates() {
  const queryClient = useQueryClient()
  const pushState = useTaskHistoryStore((state) => state.pushState)

  return useMutation({
    mutationFn: async ({
      taskId,
      projectId: _projectId, // Kept for API compatibility
      startDate,
      endDate,
    }: UpdateTaskDatesInput): Promise<{ taskId: string; startDate: string; endDate: string }> => {
      const supabase = createClient()

      // Get current task for undo
      const { data: currentTask, error: fetchError } = await supabase
        .from('tasks')
        .select('start_date, end_date, name, duration')
        .eq('id', taskId)
        .single()

      if (fetchError) {
        throw new Error(`Taak niet gevonden: ${fetchError.message}`)
      }

      // Save state for undo
      if (currentTask) {
        pushState(`Taak "${currentTask.name}" verplaatst`, [{
          id: taskId,
          startDate: currentTask.start_date,
          endDate: currentTask.end_date,
        }])
      }

      // Calculate new duration
      const start = new Date(startDate)
      const end = new Date(endDate)
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

      // Update dates
      const { error } = await supabase
        .from('tasks')
        .update({
          start_date: startDate,
          end_date: endDate,
          duration: duration,
        })
        .eq('id', taskId)

      if (error) {
        throw new Error(`Fout bij bijwerken taak: ${error.message}`)
      }

      return { taskId, startDate, endDate }
    },
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(input.projectId) })

      // Snapshot the previous value
      const previousProject = queryClient.getQueryData(projectKeys.detail(input.projectId))

      // Calculate new duration for optimistic update
      const start = new Date(input.startDate)
      const end = new Date(input.endDate)
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

      // Optimistically update the cache
      queryClient.setQueryData(projectKeys.detail(input.projectId), (old: unknown) => {
        if (!old || typeof old !== 'object' || !('tasks' in old)) return old
        const project = old as { tasks: Task[] }

        return {
          ...project,
          tasks: project.tasks.map(task =>
            task.id === input.taskId
              ? {
                  ...task,
                  startDate: input.startDate,
                  endDate: input.endDate,
                  duration: duration,
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list(variables.projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) })
    },
  })
}

// =============================================================================
// Baseline Mutations
// =============================================================================

/**
 * Set baseline for all tasks in a project
 * Copies current dates to baseline fields
 */
export function useSetProjectBaseline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (projectId: string): Promise<void> => {
      const supabase = createClient()

      // First get all tasks for the project
      const { data: tasks, error: fetchError } = await supabase
        .from('tasks')
        .select('id, start_date, end_date, duration')
        .eq('project_id', projectId)

      if (fetchError) {
        throw new Error(`Failed to fetch tasks: ${fetchError.message}`)
      }

      // Update each task with baseline values
      const now = new Date().toISOString()
      const updates = tasks.map((task) =>
        supabase
          .from('tasks')
          .update({
            baseline_start_date: task.start_date,
            baseline_end_date: task.end_date,
            baseline_duration: task.duration,
            is_baseline_set: true,
            baseline_set_at: now,
          })
          .eq('id', task.id)
      )

      const results = await Promise.all(updates)
      const errors = results.filter((r) => r.error)

      if (errors.length > 0) {
        throw new Error(`Failed to set baseline for some tasks`)
      }
    },
    onSuccess: (_data, projectId) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list(projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
    },
  })
}

/**
 * Clear baseline for all tasks in a project
 */
export function useClearProjectBaseline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (projectId: string): Promise<void> => {
      const supabase = createClient()

      const { error } = await supabase
        .from('tasks')
        .update({
          baseline_start_date: null,
          baseline_end_date: null,
          baseline_duration: null,
          is_baseline_set: false,
          baseline_set_at: null,
          variance_start_days: 0,
          variance_end_days: 0,
        })
        .eq('project_id', projectId)

      if (error) {
        throw new Error(`Failed to clear baseline: ${error.message}`)
      }
    },
    onSuccess: (_data, projectId) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list(projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
    },
  })
}
