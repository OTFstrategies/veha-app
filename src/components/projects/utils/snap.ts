/**
 * Snap utilities for drag-and-drop operations
 * These functions help snap dragged elements to grid positions
 */

/**
 * Snap a pixel delta to the nearest day boundary
 * @param deltaX - The pixel delta from the drag operation
 * @param dayWidth - The width of one day in pixels
 * @returns The snapped pixel value aligned to day boundaries
 */
export function snapToDay(deltaX: number, dayWidth: number): number {
  return Math.round(deltaX / dayWidth) * dayWidth
}

/**
 * Convert a pixel delta to number of days
 * @param deltaX - The pixel delta from the drag operation
 * @param dayWidth - The width of one day in pixels
 * @returns The number of days (can be negative)
 */
export function pixelsToDays(deltaX: number, dayWidth: number): number {
  return Math.round(deltaX / dayWidth)
}

/**
 * Snap a pixel delta to the nearest week boundary
 * @param deltaX - The pixel delta from the drag operation
 * @param dayWidth - The width of one day in pixels
 * @returns The snapped pixel value aligned to week boundaries
 */
export function snapToWeek(deltaX: number, dayWidth: number): number {
  const weekWidth = dayWidth * 7
  return Math.round(deltaX / weekWidth) * weekWidth
}

/**
 * Add days to a date and return a new date string in YYYY-MM-DD format
 * @param dateStr - The original date string in YYYY-MM-DD format
 * @param days - The number of days to add (can be negative)
 * @returns The new date string in YYYY-MM-DD format
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

/**
 * Format a Date object to YYYY-MM-DD string
 * @param date - The Date object to format
 * @returns The formatted date string
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Calculate the number of days between two dates
 * @param startDate - The start date string
 * @param endDate - The end date string
 * @returns The number of days (inclusive)
 */
export function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = end.getTime() - start.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}
