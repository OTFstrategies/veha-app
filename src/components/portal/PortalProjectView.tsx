"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Eye,
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
import { ClientNotes } from "./ClientNotes";
import { PortalGantt } from "./PortalGantt";
import type { PortalProjectDetail, PortalTaskSummary } from "@/types/portal";

// =============================================================================
// Types
// =============================================================================

interface PortalProjectViewProps {
  project: PortalProjectDetail;
  userRole: "klant_editor" | "klant_viewer";
  userId: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

/** Format date in Dutch locale with full month name */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Format date in Dutch locale with abbreviated month */
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
        "flex items-start gap-3 rounded-lg border p-3 sm:p-4 transition-colors",
        isDone
          ? "border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-900/20"
          : isInProgress
          ? "border-zinc-300 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800"
          : "border-border bg-card"
      )}
    >
      {/* Status Icon */}
      <div className="mt-0.5 shrink-0">
        {isDone ? (
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
        ) : isInProgress ? (
          <Loader2 className="h-5 w-5 animate-spin text-zinc-600 dark:text-zinc-400" />
        ) : (
          <Circle className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2">
            <h4
              className={cn(
                "font-medium text-sm sm:text-base",
                isDone && "text-green-700 dark:text-green-300",
                isInProgress && "text-zinc-900 dark:text-zinc-100"
              )}
            >
              {task.name}
            </h4>
            {task.isMilestone && (
              <Flag className="h-4 w-4 text-amber-500" aria-label="Mijlpaal" />
            )}
          </div>
          <Badge
            variant={isDone ? "success" : (isInProgress ? "secondary" : "outline")}
            className="shrink-0 text-xs w-fit"
          >
            {getTaskStatusLabel(task.status)}
          </Badge>
        </div>

        {/* Progress and Dates */}
        <div className="mt-2 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <div className="w-20 bg-zinc-200 rounded-full h-2 dark:bg-zinc-700">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  isDone
                    ? "bg-green-600"
                    : isInProgress
                    ? "bg-green-500"
                    : "bg-green-400"
                )}
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">
              {task.progress}%
            </span>
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

export function PortalProjectView({ project, userRole, userId }: PortalProjectViewProps) {
  const isComplete = project.status === "afgerond";
  const isActive = project.status === "actief";
  const isViewer = userRole === "klant_viewer";

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
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">{project.name}</h1>
            {isViewer && (
              <div className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                <Eye className="h-3 w-3" />
                Alleen lezen
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground sm:text-base">
            {getWorkTypeLabel(project.workType)}
          </p>
        </div>
        <Badge variant={getStatusVariant(project.status)} className="w-fit text-sm">
          {getStatusLabel(project.status)}
        </Badge>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-muted-foreground sm:text-base">{project.description}</p>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Progress */}
        <div className="rounded-lg border bg-card p-3 sm:p-4">
          <div className="mb-2 text-xs text-muted-foreground sm:text-sm">Voortgang</div>
          <div className="flex items-end justify-between gap-2">
            <span className="text-xl font-bold tabular-nums sm:text-2xl">{project.progress}%</span>
            <div className="mb-1 flex-1">
              <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isComplete
                      ? "bg-green-500"
                      : isActive
                      ? "bg-zinc-700 dark:bg-zinc-300"
                      : "bg-zinc-400"
                  )}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="rounded-lg border bg-card p-3 sm:p-4">
          <div className="mb-2 text-xs text-muted-foreground sm:text-sm">Taken</div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold tabular-nums sm:text-2xl">
              {project.completedTaskCount}
            </span>
            <span className="text-muted-foreground">/ {project.taskCount}</span>
          </div>
        </div>

        {/* Start Date */}
        <div className="rounded-lg border bg-card p-3 sm:p-4">
          <div className="mb-2 text-xs text-muted-foreground sm:text-sm">Startdatum</div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-medium sm:text-base">{formatDate(project.startDate)}</span>
          </div>
        </div>

        {/* End Date */}
        <div className="rounded-lg border bg-card p-3 sm:p-4">
          <div className="mb-2 text-xs text-muted-foreground sm:text-sm">Einddatum</div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-medium sm:text-base">{formatDate(project.endDate)}</span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Tasks */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tasks */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Taken Overzicht</h2>
            {project.tasks.length > 0 ? (
              <div className="space-y-3">
                {project.tasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed bg-zinc-50 p-6 text-center dark:bg-zinc-900 sm:p-8">
                <p className="text-sm text-muted-foreground">
                  Er zijn nog geen taken gedefinieerd voor dit project.
                </p>
              </div>
            )}
          </div>

          {/* Planning Gantt Chart */}
          {project.tasks && project.tasks.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">Planning</h2>
              <PortalGantt
                tasks={project.tasks}
                projectStartDate={project.startDate}
                projectEndDate={project.endDate}
              />
            </div>
          )}

          {/* Client Notes Section */}
          <div className="border-t border-zinc-200 pt-8 dark:border-zinc-700">
            <ClientNotes
              projectId={project.id}
              userRole={userRole}
              currentUserId={userId}
            />
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-4 sm:space-y-6">
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
                    <span className="break-all">{project.projectManager.email}</span>
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

          {/* Project Notes (internal notes from the project) */}
          {project.notes && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="mb-3 font-semibold">Project Notities</h3>
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
    <div className="animate-pulse space-y-6">
      {/* Back Button */}
      <div className="h-9 w-40 rounded-md bg-zinc-200 dark:bg-zinc-800" />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-md bg-zinc-200 sm:w-64 dark:bg-zinc-800" />
          <div className="h-4 w-24 rounded-md bg-zinc-200 sm:w-32 dark:bg-zinc-800" />
        </div>
        <div className="h-6 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg border bg-card p-3 sm:h-24 sm:p-4">
            <div className="mb-2 h-4 w-16 rounded bg-zinc-200 sm:w-20 dark:bg-zinc-800" />
            <div className="h-6 w-12 rounded bg-zinc-200 sm:w-16 dark:bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="mb-4 h-6 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg border bg-card" />
          ))}
        </div>
        <div className="space-y-4 sm:space-y-6">
          <div className="h-32 rounded-lg border bg-card" />
          <div className="h-40 rounded-lg border bg-card" />
        </div>
      </div>
    </div>
  );
}
