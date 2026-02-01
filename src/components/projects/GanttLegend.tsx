'use client'

// =============================================================================
// Props
// =============================================================================

interface GanttLegendProps {
  showCriticalPath: boolean
}

// =============================================================================
// Component
// =============================================================================

export function GanttLegend({ showCriticalPath }: GanttLegendProps) {
  if (!showCriticalPath) return null

  return (
    <div className="flex items-center gap-6 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-700">
      <span className="text-xs text-zinc-500 dark:text-zinc-400">Legenda:</span>

      <div className="flex items-center gap-2">
        <div className="w-4 h-3 rounded bg-red-500 ring-2 ring-red-300 dark:ring-red-700" />
        <span className="text-xs text-zinc-600 dark:text-zinc-400">
          Kritiek pad (0 dagen speling)
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-4 h-3 rounded bg-[#CBC4B5] dark:bg-zinc-500" />
        <span className="text-xs text-zinc-600 dark:text-zinc-400">Normale taak</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-4 h-3 rounded bg-[#CBC4B5] dark:bg-zinc-500 opacity-70" />
        <span className="text-xs text-zinc-600 dark:text-zinc-400">
          Taak met veel speling (&gt;5d)
        </span>
      </div>
    </div>
  )
}
