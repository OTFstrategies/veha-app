"use client"

import * as React from "react"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format, parseISO } from "date-fns"
import { nl } from "date-fns/locale"
import type { ProjectConflict } from "@/queries/conflicts"

// =============================================================================
// Props
// =============================================================================

interface ConflictBadgeProps {
  conflicts: ProjectConflict[]
  size?: "sm" | "md"
}

// =============================================================================
// Component
// =============================================================================

/**
 * Displays a warning badge showing the number of scheduling conflicts.
 *
 * When clicked, shows a popover with detailed conflict information including:
 * - Employee name
 * - Conflicting task names
 * - Overlap period and duration
 */
export function ConflictBadge({ conflicts, size = "md" }: ConflictBadgeProps) {
  if (conflicts.length === 0) return null

  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
            "bg-state-warning-bg text-state-warning-text",
            "hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-zinc-400/30 focus:ring-offset-2"
          )}
          aria-label={`${conflicts.length} ${conflicts.length === 1 ? "conflict" : "conflicten"}`}
        >
          <AlertTriangle className={iconSize} />
          <span className="text-xs font-medium">{conflicts.length}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <ConflictDetails conflicts={conflicts} />
      </PopoverContent>
    </Popover>
  )
}

// =============================================================================
// Conflict Details
// =============================================================================

interface ConflictDetailsProps {
  conflicts: ProjectConflict[]
}

function ConflictDetails({ conflicts }: ConflictDetailsProps) {
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "d MMM", { locale: nl })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
        <AlertTriangle className="h-4 w-4" />
        <h4 className="font-semibold">
          {conflicts.length} {conflicts.length === 1 ? "Conflict" : "Conflicten"}
        </h4>
      </div>

      {/* Conflict list */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {conflicts.map((conflict) => (
          <div
            key={conflict.id}
            className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 space-y-2"
          >
            {/* Employee and overlap info */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {conflict.employeeName}
              </span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {conflict.overlapDays}{" "}
                {conflict.overlapDays === 1 ? "dag" : "dagen"} overlap
              </span>
            </div>

            {/* Task details */}
            <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-16 text-xs text-zinc-500 dark:text-zinc-500 shrink-0">
                  Taak 1:
                </span>
                <span className="truncate">{conflict.task1Name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 text-xs text-zinc-500 dark:text-zinc-500 shrink-0">
                  Taak 2:
                </span>
                <span className="truncate">{conflict.task2Name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 text-xs text-zinc-500 dark:text-zinc-500 shrink-0">
                  Overlap:
                </span>
                <span>
                  {formatDate(conflict.overlapStart)} -{" "}
                  {formatDate(conflict.overlapEnd)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tip */}
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Tip: Pas de planning aan of wijs een andere medewerker toe.
      </p>
    </div>
  )
}

// =============================================================================
// Global Conflict Summary
// =============================================================================

interface ConflictSummaryProps {
  conflictCount: number
}

/**
 * Displays a summary badge for total project conflicts in the header.
 */
export function ConflictSummary({ conflictCount }: ConflictSummaryProps) {
  if (conflictCount === 0) return null

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-state-warning-bg text-state-warning-text">
      <AlertTriangle className="h-4 w-4" />
      <span className="text-sm font-medium">
        {conflictCount} {conflictCount === 1 ? "conflict" : "conflicten"}
      </span>
    </div>
  )
}
