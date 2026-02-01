import { FolderKanban, CheckCircle2, Users, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardStats } from '@/types/dashboard'

// =============================================================================
// Props
// =============================================================================

interface StatsCardsProps {
  stats: DashboardStats
  onStatClick?: (statType: 'activeProjects' | 'todayTasks' | 'availableEmployees' | 'attentionNeeded') => void
}

// =============================================================================
// Component
// =============================================================================

export function StatsCards({ stats, onStatClick }: StatsCardsProps) {
  const cards = [
    {
      key: 'activeProjects' as const,
      title: 'Actieve Projecten',
      value: stats.activeProjects.count,
      subtext: `+${stats.activeProjects.newThisMonth} deze maand`,
      icon: FolderKanban,
    },
    {
      key: 'todayTasks' as const,
      title: 'Taken Vandaag',
      value: stats.todayTasks.count,
      subtext: `${stats.todayTasks.completed} afgerond`,
      icon: CheckCircle2,
    },
    {
      key: 'availableEmployees' as const,
      title: 'Beschikbaar',
      value: `${stats.availableEmployees.available}/${stats.availableEmployees.total}`,
      subtext: 'medewerkers',
      icon: Users,
    },
    {
      key: 'attentionNeeded' as const,
      title: 'Aandacht Nodig',
      value: stats.attentionNeeded.count,
      subtext: 'projecten achterstand',
      icon: AlertTriangle,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <button
          key={card.key}
          onClick={() => onStatClick?.(card.key)}
          className={cn(
            'group relative overflow-hidden rounded-xl border border-border bg-card p-5 text-left transition-all',
            'hover:border-zinc-300 hover:shadow-md dark:hover:border-zinc-600',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
        >
          {/* Content */}
          <div>
            <div className="mb-3 inline-flex rounded-lg bg-zinc-100 p-2 dark:bg-zinc-800">
              <card.icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.subtext}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
