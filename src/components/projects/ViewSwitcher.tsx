'use client'

import Link from 'next/link'
import { LayoutGrid, Columns3, GanttChart } from 'lucide-react'
import { cn } from '@/lib/utils'

type ProjectView = 'grid' | 'kanban' | 'gantt'

const views: Array<{
  id: ProjectView
  href: string
  icon: typeof LayoutGrid
  title: string
}> = [
  { id: 'grid', href: '/projects', icon: LayoutGrid, title: 'Grid weergave' },
  { id: 'kanban', href: '/projects/kanban', icon: Columns3, title: 'Kanban weergave' },
  { id: 'gantt', href: '/projects/gantt', icon: GanttChart, title: 'Gantt weergave' },
]

interface ViewSwitcherProps {
  activeView: ProjectView
}

export function ViewSwitcher({ activeView }: ViewSwitcherProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-muted/50">
      {views.map(({ id, href, icon: Icon, title }) => (
        <Link
          key={id}
          href={href}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-md transition-colors',
            id === activeView
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background'
          )}
          title={title}
        >
          <Icon className="h-4 w-4" />
        </Link>
      ))}
    </div>
  )
}
