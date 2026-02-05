import * as React from 'react'
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { GanttPanel } from './GanttPanel'
import { SchedulerPanel } from './SchedulerPanel'
import { GanttToolbar } from './GanttToolbar'
import { ProjectHeader } from './ProjectHeader'
import { TaskEditor } from './TaskEditor'
import { useCriticalPath, useUpdateTaskDates, useUndoTaskChanges, useRedoTaskChanges } from '@/queries/tasks'
import { useTaskHistoryStore } from '@/stores/task-history-store'
import { useToast } from '@/components/ui/toast'
import { useRealtimeTasks } from '@/hooks/use-realtime-tasks'
import { usePresence } from '@/hooks/use-presence'
import { addDaysToDate, pixelsToDays } from './utils/snap'
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
// Types
// =============================================================================

interface ResizingTaskState {
  taskId: string
  handle: 'start' | 'end'
  originalStart: string
  originalEnd: string
  startX: number
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
  // Toast
  // ---------------------------------------------------------------------------
  const { addToast } = useToast()

  // ---------------------------------------------------------------------------
  // Update Task Dates Mutation
  // ---------------------------------------------------------------------------
  const updateTaskDates = useUpdateTaskDates()

  // ---------------------------------------------------------------------------
  // Undo/Redo
  // ---------------------------------------------------------------------------
  const canUndo = useTaskHistoryStore((state) => state.canUndo)
  const canRedo = useTaskHistoryStore((state) => state.canRedo)
  const undoMutation = useUndoTaskChanges()
  const redoMutation = useRedoTaskChanges()

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [zoomLevel, setZoomLevel] = React.useState<GanttZoomLevel>('day')
  const [viewOptions, setViewOptions] = React.useState<ViewOptions>({
    showDependencies: true,
    showProgress: true,
    showTodayLine: true,
    showWeekends: true,
    showBaseline: true,
  })
  const [showCriticalPath, setShowCriticalPath] = React.useState(false)
  const [splitRatio, setSplitRatio] = React.useState(60) // Gantt gets 60%
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null)
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  const [scrollLeft, setScrollLeft] = React.useState(0)

  // Drag state
  const [activeTaskId, setActiveTaskId] = React.useState<string | null>(null)
  const [dragPreview, setDragPreview] = React.useState<{
    taskId: string
    newStartDate: string
    newEndDate: string
  } | null>(null)

  // Resize state
  const [resizingTask, setResizingTask] = React.useState<ResizingTaskState | null>(null)

  // Refs for synchronized scrolling
  const ganttTimelineRef = React.useRef<HTMLDivElement>(null)
  const schedulerTimelineRef = React.useRef<HTMLDivElement>(null)
  const isDraggingSplitter = React.useRef(false)

  // ---------------------------------------------------------------------------
  // Critical Path Query
  // ---------------------------------------------------------------------------

  const { data: criticalPathData } = useCriticalPath(project.tasks)

  // ---------------------------------------------------------------------------
  // Real-Time Updates
  // ---------------------------------------------------------------------------

  // Subscribe to real-time task changes
  useRealtimeTasks(project.id)

  // Track user presence and what they're viewing
  const { setViewingTask } = usePresence(project.id)

  // Update presence when task selection changes
  React.useEffect(() => {
    setViewingTask(selectedTaskId)
  }, [selectedTaskId, setViewingTask])

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
      year: 20,
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
  // DnD Kit Sensors
  // ---------------------------------------------------------------------------

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // 5px movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  )

  // ---------------------------------------------------------------------------
  // Drag Handlers
  // ---------------------------------------------------------------------------

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string)
  }, [])

  const handleDragMove = React.useCallback((event: DragMoveEvent) => {
    if (!activeTaskId) return

    const { delta } = event
    const task = project.tasks.find(t => t.id === activeTaskId)
    if (!task) return

    // Calculate new dates based on drag delta
    const daysMoved = pixelsToDays(delta.x, timelineConfig.columnWidth)

    if (daysMoved !== 0) {
      const newStartDate = addDaysToDate(task.startDate, daysMoved)
      const newEndDate = addDaysToDate(task.endDate, daysMoved)

      setDragPreview({
        taskId: activeTaskId,
        newStartDate,
        newEndDate,
      })
    } else {
      setDragPreview(null)
    }
  }, [activeTaskId, project.tasks, timelineConfig.columnWidth])

  const handleDragEnd = React.useCallback(async (_event: DragEndEvent) => {
    if (!dragPreview) {
      setActiveTaskId(null)
      return
    }

    // Update task dates
    try {
      await updateTaskDates.mutateAsync({
        taskId: dragPreview.taskId,
        projectId: project.id,
        startDate: dragPreview.newStartDate,
        endDate: dragPreview.newEndDate,
      })

      // Call the prop callback if provided
      onTaskDatesChange?.(dragPreview.taskId, dragPreview.newStartDate, dragPreview.newEndDate)

      addToast({
        type: 'success',
        title: 'Taak verplaatst',
        description: 'De taakdatums zijn bijgewerkt.',
      })
    } catch {
      addToast({
        type: 'error',
        title: 'Fout bij verplaatsen',
        description: 'Kon de taak niet verplaatsen. Probeer het opnieuw.',
      })
    }

    setActiveTaskId(null)
    setDragPreview(null)
  }, [dragPreview, project.id, updateTaskDates, onTaskDatesChange, addToast])

  // ---------------------------------------------------------------------------
  // Resize Handlers
  // ---------------------------------------------------------------------------

  const handleResizeStart = React.useCallback((taskId: string, handle: 'start' | 'end', startX: number) => {
    const task = project.tasks.find(t => t.id === taskId)
    if (!task) return

    setResizingTask({
      taskId,
      handle,
      originalStart: task.startDate,
      originalEnd: task.endDate,
      startX,
    })
  }, [project.tasks])

  // Mouse move handler for resize - use ref to capture current state
  const resizingTaskRef = React.useRef<ResizingTaskState | null>(null)

  // Sync ref with state in effect to avoid React Compiler warning
  React.useEffect(() => {
    resizingTaskRef.current = resizingTask
  }, [resizingTask])

  React.useEffect(() => {
    if (!resizingTask) return

    function handleMouseMove(e: MouseEvent) {
      const currentResizing = resizingTaskRef.current
      if (!currentResizing) return

      const deltaX = e.clientX - currentResizing.startX
      const daysDelta = pixelsToDays(deltaX, timelineConfig.columnWidth)

      let newStartDate = currentResizing.originalStart
      let newEndDate = currentResizing.originalEnd

      if (currentResizing.handle === 'start') {
        newStartDate = addDaysToDate(currentResizing.originalStart, daysDelta)
        // Don't allow start after end (minimum 1 day duration)
        const newStartMs = new Date(newStartDate).getTime()
        const endMs = new Date(newEndDate).getTime()
        if (newStartMs >= endMs) {
          newStartDate = addDaysToDate(newEndDate, -1)
        }
      } else {
        newEndDate = addDaysToDate(currentResizing.originalEnd, daysDelta)
        // Don't allow end before start (minimum 1 day duration)
        const startMs = new Date(newStartDate).getTime()
        const newEndMs = new Date(newEndDate).getTime()
        if (newEndMs <= startMs) {
          newEndDate = addDaysToDate(newStartDate, 1)
        }
      }

      setDragPreview({
        taskId: currentResizing.taskId,
        newStartDate,
        newEndDate,
      })
    }

    async function handleMouseUp() {
      const currentPreview = dragPreview
      if (currentPreview) {
        // Apply the resize
        try {
          await updateTaskDates.mutateAsync({
            taskId: currentPreview.taskId,
            projectId: project.id,
            startDate: currentPreview.newStartDate,
            endDate: currentPreview.newEndDate,
          })

          // Call the prop callback if provided
          onTaskDatesChange?.(currentPreview.taskId, currentPreview.newStartDate, currentPreview.newEndDate)

          addToast({
            type: 'success',
            title: 'Taakduur aangepast',
            description: 'De taakdatums zijn bijgewerkt.',
          })
        } catch {
          addToast({
            type: 'error',
            title: 'Fout bij aanpassen',
            description: 'Kon de taak niet aanpassen. Probeer het opnieuw.',
          })
        }
      }

      setResizingTask(null)
      setDragPreview(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizingTask, dragPreview, timelineConfig.columnWidth, project.id, updateTaskDates, onTaskDatesChange, addToast])

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
  // Keyboard Shortcuts for Undo/Redo
  // ---------------------------------------------------------------------------

  React.useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Don't trigger in input fields
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      // Undo: Ctrl+Z (not Shift)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo() && !undoMutation.isPending) {
          try {
            const entry = await undoMutation.mutateAsync(project.id)
            addToast({
              type: 'info',
              title: 'Ongedaan gemaakt',
              description: entry.description,
            })
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Fout bij ongedaan maken'
            addToast({
              type: 'error',
              title: 'Fout',
              description: message,
            })
          }
        }
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey) || (e.key === 'Z' && e.shiftKey))) {
        e.preventDefault()
        if (canRedo() && !redoMutation.isPending) {
          try {
            const entry = await redoMutation.mutateAsync(project.id)
            addToast({
              type: 'info',
              title: 'Opnieuw uitgevoerd',
              description: entry.description,
            })
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Fout bij opnieuw uitvoeren'
            addToast({
              type: 'error',
              title: 'Fout',
              description: message,
            })
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [project.id, canUndo, canRedo, undoMutation, redoMutation, addToast])

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
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full flex-col bg-background">
        {/* Project Header */}
        <ProjectHeader
          project={project}
          stats={stats}
          criticalPathData={showCriticalPath ? criticalPathData : undefined}
          onBack={onBack}
          onEdit={onEditProject}
          onDelete={onDeleteProject}
          onClientClick={onClientClick}
        />

        {/* Toolbar */}
        <GanttToolbar
          projectId={project.id}
          tasks={project.tasks}
          projectName={project.name}
          zoomLevel={zoomLevel}
          viewOptions={viewOptions}
          showCriticalPath={showCriticalPath}
          onZoomChange={setZoomLevel}
          onViewOptionsChange={setViewOptions}
          onShowCriticalPathChange={setShowCriticalPath}
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
              criticalPathData={criticalPathData}
              showCriticalPath={showCriticalPath}
              onScroll={handleTimelineScroll}
              onTaskSelect={handleTaskSelect}
              onTaskDoubleClick={handleTaskDoubleClick}
              onTaskDatesChange={onTaskDatesChange}
              onZoomChange={setZoomLevel}
              activeTaskId={activeTaskId}
              dragPreview={dragPreview}
              onResizeStart={handleResizeStart}
              resizingTaskId={resizingTask?.taskId ?? null}
              resizeHandle={resizingTask?.handle ?? null}
            />
          </div>

          {/* Resizable Splitter */}
          <div
            className="group absolute left-0 right-0 z-10 flex h-2 cursor-row-resize items-center justify-center bg-border hover:bg-zinc-300 dark:hover:bg-zinc-600"
            style={{ top: `calc(${splitRatio}% - 4px)` }}
            onMouseDown={handleSplitterMouseDown}
          >
            <div className="h-0.5 w-12 rounded-full bg-zinc-400 transition-all group-hover:w-20 group-hover:bg-zinc-500 dark:bg-zinc-500 dark:group-hover:bg-zinc-400" />
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
            projectId={project.id}
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
    </DndContext>
  )
}
