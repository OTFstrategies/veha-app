import * as React from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Pencil,
  Route,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Project, ProjectStatus } from '@/types/projects'
import type { CriticalPathResult } from '@/lib/scheduling/critical-path'

// =============================================================================
// Props
// =============================================================================

interface ProjectHeaderProps {
  project: Project
  stats: {
    total: number
    completed: number
    inProgress: number
  }
  /** Number of scheduling conflicts in the project */
  conflictCount?: number
  /** Critical path analysis result */
  criticalPathData?: CriticalPathResult
  onBack?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onClientClick?: (clientId: string) => void
}

// =============================================================================
// Status Badge Config
// =============================================================================

const STATUS_CONFIG: Record<ProjectStatus, { label: string; className: string }> = {
  gepland: {
    label: 'Gepland',
    className: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  },
  actief: {
    label: 'Actief',
    className: 'bg-state-success-bg text-state-success-text',
  },
  'on-hold': {
    label: 'On-hold',
    className: 'bg-state-warning-bg text-state-warning-text',
  },
  afgerond: {
    label: 'Afgerond',
    className: 'bg-state-info-bg text-state-info-text',
  },
  geannuleerd: {
    label: 'Geannuleerd',
    className: 'bg-state-error-bg text-state-error-text',
  },
}

// =============================================================================
// Component
// =============================================================================

export function ProjectHeader({
  project,
  stats,
  conflictCount = 0,
  criticalPathData,
  onBack,
  onEdit,
  onDelete,
  onClientClick,
}: ProjectHeaderProps) {
  const statusConfig = STATUS_CONFIG[project.status]

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
    })
  }

  // Calculate critical path stats
  const criticalPathStats = React.useMemo(() => {
    if (!criticalPathData || criticalPathData.scheduleInfo.size === 0) return null

    let criticalCount = 0

    criticalPathData.scheduleInfo.forEach((info) => {
      if (info.isCritical) {
        criticalCount++
      }
    })

    return {
      projectDuration: criticalPathData.projectDuration,
      criticalTaskCount: criticalCount,
      totalTasks: criticalPathData.scheduleInfo.size,
    }
  }, [criticalPathData])

  return (
    <div className="border-b border-border bg-card px-4 py-3">
      {/* Top Row: Back, Title, Status, Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onBack}
            aria-label="Terug naar projecten"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {/* Project Name & Status */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">
              {project.name}
            </h1>
            <Badge className={statusConfig.className}>
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        {/* Conflict Summary, Client & Actions */}
        <div className="flex items-center gap-3">
          {/* Conflict Summary */}
          {conflictCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-state-warning-bg text-state-warning-text">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {conflictCount} {conflictCount === 1 ? 'conflict' : 'conflicten'}
              </span>
            </div>
          )}

          {/* Client Link */}
          <button
            onClick={() => onClientClick?.(project.clientId)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>{project.clientName}</span>
          </button>

          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Project opties">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Bewerken
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Verwijderen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mt-3 flex items-center gap-6 pl-11 text-sm">
        {/* Date Range */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {formatDate(project.startDate)} - {formatDate(project.endDate)}
          </span>
        </div>

        {/* Tasks Completed */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>
            {stats.completed}/{stats.total} taken
          </span>
        </div>

        {/* In Progress */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{stats.inProgress} bezig</span>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-full rounded-full bg-zinc-800 transition-all dark:bg-zinc-200"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {project.progress}%
          </span>
        </div>

        {/* Critical Path Stats */}
        {criticalPathStats && (
          <>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Projectduur: <strong>{criticalPathStats.projectDuration} dagen</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <Route className="h-3.5 w-3.5" />
              <span>
                Kritiek pad:{' '}
                <strong>
                  {criticalPathStats.criticalTaskCount}/{criticalPathStats.totalTasks} taken
                </strong>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
