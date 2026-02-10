"use client"

import { AlertTriangle, ArrowRight, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MotionList, MotionListItem } from '@/lib/motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { ActiveProject } from '@/types/dashboard'

// =============================================================================
// Props
// =============================================================================

interface ActiveProjectsProps {
  projects: ActiveProject[]
  onProjectClick?: (projectId: string) => void
}

// =============================================================================
// Component
// =============================================================================

export function ActiveProjects({ projects, onProjectClick }: ActiveProjectsProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
    })
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">Geen actieve projecten</p>
      </div>
    )
  }

  return (
    <MotionList className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {projects.map((project) => (
        <MotionListItem key={project.id}>
          <button
          onClick={() => onProjectClick?.(project.id)}
          aria-label={`Project: ${project.name}, ${project.clientName}, ${project.progress}% voltooid${project.isDelayed ? ', achterstand' : ''}`}
          className={cn(
            'group relative overflow-hidden rounded-lg border bg-card p-4 text-left transition-all',
            project.isDelayed
              ? 'border-zinc-300 dark:border-zinc-600'
              : 'border-border',
            'hover:border-zinc-300 hover:shadow-sm dark:hover:border-zinc-600'
          )}
        >
          {/* Delayed Warning */}
          {project.isDelayed && (
            <div className="absolute right-3 top-3">
              <div className="flex items-center gap-1 rounded-full bg-state-warning-bg px-2 py-0.5 text-xs font-medium text-state-warning-text">
                <AlertTriangle className="h-3 w-3" />
                Achterstand
              </div>
            </div>
          )}

          {/* Project Name */}
          <h3 className="pr-20 text-sm font-semibold">{project.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{project.clientName}</p>

          {/* Progress */}
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Voortgang</span>
              <span className="text-xs font-medium tabular-nums" aria-hidden="true">{project.progress}%</span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
              role="progressbar"
              aria-valuenow={project.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Project voortgang: ${project.progress}%`}
            >
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  project.progress === 100
                    ? 'bg-zinc-800 dark:bg-zinc-200'
                    : project.isDelayed
                    ? 'bg-zinc-500 dark:bg-zinc-400'
                    : 'bg-zinc-700 dark:bg-zinc-300'
                )}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(project.startDate)}</span>
            <ArrowRight className="h-2.5 w-2.5" />
            <span>{formatDate(project.endDate)}</span>
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            {/* Assignees */}
            <div className="flex -space-x-1.5">
              {project.assignees.slice(0, 3).map((assignee) => (
                <Avatar key={assignee.id} className="h-6 w-6 border-2 border-card">
                  <AvatarFallback className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 text-[9px] font-medium">
                    {assignee.initials}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.assignees.length > 3 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-zinc-100 text-[9px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  +{project.assignees.length - 3}
                </div>
              )}
            </div>

            {/* Status Badge */}
            <Badge
              variant="outline"
              className={cn(
                'text-xs capitalize',
                project.status === 'actief' && 'border-state-success-text/20 bg-state-success-bg text-state-success-text'
              )}
            >
              {project.status}
            </Badge>
          </div>
        </button>
        </MotionListItem>
      ))}
    </MotionList>
  )
}
