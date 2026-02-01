"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"

// =============================================================================
// Types
// =============================================================================

interface FABAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

interface FABProps {
  actions: FABAction[]
  onAction: (actionId: string) => void
}

// =============================================================================
// Component
// =============================================================================

export function FAB({ actions, onAction }: FABProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          className={cn(
            "h-12 w-12 rounded-full shadow-lg transition-transform duration-200",
            "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200",
            "text-white dark:text-zinc-900"
          )}
        >
          <Plus
            className={cn(
              "h-5 w-5 transition-transform duration-200",
              open && "rotate-45"
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            onClick={() => {
              onAction(action.id)
              setOpen(false)
            }}
          >
            <action.icon className="mr-2 h-4 w-4" />
            <div className="flex flex-col">
              <span>{action.label}</span>
              {action.description && (
                <span className="text-xs text-muted-foreground">
                  {action.description}
                </span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export type { FABAction, FABProps }
