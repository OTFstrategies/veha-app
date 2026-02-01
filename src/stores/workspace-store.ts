import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface WorkspaceState {
  currentWorkspaceId: string | null;
  setCurrentWorkspace: (id: string | null) => void;
  clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  devtools(
    persist(
      (set) => ({
        currentWorkspaceId: null,
        setCurrentWorkspace: (id) =>
          set({ currentWorkspaceId: id }, false, "setCurrentWorkspace"),
        clearWorkspace: () =>
          set({ currentWorkspaceId: null }, false, "clearWorkspace"),
      }),
      {
        name: "veha-workspace",
      }
    ),
    { name: "WorkspaceStore" }
  )
);
