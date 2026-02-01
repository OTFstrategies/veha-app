"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// =============================================================================
// Context
// =============================================================================

interface CollapsibleContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null)

function useCollapsible() {
  const context = React.useContext(CollapsibleContext)
  if (!context) {
    throw new Error("useCollapsible must be used within Collapsible")
  }
  return context
}

// =============================================================================
// Collapsible
// =============================================================================

interface CollapsibleProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

function Collapsible({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  className,
}: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    },
    [isControlled, onOpenChange]
  )

  return (
    <CollapsibleContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      <div className={className} data-state={open ? "open" : "closed"}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

// =============================================================================
// CollapsibleTrigger
// =============================================================================

type CollapsibleTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  CollapsibleTriggerProps
>(({ className, onClick, children, ...props }, ref) => {
  const { open, onOpenChange } = useCollapsible()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onOpenChange(!open)
    onClick?.(e)
  }

  return (
    <button
      ref={ref}
      type="button"
      className={className}
      onClick={handleClick}
      data-state={open ? "open" : "closed"}
      aria-expanded={open}
      {...props}
    >
      {children}
    </button>
  )
})
CollapsibleTrigger.displayName = "CollapsibleTrigger"

// =============================================================================
// CollapsibleContent
// =============================================================================

interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean
}

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  CollapsibleContentProps
>(({ className, children, ...props }, ref) => {
  const { open } = useCollapsible()

  return (
    <div
      ref={ref}
      className={cn("collapsible-content", className)}
      data-state={open ? "open" : "closed"}
      {...props}
    >
      <div>{children}</div>
    </div>
  )
})
CollapsibleContent.displayName = "CollapsibleContent"

// =============================================================================
// Exports
// =============================================================================

export { Collapsible, CollapsibleTrigger, CollapsibleContent, useCollapsible }
