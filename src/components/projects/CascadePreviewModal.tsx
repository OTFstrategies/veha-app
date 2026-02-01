"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { nl } from "date-fns/locale"
import { AlertTriangle, ArrowRight, Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { DependencyPreview } from "@/queries/tasks"

// =============================================================================
// Props
// =============================================================================

interface CascadePreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  previews: DependencyPreview[]
  dependencyDescription: string
  onConfirm: () => void
  isLoading: boolean
}

// =============================================================================
// Component
// =============================================================================

export function CascadePreviewModal({
  open,
  onOpenChange,
  previews,
  dependencyDescription,
  onConfirm,
  isLoading,
}: CascadePreviewModalProps) {
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "d MMM yyyy", { locale: nl })
    } catch {
      return dateStr
    }
  }

  const hasChanges = previews.length > 0

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            Datum Wijzigingen Preview
          </DialogTitle>
          <DialogDescription>{dependencyDescription}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {!hasChanges ? (
            <p className="py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Geen taken worden beinvloed door deze dependency.
            </p>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-orange-50 p-3 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p className="text-sm">
                  {previews.length}{" "}
                  {previews.length === 1 ? "taak wordt" : "taken worden"} aangepast
                </p>
              </div>

              <div className="max-h-[300px] space-y-3 overflow-y-auto">
                {previews.map((preview) => (
                  <div
                    key={preview.taskId}
                    className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
                  >
                    <p className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">
                      {preview.taskName}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="text-zinc-500 dark:text-zinc-400">
                        <span className="line-through">
                          {formatDate(preview.oldStartDate)} -{" "}
                          {formatDate(preview.oldEndDate)}
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-zinc-400" />
                      <div className="font-medium text-orange-600 dark:text-orange-400">
                        {formatDate(preview.newStartDate)} -{" "}
                        {formatDate(preview.newEndDate)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Annuleren
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading
              ? "Bezig..."
              : hasChanges
                ? "Bevestigen & Toepassen"
                : "Toevoegen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
