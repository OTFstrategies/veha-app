// =============================================================================
// Data Types
// =============================================================================

/**
 * Work type for projects
 */
export type WorkType = 'straatwerk' | 'kitwerk' | 'reinigen' | 'kantoor' | 'overig'

/**
 * Project status types
 */
export type ProjectStatus = 'gepland' | 'actief' | 'on-hold' | 'afgerond' | 'geannuleerd'

/**
 * Task status types
 */
export type TaskStatus = 'todo' | 'in_progress' | 'done'

/**
 * Task priority levels
 */
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'

/**
 * Dependency types between tasks
 */
export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF'

/**
 * Option type for dropdowns and selects
 */
export interface SelectOption {
  value: string
  label: string
}

/**
 * A dependency relationship between two tasks
 */
export interface TaskDependency {
  id: string
  predecessorId: string
  predecessorName: string
  type: DependencyType
  lag: number
}

/**
 * An employee assignment to a task
 */
export interface TaskAssignment {
  id: string
  employeeId: string
  employeeName: string
  employeeColor: string
  plannedHours: number
  actualHours: number
}

/**
 * A task within a project (supports hierarchy)
 */
export interface Task {
  id: string
  wbs: string
  name: string
  description: string
  startDate: string
  endDate: string
  duration: number
  progress: number
  isMilestone: boolean
  isSummary: boolean
  status: TaskStatus
  priority: TaskPriority
  sortOrder: number
  parentId: string | null
  dependencies: TaskDependency[]
  assignments: TaskAssignment[]
  // Baseline tracking fields
  baselineStartDate: string | null
  baselineEndDate: string | null
  baselineDuration: number | null
  isBaselineSet: boolean
  baselineSetAt: string | null
  varianceStartDays: number
  varianceEndDays: number
}

/**
 * Quick task for project checklists
 */
export interface QuickTask {
  id: string
  text: string
  completed: boolean
  order: number
}

/**
 * A project containing tasks executed for a client
 */
export interface Project {
  id: string
  name: string
  description: string
  clientId: string
  clientName: string
  locationId: string | null
  locationName: string | null
  workType: WorkType
  status: ProjectStatus
  startDate: string
  endDate: string
  budgetHours: number
  actualHours: number
  progress: number
  notes: string
  quickTasks?: QuickTask[]
  tasks: Task[]
}

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for the project list view component
 */
export interface ProjectListProps {
  /** The list of projects to display */
  projects: Project[]
  /** Available work type options for filtering */
  workTypes?: SelectOption[]
  /** Available status options for filtering */
  projectStatuses?: SelectOption[]
  /** Called when user wants to view a project's details (Gantt) */
  onView?: (id: string) => void
  /** Called when user wants to edit a project */
  onEdit?: (id: string) => void
  /** Called when user wants to delete a project */
  onDelete?: (id: string) => void
  /** Called when user wants to create a new project */
  onCreate?: () => void
  /** Called when user clicks on a client link */
  onClientClick?: (clientId: string) => void
}

/**
 * Props for the project detail (Gantt) view component
 */
export interface ProjectGanttProps {
  /** The project to display */
  project: Project
  /** Called when user wants to edit the project */
  onEditProject?: () => void
  /** Called when user wants to delete the project */
  onDeleteProject?: () => void
  /** Called when user wants to go back to the list */
  onBack?: () => void
  /** Called when user creates a new task */
  onAddTask?: (parentId?: string) => void
  /** Called when user edits a task */
  onEditTask?: (taskId: string) => void
  /** Called when user deletes a task */
  onDeleteTask?: (taskId: string) => void
  /** Called when user updates task dates via drag */
  onTaskDatesChange?: (taskId: string, startDate: string, endDate: string) => void
  /** Called when user updates task progress */
  onTaskProgressChange?: (taskId: string, progress: number) => void
  /** Called when user adds a dependency */
  onAddDependency?: (taskId: string, predecessorId: string, type: DependencyType) => void
  /** Called when user removes a dependency */
  onRemoveDependency?: (taskId: string, dependencyId: string) => void
  /** Called when user assigns an employee */
  onAssignEmployee?: (taskId: string, employeeId: string) => void
  /** Called when user clicks on a client link */
  onClientClick?: (clientId: string) => void
}

/**
 * Props for the project form component
 */
export interface ProjectFormProps {
  /** The project to edit (undefined for new project) */
  project?: Project
  /** Available clients for selection */
  clients?: Array<{ id: string; name: string }>
  /** Available work type options */
  workTypes?: SelectOption[]
  /** Available status options */
  projectStatuses?: SelectOption[]
  /** Called when form is submitted */
  onSubmit?: (project: Omit<Project, 'id' | 'tasks' | 'actualHours' | 'progress'>) => void
  /** Called when user cancels */
  onCancel?: () => void
}

/**
 * Props for the task editor (side panel) component
 */
export interface TaskEditorProps {
  /** The task being edited */
  task: Task
  /** All tasks in the project (for dependency selection) */
  allTasks: Task[]
  /** Available employees for assignment */
  employees?: Array<{ id: string; name: string; color: string }>
  /** Available status options */
  taskStatuses?: SelectOption[]
  /** Available priority options */
  taskPriorities?: SelectOption[]
  /** Available dependency type options */
  dependencyTypes?: SelectOption[]
  /** Called when task is updated */
  onSave?: (task: Task) => void
  /** Called when user closes the editor */
  onClose?: () => void
  /** Called when user deletes the task */
  onDelete?: () => void
}

/**
 * Zoom level for the Gantt timeline
 */
export type GanttZoomLevel = 'day' | 'week' | 'month' | 'year'

/**
 * View options for the Gantt chart
 */
export interface GanttViewOptions {
  showDependencies: boolean
  showProgress: boolean
  showTodayLine: boolean
  zoomLevel: GanttZoomLevel
}
