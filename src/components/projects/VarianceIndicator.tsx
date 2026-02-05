"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// =============================================================================
// Props
// =============================================================================

interface VarianceIndicatorProps {
  varianceDays: number
  type: "start" | "end"
  className?: string
}

// =============================================================================
// Component
// =============================================================================

/**
 * Visual indicator showing schedule variance (difference from baseline).
 * Positive values = delayed, Negative values = ahead of schedule.
 */
export function VarianceIndicator({ varianceDays, type, className }: VarianceIndicatorProps) {
  // Don't show anything if no variance
  if (varianceDays === 0) return null

  const isLate = varianceDays > 0
  const absVariance = Math.abs(varianceDays)

  // Determine severity based on days of variance
  const severity = absVariance > 5 ? "high" : absVariance > 2 ? "medium" : "low"

  // Color coding: red = late, green = early
  const colors = {
    high: isLate
      ? "bg-red-500 dark:bg-red-600"
      : "bg-green-500 dark:bg-green-600",
    medium: isLate
      ? "bg-amber-500 dark:bg-amber-600"
      : "bg-green-400 dark:bg-green-500",
    low: isLate
      ? "bg-amber-400 dark:bg-amber-500"
      : "bg-green-300 dark:bg-green-400",
  }

  const typeLabel = type === "start" ? "Start" : "Eind"
  const statusLabel = isLate ? "vertraagd" : "vervroegd"
  const dayLabel = absVariance === 1 ? "dag" : "dagen"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex items-center justify-center",
            "w-5 h-5 rounded-full text-[10px] font-medium text-white",
            colors[severity],
            className
          )}
        >
          {isLate ? "+" : "-"}{absVariance}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p>{typeLabel}: {statusLabel} met {absVariance} {dayLabel}</p>
      </TooltipContent>
    </Tooltip>
  )
}
