import { Calendar, Clock, Diamond } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { Task, TaskStatus, TaskPriority } from '@/types/projects'

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

interface TaskDetailsPanelProps {
  task: Task
  onFieldChange: <K extends keyof Task>(field: K, value: Task[K]) => void
  formatDate: (dateStr: string) => string
}

export function TaskDetailsPanel({ task, onFieldChange, formatDate }: TaskDetailsPanelProps) {
  return (
    <div className="space-y-4">
      {/* Description */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Beschrijving</Label>
        <textarea
          value={task.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
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
            onChange={(e) => onFieldChange('startDate', e.target.value)}
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
            onChange={(e) => onFieldChange('endDate', e.target.value)}
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
          onChange={(e) => onFieldChange('duration', parseInt(e.target.value) || 1)}
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
          onChange={(e) => onFieldChange('progress', parseInt(e.target.value))}
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
              onClick={() => onFieldChange('status', option.value)}
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
              onClick={() => onFieldChange('priority', option.value)}
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
          onClick={() => onFieldChange('isMilestone', !task.isMilestone)}
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
  )
}
