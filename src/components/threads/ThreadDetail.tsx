'use client'

import * as React from 'react'
import { ArrowLeft, CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { ThreadMessage } from './ThreadMessage'
import { ThreadComposer } from './ThreadComposer'
import { useThreadMessages, useAddMessage, useDeleteMessage, useResolveThread } from '@/queries/threads'
import { useRealtimeThreadMessages } from '@/hooks/use-realtime-threads'
import { getAttachmentUrl } from '@/lib/supabase/storage'
import { useAuth } from '@/hooks/use-auth'
import type { Thread, ThreadEntityType } from '@/types/threads'

// =============================================================================
// Props
// =============================================================================

interface ThreadDetailProps {
  thread: Thread
  entityType: ThreadEntityType
  entityId: string
  currentUserId?: string
  onBack: () => void
}

// =============================================================================
// Component
// =============================================================================

export function ThreadDetail({
  thread,
  entityType,
  entityId,
  currentUserId: externalUserId,
  onBack,
}: ThreadDetailProps) {
  const { user } = useAuth()
  const currentUserId = externalUserId || user?.id || ''
  const { addToast } = useToast()
  const { data: messages, isLoading } = useThreadMessages(thread.id)
  const addMessage = useAddMessage()
  const deleteMessage = useDeleteMessage()
  const resolveThread = useResolveThread()
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Realtime updates
  useRealtimeThreadMessages(thread.id)

  // Scroll to bottom on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages?.length])

  const handleSendMessage = async (data: Parameters<typeof addMessage.mutate>[0] extends infer T ? Omit<T, 'threadId' | 'entityType' | 'entityId'> : never) => {
    addMessage.mutate(
      {
        threadId: thread.id,
        entityType,
        entityId,
        ...data,
      },
      {
        onError: () => addToast({ type: 'error', title: 'Bericht versturen mislukt' }),
      }
    )
  }

  const handleDeleteMessage = (messageId: string) => {
    if (!confirm('Weet je zeker dat je dit bericht wilt verwijderen?')) return
    deleteMessage.mutate(
      { messageId, threadId: thread.id, entityType, entityId },
      {
        onError: () => addToast({ type: 'error', title: 'Verwijderen mislukt' }),
      }
    )
  }

  const handleToggleResolved = () => {
    resolveThread.mutate({
      threadId: thread.id,
      isResolved: !thread.isResolved,
      entityType,
      entityId,
    })
  }

  const handleDownloadAttachment = async (storagePath: string, fileName: string) => {
    try {
      const url = await getAttachmentUrl(storagePath)
      if (url) {
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        link.click()
      }
    } catch {
      addToast({ type: 'error', title: 'Download mislukt' })
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 shrink-0">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate">{thread.title}</h3>
          <p className="text-xs text-muted-foreground">
            Gestart door {thread.creatorName} · {thread.messageCount} bericht{thread.messageCount !== 1 ? 'en' : ''}
          </p>
        </div>

        <Button
          variant={thread.isResolved ? 'secondary' : 'outline'}
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={handleToggleResolved}
          disabled={resolveThread.isPending}
        >
          {thread.isResolved ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300" />
              Opgelost
            </>
          ) : (
            <>
              <Circle className="h-3.5 w-3.5" />
              Markeer opgelost
            </>
          )}
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages?.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Nog geen berichten in deze thread.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {messages?.map((msg) => (
              <ThreadMessage
                key={msg.id}
                message={msg}
                isOwnMessage={msg.authorId === currentUserId}
                onDelete={handleDeleteMessage}
                onDownloadAttachment={handleDownloadAttachment}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-border p-3">
        <ThreadComposer
          onSubmit={handleSendMessage}
          isSubmitting={addMessage.isPending}
          placeholder="Reageer..."
        />
      </div>
    </div>
  )
}
