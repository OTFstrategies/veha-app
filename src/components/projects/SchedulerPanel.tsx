import * as React from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ConflictBadge } from './ConflictBadge'
import { TimelineHeader } from './TimelineHeader'
import type { TimelineConfig, ViewOptions } from './types'
import type { Task } from '@/types/projects'
import type { ProjectConflict } from '@/queries/conflicts'
import { parseISO } from 'date-fns'

// =============================================================================
// Props
// =============================================================================

interface ResourceData {
  employee: {
    id: string
    name: string
    role: string
    color: string
  }
  tasks: Array<{
    task: Task
    assignment: Task['assignments'][0]
  }>
  totalDays: number
}

interface SchedulerPanelProps {
  resources: ResourceData[]
  timelineConfig: TimelineConfig
  viewOptions: ViewOptions
  selectedTaskId: string | null
  scrollLeft: number
  timelineRef: React.RefObject<HTMLDivElement | null>
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void
  onTaskSelect: (taskId: string) => void
  onTaskDoubleClick: (taskId: string) => void
  /** Conflicts grouped by employee ID */
  conflictsByEmployee?: Map<string, ProjectConflict[]>
  /** All project conflicts (for timeline highlighting) */
  conflicts?: ProjectConflict[]
}

// =============================================================================
// Constants
// =============================================================================

const GRID_COLUMNS = {
  resource: 160,
  tasks: 64,
  days: 64,
}

const GRID_WIDTH = Object.values(GRID_COLUMNS).reduce((a, b) => a + b, 0)
const ROW_HEIGHT = 40

// =============================================================================
// Component
// =============================================================================

export function SchedulerPanel({
  resources,
  timelineConfig,
  viewOptions,
  selectedTaskId,
  scrollLeft: _scrollLeft,
  timelineRef,
  onScroll,
  onTaskSelect,
  onTaskDoubleClick,
  conflictsByEmployee,
  conflicts,
}: SchedulerPanelProps) {
  // Note: scrollLeft is passed for synchronized scrolling state
  void _scrollLeft
  // ---------------------------------------------------------------------------
  // Timeline Calculations
  // ---------------------------------------------------------------------------

  const timelineDays = React.useMemo(() => {
    const days: Date[] = []
    const current = new Date(timelineConfig.startDate)
    while (current <= timelineConfig.endDate) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return days
  }, [timelineConfig.startDate, timelineConfig.endDate])

  const timelineWidth = timelineDays.length * timelineConfig.columnWidth

  // Calculate task bar position
  const getTaskBarPosition = (task: Task) => {
    const startDate = new Date(task.startDate)
    const dayOffset = Math.floor(
      (startDate.getTime() - timelineConfig.startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    const left = dayOffset * timelineConfig.columnWidth
    const width = task.duration * timelineConfig.columnWidth

    return { left, width }
  }

  // Get today's position
  const todayPosition = React.useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dayOffset = Math.floor(
      (today.getTime() - timelineConfig.startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    return dayOffset * timelineConfig.columnWidth
  }, [timelineConfig])

  // Calculate conflict highlight ranges for each employee
  const conflictRangesByEmployee = React.useMemo(() => {
    const rangesByEmployee = new Map<
      string,
      Array<{ start: Date; end: Date; left: number; width: number }>
    >()

    if (!conflicts) return rangesByEmployee

    conflicts.forEach((conflict) => {
      const employeeRanges = rangesByEmployee.get(conflict.employeeId) || []

      const startDate = parseISO(conflict.overlapStart)
      const endDate = parseISO(conflict.overlapEnd)

      // Calculate position in timeline
      const startOffset = Math.floor(
        (startDate.getTime() - timelineConfig.startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      const endOffset = Math.floor(
        (endDate.getTime() - timelineConfig.startDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      const left = startOffset * timelineConfig.columnWidth
      const width = (endOffset - startOffset + 1) * timelineConfig.columnWidth

      employeeRanges.push({ start: startDate, end: endDate, left, width })
      rangesByEmployee.set(conflict.employeeId, employeeRanges)
    })

    return rangesByEmployee
  }, [conflicts, timelineConfig])

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Calculate if employee is overbooked (simplified: > 40 hours/week)
  const isOverbooked = (resource: ResourceData) => {
    // Simple calculation: if total planned hours > 40 * weeks
    const totalPlannedHours = resource.tasks.reduce(
      (sum, { assignment }) => sum + assignment.plannedHours,
      0
    )
    // Assume 8 hours per day, check if they have too many days
    const workDays = resource.totalDays
    const availableHours = workDays * 8
    return totalPlannedHours > availableHours * 1.1 // 10% buffer
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex h-full flex-col bg-zinc-50/50 dark:bg-zinc-900/50">
      {/* Header Row */}
      <div className="flex shrink-0 border-b border-border bg-zinc-100 dark:bg-zinc-800">
        {/* Grid Header */}
        <div
          className="shrink-0 border-r border-border"
          style={{ width: GRID_WIDTH }}
        >
          <div className="flex h-10 items-center text-xs font-medium text-muted-foreground">
            <div className="px-3" style={{ width: GRID_COLUMNS.resource }}>
              Resource
            </div>
            <div
              className="px-2 text-center"
              style={{ width: GRID_COLUMNS.tasks }}
            >
              Taken
            </div>
            <div
              className="px-2 text-center"
              style={{ width: GRID_COLUMNS.days }}
            >
              Dagen
            </div>
          </div>
        </div>

        {/* Timeline Header */}
        <div
          ref={timelineRef}
          className="flex-1 overflow-x-auto overflow-y-hidden"
          onScroll={onScroll}
        >
          <TimelineHeader
            days={timelineDays}
            zoomLevel={timelineConfig.zoomLevel}
            columnWidth={timelineConfig.columnWidth}
          />
        </div>
      </div>

      {/* Body - Scrollable */}
      <div className="flex flex-1 overflow-hidden">
        {/* Grid Body */}
        <div
          className="shrink-0 overflow-y-auto border-r border-border"
          style={{ width: GRID_WIDTH }}
        >
          {resources.map((resource) => {
            const overbooked = isOverbooked(resource)
            const employeeConflicts = conflictsByEmployee?.get(resource.employee.id) || []
            const hasConflicts = employeeConflicts.length > 0

            return (
              <div
                key={resource.employee.id}
                className={cn(
                  'flex items-center border-b border-border transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800',
                  overbooked && 'bg-red-50 dark:bg-red-900/10',
                  hasConflicts && !overbooked && 'bg-orange-50/50 dark:bg-orange-900/10'
                )}
                style={{ height: ROW_HEIGHT }}
              >
                {/* Resource Info */}
                <div
                  className="flex items-center gap-2 px-3"
                  style={{ width: GRID_COLUMNS.resource }}
                >
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarFallback
                      className="text-[10px] font-medium text-white"
                      style={{ backgroundColor: resource.employee.color }}
                    >
                      {getInitials(resource.employee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="truncate text-sm font-medium">
                        {resource.employee.name}
                      </span>
                      {/* Conflict Badge */}
                      {hasConflicts && (
                        <ConflictBadge conflicts={employeeConflicts} size="sm" />
                      )}
                      {overbooked && !hasConflicts && (
                        <AlertTriangle className="h-3 w-3 shrink-0 text-red-500" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {resource.employee.role}
                    </span>
                  </div>
                </div>

                {/* Task Count */}
                <div
                  className="px-2 text-center font-mono text-sm"
                  style={{ width: GRID_COLUMNS.tasks }}
                >
                  {resource.tasks.length}
                </div>

                {/* Total Days */}
                <div
                  className={cn(
                    'px-2 text-center font-mono text-sm',
                    overbooked && 'font-semibold text-red-600 dark:text-red-400'
                  )}
                  style={{ width: GRID_COLUMNS.days }}
                >
                  {resource.totalDays}
                </div>
              </div>
            )
          })}

          {/* Empty state if no resources */}
          {resources.length === 0 && (
            <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
              Geen medewerkers toegewezen
            </div>
          )}
        </div>

        {/* Timeline Body */}
        <div
          className="relative flex-1 overflow-x-auto overflow-y-hidden"
          onScroll={onScroll}
        >
          <div
            className="relative"
            style={{
              width: timelineWidth,
              height: resources.length * ROW_HEIGHT,
            }}
          >
            {/* Weekend Columns */}
            {viewOptions.showWeekends &&
              timelineDays.map((day, i) => {
                const isWeekend = day.getDay() === 0 || day.getDay() === 6
                if (!isWeekend) return null
                return (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 bg-zinc-200/30 dark:bg-zinc-700/20"
                    style={{
                      left: i * timelineConfig.columnWidth,
                      width: timelineConfig.columnWidth,
                    }}
                  />
                )
              })}

            {/* Conflict Highlight Zones */}
            {resources.map((resource, rowIndex) => {
              const conflictRanges = conflictRangesByEmployee.get(resource.employee.id) || []
              return conflictRanges.map((range, rangeIndex) => (
                <div
                  key={`conflict-${resource.employee.id}-${rangeIndex}`}
                  className="absolute bg-orange-200/30 dark:bg-orange-800/20 border-l-2 border-r-2 border-orange-400"
                  style={{
                    left: range.left,
                    top: rowIndex * ROW_HEIGHT,
                    width: range.width,
                    height: ROW_HEIGHT,
                  }}
                />
              ))
            })}

            {/* Today Line */}
            {viewOptions.showTodayLine && todayPosition > 0 && (
              <div
                className="absolute top-0 bottom-0 z-10 w-0.5 bg-blue-500"
                style={{ left: todayPosition }}
              />
            )}

            {/* Row Lines */}
            {resources.map((_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-b border-border"
                style={{ top: (i + 1) * ROW_HEIGHT - 1 }}
              />
            ))}

            {/* Task Bars per Resource */}
            {resources.map((resource, rowIndex) => (
              <React.Fragment key={resource.employee.id}>
                {resource.tasks.map(({ task, assignment }) => {
                  const { left, width } = getTaskBarPosition(task)
                  const isSelected = selectedTaskId === task.id
                  const barHeight = 24
                  const barTop = rowIndex * ROW_HEIGHT + (ROW_HEIGHT - barHeight) / 2

                  return (
                    <div
                      key={`${resource.employee.id}-${task.id}`}
                      className={cn(
                        'group absolute cursor-pointer rounded transition-all',
                        isSelected
                          ? 'ring-2 ring-blue-500 ring-offset-1'
                          : 'hover:brightness-95'
                      )}
                      style={{
                        left,
                        top: barTop,
                        width: Math.max(width, 8),
                        height: barHeight,
                        backgroundColor: resource.employee.color,
                        opacity: task.status === 'done' ? 0.6 : 1,
                      }}
                      onClick={() => onTaskSelect(task.id)}
                      onDoubleClick={() => onTaskDoubleClick(task.id)}
                    >
                      {/* Progress overlay */}
                      {viewOptions.showProgress && task.progress > 0 && task.progress < 100 && (
                        <div
                          className="absolute left-0 top-0 bottom-0 rounded-l bg-black/20"
                          style={{ width: `${task.progress}%` }}
                        />
                      )}

                      {/* Task name (if wide enough) */}
                      {width > 60 && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 truncate text-xs font-medium text-white"
                          style={{ maxWidth: width - 16 }}
                        >
                          {task.name}
                        </span>
                      )}

                      {/* Tooltip */}
                      <div className="pointer-events-none absolute bottom-full left-0 mb-1 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-zinc-200 dark:text-zinc-900">
                        <div className="font-medium">{task.name}</div>
                        <div className="text-zinc-300 dark:text-zinc-600">
                          {assignment.plannedHours}u gepland / {assignment.actualHours}u gewerkt
                        </div>
                      </div>
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
