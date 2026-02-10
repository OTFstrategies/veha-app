import type { ProjectStatus, WorkType } from '@/types/projects'
import type { GanttZoomLevel } from './types'

// Status badge config - used by Grid, Kanban, Gantt views
export const STATUS_CONFIG: Record<ProjectStatus, { label: string; className: string; barColor: string }> = {
  gepland: {
    label: 'Gepland',
    className: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    barColor: 'bg-zinc-400 dark:bg-zinc-500',
  },
  actief: {
    label: 'Actief',
    className: 'bg-state-success-bg text-state-success-text',
    barColor: 'bg-zinc-700 dark:bg-zinc-300',
  },
  'on-hold': {
    label: 'On-hold',
    className: 'bg-state-warning-bg text-state-warning-text',
    barColor: 'bg-zinc-500 dark:bg-zinc-400',
  },
  afgerond: {
    label: 'Afgerond',
    className: 'bg-state-info-bg text-state-info-text',
    barColor: 'bg-zinc-800 dark:bg-zinc-200',
  },
  geannuleerd: {
    label: 'Geannuleerd',
    className: 'bg-state-error-bg text-state-error-text',
    barColor: 'bg-zinc-400 dark:bg-zinc-500',
  },
}

// Work type labels - used by Grid, Kanban views
export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  straatwerk: 'Straatwerk',
  kitwerk: 'Kitwerk',
  reinigen: 'Reinigen',
  kantoor: 'Kantoor',
  overig: 'Overig',
}

// All work types array - used by Kanban filter
export const WORK_TYPES: WorkType[] = ['straatwerk', 'kitwerk', 'reinigen', 'kantoor', 'overig']

// Kanban column config - used by Kanban view
export const KANBAN_COLUMNS: Array<{
  id: ProjectStatus
  title: string
  headerColor: string
  bgColor: string
}> = [
  { id: 'gepland', title: 'Gepland', headerColor: 'bg-zinc-500', bgColor: 'bg-zinc-50 dark:bg-zinc-900/50' },
  { id: 'actief', title: 'Actief', headerColor: 'bg-zinc-700 dark:bg-zinc-300', bgColor: 'bg-zinc-50 dark:bg-zinc-900/50' },
  { id: 'on-hold', title: 'On-hold', headerColor: 'bg-zinc-500', bgColor: 'bg-zinc-50 dark:bg-zinc-900/50' },
  { id: 'afgerond', title: 'Afgerond', headerColor: 'bg-zinc-800 dark:bg-zinc-200', bgColor: 'bg-zinc-100 dark:bg-zinc-800/50' },
]

// Gantt grid column widths
export const GRID_COLUMNS = {
  expand: 28,
  wbs: 56,
  task: 200,
  start: 80,
  end: 80,
  duration: 48,
  progress: 56,
  slack: 50,
  resources: 96,
}

export const GRID_WIDTH = Object.values(GRID_COLUMNS).reduce((a, b) => a + b, 0)
export const ROW_HEIGHT = 36

// Zoom config
export const ZOOM_ORDER: GanttZoomLevel[] = ['day', 'week', 'month', 'year']

export const ZOOM_LABELS: Record<GanttZoomLevel, string> = {
  day: 'Dag',
  week: 'Week',
  month: 'Maand',
  year: 'Jaar',
}
