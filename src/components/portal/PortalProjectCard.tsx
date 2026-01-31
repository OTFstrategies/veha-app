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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
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
        "group block rounded-xl border bg-card p-5 transition-all hover:shadow-md",
        isActive
          ? "border-stone-300 dark:border-stone-600"
          : "border-border hover:border-stone-300 dark:hover:border-stone-600"
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold group-hover:text-stone-700 dark:group-hover:text-stone-200">
            {project.name}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {getWorkTypeLabel(project.workType)}
          </p>
        </div>
        <Badge variant={getStatusVariant(project.status)}>
          {getStatusLabel(project.status)}
        </Badge>
      </div>

      {/* Description */}
      {project.description && (
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
          {project.description}
        </p>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Voortgang</span>
          <span className="text-xs font-medium tabular-nums">{project.progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isComplete
                ? "bg-green-500"
                : isActive
                ? "bg-stone-700 dark:bg-stone-300"
                : "bg-stone-400 dark:bg-stone-500"
            )}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Task Count */}
      <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4" />
          <span>
            {project.completedTaskCount}/{project.taskCount} taken
          </span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
        {/* Dates */}
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>
            {formatDate(project.startDate)} - {formatDate(project.endDate)}
          </span>
        </div>

        {/* Location */}
        {(project.locationName || project.locationCity) && (
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {project.locationName}
              {project.locationCity && `, ${project.locationCity}`}
            </span>
          </div>
        )}

        {/* Project Manager */}
        {project.projectManager && (
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 shrink-0" />
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 px-6 py-16 text-center dark:border-stone-700 dark:bg-stone-900">
      <div className="mb-4 rounded-full bg-stone-200 p-4 dark:bg-stone-800">
        <Clock className="h-8 w-8 text-stone-500 dark:text-stone-400" />
      </div>
      <h3 className="mb-2 text-lg font-medium">Geen projecten gevonden</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Er zijn momenteel geen projecten beschikbaar voor uw account. Neem contact op met uw
        contactpersoon als u vragen heeft.
      </p>
    </div>
  );
}
