"use client";

import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardSkeleton } from "./loading";
import { QueryError } from "@/components/ui/error-boundary";

export default function DashboardPage() {
  const router = useRouter();
  const {
    stats,
    todayTasks,
    activeProjects,
    capacityData,
    quickActions,
    isLoading,
    error,
    refetchAll,
  } = useDashboard();

  // Navigation callbacks
  function handleStatClick(
    statType: "activeProjects" | "todayTasks" | "availableEmployees" | "attentionNeeded"
  ) {
    switch (statType) {
      case "activeProjects":
        router.push("/projects?status=actief");
        break;
      case "todayTasks":
        router.push("/projects");
        break;
      case "availableEmployees":
        router.push("/employees");
        break;
      case "attentionNeeded":
        router.push("/projects?attention=true");
        break;
    }
  }

  function handleTaskClick(taskId: string, projectId: string) {
    router.push(`/projects/${projectId}?task=${taskId}`);
  }

  function handleProjectClick(projectId: string) {
    router.push(`/projects/${projectId}`);
  }

  function handleCapacityClick(employeeId: string) {
    router.push(`/employees/${employeeId}`);
  }

  function handleQuickAction(actionId: string) {
    switch (actionId) {
      case "new-project":
        router.push("/projects/new");
        break;
      case "new-task":
        router.push("/projects");
        break;
      case "week-planning":
        router.push("/weekplanning");
        break;
    }
  }

  function handleViewWeekPlanning() {
    router.push("/weekplanning");
  }

  // Show error state
  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <QueryError error={error} onRetry={refetchAll} />
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <Dashboard
      stats={stats}
      todayTasks={todayTasks}
      activeProjects={activeProjects}
      capacityData={capacityData}
      quickActions={quickActions}
      onStatClick={handleStatClick}
      onTaskClick={handleTaskClick}
      onProjectClick={handleProjectClick}
      onCapacityClick={handleCapacityClick}
      onQuickAction={handleQuickAction}
      onViewWeekPlanning={handleViewWeekPlanning}
    />
  );
}
