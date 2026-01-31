"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// =============================================================================
// Button Variants
// =============================================================================

const buttonVariants = {
  variant: {
    default:
      "bg-stone-800 text-white shadow hover:bg-stone-900 dark:bg-stone-50 dark:text-stone-900 dark:hover:bg-stone-200",
    destructive:
      "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
    outline:
      "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
    secondary:
      "bg-stone-100 text-stone-800 shadow-sm hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-stone-600 underline-offset-4 hover:underline dark:text-stone-400",
  },
  size: {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8",
    icon: "h-9 w-9",
  },
}

// =============================================================================
// Types
// =============================================================================

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variant
  size?: keyof typeof buttonVariants.size
  asChild?: boolean
}

// =============================================================================
// Component
// =============================================================================

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const buttonClassName = cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
      buttonVariants.variant[variant],
      buttonVariants.size[size],
      className
    )

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string; ref?: React.Ref<HTMLElement> }>, {
        className: cn(buttonClassName, (children as React.ReactElement<{ className?: string }>).props.className),
        ref,
      })
    }

    return (
      <button
        className={buttonClassName}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
