'use client'

import { Building2, Calendar, MoreHorizontal, FolderKanban, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { STATUS_CONFIG, WORK_TYPE_LABELS } from './constants'
import type { Project } from '@/types/projects'

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}

// --- Grid Variant (full card with menu) ---

interface GridCardProps {
  variant: 'grid'
  project: Project
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  onClientClick: () => void
}

// --- Kanban Variant (compact, clickable) ---

interface KanbanCardProps {
  variant: 'kanban'
  project: Project
  onClick: () => void
  isDragging?: boolean
}

type ProjectCardProps = GridCardProps | KanbanCardProps

export function ProjectCard(props: ProjectCardProps) {
  const { project, variant } = props
  const statusConfig = STATUS_CONFIG[project.status]

  if (variant === 'kanban') {
    const { onClick, isDragging } = props
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full text-left rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600',
          isDragging && 'ring-2 ring-blue-500 shadow-lg'
        )}
      >
        <h3 className="font-medium text-foreground truncate">{project.name}</h3>
        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <Building2 className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{project.clientName}</span>
        </div>
        <div className="mt-2">
          <Badge variant="outline" className="text-xs">
            {WORK_TYPE_LABELS[project.workType]}
          </Badge>
        </div>
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-12 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  project.progress === 100 ? 'bg-green-500' : 'bg-zinc-800 dark:bg-zinc-200'
                )}
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <span className="font-mono text-xs text-muted-foreground">{project.progress}%</span>
          </div>
        </div>
      </button>
    )
  }

  // Grid variant
  const { onView, onEdit, onDelete, onClientClick } = props
  return (
    <div className="group relative flex flex-col rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <button onClick={onView} className="block text-left">
            <h3 className="truncate font-medium text-foreground hover:text-zinc-600 dark:hover:text-zinc-300">
              {project.name}
            </h3>
          </button>
          <button
            onClick={onClientClick}
            className="mt-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Building2 className="h-3 w-3" />
            <span className="truncate">{project.clientName}</span>
          </button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Project opties"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              <FolderKanban className="mr-2 h-4 w-4" />
              Openen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Bewerken
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-red-600 dark:text-red-400">
              <Trash2 className="mr-2 h-4 w-4" />
              Verwijderen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
        <Badge variant="outline" className="text-xs">{WORK_TYPE_LABELS[project.workType]}</Badge>
      </div>
      {project.description && (
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
      )}
      <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                project.progress === 100 ? 'bg-green-500' : 'bg-zinc-800 dark:bg-zinc-200'
              )}
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="font-mono text-xs text-muted-foreground">{project.progress}%</span>
        </div>
      </div>
    </div>
  )
}
