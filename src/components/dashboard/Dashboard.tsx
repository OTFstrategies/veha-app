"use client"

import { useRouter } from 'next/navigation'
import { FolderPlus, ListPlus, Calendar, ArrowRight } from 'lucide-react'
import { StatsCards } from './StatsCards'
import { TodayTasks } from './TodayTasks'
import { ActiveProjects } from './ActiveProjects'
import { CapacityWidget } from './CapacityWidget'
import { CollapsibleSection } from './CollapsibleSection'
import { FAB } from '@/components/ui/fab'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type {
  DashboardStats,
  TodayTaskGroup,
  ActiveProject,
  CapacityEntry,
} from '@/types/dashboard'

// =============================================================================
// Props
// =============================================================================

export interface DashboardProps {
  stats: DashboardStats
  todayTasks: TodayTaskGroup[]
  activeProjects: ActiveProject[]
  capacityData: CapacityEntry[]
  onStatClick?: (statType: 'activeProjects' | 'todayTasks' | 'availableEmployees' | 'attentionNeeded') => void
  onTaskClick?: (taskId: string, projectId: string) => void
  onProjectClick?: (projectId: string) => void
  onCapacityClick?: (employeeId: string) => void
  onViewWeekPlanning?: () => void
}

// =============================================================================
// FAB Actions
// =============================================================================

const fabActions = [
  {
    id: 'new-project',
    label: 'Nieuw Project',
    icon: FolderPlus,
    description: 'Start een nieuw project',
  },
  {
    id: 'new-task',
    label: 'Nieuwe Taak',
    icon: ListPlus,
    description: 'Voeg een taak toe',
  },
  {
    id: 'week-planning',
    label: 'Weekplanning',
    icon: Calendar,
    description: 'Bekijk de planning',
  },
]

// =============================================================================
// Component
// =============================================================================

export function Dashboard({
  stats,
  todayTasks,
  activeProjects,
  capacityData,
  onStatClick,
  onTaskClick,
  onProjectClick,
  onCapacityClick,
  onViewWeekPlanning,
}: DashboardProps) {
  const router = useRouter()

  const totalTasks = todayTasks.reduce((sum, group) => sum + group.tasks.length, 0)
  const overbookedCount = capacityData.filter((e) => e.status === 'overbooked').length

  const handleFABAction = (actionId: string) => {
    switch (actionId) {
      case 'new-project':
        router.push('/projects/new')
        break
      case 'new-task':
        // TODO: Implement task creation
        console.log('Create new task')
        break
      case 'week-planning':
        router.push('/resources?tab=weekplanning')
        break
    }
  }

  const today = new Date().toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="min-h-screen bg-background">
      {/* FAB - Fixed position */}
      <div className="fixed right-6 top-20 z-50">
        <FAB actions={fabActions} onAction={handleFABAction} />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats Cards */}
        <section className="mb-10">
          <StatsCards stats={stats} onStatClick={onStatClick} />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Today Tasks + Active Projects */}
          <div className="space-y-8 lg:col-span-2">
            {/* Today Tasks Section */}
            <CollapsibleSection
              title="Vandaag"
              subtitle={today}
              sectionKey="todayTasks"
              badge={
                totalTasks > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {totalTasks} {totalTasks === 1 ? 'taak' : 'taken'}
                  </Badge>
                )
              }
            >
              <TodayTasks taskGroups={todayTasks} onTaskClick={onTaskClick} />
            </CollapsibleSection>

            {/* Active Projects Section */}
            <CollapsibleSection
              title="Actieve Projecten"
              sectionKey="activeProjects"
              badge={
                activeProjects.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {activeProjects.length}
                  </Badge>
                )
              }
            >
              <ActiveProjects projects={activeProjects} onProjectClick={onProjectClick} />
            </CollapsibleSection>
          </div>

          {/* Right Column - Capacity */}
          <div className="lg:col-span-1">
            <CollapsibleSection
              title="Capaciteit"
              subtitle="Deze week"
              sectionKey="capacity"
              badge={
                overbookedCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {overbookedCount} overboekt
                  </Badge>
                )
              }
              headerAction={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewWeekPlanning?.()
                  }}
                >
                  Weekplanning
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              }
            >
              <CapacityWidget
                capacityData={capacityData}
                onEmployeeClick={onCapacityClick}
              />
            </CollapsibleSection>
          </div>
        </div>
      </div>
    </div>
  )
}
