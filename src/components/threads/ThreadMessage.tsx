'use client'

import * as React from 'react'
import { getInitials } from '@/lib/format'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { MoreHorizontal, Pencil, Trash2, Paperclip, Download } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { STATUS_TAG_CONFIG, PRIORITY_CONFIG, CATEGORY_CONFIG } from '@/types/threads'
import type { ThreadMessage as ThreadMessageType } from '@/types/threads'

// =============================================================================
// Props
// =============================================================================

interface ThreadMessageProps {
  message: ThreadMessageType
  isOwnMessage: boolean
  onEdit?: (messageId: string) => void
  onDelete?: (messageId: string) => void
  onDownloadAttachment?: (storagePath: string, fileName: string) => void
}

// =============================================================================
// Helpers
// =============================================================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function highlightMentions(content: string, mentions: string[], mentionNames: string[]): React.ReactNode {
  if (mentions.length === 0) return content

  // Simple approach: replace @mentions with highlighted spans
  const result = content
  const parts: React.ReactNode[] = []
  let lastIndex = 0

  // Find @name patterns and highlight them
  mentionNames.forEach((name) => {
    const pattern = `@${name}`
    const index = result.indexOf(pattern, lastIndex)
    if (index !== -1) {
      if (index > lastIndex) {
        parts.push(result.substring(lastIndex, index))
      }
      parts.push(
        <span key={index} className="bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200 rounded px-0.5">
          {pattern}
        </span>
      )
      lastIndex = index + pattern.length
    }
  })

  if (parts.length === 0) return content

  if (lastIndex < result.length) {
    parts.push(result.substring(lastIndex))
  }

  return <>{parts}</>
}

// =============================================================================
// Component
// =============================================================================

export function ThreadMessage({
  message,
  isOwnMessage,
  onEdit,
  onDelete,
  onDownloadAttachment,
}: ThreadMessageProps) {
  const initials = getInitials(message.authorName)

  return (
    <div className={cn('group flex gap-3 py-3', isOwnMessage && 'bg-muted/30 -mx-3 px-3 rounded-md')}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        {/* Header: Author + Time + Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{message.authorName}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.createdAt), "d MMM yyyy 'om' HH:mm", { locale: nl })}
          </span>
          {message.isEdited && (
            <span className="text-xs text-muted-foreground italic">(bewerkt)</span>
          )}

          {/* Status Tag */}
          {message.statusTag && (
            <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', STATUS_TAG_CONFIG[message.statusTag].color)}>
              {STATUS_TAG_CONFIG[message.statusTag].label}
            </span>
          )}

          {/* Priority (only if not normal) */}
          {message.priority !== 'normal' && (
            <span className={cn('text-xs font-medium', PRIORITY_CONFIG[message.priority].color)}>
              {PRIORITY_CONFIG[message.priority].label}
            </span>
          )}

          {/* Category (only if not algemeen) */}
          {message.category !== 'algemeen' && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {CATEGORY_CONFIG[message.category].label}
            </span>
          )}

          {/* Actions */}
          {isOwnMessage && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(message.id)}>
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Bewerken
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(message.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Verwijderen
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <p className="text-sm mt-1 whitespace-pre-wrap break-words">
          {highlightMentions(message.content, message.mentions, message.mentionNames)}
        </p>

        {/* Attachments */}
        {message.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((attachment) => (
              <button
                key={attachment.id}
                onClick={() => onDownloadAttachment?.(attachment.storagePath, attachment.fileName)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors bg-muted/50 rounded px-2 py-1"
              >
                <Paperclip className="h-3 w-3" />
                <span className="truncate max-w-[200px]">{attachment.fileName}</span>
                <span>({formatFileSize(attachment.fileSize)})</span>
                <Download className="h-3 w-3 ml-auto" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
