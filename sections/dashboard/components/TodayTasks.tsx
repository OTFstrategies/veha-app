import { Calendar, ChevronRight, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { TodayTaskGroup } from '@/types/dashboard'

// =============================================================================
// Props
// =============================================================================

interface TodayTasksProps {
  taskGroups: TodayTaskGroup[]
  onTaskClick?: (taskId: string, projectId: string) => void
}

// =============================================================================
// Component
// =============================================================================

export function TodayTasks({ taskGroups, onTaskClick }: TodayTasksProps) {
  const today = new Date().toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const totalTasks = taskGroups.reduce((sum, group) => sum + group.tasks.length, 0)

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800">
            <Calendar className="h-4 w-4 text-stone-600 dark:text-stone-400" />
          </div>
          <div>
            <h2 className="font-semibold">Vandaag</h2>
            <p className="text-sm capitalize text-muted-foreground">{today}</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {totalTasks} {totalTasks === 1 ? 'taak' : 'taken'}
        </div>
      </div>

      {/* Task Groups */}
      <div className="divide-y divide-border">
        {taskGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="mb-3 h-10 w-10 text-green-500" />
            <p className="font-medium">Geen taken gepland voor vandaag</p>
            <p className="mt-1 text-sm text-muted-foreground">Geniet van je vrije dag!</p>
          </div>
        ) : (
          taskGroups.map((group) => (
            <div key={group.projectId} className="p-4">
              {/* Project Header */}
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm font-medium">{group.projectName}</span>
                <span className="text-xs text-muted-foreground">• {group.clientName}</span>
              </div>

              {/* Tasks */}
              <div className="space-y-2">
                {group.tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick?.(task.id, group.projectId)}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-lg border border-transparent p-3 text-left transition-all',
                      'hover:border-border hover:bg-stone-50 dark:hover:bg-stone-800/50',
                      task.status === 'done' && 'opacity-60'
                    )}
                  >
                    {/* Status Icon */}
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                        task.status === 'done'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : task.status === 'in_progress'
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'bg-stone-100 dark:bg-stone-800'
                      )}
                    >
                      {task.status === 'done' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>

                    {/* Task Info */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'truncate text-sm font-medium',
                          task.status === 'done' && 'line-through'
                        )}
                      >
                        {task.name}
                      </p>
                      {/* Progress Bar */}
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              task.progress === 100
                                ? 'bg-green-500'
                                : 'bg-stone-600 dark:bg-stone-400'
                            )}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {task.progress}%
                        </span>
                      </div>
                    </div>

                    {/* Assignees */}
                    <div className="flex -space-x-1">
                      {task.assignees.slice(0, 3).map((assignee) => (
                        <Avatar key={assignee.id} className="h-6 w-6 border-2 border-card">
                          <AvatarFallback
                            className="text-[9px] font-medium text-white"
                            style={{ backgroundColor: assignee.color }}
                          >
                            {assignee.initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
