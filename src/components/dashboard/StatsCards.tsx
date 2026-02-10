"use client"

import { cn } from '@/lib/utils'
import { MotionList, MotionListItem } from '@/lib/motion'
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
    <MotionList className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <MotionListItem key={card.key}>
          <button
            onClick={() => onStatClick?.(card.key)}
            aria-label={`${card.label}: ${card.value}`}
            className={cn(
              'glass glow-hover rounded-lg p-3 text-center transition-all w-full',
              '',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            <p className="text-3xl font-semibold tracking-tight" aria-hidden="true">{card.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{card.label}</p>
          </button>
        </MotionListItem>
      ))}
    </MotionList>
  )
}
