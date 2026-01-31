import {
  CalendarDays,
  ChevronDown,
  Eye,
  Minus,
  Plus,
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
import type { GanttZoomLevel, ViewOptions } from './types'

// =============================================================================
// Props
// =============================================================================

interface GanttToolbarProps {
  zoomLevel: GanttZoomLevel
  viewOptions: ViewOptions
  onZoomChange: (level: GanttZoomLevel) => void
  onViewOptionsChange: (options: ViewOptions) => void
  onAddTask: () => void
  onScrollToToday: () => void
}

// =============================================================================
// Zoom Level Config
// =============================================================================

const ZOOM_LABELS: Record<GanttZoomLevel, string> = {
  day: 'Dag',
  week: 'Week',
  month: 'Maand',
  quarter: 'Kwartaal',
}

const ZOOM_ORDER: GanttZoomLevel[] = ['day', 'week', 'month', 'quarter']

// =============================================================================
// Component
// =============================================================================

export function GanttToolbar({
  zoomLevel,
  viewOptions,
  onZoomChange,
  onViewOptionsChange,
  onAddTask,
  onScrollToToday,
}: GanttToolbarProps) {
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
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
      {/* Left: Add Task */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={onAddTask}
          className="h-8 gap-1.5 bg-stone-800 text-stone-50 hover:bg-stone-700 dark:bg-stone-200 dark:text-stone-900 dark:hover:bg-stone-300"
        >
          <Plus className="h-3.5 w-3.5" />
          Taak toevoegen
        </Button>
      </div>

      {/* Right: Zoom & View Controls */}
      <div className="flex items-center gap-2">
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
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 gap-1 rounded-none border-x border-border px-3 font-mono text-xs"
              >
                {ZOOM_LABELS[zoomLevel]}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {ZOOM_ORDER.map((level) => (
                <DropdownMenuCheckboxItem
                  key={level}
                  checked={zoomLevel === level}
                  onCheckedChange={() => onZoomChange(level)}
                >
                  {ZOOM_LABELS[level]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-l-none"
            onClick={handleZoomOut}
            disabled={!canZoomOut}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* View Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Weergave
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Toon/verberg</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={viewOptions.showDependencies}
              onCheckedChange={() => handleViewOptionToggle('showDependencies')}
            >
              Dependencies
            </DropdownMenuCheckboxItem>
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
