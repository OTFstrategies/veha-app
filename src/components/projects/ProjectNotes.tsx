"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

interface ProjectNotesProps {
  projectId: string
  initialNotes?: string
  onSave?: (notes: string) => void
}

export function ProjectNotes({ projectId: _projectId, initialNotes = "", onSave }: ProjectNotesProps) {
  const [notes, setNotes] = React.useState(initialNotes)
  const [isSaving, setIsSaving] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)

  // Sync with initialNotes when it changes (e.g., after save)
  React.useEffect(() => {
    setNotes(initialNotes)
    setHasChanges(false)
  }, [initialNotes])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value)
    setHasChanges(e.target.value !== initialNotes)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave?.(notes)
      setHasChanges(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Notities</h3>
        {hasChanges && (
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="h-3 w-3 mr-1" />
            {isSaving ? "Opslaan..." : "Opslaan"}
          </Button>
        )}
      </div>
      <Textarea
        value={notes}
        onChange={handleChange}
        placeholder="Voeg notities toe over dit project..."
        className="min-h-[120px] resize-none"
      />
    </div>
  )
}
