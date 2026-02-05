import * as React from 'react'
import { ChevronDown, ChevronRight, Diamond } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TimelineHeader } from './TimelineHeader'
import { DraggableTaskBar } from './DraggableTaskBar'
import { GhostTaskBar } from './GhostTaskBar'
import { DependencyArrow } from './DependencyArrow'
import { GanttLegend } from './GanttLegend'
import { BaselineTaskBar } from './BaselineTaskBar'
import { VarianceIndicator } from './VarianceIndicator'
import type { TimelineConfig, ViewOptions, GanttZoomLevel } from './types'
import type { Task, TaskDependency, DependencyType } from '@/types/projects'
import type { CriticalPathResult } from '@/lib/scheduling/critical-path'

// =============================================================================
// Props
// =============================================================================

interface GanttPanelProps {
  tasks: Task[]
  timelineConfig: TimelineConfig
  viewOptions: ViewOptions
  selectedTaskId: string | null
  recentlyChangedTaskIds?: Set<string>
  scrollLeft: number
  timelineRef: React.RefObject<HTMLDivElement | null>
  criticalPathData?: CriticalPathResult
  showCriticalPath: boolean
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void
  onTaskSelect: (taskId: string) => void
  onTaskDoubleClick: (taskId: string) => void
  onTaskDatesChange?: (taskId: string, startDate: string, endDate: string) => void
  onZoomChange?: (level: GanttZoomLevel) => void
  // Drag & drop props
  activeTaskId?: string | null
  dragPreview?: {
    taskId: string
    newStartDate: string
    newEndDate: string
  } | null
  // Resize props
  onResizeStart?: (taskId: string, handle: 'start' | 'end', startX: number) => void
  resizingTaskId?: string | null
  resizeHandle?: 'start' | 'end' | null
}

// =============================================================================
// Constants
// =============================================================================

const GRID_COLUMNS = {
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

const GRID_WIDTH = Object.values(GRID_COLUMNS).reduce((a, b) => a + b, 0)
const ROW_HEIGHT = 36

// =============================================================================
// Types
// =============================================================================

interface DependencyArrowData {
  id: string
  predecessorId: string
  successorId: string
  type: DependencyType
  fromX: number
  fromY: number
  toX: number
  toY: number
}

// =============================================================================
// Component
// =============================================================================

export function GanttPanel({
  tasks,
  timelineConfig,
  viewOptions,
  selectedTaskId,
  recentlyChangedTaskIds = new Set(),
  scrollLeft: _scrollLeft,
  timelineRef,
  criticalPathData,
  showCriticalPath,
  onScroll,
  onTaskSelect,
  onTaskDoubleClick,
  onTaskDatesChange: _onTaskDatesChange,
  onZoomChange,
  activeTaskId,
  dragPreview,
  onResizeStart,
  resizingTaskId,
  resizeHandle: _resizeHandle,
}: GanttPanelProps) {
  // Note: scrollLeft and onTaskDatesChange are passed for callback usage
  void _scrollLeft
  void _onTaskDatesChange
  void _resizeHandle

  const [expandedTasks, setExpandedTasks] = React.useState<Set<string>>(new Set())
  const [hoveredDependencyId, setHoveredDependencyId] = React.useState<string | null>(null)

  // ---------------------------------------------------------------------------
  // Build Hierarchical Task List
  // ---------------------------------------------------------------------------

  const { flatTasks, taskDepthMap } = React.useMemo(() => {
    const depthMap = new Map<string, number>()
    const flat: Task[] = []

    // Build parent-children map
    const childrenMap = new Map<string | null, Task[]>()
    tasks.forEach((task) => {
      const parentId = task.parentId
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, [])
      }
      childrenMap.get(parentId)!.push(task)
    })

    // Recursive function to flatten with depth
    const addTasksRecursively = (parentId: string | null, depth: number) => {
      const children = childrenMap.get(parentId) || []
      children.sort((a, b) => a.sortOrder - b.sortOrder)

      children.forEach((task) => {
        depthMap.set(task.id, depth)
        flat.push(task)

        // Only add children if parent is expanded (or no children)
        const hasChildren = childrenMap.has(task.id)
        if (hasChildren && (expandedTasks.has(task.id) || depth === 0)) {
          addTasksRecursively(task.id, depth + 1)
        }
      })
    }

    addTasksRecursively(null, 0)

    return { flatTasks: flat, taskDepthMap: depthMap }
  }, [tasks, expandedTasks])

  // Check if task has children
  const hasChildren = React.useCallback(
    (taskId: string) => {
      return tasks.some((t) => t.parentId === taskId)
    },
    [tasks]
  )

  // Toggle expand
  const toggleExpand = (taskId: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })
  }

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
  const getTaskBarPosition = React.useCallback(
    (task: Task) => {
      const startDate = new Date(task.startDate)
      const dayOffset = Math.floor(
        (startDate.getTime() - timelineConfig.startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      const left = dayOffset * timelineConfig.columnWidth
      const width = task.duration * timelineConfig.columnWidth

      return { left, width }
    },
    [timelineConfig.startDate, timelineConfig.columnWidth]
  )

  // Calculate baseline bar position
  const getBaselinePosition = React.useCallback(
    (task: Task) => {
      if (!task.isBaselineSet || !task.baselineStartDate || !task.baselineDuration) {
        return null
      }
      const startDate = new Date(task.baselineStartDate)
      const dayOffset = Math.floor(
        (startDate.getTime() - timelineConfig.startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      const left = dayOffset * timelineConfig.columnWidth
      const width = task.baselineDuration * timelineConfig.columnWidth

      return { left, width }
    },
    [timelineConfig.startDate, timelineConfig.columnWidth]
  )

  // Calculate position for preview dates
  const getPreviewPosition = React.useCallback((startDateStr: string, endDateStr: string) => {
    const startDate = new Date(startDateStr)
    const endDate = new Date(endDateStr)
    const dayOffset = Math.floor(
      (startDate.getTime() - timelineConfig.startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const left = dayOffset * timelineConfig.columnWidth
    const width = duration * timelineConfig.columnWidth

    return { left, width }
  }, [timelineConfig.startDate, timelineConfig.columnWidth])

  // Get today's position
  const todayPosition = React.useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dayOffset = Math.floor(
      (today.getTime() - timelineConfig.startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    return dayOffset * timelineConfig.columnWidth
  }, [timelineConfig])

  // ---------------------------------------------------------------------------
  // Dependency Arrows Calculation
  // ---------------------------------------------------------------------------

  const dependencyArrows = React.useMemo<DependencyArrowData[]>(() => {
    if (!viewOptions.showDependencies) return []

    const arrows: DependencyArrowData[] = []

    flatTasks.forEach((task, rowIndex) => {
      task.dependencies.forEach((dep: TaskDependency) => {
        const predecessorIndex = flatTasks.findIndex((t) => t.id === dep.predecessorId)
        if (predecessorIndex === -1) return

        const predecessor = flatTasks[predecessorIndex]
        const predPos = getTaskBarPosition(predecessor)
        const taskPos = getTaskBarPosition(task)

        // Calculate start and end points based on dependency type
        let fromX: number
        let toX: number

        switch (dep.type) {
          case 'FS': // Finish-to-Start (most common)
            fromX = predPos.left + predPos.width
            toX = taskPos.left
            break
          case 'SS': // Start-to-Start
            fromX = predPos.left
            toX = taskPos.left
            break
          case 'FF': // Finish-to-Finish
            fromX = predPos.left + predPos.width
            toX = taskPos.left + taskPos.width
            break
          case 'SF': // Start-to-Finish
            fromX = predPos.left
            toX = taskPos.left + taskPos.width
            break
          default:
            fromX = predPos.left + predPos.width
            toX = taskPos.left
        }

        arrows.push({
          id: dep.id,
          predecessorId: dep.predecessorId,
          successorId: task.id,
          type: dep.type,
          fromX,
          fromY: predecessorIndex * ROW_HEIGHT + ROW_HEIGHT / 2,
          toX,
          toY: rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2,
        })
      })
    })

    return arrows
  }, [flatTasks, getTaskBarPosition, viewOptions.showDependencies])

  // ---------------------------------------------------------------------------
  // Hovered Dependency Info (for task highlighting)
  // ---------------------------------------------------------------------------

  const hoveredDependency = React.useMemo(() => {
    if (!hoveredDependencyId) return null
    return dependencyArrows.find((a) => a.id === hoveredDependencyId) || null
  }, [hoveredDependencyId, dependencyArrows])

  // Check if a task should be highlighted due to hovered dependency
  const isTaskHighlightedByDependency = React.useCallback(
    (taskId: string) => {
      if (!hoveredDependency) return false
      return (
        hoveredDependency.predecessorId === taskId || hoveredDependency.successorId === taskId
      )
    },
    [hoveredDependency]
  )

  // ---------------------------------------------------------------------------
  // Format Helpers
  // ---------------------------------------------------------------------------

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Default resize handler if not provided
  const handleResizeStart = React.useCallback((taskId: string, handle: 'start' | 'end', startX: number) => {
    if (onResizeStart) {
      onResizeStart(taskId, handle, startX)
    }
  }, [onResizeStart])

  // ---------------------------------------------------------------------------
  // Mouse Wheel Zoom Handler
  // ---------------------------------------------------------------------------

  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    // Alleen zoomen als Ctrl ingedrukt is
    if (e.ctrlKey && onZoomChange) {
      e.preventDefault()

      const zoomOrder: GanttZoomLevel[] = ['day', 'week', 'month', 'year']
      const currentIndex = zoomOrder.indexOf(timelineConfig.zoomLevel)

      if (e.deltaY < 0 && currentIndex > 0) {
        // Scroll up = zoom in (meer detail)
        onZoomChange(zoomOrder[currentIndex - 1])
      } else if (e.deltaY > 0 && currentIndex < zoomOrder.length - 1) {
        // Scroll down = zoom out (minder detail)
        onZoomChange(zoomOrder[currentIndex + 1])
      }
    }
  }, [timelineConfig.zoomLevel, onZoomChange])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex h-full flex-col">
      {/* Header Row */}
      <div className="flex shrink-0 border-b border-border bg-zinc-50 dark:bg-zinc-900">
        {/* Grid Header */}
        <div className="shrink-0 border-r border-border" style={{ width: GRID_WIDTH }}>
          <div className="flex h-10 items-center text-xs font-medium text-muted-foreground">
            <div className="px-1" style={{ width: GRID_COLUMNS.expand }} />
            <div className="px-1" style={{ width: GRID_COLUMNS.wbs }}>
              WBS
            </div>
            <div className="px-2" style={{ width: GRID_COLUMNS.task }}>
              Taak
            </div>
            <div className="px-1 text-center" style={{ width: GRID_COLUMNS.start }}>
              Start
            </div>
            <div className="px-1 text-center" style={{ width: GRID_COLUMNS.end }}>
              Eind
            </div>
            <div className="px-1 text-center" style={{ width: GRID_COLUMNS.duration }}>
              Duur
            </div>
            <div className="px-1 text-center" style={{ width: GRID_COLUMNS.progress }}>
              %
            </div>
            <div className="px-1 text-center" style={{ width: GRID_COLUMNS.slack }}>
              Slack
            </div>
            <div className="px-1" style={{ width: GRID_COLUMNS.resources }}>
              Resources
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
          {flatTasks.map((task) => {
            const depth = taskDepthMap.get(task.id) || 0
            const isExpanded = expandedTasks.has(task.id)
            const isSelected = selectedTaskId === task.id
            const taskHasChildren = hasChildren(task.id)
            const isRecentlyChanged = recentlyChangedTaskIds.has(task.id)
            const criticalPathInfo = showCriticalPath ? criticalPathData?.scheduleInfo.get(task.id) : undefined
            const isDependencyHighlighted = isTaskHighlightedByDependency(task.id)

            // Show preview dates if task is being dragged or resized
            const isBeingModified = (activeTaskId === task.id || resizingTaskId === task.id) && dragPreview?.taskId === task.id
            const displayStartDate = isBeingModified && dragPreview ? dragPreview.newStartDate : task.startDate
            const displayEndDate = isBeingModified && dragPreview ? dragPreview.newEndDate : task.endDate

            return (
              <div
                key={task.id}
                className={cn(
                  'flex items-center border-b border-border transition-colors',
                  isRecentlyChanged && 'animate-pulse bg-orange-50 dark:bg-orange-900/20',
                  isDependencyHighlighted &&
                    !isRecentlyChanged &&
                    'bg-blue-50 dark:bg-blue-900/20',
                  isSelected &&
                    !isRecentlyChanged &&
                    !isDependencyHighlighted &&
                    'bg-zinc-100 dark:bg-zinc-800',
                  !isSelected &&
                    !isRecentlyChanged &&
                    !isDependencyHighlighted &&
                    'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                )}
                style={{ height: ROW_HEIGHT }}
                onClick={() => onTaskSelect(task.id)}
                onDoubleClick={() => onTaskDoubleClick(task.id)}
              >
                {/* Expand/Collapse */}
                <div
                  className="flex items-center justify-center"
                  style={{ width: GRID_COLUMNS.expand, paddingLeft: depth * 12 }}
                >
                  {taskHasChildren ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleExpand(task.id)
                      }}
                      className="rounded p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                  ) : (
                    <span className="w-3.5" />
                  )}
                </div>

                {/* WBS */}
                <div
                  className="truncate px-1 font-mono text-xs text-muted-foreground"
                  style={{ width: GRID_COLUMNS.wbs }}
                >
                  {task.wbs}
                </div>

                {/* Task Name */}
                <div
                  className={cn('flex items-center gap-1 px-2 text-sm', task.isSummary && 'font-medium')}
                  style={{ width: GRID_COLUMNS.task }}
                >
                  {task.isMilestone && <Diamond className="mr-1 inline h-3 w-3 fill-current" />}
                  <span className="truncate flex-1">{task.name}</span>
                  {task.isBaselineSet && viewOptions.showBaseline && (
                    <div className="flex gap-0.5 shrink-0">
                      <VarianceIndicator varianceDays={task.varianceStartDays} type="start" />
                      <VarianceIndicator varianceDays={task.varianceEndDays} type="end" />
                    </div>
                  )}
                </div>

                {/* Start Date */}
                <div
                  className={cn(
                    'px-1 text-center font-mono text-xs',
                    isRecentlyChanged || isBeingModified
                      ? 'font-medium text-orange-600 dark:text-orange-400'
                      : 'text-muted-foreground'
                  )}
                  style={{ width: GRID_COLUMNS.start }}
                >
                  {formatDate(displayStartDate)}
                </div>

                {/* End Date */}
                <div
                  className={cn(
                    'px-1 text-center font-mono text-xs',
                    isRecentlyChanged || isBeingModified
                      ? 'font-medium text-orange-600 dark:text-orange-400'
                      : 'text-muted-foreground'
                  )}
                  style={{ width: GRID_COLUMNS.end }}
                >
                  {formatDate(displayEndDate)}
                </div>

                {/* Duration */}
                <div
                  className="px-1 text-center font-mono text-xs text-muted-foreground"
                  style={{ width: GRID_COLUMNS.duration }}
                >
                  {task.duration}d
                </div>

                {/* Progress */}
                <div
                  className="flex items-center justify-center px-1"
                  style={{ width: GRID_COLUMNS.progress }}
                >
                  <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        task.progress === 100
                          ? 'bg-green-500'
                          : 'bg-zinc-800 dark:bg-zinc-200'
                      )}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>

                {/* Slack Column */}
                <div
                  className={cn(
                    'px-1 text-center font-mono text-xs',
                    criticalPathInfo?.isCritical
                      ? 'font-semibold text-red-500'
                      : 'text-muted-foreground'
                  )}
                  style={{ width: GRID_COLUMNS.slack }}
                >
                  {showCriticalPath && criticalPathInfo
                    ? criticalPathInfo.isCritical
                      ? '0d'
                      : `${criticalPathInfo.totalFloat}d`
                    : '-'}
                </div>

                {/* Resources */}
                <div
                  className="flex items-center gap-0.5 px-1"
                  style={{ width: GRID_COLUMNS.resources }}
                >
                  {task.assignments.slice(0, 3).map((assignment) => (
                    <Avatar key={assignment.id} className="h-5 w-5">
                      <AvatarFallback
                        className="text-[8px] font-medium text-white"
                        style={{ backgroundColor: assignment.employeeColor }}
                      >
                        {getInitials(assignment.employeeName)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {task.assignments.length > 3 && (
                    <span className="ml-0.5 text-xs text-muted-foreground">
                      +{task.assignments.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Timeline Body */}
        <div
          className="relative flex-1 overflow-x-auto overflow-y-hidden"
          style={{ scrollBehavior: 'auto' }}
          onScroll={onScroll}
          onWheel={handleWheel}
        >
          <div
            className="relative"
            style={{
              width: timelineWidth,
              height: flatTasks.length * ROW_HEIGHT,
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
                    className="absolute bottom-0 top-0 bg-zinc-100/50 dark:bg-zinc-800/30"
                    style={{
                      left: i * timelineConfig.columnWidth,
                      width: timelineConfig.columnWidth,
                    }}
                  />
                )
              })}

            {/* Today Line */}
            {viewOptions.showTodayLine && todayPosition > 0 && (
              <div
                className="absolute bottom-0 top-0 z-10 w-0.5 bg-blue-500"
                style={{ left: todayPosition }}
              >
                <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-blue-500" />
              </div>
            )}

            {/* Row Lines */}
            {flatTasks.map((task, index) => (
              <div
                key={`rowline-${task.id}`}
                className="absolute left-0 right-0 border-b border-border"
                style={{ top: (index + 1) * ROW_HEIGHT - 1 }}
              />
            ))}

            {/* Baseline bars (shown behind task bars) */}
            {viewOptions.showBaseline && flatTasks.map((task, rowIndex) => {
              const baselinePosition = getBaselinePosition(task)
              if (!baselinePosition) return null

              return (
                <BaselineTaskBar
                  key={`baseline-${task.id}`}
                  left={baselinePosition.left}
                  width={baselinePosition.width}
                  top={rowIndex * ROW_HEIGHT}
                  height={ROW_HEIGHT}
                  visible={true}
                />
              )
            })}

            {/* Ghost bars showing original position during drag/resize */}
            {(activeTaskId || resizingTaskId) && flatTasks.map((task, rowIndex) => {
              const isDragging = activeTaskId === task.id
              const isResizing = resizingTaskId === task.id

              if (!isDragging && !isResizing) return null

              return (
                <GhostTaskBar
                  key={`ghost-${task.id}`}
                  task={task}
                  timelineConfig={timelineConfig}
                  rowHeight={ROW_HEIGHT}
                  rowIndex={rowIndex}
                />
              )
            })}

            {/* Task Bars */}
            {flatTasks.map((task, rowIndex) => {
              const isDragging = activeTaskId === task.id
              const isResizing = resizingTaskId === task.id
              const isSelected = selectedTaskId === task.id
              const isRecentlyChanged = recentlyChangedTaskIds.has(task.id)
              const criticalPathInfo = showCriticalPath ? criticalPathData?.scheduleInfo.get(task.id) : undefined
              const isDependencyHighlighted = isTaskHighlightedByDependency(task.id)

              // Calculate position based on drag/resize preview or original position
              let position: { left: number; width: number }
              if ((isDragging || isResizing) && dragPreview?.taskId === task.id) {
                position = getPreviewPosition(dragPreview.newStartDate, dragPreview.newEndDate)
              } else {
                position = getTaskBarPosition(task)
              }

              return (
                <DraggableTaskBar
                  key={task.id}
                  task={task}
                  left={position.left}
                  width={position.width}
                  top={rowIndex * ROW_HEIGHT}
                  height={ROW_HEIGHT}
                  isSelected={isSelected}
                  isHighlighted={isRecentlyChanged}
                  isDependencyHighlighted={isDependencyHighlighted}
                  showProgress={viewOptions.showProgress}
                  criticalPathInfo={criticalPathInfo}
                  isDragging={isDragging || isResizing}
                  dragPreview={(isDragging || isResizing) && dragPreview?.taskId === task.id ? dragPreview : null}
                  onClick={() => onTaskSelect(task.id)}
                  onDoubleClick={() => onTaskDoubleClick(task.id)}
                  onResizeStart={handleResizeStart}
                />
              )
            })}

            {/* Dependency Arrows */}
            {viewOptions.showDependencies &&
              dependencyArrows.map((arrow) => (
                <DependencyArrow
                  key={arrow.id}
                  fromX={arrow.fromX}
                  fromY={arrow.fromY}
                  toX={arrow.toX}
                  toY={arrow.toY}
                  type={arrow.type}
                  isHighlighted={hoveredDependencyId === arrow.id}
                  onMouseEnter={() => setHoveredDependencyId(arrow.id)}
                  onMouseLeave={() => setHoveredDependencyId(null)}
                />
              ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <GanttLegend showCriticalPath={showCriticalPath} />
    </div>
  )
}
