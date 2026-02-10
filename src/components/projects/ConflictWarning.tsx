"use client"

import { AlertTriangle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { format } from "date-fns"
import { nl } from "date-fns/locale"

// =============================================================================
// Types
// =============================================================================

export interface ConflictItem {
  employeeName: string
  taskName: string
  date: string
  overlapDays?: number
}

interface ConflictWarningProps {
  conflicts: ConflictItem[]
}

// =============================================================================
// Component
// =============================================================================

export function ConflictWarning({ conflicts }: ConflictWarningProps) {
  if (conflicts.length === 0) return null

  const formatDateDisplay = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d MMM", { locale: nl })
    } catch {
      return dateStr
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 rounded-md border border-state-warning-text/20 bg-state-warning-bg px-2 py-1 text-state-warning-text cursor-help">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">
              {conflicts.length} {conflicts.length === 1 ? "conflict" : "conflicten"}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="max-w-xs p-3"
        >
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">
              Planningsconflicten gevonden
            </p>
            <div className="space-y-1.5">
              {conflicts.slice(0, 5).map((conflict, index) => (
                <div
                  key={index}
                  className="rounded-sm bg-muted/50 px-2 py-1.5 text-xs"
                >
                  <span className="font-medium text-foreground">
                    {conflict.employeeName}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}is al ingepland voor{" "}
                  </span>
                  <span className="font-medium text-foreground">
                    &ldquo;{conflict.taskName}&rdquo;
                  </span>
                  <span className="text-muted-foreground">
                    {" "}op {formatDateDisplay(conflict.date)}
                    {conflict.overlapDays && conflict.overlapDays > 1 && (
                      <span> ({conflict.overlapDays} dagen overlap)</span>
                    )}
                  </span>
                </div>
              ))}
              {conflicts.length > 5 && (
                <p className="text-xs text-muted-foreground pt-1">
                  en {conflicts.length - 5} meer...
                </p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
