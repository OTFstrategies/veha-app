'use client'

import * as React from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUnreadCount } from '@/queries/notifications'
import { useNotificationStore } from '@/stores/notification-store'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const { data: unreadCount = 0 } = useUnreadCount()
  const toggle = useNotificationStore((s) => s.toggle)

  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative h-9 w-9 p-0"
      onClick={toggle}
      aria-label={`Meldingen${unreadCount > 0 ? ` (${unreadCount} ongelezen)` : ''}`}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span
          className={cn(
            'absolute -top-0.5 -right-0.5 flex items-center justify-center',
            'min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold',
            'px-1'
          )}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  )
}
