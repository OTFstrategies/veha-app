import { AlertTriangle, ArrowRight, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Actieve Projecten</h2>
        <span className="text-sm text-muted-foreground">{projects.length} projecten</span>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onProjectClick?.(project.id)}
            className={cn(
              'group relative overflow-hidden rounded-xl border bg-card p-5 text-left transition-all',
              project.isDelayed
                ? 'border-amber-200 dark:border-amber-800/50'
                : 'border-border',
              'hover:border-stone-300 hover:shadow-md dark:hover:border-stone-600'
            )}
          >
            {/* Delayed Warning */}
            {project.isDelayed && (
              <div className="absolute right-3 top-3">
                <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  <AlertTriangle className="h-3 w-3" />
                  Achterstand
                </div>
              </div>
            )}

            {/* Project Name */}
            <h3 className="pr-20 font-semibold">{project.name}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{project.clientName}</p>

            {/* Progress */}
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Voortgang</span>
                <span className="text-xs font-medium tabular-nums">{project.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    project.progress === 100
                      ? 'bg-green-500'
                      : project.isDelayed
                      ? 'bg-amber-500'
                      : 'bg-stone-700 dark:bg-stone-300'
                  )}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(project.startDate)}</span>
              <ArrowRight className="h-3 w-3" />
              <span>{formatDate(project.endDate)}</span>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              {/* Assignees */}
              <div className="flex -space-x-2">
                {project.assignees.slice(0, 4).map((assignee) => (
                  <Avatar key={assignee.id} className="h-7 w-7 border-2 border-card">
                    <AvatarFallback
                      className="text-[10px] font-medium text-white"
                      style={{ backgroundColor: assignee.color }}
                    >
                      {assignee.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {project.assignees.length > 4 && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-stone-100 text-[10px] font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                    +{project.assignees.length - 4}
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <Badge
                variant="outline"
                className={cn(
                  'text-xs capitalize',
                  project.status === 'actief' && 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400'
                )}
              >
                {project.status}
              </Badge>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
