import * as React from 'react'
import {
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Task, TaskStatus, TaskPriority, DependencyType } from '@/types/projects'

// =============================================================================
// Props
// =============================================================================

interface TaskEditorProps {
  task: Task
  allTasks: Task[]
  employees?: Array<{ id: string; name: string; color: string }>
  onSave?: (task: Task) => void
  onClose?: () => void
  onDelete?: () => void
}

// =============================================================================
// Status & Priority Config
// =============================================================================

const STATUS_OPTIONS: Array<{ value: TaskStatus; label: string; color: string }> = [
  { value: 'todo', label: 'Todo', color: 'bg-stone-200 text-stone-700' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'done', label: 'Done', color: 'bg-green-100 text-green-700' },
]

const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string; color: string }> = [
  { value: 'low', label: 'Laag', color: 'bg-stone-100 text-stone-600' },
  { value: 'normal', label: 'Normaal', color: 'bg-stone-200 text-stone-700' },
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
// Component
// =============================================================================

export function TaskEditor({
  task: initialTask,
  allTasks: _allTasks,
  employees: _employees = [],
  onSave,
  onClose,
  onDelete,
}: TaskEditorProps) {
  // Note: allTasks and employees are for future dependency/assignment selection
  void _allTasks
  void _employees

  const [task, setTask] = React.useState(initialTask)
  const [activeTab, setActiveTab] = React.useState('details')

  // ---------------------------------------------------------------------------
  // Update Handlers
  // ---------------------------------------------------------------------------

  const updateField = <K extends keyof Task>(field: K, value: Task[K]) => {
    setTask(prev => ({ ...prev, [field]: value }))
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
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
    <div className="fixed inset-y-0 right-0 z-50 flex w-96 flex-col border-l border-border bg-card shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          {task.isMilestone && <Diamond className="h-4 w-4 fill-current" />}
          <span className="font-mono text-sm text-muted-foreground">{task.wbs}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Task Name */}
      <div className="border-b border-border px-4 py-3">
        <Input
          value={task.name}
          onChange={e => updateField('name', e.target.value)}
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
                onChange={e => updateField('description', e.target.value)}
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
                  onChange={e => updateField('startDate', e.target.value)}
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
                  onChange={e => updateField('endDate', e.target.value)}
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
                onChange={e => updateField('duration', parseInt(e.target.value) || 1)}
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
                onChange={e => updateField('progress', parseInt(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200 dark:bg-stone-700 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-stone-800 dark:[&::-webkit-slider-thumb]:bg-stone-200"
              />
            </div>

            <Separator />

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateField('status', option.value)}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium transition-all',
                      task.status === option.value
                        ? option.color + ' ring-2 ring-offset-1 ring-stone-400'
                        : 'bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400'
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
                {PRIORITY_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateField('priority', option.value)}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium transition-all',
                      task.priority === option.value
                        ? option.color + ' ring-2 ring-offset-1 ring-stone-400'
                        : 'bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400'
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
                className={cn(
                  'h-6 w-11 rounded-full transition-colors',
                  task.isMilestone ? 'bg-stone-800 dark:bg-stone-200' : 'bg-stone-200 dark:bg-stone-700'
                )}
              >
                <div
                  className={cn(
                    'h-5 w-5 rounded-full bg-white shadow transition-transform dark:bg-stone-800',
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
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                <UserPlus className="h-3 w-3" />
                Toevoegen
              </Button>
            </div>

            {task.assignments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-8 text-center">
                <UserPlus className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Nog geen medewerkers toegewezen
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {task.assignments.map(assignment => (
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
                    <Button variant="ghost" size="icon" className="h-7 w-7">
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
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Predecessors</Label>
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                <Link2 className="h-3 w-3" />
                Toevoegen
              </Button>
            </div>

            {task.dependencies.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-8 text-center">
                <Link2 className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Geen dependencies
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {task.dependencies.map(dep => (
                  <div
                    key={dep.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{dep.predecessorName}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{task.name}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {DEPENDENCY_TYPES.find(t => t.value === dep.type)?.label || dep.type}
                        </Badge>
                        {dep.lag !== 0 && (
                          <span className="text-xs text-muted-foreground">
                            {dep.lag > 0 ? '+' : ''}{dep.lag} dagen
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
            className="bg-stone-800 text-stone-50 hover:bg-stone-700 dark:bg-stone-200 dark:text-stone-900"
            onClick={() => onSave?.(task)}
          >
            Opslaan
          </Button>
        </div>
      </div>
    </div>
  )
}
