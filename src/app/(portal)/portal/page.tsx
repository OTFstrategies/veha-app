"use client";

import * as React from "react";
import { FolderOpen, Search, Filter, Eye } from "lucide-react";
import { usePortalProjects, usePortalUser } from "@/queries/portal";
import { PortalProjectCard, PortalProjectsEmpty } from "@/components/portal/PortalProjectCard";
import { QueryError } from "@/components/ui/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PortalProject } from "@/types/portal";

// =============================================================================
// Constants
// =============================================================================

const STATUS_OPTIONS = [
  { value: "gepland", label: "Gepland" },
  { value: "actief", label: "Actief" },
  { value: "on-hold", label: "On-hold" },
  { value: "afgerond", label: "Afgerond" },
] as const;

// =============================================================================
// Loading Skeleton
// =============================================================================

function PortalDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Project Cards Skeleton */}
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5">
              <div className="flex justify-between mb-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full mb-4 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Filter Hook
// =============================================================================

function useProjectFilters(projects: PortalProject[] | undefined) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);

  const filteredProjects = React.useMemo(() => {
    if (!projects) return [];

    return projects.filter((project) => {
      // Search filter - match name or description
      const matchesSearch =
        searchQuery === "" ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(project.status);

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const toggleStatus = React.useCallback((status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  }, []);

  const clearFilters = React.useCallback(() => {
    setSearchQuery("");
    setStatusFilter([]);
  }, []);

  const hasActiveFilters = searchQuery !== "" || statusFilter.length > 0;

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    toggleStatus,
    filteredProjects,
    hasActiveFilters,
    clearFilters,
  };
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function PortalDashboardPage() {
  const { data: portalUser, isLoading: isUserLoading } = usePortalUser();
  const {
    data: projects,
    isLoading: isProjectsLoading,
    error,
    refetch,
  } = usePortalProjects();

  const isLoading = isUserLoading || isProjectsLoading;

  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    toggleStatus,
    filteredProjects,
    hasActiveFilters,
    clearFilters,
  } = useProjectFilters(projects);

  // Calculate stats (from all projects, not filtered)
  const activeProjects = projects?.filter((p) => p.status === "actief").length ?? 0;
  const completedProjects = projects?.filter((p) => p.status === "afgerond").length ?? 0;
  const plannedProjects = projects?.filter((p) => p.status === "gepland").length ?? 0;

  const isViewer = portalUser?.role === "klant_viewer";

  // Show loading state
  if (isLoading) {
    return <PortalDashboardSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Mijn Projecten</h1>
          <p className="mt-1 text-muted-foreground">
            Bekijk de voortgang van uw projecten
          </p>
        </div>
        <QueryError error={error as Error} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">Mijn Projecten</h1>
            {isViewer && (
              <div className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                <Eye className="h-3 w-3" />
                Alleen lezen
              </div>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {portalUser?.clientName
              ? `Projecten voor ${portalUser.clientName}`
              : "Bekijk de voortgang van uw projecten"}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {projects && projects.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-lg border bg-card p-3 sm:p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
              <div className="h-2 w-2 shrink-0 rounded-full bg-zinc-700 dark:bg-zinc-300" />
              <span className="truncate">Actief</span>
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">{activeProjects}</p>
          </div>
          <div className="rounded-lg border bg-card p-3 sm:p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
              <div className="h-2 w-2 shrink-0 rounded-full bg-zinc-400" />
              <span className="truncate">Gepland</span>
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">{plannedProjects}</p>
          </div>
          <div className="rounded-lg border bg-card p-3 sm:p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
              <div className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
              <span className="truncate">Afgerond</span>
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">{completedProjects}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      {projects && projects.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              type="search"
              placeholder="Zoek projecten..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Zoek projecten"
            />
          </div>

          {/* Status filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 shrink-0">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Status</span>
                {statusFilter.length > 0 && (
                  <span className="ml-1 rounded-full bg-zinc-900 px-2 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {statusFilter.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {STATUS_OPTIONS.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={statusFilter.includes(option.value)}
                  onCheckedChange={() => toggleStatus(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Results count */}
      {projects && projects.length > 0 && hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span>
            {filteredProjects.length} project{filteredProjects.length !== 1 ? "en" : ""} gevonden
          </span>
          <button
            onClick={clearFilters}
            className="text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            Filters wissen
          </button>
        </div>
      )}

      {/* Project List */}
      <div>
        {projects && projects.length > 0 ? (
          <>
            <div className="mb-4 flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">
                {hasActiveFilters
                  ? `Gefilterde Projecten (${filteredProjects.length})`
                  : `Alle Projecten (${projects.length})`}
              </h2>
            </div>

            {filteredProjects.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <PortalProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
                <p className="text-muted-foreground">
                  Geen projecten gevonden met de huidige filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-sm text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                >
                  Filters wissen
                </button>
              </div>
            )}
          </>
        ) : (
          <PortalProjectsEmpty />
        )}
      </div>
    </div>
  );
}
