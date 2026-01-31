"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Flag,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { PortalProjectDetail, PortalTaskSummary } from "@/types/portal";

// =============================================================================
// Types
// =============================================================================

interface PortalProjectViewProps {
  project: PortalProjectDetail;
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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

function getTaskStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    todo: "Te doen",
    in_progress: "Bezig",
    done: "Afgerond",
  };
  return labels[status] ?? status;
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
// Task Item Component
// =============================================================================

interface TaskItemProps {
  task: PortalTaskSummary;
}

function TaskItem({ task }: TaskItemProps) {
  const isDone = task.status === "done";
  const isInProgress = task.status === "in_progress";

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 transition-colors",
        isDone
          ? "border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-900/20"
          : isInProgress
          ? "border-stone-300 bg-stone-50 dark:border-stone-600 dark:bg-stone-800"
          : "border-border bg-card"
      )}
    >
      {/* Status Icon */}
      <div className="mt-0.5 shrink-0">
        {isDone ? (
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
        ) : isInProgress ? (
          <Loader2 className="h-5 w-5 animate-spin text-stone-600 dark:text-stone-400" />
        ) : (
          <Circle className="h-5 w-5 text-stone-400 dark:text-stone-500" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <h4
              className={cn(
                "font-medium",
                isDone && "text-green-700 dark:text-green-300",
                isInProgress && "text-stone-900 dark:text-stone-100"
              )}
            >
              {task.name}
            </h4>
            {task.isMilestone && (
              <Flag className="h-4 w-4 text-amber-500" aria-label="Mijlpaal" />
            )}
          </div>
          <Badge
            variant={isDone ? "success" : isInProgress ? "secondary" : "outline"}
            className="shrink-0 text-xs"
          >
            {getTaskStatusLabel(task.status)}
          </Badge>
        </div>

        {/* Progress and Dates */}
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {/* Progress */}
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isDone
                    ? "bg-green-500"
                    : isInProgress
                    ? "bg-stone-600 dark:bg-stone-300"
                    : "bg-stone-400"
                )}
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <span className="tabular-nums">{task.progress}%</span>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {formatShortDate(task.startDate)} - {formatShortDate(task.endDate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function PortalProjectView({ project }: PortalProjectViewProps) {
  const isComplete = project.status === "afgerond";
  const isActive = project.status === "actief";

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/portal" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Terug naar overzicht
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{project.name}</h1>
          <p className="mt-1 text-muted-foreground">
            {getWorkTypeLabel(project.workType)}
          </p>
        </div>
        <Badge variant={getStatusVariant(project.status)} className="w-fit text-sm">
          {getStatusLabel(project.status)}
        </Badge>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-muted-foreground">{project.description}</p>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Progress */}
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-2 text-sm text-muted-foreground">Voortgang</div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold tabular-nums">{project.progress}%</span>
            <div className="flex-1 ml-4 mb-1">
              <div className="h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isComplete
                      ? "bg-green-500"
                      : isActive
                      ? "bg-stone-700 dark:bg-stone-300"
                      : "bg-stone-400"
                  )}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-2 text-sm text-muted-foreground">Taken</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums">
              {project.completedTaskCount}
            </span>
            <span className="text-muted-foreground">/ {project.taskCount}</span>
          </div>
        </div>

        {/* Start Date */}
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-2 text-sm text-muted-foreground">Startdatum</div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formatDate(project.startDate)}</span>
          </div>
        </div>

        {/* End Date */}
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-2 text-sm text-muted-foreground">Einddatum</div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formatDate(project.endDate)}</span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Tasks */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Taken Overzicht</h2>
          {project.tasks.length > 0 ? (
            <div className="space-y-3">
              {project.tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-stone-50 p-8 text-center dark:bg-stone-900">
              <p className="text-muted-foreground">
                Er zijn nog geen taken gedefinieerd voor dit project.
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Location */}
          {(project.locationName || project.locationAddress) && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <MapPin className="h-4 w-4" />
                Locatie
              </h3>
              <div className="space-y-1 text-sm">
                {project.locationName && (
                  <p className="font-medium">{project.locationName}</p>
                )}
                {project.locationAddress && (
                  <p className="text-muted-foreground">{project.locationAddress}</p>
                )}
                {project.locationCity && (
                  <p className="text-muted-foreground">{project.locationCity}</p>
                )}
              </div>
            </div>
          )}

          {/* Project Manager */}
          {project.projectManager && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <User className="h-4 w-4" />
                Uw Contactpersoon
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{project.projectManager.name}</p>
                {project.projectManager.email && (
                  <a
                    href={`mailto:${project.projectManager.email}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="h-4 w-4" />
                    {project.projectManager.email}
                  </a>
                )}
                {project.projectManager.phone && (
                  <a
                    href={`tel:${project.projectManager.phone}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Phone className="h-4 w-4" />
                    {project.projectManager.phone}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Notes (only for klant_editor) */}
          {project.notes && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="mb-3 font-semibold">Notities</h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {project.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Loading Skeleton
// =============================================================================

export function PortalProjectViewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back Button */}
      <div className="h-9 w-40 rounded-md bg-stone-200 dark:bg-stone-800" />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-md bg-stone-200 dark:bg-stone-800" />
          <div className="h-4 w-32 rounded-md bg-stone-200 dark:bg-stone-800" />
        </div>
        <div className="h-6 w-20 rounded-full bg-stone-200 dark:bg-stone-800" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg border bg-card p-4">
            <div className="h-4 w-20 rounded bg-stone-200 dark:bg-stone-800 mb-2" />
            <div className="h-6 w-16 rounded bg-stone-200 dark:bg-stone-800" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <div className="h-6 w-32 rounded bg-stone-200 dark:bg-stone-800 mb-4" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg border bg-card" />
          ))}
        </div>
        <div className="space-y-6">
          <div className="h-32 rounded-lg border bg-card" />
          <div className="h-40 rounded-lg border bg-card" />
        </div>
      </div>
    </div>
  );
}
