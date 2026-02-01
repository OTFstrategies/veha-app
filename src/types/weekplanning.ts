// =============================================================================
// Data Types
// =============================================================================

/**
 * Availability status types
 * Note: 'beschikbaar' is excluded here as it represents the default state (no entry needed)
 */
export type AvailabilityStatus = 'ziek' | 'vakantie' | 'vrij' | 'training'

/**
 * A day in the week header
 */
export interface WeekDay {
  date: string
  dayName: string
  dayNumber: number
  isToday: boolean
}

/**
 * Current week information
 */
export interface CurrentWeek {
  weekNumber: number
  year: number
  startDate: string
  endDate: string
  days: WeekDay[]
}

/**
 * Availability information for a day
 */
export interface DayAvailability {
  status: AvailabilityStatus
  notes: string
}

/**
 * A task assigned to an employee on a specific day
 */
export interface DayTask {
  id: string
  name: string
  projectId: string
  projectName: string
  clientName: string
  hours?: number
}

/**
 * A day entry containing availability and/or tasks
 */
export interface DayEntry {
  availability: DayAvailability | null
  tasks: DayTask[]
  plannedHours?: number
  availableHours?: number
}

/**
 * An employee's schedule for the week
 */
export interface EmployeeSchedule {
  [date: string]: DayEntry
}

/**
 * An employee with their weekly schedule
 */
export interface WeekEmployee {
  id: string
  name: string
  role: string
  color: string
  schedule: EmployeeSchedule
}

/**
 * Styling configuration for availability statuses
 */
export interface AvailabilityStyle {
  bgColor: string
  textColor: string
  label: string
}

/**
 * Map of availability status to styling
 */
export interface AvailabilityStyles {
  ziek: AvailabilityStyle
  vakantie: AvailabilityStyle
  vrij: AvailabilityStyle
  training: AvailabilityStyle
}

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for the week planning calendar component
 */
export interface WeekPlanningProps {
  /** Current week information */
  currentWeek: CurrentWeek
  /** Employees with their schedules */
  employees: WeekEmployee[]
  /** Styling for availability statuses */
  availabilityStyles?: AvailabilityStyles
  /** Called when user navigates to previous week */
  onPreviousWeek?: () => void
  /** Called when user navigates to next week */
  onNextWeek?: () => void
  /** Called when user clicks "Today" button */
  onToday?: () => void
  /** Called when user clicks on a task */
  onTaskClick?: (taskId: string, projectId: string) => void
  /** Called when user clicks on an employee */
  onEmployeeClick?: (employeeId: string) => void
  /** Called when user clicks on availability (for editing) */
  onAvailabilityClick?: (employeeId: string, date: string) => void
}

/**
 * Props for a single week calendar cell
 */
export interface WeekCellProps {
  /** The day entry data */
  entry: DayEntry
  /** Whether this is today's column */
  isToday: boolean
  /** Styling for availability statuses */
  availabilityStyles?: AvailabilityStyles
  /** Called when user clicks on a task */
  onTaskClick?: (taskId: string, projectId: string) => void
  /** Called when user clicks on availability */
  onAvailabilityClick?: () => void
}

/**
 * Props for the employee row in the week calendar
 */
export interface EmployeeRowProps {
  /** The employee data */
  employee: WeekEmployee
  /** Days in the current week */
  days: WeekDay[]
  /** Styling for availability statuses */
  availabilityStyles?: AvailabilityStyles
  /** Called when user clicks on the employee */
  onEmployeeClick?: () => void
  /** Called when user clicks on a task */
  onTaskClick?: (taskId: string, projectId: string) => void
  /** Called when user clicks on availability */
  onAvailabilityClick?: (date: string) => void
}

/**
 * Props for the week navigation header
 */
export interface WeekNavigationProps {
  /** Current week information */
  currentWeek: CurrentWeek
  /** Called when user navigates to previous week */
  onPreviousWeek?: () => void
  /** Called when user navigates to next week */
  onNextWeek?: () => void
  /** Called when user clicks "Today" button */
  onToday?: () => void
}
