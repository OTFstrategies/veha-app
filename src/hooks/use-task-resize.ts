import * as React from 'react'
import { addDaysToDate, pixelsToDays } from '@/components/projects/utils/snap'
import type { Task } from '@/types/projects'

interface ResizingTaskState {
  taskId: string
  handle: 'start' | 'end'
  originalStart: string
  originalEnd: string
  startX: number
}

interface DragPreview {
  taskId: string
  newStartDate: string
  newEndDate: string
}

interface UseTaskResizeOptions {
  tasks: Task[]
  columnWidth: number
  onResizeComplete: (taskId: string, startDate: string, endDate: string) => Promise<void>
  setDragPreview: (preview: DragPreview | null) => void
  dragPreview: DragPreview | null
}

export function useTaskResize({
  tasks,
  columnWidth,
  onResizeComplete,
  setDragPreview,
  dragPreview,
}: UseTaskResizeOptions) {
  const [resizingTask, setResizingTask] = React.useState<ResizingTaskState | null>(null)
  const resizingTaskRef = React.useRef<ResizingTaskState | null>(null)

  // Sync ref with state
  React.useEffect(() => {
    resizingTaskRef.current = resizingTask
  }, [resizingTask])

  const handleResizeStart = React.useCallback((taskId: string, handle: 'start' | 'end', startX: number) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    setResizingTask({
      taskId,
      handle,
      originalStart: task.startDate,
      originalEnd: task.endDate,
      startX,
    })
  }, [tasks])

  React.useEffect(() => {
    if (!resizingTask) return

    function handleMouseMove(e: MouseEvent) {
      const currentResizing = resizingTaskRef.current
      if (!currentResizing) return

      const deltaX = e.clientX - currentResizing.startX
      const daysDelta = pixelsToDays(deltaX, columnWidth)

      let newStartDate = currentResizing.originalStart
      let newEndDate = currentResizing.originalEnd

      if (currentResizing.handle === 'start') {
        newStartDate = addDaysToDate(currentResizing.originalStart, daysDelta)
        const newStartMs = new Date(newStartDate).getTime()
        const endMs = new Date(newEndDate).getTime()
        if (newStartMs >= endMs) {
          newStartDate = addDaysToDate(newEndDate, -1)
        }
      } else {
        newEndDate = addDaysToDate(currentResizing.originalEnd, daysDelta)
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
      if (dragPreview) {
        await onResizeComplete(dragPreview.taskId, dragPreview.newStartDate, dragPreview.newEndDate)
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
  }, [resizingTask, dragPreview, columnWidth, onResizeComplete, setDragPreview])

  return {
    resizingTaskId: resizingTask?.taskId ?? null,
    resizeHandle: resizingTask?.handle ?? null,
    handleResizeStart,
  }
}
