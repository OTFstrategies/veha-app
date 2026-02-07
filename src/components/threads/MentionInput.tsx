'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useWorkspaceMembers } from '@/hooks/use-workspace'

// =============================================================================
// Props
// =============================================================================

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  onMentionsChange: (mentionIds: string[]) => void
  placeholder?: string
  className?: string
}

// =============================================================================
// Component
// =============================================================================

export function MentionInput({
  value,
  onChange,
  onMentionsChange,
  placeholder = 'Schrijf een bericht... Gebruik @ om iemand te noemen',
  className,
}: MentionInputProps) {
  const { data: members } = useWorkspaceMembers()
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [mentionIds, setMentionIds] = React.useState<string[]>([])
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Parse members into a usable format
  const membersList = React.useMemo(() => {
    return (members ?? []).map((m) => {
      const profile = m.profile as
        | { id: string; full_name: string | null; email: string }
        | { id: string; full_name: string | null; email: string }[]
        | null
      const p = Array.isArray(profile) ? profile[0] : profile
      return {
        id: p?.id ?? '',
        name: p?.full_name ?? p?.email ?? 'Onbekend',
        email: p?.email ?? '',
      }
    }).filter((m) => m.id)
  }, [members])

  // Filter suggestions based on search query
  const suggestions = React.useMemo(() => {
    if (!searchQuery) return membersList.slice(0, 5)
    const query = searchQuery.toLowerCase()
    return membersList
      .filter((m) => m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query))
      .slice(0, 5)
  }, [membersList, searchQuery])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Check if user is typing a mention
    const cursorPos = e.target.selectionStart
    const textBefore = newValue.substring(0, cursorPos)
    const mentionMatch = textBefore.match(/@(\w*)$/)

    if (mentionMatch) {
      setSearchQuery(mentionMatch[1])
      setShowSuggestions(true)
      setSelectedIndex(0)
    } else {
      setShowSuggestions(false)
    }
  }

  const insertMention = (member: { id: string; name: string }) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPos = textarea.selectionStart
    const textBefore = value.substring(0, cursorPos)
    const textAfter = value.substring(cursorPos)

    // Replace @query with @name
    const mentionStart = textBefore.lastIndexOf('@')
    const newText = textBefore.substring(0, mentionStart) + `@${member.name} ` + textAfter

    onChange(newText)
    setShowSuggestions(false)

    // Track mention ID
    const newMentionIds = [...mentionIds, member.id]
    setMentionIds(newMentionIds)
    onMentionsChange(newMentionIds)

    // Focus back on textarea
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = mentionStart + member.name.length + 2
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && suggestions[selectedIndex]) {
      e.preventDefault()
      insertMention(suggestions[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        rows={3}
        className={cn(
          'w-full px-3 py-2 text-sm bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground',
          className
        )}
      />

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute bottom-full left-0 mb-1 w-64 bg-popover border border-border rounded-md shadow-md z-50 overflow-hidden">
          {suggestions.map((member, index) => (
            <button
              key={member.id}
              className={cn(
                'w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors',
                index === selectedIndex && 'bg-accent'
              )}
              onMouseDown={(e) => {
                e.preventDefault()
                insertMention(member)
              }}
            >
              <p className="font-medium">{member.name}</p>
              <p className="text-xs text-muted-foreground">{member.email}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
