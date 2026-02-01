import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { CapacityEntry } from '@/types/dashboard'

// =============================================================================
// Props
// =============================================================================

interface CapacityWidgetProps {
  capacityData: CapacityEntry[]
  onEmployeeClick?: (employeeId: string) => void
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
}: CapacityWidgetProps) {
  // Sort: overbooked first, then optimal, then underutilized
  const sortedData = [...capacityData].sort((a, b) => {
    const order = { overbooked: 0, optimal: 1, underutilized: 2 }
    return order[a.status] - order[b.status]
  })

  return (
    <div className="divide-y divide-border">
      {sortedData.map((employee) => (
        <button
          key={employee.id}
          onClick={() => onEmployeeClick?.(employee.id)}
          className={cn(
            'flex w-full items-center gap-3 py-3 text-left transition-colors first:pt-0 last:pb-0',
            'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg px-2 -mx-2',
            employee.status === 'overbooked' && 'bg-red-50/50 dark:bg-red-900/10'
          )}
        >
          {/* Avatar */}
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 text-[10px] font-medium">
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
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  employee.status === 'overbooked' && 'bg-red-500',
                  employee.status === 'optimal' && 'bg-green-500',
                  employee.status === 'underutilized' && 'bg-amber-500'
                )}
                style={{ width: `${Math.min(employee.utilizationPercent, 100)}%` }}
              />
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
