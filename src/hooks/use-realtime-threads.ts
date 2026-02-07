import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { unsubscribeFromChannel } from '@/lib/supabase/realtime'
import { threadKeys } from '@/queries/threads'

/**
 * Subscribe to real-time thread message updates.
 * Invalidates message queries when new messages arrive.
 */
export function useRealtimeThreadMessages(threadId: string | null): void {
  const queryClient = useQueryClient()

  React.useEffect(() => {
    if (!threadId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`thread-messages-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'thread_messages',
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: threadKeys.messages(threadId) })
        }
      )
      .subscribe()

    return () => {
      unsubscribeFromChannel(channel)
    }
  }, [threadId, queryClient])
}
