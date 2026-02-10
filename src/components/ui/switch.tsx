"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, disabled, onCheckedChange, ...props }, ref) => {
    return (
      <label
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
          disabled && "cursor-not-allowed opacity-50",
          checked
            ? "bg-zinc-900 dark:bg-zinc-100"
            : "bg-zinc-200 dark:bg-zinc-700",
          className
        )}
      >
        <input
          type="checkbox"
          role="switch"
          ref={ref}
          checked={checked}
          disabled={disabled}
          aria-checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="sr-only"
          {...props}
        />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5"
          )}
        />
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
