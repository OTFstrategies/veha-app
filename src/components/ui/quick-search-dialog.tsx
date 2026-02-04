"use client"

import * as React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface QuickSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickSearchDialog({ open, onOpenChange }: QuickSearchDialogProps) {
  const [query, setQuery] = React.useState("")

  // Reset query when dialog closes
  React.useEffect(() => {
    if (!open) {
      setQuery("")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="flex items-center border-b px-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoeken in projecten, taken, klanten..."
            className="border-0 focus-visible:ring-0"
            autoFocus
          />
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2">
          {/* Results will go here */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
