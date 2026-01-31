"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// =============================================================================
// Popover Context
// =============================================================================

interface PopoverContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

function usePopoverContext() {
  const context = React.useContext(PopoverContext)
  if (!context) {
    throw new Error("Popover components must be used within a Popover")
  }
  return context
}

// =============================================================================
// Popover Root
// =============================================================================

interface PopoverProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function Popover({ open: controlledOpen, onOpenChange, children }: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setOpen = onOpenChange || setUncontrolledOpen

  return (
    <PopoverContext.Provider value={{ open, onOpenChange: setOpen, triggerRef }}>
      {children}
    </PopoverContext.Provider>
  )
}

// =============================================================================
// Popover Trigger
// =============================================================================

interface PopoverTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ children, asChild }, forwardedRef) => {
    const { open, onOpenChange, triggerRef } = usePopoverContext()

    const ref = (forwardedRef || triggerRef) as React.RefObject<HTMLButtonElement>

    const handleClick = () => {
      onOpenChange(!open)
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<{
          onClick?: () => void
          ref?: React.Ref<HTMLButtonElement>
        }>,
        {
          onClick: handleClick,
          ref,
        }
      )
    }

    return (
      <button type="button" onClick={handleClick} ref={ref}>
        {children}
      </button>
    )
  }
)
PopoverTrigger.displayName = "PopoverTrigger"

// =============================================================================
// Popover Content
// =============================================================================

interface PopoverContentProps {
  children: React.ReactNode
  className?: string
  align?: "start" | "center" | "end"
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
}

function PopoverContent({
  children,
  className,
  align = "center",
  side = "bottom",
  sideOffset = 4,
}: PopoverContentProps) {
  const { open, onOpenChange, triggerRef } = usePopoverContext()
  const contentRef = React.useRef<HTMLDivElement>(null)

  // Close on click outside
  React.useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onOpenChange(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open, onOpenChange, triggerRef])

  if (!open) return null

  // Calculate position classes based on side and align
  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  }

  const alignClasses = {
    start: side === "top" || side === "bottom" ? "left-0" : "top-0",
    center:
      side === "top" || side === "bottom"
        ? "left-1/2 -translate-x-1/2"
        : "top-1/2 -translate-y-1/2",
    end: side === "top" || side === "bottom" ? "right-0" : "bottom-0",
  }

  return (
    <div
      ref={contentRef}
      role="dialog"
      className={cn(
        "absolute z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        "animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        positionClasses[side],
        alignClasses[align],
        className
      )}
      style={{ marginTop: side === "bottom" ? sideOffset : undefined }}
      data-side={side}
    >
      {children}
    </div>
  )
}

// =============================================================================
// Popover Close
// =============================================================================

interface PopoverCloseProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

function PopoverClose({ children, className, asChild }: PopoverCloseProps) {
  const { onOpenChange } = usePopoverContext()

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children as React.ReactElement<{ onClick?: () => void }>,
      {
        onClick: () => onOpenChange(false),
      }
    )
  }

  return (
    <button
      type="button"
      onClick={() => onOpenChange(false)}
      className={className}
    >
      {children}
    </button>
  )
}

// =============================================================================
// Exports
// =============================================================================

export { Popover, PopoverTrigger, PopoverContent, PopoverClose }
