import * as React from 'react'
import {
  CalendarDays,
  ChevronDown,
  Eye,
  Flag,
  FlagOff,
  GitBranch,
  Minus,
  Plus,
  Redo2,
  Route,
  Undo2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/toast'
import { useTaskHistoryStore } from '@/stores/task-history-store'
import { useUndoTaskChanges, useRedoTaskChanges, useSetProjectBaseline, useClearProjectBaseline } from '@/queries/tasks'
import { ConflictWarning, type ConflictItem } from './ConflictWarning'
import { ExportMenu } from '@/components/ui/export-menu'
import { PresenceAvatars } from '@/components/ui/presence-avatars'
import { useProjectExport } from '@/hooks/use-project-export'
import { getAllEmployeeConflicts } from '@/lib/scheduling/conflict-detection'
import type { GanttZoomLevel, ViewOptions } from './types'
import type { Task } from '@/types/projects'
import { ZOOM_ORDER, ZOOM_LABELS } from './constants'

// =============================================================================
// Props
// =============================================================================

interface GanttToolbarProps {
  projectId: string
  tasks: Task[]
  projectName: string
  zoomLevel: GanttZoomLevel
  viewOptions: ViewOptions
  showCriticalPath: boolean
  onZoomChange: (level: GanttZoomLevel) => void
  onViewOptionsChange: (options: ViewOptions) => void
  onShowCriticalPathChange: (show: boolean) => void
  onAddTask: () => void
  onScrollToToday: () => void
}

// =============================================================================
// Component
// =============================================================================

export function GanttToolbar({
  projectId,
  tasks,
  projectName,
  zoomLevel,
  viewOptions,
  showCriticalPath,
  onZoomChange,
  onViewOptionsChange,
  onShowCriticalPathChange,
  onAddTask,
  onScrollToToday,
}: GanttToolbarProps) {
  // ---------------------------------------------------------------------------
  // Undo/Redo State
  // ---------------------------------------------------------------------------

  const canUndo = useTaskHistoryStore((state) => state.canUndo)
  const canRedo = useTaskHistoryStore((state) => state.canRedo)
  const undoMutation = useUndoTaskChanges()
  const redoMutation = useRedoTaskChanges()
  const { addToast } = useToast()

  // Export functionality
  const { exportCSV, exportExcel, isExporting } = useProjectExport({
    projectName,
    tasks,
  })

  // Baseline functionality
  const setBaselineMutation = useSetProjectBaseline()
  const clearBaselineMutation = useClearProjectBaseline()
  const hasBaseline = tasks?.some((t) => t.isBaselineSet) ?? false

  // ---------------------------------------------------------------------------
  // Conflict Detection
  // ---------------------------------------------------------------------------

  const conflicts = React.useMemo<ConflictItem[]>(() => {
    const allConflicts: ConflictItem[] = []

    // Get unique employee IDs from all task assignments
    const employeeIds = new Set<string>()
    const employeeNames = new Map<string, string>()

    tasks.forEach((task) => {
      task.assignments.forEach((assignment) => {
        employeeIds.add(assignment.employeeId)
        employeeNames.set(assignment.employeeId, assignment.employeeName)
      })
    })

    // Convert tasks to TaskWithProject format for conflict detection
    const tasksWithProject = tasks.map((task) => ({
      ...task,
      projectId,
      projectName,
    }))

    // Check each employee for conflicts
    employeeIds.forEach((employeeId) => {
      const employeeConflicts = getAllEmployeeConflicts(employeeId, tasksWithProject)

      employeeConflicts.forEach(({ task2 }) => {
        // Only add one entry per conflict pair
        allConflicts.push({
          employeeName: employeeNames.get(employeeId) || 'Onbekend',
          taskName: task2.taskName,
          date: task2.startDate,
          overlapDays: task2.overlapDays,
        })
      })
    })

    return allConflicts
  }, [tasks, projectId, projectName])

  // ---------------------------------------------------------------------------
  // Zoom Handlers
  // ---------------------------------------------------------------------------

  const handleZoomIn = () => {
    const currentIndex = ZOOM_ORDER.indexOf(zoomLevel)
    if (currentIndex > 0) {
      onZoomChange(ZOOM_ORDER[currentIndex - 1])
    }
  }

  const handleZoomOut = () => {
    const currentIndex = ZOOM_ORDER.indexOf(zoomLevel)
    if (currentIndex < ZOOM_ORDER.length - 1) {
      onZoomChange(ZOOM_ORDER[currentIndex + 1])
    }
  }

  const canZoomIn = ZOOM_ORDER.indexOf(zoomLevel) > 0
  const canZoomOut = ZOOM_ORDER.indexOf(zoomLevel) < ZOOM_ORDER.length - 1

  // ---------------------------------------------------------------------------
  // View Options Handler
  // ---------------------------------------------------------------------------

  const handleViewOptionToggle = (key: keyof ViewOptions) => {
    onViewOptionsChange({
      ...viewOptions,
      [key]: !viewOptions[key],
    })
  }

  // ---------------------------------------------------------------------------
  // Undo Handler
  // ---------------------------------------------------------------------------

  async function handleUndo() {
    try {
      const entry = await undoMutation.mutateAsync(projectId)
      addToast({
        type: 'info',
        title: 'Ongedaan gemaakt',
        description: entry.description,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fout bij ongedaan maken'
      addToast({
        type: 'error',
        title: 'Fout',
        description: message,
      })
    }
  }

  async function handleRedo() {
    try {
      const entry = await redoMutation.mutateAsync(projectId)
      addToast({
        type: 'info',
        title: 'Opnieuw uitgevoerd',
        description: entry.description,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fout bij opnieuw uitvoeren'
      addToast({
        type: 'error',
        title: 'Fout',
        description: message,
      })
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
      {/* Left: Add Task + Conflict Warning */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          onClick={onAddTask}
          className="h-8 gap-1.5 bg-zinc-800 text-zinc-50 hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          <Plus className="h-3.5 w-3.5" />
          Taak
        </Button>

        {/* Conflict Warning */}
        <ConflictWarning conflicts={conflicts} />
      </div>

      {/* Right: Consolidated controls */}
      <div className="flex items-center gap-2">
        {/* Presence Avatars */}
        <PresenceAvatars size="sm" maxDisplay={4} />

        {/* Separator */}
        <div className="h-6 w-px bg-border mx-1" />

        {/* Undo/Redo buttons */}
        <div className="flex items-center rounded-md border border-border">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-r-none"
            onClick={handleUndo}
            disabled={!canUndo() || undoMutation.isPending}
            title="Ongedaan maken (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-l-none border-l border-border"
            onClick={handleRedo}
            disabled={!canRedo() || redoMutation.isPending}
            title="Opnieuw (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Today Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onScrollToToday}
          className="h-8 gap-1.5"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          Vandaag
        </Button>

        {/* Zoom Controls */}
        <div className="flex items-center rounded-md border border-border">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-r-none"
            onClick={handleZoomIn}
            disabled={!canZoomIn}
            aria-label="Zoom in"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>

          <span className="h-8 flex items-center px-2 border-x border-border font-mono text-xs min-w-[70px] justify-center">
            {ZOOM_LABELS[zoomLevel]}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-l-none"
            onClick={handleZoomOut}
            disabled={!canZoomOut}
            aria-label="Zoom uit"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Baseline Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Flag className="h-3.5 w-3.5" />
              Baseline
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Baseline beheer</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={viewOptions.showBaseline && hasBaseline}
              onCheckedChange={() => hasBaseline && handleViewOptionToggle('showBaseline')}
              className={!hasBaseline ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Toon baseline {!hasBaseline && '(geen baseline ingesteld)'}
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <button
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full"
              onClick={() => setBaselineMutation.mutate(projectId)}
              disabled={setBaselineMutation.isPending}
            >
              <Flag className="mr-2 h-3.5 w-3.5" />
              {hasBaseline ? 'Baseline bijwerken' : 'Baseline instellen'}
            </button>
            {hasBaseline && (
              <button
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full text-red-600 dark:text-red-400"
                onClick={() => clearBaselineMutation.mutate(projectId)}
                disabled={clearBaselineMutation.isPending}
              >
                <FlagOff className="mr-2 h-3.5 w-3.5" />
                Baseline wissen
              </button>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Export Menu */}
        <ExportMenu
          onExportCSV={exportCSV}
          onExportExcel={exportExcel}
          disabled={!tasks || tasks.length === 0}
          isExporting={isExporting}
        />

        {/* View Options - Consolidated dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Opties
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Analyse</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={viewOptions.showDependencies}
              onCheckedChange={() => handleViewOptionToggle('showDependencies')}
            >
              <GitBranch className="mr-2 h-3.5 w-3.5" />
              Afhankelijkheden
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showCriticalPath}
              onCheckedChange={() => onShowCriticalPathChange(!showCriticalPath)}
            >
              <Route className="mr-2 h-3.5 w-3.5" />
              Kritiek Pad
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Weergave</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={viewOptions.showProgress}
              onCheckedChange={() => handleViewOptionToggle('showProgress')}
            >
              Voortgang
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={viewOptions.showTodayLine}
              onCheckedChange={() => handleViewOptionToggle('showTodayLine')}
            >
              Vandaag lijn
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={viewOptions.showWeekends}
              onCheckedChange={() => handleViewOptionToggle('showWeekends')}
            >
              Weekenden
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
