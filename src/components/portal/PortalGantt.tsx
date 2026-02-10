"use client";

import * as React from "react";
import {
  format,
  differenceInDays,
  addDays,
  startOfWeek,
  eachWeekOfInterval,
} from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { PortalTaskSummary } from "@/types/portal";

// =============================================================================
// Types
// =============================================================================

interface PortalGanttProps {
  tasks: PortalTaskSummary[];
  projectStartDate: string;
  projectEndDate: string;
}

// =============================================================================
// Constants
// =============================================================================

const NAME_COLUMN_WIDTH = 192; // w-48 = 12rem = 192px
const DAY_WIDTH = 24;
const ROW_HEIGHT = 40;

// =============================================================================
// Helper Functions
// =============================================================================

function getStatusColor(status: string, progress: number): string {
  if (status === "done" || progress === 100) {
    return "bg-zinc-800 dark:bg-zinc-200";
  }
  if (status === "in_progress") {
    return "bg-zinc-600 dark:bg-zinc-400";
  }
  return "bg-zinc-400 dark:bg-zinc-500";
}

function getProgressColor(status: string): string {
  if (status === "done") {
    return "bg-zinc-900 dark:bg-zinc-100";
  }
  if (status === "in_progress") {
    return "bg-zinc-800 dark:bg-zinc-200";
  }
  return "bg-zinc-600 dark:bg-zinc-300";
}

// =============================================================================
// Week Header Component
// =============================================================================

interface WeekHeaderProps {
  weeks: Date[];
  timelineStart: Date;
  totalDays: number;
}

function WeekHeader({ weeks, timelineStart, totalDays }: WeekHeaderProps) {
  return (
    <div
      className="flex h-10 border-b border-border bg-zinc-50 dark:bg-zinc-900"
      style={{ width: totalDays * DAY_WIDTH }}
    >
      {weeks.map((weekStart, index) => {
        const weekEnd = addDays(weekStart, 6);
        const offsetDays = Math.max(0, differenceInDays(weekStart, timelineStart));
        const left = offsetDays * DAY_WIDTH;

        // Calculate width (handle partial weeks at start/end)
        const effectiveStart =
          weekStart < timelineStart ? timelineStart : weekStart;
        const effectiveEnd =
          addDays(timelineStart, totalDays - 1) < weekEnd
            ? addDays(timelineStart, totalDays - 1)
            : weekEnd;
        const width = (differenceInDays(effectiveEnd, effectiveStart) + 1) * DAY_WIDTH;

        return (
          <div
            key={index}
            className="absolute flex flex-col items-center justify-center border-r border-border text-xs"
            style={{
              left,
              width,
              height: 40,
            }}
          >
            <span className="font-medium text-foreground">
              {format(weekStart, "d MMM", { locale: nl })}
            </span>
            <span className="text-muted-foreground">
              {format(weekStart, "'Week' w", { locale: nl })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// Task Row Component
// =============================================================================

interface TaskRowProps {
  task: PortalTaskSummary;
  timelineStart: Date;
  totalDays: number;
  rowIndex: number;
}

function TaskRow({ task, timelineStart, totalDays, rowIndex }: TaskRowProps) {
  const taskStart = new Date(task.startDate);
  const taskEnd = new Date(task.endDate);

  // Calculate bar position
  const startOffset = Math.max(0, differenceInDays(taskStart, timelineStart));
  const taskDuration = differenceInDays(taskEnd, taskStart) + 1;
  const barWidth = Math.min(taskDuration, totalDays - startOffset) * DAY_WIDTH;
  const barLeft = startOffset * DAY_WIDTH;

  // Don't render if task is outside timeline
  if (startOffset >= totalDays || barWidth <= 0) {
    return null;
  }

  const statusColor = getStatusColor(task.status, task.progress);
  const progressColor = getProgressColor(task.status);

  return (
    <div
      className="absolute"
      style={{
        left: barLeft,
        top: rowIndex * ROW_HEIGHT + 8,
        width: Math.max(barWidth, DAY_WIDTH),
        height: ROW_HEIGHT - 16,
      }}
    >
      {/* Task bar background */}
      <div
        className={cn(
          "absolute inset-0 rounded-md shadow-sm",
          statusColor
        )}
      />

      {/* Progress overlay */}
      {task.progress > 0 && task.progress < 100 && (
        <div
          className={cn(
            "absolute bottom-0 left-0 top-0 rounded-l-md opacity-60",
            progressColor
          )}
          style={{ width: `${task.progress}%` }}
        />
      )}

      {/* Task name inside bar (if wide enough) */}
      {barWidth > 60 && (
        <div className="absolute inset-0 flex items-center justify-center px-2">
          <span className="truncate text-xs font-medium text-white drop-shadow-sm">
            {task.progress}%
          </span>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function PortalGantt({
  tasks,
  projectStartDate,
  projectEndDate,
}: PortalGanttProps) {
  // Calculate timeline boundaries with padding
  const timelineStart = startOfWeek(new Date(projectStartDate), { locale: nl });
  const projectEnd = new Date(projectEndDate);
  const paddedEnd = addDays(projectEnd, 7); // Add a week of padding
  const totalDays = differenceInDays(paddedEnd, timelineStart) + 1;
  const timelineWidth = totalDays * DAY_WIDTH;

  // Generate weeks for header
  const weeks = eachWeekOfInterval(
    { start: timelineStart, end: paddedEnd },
    { locale: nl }
  );

  // Sort tasks by start date
  const sortedTasks = React.useMemo(() => {
    return [...tasks].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [tasks]);

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Container with horizontal scroll */}
      <div className="overflow-x-auto">
        <div className="flex" style={{ minWidth: NAME_COLUMN_WIDTH + timelineWidth }}>
          {/* Task names column - fixed */}
          <div
            className="shrink-0 border-r border-border bg-zinc-50 dark:bg-zinc-900"
            style={{ width: NAME_COLUMN_WIDTH }}
          >
            {/* Header cell */}
            <div className="flex h-10 items-center border-b border-border px-3">
              <span className="text-xs font-medium text-muted-foreground">
                Taak
              </span>
            </div>

            {/* Task name rows */}
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center border-b border-border px-3"
                style={{ height: ROW_HEIGHT }}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {/* Status indicator dot */}
                  <div
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      task.status === "done"
                        ? "bg-zinc-800 dark:bg-zinc-200"
                        : task.status === "in_progress"
                        ? "bg-zinc-600 dark:bg-zinc-400"
                        : "bg-zinc-400"
                    )}
                  />
                  <span className="truncate text-sm" title={task.name}>
                    {task.name}
                  </span>
                  {task.isMilestone && (
                    <span className="shrink-0 text-zinc-500 dark:text-zinc-400" title="Mijlpaal">
                      <svg
                        className="h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2L9 9H2l5.5 4.5L5 22l7-5 7 5-2.5-8.5L22 9h-7L12 2z" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Timeline area */}
          <div className="relative flex-1" style={{ width: timelineWidth }}>
            {/* Week headers */}
            <div className="relative" style={{ width: timelineWidth }}>
              <WeekHeader
                weeks={weeks}
                timelineStart={timelineStart}
                totalDays={totalDays}
              />
            </div>

            {/* Task rows with bars */}
            <div
              className="relative"
              style={{
                width: timelineWidth,
                height: sortedTasks.length * ROW_HEIGHT,
              }}
            >
              {/* Grid lines for weeks */}
              {weeks.map((weekStart, index) => {
                const offsetDays = Math.max(
                  0,
                  differenceInDays(weekStart, timelineStart)
                );
                return (
                  <div
                    key={index}
                    className="absolute bottom-0 top-0 border-r border-zinc-200 dark:border-zinc-700"
                    style={{ left: offsetDays * DAY_WIDTH }}
                  />
                );
              })}

              {/* Row backgrounds with alternating colors */}
              {sortedTasks.map((task, index) => (
                <div
                  key={`row-${task.id}`}
                  className={cn(
                    "absolute left-0 right-0 border-b border-border",
                    index % 2 === 1 && "bg-zinc-50/50 dark:bg-zinc-800/20"
                  )}
                  style={{
                    top: index * ROW_HEIGHT,
                    height: ROW_HEIGHT,
                  }}
                />
              ))}

              {/* Today line */}
              {(() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayOffset = differenceInDays(today, timelineStart);
                if (todayOffset >= 0 && todayOffset < totalDays) {
                  return (
                    <div
                      className="absolute bottom-0 top-0 z-10 w-0.5 bg-red-500"
                      style={{ left: todayOffset * DAY_WIDTH }}
                    >
                      <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-red-500" />
                    </div>
                  );
                }
                return null;
              })()}

              {/* Task bars */}
              {sortedTasks.map((task, index) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  timelineStart={timelineStart}
                  totalDays={totalDays}
                  rowIndex={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border bg-zinc-50 px-3 py-2 text-xs text-muted-foreground dark:bg-zinc-900">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-zinc-800 dark:bg-zinc-200" />
          <span>Afgerond</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-zinc-600 dark:bg-zinc-400" />
          <span>Bezig</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-zinc-400" />
          <span>Te doen</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 bg-red-500" />
          <span>Vandaag</span>
        </div>
      </div>
    </div>
  );
}
