"use client"

import * as React from "react"
import { useDraggable } from "@dnd-kit/core"
import { Diamond } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/types/projects"
import type { TaskScheduleInfo } from "@/lib/scheduling/critical-path"

// =============================================================================
// Props
// =============================================================================

export interface DraggableTaskBarProps {
  /** The task to display */
  task: Task
  /** Left position in pixels */
  left: number
  /** Width in pixels */
  width: number
  /** Top position in pixels */
  top: number
  /** Row height in pixels */
  height: number
  /** Whether this task is selected */
  isSelected: boolean
  /** Whether this task is highlighted (recently changed) */
  isHighlighted?: boolean
  /** Whether this task is highlighted due to hovered dependency */
  isDependencyHighlighted?: boolean
  /** Whether to show progress bar */
  showProgress: boolean
  /** Critical path info for this task */
  criticalPathInfo?: TaskScheduleInfo
  /** Whether this task is currently being dragged */
  isDragging: boolean
  /** Preview of new dates during drag/resize */
  dragPreview?: {
    newStartDate: string
    newEndDate: string
  } | null
  /** Called when task is clicked */
  onClick: () => void
  /** Called when task is double-clicked */
  onDoubleClick: () => void
  /** Called when resize starts */
  onResizeStart: (taskId: string, handle: "start" | "end", startX: number) => void
}

// =============================================================================
// Component
// =============================================================================

export function DraggableTaskBar({
  task,
  left,
  width,
  top,
  height,
  isSelected,
  isHighlighted = false,
  isDependencyHighlighted = false,
  showProgress,
  criticalPathInfo,
  isDragging,
  dragPreview,
  onClick,
  onDoubleClick,
  onResizeStart,
}: DraggableTaskBarProps) {
  const barHeight = 20
  const barTop = top + (height - barHeight) / 2

  const isCritical = criticalPathInfo?.isCritical ?? false
  const totalFloat = criticalPathInfo?.totalFloat ?? 0
  const hasHighSlack = !isCritical && totalFloat > 5

  // Set up draggable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: task.id,
    data: { task, type: "move" },
    disabled: task.isMilestone || task.isSummary,
  })

  // Apply transform during drag
  const dragStyle: React.CSSProperties = transform
    ? {
        transform: `translateX(${transform.x}px)`,
        zIndex: 50,
      }
    : {}

  // Format short date for preview tooltip
  const formatShortDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })
    } catch {
      return dateStr
    }
  }

  // ---------------------------------------------------------------------------
  // Milestone
  // ---------------------------------------------------------------------------

  if (task.isMilestone) {
    return (
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: left - 10,
          top: barTop,
          width: 20,
          height: barHeight,
        }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        <Diamond
          className={cn(
            "h-4 w-4 cursor-pointer fill-stone-800 text-stone-800 transition-all dark:fill-stone-200 dark:text-stone-200",
            isSelected && "fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400",
            isHighlighted && "animate-pulse fill-orange-500 text-orange-500 dark:fill-orange-400 dark:text-orange-400",
            isDependencyHighlighted && !isHighlighted && "fill-blue-500 text-blue-500 dark:fill-blue-400 dark:text-blue-400",
            isCritical && !isDependencyHighlighted && !isHighlighted && "fill-red-500 text-red-500 dark:fill-red-400 dark:text-red-400",
            "hover:scale-110"
          )}
        />
        {/* Critical indicator for milestone */}
        {isCritical && (
          <span
            className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-red-500"
            title="Kritiek pad - geen vertraging mogelijk"
          >
            KRITIEK
          </span>
        )}
        {/* Tooltip on hover */}
        <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-stone-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-stone-200 dark:text-stone-900">
          {task.name}
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Summary Task
  // ---------------------------------------------------------------------------

  if (task.isSummary) {
    return (
      <div
        className={cn(
          "group absolute cursor-pointer rounded-sm transition-all",
          isHighlighted
            ? "animate-pulse bg-orange-400 dark:bg-orange-500"
            : isDependencyHighlighted
            ? "bg-blue-500 dark:bg-blue-600"
            : isCritical
            ? "bg-red-500 dark:bg-red-600"
            : "bg-stone-400 dark:bg-stone-500",
          isSelected
            ? "ring-2 ring-blue-500 ring-offset-1"
            : isDependencyHighlighted
            ? "ring-2 ring-blue-400 ring-offset-1 dark:ring-blue-500"
            : isCritical
            ? "ring-2 ring-red-300 dark:ring-red-700"
            : "hover:brightness-95",
          hasHighSlack && !isDependencyHighlighted && "opacity-70"
        )}
        style={{
          left,
          top: barTop + 6,
          width: Math.max(width, 8),
          height: 8,
        }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        {/* Critical indicator */}
        {isCritical && !isDependencyHighlighted && (
          <span
            className="absolute -top-5 left-0 whitespace-nowrap text-[10px] font-semibold text-red-500"
            title="Kritiek pad - geen vertraging mogelijk"
          >
            KRITIEK
          </span>
        )}
        {/* Float indicator for non-critical tasks */}
        {!isCritical && totalFloat > 0 && criticalPathInfo && !isDependencyHighlighted && (
          <span
            className="absolute -top-5 left-0 whitespace-nowrap text-[10px] text-stone-500 dark:text-stone-400"
            title={`${totalFloat} dagen speling`}
          >
            +{totalFloat}d
          </span>
        )}
        {/* Left bracket */}
        <div
          className={cn(
            "absolute -bottom-1 left-0 w-1 rounded-b-sm",
            isHighlighted
              ? "bg-orange-400 dark:bg-orange-500"
              : isDependencyHighlighted
              ? "bg-blue-500 dark:bg-blue-600"
              : isCritical
              ? "bg-red-500 dark:bg-red-600"
              : "bg-stone-400 dark:bg-stone-500"
          )}
          style={{ height: 6 }}
        />
        {/* Right bracket */}
        <div
          className={cn(
            "absolute -bottom-1 right-0 w-1 rounded-b-sm",
            isHighlighted
              ? "bg-orange-400 dark:bg-orange-500"
              : isDependencyHighlighted
              ? "bg-blue-500 dark:bg-blue-600"
              : isCritical
              ? "bg-red-500 dark:bg-red-600"
              : "bg-stone-400 dark:bg-stone-500"
          )}
          style={{ height: 6 }}
        />

        {/* Tooltip */}
        <div className="pointer-events-none absolute bottom-full left-0 mb-1 whitespace-nowrap rounded bg-stone-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-stone-200 dark:text-stone-900">
          {task.name} ({task.progress}%)
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Regular Task
  // ---------------------------------------------------------------------------

  // Status-based styling classes
  const getTaskBarClasses = () => {
    if (isHighlighted) {
      return "animate-pulse bg-orange-400 dark:bg-orange-500"
    }
    if (isDependencyHighlighted) {
      return "bg-blue-500 dark:bg-blue-600"
    }
    if (isCritical) {
      return "bg-red-500 dark:bg-red-600"
    }
    if (task.status === "done") {
      return "bg-green-500 dark:bg-green-600"
    }
    // todo and in_progress use VEHA beige
    return "bg-[#CBC4B5] dark:bg-stone-500"
  }

  const getProgressBarClasses = () => {
    if (isHighlighted) {
      return "bg-orange-600 dark:bg-orange-400"
    }
    if (isDependencyHighlighted) {
      return "bg-blue-700 dark:bg-blue-400"
    }
    if (isCritical) {
      return "bg-red-700 dark:bg-red-400"
    }
    if (task.status === "done") {
      return "bg-green-600 dark:bg-green-500"
    }
    // todo and in_progress use VEHA zwart (dark) / light for dark mode
    return "bg-stone-800 dark:bg-stone-200"
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group absolute rounded transition-all",
        getTaskBarClasses(),
        isSelected
          ? "ring-2 ring-blue-500 ring-offset-1"
          : isDependencyHighlighted
          ? "ring-2 ring-blue-400 ring-offset-1 dark:ring-blue-500"
          : isCritical
          ? "ring-2 ring-red-300 dark:ring-red-700"
          : "hover:brightness-95",
        hasHighSlack && !isDependencyHighlighted && "opacity-70",
        isDragging && "shadow-lg opacity-90 cursor-grabbing",
        !isDragging && "cursor-grab"
      )}
      style={{
        left,
        top: barTop,
        width: Math.max(width, 8),
        height: barHeight,
        ...dragStyle,
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      {...attributes}
      {...listeners}
    >
      {/* Critical indicator */}
      {isCritical && !isDependencyHighlighted && !isDragging && (
        <span
          className="absolute -top-5 left-0 whitespace-nowrap text-[10px] font-semibold text-red-500"
          title="Kritiek pad - geen vertraging mogelijk"
        >
          KRITIEK
        </span>
      )}
      {/* Float indicator for non-critical tasks */}
      {!isCritical && totalFloat > 0 && criticalPathInfo && !isDependencyHighlighted && !isDragging && (
        <span
          className="absolute -top-5 left-0 whitespace-nowrap text-[10px] text-stone-500 dark:text-stone-400"
          title={`${totalFloat} dagen speling`}
        >
          +{totalFloat}d
        </span>
      )}

      {/* Progress Fill */}
      {showProgress && task.progress > 0 && (
        <div
          className={cn(
            "absolute bottom-0 left-0 top-0 transition-all",
            getProgressBarClasses(),
            task.progress === 100 ? "rounded" : "rounded-l"
          )}
          style={{
            width: `${task.progress}%`,
          }}
        />
      )}

      {/* Task Name (shown if bar is wide enough) */}
      {width > 80 && (
        <span
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 truncate text-xs font-medium",
            isDependencyHighlighted || isCritical
              ? "text-white dark:text-white"
              : task.progress > 50
              ? "text-white dark:text-stone-900"
              : "text-stone-800 dark:text-stone-100"
          )}
          style={{ maxWidth: width - 24 }}
        >
          {task.name}
        </span>
      )}

      {/* Left Resize Handle (start date) */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize rounded-l",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "bg-stone-700/30 dark:bg-stone-300/30",
          "hover:bg-stone-700/50 dark:hover:bg-stone-300/50"
        )}
        onMouseDown={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onResizeStart(task.id, "start", e.clientX)
        }}
      />

      {/* Right Resize Handle (end date) */}
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize rounded-r",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "bg-stone-700/30 dark:bg-stone-300/30",
          "hover:bg-stone-700/50 dark:hover:bg-stone-300/50"
        )}
        onMouseDown={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onResizeStart(task.id, "end", e.clientX)
        }}
      />

      {/* Date Preview Tooltip during drag/resize */}
      {isDragging && dragPreview && (
        <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-stone-800 px-2 py-1 text-xs text-white shadow-lg dark:bg-stone-200 dark:text-stone-900">
          {formatShortDate(dragPreview.newStartDate)} - {formatShortDate(dragPreview.newEndDate)}
        </div>
      )}

      {/* Default Tooltip (shown when not dragging) */}
      {!isDragging && (
        <div className="pointer-events-none absolute bottom-full left-0 mb-1 whitespace-nowrap rounded bg-stone-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-stone-200 dark:text-stone-900">
          <div className="font-medium">{task.name}</div>
          <div className="text-stone-300 dark:text-stone-600">
            {new Date(task.startDate).toLocaleDateString("nl-NL")} -{" "}
            {new Date(task.endDate).toLocaleDateString("nl-NL")}
          </div>
          <div className="text-stone-300 dark:text-stone-600">
            {task.progress}% voltooid
          </div>
          {criticalPathInfo && (
            <div className={cn("text-stone-300 dark:text-stone-600", isCritical && "text-red-300 dark:text-red-400")}>
              {isCritical ? "Kritiek pad" : `Speling: ${totalFloat} dagen`}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
