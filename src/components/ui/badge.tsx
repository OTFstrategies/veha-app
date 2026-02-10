import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900":
            variant === "default",
          "border-transparent bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100":
            variant === "secondary",
          "border-transparent bg-destructive text-destructive-foreground":
            variant === "destructive",
          "text-foreground": variant === "outline",
          "border-transparent bg-state-success-bg text-state-success-text":
            variant === "success",
          "border-transparent bg-state-warning-bg text-state-warning-text":
            variant === "warning",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
