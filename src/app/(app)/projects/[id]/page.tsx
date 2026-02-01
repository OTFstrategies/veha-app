'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Loader2, StickyNote } from 'lucide-react'
import { ProjectGanttScheduler } from '@/components/projects/ProjectGanttScheduler'
import { ProjectNotes } from '@/components/projects/ProjectNotes'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { useProject, useDeleteProject, useUpdateProject } from '@/queries/projects'
import { useUpdateTask, useDeleteTask, useCreateTask } from '@/queries/tasks'
import { ProjectFormModal, type ProjectFormData } from '@/components/projects/ProjectFormModal'
import type { Task } from '@/types/projects'

// =============================================================================
// Loading Component
// =============================================================================

function LoadingState() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Project laden...</p>
      </div>
    </div>
  )
}

// =============================================================================
// Error Component
// =============================================================================

function ErrorState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-destructive">
          Er is een fout opgetreden bij het laden van het project.
        </p>
        <p className="text-sm text-muted-foreground">{message}</p>
        <button
          onClick={onBack}
          className="mt-2 text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Terug naar projecten
        </button>
      </div>
    </div>
  )
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const { addToast } = useToast()

  // Queries
  const { data: project, isLoading, error } = useProject(projectId)
  const deleteProject = useDeleteProject()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const createTask = useCreateTask()

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [showNotes, setShowNotes] = React.useState(false)
  const updateProjectMutation = useUpdateProject()

  // Mock employees data - in production, this would come from a useEmployees hook
  const employees = React.useMemo(() => [
    { id: '1', name: 'Jan de Vries', role: 'Voorman', color: '#3b82f6' },
    { id: '2', name: 'Pieter Bakker', role: 'Specialist', color: '#22c55e' },
    { id: '3', name: 'Klaas Jansen', role: 'Medewerker', color: '#f59e0b' },
    { id: '4', name: 'Willem Smit', role: 'Uitvoerder', color: '#8b5cf6' },
  ], [])

  // Handlers
  const handleBack = React.useCallback(() => {
    router.push('/projects')
  }, [router])

  const handleEditProject = React.useCallback(() => {
    setIsEditModalOpen(true)
  }, [])

  const handleEditProjectSubmit = React.useCallback(async (data: ProjectFormData) => {
    try {
      await updateProjectMutation.mutateAsync({
        id: projectId,
        name: data.name,
        clientId: data.clientId,
        description: data.description,
        workType: data.workType,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
      })
      addToast({ type: 'success', title: 'Project succesvol bijgewerkt' })
      setIsEditModalOpen(false)
    } catch (error) {
      console.error("Failed to update project:", error)
      addToast({ type: 'error', title: 'Fout bij opslaan van project' })
    }
  }, [updateProjectMutation, projectId, addToast])

  const handleDeleteProject = React.useCallback(async () => {
    if (confirm('Weet je zeker dat je dit project wilt verwijderen? Alle taken worden ook verwijderd.')) {
      try {
        await deleteProject.mutateAsync(projectId)
        addToast({ type: 'success', title: 'Project verwijderd' })
        router.push('/projects')
      } catch (error) {
        console.error("Failed to delete project:", error)
        addToast({ type: 'error', title: 'Fout bij verwijderen van project' })
      }
    }
  }, [deleteProject, projectId, router, addToast])

  const handleTaskDatesChange = React.useCallback(async (
    taskId: string,
    startDate: string,
    endDate: string
  ) => {
    // Calculate new duration
    const start = new Date(startDate)
    const end = new Date(endDate)
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    try {
      await updateTask.mutateAsync({
        id: taskId,
        projectId,
        startDate,
        endDate,
        duration,
      })
    } catch (error) {
      console.error("Failed to update task dates:", error)
      addToast({ type: 'error', title: 'Fout bij opslaan van taak' })
    }
  }, [updateTask, projectId, addToast])

  const handleTaskProgressChange = React.useCallback(async (
    taskId: string,
    progress: number
  ) => {
    try {
      await updateTask.mutateAsync({
        id: taskId,
        projectId,
        progress,
      })
    } catch (error) {
      console.error("Failed to update task progress:", error)
      addToast({ type: 'error', title: 'Fout bij opslaan van taak' })
    }
  }, [updateTask, projectId, addToast])

  const handleTaskEdit = React.useCallback(async (task: Task) => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        projectId,
        name: task.name,
        description: task.description,
        startDate: task.startDate,
        endDate: task.endDate,
        duration: task.duration,
        progress: task.progress,
        status: task.status,
        priority: task.priority,
        isMilestone: task.isMilestone,
      })
      addToast({ type: 'success', title: 'Taak opgeslagen' })
    } catch (error) {
      console.error("Failed to update task:", error)
      addToast({ type: 'error', title: 'Fout bij opslaan van taak' })
    }
  }, [updateTask, projectId, addToast])

  const handleTaskDelete = React.useCallback(async (taskId: string) => {
    if (confirm('Weet je zeker dat je deze taak wilt verwijderen?')) {
      try {
        await deleteTask.mutateAsync({
          id: taskId,
          projectId,
        })
        addToast({ type: 'success', title: 'Taak verwijderd' })
      } catch (error) {
        console.error("Failed to delete task:", error)
        addToast({ type: 'error', title: 'Fout bij verwijderen van taak' })
      }
    }
  }, [deleteTask, projectId, addToast])

  const handleTaskAdd = React.useCallback(async (parentId?: string) => {
    // Get default dates
    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + 5)

    try {
      await createTask.mutateAsync({
        projectId,
        parentId: parentId ?? null,
        name: 'Nieuwe taak',
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        duration: 5,
        status: 'todo',
        priority: 'normal',
      })
      addToast({ type: 'success', title: 'Taak aangemaakt' })
    } catch (error) {
      console.error("Failed to create task:", error)
      addToast({ type: 'error', title: 'Fout bij aanmaken van taak' })
    }
  }, [createTask, projectId, addToast])

  const handleClientClick = React.useCallback((clientId: string) => {
    router.push(`/clients/${clientId}`)
  }, [router])

  // Render states
  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error.message} onBack={handleBack} />
  }

  if (!project) {
    return <ErrorState message="Project niet gevonden" onBack={handleBack} />
  }

  return (
    <>
      <div className="-m-6 flex h-[calc(100vh-64px)] flex-col">
        {/* Notes Toggle Bar */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => setShowNotes(!showNotes)}
            aria-expanded={showNotes}
            aria-controls="project-notes-section"
          >
            <StickyNote className="h-3.5 w-3.5" />
            Notities
            {showNotes ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
          {project.notes && !showNotes && (
            <span className="text-xs text-muted-foreground truncate max-w-md">
              {project.notes.substring(0, 80)}{project.notes.length > 80 ? '...' : ''}
            </span>
          )}
        </div>

        {/* Collapsible Notes Section */}
        {showNotes && (
          <div id="project-notes-section" className="border-b border-border bg-card px-4 py-3">
            <ProjectNotes
              projectId={project.id}
              initialNotes={project.notes || ""}
              onSave={async (notes) => {
                await updateProjectMutation.mutateAsync({ id: project.id, notes })
                addToast({ type: 'success', title: 'Notities opgeslagen' })
              }}
            />
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <ProjectGanttScheduler
            project={project}
            employees={employees}
            onBack={handleBack}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
            onTaskDatesChange={handleTaskDatesChange}
            onTaskProgressChange={handleTaskProgressChange}
            onTaskEdit={handleTaskEdit}
            onTaskDelete={handleTaskDelete}
            onTaskAdd={handleTaskAdd}
            onClientClick={handleClientClick}
          />
        </div>
      </div>

      <ProjectFormModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        project={project}
        onSubmit={handleEditProjectSubmit}
        isSubmitting={updateProjectMutation.isPending}
      />
    </>
  )
}
