/**
 * Zoom level for the Gantt timeline
 */
export type GanttZoomLevel = 'day' | 'week' | 'month' | 'quarter'

/**
 * View options for the Gantt chart
 */
export interface ViewOptions {
  showDependencies: boolean
  showProgress: boolean
  showTodayLine: boolean
  showWeekends: boolean
}

/**
 * Timeline configuration for rendering
 */
export interface TimelineConfig {
  zoomLevel: GanttZoomLevel
  startDate: Date
  endDate: Date
  columnWidth: number
  todayPosition: number
}
