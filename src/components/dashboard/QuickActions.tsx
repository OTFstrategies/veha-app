import { FolderPlus, ListPlus, Calendar, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { QuickAction } from '@/types/dashboard'

// =============================================================================
// Props
// =============================================================================

interface QuickActionsProps {
  actions: QuickAction[]
  onAction?: (actionId: string) => void
}

// =============================================================================
// Icon Map
// =============================================================================

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FolderPlus,
  ListPlus,
  Calendar,
  Plus,
}

// =============================================================================
// Component
// =============================================================================

export function QuickActions({ actions, onAction }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const Icon = iconMap[action.icon] || Plus
        return (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            className={cn(
              'gap-2 border-dashed',
              'hover:border-solid hover:border-stone-400 hover:bg-stone-50',
              'dark:hover:border-stone-500 dark:hover:bg-stone-800'
            )}
            onClick={() => onAction?.(action.id)}
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}
