import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * Snapshot of a task's dates at a point in time
 */
export interface TaskSnapshot {
  id: string;
  startDate: string;
  endDate: string;
}

/**
 * A history entry representing a set of task changes that can be undone
 */
export interface HistoryEntry {
  timestamp: number;
  description: string;
  snapshots: TaskSnapshot[];
}

/**
 * Store for managing task date history with undo/redo functionality
 */
interface TaskHistoryStore {
  history: HistoryEntry[];
  currentIndex: number;

  // Actions
  pushState: (description: string, snapshots: TaskSnapshot[]) => void;
  undo: () => HistoryEntry | null;
  redo: () => HistoryEntry | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
  getHistoryLength: () => number;
}

const MAX_HISTORY_ENTRIES = 20;

export const useTaskHistoryStore = create<TaskHistoryStore>()(
  devtools(
    (set, get) => ({
      history: [],
      currentIndex: -1,

      pushState: (description, snapshots) => {
        const { history, currentIndex } = get();

        // Prevent duplicate entries for the same state
        const lastEntry = history[currentIndex];
        if (
          lastEntry &&
          JSON.stringify(lastEntry.snapshots) === JSON.stringify(snapshots)
        ) {
          return;
        }

        // Remove any future states if we're not at the end
        const newHistory = history.slice(0, currentIndex + 1);

        newHistory.push({
          timestamp: Date.now(),
          description,
          snapshots,
        });

        // Keep max entries
        if (newHistory.length > MAX_HISTORY_ENTRIES) {
          newHistory.shift();
        }

        set(
          {
            history: newHistory,
            currentIndex: newHistory.length - 1,
          },
          false,
          "pushState"
        );
      },

      undo: () => {
        const { history, currentIndex } = get();
        if (currentIndex < 0) return null;

        const entry = history[currentIndex];
        set({ currentIndex: currentIndex - 1 }, false, "undo");
        return entry;
      },

      redo: () => {
        const { history, currentIndex } = get();
        if (currentIndex >= history.length - 1) return null;

        const newIndex = currentIndex + 1;
        set({ currentIndex: newIndex }, false, "redo");
        return history[newIndex];
      },

      canUndo: () => get().currentIndex >= 0,
      canRedo: () => {
        const { currentIndex, history } = get();
        return currentIndex < history.length - 1;
      },

      clear: () => set({ history: [], currentIndex: -1 }, false, "clear"),

      getHistoryLength: () => get().history.length,
    }),
    { name: "TaskHistoryStore" }
  )
);
