'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { MessageCircle, Plus, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { ThreadDetail } from './ThreadDetail'
import { ThreadComposer } from './ThreadComposer'
import { useThreads, useCreateThread } from '@/queries/threads'
import { useAuth } from '@/hooks/use-auth'
import type { Thread, ThreadEntityType } from '@/types/threads'

// =============================================================================
// Props
// =============================================================================

export interface ThreadListProps {
  entityType: ThreadEntityType
  entityId: string | null
  currentUserId?: string
}

// =============================================================================
// Thread Card
// =============================================================================

function ThreadCard({
  thread,
  onClick,
}: {
  thread: Thread
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-md border border-border hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start gap-2">
        <MessageCircle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{thread.title}</span>
            {thread.isResolved && (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">{thread.creatorName}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">
              {thread.messageCount} bericht{thread.messageCount !== 1 ? 'en' : ''}
            </span>
            {thread.lastMessageAt && (
              <>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(thread.lastMessageAt), 'd MMM', { locale: nl })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

// =============================================================================
// Filter Tabs
// =============================================================================

type FilterOption = 'all' | 'open' | 'resolved'

// =============================================================================
// Component
// =============================================================================

export function ThreadList({ entityType, entityId, currentUserId: externalUserId }: ThreadListProps) {
  const { user } = useAuth()
  const currentUserId = externalUserId || user?.id || ''
  const { addToast } = useToast()
  const { data: threads, isLoading } = useThreads(entityType, entityId)
  const createThread = useCreateThread()
  const [selectedThread, setSelectedThread] = React.useState<Thread | null>(null)
  const [isCreating, setIsCreating] = React.useState(false)
  const [newTitle, setNewTitle] = React.useState('')
  const [filter, setFilter] = React.useState<FilterOption>('all')

  const filteredThreads = React.useMemo(() => {
    if (!threads) return []
    switch (filter) {
      case 'open':
        return threads.filter((t) => !t.isResolved)
      case 'resolved':
        return threads.filter((t) => t.isResolved)
      default:
        return threads
    }
  }, [threads, filter])

  // If a thread is selected, show detail view
  if (selectedThread) {
    return (
      <ThreadDetail
        thread={selectedThread}
        entityType={entityType}
        entityId={entityId!}
        currentUserId={currentUserId}
        onBack={() => setSelectedThread(null)}
      />
    )
  }

  const handleCreateThread = async (data: {
    content: string
    statusTag?: string
    priority?: string
    category?: string
    mentions: string[]
  }) => {
    if (!entityId || !newTitle.trim()) return

    createThread.mutate(
      {
        entityType,
        entityId,
        title: newTitle.trim(),
        firstMessage: data.content,
        statusTag: data.statusTag as never,
        priority: data.priority as never,
        category: data.category as never,
        mentions: data.mentions,
      },
      {
        onSuccess: () => {
          setIsCreating(false)
          setNewTitle('')
          addToast({ type: 'success', title: 'Thread aangemaakt' })
        },
        onError: () => {
          addToast({ type: 'error', title: 'Thread aanmaken mislukt' })
        },
      }
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-1">
          {(['all', 'open', 'resolved'] as const).map((option) => (
            <Button
              key={option}
              variant={filter === option ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setFilter(option)}
            >
              {option === 'all' ? 'Alle' : option === 'open' ? 'Open' : 'Opgelost'}
              {option === 'all' && threads && (
                <span className="ml-1 text-muted-foreground">{threads.length}</span>
              )}
            </Button>
          ))}
        </div>

        <Button
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => setIsCreating(true)}
          disabled={!entityId}
        >
          <Plus className="h-3.5 w-3.5" />
          Nieuw onderwerp
        </Button>
      </div>

      {/* New Thread Form */}
      {isCreating && (
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <ThreadComposer
            onSubmit={handleCreateThread}
            isSubmitting={createThread.isPending}
            placeholder="Eerste bericht..."
            showTitle
            title={newTitle}
            onTitleChange={setNewTitle}
          />
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-7 text-xs"
            onClick={() => {
              setIsCreating(false)
              setNewTitle('')
            }}
          >
            Annuleren
          </Button>
        </div>
      )}

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageCircle className={cn('h-8 w-8 text-muted-foreground mb-2')} />
            <p className="text-sm text-muted-foreground">
              {filter === 'all'
                ? 'Nog geen threads. Start een nieuw onderwerp.'
                : filter === 'open'
                  ? 'Geen open threads.'
                  : 'Geen opgeloste threads.'}
            </p>
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              onClick={() => setSelectedThread(thread)}
            />
          ))
        )}
      </div>
    </div>
  )
}
