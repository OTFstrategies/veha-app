// =============================================================================
// Data Types
// =============================================================================

/**
 * Employee role types
 */
export type EmployeeRole = 'uitvoerder' | 'voorman' | 'specialist' | 'projectleider'

/**
 * Available skills for employees
 */
export type Skill =
  | 'straatwerk'
  | 'kitwerk'
  | 'reinigen'
  | 'kantoorwerk'
  | 'elektra'
  | 'loodgieter'
  | 'timmerman'
  | 'metselaar'

/**
 * Availability status types
 */
export type AvailabilityStatus = 'beschikbaar' | 'ziek' | 'vakantie' | 'vrij' | 'training'

/**
 * A record of employee unavailability (sick, vacation, etc.)
 */
export interface EmployeeAvailability {
  id: string
  date: string
  status: AvailabilityStatus
  notes: string
}

/**
 * A task assignment for an employee
 */
export interface TaskAssignment {
  id: string
  taskId: string
  taskName: string
  projectId: string
  projectName: string
  plannedHours: number
  actualHours: number
  startDate: string
  endDate: string
}

/**
 * An employee who performs work on projects
 */
export interface Employee {
  id: string
  name: string
  role: EmployeeRole
  email: string
  phone: string
  hourlyRate: number
  weeklyCapacity: number
  skills: Skill[]
  color: string
  isActive: boolean
  availability: EmployeeAvailability[]
  assignments: TaskAssignment[]
}

/**
 * Option type for dropdowns and selects
 */
export interface SelectOption {
  value: string
  label: string
}

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for the employee list view component
 */
export interface EmployeeListProps {
  /** The list of employees to display */
  employees: Employee[]
  /** Available role options for filtering */
  roles?: SelectOption[]
  /** Called when user wants to view an employee's details */
  onView?: (id: string) => void
  /** Called when user wants to edit an employee */
  onEdit?: (id: string) => void
  /** Called when user wants to delete an employee */
  onDelete?: (id: string) => void
  /** Called when user wants to create a new employee */
  onCreate?: () => void
}

/**
 * Props for the employee detail view component
 */
export interface EmployeeDetailProps {
  /** The employee to display */
  employee: Employee
  /** Called when user wants to edit the employee */
  onEdit?: () => void
  /** Called when user wants to deactivate the employee */
  onDeactivate?: () => void
  /** Called when user wants to go back to the list */
  onBack?: () => void
  /** Called when user wants to add availability */
  onAddAvailability?: () => void
  /** Called when user wants to edit availability */
  onEditAvailability?: (availabilityId: string) => void
  /** Called when user wants to delete availability */
  onDeleteAvailability?: (availabilityId: string) => void
  /** Called when user clicks on a task */
  onTaskClick?: (taskId: string, projectId: string) => void
}

/**
 * Props for the employee form component
 */
export interface EmployeeFormProps {
  /** The employee to edit (undefined for new employee) */
  employee?: Employee
  /** Available role options */
  roles?: SelectOption[]
  /** Available skill options */
  skillOptions?: SelectOption[]
  /** Called when form is submitted */
  onSubmit?: (employee: Omit<Employee, 'id' | 'availability' | 'assignments'>) => void
  /** Called when user cancels */
  onCancel?: () => void
}

/**
 * Props for the availability form component
 */
export interface AvailabilityFormProps {
  /** The availability record to edit (undefined for new) */
  availability?: EmployeeAvailability
  /** Available status options */
  statusOptions?: SelectOption[]
  /** Called when form is submitted */
  onSubmit?: (availability: Omit<EmployeeAvailability, 'id'>) => void
  /** Called when user cancels */
  onCancel?: () => void
}
