"use client"

import * as React from "react"
import type { Task } from "@/types/projects"
import type { TimelineConfig } from "./types"

// =============================================================================
// Props
// =============================================================================

export interface GhostTaskBarProps {
  /** The task to show ghost for */
  task: Task
  /** Timeline configuration */
  timelineConfig: TimelineConfig
  /** Row height in pixels */
  rowHeight: number
  /** Row index for vertical positioning */
  rowIndex: number
}

// =============================================================================
// Component
// =============================================================================

/**
 * GhostTaskBar shows the original position of a task during drag/resize
 * as a dashed outline to help users see where the task started.
 */
export function GhostTaskBar({
  task,
  timelineConfig,
  rowHeight,
  rowIndex,
}: GhostTaskBarProps) {
  // Calculate task bar position from original task dates
  const startDate = new Date(task.startDate)
  const dayOffset = Math.floor(
    (startDate.getTime() - timelineConfig.startDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const left = dayOffset * timelineConfig.columnWidth
  const width = task.duration * timelineConfig.columnWidth

  // Milestones don't have a meaningful ghost bar
  if (task.isMilestone) {
    return null
  }

  const barHeight = task.isSummary ? 8 : 20
  const barTop = rowIndex * rowHeight + (rowHeight - barHeight) / 2 + (task.isSummary ? 6 : 0)

  return (
    <div
      className="pointer-events-none absolute rounded border-2 border-dashed border-zinc-300 opacity-50 dark:border-zinc-600"
      style={{
        left,
        top: barTop,
        width: Math.max(width, 8),
        height: barHeight,
      }}
    />
  )
}
