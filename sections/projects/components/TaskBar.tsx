import { Diamond } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/projects'

// =============================================================================
// Props
// =============================================================================

interface TaskBarProps {
  task: Task
  left: number
  width: number
  top: number
  height: number
  isSelected: boolean
  showProgress: boolean
  onClick: () => void
  onDoubleClick: () => void
}

// =============================================================================
// Component
// =============================================================================

export function TaskBar({
  task,
  left,
  width,
  top,
  height,
  isSelected,
  showProgress,
  onClick,
  onDoubleClick,
}: TaskBarProps) {
  const barHeight = 20
  const barTop = top + (height - barHeight) / 2

  // ---------------------------------------------------------------------------
  // Milestone
  // ---------------------------------------------------------------------------

  if (task.isMilestone) {
    return (
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: left - 10,
          top: barTop,
          width: 20,
          height: barHeight,
        }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        <Diamond
          className={cn(
            'h-4 w-4 cursor-pointer fill-stone-800 text-stone-800 transition-all dark:fill-stone-200 dark:text-stone-200',
            isSelected && 'fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400',
            'hover:scale-110'
          )}
        />
        {/* Tooltip on hover */}
        <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-stone-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-stone-200 dark:text-stone-900">
          {task.name}
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Summary Task
  // ---------------------------------------------------------------------------

  if (task.isSummary) {
    return (
      <div
        className={cn(
          'group absolute cursor-pointer rounded-sm transition-all',
          isSelected
            ? 'ring-2 ring-blue-500 ring-offset-1'
            : 'hover:brightness-95'
        )}
        style={{
          left,
          top: barTop + 6,
          width: Math.max(width, 8),
          height: 8,
          backgroundColor: '#9ca3af',
        }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        {/* Left bracket */}
        <div
          className="absolute -bottom-1 left-0 w-1 rounded-b-sm"
          style={{ height: 6, backgroundColor: '#9ca3af' }}
        />
        {/* Right bracket */}
        <div
          className="absolute -bottom-1 right-0 w-1 rounded-b-sm"
          style={{ height: 6, backgroundColor: '#9ca3af' }}
        />

        {/* Tooltip */}
        <div className="pointer-events-none absolute bottom-full left-0 mb-1 whitespace-nowrap rounded bg-stone-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-stone-200 dark:text-stone-900">
          {task.name} ({task.progress}%)
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Regular Task
  // ---------------------------------------------------------------------------

  // Status-based colors
  const statusColors = {
    todo: {
      bg: '#CBC4B5', // VEHA beige
      progress: '#2e2d2c', // VEHA zwart
    },
    in_progress: {
      bg: '#CBC4B5',
      progress: '#2e2d2c',
    },
    done: {
      bg: '#22c55e', // green
      progress: '#16a34a',
    },
  }

  const colors = statusColors[task.status]

  return (
    <div
      className={cn(
        'group absolute cursor-pointer rounded transition-all',
        isSelected
          ? 'ring-2 ring-blue-500 ring-offset-1'
          : 'hover:brightness-95'
      )}
      style={{
        left,
        top: barTop,
        width: Math.max(width, 8),
        height: barHeight,
        backgroundColor: colors.bg,
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {/* Progress Fill */}
      {showProgress && task.progress > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 rounded-l transition-all"
          style={{
            width: `${task.progress}%`,
            backgroundColor: colors.progress,
            borderRadius: task.progress === 100 ? '0.25rem' : '0.25rem 0 0 0.25rem',
          }}
        />
      )}

      {/* Task Name (shown if bar is wide enough) */}
      {width > 80 && (
        <span
          className={cn(
            'absolute left-2 top-1/2 -translate-y-1/2 truncate text-xs font-medium',
            task.progress > 50 ? 'text-white' : 'text-stone-800'
          )}
          style={{ maxWidth: width - 16 }}
        >
          {task.name}
        </span>
      )}

      {/* Resize Handles (visual only for now) */}
      <div className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Tooltip */}
      <div className="pointer-events-none absolute bottom-full left-0 mb-1 whitespace-nowrap rounded bg-stone-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-stone-200 dark:text-stone-900">
        <div className="font-medium">{task.name}</div>
        <div className="text-stone-300 dark:text-stone-600">
          {new Date(task.startDate).toLocaleDateString('nl-NL')} -{' '}
          {new Date(task.endDate).toLocaleDateString('nl-NL')}
        </div>
        <div className="text-stone-300 dark:text-stone-600">
          {task.progress}% voltooid
        </div>
      </div>
    </div>
  )
}
