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
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      key: 'todayTasks' as const,
      title: 'Taken Vandaag',
      value: stats.todayTasks.count,
      subtext: `${stats.todayTasks.completed} afgerond`,
      icon: CheckCircle2,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      key: 'availableEmployees' as const,
      title: 'Beschikbaar',
      value: `${stats.availableEmployees.available}/${stats.availableEmployees.total}`,
      subtext: 'medewerkers',
      icon: Users,
      iconColor: 'text-violet-500',
      bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    },
    {
      key: 'attentionNeeded' as const,
      title: 'Aandacht Nodig',
      value: stats.attentionNeeded.count,
      subtext: 'projecten achterstand',
      icon: AlertTriangle,
      iconColor: stats.attentionNeeded.count > 0 ? 'text-amber-500' : 'text-stone-400',
      bgColor: stats.attentionNeeded.count > 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-stone-50 dark:bg-stone-800/50',
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
            'hover:border-stone-300 hover:shadow-md dark:hover:border-stone-600',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2'
          )}
        >
          {/* Background Icon */}
          <div className="absolute -right-4 -top-4 opacity-5 transition-transform group-hover:scale-110">
            <card.icon className="h-24 w-24" />
          </div>

          {/* Content */}
          <div className="relative">
            <div className={cn('mb-3 inline-flex rounded-lg p-2', card.bgColor)}>
              <card.icon className={cn('h-5 w-5', card.iconColor)} />
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
