"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { usePresenceStore, type UserPresence } from "@/stores/presence-store"
import { cn } from "@/lib/utils"

// =============================================================================
// Props
// =============================================================================

interface PresenceAvatarsProps {
  /** Maximum number of avatars to show before "+X" */
  maxDisplay?: number
  /** Size of avatars */
  size?: "sm" | "md"
  /** Additional CSS classes */
  className?: string
  /** ID of the current user (to optionally exclude self) */
  currentUserId?: string
  /** Whether to show self in the list */
  showSelf?: boolean
}

// =============================================================================
// Component
// =============================================================================

export function PresenceAvatars({
  maxDisplay = 5,
  size = "md",
  className,
  currentUserId,
  showSelf = false,
}: PresenceAvatarsProps) {
  const activeUsers = usePresenceStore((state) => state.activeUsers)

  // Filter out current user if showSelf is false
  const displayUsers = React.useMemo(() => {
    if (showSelf || !currentUserId) {
      return activeUsers
    }
    return activeUsers.filter((u) => u.id !== currentUserId)
  }, [activeUsers, currentUserId, showSelf])

  if (displayUsers.length === 0) return null

  const visibleUsers = displayUsers.slice(0, maxDisplay)
  const remainingCount = displayUsers.length - maxDisplay

  const avatarSize = size === "sm" ? "h-6 w-6" : "h-8 w-8"
  const fontSize = size === "sm" ? "text-[10px]" : "text-xs"
  const spacing = size === "sm" ? "-space-x-1.5" : "-space-x-2"

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={cn("flex items-center", spacing, className)}>
      {visibleUsers.map((user) => (
        <PresenceAvatar
          key={user.id}
          user={user}
          avatarSize={avatarSize}
          fontSize={fontSize}
          getInitials={getInitials}
        />
      ))}
      {remainingCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                avatarSize,
                "rounded-full bg-muted flex items-center justify-center",
                fontSize,
                "font-medium border-2 border-background z-10"
              )}
            >
              +{remainingCount}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {displayUsers.slice(maxDisplay).map((u) => (
              <p key={u.id} className="text-xs">
                {u.name}
              </p>
            ))}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

// =============================================================================
// Sub-Components
// =============================================================================

interface PresenceAvatarProps {
  user: UserPresence
  avatarSize: string
  fontSize: string
  getInitials: (name: string) => string
}

function PresenceAvatar({
  user,
  avatarSize,
  fontSize,
  getInitials,
}: PresenceAvatarProps) {
  // Determine if user is "active" (seen within last 2 minutes)
  const isActive = React.useMemo(() => {
    const lastSeen = new Date(user.lastSeen)
    const now = new Date()
    const diffMs = now.getTime() - lastSeen.getTime()
    return diffMs < 2 * 60 * 1000 // 2 minutes
  }, [user.lastSeen])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative">
          <Avatar className={cn(avatarSize, "border-2 border-background")}>
            <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
            <AvatarFallback className={fontSize}>
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          {/* Online indicator */}
          <span
            className={cn(
              "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background",
              isActive ? "bg-green-500" : "bg-zinc-400"
            )}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <p className="font-medium">{user.name}</p>
        <p className="text-muted-foreground">{user.email}</p>
        {user.viewingTaskId && (
          <p className="text-blue-500 text-[10px] mt-1">
            Bekijkt taak
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
