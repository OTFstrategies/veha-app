import { StatsCards } from './StatsCards'
import { TodayTasks } from './TodayTasks'
import { ActiveProjects } from './ActiveProjects'
import { CapacityWidget } from './CapacityWidget'
import { QuickActions } from './QuickActions'
import type {
  DashboardStats,
  TodayTaskGroup,
  ActiveProject,
  CapacityEntry,
  QuickAction,
} from '@/types/dashboard'

// =============================================================================
// Props
// =============================================================================

export interface DashboardProps {
  stats: DashboardStats
  todayTasks: TodayTaskGroup[]
  activeProjects: ActiveProject[]
  capacityData: CapacityEntry[]
  quickActions?: QuickAction[]
  onStatClick?: (statType: 'activeProjects' | 'todayTasks' | 'availableEmployees' | 'attentionNeeded') => void
  onTaskClick?: (taskId: string, projectId: string) => void
  onProjectClick?: (projectId: string) => void
  onCapacityClick?: (employeeId: string) => void
  onQuickAction?: (actionId: string) => void
  onViewWeekPlanning?: () => void
}

// =============================================================================
// Component
// =============================================================================

export function Dashboard({
  stats,
  todayTasks,
  activeProjects,
  capacityData,
  quickActions = [],
  onStatClick,
  onTaskClick,
  onProjectClick,
  onCapacityClick,
  onQuickAction,
  onViewWeekPlanning,
}: DashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
          </div>
          {quickActions.length > 0 && (
            <QuickActions actions={quickActions} onAction={onQuickAction} />
          )}
        </div>

        {/* Stats Cards */}
        <section className="mb-8">
          <StatsCards stats={stats} onStatClick={onStatClick} />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Today Tasks + Active Projects */}
          <div className="space-y-8 lg:col-span-2">
            <TodayTasks taskGroups={todayTasks} onTaskClick={onTaskClick} />
            <ActiveProjects projects={activeProjects} onProjectClick={onProjectClick} />
          </div>

          {/* Right Column - Capacity */}
          <div className="lg:col-span-1">
            <CapacityWidget
              capacityData={capacityData}
              onEmployeeClick={onCapacityClick}
              onViewWeekPlanning={onViewWeekPlanning}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
