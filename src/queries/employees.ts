import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Employee as DbEmployee, EmployeeAvailability as DbEmployeeAvailability } from '@/types/database'
import type { Employee, EmployeeAvailability, TaskAssignment } from '@/types/employees'

// =============================================================================
// Query Keys
// =============================================================================

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (workspaceId: string) => [...employeeKeys.lists(), workspaceId] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
}

// =============================================================================
// Type Transformations
// =============================================================================

function transformDbEmployee(
  dbEmployee: DbEmployee,
  availability: DbEmployeeAvailability[] = [],
  assignments: TaskAssignment[] = []
): Employee {
  return {
    id: dbEmployee.id,
    name: dbEmployee.name,
    role: dbEmployee.role,
    email: dbEmployee.email || '',
    phone: dbEmployee.phone || '',
    hourlyRate: dbEmployee.hourly_rate,
    weeklyCapacity: dbEmployee.weekly_capacity,
    skills: dbEmployee.skills as Employee['skills'],
    color: dbEmployee.color,
    isActive: dbEmployee.is_active,
    availability: availability.map((a) => ({
      id: a.id,
      date: a.date,
      status: a.status,
      notes: a.notes || '',
    })),
    assignments,
  }
}

// =============================================================================
// API Functions
// =============================================================================

async function fetchEmployees(workspaceId: string): Promise<Employee[]> {
  const supabase = createClient()

  const { data: employees, error: employeesError } = await supabase
    .from('employees')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('name')

  if (employeesError) {
    throw new Error(`Failed to fetch employees: ${employeesError.message}`)
  }

  if (!employees || employees.length === 0) {
    return []
  }

  // Fetch availability for all employees
  const employeeIds = employees.map((e) => e.id)
  const { data: availability, error: availabilityError } = await supabase
    .from('employee_availability')
    .select('*')
    .in('employee_id', employeeIds)
    .order('date')

  if (availabilityError) {
    // Graceful degradation: employee data laadt ook als availability fetch faalt
    console.warn('Non-critical: failed to fetch availability:', availabilityError.message)
  }

  const availabilityByEmployee = (availability || []).reduce(
    (acc, a) => {
      if (!acc[a.employee_id]) {
        acc[a.employee_id] = []
      }
      acc[a.employee_id].push(a)
      return acc
    },
    {} as Record<string, DbEmployeeAvailability[]>
  )

  return employees.map((e) =>
    transformDbEmployee(e, availabilityByEmployee[e.id] || [])
  )
}

async function fetchEmployee(id: string): Promise<Employee> {
  const supabase = createClient()

  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single()

  if (employeeError) {
    throw new Error(`Failed to fetch employee: ${employeeError.message}`)
  }

  // Fetch availability
  const { data: availability, error: availabilityError } = await supabase
    .from('employee_availability')
    .select('*')
    .eq('employee_id', id)
    .order('date')

  if (availabilityError) {
    // Graceful degradation: employee detail laadt ook als availability fetch faalt
    console.warn('Non-critical: failed to fetch availability:', availabilityError.message)
  }

  // Fetch task assignments with task and project details
  const { data: assignmentsData, error: assignmentsError } = await supabase
    .from('task_assignments')
    .select(`
      id,
      task_id,
      planned_hours,
      actual_hours,
      tasks:task_id (
        id,
        name,
        start_date,
        end_date,
        project_id,
        projects:project_id (
          id,
          name
        )
      )
    `)
    .eq('employee_id', id)

  if (assignmentsError) {
    // Graceful degradation: employee detail laadt ook als assignments fetch faalt
    console.warn('Non-critical: failed to fetch assignments:', assignmentsError.message)
  }

  const assignments: TaskAssignment[] = (assignmentsData || [])
    .filter((a) => a.tasks)
    .map((a) => {
      const task = a.tasks as unknown as {
        id: string
        name: string
        start_date: string
        end_date: string
        project_id: string
        projects: { id: string; name: string }
      }
      return {
        id: a.id,
        taskId: task.id,
        taskName: task.name,
        projectId: task.project_id,
        projectName: task.projects?.name || '',
        plannedHours: a.planned_hours,
        actualHours: a.actual_hours,
        startDate: task.start_date,
        endDate: task.end_date,
      }
    })

  return transformDbEmployee(employee, availability || [], assignments)
}

interface CreateEmployeeInput {
  workspaceId: string
  name: string
  role: Employee['role']
  email?: string
  phone?: string
  hourlyRate: number
  weeklyCapacity: number
  skills: Employee['skills']
  color: string
}

async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('employees')
    .insert({
      workspace_id: input.workspaceId,
      name: input.name,
      role: input.role,
      email: input.email || null,
      phone: input.phone || null,
      hourly_rate: input.hourlyRate,
      weekly_capacity: input.weeklyCapacity,
      skills: input.skills,
      color: input.color,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create employee: ${error.message}`)
  }

  return transformDbEmployee(data)
}

interface UpdateEmployeeInput {
  id: string
  name?: string
  role?: Employee['role']
  email?: string
  phone?: string
  hourlyRate?: number
  weeklyCapacity?: number
  skills?: Employee['skills']
  color?: string
  isActive?: boolean
}

async function updateEmployee(input: UpdateEmployeeInput): Promise<Employee> {
  const supabase = createClient()

  const updateData: Record<string, unknown> = {}
  if (input.name !== undefined) updateData.name = input.name
  if (input.role !== undefined) updateData.role = input.role
  if (input.email !== undefined) updateData.email = input.email || null
  if (input.phone !== undefined) updateData.phone = input.phone || null
  if (input.hourlyRate !== undefined) updateData.hourly_rate = input.hourlyRate
  if (input.weeklyCapacity !== undefined) updateData.weekly_capacity = input.weeklyCapacity
  if (input.skills !== undefined) updateData.skills = input.skills
  if (input.color !== undefined) updateData.color = input.color
  if (input.isActive !== undefined) updateData.is_active = input.isActive

  const { data, error } = await supabase
    .from('employees')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update employee: ${error.message}`)
  }

  return transformDbEmployee(data)
}

async function deleteEmployee(id: string): Promise<void> {
  const supabase = createClient()

  // Soft delete by deactivating
  const { error } = await supabase
    .from('employees')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to deactivate employee: ${error.message}`)
  }
}

interface AddAvailabilityInput {
  employeeId: string
  date: string
  status: EmployeeAvailability['status']
  notes?: string
}

async function addAvailability(input: AddAvailabilityInput): Promise<EmployeeAvailability> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('employee_availability')
    .insert({
      employee_id: input.employeeId,
      date: input.date,
      status: input.status,
      notes: input.notes || null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to add availability: ${error.message}`)
  }

  return {
    id: data.id,
    date: data.date,
    status: data.status,
    notes: data.notes || '',
  }
}

interface UpdateAvailabilityInput {
  id: string
  date?: string
  status?: EmployeeAvailability['status']
  notes?: string
}

async function updateAvailability(input: UpdateAvailabilityInput): Promise<EmployeeAvailability> {
  const supabase = createClient()

  const updateData: Record<string, unknown> = {}
  if (input.date !== undefined) updateData.date = input.date
  if (input.status !== undefined) updateData.status = input.status
  if (input.notes !== undefined) updateData.notes = input.notes || null

  const { data, error } = await supabase
    .from('employee_availability')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update availability: ${error.message}`)
  }

  return {
    id: data.id,
    date: data.date,
    status: data.status,
    notes: data.notes || '',
  }
}

async function deleteAvailability(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('employee_availability')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete availability: ${error.message}`)
  }
}

// =============================================================================
// React Query Hooks
// =============================================================================

/**
 * Fetch all employees with availability for a workspace
 */
export function useEmployees(workspaceId: string | null) {
  return useQuery({
    queryKey: employeeKeys.list(workspaceId || ''),
    queryFn: () => fetchEmployees(workspaceId!),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch a single employee with assignments
 */
export function useEmployee(id: string | null) {
  return useQuery({
    queryKey: employeeKeys.detail(id || ''),
    queryFn: () => fetchEmployee(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Create a new employee
 */
export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEmployee,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.list(variables.workspaceId),
      })
    },
  })
}

/**
 * Update an employee
 */
export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateEmployee,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.detail(data.id),
      })
      queryClient.invalidateQueries({
        queryKey: employeeKeys.lists(),
      })
    },
  })
}

/**
 * Deactivate (soft delete) an employee
 */
export function useDeleteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.all,
      })
    },
  })
}

/**
 * Add an unavailable period for an employee
 */
export function useAddAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addAvailability,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.detail(variables.employeeId),
      })
      queryClient.invalidateQueries({
        queryKey: employeeKeys.lists(),
      })
    },
  })
}

/**
 * Update an availability record
 */
export function useUpdateAvailability(employeeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.detail(employeeId),
      })
      queryClient.invalidateQueries({
        queryKey: employeeKeys.lists(),
      })
    },
  })
}

/**
 * Remove an availability record
 */
export function useDeleteAvailability(employeeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.detail(employeeId),
      })
      queryClient.invalidateQueries({
        queryKey: employeeKeys.lists(),
      })
    },
  })
}
