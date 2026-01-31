import * as React from 'react'
import { GanttPanel } from './GanttPanel'
import { SchedulerPanel } from './SchedulerPanel'
import { GanttToolbar } from './GanttToolbar'
import { ProjectHeader } from './ProjectHeader'
import { TaskEditor } from './TaskEditor'
import type { GanttZoomLevel, ViewOptions, TimelineConfig } from './types'
import type { Project, Task } from '@/types/projects'

// =============================================================================
// Props
// =============================================================================

export interface ProjectGanttSchedulerProps {
  /** The project to display */
  project: Project
  /** Available employees for the scheduler */
  employees?: Array<{
    id: string
    name: string
    role: string
    color: string
  }>
  /** Called when user wants to edit the project */
  onEditProject?: () => void
  /** Called when user wants to delete the project */
  onDeleteProject?: () => void
  /** Called when user wants to go back */
  onBack?: () => void
  /** Called when task dates change */
  onTaskDatesChange?: (taskId: string, startDate: string, endDate: string) => void
  /** Called when task progress changes */
  onTaskProgressChange?: (taskId: string, progress: number) => void
  /** Called when a task is edited */
  onTaskEdit?: (task: Task) => void
  /** Called when a task is deleted */
  onTaskDelete?: (taskId: string) => void
  /** Called when a new task is added */
  onTaskAdd?: (parentId?: string) => void
  /** Called when user clicks client link */
  onClientClick?: (clientId: string) => void
}

// =============================================================================
// Component
// =============================================================================

export function ProjectGanttScheduler({
  project,
  employees = [],
  onEditProject,
  onDeleteProject,
  onBack,
  onTaskDatesChange,
  onTaskProgressChange: _onTaskProgressChange,
  onTaskEdit,
  onTaskDelete,
  onTaskAdd,
  onClientClick,
}: ProjectGanttSchedulerProps) {
  // Note: onTaskProgressChange is for future slider-based progress updates
  void _onTaskProgressChange
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [zoomLevel, setZoomLevel] = React.useState<GanttZoomLevel>('day')
  const [viewOptions, setViewOptions] = React.useState<ViewOptions>({
    showDependencies: true,
    showProgress: true,
    showTodayLine: true,
    showWeekends: true,
  })
  const [splitRatio, setSplitRatio] = React.useState(60) // Gantt gets 60%
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null)
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  const [scrollLeft, setScrollLeft] = React.useState(0)

  // Refs for synchronized scrolling
  const ganttTimelineRef = React.useRef<HTMLDivElement>(null)
  const schedulerTimelineRef = React.useRef<HTMLDivElement>(null)
  const isDraggingSplitter = React.useRef(false)

  // ---------------------------------------------------------------------------
  // Timeline Configuration
  // ---------------------------------------------------------------------------

  const timelineConfig = React.useMemo<TimelineConfig>(() => {
    const startDate = new Date(project.startDate)
    const endDate = new Date(project.endDate)

    // Add padding to timeline
    startDate.setDate(startDate.getDate() - 7)
    endDate.setDate(endDate.getDate() + 14)

    const columnWidths: Record<GanttZoomLevel, number> = {
      day: 32,
      week: 100,
      month: 80,
      quarter: 120,
    }

    const today = new Date()
    const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    return {
      zoomLevel,
      startDate,
      endDate,
      columnWidth: columnWidths[zoomLevel],
      todayPosition: daysDiff * columnWidths[zoomLevel],
    }
  }, [project.startDate, project.endDate, zoomLevel])

  // ---------------------------------------------------------------------------
  // Synchronized Scrolling
  // ---------------------------------------------------------------------------

  const handleTimelineScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollLeft = e.currentTarget.scrollLeft
    setScrollLeft(newScrollLeft)

    // Sync the other timeline
    if (ganttTimelineRef.current && e.currentTarget !== ganttTimelineRef.current) {
      ganttTimelineRef.current.scrollLeft = newScrollLeft
    }
    if (schedulerTimelineRef.current && e.currentTarget !== schedulerTimelineRef.current) {
      schedulerTimelineRef.current.scrollLeft = newScrollLeft
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Splitter Drag
  // ---------------------------------------------------------------------------

  const handleSplitterMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingSplitter.current = true
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
  }, [])

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSplitter.current) return

      const container = document.getElementById('gantt-scheduler-container')
      if (!container) return

      const rect = container.getBoundingClientRect()
      const relativeY = e.clientY - rect.top
      const newRatio = Math.min(80, Math.max(20, (relativeY / rect.height) * 100))
      setSplitRatio(newRatio)
    }

    const handleMouseUp = () => {
      isDraggingSplitter.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Task Selection
  // ---------------------------------------------------------------------------

  const handleTaskSelect = React.useCallback((taskId: string) => {
    setSelectedTaskId(taskId)
  }, [])

  const handleTaskDoubleClick = React.useCallback((taskId: string) => {
    const task = project.tasks.find(t => t.id === taskId)
    if (task) {
      setEditingTask(task)
    }
  }, [project.tasks])

  // ---------------------------------------------------------------------------
  // Resource Data for Scheduler
  // ---------------------------------------------------------------------------

  const resourceData = React.useMemo(() => {
    // Aggregate tasks by employee
    const employeeTaskMap = new Map<string, {
      employee: typeof employees[0]
      tasks: Array<{
        task: Task
        assignment: Task['assignments'][0]
      }>
      totalDays: number
    }>()

    // Initialize with all employees
    employees.forEach(emp => {
      employeeTaskMap.set(emp.id, {
        employee: emp,
        tasks: [],
        totalDays: 0,
      })
    })

    // Add task assignments
    project.tasks.forEach(task => {
      task.assignments.forEach(assignment => {
        const entry = employeeTaskMap.get(assignment.employeeId)
        if (entry) {
          entry.tasks.push({ task, assignment })
          entry.totalDays += task.duration
        }
      })
    })

    return Array.from(employeeTaskMap.values())
  }, [project.tasks, employees])

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const stats = React.useMemo(() => {
    const total = project.tasks.filter(t => !t.isSummary).length
    const completed = project.tasks.filter(t => t.status === 'done' && !t.isSummary).length
    const inProgress = project.tasks.filter(t => t.status === 'in_progress' && !t.isSummary).length

    return { total, completed, inProgress }
  }, [project.tasks])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Project Header */}
      <ProjectHeader
        project={project}
        stats={stats}
        onBack={onBack}
        onEdit={onEditProject}
        onDelete={onDeleteProject}
        onClientClick={onClientClick}
      />

      {/* Toolbar */}
      <GanttToolbar
        zoomLevel={zoomLevel}
        viewOptions={viewOptions}
        onZoomChange={setZoomLevel}
        onViewOptionsChange={setViewOptions}
        onAddTask={() => onTaskAdd?.()}
        onScrollToToday={() => {
          const todayPos = timelineConfig.todayPosition - 200
          if (ganttTimelineRef.current) {
            ganttTimelineRef.current.scrollLeft = todayPos
          }
          if (schedulerTimelineRef.current) {
            schedulerTimelineRef.current.scrollLeft = todayPos
          }
          setScrollLeft(todayPos)
        }}
      />

      {/* Split Screen Container */}
      <div
        id="gantt-scheduler-container"
        className="relative flex-1 overflow-hidden"
      >
        {/* Gantt Panel (Top) */}
        <div
          className="overflow-hidden border-b border-border"
          style={{ height: `${splitRatio}%` }}
        >
          <GanttPanel
            tasks={project.tasks}
            timelineConfig={timelineConfig}
            viewOptions={viewOptions}
            selectedTaskId={selectedTaskId}
            scrollLeft={scrollLeft}
            timelineRef={ganttTimelineRef}
            onScroll={handleTimelineScroll}
            onTaskSelect={handleTaskSelect}
            onTaskDoubleClick={handleTaskDoubleClick}
            onTaskDatesChange={onTaskDatesChange}
          />
        </div>

        {/* Resizable Splitter */}
        <div
          className="group absolute left-0 right-0 z-10 flex h-2 cursor-row-resize items-center justify-center bg-border hover:bg-stone-300 dark:hover:bg-stone-600"
          style={{ top: `calc(${splitRatio}% - 4px)` }}
          onMouseDown={handleSplitterMouseDown}
        >
          <div className="h-0.5 w-12 rounded-full bg-stone-400 transition-all group-hover:w-20 group-hover:bg-stone-500 dark:bg-stone-500 dark:group-hover:bg-stone-400" />
        </div>

        {/* Scheduler Panel (Bottom) */}
        <div
          className="overflow-hidden"
          style={{ height: `${100 - splitRatio}%` }}
        >
          <SchedulerPanel
            resources={resourceData}
            timelineConfig={timelineConfig}
            viewOptions={viewOptions}
            selectedTaskId={selectedTaskId}
            scrollLeft={scrollLeft}
            timelineRef={schedulerTimelineRef}
            onScroll={handleTimelineScroll}
            onTaskSelect={handleTaskSelect}
            onTaskDoubleClick={handleTaskDoubleClick}
          />
        </div>
      </div>

      {/* Task Editor Side Panel */}
      {editingTask && (
        <TaskEditor
          task={editingTask}
          allTasks={project.tasks}
          employees={employees}
          onSave={(updatedTask) => {
            onTaskEdit?.(updatedTask)
            setEditingTask(null)
          }}
          onClose={() => setEditingTask(null)}
          onDelete={() => {
            onTaskDelete?.(editingTask.id)
            setEditingTask(null)
          }}
        />
      )}
    </div>
  )
}
