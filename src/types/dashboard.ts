// =============================================================================
// Data Types
// =============================================================================

/**
 * Task status types
 */
export type TaskStatus = 'todo' | 'in_progress' | 'done'

/**
 * Capacity utilization status
 */
export type CapacityStatus = 'underutilized' | 'optimal' | 'overbooked'

/**
 * Project status types
 */
export type ProjectStatus = 'gepland' | 'actief' | 'on-hold' | 'afgerond' | 'geannuleerd'

/**
 * A stat card value with count and additional info
 */
export interface StatValue {
  count: number
  newThisMonth?: number
  completed?: number
  total?: number
}

/**
 * Dashboard statistics summary
 */
export interface DashboardStats {
  activeProjects: {
    count: number
    newThisMonth: number
  }
  todayTasks: {
    count: number
    completed: number
  }
  availableEmployees: {
    available: number
    total: number
  }
  attentionNeeded: {
    count: number
  }
}

/**
 * An assignee (employee) summary for display
 */
export interface Assignee {
  id: string
  name: string
  color: string
  initials: string
}

/**
 * A task for today's task list
 */
export interface TodayTask {
  id: string
  name: string
  progress: number
  status: TaskStatus
  assignees: Assignee[]
}

/**
 * A project's tasks grouped for today view
 */
export interface TodayTaskGroup {
  projectId: string
  projectName: string
  clientName: string
  tasks: TodayTask[]
}

/**
 * An active project card
 */
export interface ActiveProject {
  id: string
  name: string
  clientName: string
  progress: number
  startDate: string
  endDate: string
  status: ProjectStatus
  isDelayed: boolean
  assignees: Assignee[]
}

/**
 * Capacity data for an employee
 */
export interface CapacityEntry {
  id: string
  name: string
  role: string
  color: string
  plannedHours: number
  availableHours: number
  utilizationPercent: number
  status: CapacityStatus
}

/**
 * A quick action button
 */
export interface QuickAction {
  id: string
  label: string
  icon: string
}

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for the dashboard page component
 */
export interface DashboardProps {
  /** Dashboard statistics */
  stats: DashboardStats
  /** Today's tasks grouped by project */
  todayTasks: TodayTaskGroup[]
  /** Active projects for the project cards */
  activeProjects: ActiveProject[]
  /** Capacity data for the capacity widget */
  capacityData: CapacityEntry[]
  /** Called when user clicks on a stat card */
  onStatClick?: (statType: 'activeProjects' | 'todayTasks' | 'availableEmployees' | 'attentionNeeded') => void
  /** Called when user clicks on a task */
  onTaskClick?: (taskId: string, projectId: string) => void
  /** Called when user clicks on a project card */
  onProjectClick?: (projectId: string) => void
  /** Called when user clicks on a capacity row */
  onCapacityClick?: (employeeId: string) => void
  /** Called when user wants to go to week planning */
  onViewWeekPlanning?: () => void
}

/**
 * Props for the stats cards section
 */
export interface StatsCardsProps {
  /** Dashboard statistics */
  stats: DashboardStats
  /** Called when user clicks on a stat card */
  onStatClick?: (statType: 'activeProjects' | 'todayTasks' | 'availableEmployees' | 'attentionNeeded') => void
}

/**
 * Props for the today tasks section
 */
export interface TodayTasksProps {
  /** Today's tasks grouped by project */
  taskGroups: TodayTaskGroup[]
  /** Called when user clicks on a task */
  onTaskClick?: (taskId: string, projectId: string) => void
}

/**
 * Props for the active projects section
 */
export interface ActiveProjectsProps {
  /** Active projects for the project cards */
  projects: ActiveProject[]
  /** Called when user clicks on a project card */
  onProjectClick?: (projectId: string) => void
}

/**
 * Props for the capacity widget
 */
export interface CapacityWidgetProps {
  /** Capacity data for employees */
  capacityData: CapacityEntry[]
  /** Called when user clicks on a capacity row */
  onEmployeeClick?: (employeeId: string) => void
  /** Called when user wants to go to week planning */
  onViewWeekPlanning?: () => void
}

// QuickAction type kept for backward compatibility
// The FAB component now handles quick actions internally
