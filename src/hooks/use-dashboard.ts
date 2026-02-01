"use client";

import {
  useDashboardStats,
  useTodayTasks,
  useActiveProjects,
  useCapacity,
} from "@/queries/dashboard";
import type {
  DashboardStats,
  TodayTaskGroup,
  ActiveProject,
  CapacityEntry,
} from "@/types/dashboard";

// =============================================================================
// Default Values
// =============================================================================

const defaultStats: DashboardStats = {
  activeProjects: { count: 0, newThisMonth: 0 },
  todayTasks: { count: 0, completed: 0 },
  availableEmployees: { available: 0, total: 0 },
  attentionNeeded: { count: 0 },
};

// =============================================================================
// Combined Hook
// =============================================================================

export interface UseDashboardResult {
  // Data
  stats: DashboardStats;
  todayTasks: TodayTaskGroup[];
  activeProjects: ActiveProject[];
  capacityData: CapacityEntry[];

  // Loading states
  isLoading: boolean;
  isStatsLoading: boolean;
  isTodayTasksLoading: boolean;
  isActiveProjectsLoading: boolean;
  isCapacityLoading: boolean;

  // Error states
  error: Error | null;
  statsError: Error | null;
  todayTasksError: Error | null;
  activeProjectsError: Error | null;
  capacityError: Error | null;

  // Refetch functions
  refetchAll: () => void;
  refetchStats: () => void;
  refetchTodayTasks: () => void;
  refetchActiveProjects: () => void;
  refetchCapacity: () => void;
}

export function useDashboard(): UseDashboardResult {
  const statsQuery = useDashboardStats();
  const todayTasksQuery = useTodayTasks();
  const activeProjectsQuery = useActiveProjects();
  const capacityQuery = useCapacity();

  // Combined loading state
  const isLoading =
    statsQuery.isLoading ||
    todayTasksQuery.isLoading ||
    activeProjectsQuery.isLoading ||
    capacityQuery.isLoading;

  // Combined error (return first error found)
  const error =
    statsQuery.error ||
    todayTasksQuery.error ||
    activeProjectsQuery.error ||
    capacityQuery.error;

  // Refetch all data
  const refetchAll = () => {
    statsQuery.refetch();
    todayTasksQuery.refetch();
    activeProjectsQuery.refetch();
    capacityQuery.refetch();
  };

  return {
    // Data with fallbacks
    stats: statsQuery.data ?? defaultStats,
    todayTasks: todayTasksQuery.data ?? [],
    activeProjects: activeProjectsQuery.data ?? [],
    capacityData: capacityQuery.data ?? [],

    // Loading states
    isLoading,
    isStatsLoading: statsQuery.isLoading,
    isTodayTasksLoading: todayTasksQuery.isLoading,
    isActiveProjectsLoading: activeProjectsQuery.isLoading,
    isCapacityLoading: capacityQuery.isLoading,

    // Error states
    error: error as Error | null,
    statsError: statsQuery.error as Error | null,
    todayTasksError: todayTasksQuery.error as Error | null,
    activeProjectsError: activeProjectsQuery.error as Error | null,
    capacityError: capacityQuery.error as Error | null,

    // Refetch functions
    refetchAll,
    refetchStats: () => statsQuery.refetch(),
    refetchTodayTasks: () => todayTasksQuery.refetch(),
    refetchActiveProjects: () => activeProjectsQuery.refetch(),
    refetchCapacity: () => capacityQuery.refetch(),
  };
}
