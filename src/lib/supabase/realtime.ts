import { createClient } from './client'
import type { RealtimeChannel } from '@supabase/supabase-js'

// =============================================================================
// Task Change Subscriptions
// =============================================================================

/**
 * Subscribe to real-time task changes for a project.
 * Returns a channel that must be cleaned up with unsubscribeFromChannel().
 */
export function subscribeToTaskChanges(
  projectId: string,
  callbacks: {
    onInsert?: (task: Record<string, unknown>) => void
    onUpdate?: (task: Record<string, unknown>) => void
    onDelete?: (taskId: string) => void
  }
): RealtimeChannel {
  const supabase = createClient()

  return supabase
    .channel(`project-tasks-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => callbacks.onInsert?.(payload.new)
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => callbacks.onUpdate?.(payload.new)
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => callbacks.onDelete?.((payload.old as { id: string }).id)
    )
    .subscribe()
}

// =============================================================================
// Project Change Subscriptions
// =============================================================================

/**
 * Subscribe to real-time project changes.
 */
export function subscribeToProjectChanges(
  projectId: string,
  callbacks: {
    onUpdate?: (project: Record<string, unknown>) => void
  }
): RealtimeChannel {
  const supabase = createClient()

  return supabase
    .channel(`project-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'projects',
        filter: `id=eq.${projectId}`,
      },
      (payload) => callbacks.onUpdate?.(payload.new)
    )
    .subscribe()
}

// =============================================================================
// Presence Tracking
// =============================================================================

export interface PresenceState {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  viewingTaskId: string | null
  lastSeen: string
}

/**
 * Subscribe to presence updates for a project.
 */
export function subscribeToPresence(
  projectId: string,
  currentUser: Omit<PresenceState, 'lastSeen'>,
  callbacks: {
    onSync?: (users: PresenceState[]) => void
    onJoin?: (user: PresenceState) => void
    onLeave?: (userId: string) => void
  }
): RealtimeChannel {
  const supabase = createClient()

  const channel = supabase.channel(`presence-${projectId}`, {
    config: {
      presence: {
        key: currentUser.id,
      },
    },
  })

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const users: PresenceState[] = Object.values(state)
        .flat()
        .map((presence) => presence as unknown as PresenceState)
      callbacks.onSync?.(users)
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      const user = newPresences[0] as unknown as PresenceState
      callbacks.onJoin?.({ ...user, id: key })
    })
    .on('presence', { event: 'leave' }, ({ key }) => {
      callbacks.onLeave?.(key)
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          ...currentUser,
          lastSeen: new Date().toISOString(),
        })
      }
    })

  return channel
}

/**
 * Update presence state (e.g., when viewing a different task).
 */
export async function updatePresence(
  channel: RealtimeChannel,
  state: Partial<PresenceState>
): Promise<void> {
  await channel.track({
    ...state,
    lastSeen: new Date().toISOString(),
  })
}

// =============================================================================
// Cleanup
// =============================================================================

/**
 * Unsubscribe and clean up a realtime channel.
 */
export function unsubscribeFromChannel(channel: RealtimeChannel): void {
  const supabase = createClient()
  supabase.removeChannel(channel)
}
