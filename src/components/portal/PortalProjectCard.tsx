"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar, MapPin, CheckCircle2, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { PortalProject } from "@/types/portal";

// =============================================================================
// Types
// =============================================================================

interface PortalProjectCardProps {
  project: PortalProject;
}

// =============================================================================
// Helper Functions
// =============================================================================

/** Format date in Dutch locale with abbreviated month and year */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Format date in Dutch locale with abbreviated month (no year) */
function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
  });
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    gepland: "Gepland",
    actief: "Actief",
    "on-hold": "On-hold",
    afgerond: "Afgerond",
    geannuleerd: "Geannuleerd",
  };
  return labels[status] ?? status;
}

function getStatusVariant(
  status: string
): "default" | "secondary" | "success" | "warning" | "destructive" {
  const variants: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
    gepland: "secondary",
    actief: "default",
    "on-hold": "warning",
    afgerond: "success",
    geannuleerd: "destructive",
  };
  return variants[status] ?? "secondary";
}

function getWorkTypeLabel(workType: string): string {
  const labels: Record<string, string> = {
    straatwerk: "Straatwerk",
    kitwerk: "Kitwerk",
    reinigen: "Reinigen",
    kantoor: "Kantoor",
    overig: "Overig",
  };
  return labels[workType] ?? workType;
}

// =============================================================================
// Component
// =============================================================================

export function PortalProjectCard({ project }: PortalProjectCardProps) {
  const isComplete = project.status === "afgerond";
  const isActive = project.status === "actief";

  return (
    <Link
      href={`/portal/projects/${project.id}`}
      className={cn(
        "group block rounded-xl border bg-card p-4 transition-all hover:shadow-md sm:p-5",
        isActive
          ? "border-zinc-300 dark:border-zinc-600"
          : "border-border hover:border-zinc-300 dark:hover:border-zinc-600"
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4 sm:gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold group-hover:text-zinc-700 sm:text-lg dark:group-hover:text-zinc-200">
            {project.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            {getWorkTypeLabel(project.workType)}
          </p>
        </div>
        <Badge variant={getStatusVariant(project.status)} className="shrink-0 text-xs">
          {getStatusLabel(project.status)}
        </Badge>
      </div>

      {/* Description */}
      {project.description && (
        <p className="mb-3 line-clamp-2 text-xs text-muted-foreground sm:mb-4 sm:text-sm">
          {project.description}
        </p>
      )}

      {/* Progress */}
      <div className="mb-3 sm:mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Voortgang</span>
          <span className="text-xs font-medium tabular-nums">{project.progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 sm:h-2 dark:bg-zinc-700">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isComplete
                ? "bg-green-500"
                : isActive
                ? "bg-zinc-700 dark:bg-zinc-300"
                : "bg-zinc-400 dark:bg-zinc-500"
            )}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Task Count */}
      <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground sm:mb-4 sm:text-sm">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>
            {project.completedTaskCount}/{project.taskCount} taken
          </span>
        </div>
      </div>

      {/* Info Grid - stacked on mobile, responsive */}
      <div className="grid gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground sm:gap-2 sm:pt-4">
        {/* Dates - show short format on mobile */}
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
          <span className="truncate sm:hidden">
            {formatShortDate(project.startDate)} - {formatShortDate(project.endDate)}
          </span>
          <span className="hidden truncate sm:inline">
            {formatDate(project.startDate)} - {formatDate(project.endDate)}
          </span>
        </div>

        {/* Location */}
        {(project.locationName || project.locationCity) && (
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
            <span className="truncate">
              {project.locationName}
              {project.locationCity && `, ${project.locationCity}`}
            </span>
          </div>
        )}

        {/* Project Manager */}
        {project.projectManager && (
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
            <span className="truncate">{project.projectManager.name}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

// =============================================================================
// Empty State
// =============================================================================

export function PortalProjectsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center sm:px-6 sm:py-16 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-4 rounded-full bg-zinc-200 p-3 sm:p-4 dark:bg-zinc-800">
        <Clock className="h-6 w-6 text-zinc-500 sm:h-8 sm:w-8 dark:text-zinc-400" />
      </div>
      <h3 className="mb-2 text-base font-medium sm:text-lg">Geen projecten gevonden</h3>
      <p className="max-w-sm text-xs text-muted-foreground sm:text-sm">
        Er zijn momenteel geen projecten beschikbaar voor uw account. Neem contact op met uw
        contactpersoon als u vragen heeft.
      </p>
    </div>
  );
}
