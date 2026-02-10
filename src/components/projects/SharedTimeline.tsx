import * as React from 'react'
import { TimelineHeader } from './TimelineHeader'
import type { TimelineConfig, ViewOptions } from './types'

// =============================================================================
// Props
// =============================================================================

interface SharedTimelineProps {
  timelineConfig: TimelineConfig
  viewOptions: ViewOptions
  scrollLeft: number
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void
  children: React.ReactNode
  timelineRef?: React.RefObject<HTMLDivElement>
}

// =============================================================================
// Component
// =============================================================================

/**
 * SharedTimeline provides synchronized scrolling between Gantt and Scheduler panels.
 * It wraps the timeline content and ensures both panels scroll together.
 */
export function SharedTimeline({
  timelineConfig,
  viewOptions,
  scrollLeft,
  onScroll,
  children,
  timelineRef,
}: SharedTimelineProps) {
  const localRef = React.useRef<HTMLDivElement>(null)
  const ref = timelineRef || localRef

  // ---------------------------------------------------------------------------
  // Sync scroll position when scrollLeft prop changes
  // ---------------------------------------------------------------------------

  React.useEffect(() => {
    if (ref.current && ref.current.scrollLeft !== scrollLeft) {
      ref.current.scrollLeft = scrollLeft
    }
  }, [scrollLeft, ref])

  // ---------------------------------------------------------------------------
  // Timeline Days
  // ---------------------------------------------------------------------------

  const timelineDays = React.useMemo(() => {
    const days: Date[] = []
    const current = new Date(timelineConfig.startDate)
    while (current <= timelineConfig.endDate) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return days
  }, [timelineConfig.startDate, timelineConfig.endDate])

  const timelineWidth = timelineDays.length * timelineConfig.columnWidth

  // ---------------------------------------------------------------------------
  // Today Line Position
  // ---------------------------------------------------------------------------

  const todayPosition = React.useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dayOffset = Math.floor(
      (today.getTime() - timelineConfig.startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    return dayOffset * timelineConfig.columnWidth
  }, [timelineConfig])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div
        ref={ref}
        className="shrink-0 overflow-x-auto overflow-y-hidden"
        onScroll={onScroll}
      >
        <TimelineHeader
          days={timelineDays}
          zoomLevel={timelineConfig.zoomLevel}
          columnWidth={timelineConfig.columnWidth}
        />
      </div>

      {/* Content Area with Background Columns */}
      <div
        className="relative flex-1 overflow-x-auto overflow-y-hidden"
        onScroll={onScroll}
      >
        <div
          className="relative h-full"
          style={{ width: timelineWidth }}
        >
          {/* Weekend Columns */}
          {viewOptions.showWeekends &&
            timelineDays.map((day, i) => {
              const isWeekend = day.getDay() === 0 || day.getDay() === 6
              if (!isWeekend) return null
              return (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 bg-zinc-100/50 dark:bg-zinc-800/30"
                  style={{
                    left: i * timelineConfig.columnWidth,
                    width: timelineConfig.columnWidth,
                  }}
                />
              )
            })}

          {/* Today Line */}
          {viewOptions.showTodayLine && todayPosition > 0 && (
            <div
              className="absolute top-0 bottom-0 z-10 w-0.5 bg-zinc-500 dark:bg-zinc-400"
              style={{ left: todayPosition }}
            >
              <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-zinc-500 dark:bg-zinc-400" />
            </div>
          )}

          {/* Children (task bars, etc.) */}
          {children}
        </div>
      </div>
    </div>
  )
}
