"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// =============================================================================
// Tooltip Context
// =============================================================================

interface TooltipContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null)

function useTooltipContext() {
  const context = React.useContext(TooltipContext)
  if (!context) {
    throw new Error("Tooltip components must be used within a Tooltip")
  }
  return context
}

// =============================================================================
// Tooltip Provider (wraps app to enable tooltips)
// =============================================================================

interface TooltipProviderProps {
  children: React.ReactNode
  delayDuration?: number
}

function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>
}

// =============================================================================
// Tooltip Root
// =============================================================================

interface TooltipProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function Tooltip({ open: controlledOpen, onOpenChange, children }: TooltipProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)

  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setOpen = onOpenChange || setUncontrolledOpen

  return (
    <TooltipContext.Provider value={{ open, onOpenChange: setOpen }}>
      <span className="relative inline-flex">{children}</span>
    </TooltipContext.Provider>
  )
}

// =============================================================================
// Tooltip Trigger
// =============================================================================

interface TooltipTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

const TooltipTrigger = React.forwardRef<HTMLSpanElement, TooltipTriggerProps>(
  ({ children, asChild }, ref) => {
    const { onOpenChange } = useTooltipContext()

    const handleMouseEnter = () => onOpenChange(true)
    const handleMouseLeave = () => onOpenChange(false)
    const handleFocus = () => onOpenChange(true)
    const handleBlur = () => onOpenChange(false)

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<{
          onMouseEnter?: () => void
          onMouseLeave?: () => void
          onFocus?: () => void
          onBlur?: () => void
          ref?: React.Ref<HTMLSpanElement>
        }>,
        // eslint-disable-next-line react-hooks/refs -- asChild pattern requires ref during render
        {
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
          onFocus: handleFocus,
          onBlur: handleBlur,
          ref,
        }
      )
    }

    return (
      <span
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={0}
        className="inline-flex"
      >
        {children}
      </span>
    )
  }
)
TooltipTrigger.displayName = "TooltipTrigger"

// =============================================================================
// Tooltip Content
// =============================================================================

interface TooltipContentProps {
  children: React.ReactNode
  className?: string
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
}

function TooltipContent({
  children,
  className,
  side = "top",
  sideOffset = 4,
}: TooltipContentProps) {
  const { open } = useTooltipContext()

  if (!open) return null

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1",
    left: "right-full top-1/2 -translate-y-1/2 mr-1",
    right: "left-full top-1/2 -translate-y-1/2 ml-1",
  }

  return (
    <span
      role="tooltip"
      className={cn(
        "absolute z-50 whitespace-nowrap rounded-md px-2 py-1 text-xs",
        "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900",
        "animate-in fade-in-0 zoom-in-95",
        positionClasses[side],
        className
      )}
      style={{
        marginTop: side === "bottom" ? sideOffset : undefined,
        marginBottom: side === "top" ? sideOffset : undefined,
        marginLeft: side === "right" ? sideOffset : undefined,
        marginRight: side === "left" ? sideOffset : undefined,
      }}
    >
      {children}
    </span>
  )
}

// =============================================================================
// Exports
// =============================================================================

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
