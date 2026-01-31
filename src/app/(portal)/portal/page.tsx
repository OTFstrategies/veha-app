"use client";

import * as React from "react";
import { FolderOpen } from "lucide-react";
import { usePortalProjects, usePortalUser } from "@/queries/portal";
import { PortalProjectCard, PortalProjectsEmpty } from "@/components/portal/PortalProjectCard";
import { QueryError } from "@/components/ui/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
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

  // Calculate stats
  const activeProjects = projects?.filter((p) => p.status === "actief").length ?? 0;
  const completedProjects = projects?.filter((p) => p.status === "afgerond").length ?? 0;
  const plannedProjects = projects?.filter((p) => p.status === "gepland").length ?? 0;

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
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Mijn Projecten</h1>
        <p className="mt-1 text-muted-foreground">
          {portalUser?.clientName
            ? `Projecten voor ${portalUser.clientName}`
            : "Bekijk de voortgang van uw projecten"}
        </p>
      </div>

      {/* Stats Cards */}
      {projects && projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-stone-700 dark:bg-stone-300" />
              Actief
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums">{activeProjects}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-stone-400" />
              Gepland
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums">{plannedProjects}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Afgerond
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums">{completedProjects}</p>
          </div>
        </div>
      )}

      {/* Project List */}
      <div>
        {projects && projects.length > 0 ? (
          <>
            <div className="mb-4 flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">
                Alle Projecten ({projects.length})
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <PortalProjectCard key={project.id} project={project} />
              ))}
            </div>
          </>
        ) : (
          <PortalProjectsEmpty />
        )}
      </div>
    </div>
  );
}
