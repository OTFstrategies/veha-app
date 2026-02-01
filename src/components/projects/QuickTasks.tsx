"use client"

import * as React from "react"
import { Check, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { QuickTask } from "@/types/projects"

// =============================================================================
// Types
// =============================================================================

interface QuickTasksProps {
  projectId: string
  tasks: QuickTask[]
  onTasksChange?: (tasks: QuickTask[]) => void
}

export type { QuickTask }

// =============================================================================
// Component
// =============================================================================

export function QuickTasks({ projectId, tasks, onTasksChange }: QuickTasksProps) {
  const [newTaskText, setNewTaskText] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleAddTask = () => {
    if (!newTaskText.trim()) return

    const newTask: QuickTask = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      completed: false,
      order: tasks.length,
    }

    onTasksChange?.([...tasks, newTask])
    setNewTaskText("")
    inputRef.current?.focus()
  }

  const handleToggleTask = (taskId: string) => {
    onTasksChange?.(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const handleDeleteTask = (taskId: string) => {
    onTasksChange?.(tasks.filter((task) => task.id !== taskId))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTask()
    }
  }

  const completedCount = tasks.filter((t) => t.completed).length
  const totalCount = tasks.length

  // Sort tasks: incomplete first, then completed
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    return a.order - b.order
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Checklist</h3>
        {totalCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {completedCount}/{totalCount} voltooid
          </span>
        )}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      )}

      {/* Task list */}
      <div className="space-y-1">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors",
              "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            )}
          >
            {/* Checkbox */}
            <button
              onClick={() => handleToggleTask(task.id)}
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                task.completed
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-400"
              )}
            >
              {task.completed && <Check className="h-3 w-3" />}
            </button>

            {/* Task text */}
            <span
              className={cn(
                "flex-1 text-sm",
                task.completed && "text-muted-foreground line-through"
              )}
            >
              {task.text}
            </span>

            {/* Delete button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDeleteTask(task.id)}
            >
              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add new task */}
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nieuwe taak toevoegen..."
          className="h-9 text-sm"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleAddTask}
          disabled={!newTaskText.trim()}
          className="h-9 shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
