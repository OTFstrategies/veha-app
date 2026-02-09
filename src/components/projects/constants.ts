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
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    barColor: 'bg-green-500 dark:bg-green-600',
  },
  'on-hold': {
    label: 'On-hold',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    barColor: 'bg-amber-500 dark:bg-amber-600',
  },
  afgerond: {
    label: 'Afgerond',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    barColor: 'bg-blue-500 dark:bg-blue-600',
  },
  geannuleerd: {
    label: 'Geannuleerd',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    barColor: 'bg-red-400 dark:bg-red-500',
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
  { id: 'actief', title: 'Actief', headerColor: 'bg-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20' },
  { id: 'on-hold', title: 'On-hold', headerColor: 'bg-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
  { id: 'afgerond', title: 'Afgerond', headerColor: 'bg-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
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
