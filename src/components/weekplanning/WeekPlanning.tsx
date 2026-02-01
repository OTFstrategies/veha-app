import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type {
  CurrentWeek,
  WeekEmployee,
  WeekDay,
  DayEntry,
  AvailabilityStyles,
  AvailabilityStatus,
} from '@/types/weekplanning'

// =============================================================================
// Props
// =============================================================================

export interface WeekPlanningProps {
  currentWeek: CurrentWeek
  employees: WeekEmployee[]
  availabilityStyles?: AvailabilityStyles
  onPreviousWeek?: () => void
  onNextWeek?: () => void
  onToday?: () => void
  onTaskClick?: (taskId: string, projectId: string) => void
  onEmployeeClick?: (employeeId: string) => void
  onAvailabilityClick?: (employeeId: string, date: string) => void
}

// =============================================================================
// Default Styles
// =============================================================================

const defaultAvailabilityStyles: AvailabilityStyles = {
  ziek: {
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-700 dark:text-red-300',
    label: 'ZIEK',
  },
  vakantie: {
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-700 dark:text-amber-300',
    label: 'VAKANTIE',
  },
  vrij: {
    bgColor: 'bg-zinc-100 dark:bg-zinc-800',
    textColor: 'text-zinc-500 dark:text-zinc-400',
    label: 'VRIJ',
  },
  training: {
    bgColor: 'bg-zinc-200 dark:bg-zinc-700',
    textColor: 'text-zinc-700 dark:text-zinc-300',
    label: 'TRAINING',
  },
}

// =============================================================================
// Constants
// =============================================================================

/** Width of the employee column in pixels */
const EMPLOYEE_COLUMN_WIDTH = 180
/** Width of each day column in pixels */
const DAY_COLUMN_WIDTH = 160
/** Height of each employee row in pixels */
const ROW_HEIGHT = 100

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get utilization bar color based on percentage
 */
function getUtilizationColor(percentage: number): string {
  if (percentage > 100) return 'bg-red-500'
  if (percentage > 80) return 'bg-orange-500'
  if (percentage > 50) return 'bg-blue-500'
  return 'bg-green-500'
}

/**
 * Calculate utilization for a day entry
 */
function calculateCellUtilization(entry: DayEntry): { planned: number; available: number; percentage: number } {
  const available = entry.availableHours ?? 8
  const planned = entry.plannedHours ?? entry.tasks.reduce((sum, t) => sum + (t.hours ?? 0), 0)
  const percentage = available > 0 ? (planned / available) * 100 : 0

  return { planned, available, percentage }
}

/**
 * Calculate day statistics across all employees
 */
function calculateDayStats(employees: WeekEmployee[], date: string) {
  let planned = 0
  let available = 0

  employees.forEach((emp) => {
    const entry = emp.schedule[date]
    if (entry) {
      // If employee has availability (sick, vacation, etc.), they contribute 0 available hours
      if (entry.availability) {
        // No available hours for this day
      } else {
        planned += entry.plannedHours ?? entry.tasks.reduce((sum, t) => sum + (t.hours ?? 0), 0)
        available += entry.availableHours ?? 8
      }
    } else {
      available += 8 // Default 8 hours
    }
  })

  return {
    planned,
    available,
    overbooked: planned > available,
  }
}

// =============================================================================
// Component
// =============================================================================

export function WeekPlanning({
  currentWeek,
  employees,
  availabilityStyles = defaultAvailabilityStyles,
  onPreviousWeek,
  onNextWeek,
  onToday,
  onTaskClick,
  onEmployeeClick,
  onAvailabilityClick,
}: WeekPlanningProps) {
  // Helper functions
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatWeekRange = () => {
    const start = new Date(currentWeek.startDate)
    const end = new Date(currentWeek.endDate)
    const startStr = start.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
    const endStr = end.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
    return `${startStr} - ${endStr}`
  }

  // Render cell content
  const renderCellContent = (
    entry: DayEntry,
    day: WeekDay,
    employeeId: string
  ) => {
    // If there's availability, show that
    if (entry.availability) {
      const style = availabilityStyles[entry.availability.status as AvailabilityStatus]
      return (
        <button
          onClick={() => onAvailabilityClick?.(employeeId, day.date)}
          className={cn(
            'flex h-full w-full flex-col items-center justify-center rounded-lg p-2 transition-opacity hover:opacity-80',
            style.bgColor
          )}
        >
          <span className={cn('text-xs font-bold', style.textColor)}>
            {style.label}
          </span>
          {entry.availability.notes && (
            <span className={cn('mt-1 text-center text-[10px] line-clamp-2', style.textColor)}>
              {entry.availability.notes}
            </span>
          )}
        </button>
      )
    }

    // Show tasks
    if (entry.tasks.length === 0) {
      return (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          —
        </div>
      )
    }

    // Calculate utilization
    const { planned, available, percentage } = calculateCellUtilization(entry)
    const utilizationColor = getUtilizationColor(percentage)
    const showUtilization = entry.tasks.length > 0 && (planned > 0 || entry.plannedHours !== undefined)

    const visibleTasks = entry.tasks.slice(0, 2)
    const remainingCount = entry.tasks.length - 2

    return (
      <div className="flex h-full flex-col gap-1 p-1">
        {/* Utilization header - only show if there are tasks with hours */}
        {showUtilization && (
          <div className="flex items-center gap-1.5 px-1">
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {planned}/{available} uur
            </span>
            <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', utilizationColor)}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Tasks */}
        {visibleTasks.map((task) => (
          <Tooltip key={task.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onTaskClick?.(task.id, task.projectId)}
                className="group flex-1 rounded-md border border-border bg-card p-1.5 text-left transition-all hover:border-zinc-300 hover:shadow-sm dark:hover:border-zinc-600"
              >
                <p className="truncate text-xs font-medium">{task.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {task.clientName}
                </p>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-1">
                <p className="font-medium">{task.name}</p>
                <p className="text-xs text-muted-foreground">{task.projectName}</p>
                <p className="text-xs text-muted-foreground">{task.clientName}</p>
                {task.hours && <p className="text-xs">{task.hours} uur gepland</p>}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
        {remainingCount > 0 && (
          <div className="text-center text-[10px] text-muted-foreground">
            +{remainingCount} meer
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="shrink-0 border-b border-border px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Weekplanning</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Wie werkt waar deze week
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={onPreviousWeek} aria-label="Vorige week">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={onToday}>
              <Calendar className="mr-2 h-4 w-4" />
              Vandaag
            </Button>
            <Button variant="outline" size="icon" onClick={onNextWeek} aria-label="Volgende week">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="ml-2 text-sm font-medium">
              Week {currentWeek.weekNumber} ({formatWeekRange()})
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-fit">
          {/* Header Row */}
          <div className="sticky top-0 z-20 flex border-b border-border bg-zinc-50 dark:bg-zinc-900">
            {/* Employee Column Header */}
            <div
              className="sticky left-0 z-30 shrink-0 border-r border-border bg-zinc-50 px-4 py-3 dark:bg-zinc-900"
              style={{ width: EMPLOYEE_COLUMN_WIDTH }}
            >
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Medewerker
              </span>
            </div>

            {/* Day Headers */}
            {currentWeek.days.map((day) => (
              <div
                key={day.date}
                className={cn(
                  'shrink-0 border-r border-border px-3 py-3 text-center',
                  day.isToday && 'bg-blue-50 dark:bg-blue-900/20'
                )}
                style={{ width: DAY_COLUMN_WIDTH }}
              >
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {day.dayName}
                </div>
                <div
                  className={cn(
                    'mt-1 text-lg font-semibold',
                    day.isToday && 'text-blue-600 dark:text-blue-400'
                  )}
                >
                  {day.dayNumber}
                </div>
              </div>
            ))}
          </div>

          {/* Capacity Summary Row */}
          <div className="flex border-b border-border bg-muted/50">
            <div
              className="sticky left-0 z-30 shrink-0 border-r border-border bg-muted/50 px-4 py-2"
              style={{ width: EMPLOYEE_COLUMN_WIDTH }}
            >
              <span className="text-xs font-medium text-muted-foreground">
                Totaal
              </span>
            </div>

            {currentWeek.days.map((day) => {
              const dayStats = calculateDayStats(employees, day.date)
              return (
                <div
                  key={`summary-${day.date}`}
                  className={cn(
                    'shrink-0 border-r border-border px-3 py-2 text-center',
                    day.isToday && 'bg-blue-50/30 dark:bg-blue-900/10'
                  )}
                  style={{ width: DAY_COLUMN_WIDTH }}
                >
                  <div className="text-xs text-muted-foreground">
                    {dayStats.planned}/{dayStats.available} uur
                  </div>
                  {dayStats.overbooked && (
                    <div className="text-xs text-red-500 font-medium">
                      Overbezet!
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Employee Rows */}
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="flex border-b border-border"
              style={{ height: ROW_HEIGHT }}
            >
              {/* Employee Cell (Sticky) */}
              <button
                onClick={() => onEmployeeClick?.(employee.id)}
                className={cn(
                  'sticky left-0 z-10 flex shrink-0 items-center gap-3 border-r border-border bg-card px-4 transition-colors',
                  'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                )}
                style={{ width: EMPLOYEE_COLUMN_WIDTH }}
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 text-sm font-medium">
                    {getInitials(employee.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{employee.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {employee.role}
                  </div>
                </div>
              </button>

              {/* Day Cells */}
              {currentWeek.days.map((day) => {
                const entry = employee.schedule[day.date] || {
                  availability: null,
                  tasks: [],
                }

                return (
                  <div
                    key={day.date}
                    className={cn(
                      'shrink-0 border-r border-border p-1',
                      day.isToday && 'bg-blue-50/50 dark:bg-blue-900/10'
                    )}
                    style={{ width: DAY_COLUMN_WIDTH }}
                  >
                    {renderCellContent(entry, day, employee.id)}
                  </div>
                )
              })}
            </div>
          ))}

          {/* Empty State */}
          {employees.length === 0 && (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Geen medewerkers om weer te geven
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
