import { create } from 'zustand'

// =============================================================================
// Types
// =============================================================================

export interface UserPresence {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  viewingTaskId: string | null
  lastSeen: string
}

interface PresenceState {
  /** Currently active users on the project */
  activeUsers: UserPresence[]

  /** Set all active users (from presence sync) */
  setActiveUsers: (users: UserPresence[]) => void

  /** Add a user when they join */
  addUser: (user: UserPresence) => void

  /** Remove a user when they leave */
  removeUser: (userId: string) => void

  /** Update a user's activity (e.g., which task they're viewing) */
  updateUserActivity: (userId: string, viewingTaskId: string | null) => void

  /** Clear all presence state */
  clearPresence: () => void
}

// =============================================================================
// Store
// =============================================================================

export const usePresenceStore = create<PresenceState>((set) => ({
  activeUsers: [],

  setActiveUsers: (users) => set({ activeUsers: users }),

  addUser: (user) =>
    set((state) => ({
      activeUsers: [
        ...state.activeUsers.filter((u) => u.id !== user.id),
        user,
      ],
    })),

  removeUser: (userId) =>
    set((state) => ({
      activeUsers: state.activeUsers.filter((u) => u.id !== userId),
    })),

  updateUserActivity: (userId, viewingTaskId) =>
    set((state) => ({
      activeUsers: state.activeUsers.map((u) =>
        u.id === userId
          ? { ...u, viewingTaskId, lastSeen: new Date().toISOString() }
          : u
      ),
    })),

  clearPresence: () => set({ activeUsers: [] }),
}))
