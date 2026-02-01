"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { parseISO } from "date-fns";
import { WeekPlanning } from "@/components/weekplanning/WeekPlanning";
import { useWeekNavigation } from "@/hooks/use-week-navigation";
import { useWeekPlanning } from "@/queries/weekplanning";
import { QueryProvider } from "@/providers/query-provider";

function WeekPlanningContent() {
  const router = useRouter();
  const {
    currentWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
  } = useWeekNavigation();

  // Fetch week planning data based on current week
  const weekStartDate = parseISO(currentWeek.startDate);
  const { data: employees = [], isLoading, error } = useWeekPlanning(weekStartDate);

  // Handle task click - navigate to project detail
  const handleTaskClick = useCallback(
    (taskId: string, projectId: string) => {
      router.push(`/projects/${projectId}?task=${taskId}`);
    },
    [router]
  );

  // Handle employee click - navigate to employee detail
  const handleEmployeeClick = useCallback(
    (employeeId: string) => {
      router.push(`/employees/${employeeId}`);
    },
    [router]
  );

  // Handle availability click - could open edit modal
  const handleAvailabilityClick = useCallback(
    (employeeId: string, date: string) => {
      // For now, navigate to employee page
      // In the future, this could open an availability edit modal
      router.push(`/employees/${employeeId}?tab=availability&date=${date}`);
    },
    [router]
  );

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">
            Er is een fout opgetreden bij het laden van de weekplanning.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Onbekende fout"}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-600" />
          <p className="mt-4 text-muted-foreground">
            Weekplanning laden...
          </p>
        </div>
      </div>
    );
  }

  return (
    <WeekPlanning
      currentWeek={currentWeek}
      employees={employees}
      onPreviousWeek={goToPreviousWeek}
      onNextWeek={goToNextWeek}
      onToday={goToToday}
      onTaskClick={handleTaskClick}
      onEmployeeClick={handleEmployeeClick}
      onAvailabilityClick={handleAvailabilityClick}
    />
  );
}

export default function WeekPlanningPage() {
  return (
    <QueryProvider>
      <div className="-m-6 h-[calc(100%+3rem)]">
        <WeekPlanningContent />
      </div>
    </QueryProvider>
  );
}
