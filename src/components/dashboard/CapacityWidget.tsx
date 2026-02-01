import { ArrowRight, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { CapacityEntry } from '@/types/dashboard'

// =============================================================================
// Props
// =============================================================================

interface CapacityWidgetProps {
  capacityData: CapacityEntry[]
  onEmployeeClick?: (employeeId: string) => void
  onViewWeekPlanning?: () => void
}

// =============================================================================
// Helper
// =============================================================================

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// =============================================================================
// Component
// =============================================================================

export function CapacityWidget({
  capacityData,
  onEmployeeClick,
  onViewWeekPlanning,
}: CapacityWidgetProps) {
  // Sort: overbooked first, then optimal, then underutilized
  const sortedData = [...capacityData].sort((a, b) => {
    const order = { overbooked: 0, optimal: 1, underutilized: 2 }
    return order[a.status] - order[b.status]
  })

  const overbookedCount = capacityData.filter((e) => e.status === 'overbooked').length

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <Users className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <h2 className="font-semibold">Capaciteit Deze Week</h2>
            {overbookedCount > 0 && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {overbookedCount} medewerker{overbookedCount > 1 ? 's' : ''} overboekt
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-sm text-muted-foreground"
          onClick={onViewWeekPlanning}
        >
          Weekplanning
          <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Capacity Bars */}
      <div className="divide-y divide-border">
        {sortedData.map((employee) => (
          <button
            key={employee.id}
            onClick={() => onEmployeeClick?.(employee.id)}
            className={cn(
              'flex w-full items-center gap-4 px-5 py-3 text-left transition-colors',
              'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
              employee.status === 'overbooked' && 'bg-red-50/50 dark:bg-red-900/10'
            )}
          >
            {/* Avatar */}
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback
                className="text-xs font-medium text-white"
                style={{ backgroundColor: employee.color }}
              >
                {getInitials(employee.name)}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="truncate">
                  <span className="text-sm font-medium">{employee.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{employee.role}</span>
                </div>
                <span
                  className={cn(
                    'ml-2 text-xs font-medium tabular-nums',
                    employee.status === 'overbooked' && 'text-red-600 dark:text-red-400',
                    employee.status === 'underutilized' && 'text-amber-600 dark:text-amber-400'
                  )}
                >
                  {employee.plannedHours}/{employee.availableHours}u
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    employee.status === 'overbooked' && 'bg-red-500',
                    employee.status === 'optimal' && 'bg-green-500',
                    employee.status === 'underutilized' && 'bg-amber-500'
                  )}
                  style={{ width: `${Math.min(employee.utilizationPercent, 100)}%` }}
                />
                {/* Overflow indicator for overbooked */}
                {employee.utilizationPercent > 100 && (
                  <div
                    className="relative -mt-2 h-2 rounded-r-full bg-red-300/50 dark:bg-red-700/50"
                    style={{
                      width: `${Math.min(employee.utilizationPercent - 100, 50)}%`,
                      marginLeft: '100%',
                      transform: `translateX(-${Math.min(employee.utilizationPercent - 100, 50)}%)`
                    }}
                  />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
