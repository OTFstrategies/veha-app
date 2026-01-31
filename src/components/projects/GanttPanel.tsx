import * as React from 'react'
import { ChevronDown, ChevronRight, Diamond } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TimelineHeader } from './TimelineHeader'
import { TaskBar } from './TaskBar'
import { DependencyArrow } from './DependencyArrow'
import type { TimelineConfig, ViewOptions } from './types'
import type { Task } from '@/types/projects'

// =============================================================================
// Props
// =============================================================================

interface GanttPanelProps {
  tasks: Task[]
  timelineConfig: TimelineConfig
  viewOptions: ViewOptions
  selectedTaskId: string | null
  scrollLeft: number
  timelineRef: React.RefObject<HTMLDivElement | null>
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void
  onTaskSelect: (taskId: string) => void
  onTaskDoubleClick: (taskId: string) => void
  onTaskDatesChange?: (taskId: string, startDate: string, endDate: string) => void
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
  resources: 96,
}

const GRID_WIDTH = Object.values(GRID_COLUMNS).reduce((a, b) => a + b, 0)
const ROW_HEIGHT = 36

// =============================================================================
// Component
// =============================================================================

export function GanttPanel({
  tasks,
  timelineConfig,
  viewOptions,
  selectedTaskId,
  scrollLeft: _scrollLeft,
  timelineRef,
  onScroll,
  onTaskSelect,
  onTaskDoubleClick,
  onTaskDatesChange: _onTaskDatesChange,
}: GanttPanelProps) {
  // Note: scrollLeft and onTaskDatesChange are passed for future drag implementation
  void _scrollLeft
  void _onTaskDatesChange
  const [expandedTasks, setExpandedTasks] = React.useState<Set<string>>(new Set())

  // ---------------------------------------------------------------------------
  // Build Hierarchical Task List
  // ---------------------------------------------------------------------------

  const { flatTasks, taskDepthMap } = React.useMemo(() => {
    const depthMap = new Map<string, number>()
    const flat: Task[] = []

    // Build parent-children map
    const childrenMap = new Map<string | null, Task[]>()
    tasks.forEach(task => {
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

      children.forEach(task => {
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
  const hasChildren = React.useCallback((taskId: string) => {
    return tasks.some(t => t.parentId === taskId)
  }, [tasks])

  // Toggle expand
  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => {
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
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex h-full flex-col">
      {/* Header Row */}
      <div className="flex shrink-0 border-b border-border bg-stone-50 dark:bg-stone-900">
        {/* Grid Header */}
        <div
          className="shrink-0 border-r border-border"
          style={{ width: GRID_WIDTH }}
        >
          <div className="flex h-10 items-center text-xs font-medium text-muted-foreground">
            <div className="px-1" style={{ width: GRID_COLUMNS.expand }} />
            <div className="px-1" style={{ width: GRID_COLUMNS.wbs }}>WBS</div>
            <div className="px-2" style={{ width: GRID_COLUMNS.task }}>Taak</div>
            <div className="px-1 text-center" style={{ width: GRID_COLUMNS.start }}>Start</div>
            <div className="px-1 text-center" style={{ width: GRID_COLUMNS.end }}>Eind</div>
            <div className="px-1 text-center" style={{ width: GRID_COLUMNS.duration }}>Duur</div>
            <div className="px-1 text-center" style={{ width: GRID_COLUMNS.progress }}>%</div>
            <div className="px-1" style={{ width: GRID_COLUMNS.resources }}>Resources</div>
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

            return (
              <div
                key={task.id}
                className={cn(
                  'flex items-center border-b border-border transition-colors',
                  isSelected
                    ? 'bg-stone-100 dark:bg-stone-800'
                    : 'hover:bg-stone-50 dark:hover:bg-stone-900'
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
                      className="rounded p-0.5 hover:bg-stone-200 dark:hover:bg-stone-700"
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
                  className={cn(
                    'truncate px-2 text-sm',
                    task.isSummary && 'font-medium'
                  )}
                  style={{ width: GRID_COLUMNS.task }}
                >
                  {task.isMilestone && (
                    <Diamond className="mr-1 inline h-3 w-3 fill-current" />
                  )}
                  {task.name}
                </div>

                {/* Start Date */}
                <div
                  className="px-1 text-center font-mono text-xs text-muted-foreground"
                  style={{ width: GRID_COLUMNS.start }}
                >
                  {formatDate(task.startDate)}
                </div>

                {/* End Date */}
                <div
                  className="px-1 text-center font-mono text-xs text-muted-foreground"
                  style={{ width: GRID_COLUMNS.end }}
                >
                  {formatDate(task.endDate)}
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
                  <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        task.progress === 100
                          ? 'bg-green-500'
                          : 'bg-stone-800 dark:bg-stone-200'
                      )}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
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
                    className="absolute top-0 bottom-0 bg-stone-100/50 dark:bg-stone-800/30"
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
                className="absolute top-0 bottom-0 z-10 w-0.5 bg-blue-500"
                style={{ left: todayPosition }}
              >
                <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-blue-500" />
              </div>
            )}

            {/* Row Lines */}
            {flatTasks.map((_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-b border-border"
                style={{ top: (i + 1) * ROW_HEIGHT - 1 }}
              />
            ))}

            {/* Task Bars */}
            {flatTasks.map((task, rowIndex) => {
              const { left, width } = getTaskBarPosition(task)
              const isSelected = selectedTaskId === task.id

              return (
                <TaskBar
                  key={task.id}
                  task={task}
                  left={left}
                  width={width}
                  top={rowIndex * ROW_HEIGHT}
                  height={ROW_HEIGHT}
                  isSelected={isSelected}
                  showProgress={viewOptions.showProgress}
                  onClick={() => onTaskSelect(task.id)}
                  onDoubleClick={() => onTaskDoubleClick(task.id)}
                />
              )
            })}

            {/* Dependency Arrows */}
            {viewOptions.showDependencies &&
              flatTasks.map((task, rowIndex) =>
                task.dependencies.map((dep) => {
                  const predecessorIndex = flatTasks.findIndex(
                    t => t.id === dep.predecessorId
                  )
                  if (predecessorIndex === -1) return null

                  const predecessor = flatTasks[predecessorIndex]
                  const predPos = getTaskBarPosition(predecessor)
                  const taskPos = getTaskBarPosition(task)

                  return (
                    <DependencyArrow
                      key={dep.id}
                      fromX={predPos.left + predPos.width}
                      fromY={predecessorIndex * ROW_HEIGHT + ROW_HEIGHT / 2}
                      toX={taskPos.left}
                      toY={rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2}
                    />
                  )
                })
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
