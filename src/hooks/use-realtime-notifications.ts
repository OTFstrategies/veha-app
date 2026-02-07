import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { unsubscribeFromChannel } from '@/lib/supabase/realtime'
import { notificationKeys } from '@/queries/notifications'
import { useToast } from '@/components/ui/toast'

/**
 * Subscribe to real-time notification updates for the current user.
 * Shows a toast when a new notification arrives and updates the unread count.
 */
export function useRealtimeNotifications(userId: string | null): void {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  React.useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as { title?: string; body?: string }

          // Show toast for new notification
          addToast({
            type: 'info',
            title: notification.title ?? 'Nieuwe melding',
            description: notification.body ?? undefined,
          })

          // Refresh notification queries
          queryClient.invalidateQueries({ queryKey: notificationKeys.list() })
          queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
        }
      )
      .subscribe()

    return () => {
      unsubscribeFromChannel(channel)
    }
  }, [userId, queryClient, addToast])
}
