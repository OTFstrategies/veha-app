'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { ProjectGanttScheduler } from '@/components/projects/ProjectGanttScheduler'
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
          className="mt-2 text-sm text-stone-600 underline hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
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

  // Queries
  const { data: project, isLoading, error } = useProject(projectId)
  const deleteProject = useDeleteProject()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const createTask = useCreateTask()

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
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
      setIsEditModalOpen(false)
    } catch (error) {
      console.error("Failed to update project:", error)
    }
  }, [updateProjectMutation, projectId])

  const handleDeleteProject = React.useCallback(async () => {
    if (confirm('Weet je zeker dat je dit project wilt verwijderen? Alle taken worden ook verwijderd.')) {
      await deleteProject.mutateAsync(projectId)
      router.push('/projects')
    }
  }, [deleteProject, projectId, router])

  const handleTaskDatesChange = React.useCallback(async (
    taskId: string,
    startDate: string,
    endDate: string
  ) => {
    // Calculate new duration
    const start = new Date(startDate)
    const end = new Date(endDate)
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    await updateTask.mutateAsync({
      id: taskId,
      projectId,
      startDate,
      endDate,
      duration,
    })
  }, [updateTask, projectId])

  const handleTaskProgressChange = React.useCallback(async (
    taskId: string,
    progress: number
  ) => {
    await updateTask.mutateAsync({
      id: taskId,
      projectId,
      progress,
    })
  }, [updateTask, projectId])

  const handleTaskEdit = React.useCallback(async (task: Task) => {
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
  }, [updateTask, projectId])

  const handleTaskDelete = React.useCallback(async (taskId: string) => {
    if (confirm('Weet je zeker dat je deze taak wilt verwijderen?')) {
      await deleteTask.mutateAsync({
        id: taskId,
        projectId,
      })
    }
  }, [deleteTask, projectId])

  const handleTaskAdd = React.useCallback(async (parentId?: string) => {
    // Get default dates
    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + 5)

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
  }, [createTask, projectId])

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
