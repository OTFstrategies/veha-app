import { create } from "zustand"
import { persist } from "zustand/middleware"

export type GroupByOption = "none" | "status" | "client" | "workType"

interface ListViewState {
  projectsGroupBy: GroupByOption
  setProjectsGroupBy: (groupBy: GroupByOption) => void

  expandedGroups: Set<string>
  toggleGroup: (groupId: string) => void
  expandAllGroups: () => void
  collapseAllGroups: () => void
}

export const useListViewStore = create<ListViewState>()(
  persist(
    (set, get) => ({
      projectsGroupBy: "none",
      setProjectsGroupBy: (groupBy) => set({ projectsGroupBy: groupBy }),

      expandedGroups: new Set<string>(),
      toggleGroup: (groupId) => {
        const current = get().expandedGroups
        const next = new Set(current)
        if (next.has(groupId)) {
          next.delete(groupId)
        } else {
          next.add(groupId)
        }
        set({ expandedGroups: next })
      },
      expandAllGroups: () => set({ expandedGroups: new Set() }),
      collapseAllGroups: () => set({ expandedGroups: new Set() }),
    }),
    {
      name: "list-view-storage",
      partialize: (state) => ({ projectsGroupBy: state.projectsGroupBy }),
    }
  )
)
