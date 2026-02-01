import * as React from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Clock,
  Diamond,
  Link2,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'
import { CascadePreviewModal } from './CascadePreviewModal'
import {
  usePreviewDependencyChanges,
  useAddDependencyWithCascade,
  useRemoveDependency,
  type DependencyPreview,
} from '@/queries/tasks'
import { checkAssignmentConflict } from '@/queries/conflicts'
import type { ConflictInfo } from '@/lib/scheduling'
import type { Task, TaskStatus, TaskPriority, DependencyType, TaskAssignment } from '@/types/projects'

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
// Status & Priority Config
// =============================================================================

const STATUS_OPTIONS: Array<{ value: TaskStatus; label: string; color: string }> = [
  { value: 'todo', label: 'Todo', color: 'bg-zinc-200 text-zinc-700' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'done', label: 'Done', color: 'bg-green-100 text-green-700' },
]

const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string; color: string }> = [
  { value: 'low', label: 'Laag', color: 'bg-zinc-100 text-zinc-600' },
  { value: 'normal', label: 'Normaal', color: 'bg-zinc-200 text-zinc-700' },
  { value: 'high', label: 'Hoog', color: 'bg-amber-100 text-amber-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
]

const DEPENDENCY_TYPES: Array<{ value: DependencyType; label: string }> = [
  { value: 'FS', label: 'Finish-to-Start' },
  { value: 'SS', label: 'Start-to-Start' },
  { value: 'FF', label: 'Finish-to-Finish' },
  { value: 'SF', label: 'Start-to-Finish' },
]

// =============================================================================
// Helpers
// =============================================================================

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
  // Update Handlers
  // ---------------------------------------------------------------------------

  const updateField = <K extends keyof Task>(field: K, value: Task[K]) => {
    setTask((prev) => ({ ...prev, [field]: value }))
  }

  // ---------------------------------------------------------------------------
  // Assignment Handlers
  // ---------------------------------------------------------------------------

  /**
   * Check for conflicts when selecting an employee to assign
   */
  function handleEmployeeSelect(employeeId: string) {
    if (!employeeId) return

    // Check if this assignment would create a conflict
    const conflict = checkAssignmentConflict(employeeId, task.id, allTasks)

    if (conflict) {
      // Store pending assignment and show warning dialog
      setPendingAssignment(employeeId)
      setConflictWarning(conflict)
    } else {
      // No conflict, proceed with assignment
      handleAddAssignment(employeeId)
    }

    setShowAddEmployee(false)
  }

  /**
   * Add assignment (either directly or after conflict confirmation)
   */
  function handleAddAssignment(employeeId: string) {
    const employee = employees.find((e) => e.id === employeeId)
    if (!employee) return

    // If there's an external handler, use it
    if (onAddAssignment) {
      onAddAssignment(task.id, employeeId)
    }

    // Also update local state for immediate UI feedback
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

  /**
   * Confirm assignment despite conflict
   */
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

  /**
   * Remove an assignment
   */
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

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
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-transparent p-0">
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
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Description */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Beschrijving</Label>
                <textarea
                  value={task.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="min-h-20 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Voeg een beschrijving toe..."
                />
              </div>

              <Separator />

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Start
                  </Label>
                  <Input
                    type="date"
                    value={formatDate(task.startDate)}
                    onChange={(e) => updateField('startDate', e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Eind
                  </Label>
                  <Input
                    type="date"
                    value={formatDate(task.endDate)}
                    onChange={(e) => updateField('endDate', e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Duur (dagen)
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={task.duration}
                  onChange={(e) => updateField('duration', parseInt(e.target.value) || 1)}
                  className="font-mono"
                />
              </div>

              <Separator />

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Voortgang</Label>
                  <span className="font-mono text-sm">{task.progress}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={task.progress}
                  onChange={(e) => updateField('progress', parseInt(e.target.value))}
                  aria-label="Voortgang percentage"
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 dark:bg-zinc-700 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-800 dark:[&::-webkit-slider-thumb]:bg-zinc-200"
                />
              </div>

              <Separator />

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateField('status', option.value)}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium transition-all',
                        task.status === option.value
                          ? option.color + ' ring-2 ring-offset-1 ring-zinc-400'
                          : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Prioriteit</Label>
                <div className="flex flex-wrap gap-2">
                  {PRIORITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateField('priority', option.value)}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium transition-all',
                        task.priority === option.value
                          ? option.color + ' ring-2 ring-offset-1 ring-zinc-400'
                          : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Milestone Toggle */}
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm">
                  <Diamond className="h-4 w-4" />
                  Milestone
                </Label>
                <button
                  onClick={() => updateField('isMilestone', !task.isMilestone)}
                  role="switch"
                  aria-checked={task.isMilestone}
                  aria-label="Milestone toggle"
                  className={cn(
                    'h-6 w-11 rounded-full transition-colors',
                    task.isMilestone
                      ? 'bg-zinc-800 dark:bg-zinc-200'
                      : 'bg-zinc-200 dark:bg-zinc-700'
                  )}
                >
                  <div
                    className={cn(
                      'h-5 w-5 rounded-full bg-white shadow transition-transform dark:bg-zinc-800',
                      task.isMilestone ? 'translate-x-5' : 'translate-x-0.5'
                    )}
                  />
                </button>
              </div>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Toegewezen</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => setShowAddEmployee(!showAddEmployee)}
                  disabled={availableEmployees.length === 0}
                >
                  <UserPlus className="h-3 w-3" />
                  Toevoegen
                </Button>
              </div>

              {/* Add Employee Dropdown */}
              {showAddEmployee && availableEmployees.length > 0 && (
                <div className="rounded-md border border-border bg-background p-2">
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Selecteer medewerker
                  </Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    onChange={(e) => handleEmployeeSelect(e.target.value)}
                    defaultValue=""
                  >
                    <option value="">Kies een medewerker...</option>
                    {availableEmployees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {task.assignments.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border py-8 text-center">
                  <UserPlus className="mx-auto h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Nog geen medewerkers toegewezen
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {task.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-3"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback
                          className="text-xs font-medium text-white"
                          style={{ backgroundColor: assignment.employeeColor }}
                        >
                          {getInitials(assignment.employeeName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{assignment.employeeName}</div>
                        <div className="text-xs text-muted-foreground">
                          {assignment.plannedHours}u gepland / {assignment.actualHours}u gewerkt
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleRemoveAssignment(assignment.id)}
                        aria-label={`Verwijder ${assignment.employeeName}`}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Dependencies Tab */}
          <TabsContent value="dependencies" className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Existing Dependencies */}
              <div>
                <Label className="text-xs text-muted-foreground">Huidige dependencies</Label>
                {task.dependencies.length === 0 ? (
                  <div className="mt-2 rounded-lg border border-dashed border-border py-6 text-center">
                    <Link2 className="mx-auto h-6 w-6 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">Geen dependencies</p>
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    {task.dependencies.map((dep) => (
                      <div
                        key={dep.id}
                        className="flex items-center justify-between rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800"
                      >
                        <div>
                          <span className="font-medium">{dep.predecessorName}</span>
                          <span className="ml-2 text-zinc-500 dark:text-zinc-400">
                            ({getDependencyLabel(dep.type)})
                            {dep.lag !== 0 && ` +${dep.lag}d`}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDependency(dep.id)}
                          className="h-7 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                          disabled={removeDependency.isPending}
                        >
                          Verwijderen
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Add New Dependency */}
              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground">Nieuwe dependency toevoegen</Label>

                <div className="grid grid-cols-3 gap-3">
                  {/* Predecessor select */}
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
                      Voorganger
                    </label>
                    <select
                      className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                      value={pendingDependency?.predecessorId ?? ''}
                      onChange={(e) =>
                        setPendingDependency((prev) => ({
                          predecessorId: e.target.value,
                          type: prev?.type ?? 'FS',
                          lag: prev?.lag ?? 0,
                        }))
                      }
                    >
                      <option value="">Selecteer taak...</option>
                      {availablePredecessors.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Type select */}
                  <div>
                    <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
                      Type
                    </label>
                    <select
                      className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                      value={pendingDependency?.type ?? 'FS'}
                      onChange={(e) =>
                        setPendingDependency((prev) => ({
                          predecessorId: prev?.predecessorId ?? '',
                          type: e.target.value as DependencyType,
                          lag: prev?.lag ?? 0,
                        }))
                      }
                    >
                      {DEPENDENCY_TYPES.map((dt) => (
                        <option key={dt.value} value={dt.value}>
                          {dt.value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Lag days */}
                <div>
                  <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
                    Lag (dagen)
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-24 font-mono"
                      value={pendingDependency?.lag ?? 0}
                      onChange={(e) =>
                        setPendingDependency((prev) => ({
                          predecessorId: prev?.predecessorId ?? '',
                          type: prev?.type ?? 'FS',
                          lag: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                    <span className="text-xs text-zinc-500">
                      Positief = vertraging, negatief = overlap
                    </span>
                  </div>
                </div>

                {/* Add button */}
                <Button
                  onClick={handlePreviewDependency}
                  disabled={!pendingDependency?.predecessorId || previewMutation.isPending}
                  className="w-full"
                >
                  {previewMutation.isPending ? 'Berekenen...' : 'Dependency Toevoegen'}
                </Button>
              </div>
            </div>
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
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Conflict Gedetecteerd
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Deze medewerker is al ingepland voor een andere taak in deze periode.
            </p>

            {conflictWarning && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Conflicterende taak:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {conflictWarning.taskName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Overlap:</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">
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
