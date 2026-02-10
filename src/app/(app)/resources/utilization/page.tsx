"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, BarChart3, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ResourceHistogram } from "@/components/resources/ResourceHistogram"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { useEmployees } from "@/queries/employees"

// =============================================================================
// Page Component
// =============================================================================

export default function ResourceUtilizationPage() {
  const { currentWorkspaceId } = useWorkspaceStore()
  const { data: employees } = useEmployees(currentWorkspaceId)

  const [selectedEmployee, setSelectedEmployee] = React.useState<string>("all")
  const [weeksToShow, setWeeksToShow] = React.useState<string>("12")

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/resources">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Resource Bezetting
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Overzicht van teamcapaciteit en geplande uren per week
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecteer medewerker" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle medewerkers</SelectItem>
                {employees?.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Periode:</span>
            <Select value={weeksToShow} onValueChange={setWeeksToShow}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 weken</SelectItem>
                <SelectItem value="8">8 weken</SelectItem>
                <SelectItem value="12">12 weken</SelectItem>
                <SelectItem value="24">24 weken</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-medium mb-4">
            {selectedEmployee === "all"
              ? "Team Bezetting"
              : employees?.find((e) => e.id === selectedEmployee)?.name || "Bezetting"}
          </h2>
          <ResourceHistogram
            employeeId={selectedEmployee === "all" ? undefined : selectedEmployee}
            weeksToShow={parseInt(weeksToShow)}
            height={400}
          />
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6">
          <span className="text-sm text-muted-foreground font-medium">Legenda:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-zinc-700 dark:bg-zinc-300" />
            <span className="text-sm text-muted-foreground">Optimaal (70-100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span className="text-sm text-muted-foreground">Overbezet (&gt;100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-zinc-500 dark:bg-zinc-400" />
            <span className="text-sm text-muted-foreground">Onderbezet (&lt;70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-t-2 border-dashed border-red-500" />
            <span className="text-sm text-muted-foreground">Capaciteitsgrens</span>
          </div>
        </div>
      </div>
    </div>
  )
}
