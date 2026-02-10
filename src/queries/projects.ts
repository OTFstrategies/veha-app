import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useCurrentWorkspace } from '@/hooks/use-workspace'
import type { Project, Task, TaskDependency, TaskAssignment, WorkType, ProjectStatus, QuickTask } from '@/types/projects'
import type { Project as DbProject, Task as DbTask } from '@/types/database'

// =============================================================================
// Query Keys
// =============================================================================

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (workspaceId: string) => [...projectKeys.lists(), workspaceId] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
}

// =============================================================================
// Type Transformations
// =============================================================================

interface DbProjectWithRelations extends DbProject {
  clients: { name: string } | null
  client_locations: { name: string } | null
}

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
    type: dep.dependency_type as TaskDependency['type'],
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

function transformProject(dbProject: DbProjectWithRelations, tasks: Task[] = []): Project {
  // Parse quick_tasks from JSONB column if it exists
  let quickTasks: QuickTask[] = []
  if (dbProject.quick_tasks && Array.isArray(dbProject.quick_tasks)) {
    quickTasks = dbProject.quick_tasks as unknown as QuickTask[]
  }

  return {
    id: dbProject.id,
    name: dbProject.name,
    description: dbProject.description ?? '',
    clientId: dbProject.client_id,
    clientName: dbProject.clients?.name ?? 'Unknown',
    locationId: dbProject.location_id,
    locationName: dbProject.client_locations?.name ?? null,
    workType: dbProject.work_type,
    status: dbProject.status,
    startDate: dbProject.start_date,
    endDate: dbProject.end_date,
    budgetHours: dbProject.budget_hours,
    actualHours: dbProject.actual_hours,
    progress: dbProject.progress,
    notes: dbProject.notes ?? '',
    quickTasks,
    tasks,
  }
}

// =============================================================================
// Queries
// =============================================================================

/**
 * Fetch all projects with basic information
 */
export function useProjects() {
  const { workspaceId } = useCurrentWorkspace()

  return useQuery({
    queryKey: projectKeys.list(workspaceId ?? ''),
    queryFn: async (): Promise<Project[]> => {
      if (!workspaceId) {
        throw new Error('No workspace selected')
      }

      const supabase = createClient()

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients (name),
          client_locations (name)
        `)
        .eq('workspace_id', workspaceId)
        .order('start_date', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch projects: ${error.message}`)
      }

      return (data as DbProjectWithRelations[]).map(p => transformProject(p))
    },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes - projects don't change frequently
  })
}

/**
 * Fetch a single project with all tasks and their dependencies/assignments
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async (): Promise<Project> => {
      const supabase = createClient()

      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          clients (name),
          client_locations (name)
        `)
        .eq('id', id)
        .single()

      if (projectError) {
        throw new Error(`Failed to fetch project: ${projectError.message}`)
      }

      // Fetch tasks with dependencies and assignments
      const { data: tasksData, error: tasksError } = await supabase
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
        .eq('project_id', id)
        .order('sort_order', { ascending: true })

      if (tasksError) {
        throw new Error(`Failed to fetch tasks: ${tasksError.message}`)
      }

      const tasks = (tasksData as DbTaskWithRelations[]).map(transformTask)

      return transformProject(projectData as DbProjectWithRelations, tasks)
    },
    enabled: Boolean(id),
    staleTime: 2 * 60 * 1000, // 2 minutes - task data may change more frequently
  })
}

// =============================================================================
// Mutations
// =============================================================================

/**
 * Create a new project
 */
export function useCreateProject() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const { workspaceId } = useCurrentWorkspace()

  return useMutation({
    mutationFn: async (data: {
      name: string
      clientId: string
      locationId?: string | null
      description?: string
      workType: WorkType
      startDate: string
      endDate: string
      status?: ProjectStatus
    }) => {
      if (!workspaceId) throw new Error("No workspace selected")

      const { data: project, error } = await supabase
        .from("projects")
        .insert({
          workspace_id: workspaceId,
          client_id: data.clientId,
          location_id: data.locationId ?? null,
          name: data.name,
          description: data.description ?? null,
          work_type: data.workType,
          start_date: data.startDate,
          end_date: data.endDate,
          status: data.status ?? "gepland",
          progress: 0,
        })
        .select()
        .single()

      if (error) throw new Error(`Failed to create project: ${error.message}`)
      return project
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

/**
 * Update an existing project
 */
export function useUpdateProject() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      id: string
      name?: string
      clientId?: string
      description?: string
      workType?: WorkType
      startDate?: string
      endDate?: string
      status?: ProjectStatus
      progress?: number
      notes?: string
      quickTasks?: QuickTask[]
    }) => {
      const updateData: Record<string, unknown> = {}

      if (data.name !== undefined) updateData.name = data.name
      if (data.clientId !== undefined) updateData.client_id = data.clientId
      if (data.description !== undefined) updateData.description = data.description
      if (data.workType !== undefined) updateData.work_type = data.workType
      if (data.startDate !== undefined) updateData.start_date = data.startDate
      if (data.endDate !== undefined) updateData.end_date = data.endDate
      if (data.status !== undefined) updateData.status = data.status
      if (data.progress !== undefined) updateData.progress = data.progress
      if (data.notes !== undefined) updateData.notes = data.notes
      if (data.quickTasks !== undefined) updateData.quick_tasks = data.quickTasks

      const { data: project, error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", data.id)
        .select()
        .single()

      if (error) throw new Error(`Failed to update project: ${error.message}`)
      return project
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(variables.id) })
      await queryClient.cancelQueries({ queryKey: projectKeys.all })

      // Snapshot the previous value
      const previousDetail = queryClient.getQueryData(projectKeys.detail(variables.id))

      // Optimistically update the detail cache
      if (previousDetail) {
        queryClient.setQueryData(projectKeys.detail(variables.id), (old: Record<string, unknown>) => ({
          ...old,
          ...Object.fromEntries(
            Object.entries(variables).filter(([key]) => key !== 'id' && variables[key as keyof typeof variables] !== undefined)
          ),
        }))
      }

      return { previousDetail }
    },
    onError: (_err, variables, context) => {
      // Rollback on error
      if (context?.previousDetail) {
        queryClient.setQueryData(projectKeys.detail(variables.id), context.previousDetail)
      }
    },
    onSettled: (_, _err, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) })
    },
  })
}

/**
 * Delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const supabase = createClient()

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(`Failed to delete project: ${error.message}`)
      }
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) })
    },
  })
}
