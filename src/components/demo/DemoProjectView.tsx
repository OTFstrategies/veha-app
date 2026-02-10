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
import { PortalGantt } from "@/components/portal/PortalGantt";
import { DemoClientNotes } from "./DemoClientNotes";
import type { PortalProjectDetail, PortalTaskSummary } from "@/types/portal";

// =============================================================================
// Helper Functions (same as PortalProjectView)
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

function TaskItem({ task }: { task: PortalTaskSummary }) {
  const isDone = task.status === "done";
  const isInProgress = task.status === "in_progress";

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 transition-colors sm:p-4",
        isDone
          ? "border-zinc-300 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800/50"
          : isInProgress
            ? "border-zinc-300 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800"
            : "border-border bg-card"
      )}
    >
      <div className="mt-0.5 shrink-0">
        {isDone ? (
          <CheckCircle2 className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
        ) : isInProgress ? (
          <Loader2 className="h-5 w-5 animate-spin text-zinc-600 dark:text-zinc-400" />
        ) : (
          <Circle className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2">
            <h4
              className={cn(
                "text-sm font-medium sm:text-base",
                isDone && "text-zinc-700 dark:text-zinc-300",
                isInProgress && "text-zinc-900 dark:text-zinc-100"
              )}
            >
              {task.name}
            </h4>
            {task.isMilestone && (
              <Flag className="h-4 w-4 text-zinc-500 dark:text-zinc-400" aria-label="Mijlpaal" />
            )}
          </div>
          <Badge
            variant={isDone ? "success" : isInProgress ? "secondary" : "outline"}
            className="w-fit shrink-0 text-xs"
          >
            {getTaskStatusLabel(task.status)}
          </Badge>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-20 rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  isDone ? "bg-zinc-800 dark:bg-zinc-200" : isInProgress ? "bg-zinc-600 dark:bg-zinc-400" : "bg-zinc-400 dark:bg-zinc-500"
                )}
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
              {task.progress}%
            </span>
          </div>
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
// Demo Project View
// =============================================================================

interface DemoProjectViewProps {
  project: PortalProjectDetail;
}

export function DemoProjectView({ project }: DemoProjectViewProps) {
  const isComplete = project.status === "afgerond";
  const isActive = project.status === "actief";

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/demo/portal" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Terug naar overzicht
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">{project.name}</h1>
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
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" data-tour="project-stats">
        <div className="rounded-lg glass p-3 sm:p-4">
          <div className="mb-2 text-xs text-muted-foreground sm:text-sm">Voortgang</div>
          <div className="flex items-end justify-between gap-2">
            <span className="text-xl font-bold tabular-nums sm:text-2xl">{project.progress}%</span>
            <div className="mb-1 flex-1">
              <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isComplete
                      ? "bg-zinc-800 dark:bg-zinc-200"
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
        <div className="rounded-lg glass p-3 sm:p-4">
          <div className="mb-2 text-xs text-muted-foreground sm:text-sm">Taken</div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold tabular-nums sm:text-2xl">
              {project.completedTaskCount}
            </span>
            <span className="text-muted-foreground">/ {project.taskCount}</span>
          </div>
        </div>
        <div className="rounded-lg glass p-3 sm:p-4">
          <div className="mb-2 text-xs text-muted-foreground sm:text-sm">Startdatum</div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-medium sm:text-base">
              {formatDate(project.startDate)}
            </span>
          </div>
        </div>
        <div className="rounded-lg glass p-3 sm:p-4">
          <div className="mb-2 text-xs text-muted-foreground sm:text-sm">Einddatum</div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-medium sm:text-base">
              {formatDate(project.endDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Tasks */}
        <div className="space-y-8 lg:col-span-2">
          {/* Tasks */}
          <div data-tour="tasks">
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
          {project.tasks.length > 0 && (
            <div data-tour="gantt">
              <h2 className="mb-4 text-lg font-semibold">Planning</h2>
              <PortalGantt
                tasks={project.tasks}
                projectStartDate={project.startDate}
                projectEndDate={project.endDate}
              />
            </div>
          )}

          {/* Client Notes Section */}
          <div className="border-t border-zinc-200 pt-8 dark:border-zinc-700" data-tour="notes">
            <DemoClientNotes projectId={project.id} />
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-4 sm:space-y-6">
          {(project.locationName || project.locationAddress) && (
            <div className="rounded-lg glass p-4 glow-hover transition-shadow">
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <MapPin className="h-4 w-4" />
                Locatie
              </h3>
              <div className="space-y-1 text-sm">
                {project.locationName && <p className="font-medium">{project.locationName}</p>}
                {project.locationAddress && (
                  <p className="text-muted-foreground">{project.locationAddress}</p>
                )}
                {project.locationCity && (
                  <p className="text-muted-foreground">{project.locationCity}</p>
                )}
              </div>
            </div>
          )}

          {project.projectManager && (
            <div className="rounded-lg glass p-4 glow-hover transition-shadow">
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

          {project.notes && (
            <div className="rounded-lg glass p-4 glow-hover transition-shadow">
              <h3 className="mb-3 font-semibold">Project Notities</h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{project.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
