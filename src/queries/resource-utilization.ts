import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { startOfWeek, endOfWeek, eachWeekOfInterval, format, isWithinInterval } from 'date-fns'
import { nl } from 'date-fns/locale'

// =============================================================================
// Types
// =============================================================================

export interface WeeklyUtilization {
  week: string
  weekLabel: string
  weekStart: Date
  employeeId: string
  employeeName: string
  employeeColor: string
  plannedHours: number
  capacity: number
  utilizationPercent: number
  status: 'overbooked' | 'optimal' | 'underutilized'
}

export interface AggregatedWeeklyUtilization {
  week: string
  weekLabel: string
  weekStart: Date
  totalPlannedHours: number
  totalCapacity: number
  utilizationPercent: number
  status: 'overbooked' | 'optimal' | 'underutilized'
}

// =============================================================================
// Query Keys
// =============================================================================

export const utilizationKeys = {
  all: ['utilization'] as const,
  range: (start: string, end: string) => [...utilizationKeys.all, start, end] as const,
  employee: (employeeId: string, start: string, end: string) =>
    [...utilizationKeys.all, employeeId, start, end] as const,
}

// =============================================================================
// Query Hook
// =============================================================================

interface UseResourceUtilizationOptions {
  workspaceId: string | null
  startDate: Date
  endDate: Date
  employeeIds?: string[]
}

export function useResourceUtilization({
  workspaceId,
  startDate,
  endDate,
  employeeIds,
}: UseResourceUtilizationOptions) {
  return useQuery({
    queryKey: utilizationKeys.range(startDate.toISOString(), endDate.toISOString()),
    queryFn: async (): Promise<WeeklyUtilization[]> => {
      if (!workspaceId) return []

      const supabase = createClient()

      // 1. Fetch employees with their weekly capacity
      let employeesQuery = supabase
        .from('employees')
        .select('id, name, color, weekly_capacity')
        .eq('workspace_id', workspaceId)
        .eq('is_active', true)

      if (employeeIds && employeeIds.length > 0) {
        employeesQuery = employeesQuery.in('id', employeeIds)
      }

      const { data: employees, error: empError } = await employeesQuery
      if (empError) throw empError

      // 2. Fetch task assignments for these employees
      const employeeIdList = employees.map((e) => e.id)

      const { data: assignments, error: assignError } = await supabase
        .from('task_assignments')
        .select(`
          id,
          employee_id,
          planned_hours,
          task:tasks (
            id,
            start_date,
            end_date,
            duration
          )
        `)
        .in('employee_id', employeeIdList)

      if (assignError) throw assignError

      // 3. Build weekly utilization data
      const weeks = eachWeekOfInterval(
        { start: startDate, end: endDate },
        { weekStartsOn: 1 }
      )

      const results: WeeklyUtilization[] = []

      employees.forEach((employee) => {
        weeks.forEach((weekStart) => {
          const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
          const weekInterval = { start: weekStart, end: weekEnd }

          // Sum planned hours for tasks that overlap with this week
          let plannedHours = 0

          assignments
            ?.filter((a) => a.employee_id === employee.id)
            .forEach((assignment) => {
              // Task could be null or an array with one element due to Supabase join
              const taskData = assignment.task
              const task = Array.isArray(taskData) ? taskData[0] : taskData
              if (!task) return

              const taskStart = new Date(task.start_date)
              const taskEnd = new Date(task.end_date)

              // Check if task overlaps with this week
              const taskInterval = { start: taskStart, end: taskEnd }
              const overlaps =
                isWithinInterval(weekStart, taskInterval) ||
                isWithinInterval(weekEnd, taskInterval) ||
                isWithinInterval(taskStart, weekInterval) ||
                isWithinInterval(taskEnd, weekInterval)

              if (overlaps) {
                // Calculate what portion of the task falls in this week
                const overlapStart = taskStart > weekStart ? taskStart : weekStart
                const overlapEnd = taskEnd < weekEnd ? taskEnd : weekEnd
                const overlapDays =
                  Math.ceil(
                    (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)
                  ) + 1
                const totalDays = task.duration || 1
                const fraction = Math.min(1, overlapDays / totalDays)

                plannedHours += (assignment.planned_hours || 0) * fraction
              }
            })

          const capacity = employee.weekly_capacity || 40
          const utilizationPercent = Math.round((plannedHours / capacity) * 100)

          let status: WeeklyUtilization['status'] = 'optimal'
          if (utilizationPercent > 100) status = 'overbooked'
          else if (utilizationPercent < 70) status = 'underutilized'

          results.push({
            week: format(weekStart, "yyyy-'W'ww"),
            weekLabel: format(weekStart, 'd MMM', { locale: nl }),
            weekStart,
            employeeId: employee.id,
            employeeName: employee.name,
            employeeColor: employee.color,
            plannedHours: Math.round(plannedHours * 10) / 10,
            capacity,
            utilizationPercent,
            status,
          })
        })
      })

      return results
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// =============================================================================
// Aggregation Helper
// =============================================================================

/**
 * Aggregate individual employee utilization into team-wide totals per week.
 */
export function aggregateUtilization(
  data: WeeklyUtilization[]
): AggregatedWeeklyUtilization[] {
  const weekMap = new Map<string, AggregatedWeeklyUtilization>()

  data.forEach((item) => {
    const existing = weekMap.get(item.week)
    if (existing) {
      existing.totalPlannedHours += item.plannedHours
      existing.totalCapacity += item.capacity
    } else {
      weekMap.set(item.week, {
        week: item.week,
        weekLabel: item.weekLabel,
        weekStart: item.weekStart,
        totalPlannedHours: item.plannedHours,
        totalCapacity: item.capacity,
        utilizationPercent: 0,
        status: 'optimal',
      })
    }
  })

  // Calculate percentages and status
  const results = Array.from(weekMap.values())
  results.forEach((item) => {
    item.utilizationPercent = Math.round(
      (item.totalPlannedHours / item.totalCapacity) * 100
    )
    if (item.utilizationPercent > 100) item.status = 'overbooked'
    else if (item.utilizationPercent < 70) item.status = 'underutilized'
  })

  // Sort by week
  results.sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())

  return results
}
