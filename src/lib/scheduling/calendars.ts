import { addDays, isWeekend, format, differenceInDays, isSameDay } from 'date-fns'

// =============================================================================
// Types
// =============================================================================

export interface WorkCalendar {
  id: string
  name: string
  workingDays: number[] // 0=Sunday, 1=Monday, ..., 6=Saturday
  hoursPerDay: number
  holidays: CalendarHoliday[]
}

export interface CalendarHoliday {
  date: Date
  name: string
  isRecurring: boolean
}

// Default working calendar (Monday-Friday, 8 hours/day)
export const DEFAULT_CALENDAR: WorkCalendar = {
  id: 'default',
  name: 'Standaard',
  workingDays: [1, 2, 3, 4, 5], // Monday to Friday
  hoursPerDay: 8,
  holidays: [],
}

// =============================================================================
// Working Day Calculations
// =============================================================================

/**
 * Check if a date is a working day according to the calendar.
 */
export function isWorkingDay(
  date: Date,
  calendar: WorkCalendar = DEFAULT_CALENDAR
): boolean {
  const dayOfWeek = date.getDay()

  // Check if it's a working day of the week
  if (!calendar.workingDays.includes(dayOfWeek)) {
    return false
  }

  // Check if it's a holiday
  const isHoliday = calendar.holidays.some((holiday) => {
    if (holiday.isRecurring) {
      // For recurring holidays, compare month and day only
      return (
        date.getMonth() === holiday.date.getMonth() &&
        date.getDate() === holiday.date.getDate()
      )
    }
    return isSameDay(date, holiday.date)
  })

  return !isHoliday
}

/**
 * Get the next working day (including the given date if it's a working day).
 */
export function getNextWorkingDay(
  date: Date,
  calendar: WorkCalendar = DEFAULT_CALENDAR
): Date {
  let current = new Date(date)
  let iterations = 0
  const maxIterations = 365 // Safety limit

  while (!isWorkingDay(current, calendar) && iterations < maxIterations) {
    current = addDays(current, 1)
    iterations++
  }

  return current
}

/**
 * Get the previous working day (including the given date if it's a working day).
 */
export function getPreviousWorkingDay(
  date: Date,
  calendar: WorkCalendar = DEFAULT_CALENDAR
): Date {
  let current = new Date(date)
  let iterations = 0
  const maxIterations = 365

  while (!isWorkingDay(current, calendar) && iterations < maxIterations) {
    current = addDays(current, -1)
    iterations++
  }

  return current
}

/**
 * Add working days to a date.
 */
export function addWorkingDays(
  date: Date,
  days: number,
  calendar: WorkCalendar = DEFAULT_CALENDAR
): Date {
  if (days === 0) return date

  const direction = days > 0 ? 1 : -1
  let remaining = Math.abs(days)
  let current = new Date(date)

  while (remaining > 0) {
    current = addDays(current, direction)
    if (isWorkingDay(current, calendar)) {
      remaining--
    }
  }

  return current
}

/**
 * Calculate working days between two dates (exclusive of end date).
 */
export function getWorkingDaysBetween(
  startDate: Date,
  endDate: Date,
  calendar: WorkCalendar = DEFAULT_CALENDAR
): number {
  if (startDate >= endDate) return 0

  let count = 0
  let current = new Date(startDate)

  while (current < endDate) {
    if (isWorkingDay(current, calendar)) {
      count++
    }
    current = addDays(current, 1)
  }

  return count
}

/**
 * Calculate the end date given a start date and duration in working days.
 */
export function calculateEndDate(
  startDate: Date,
  durationDays: number,
  calendar: WorkCalendar = DEFAULT_CALENDAR
): Date {
  if (durationDays <= 0) return startDate

  // Ensure we start on a working day
  let current = getNextWorkingDay(startDate, calendar)
  let remaining = durationDays - 1 // -1 because start day counts as day 1

  while (remaining > 0) {
    current = addDays(current, 1)
    if (isWorkingDay(current, calendar)) {
      remaining--
    }
  }

  return current
}

/**
 * Calculate duration in calendar days including non-working days.
 */
export function getCalendarDuration(
  startDate: Date,
  endDate: Date
): number {
  return differenceInDays(endDate, startDate) + 1
}

// =============================================================================
// Constraint Helpers
// =============================================================================

export type ConstraintType = 'ASAP' | 'ALAP' | 'MFO' | 'MSO' | 'SNET' | 'SNLT' | 'FNET' | 'FNLT'

export interface ConstraintResult {
  startDate: Date
  endDate: Date
  constraintViolated: boolean
  violationMessage?: string
}

/**
 * Apply a scheduling constraint to a task.
 */
export function applyConstraint(
  preferredStart: Date,
  durationDays: number,
  constraintType: ConstraintType,
  constraintDate: Date | null,
  calendar: WorkCalendar = DEFAULT_CALENDAR
): ConstraintResult {
  let startDate = getNextWorkingDay(preferredStart, calendar)
  let endDate = calculateEndDate(startDate, durationDays, calendar)
  let constraintViolated = false
  let violationMessage: string | undefined

  switch (constraintType) {
    case 'ASAP':
      // As Soon As Possible - use preferred start (default behavior)
      break

    case 'ALAP':
      // As Late As Possible - this would be calculated by backward pass
      // For now, just use the preferred start
      break

    case 'MSO': // Must Start On
      if (constraintDate) {
        const mustStart = getNextWorkingDay(constraintDate, calendar)
        startDate = mustStart
        endDate = calculateEndDate(startDate, durationDays, calendar)

        if (!isSameDay(startDate, mustStart)) {
          constraintViolated = true
          violationMessage = `Taak moet starten op ${format(constraintDate, 'dd-MM-yyyy')}`
        }
      }
      break

    case 'MFO': // Must Finish On
      if (constraintDate) {
        const mustFinish = getPreviousWorkingDay(constraintDate, calendar)
        endDate = mustFinish
        // Calculate start date backward from end
        startDate = addWorkingDays(endDate, -(durationDays - 1), calendar)

        if (!isSameDay(endDate, mustFinish)) {
          constraintViolated = true
          violationMessage = `Taak moet eindigen op ${format(constraintDate, 'dd-MM-yyyy')}`
        }
      }
      break

    case 'SNET': // Start No Earlier Than
      if (constraintDate && startDate < constraintDate) {
        startDate = getNextWorkingDay(constraintDate, calendar)
        endDate = calculateEndDate(startDate, durationDays, calendar)
      }
      break

    case 'SNLT': // Start No Later Than
      if (constraintDate && startDate > constraintDate) {
        startDate = getNextWorkingDay(constraintDate, calendar)
        endDate = calculateEndDate(startDate, durationDays, calendar)
        constraintViolated = true
        violationMessage = `Taak kan niet starten voor ${format(constraintDate, 'dd-MM-yyyy')}`
      }
      break

    case 'FNET': // Finish No Earlier Than
      if (constraintDate && endDate < constraintDate) {
        endDate = getPreviousWorkingDay(constraintDate, calendar)
        // Adjust start date if needed
        const newDuration = getWorkingDaysBetween(startDate, endDate) + 1
        if (newDuration < durationDays) {
          startDate = addWorkingDays(endDate, -(durationDays - 1), calendar)
        }
      }
      break

    case 'FNLT': // Finish No Later Than
      if (constraintDate && endDate > constraintDate) {
        endDate = getPreviousWorkingDay(constraintDate, calendar)
        // Calculate start date backward
        startDate = addWorkingDays(endDate, -(durationDays - 1), calendar)
        constraintViolated = true
        violationMessage = `Taak kan niet eindigen na ${format(constraintDate, 'dd-MM-yyyy')}`
      }
      break
  }

  return {
    startDate,
    endDate,
    constraintViolated,
    violationMessage,
  }
}

// =============================================================================
// Dutch Holiday Presets (Common Dutch holidays)
// =============================================================================

export function getDutchHolidays(year: number): CalendarHoliday[] {
  // Note: Some holidays like Easter vary each year, this is simplified
  return [
    { date: new Date(year, 0, 1), name: 'Nieuwjaarsdag', isRecurring: true },
    { date: new Date(year, 3, 27), name: 'Koningsdag', isRecurring: true },
    { date: new Date(year, 4, 5), name: 'Bevrijdingsdag', isRecurring: true },
    { date: new Date(year, 11, 25), name: 'Eerste Kerstdag', isRecurring: true },
    { date: new Date(year, 11, 26), name: 'Tweede Kerstdag', isRecurring: true },
  ]
}
