'use client'

import * as React from 'react'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  Calendar,
  GanttChart,
  LayoutGrid,
  Columns3,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useProjects } from '@/queries/projects'
import type { Project, ProjectStatus, WorkType } from '@/types/projects'

// =============================================================================
// Column Configuration
// =============================================================================

const COLUMNS: Array<{
  id: ProjectStatus
  title: string
  headerColor: string
  bgColor: string
}> = [
  {
    id: 'gepland',
    title: 'Gepland',
    headerColor: 'bg-zinc-500',
    bgColor: 'bg-zinc-50 dark:bg-zinc-900/50',
  },
  {
    id: 'actief',
    title: 'Actief',
    headerColor: 'bg-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    id: 'on-hold',
    title: 'On-hold',
    headerColor: 'bg-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    id: 'afgerond',
    title: 'Afgerond',
    headerColor: 'bg-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
]

const WORK_TYPE_LABELS: Record<WorkType, string> = {
  straatwerk: 'Straatwerk',
  kitwerk: 'Kitwerk',
  reinigen: 'Reinigen',
  kantoor: 'Kantoor',
  overig: 'Overig',
}

// =============================================================================
// Project Card Component
// =============================================================================

interface ProjectCardProps {
  project: Project
  onClick: () => void
}

function ProjectCard({ project, onClick }: ProjectCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600"
    >
      {/* Project Name */}
      <h3 className="font-medium text-foreground truncate">{project.name}</h3>

      {/* Client */}
      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
        <Building2 className="h-3 w-3 flex-shrink-0" />
        <span className="truncate">{project.clientName}</span>
      </div>

      {/* Work Type Badge */}
      <div className="mt-2">
        <Badge variant="outline" className="text-xs">
          {WORK_TYPE_LABELS[project.workType]}
        </Badge>
      </div>

      {/* Footer: Date + Progress */}
      <div className="mt-3 flex items-center justify-between pt-2 border-t border-border">
        {/* Date Range */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>
            {formatDate(project.startDate)} - {formatDate(project.endDate)}
          </span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-12 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                project.progress === 100
                  ? 'bg-green-500'
                  : 'bg-zinc-800 dark:bg-zinc-200'
              )}
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {project.progress}%
          </span>
        </div>
      </div>
    </button>
  )
}

// =============================================================================
// Kanban Column Component
// =============================================================================

interface KanbanColumnProps {
  column: (typeof COLUMNS)[0]
  projects: Project[]
  onProjectClick: (id: string) => void
}

function KanbanColumn({ column, projects, onProjectClick }: KanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-80 flex flex-col rounded-lg border border-border bg-card overflow-hidden">
      {/* Column Header */}
      <div className={cn('px-4 py-3 flex items-center gap-3', column.bgColor)}>
        <div className={cn('w-3 h-3 rounded-full', column.headerColor)} />
        <h2 className="font-semibold text-foreground">{column.title}</h2>
        <span className="ml-auto text-sm text-muted-foreground font-medium">
          {projects.length}
        </span>
      </div>

      {/* Column Content */}
      <div className={cn('flex-1 p-3 space-y-3 overflow-y-auto', column.bgColor)}>
        {projects.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Geen projecten
          </div>
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => onProjectClick(project.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// =============================================================================
// View Switcher Component
// =============================================================================

function ViewSwitcher() {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-muted/50">
      <Link
        href="/projects"
        className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
        title="Grid weergave"
      >
        <LayoutGrid className="h-4 w-4" />
      </Link>
      <Link
        href="/projects/kanban"
        className="flex items-center justify-center w-8 h-8 rounded-md bg-background text-foreground shadow-sm"
        title="Kanban weergave"
      >
        <Columns3 className="h-4 w-4" />
      </Link>
      <Link
        href="/projects/gantt"
        className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
        title="Gantt weergave"
      >
        <GanttChart className="h-4 w-4" />
      </Link>
    </div>
  )
}

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
// Main Page Component
// =============================================================================

export default function ProjectsKanbanPage() {
  const router = useRouter()
  const { data: projects, isLoading, error } = useProjects()

  // Group projects by status
  const projectsByStatus = useMemo(() => {
    const grouped: Record<ProjectStatus, Project[]> = {
      gepland: [],
      actief: [],
      'on-hold': [],
      afgerond: [],
      geannuleerd: [],
    }

    if (!projects) return grouped

    projects.forEach((project) => {
      if (grouped[project.status]) {
        grouped[project.status].push(project)
      }
    })

    return grouped
  }, [projects])

  // Handlers
  const handleProjectClick = (id: string) => {
    router.push(`/projects/${id}`)
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
            Kanban overzicht van alle projecten per status.
          </p>
        </div>
        <ViewSwitcher />
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="flex-1 flex gap-4 p-6 overflow-x-auto">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              projects={projectsByStatus[column.id] || []}
              onProjectClick={handleProjectClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}
