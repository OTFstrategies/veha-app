import * as React from 'react'
import { useAuth } from '@/hooks/use-auth'
import { usePresenceStore } from '@/stores/presence-store'
import {
  subscribeToPresence,
  updatePresence,
  unsubscribeFromChannel,
  type PresenceState,
} from '@/lib/supabase/realtime'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Hook to track and broadcast user presence for a project.
 * Handles joining, leaving, and updating what task the user is viewing.
 */
export function usePresence(projectId: string | null): {
  setViewingTask: (taskId: string | null) => void
} {
  const { user } = useAuth()
  const { setActiveUsers, addUser, removeUser, clearPresence } = usePresenceStore()
  const channelRef = React.useRef<RealtimeChannel | null>(null)

  // Subscribe to presence on mount
  React.useEffect(() => {
    if (!projectId || !user) return

    // Get name from user metadata or email
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anoniem'
    const avatarUrl = user.user_metadata?.avatar_url || null

    const currentUser: Omit<PresenceState, 'lastSeen'> = {
      id: user.id,
      name: fullName,
      email: user.email || '',
      avatarUrl,
      viewingTaskId: null,
    }

    const channel = subscribeToPresence(projectId, currentUser, {
      onSync: (users) => {
        setActiveUsers(users)
      },
      onJoin: (presenceUser) => {
        addUser(presenceUser)
      },
      onLeave: (userId) => {
        removeUser(userId)
      },
    })

    channelRef.current = channel

    // Cleanup on unmount
    return () => {
      clearPresence()
      if (channelRef.current) {
        unsubscribeFromChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [projectId, user, setActiveUsers, addUser, removeUser, clearPresence])

  // Function to update what task the user is viewing
  const setViewingTask = React.useCallback(
    (taskId: string | null) => {
      if (channelRef.current) {
        updatePresence(channelRef.current, { viewingTaskId: taskId })
      }
    },
    []
  )

  return { setViewingTask }
}
