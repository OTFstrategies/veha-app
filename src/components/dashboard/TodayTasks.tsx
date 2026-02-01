import { ChevronRight, CheckCircle2, Clock } from 'lucide-react'
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
  if (taskGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CheckCircle2 className="mb-2 h-8 w-8 text-green-500" />
        <p className="text-sm text-muted-foreground">Geen taken voor vandaag</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {taskGroups.map((group) => (
        <div key={group.projectId} className="py-3 first:pt-0 last:pb-0">
          {/* Project Header */}
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-medium">{group.projectName}</span>
            <span className="text-xs text-muted-foreground">• {group.clientName}</span>
          </div>

          {/* Tasks */}
          <div className="space-y-1">
            {group.tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => onTaskClick?.(task.id, group.projectId)}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-lg border border-transparent p-2 text-left transition-all',
                  'hover:border-border hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
                  task.status === 'done' && 'opacity-60'
                )}
              >
                {/* Status Icon */}
                <div
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                    task.status === 'done'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : task.status === 'in_progress'
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'bg-zinc-100 dark:bg-zinc-800'
                  )}
                >
                  {task.status === 'done' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
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
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          task.progress === 100
                            ? 'bg-green-500'
                            : 'bg-zinc-600 dark:bg-zinc-400'
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
                    <Avatar key={assignee.id} className="h-5 w-5 border-2 border-card">
                      <AvatarFallback className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 text-[8px] font-medium">
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
      ))}
    </div>
  )
}
