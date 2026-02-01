"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Package, Wrench, Calendar } from "lucide-react"

// Import existing employee page content
import EmployeesPageContent from "./EmployeesPageContent"
import { MaterialList } from "@/components/resources/MaterialList"
import { EquipmentList } from "@/components/resources/EquipmentList"
import { WeekPlanningSection } from "./WeekPlanningSection"

const tabs = [
  { id: "medewerkers", label: "Medewerkers", icon: Users },
  { id: "materialen", label: "Materialen", icon: Package },
  { id: "middelen", label: "Middelen", icon: Wrench },
  { id: "weekplanning", label: "Weekplanning", icon: Calendar },
]

function ResourcesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "medewerkers"

  const handleTabChange = (value: string) => {
    router.push(`/resources?tab=${value}`)
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
        <div className="shrink-0 border-b border-border px-6 pt-4">
          <TabsList className="mb-4">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto">
          <TabsContent value="medewerkers" className="h-full mt-0">
            <EmployeesPageContent />
          </TabsContent>

          <TabsContent value="materialen" className="h-full mt-0 p-6">
            <MaterialList />
          </TabsContent>

          <TabsContent value="middelen" className="h-full mt-0 p-6">
            <EquipmentList />
          </TabsContent>

          <TabsContent value="weekplanning" className="h-full mt-0">
            <WeekPlanningSection />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default function ResourcesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-800" />
          <p className="text-sm text-muted-foreground">Laden...</p>
        </div>
      </div>
    }>
      <ResourcesPageContent />
    </Suspense>
  )
}
