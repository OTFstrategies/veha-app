"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// =============================================================================
// Props
// =============================================================================

interface BaselineTaskBarProps {
  left: number
  width: number
  top: number
  height: number
  visible: boolean
}

// =============================================================================
// Component
// =============================================================================

/**
 * Ghost bar showing the baseline (original planned) position of a task.
 * Displayed as a dashed outline below/behind the actual task bar.
 */
export function BaselineTaskBar({ left, width, top, height, visible }: BaselineTaskBarProps) {
  if (!visible || width <= 0) return null

  const barHeight = 8
  const verticalOffset = height / 2 + 8 // Position below the task bar center

  return (
    <div
      className={cn(
        "absolute pointer-events-none",
        "bg-transparent border-2 border-dashed border-zinc-400 dark:border-zinc-500",
        "rounded-sm opacity-60"
      )}
      style={{
        left: `${left}px`,
        width: `${width}px`,
        top: `${top + verticalOffset}px`,
        height: `${barHeight}px`,
      }}
      aria-label="Baseline positie"
    />
  )
}
