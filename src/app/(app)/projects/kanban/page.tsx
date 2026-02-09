'use client'

import * as React from 'react'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Loader2,
  Filter,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useProjects, useUpdateProject } from '@/queries/projects'
import type { Project, ProjectStatus, WorkType } from '@/types/projects'
import { KANBAN_COLUMNS, WORK_TYPE_LABELS, WORK_TYPES } from '@/components/projects/constants'
import { ViewSwitcher } from '@/components/projects/ViewSwitcher'
import { ProjectCard } from '@/components/projects/ProjectCard'

// =============================================================================
// Sortable Project Card Component
// =============================================================================

function SortableProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ProjectCard variant="kanban" project={project} onClick={onClick} isDragging={isDragging} />
    </div>
  )
}

// =============================================================================
// Kanban Column Component
// =============================================================================

interface KanbanColumnProps {
  column: (typeof KANBAN_COLUMNS)[0]
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
      <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <div className={cn('flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px]', column.bgColor)}>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Geen projecten
            </div>
          ) : (
            projects.map((project) => (
              <SortableProjectCard
                key={project.id}
                project={project}
                onClick={() => onProjectClick(project.id)}
              />
            ))
          )}
        </div>
      </SortableContext>
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
  const updateProject = useUpdateProject()

  // Filter state
  const [workTypeFilters, setWorkTypeFilters] = useState<Set<WorkType>>(new Set(WORK_TYPES))

  // Drag state
  const [activeProject, setActiveProject] = useState<Project | null>(null)

  // Sensors for drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Filter projects by work type
  const filteredProjects = useMemo(() => {
    if (!projects) return []
    return projects.filter(p => workTypeFilters.has(p.workType))
  }, [projects, workTypeFilters])

  // Group projects by status
  const projectsByStatus = useMemo(() => {
    const grouped: Record<ProjectStatus, Project[]> = {
      gepland: [],
      actief: [],
      'on-hold': [],
      afgerond: [],
      geannuleerd: [],
    }

    filteredProjects.forEach((project) => {
      if (grouped[project.status]) {
        grouped[project.status].push(project)
      }
    })

    return grouped
  }, [filteredProjects])

  // Toggle work type filter
  const toggleWorkType = (workType: WorkType) => {
    setWorkTypeFilters(prev => {
      const next = new Set(prev)
      if (next.has(workType)) {
        next.delete(workType)
      } else {
        next.add(workType)
      }
      return next
    })
  }

  // Handlers
  const handleProjectClick = (id: string) => {
    router.push(`/projects/${id}`)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const project = filteredProjects.find(p => p.id === event.active.id)
    setActiveProject(project || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveProject(null)

    if (!over) return

    // Find which column the project was dropped in
    const project = filteredProjects.find(p => p.id === active.id)
    if (!project) return

    // Determine target status from the drop location
    let targetStatus: ProjectStatus | null = null

    // Check if dropped on a project in a column
    const targetProject = filteredProjects.find(p => p.id === over.id)
    if (targetProject) {
      targetStatus = targetProject.status
    }

    // If status changed, update the project
    if (targetStatus && targetStatus !== project.status) {
      updateProject.mutate({
        id: project.id,
        status: targetStatus,
      })
    }
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

  const activeFiltersCount = WORK_TYPES.length - workTypeFilters.size

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Projecten</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sleep projecten om de status te wijzigen.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5">
                  <Filter className="h-4 w-4" />
                  Filter
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Werktype</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {WORK_TYPES.map(workType => (
                  <DropdownMenuCheckboxItem
                    key={workType}
                    checked={workTypeFilters.has(workType)}
                    onCheckedChange={() => toggleWorkType(workType)}
                  >
                    {WORK_TYPE_LABELS[workType]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <ViewSwitcher activeView="kanban" />
          </div>
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <LoadingState />
        ) : (
          <div className="flex-1 flex gap-4 p-6 overflow-x-auto">
            {KANBAN_COLUMNS.map((column) => (
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

      {/* Drag Overlay */}
      <DragOverlay>
        {activeProject && (
          <ProjectCard
            variant="kanban"
            project={activeProject}
            onClick={() => {}}
            isDragging
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
