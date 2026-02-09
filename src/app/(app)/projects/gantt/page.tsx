'use client'

import * as React from 'react'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  format,
  differenceInDays,
  isWeekend,
} from 'date-fns'
import { nl } from 'date-fns/locale'
import {
  GanttChart,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useProjects } from '@/queries/projects'
import type { Project } from '@/types/projects'
import { STATUS_CONFIG } from '@/components/projects/constants'
import { ViewSwitcher } from '@/components/projects/ViewSwitcher'

// =============================================================================
// Loading State Component
// =============================================================================

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

// =============================================================================
// Timeline Header Component
// =============================================================================

interface TimelineHeaderProps {
  startDate: Date
  endDate: Date
  dayWidth: number
}

function TimelineHeader({ startDate, endDate, dayWidth }: TimelineHeaderProps) {
  const weeks = useMemo(() => {
    return eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: 1 }
    )
  }, [startDate, endDate])

  const days = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate })
  }, [startDate, endDate])

  return (
    <div className="sticky top-0 z-10 bg-card border-b border-border">
      {/* Weeks Row */}
      <div className="flex border-b border-border">
        {weeks.map((weekStart, index) => {
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekEnd.getDate() + 6)
          const daysInWeek = Math.min(
            differenceInDays(endDate, weekStart) + 1,
            7
          )
          const width = daysInWeek * dayWidth

          return (
            <div
              key={index}
              className="flex-shrink-0 px-2 py-1 text-xs font-medium text-muted-foreground border-r border-border"
              style={{ width }}
            >
              Week {format(weekStart, 'w', { locale: nl })}
            </div>
          )
        })}
      </div>

      {/* Days Row */}
      <div className="flex">
        {days.map((day, index) => {
          const isWeekendDay = isWeekend(day)
          const isFirstOfMonth = day.getDate() === 1

          return (
            <div
              key={index}
              className={cn(
                'flex-shrink-0 flex flex-col items-center justify-center py-1 text-xs border-r border-border',
                isWeekendDay && 'bg-zinc-100 dark:bg-zinc-800/50',
                isFirstOfMonth && 'border-l-2 border-l-zinc-400'
              )}
              style={{ width: dayWidth }}
            >
              <span className="text-muted-foreground">
                {format(day, 'EEE', { locale: nl })}
              </span>
              <span
                className={cn(
                  'font-medium',
                  isWeekendDay
                    ? 'text-muted-foreground'
                    : 'text-foreground'
                )}
              >
                {format(day, 'd')}
              </span>
              {isFirstOfMonth && (
                <span className="text-[10px] text-muted-foreground">
                  {format(day, 'MMM', { locale: nl })}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// =============================================================================
// Project Row Component
// =============================================================================

interface ProjectRowProps {
  project: Project
  startDate: Date
  endDate: Date
  dayWidth: number
  onClick: () => void
}

function ProjectRow({
  project,
  startDate,
  endDate,
  dayWidth,
  onClick,
}: ProjectRowProps) {
  const totalDays = differenceInDays(endDate, startDate) + 1
  const projectStart = new Date(project.startDate)
  const projectEnd = new Date(project.endDate)

  // Calculate bar position and width
  const offsetDays = Math.max(0, differenceInDays(projectStart, startDate))
  const barStartDays = Math.max(0, offsetDays)
  const barEndDays = Math.min(
    totalDays,
    differenceInDays(projectEnd, startDate) + 1
  )
  const barWidth = Math.max(0, (barEndDays - barStartDays) * dayWidth)
  const barOffset = barStartDays * dayWidth

  // Check if project is visible in current range
  const isVisible = projectEnd >= startDate && projectStart <= endDate

  const days = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate })
  }, [startDate, endDate])

  return (
    <div className="flex border-b border-border hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
      {/* Background grid */}
      <div className="relative flex">
        {days.map((day, index) => (
          <div
            key={index}
            className={cn(
              'flex-shrink-0 h-12 border-r border-border',
              isWeekend(day) && 'bg-zinc-100/50 dark:bg-zinc-800/30'
            )}
            style={{ width: dayWidth }}
          />
        ))}

        {/* Project Bar */}
        {isVisible && barWidth > 0 && (
          <button
            onClick={onClick}
            className={cn(
              'absolute top-2 h-8 rounded-md shadow-sm transition-all hover:shadow-md hover:brightness-110',
              STATUS_CONFIG[project.status].barColor
            )}
            style={{
              left: barOffset,
              width: barWidth,
            }}
            title={`${project.name} - ${STATUS_CONFIG[project.status].label}`}
          >
            <div className="flex items-center h-full px-2 overflow-hidden">
              <span className="text-xs font-medium text-white truncate">
                {project.name}
              </span>
            </div>

            {/* Progress indicator */}
            {project.progress > 0 && project.progress < 100 && (
              <div
                className="absolute bottom-0 left-0 h-1 bg-white/40 rounded-bl-md"
                style={{ width: `${project.progress}%` }}
              />
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// Project List Sidebar
// =============================================================================

interface ProjectSidebarProps {
  projects: Project[]
  onProjectClick: (id: string) => void
}

function ProjectSidebar({ projects, onProjectClick }: ProjectSidebarProps) {
  return (
    <div className="flex-shrink-0 w-64 border-r border-border bg-card">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="h-[62px] flex items-end px-4 pb-2 border-b border-border">
          <span className="text-sm font-medium text-muted-foreground">
            Project
          </span>
        </div>
      </div>

      {/* Project List */}
      <div>
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onProjectClick(project.id)}
            className="w-full h-12 flex items-center gap-2 px-4 border-b border-border hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors text-left"
          >
            <div
              className={cn(
                'w-2 h-2 rounded-full flex-shrink-0',
                STATUS_CONFIG[project.status].barColor
              )}
            />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-foreground truncate block">
                {project.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function ProjectsGanttPage() {
  const router = useRouter()
  const { data: projects, isLoading, error } = useProjects()

  // Date range state (current month + 2 months)
  const [monthOffset, setMonthOffset] = React.useState(0)

  const { startDate, endDate } = useMemo(() => {
    const now = new Date()
    const start = startOfMonth(addMonths(now, monthOffset))
    const end = endOfMonth(addMonths(now, monthOffset + 2))
    return { startDate: start, endDate: end }
  }, [monthOffset])

  // Day width in pixels
  const dayWidth = 32

  // Filter and sort projects
  const sortedProjects = useMemo(() => {
    if (!projects) return []
    return [...projects].sort((a, b) => {
      // Sort by start date
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    })
  }, [projects])

  // Handlers
  const handleProjectClick = (id: string) => {
    router.push(`/projects/${id}`)
  }

  const handlePrevMonth = () => {
    setMonthOffset((prev) => prev - 1)
  }

  const handleNextMonth = () => {
    setMonthOffset((prev) => prev + 1)
  }

  const handleToday = () => {
    setMonthOffset(0)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-destructive">
          Er is een fout opgetreden bij het laden van projecten.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Projecten</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gantt tijdlijn van alle projecten.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Vandaag
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground ml-2">
              {format(startDate, 'MMM yyyy', { locale: nl })} -{' '}
              {format(endDate, 'MMM yyyy', { locale: nl })}
            </span>
          </div>
          <ViewSwitcher activeView="gantt" />
        </div>
      </div>

      {/* Gantt Chart */}
      {isLoading ? (
        <LoadingState />
      ) : sortedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <GanttChart className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            Geen projecten
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Er zijn nog geen projecten om weer te geven.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar with project names */}
          <ProjectSidebar
            projects={sortedProjects}
            onProjectClick={handleProjectClick}
          />

          {/* Timeline */}
          <div className="flex-1 overflow-auto">
            <TimelineHeader
              startDate={startDate}
              endDate={endDate}
              dayWidth={dayWidth}
            />
            <div>
              {sortedProjects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  startDate={startDate}
                  endDate={endDate}
                  dayWidth={dayWidth}
                  onClick={() => handleProjectClick(project.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="px-6 py-3 border-t border-border flex items-center gap-6">
        <span className="text-xs text-muted-foreground font-medium">
          Status:
        </span>
        {Object.entries(STATUS_CONFIG).map(([status, config]) => (
          <div key={status} className="flex items-center gap-2">
            <div
              className={cn(
                'w-3 h-3 rounded-sm',
                config.barColor
              )}
            />
            <span className="text-xs text-muted-foreground">{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
