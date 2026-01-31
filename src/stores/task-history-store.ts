import { create } from 'zustand'

/**
 * Snapshot of a task's dates at a point in time
 */
export interface TaskSnapshot {
  id: string
  startDate: string
  endDate: string
}

/**
 * A history entry representing a set of task changes that can be undone
 */
export interface HistoryEntry {
  timestamp: number
  description: string
  snapshots: TaskSnapshot[]
}

/**
 * Store for managing task date history with undo/redo functionality
 */
interface TaskHistoryStore {
  history: HistoryEntry[]
  currentIndex: number

  // Actions
  pushState: (description: string, snapshots: TaskSnapshot[]) => void
  undo: () => HistoryEntry | null
  redo: () => HistoryEntry | null
  canUndo: () => boolean
  canRedo: () => boolean
  clear: () => void
}

const MAX_HISTORY_ENTRIES = 20

export const useTaskHistoryStore = create<TaskHistoryStore>()((set, get) => ({
  history: [],
  currentIndex: -1,

  pushState: (description, snapshots) => {
    const { history, currentIndex } = get()

    // Remove any future states if we're not at the end
    const newHistory = history.slice(0, currentIndex + 1)

    newHistory.push({
      timestamp: Date.now(),
      description,
      snapshots,
    })

    // Keep max entries
    if (newHistory.length > MAX_HISTORY_ENTRIES) {
      newHistory.shift()
    }

    set({
      history: newHistory,
      currentIndex: newHistory.length - 1,
    })
  },

  undo: () => {
    const { history, currentIndex } = get()
    if (currentIndex < 0) return null

    const entry = history[currentIndex]
    set({ currentIndex: currentIndex - 1 })
    return entry
  },

  redo: () => {
    const { history, currentIndex } = get()
    if (currentIndex >= history.length - 1) return null

    set({ currentIndex: currentIndex + 1 })
    return history[currentIndex + 1]
  },

  canUndo: () => get().currentIndex >= 0,
  canRedo: () => get().currentIndex < get().history.length - 1,

  clear: () => set({ history: [], currentIndex: -1 }),
}))
