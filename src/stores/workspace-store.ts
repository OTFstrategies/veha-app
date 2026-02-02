import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface WorkspaceState {
  currentWorkspaceId: string | null;
  setCurrentWorkspace: (id: string | null) => void;
  clearWorkspace: () => void;
}

// Version 2: Reset stale workspace IDs from pre-Hub migration
const STORE_VERSION = 2;

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
        version: STORE_VERSION,
        migrate: (persistedState, version) => {
          if (version < 2) {
            // Reset workspace bij migratie naar Hub - oude IDs zijn niet meer geldig
            console.log("[VEHA] Migrating workspace store to v2, resetting stale workspace ID");
            return { currentWorkspaceId: null };
          }
          return persistedState as WorkspaceState;
        },
      }
    ),
    { name: "WorkspaceStore" }
  )
);
