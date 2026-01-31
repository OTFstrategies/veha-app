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
    <div className="flex items-center gap-6 px-4 py-2 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-700">
      <span className="text-xs text-stone-500 dark:text-stone-400">Legenda:</span>

      <div className="flex items-center gap-2">
        <div className="w-4 h-3 rounded bg-red-500 ring-2 ring-red-300 dark:ring-red-700" />
        <span className="text-xs text-stone-600 dark:text-stone-400">
          Kritiek pad (0 dagen speling)
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-4 h-3 rounded bg-[#CBC4B5] dark:bg-stone-500" />
        <span className="text-xs text-stone-600 dark:text-stone-400">Normale taak</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-4 h-3 rounded bg-[#CBC4B5] dark:bg-stone-500 opacity-70" />
        <span className="text-xs text-stone-600 dark:text-stone-400">
          Taak met veel speling (&gt;5d)
        </span>
      </div>
    </div>
  )
}
