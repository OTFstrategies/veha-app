'use client'

import * as React from 'react'
import { Paperclip, X, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { uploadThreadAttachment } from '@/lib/supabase/storage'
import { useToast } from '@/components/ui/toast'

// =============================================================================
// Types
// =============================================================================

export interface PendingAttachment {
  file: File
  uploading: boolean
  storagePath?: string
  error?: string
}

// =============================================================================
// Props
// =============================================================================

interface AttachmentUploaderProps {
  threadId: string
  attachments: PendingAttachment[]
  onAttachmentsChange: (attachments: PendingAttachment[]) => void
}

// =============================================================================
// Helpers
// =============================================================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// =============================================================================
// Component
// =============================================================================

export function AttachmentUploader({
  threadId,
  attachments,
  onAttachmentsChange,
}: AttachmentUploaderProps) {
  const { addToast } = useToast()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const handleFiles = async (files: FileList | File[]) => {
    const newAttachments: PendingAttachment[] = Array.from(files).map((file) => ({
      file,
      uploading: true,
    }))

    onAttachmentsChange([...attachments, ...newAttachments])

    // Upload each file
    for (let i = 0; i < newAttachments.length; i++) {
      try {
        const result = await uploadThreadAttachment(newAttachments[i].file, threadId)
        newAttachments[i] = {
          ...newAttachments[i],
          uploading: false,
          storagePath: result.storagePath,
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload mislukt'
        newAttachments[i] = {
          ...newAttachments[i],
          uploading: false,
          error: errorMessage,
        }
        addToast({ type: 'error', title: errorMessage })
      }
    }

    onAttachmentsChange([
      ...attachments.filter((a) => !newAttachments.find((na) => na.file === a.file)),
      ...newAttachments,
    ])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removeAttachment = (index: number) => {
    const updated = [...attachments]
    updated.splice(index, 1)
    onAttachmentsChange(updated)
  }

  return (
    <div className="space-y-2">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-md p-3 text-center transition-colors cursor-pointer',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
        <p className="text-xs text-muted-foreground">
          Sleep bestanden hierheen of klik om te uploaden
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Max 10MB · Afbeeldingen, PDF, documenten
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {/* Attachment List */}
      {attachments.length > 0 && (
        <div className="space-y-1">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center gap-2 text-xs px-2 py-1 rounded',
                attachment.error ? 'bg-destructive/10 text-destructive' : 'bg-muted'
              )}
            >
              {attachment.uploading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Paperclip className="h-3 w-3" />
              )}
              <span className="truncate flex-1">{attachment.file.name}</span>
              <span className="text-muted-foreground shrink-0">
                {formatFileSize(attachment.file.size)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => removeAttachment(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
