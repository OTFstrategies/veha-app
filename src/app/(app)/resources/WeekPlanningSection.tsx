"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { parseISO } from "date-fns"
import { Users, Wrench } from "lucide-react"
import { WeekPlanning } from "@/components/weekplanning/WeekPlanning"
import { useWeekNavigation } from "@/hooks/use-week-navigation"
import { useWeekPlanning } from "@/queries/weekplanning"
import { Button } from "@/components/ui/button"

type ResourceType = "medewerkers" | "middelen"

export function WeekPlanningSection() {
  const router = useRouter()
  const [resourceType, setResourceType] = useState<ResourceType>("medewerkers")
  const {
    currentWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
  } = useWeekNavigation()

  // Fetch week planning data based on current week
  const weekStartDate = parseISO(currentWeek.startDate)
  const { data: employees = [], isLoading, error } = useWeekPlanning(weekStartDate)

  // Handle task click - navigate to project detail
  const handleTaskClick = useCallback(
    (taskId: string, projectId: string) => {
      router.push(`/projects/${projectId}?task=${taskId}`)
    },
    [router]
  )

  // Handle employee click - navigate to employee detail
  const handleEmployeeClick = useCallback(
    (employeeId: string) => {
      router.push(`/employees/${employeeId}`)
    },
    [router]
  )

  // Handle availability click - could open edit modal
  const handleAvailabilityClick = useCallback(
    (employeeId: string, date: string) => {
      // For now, navigate to employee page
      // In the future, this could open an availability edit modal
      router.push(`/employees/${employeeId}?tab=availability&date=${date}`)
    },
    [router]
  )

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
    )
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
    )
  }

  // Resource Type Switcher JSX
  const resourceTypeSwitcher = (
    <div className="flex items-center gap-2 px-6 py-3 border-b bg-background">
      <span className="text-sm text-muted-foreground">Toon:</span>
      <div className="flex gap-1">
        <Button
          variant={resourceType === "medewerkers" ? "default" : "ghost"}
          size="sm"
          onClick={() => setResourceType("medewerkers")}
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          Medewerkers
        </Button>
        <Button
          variant={resourceType === "middelen" ? "default" : "ghost"}
          size="sm"
          onClick={() => setResourceType("middelen")}
          className="gap-2"
        >
          <Wrench className="h-4 w-4" />
          Middelen
        </Button>
      </div>
    </div>
  )

  // Show placeholder for equipment (middelen) view
  if (resourceType === "middelen") {
    return (
      <div className="flex h-full flex-col bg-background">
        {resourceTypeSwitcher}

        {/* Placeholder for equipment view */}
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <Wrench className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Middelenplanning</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              De middelenplanning wordt binnenkort beschikbaar.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {resourceTypeSwitcher}

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
    </>
  )
}
