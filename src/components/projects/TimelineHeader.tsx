import * as React from 'react'
import { cn } from '@/lib/utils'
import type { GanttZoomLevel } from './types'

// =============================================================================
// Props
// =============================================================================

interface TimelineHeaderProps {
  days: Date[]
  zoomLevel: GanttZoomLevel
  columnWidth: number
}

// =============================================================================
// Component
// =============================================================================

export function TimelineHeader({
  days,
  zoomLevel,
  columnWidth,
}: TimelineHeaderProps) {
  // ---------------------------------------------------------------------------
  // Build Header Rows Based on Zoom Level
  // ---------------------------------------------------------------------------

  const { topRow, bottomRow } = React.useMemo(() => {
    const top: Array<{ label: string; span: number; key: string }> = []
    const bottom: Array<{
      label: string
      date: Date
      isWeekend: boolean
      isToday: boolean
      key: string
    }> = []

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let currentTopLabel = ''
    let currentTopSpan = 0

    days.forEach((day, index) => {
      const isWeekend = day.getDay() === 0 || day.getDay() === 6
      const isToday = day.getTime() === today.getTime()

      // Top row grouping
      let topLabel = ''
      if (zoomLevel === 'day' || zoomLevel === 'week') {
        // Group by month
        topLabel = day.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
      } else {
        // Group by year
        topLabel = day.getFullYear().toString()
      }

      if (topLabel !== currentTopLabel) {
        if (currentTopSpan > 0) {
          top.push({ label: currentTopLabel, span: currentTopSpan, key: `${currentTopLabel}-${top.length}` })
        }
        currentTopLabel = topLabel
        currentTopSpan = 1
      } else {
        currentTopSpan++
      }

      // Bottom row labels
      let bottomLabel = ''
      if (zoomLevel === 'day') {
        bottomLabel = day.getDate().toString()
      } else if (zoomLevel === 'week') {
        // Show week number, only on Monday
        if (day.getDay() === 1 || index === 0) {
          const weekNum = getWeekNumber(day)
          bottomLabel = `W${weekNum}`
        }
      } else if (zoomLevel === 'month') {
        // Show month abbreviation on first day
        if (day.getDate() === 1 || index === 0) {
          bottomLabel = day.toLocaleDateString('nl-NL', { month: 'short' })
        }
      } else if (zoomLevel === 'quarter') {
        // Show quarter on first day of quarter
        const month = day.getMonth()
        if ((month === 0 || month === 3 || month === 6 || month === 9) && day.getDate() === 1) {
          bottomLabel = `Q${Math.floor(month / 3) + 1}`
        }
      }

      bottom.push({
        label: bottomLabel,
        date: day,
        isWeekend,
        isToday,
        key: day.toISOString(),
      })
    })

    // Add last top row item
    if (currentTopSpan > 0) {
      top.push({ label: currentTopLabel, span: currentTopSpan, key: `${currentTopLabel}-${top.length}` })
    }

    return { topRow: top, bottomRow: bottom }
  }, [days, zoomLevel])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col" style={{ width: days.length * columnWidth }}>
      {/* Top Row - Month/Year */}
      <div className="flex h-5 border-b border-border">
        {topRow.map(({ label, span, key }) => (
          <div
            key={key}
            className="flex items-center justify-center border-r border-border text-xs font-medium text-muted-foreground"
            style={{ width: span * columnWidth }}
          >
            <span className="truncate px-1 capitalize">{label}</span>
          </div>
        ))}
      </div>

      {/* Bottom Row - Day/Week/Month */}
      <div className="flex h-5">
        {bottomRow.map(({ label, isWeekend, isToday, key }) => (
          <div
            key={key}
            className={cn(
              'flex items-center justify-center border-r border-border text-xs',
              isWeekend && 'bg-zinc-100/50 dark:bg-zinc-800/30',
              isToday && 'bg-blue-100 font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            )}
            style={{ width: columnWidth }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// Helpers
// =============================================================================

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}
