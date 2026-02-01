"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useUIStore } from "@/stores/ui-store"

// =============================================================================
// Props
// =============================================================================

interface CollapsibleSectionProps {
  title: string
  subtitle?: string
  sectionKey: 'todayTasks' | 'capacity' | 'activeProjects'
  badge?: React.ReactNode
  headerAction?: React.ReactNode
  children: React.ReactNode
  className?: string
}

// =============================================================================
// Component
// =============================================================================

export function CollapsibleSection({
  title,
  subtitle,
  sectionKey,
  badge,
  headerAction,
  children,
  className,
}: CollapsibleSectionProps) {
  const { dashboardSections, toggleDashboardSection } = useUIStore()
  const isOpen = dashboardSections[sectionKey]

  return (
    <Collapsible open={isOpen} onOpenChange={() => toggleDashboardSection(sectionKey)}>
      <div className={cn("rounded-xl border border-border bg-card", className)}>
        <CollapsibleTrigger
          className="flex w-full items-center justify-between p-4 hover:bg-muted/50 rounded-t-xl"
          aria-expanded={isOpen}
          aria-controls={`section-content-${sectionKey}`}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{title}</h2>
            {badge}
            {subtitle && (
              <span className="text-sm text-muted-foreground">{subtitle}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {headerAction}
            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180"
              )}
              aria-hidden="true"
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent id={`section-content-${sectionKey}`}>
          <div className="p-4 pt-0">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
