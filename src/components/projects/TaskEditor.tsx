import * as React from 'react'
import {
  AlertTriangle,
  Diamond,
  MessageCircle,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'
import { CascadePreviewModal } from './CascadePreviewModal'
import { TaskDetailsPanel } from './task-editor/TaskDetailsPanel'
import { TaskResourcePanel } from './task-editor/TaskResourcePanel'
import { TaskDependencyPanel } from './task-editor/TaskDependencyPanel'
import {
  usePreviewDependencyChanges,
  useAddDependencyWithCascade,
  useRemoveDependency,
  type DependencyPreview,
} from '@/queries/tasks'
import { checkAssignmentConflict } from '@/queries/conflicts'
import type { ConflictInfo } from '@/lib/scheduling'
import { ThreadList } from '@/components/threads/ThreadList'
import type { Task, DependencyType, TaskAssignment } from '@/types/projects'

// =============================================================================
// Props
// =============================================================================

interface TaskEditorProps {
  task: Task
  projectId: string
  allTasks: Task[]
  employees?: Array<{ id: string; name: string; color: string }>
  onSave?: (task: Task) => void
  onClose?: () => void
  onDelete?: () => void
  onAddAssignment?: (taskId: string, employeeId: string) => void
  onRemoveAssignment?: (assignmentId: string) => void
}

// =============================================================================
// Helpers
// =============================================================================

const DEPENDENCY_TYPES: Array<{ value: DependencyType; label: string }> = [
  { value: 'FS', label: 'Finish-to-Start' },
  { value: 'SS', label: 'Start-to-Start' },
  { value: 'FF', label: 'Finish-to-Finish' },
  { value: 'SF', label: 'Start-to-Finish' },
]

function getDependencyLabel(type: DependencyType): string {
  const found = DEPENDENCY_TYPES.find((t) => t.value === type)
  return found?.label ?? type
}

// =============================================================================
// Component
// =============================================================================

export function TaskEditor({
  task: initialTask,
  projectId,
  allTasks,
  employees = [],
  onSave,
  onClose,
  onDelete,
  onAddAssignment,
  onRemoveAssignment,
}: TaskEditorProps) {
  const [task, setTask] = React.useState(initialTask)
  const [activeTab, setActiveTab] = React.useState('details')

  // Dependency state
  const [showPreview, setShowPreview] = React.useState(false)
  const [pendingDependency, setPendingDependency] = React.useState<{
    predecessorId: string
    type: DependencyType
    lag: number
  } | null>(null)
  const [previews, setPreviews] = React.useState<DependencyPreview[]>([])
  const [inlinePreview, setInlinePreview] = React.useState<DependencyPreview[]>([])
  const [inlinePreviewError, setInlinePreviewError] = React.useState<string | null>(null)

  // Conflict warning state
  const [pendingAssignment, setPendingAssignment] = React.useState<string | null>(null)
  const [conflictWarning, setConflictWarning] = React.useState<ConflictInfo | null>(null)
  const [showAddEmployee, setShowAddEmployee] = React.useState(false)

  // Hooks
  const { addToast } = useToast()
  const previewMutation = usePreviewDependencyChanges()
  const addDependency = useAddDependencyWithCascade()
  const removeDependency = useRemoveDependency()

  // Get available employees (not already assigned)
  const availableEmployees = React.useMemo(() => {
    const assignedIds = new Set(task.assignments.map((a) => a.employeeId))
    return employees.filter((emp) => !assignedIds.has(emp.id))
  }, [employees, task.assignments])

  // ---------------------------------------------------------------------------
  // Available Predecessors
  // ---------------------------------------------------------------------------

  const availablePredecessors = React.useMemo(() => {
    const existingPredecessorIds = task.dependencies?.map((d) => d.predecessorId) ?? []
    return allTasks.filter(
      (t) => t.id !== task.id && !existingPredecessorIds.includes(t.id)
    )
  }, [allTasks, task])

  // ---------------------------------------------------------------------------
  // Inline Preview Effect
  // ---------------------------------------------------------------------------

  // Fetch inline preview when dependency selection changes
  React.useEffect(() => {
    if (!pendingDependency?.predecessorId) {
      setInlinePreview([])
      setInlinePreviewError(null)
      return
    }

    let cancelled = false

    const fetchPreview = async () => {
      try {
        const result = await previewMutation.mutateAsync({
          projectId,
          taskId: task.id,
          predecessorId: pendingDependency.predecessorId,
          type: pendingDependency.type,
          lag: pendingDependency.lag,
        })
        if (!cancelled) {
          setInlinePreview(result)
          setInlinePreviewError(null)
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Fout bij berekenen wijzigingen'
          setInlinePreviewError(message)
          setInlinePreview([])
        }
      }
    }

    // Debounce the preview fetch
    const timeout = setTimeout(fetchPreview, 300)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [pendingDependency?.predecessorId, pendingDependency?.type, pendingDependency?.lag, projectId, task.id, previewMutation])

  // ---------------------------------------------------------------------------
  // Update Handlers
  // ---------------------------------------------------------------------------

  const updateField = <K extends keyof Task>(field: K, value: Task[K]) => {
    setTask((prev) => ({ ...prev, [field]: value }))
  }

  // ---------------------------------------------------------------------------
  // Assignment Handlers
  // ---------------------------------------------------------------------------

  function handleEmployeeSelect(employeeId: string) {
    if (!employeeId) return

    const conflict = checkAssignmentConflict(employeeId, task.id, allTasks)

    if (conflict) {
      setPendingAssignment(employeeId)
      setConflictWarning(conflict)
    } else {
      handleAddAssignment(employeeId)
    }

    setShowAddEmployee(false)
  }

  function handleAddAssignment(employeeId: string) {
    const employee = employees.find((e) => e.id === employeeId)
    if (!employee) return

    if (onAddAssignment) {
      onAddAssignment(task.id, employeeId)
    }

    const newAssignment: TaskAssignment = {
      id: `temp-${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      employeeColor: employee.color,
      plannedHours: 8,
      actualHours: 0,
    }

    setTask((prev) => ({
      ...prev,
      assignments: [...prev.assignments, newAssignment],
    }))
  }

  function handleConfirmConflictingAssignment() {
    if (pendingAssignment) {
      handleAddAssignment(pendingAssignment)
      addToast({
        type: 'warning',
        title: 'Medewerker toegewezen ondanks conflict',
        description: 'De medewerker is nu dubbel geboekt in deze periode.',
      })
    }
    setConflictWarning(null)
    setPendingAssignment(null)
  }

  function handleRemoveAssignment(assignmentId: string) {
    if (onRemoveAssignment) {
      onRemoveAssignment(assignmentId)
    }

    setTask((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((a) => a.id !== assignmentId),
    }))
  }

  // ---------------------------------------------------------------------------
  // Dependency Handlers
  // ---------------------------------------------------------------------------

  async function handlePreviewDependency() {
    if (!pendingDependency?.predecessorId) return

    try {
      const result = await previewMutation.mutateAsync({
        projectId,
        taskId: task.id,
        predecessorId: pendingDependency.predecessorId,
        type: pendingDependency.type,
        lag: pendingDependency.lag,
      })
      setPreviews(result)
      setShowPreview(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fout bij berekenen wijzigingen'
      addToast({
        type: 'error',
        title: 'Fout',
        description: message,
      })
    }
  }

  async function handleConfirmDependency() {
    if (!pendingDependency?.predecessorId) return

    try {
      const result = await addDependency.mutateAsync({
        projectId,
        taskId: task.id,
        predecessorId: pendingDependency.predecessorId,
        type: pendingDependency.type,
        lag: pendingDependency.lag,
        previews,
      })

      addToast({
        type: 'success',
        title: 'Dependency toegevoegd',
        description: `${result.affectedCount} taken bijgewerkt`,
      })

      setShowPreview(false)
      setPendingDependency(null)
      setPreviews([])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fout bij toevoegen dependency'
      addToast({
        type: 'error',
        title: 'Fout',
        description: message,
      })
    }
  }

  async function handleRemoveDependency(dependencyId: string) {
    try {
      await removeDependency.mutateAsync({
        projectId,
        dependencyId,
      })
      addToast({
        type: 'success',
        title: 'Dependency verwijderd',
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fout bij verwijderen dependency'
      addToast({
        type: 'error',
        title: 'Fout',
        description: message,
      })
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toISOString().split('T')[0]
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <div className="fixed inset-y-0 right-0 z-50 flex w-96 flex-col border-l border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            {task.isMilestone && <Diamond className="h-4 w-4 fill-current" />}
            <span className="font-mono text-sm text-muted-foreground">{task.wbs}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} aria-label="Sluiten">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Task Name */}
        <div className="border-b border-border px-4 py-3">
          <Input
            value={task.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="h-auto border-0 p-0 text-lg font-semibold shadow-none focus-visible:ring-0"
            placeholder="Taaknaam"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="details"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:shadow-none"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:shadow-none"
            >
              Resources
            </TabsTrigger>
            <TabsTrigger
              value="dependencies"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:shadow-none"
            >
              Dependencies
            </TabsTrigger>
            <TabsTrigger
              value="threads"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:shadow-none"
            >
              <MessageCircle className="h-3.5 w-3.5 mr-1" />
              Discussie
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="flex-1 overflow-y-auto p-4">
            <TaskDetailsPanel
              task={task}
              onFieldChange={updateField}
              formatDate={formatDate}
            />
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="flex-1 overflow-y-auto p-4">
            <TaskResourcePanel
              task={task}
              availableEmployees={availableEmployees}
              showAddEmployee={showAddEmployee}
              onToggleAddEmployee={() => setShowAddEmployee(!showAddEmployee)}
              onEmployeeSelect={handleEmployeeSelect}
              onRemoveAssignment={handleRemoveAssignment}
            />
          </TabsContent>

          {/* Dependencies Tab */}
          <TabsContent value="dependencies" className="flex-1 overflow-y-auto p-4">
            <TaskDependencyPanel
              task={task}
              availablePredecessors={availablePredecessors}
              pendingDependency={pendingDependency}
              onPendingDependencyChange={setPendingDependency}
              inlinePreview={inlinePreview}
              inlinePreviewError={inlinePreviewError}
              isPreviewLoading={previewMutation.isPending}
              isRemoveLoading={removeDependency.isPending}
              onPreviewDependency={handlePreviewDependency}
              onRemoveDependency={handleRemoveDependency}
            />
          </TabsContent>

          {/* Threads Tab */}
          <TabsContent value="threads" className="flex-1 overflow-y-auto p-4">
            <ThreadList
              entityType="task"
              entityId={task.id}
            />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border p-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            onClick={onDelete}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Verwijderen
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Annuleren
            </Button>
            <Button
              size="sm"
              className="bg-zinc-800 text-zinc-50 hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900"
              onClick={() => onSave?.(task)}
            >
              Opslaan
            </Button>
          </div>
        </div>
      </div>

      {/* Conflict Warning Dialog */}
      <Dialog open={!!conflictWarning} onOpenChange={() => setConflictWarning(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <AlertTriangle className="h-5 w-5" />
              Conflict Gedetecteerd
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Deze medewerker is al ingepland voor een andere taak in deze periode.
            </p>

            {conflictWarning && (
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Conflicterende taak:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {conflictWarning.taskName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Overlap:</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {conflictWarning.overlapDays} {conflictWarning.overlapDays === 1 ? 'dag' : 'dagen'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConflictWarning(null)
                setPendingAssignment(null)
              }}
            >
              Annuleren
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmConflictingAssignment}
            >
              Toch Toewijzen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <CascadePreviewModal
        open={showPreview}
        onOpenChange={setShowPreview}
        previews={previews}
        dependencyDescription={`Voeg ${getDependencyLabel(pendingDependency?.type ?? 'FS')} dependency toe`}
        onConfirm={handleConfirmDependency}
        isLoading={addDependency.isPending}
      />
    </>
  )
}
