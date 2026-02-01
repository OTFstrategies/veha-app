import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface DashboardSections {
  todayTasks: boolean;
  capacity: boolean;
  activeProjects: boolean;
}

interface UIState {
  // Sidebar state
  sidebarCollapsed: boolean;
  sidebarHovered: boolean;
  sidebarPinned: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarHovered: (hovered: boolean) => void;
  toggleSidebarPinned: () => void;

  // Theme
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;

  // Dashboard sections
  dashboardSections: DashboardSections;
  toggleDashboardSection: (section: keyof DashboardSections) => void;

  // Reset function
  resetToDefaults: () => void;
}

const defaultState = {
  sidebarCollapsed: true,
  sidebarHovered: false,
  sidebarPinned: false,
  theme: "system" as const,
  dashboardSections: {
    todayTasks: true,
    capacity: true,
    activeProjects: true,
  },
};

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        // Sidebar - collapsed by default
        ...defaultState,

        toggleSidebar: () =>
          set(
            (state) => ({ sidebarCollapsed: !state.sidebarCollapsed }),
            false,
            "toggleSidebar"
          ),
        setSidebarCollapsed: (collapsed) =>
          set({ sidebarCollapsed: collapsed }, false, "setSidebarCollapsed"),
        setSidebarHovered: (hovered) =>
          set({ sidebarHovered: hovered }, false, "setSidebarHovered"),
        toggleSidebarPinned: () =>
          set(
            (state) => ({
              sidebarPinned: !state.sidebarPinned,
              // When pinning, expand the sidebar
              sidebarCollapsed: state.sidebarPinned
                ? state.sidebarCollapsed
                : false,
            }),
            false,
            "toggleSidebarPinned"
          ),

        // Theme
        setTheme: (theme) => set({ theme }, false, "setTheme"),

        // Dashboard sections
        toggleDashboardSection: (section) =>
          set(
            (state) => ({
              dashboardSections: {
                ...state.dashboardSections,
                [section]: !state.dashboardSections[section],
              },
            }),
            false,
            "toggleDashboardSection"
          ),

        // Reset function
        resetToDefaults: () =>
          set(defaultState, false, "resetToDefaults"),
      }),
      {
        name: "veha-ui-storage",
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          sidebarPinned: state.sidebarPinned,
          dashboardSections: state.dashboardSections,
          theme: state.theme,
        }),
      }
    ),
    { name: "UIStore" }
  )
);
