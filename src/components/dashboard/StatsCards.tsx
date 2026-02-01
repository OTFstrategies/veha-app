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
      value: stats.activeProjects.count,
      label: 'Actief',
    },
    {
      key: 'todayTasks' as const,
      value: stats.todayTasks.count,
      label: 'Vandaag',
    },
    {
      key: 'availableEmployees' as const,
      value: `${stats.availableEmployees.available}/${stats.availableEmployees.total}`,
      label: 'Beschikbaar',
    },
    {
      key: 'attentionNeeded' as const,
      value: stats.attentionNeeded.count,
      label: 'Aandacht',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <button
          key={card.key}
          onClick={() => onStatClick?.(card.key)}
          className={cn(
            'rounded-xl border border-border bg-card p-4 text-center transition-all',
            'hover:border-zinc-300 hover:shadow-sm dark:hover:border-zinc-600',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
        >
          <p className="text-4xl font-bold tracking-tight">{card.value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{card.label}</p>
        </button>
      ))}
    </div>
  )
}
