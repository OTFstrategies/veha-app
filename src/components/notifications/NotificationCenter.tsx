'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import {
  AtSign,
  MessageSquare,
  MessageCircle,
  UserPlus,
  Check,
  Loader2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/queries/notifications'
import { useNotificationStore } from '@/stores/notification-store'
import type { Notification, NotificationType } from '@/types/threads'

// =============================================================================
// Icon Map
// =============================================================================

const ICON_MAP: Record<NotificationType, React.ElementType> = {
  mention: AtSign,
  reply: MessageSquare,
  new_thread: MessageCircle,
  assignment: UserPlus,
}

const COLOR_MAP: Record<NotificationType, string> = {
  mention: 'text-blue-500',
  reply: 'text-purple-500',
  new_thread: 'text-green-500',
  assignment: 'text-amber-500',
}

// =============================================================================
// Notification Item
// =============================================================================

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
}) {
  const Icon = ICON_MAP[notification.type]

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer border-b border-border last:border-0',
        !notification.isRead && 'bg-blue-50/50 dark:bg-blue-950/20'
      )}
      onClick={() => {
        if (!notification.isRead) onMarkRead(notification.id)
      }}
    >
      <div className={cn('mt-0.5 shrink-0', COLOR_MAP[notification.type])}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm', !notification.isRead && 'font-medium')}>
          {notification.title}
        </p>
        {notification.body && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {notification.body}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {format(new Date(notification.createdAt), "d MMM 'om' HH:mm", { locale: nl })}
        </p>
      </div>

      {!notification.isRead && (
        <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
      )}
    </div>
  )
}

// =============================================================================
// Component
// =============================================================================

export function NotificationCenter() {
  const isOpen = useNotificationStore((s) => s.isOpen)
  const setIsOpen = useNotificationStore((s) => s.setIsOpen)
  const { data: notifications, isLoading } = useNotifications()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const panelRef = React.useRef<HTMLDivElement>(null)

  // Close on click outside
  React.useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, setIsOpen])

  if (!isOpen) return null

  const hasUnread = notifications?.some((n) => !n.isRead)

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-[380px] bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">Meldingen</h3>
        <div className="flex items-center gap-1">
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <Check className="h-3.5 w-3.5" />
              Alles gelezen
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Geen meldingen</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={(id) => markAsRead.mutate(id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
