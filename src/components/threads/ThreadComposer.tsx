'use client'

import * as React from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { STATUS_TAG_CONFIG, PRIORITY_CONFIG, CATEGORY_CONFIG } from '@/types/threads'
import type { ThreadStatusTag, ThreadPriority, ThreadCategory } from '@/types/threads'

// =============================================================================
// Props
// =============================================================================

interface ThreadComposerProps {
  onSubmit: (data: {
    content: string
    statusTag?: ThreadStatusTag
    priority?: ThreadPriority
    category?: ThreadCategory
    mentions: string[]
  }) => void
  isSubmitting?: boolean
  placeholder?: string
  /** If true, show title field for creating a new thread */
  showTitle?: boolean
  onTitleChange?: (title: string) => void
  title?: string
}

// =============================================================================
// Component
// =============================================================================

export function ThreadComposer({
  onSubmit,
  isSubmitting = false,
  placeholder = 'Schrijf een bericht...',
  showTitle = false,
  onTitleChange,
  title = '',
}: ThreadComposerProps) {
  const [content, setContent] = React.useState('')
  const [statusTag, setStatusTag] = React.useState<ThreadStatusTag | undefined>(undefined)
  const [priority, setPriority] = React.useState<ThreadPriority>('normal')
  const [category, setCategory] = React.useState<ThreadCategory>('algemeen')
  const [showMetadata, setShowMetadata] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Extract @mentions from content
  const extractMentions = React.useCallback((_text: string): string[] => {
    // In a full implementation, this would match against workspace member names
    // and return their user IDs. For now, return empty array.
    return []
  }, [])

  const handleSubmit = () => {
    if (!content.trim()) return

    const mentions = extractMentions(content)
    onSubmit({
      content: content.trim(),
      statusTag,
      priority: priority !== 'normal' ? priority : undefined,
      category: category !== 'algemeen' ? category : undefined,
      mentions,
    })

    setContent('')
    setStatusTag(undefined)
    setPriority('normal')
    setCategory('algemeen')
    setShowMetadata(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [content])

  return (
    <div className="border rounded-lg bg-card">
      {/* Title field (for new threads) */}
      {showTitle && (
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder="Onderwerp..."
          className="w-full px-3 py-2 text-sm font-medium border-b bg-transparent focus:outline-none placeholder:text-muted-foreground"
        />
      )}

      {/* Message content */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={2}
        className="w-full px-3 py-2 text-sm bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground"
      />

      {/* Metadata selectors */}
      {showMetadata && (
        <div className="flex items-center gap-2 px-3 pb-2 flex-wrap">
          <Select
            value={statusTag ?? '_none'}
            onValueChange={(v) => setStatusTag(v === '_none' ? undefined : v as ThreadStatusTag)}
          >
            <SelectTrigger className="h-7 w-[120px] text-xs">
              <SelectValue placeholder="Label" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">Geen label</SelectItem>
              {Object.entries(STATUS_TAG_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priority} onValueChange={(v) => setPriority(v as ThreadPriority)}>
            <SelectTrigger className="h-7 w-[110px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={(v) => setCategory(v as ThreadCategory)}>
            <SelectTrigger className="h-7 w-[120px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Footer: metadata toggle + send */}
      <div className="flex items-center justify-between px-3 pb-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          onClick={() => setShowMetadata(!showMetadata)}
        >
          {showMetadata ? 'Minder opties' : 'Meer opties'}
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Ctrl+Enter</span>
          <Button
            size="sm"
            className="h-7"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting || (showTitle && !title.trim())}
          >
            <Send className="h-3.5 w-3.5 mr-1" />
            Verstuur
          </Button>
        </div>
      </div>
    </div>
  )
}
