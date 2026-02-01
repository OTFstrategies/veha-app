import { create } from "zustand";
import { persist } from "zustand/middleware";

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
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar - collapsed by default
      sidebarCollapsed: true,
      sidebarHovered: false,
      sidebarPinned: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setSidebarHovered: (hovered) => set({ sidebarHovered: hovered }),
      toggleSidebarPinned: () =>
        set((state) => ({
          sidebarPinned: !state.sidebarPinned,
          // When pinning, expand the sidebar
          sidebarCollapsed: state.sidebarPinned ? state.sidebarCollapsed : false,
        })),

      // Theme
      theme: "system",
      setTheme: (theme) => set({ theme }),

      // Dashboard sections - all visible by default
      dashboardSections: {
        todayTasks: true,
        capacity: true,
        activeProjects: true,
      },
      toggleDashboardSection: (section) =>
        set((state) => ({
          dashboardSections: {
            ...state.dashboardSections,
            [section]: !state.dashboardSections[section],
          },
        })),
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
  )
);
