'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Calendar,
  Columns3,
  FolderKanban,
  GanttChart,
  LayoutGrid,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useProjects, useDeleteProject, useCreateProject, useUpdateProject } from '@/queries/projects'
import type { Project, ProjectStatus, WorkType } from '@/types/projects'
import { ProjectFormModal, type ProjectFormData } from '@/components/projects/ProjectFormModal'

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
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  'on-hold': {
    label: 'On-hold',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  afgerond: {
    label: 'Afgerond',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  geannuleerd: {
    label: 'Geannuleerd',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
}

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
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  onClientClick: () => void
}

function ProjectCard({ project, onView, onEdit, onDelete, onClientClick }: ProjectCardProps) {
  const statusConfig = STATUS_CONFIG[project.status]

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <div
      className="group relative flex flex-col rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <button
            onClick={onView}
            className="block text-left"
          >
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

      {/* Badges */}
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge className={statusConfig.className}>
          {statusConfig.label}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {WORK_TYPE_LABELS[project.workType]}
        </Badge>
      </div>

      {/* Description */}
      {project.description && (
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {project.description}
        </p>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
        {/* Date Range */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>
            {formatDate(project.startDate)} - {formatDate(project.endDate)}
          </span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
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
    </div>
  )
}

// =============================================================================
// Empty State Component
// =============================================================================

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-16">
      <FolderKanban className="h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-medium text-foreground">
        Geen projecten
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Begin met het aanmaken van je eerste project.
      </p>
      <Button onClick={onCreate} className="mt-4">
        <Plus className="mr-2 h-4 w-4" />
        Nieuw project
      </Button>
    </div>
  )
}

// =============================================================================
// Loading State Component
// =============================================================================

function LoadingState() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-lg border border-border bg-card p-4 animate-pulse"
        >
          <div className="h-5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-2 h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-3 flex gap-2">
            <div className="h-5 w-16 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-5 w-16 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          </div>
          <div className="mt-auto pt-4 flex justify-between">
            <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function ProjectsPage() {
  const router = useRouter()
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<ProjectStatus | 'all'>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [editingProject, setEditingProject] = React.useState<Project | null>(null)

  const { data: projects, isLoading, error } = useProjects()
  const deleteProject = useDeleteProject()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()

  // Filter projects
  const filteredProjects = React.useMemo(() => {
    if (!projects) return []

    return projects.filter(project => {
      // Search filter
      const searchLower = search.toLowerCase()
      const matchesSearch = !search ||
        project.name.toLowerCase().includes(searchLower) ||
        project.clientName.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower)

      // Status filter
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [projects, search, statusFilter])

  // Handlers
  const handleView = (id: string) => {
    router.push(`/projects/${id}`)
  }

  const handleEdit = (id: string) => {
    const project = projects?.find((p) => p.id === id)
    if (project) {
      setEditingProject(project)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Weet je zeker dat je dit project wilt verwijderen?')) {
      try {
        await deleteProject.mutateAsync(id)
      } catch (error) {
        console.error("Failed to delete project:", error)
      }
    }
  }

  const handleClientClick = (clientId: string) => {
    router.push(`/clients/${clientId}`)
  }

  const handleCreate = () => {
    setIsCreateModalOpen(true)
  }

  const handleCreateSubmit = async (data: ProjectFormData) => {
    try {
      await createProject.mutateAsync({
        name: data.name,
        clientId: data.clientId,
        description: data.description,
        workType: data.workType,
        startDate: data.startDate,
        endDate: data.endDate,
      })
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error("Failed to create project:", error)
      // Error will be shown by the form or React Query
    }
  }

  const handleEditSubmit = async (data: ProjectFormData) => {
    if (!editingProject) return
    try {
      await updateProject.mutateAsync({
        id: editingProject.id,
        name: data.name,
        clientId: data.clientId,
        description: data.description,
        workType: data.workType,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
      })
      setEditingProject(null)
    } catch (error) {
      console.error("Failed to update project:", error)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-destructive">
          Er is een fout opgetreden bij het laden van projecten.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {error.message}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Projecten</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Beheer en plan je projecten met Gantt-weergave.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* View Switcher */}
            <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-muted/50">
              <Link
                href="/projects"
                className="flex items-center justify-center w-8 h-8 rounded-md bg-background text-foreground shadow-sm"
                title="Grid weergave"
              >
                <LayoutGrid className="h-4 w-4" />
              </Link>
              <Link
                href="/projects/kanban"
                className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
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
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nieuw project
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Zoek projecten..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={cn(
                'rounded-full px-3 py-1 text-sm font-medium transition-colors',
                statusFilter === 'all'
                  ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              )}
            >
              Alle
            </button>
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as ProjectStatus)}
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium transition-colors',
                  statusFilter === status
                    ? config.className + ' ring-2 ring-offset-1 ring-zinc-400'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                )}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingState />
        ) : filteredProjects.length === 0 ? (
          search || statusFilter !== 'all' ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-border py-16">
              <Search className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-foreground">
                Geen resultaten
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Probeer andere zoektermen of filters.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('all')
                }}
                className="mt-4"
              >
                Filters wissen
              </Button>
            </div>
          ) : (
            <EmptyState onCreate={handleCreate} />
          )
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={() => handleView(project.id)}
                onEdit={() => handleEdit(project.id)}
                onDelete={() => handleDelete(project.id)}
                onClientClick={() => handleClientClick(project.clientId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <ProjectFormModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateSubmit}
        isSubmitting={createProject.isPending}
      />

      {/* Edit Modal */}
      <ProjectFormModal
        open={!!editingProject}
        onOpenChange={(open) => !open && setEditingProject(null)}
        project={editingProject}
        onSubmit={handleEditSubmit}
        isSubmitting={updateProject.isPending}
      />
    </>
  )
}
