"use client";

import { useCallback, useMemo } from "react";
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

  // Fetching states (for showing refresh indicators)
  isFetching: boolean;
  isStatsFetching: boolean;
  isTodayTasksFetching: boolean;
  isActiveProjectsFetching: boolean;
  isCapacityFetching: boolean;

  // Error states
  error: Error | null;
  statsError: Error | null;
  todayTasksError: Error | null;
  activeProjectsError: Error | null;
  capacityError: Error | null;

  // Computed values
  hasData: boolean;
  hasErrors: boolean;

  // Refetch functions
  refetchAll: () => Promise<void>;
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
  const isLoading = useMemo(
    () =>
      statsQuery.isLoading ||
      todayTasksQuery.isLoading ||
      activeProjectsQuery.isLoading ||
      capacityQuery.isLoading,
    [
      statsQuery.isLoading,
      todayTasksQuery.isLoading,
      activeProjectsQuery.isLoading,
      capacityQuery.isLoading,
    ]
  );

  // Combined fetching state (includes background refetches)
  const isFetching = useMemo(
    () =>
      statsQuery.isFetching ||
      todayTasksQuery.isFetching ||
      activeProjectsQuery.isFetching ||
      capacityQuery.isFetching,
    [
      statsQuery.isFetching,
      todayTasksQuery.isFetching,
      activeProjectsQuery.isFetching,
      capacityQuery.isFetching,
    ]
  );

  // Combined error (return first error found)
  const error = useMemo(
    () =>
      statsQuery.error ||
      todayTasksQuery.error ||
      activeProjectsQuery.error ||
      capacityQuery.error,
    [
      statsQuery.error,
      todayTasksQuery.error,
      activeProjectsQuery.error,
      capacityQuery.error,
    ]
  );

  // Check if we have any data
  const hasData = useMemo(
    () =>
      !!statsQuery.data ||
      !!todayTasksQuery.data ||
      !!activeProjectsQuery.data ||
      !!capacityQuery.data,
    [
      statsQuery.data,
      todayTasksQuery.data,
      activeProjectsQuery.data,
      capacityQuery.data,
    ]
  );

  // Check if we have any errors
  const hasErrors = useMemo(
    () =>
      !!statsQuery.error ||
      !!todayTasksQuery.error ||
      !!activeProjectsQuery.error ||
      !!capacityQuery.error,
    [
      statsQuery.error,
      todayTasksQuery.error,
      activeProjectsQuery.error,
      capacityQuery.error,
    ]
  );

  // Refetch all data with Promise.all for parallel execution
  const refetchAll = useCallback(async () => {
    await Promise.all([
      statsQuery.refetch(),
      todayTasksQuery.refetch(),
      activeProjectsQuery.refetch(),
      capacityQuery.refetch(),
    ]);
  }, [statsQuery, todayTasksQuery, activeProjectsQuery, capacityQuery]);

  // Individual refetch callbacks
  const refetchStats = useCallback(
    () => void statsQuery.refetch(),
    [statsQuery]
  );
  const refetchTodayTasks = useCallback(
    () => void todayTasksQuery.refetch(),
    [todayTasksQuery]
  );
  const refetchActiveProjects = useCallback(
    () => void activeProjectsQuery.refetch(),
    [activeProjectsQuery]
  );
  const refetchCapacity = useCallback(
    () => void capacityQuery.refetch(),
    [capacityQuery]
  );

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

    // Fetching states
    isFetching,
    isStatsFetching: statsQuery.isFetching,
    isTodayTasksFetching: todayTasksQuery.isFetching,
    isActiveProjectsFetching: activeProjectsQuery.isFetching,
    isCapacityFetching: capacityQuery.isFetching,

    // Error states
    error: error as Error | null,
    statsError: statsQuery.error as Error | null,
    todayTasksError: todayTasksQuery.error as Error | null,
    activeProjectsError: activeProjectsQuery.error as Error | null,
    capacityError: capacityQuery.error as Error | null,

    // Computed values
    hasData,
    hasErrors,

    // Refetch functions
    refetchAll,
    refetchStats,
    refetchTodayTasks,
    refetchActiveProjects,
    refetchCapacity,
  };
}
