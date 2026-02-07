'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types/threads'

// =============================================================================
// Query Keys
// =============================================================================

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
}

// =============================================================================
// Notifications List
// =============================================================================

export function useNotifications(limit: number = 20) {
  const supabase = createClient()

  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async (): Promise<Notification[]> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          workspace_id,
          recipient_id,
          type,
          title,
          body,
          thread_id,
          message_id,
          actor_id,
          is_read,
          read_at,
          created_at,
          actor:profiles!notifications_actor_id_fkey (
            full_name
          )
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data ?? []).map((n): Notification => {
        const actorData = n.actor as
          | { full_name: string | null }
          | { full_name: string | null }[]
          | null
        const actor = Array.isArray(actorData) ? actorData[0] : actorData

        return {
          id: n.id,
          workspaceId: n.workspace_id,
          recipientId: n.recipient_id,
          type: n.type as Notification['type'],
          title: n.title,
          body: n.body,
          threadId: n.thread_id,
          messageId: n.message_id,
          actorId: n.actor_id,
          actorName: actor?.full_name ?? null,
          isRead: n.is_read,
          readAt: n.read_at,
          createdAt: n.created_at,
        }
      })
    },
    staleTime: 1000 * 30,
  })
}

// =============================================================================
// Unread Count
// =============================================================================

export function useUnreadCount() {
  const supabase = createClient()

  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async (): Promise<number> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return 0

      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false)

      if (error) throw error
      return count ?? 0
    },
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
  })
}

// =============================================================================
// Mark as Read
// =============================================================================

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    },
  })
}

// =============================================================================
// Mark All as Read
// =============================================================================

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Niet ingelogd')

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_id', user.id)
        .eq('is_read', false)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    },
  })
}
