// =============================================================================
// Thread System Types
// =============================================================================

export type ThreadEntityType = 'project' | 'task' | 'client'
export type ThreadStatusTag = 'vraag' | 'besluit' | 'update' | 'probleem' | 'idee'
export type ThreadPriority = 'low' | 'normal' | 'high' | 'urgent'
export type ThreadCategory = 'algemeen' | 'technisch' | 'planning' | 'financieel' | 'klant'
export type NotificationType = 'mention' | 'reply' | 'new_thread' | 'assignment'

// =============================================================================
// Thread
// =============================================================================

export interface Thread {
  id: string
  workspaceId: string
  entityType: ThreadEntityType
  entityId: string
  title: string
  createdBy: string
  creatorName: string
  creatorEmail: string
  isResolved: boolean
  messageCount: number
  lastMessageAt: string | null
  createdAt: string
  updatedAt: string
}

// =============================================================================
// Thread Message
// =============================================================================

export interface ThreadMessage {
  id: string
  threadId: string
  authorId: string
  authorName: string
  authorEmail: string
  content: string
  statusTag: ThreadStatusTag | null
  priority: ThreadPriority
  category: ThreadCategory
  mentions: string[]
  mentionNames: string[]
  isEdited: boolean
  attachments: ThreadAttachment[]
  createdAt: string
  updatedAt: string
}

// =============================================================================
// Thread Attachment
// =============================================================================

export interface ThreadAttachment {
  id: string
  messageId: string
  fileName: string
  fileSize: number
  fileType: string
  storagePath: string
  url?: string
  createdAt: string
}

// =============================================================================
// Notification
// =============================================================================

export interface Notification {
  id: string
  workspaceId: string
  recipientId: string
  type: NotificationType
  title: string
  body: string | null
  threadId: string | null
  messageId: string | null
  actorId: string | null
  actorName: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
}

// =============================================================================
// UI Helper Types
// =============================================================================

export const STATUS_TAG_CONFIG: Record<ThreadStatusTag, { label: string; color: string }> = {
  vraag: { label: 'Vraag', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  besluit: { label: 'Besluit', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  update: { label: 'Update', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
  probleem: { label: 'Probleem', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
  idee: { label: 'Idee', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
}

export const PRIORITY_CONFIG: Record<ThreadPriority, { label: string; color: string }> = {
  low: { label: 'Laag', color: 'text-muted-foreground' },
  normal: { label: 'Normaal', color: 'text-foreground' },
  high: { label: 'Hoog', color: 'text-amber-600' },
  urgent: { label: 'Urgent', color: 'text-red-600' },
}

export const CATEGORY_CONFIG: Record<ThreadCategory, { label: string }> = {
  algemeen: { label: 'Algemeen' },
  technisch: { label: 'Technisch' },
  planning: { label: 'Planning' },
  financieel: { label: 'Financieel' },
  klant: { label: 'Klant' },
}

export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, { label: string; icon: string }> = {
  mention: { label: 'Genoemd', icon: 'AtSign' },
  reply: { label: 'Reactie', icon: 'MessageSquare' },
  new_thread: { label: 'Nieuw onderwerp', icon: 'MessageCircle' },
  assignment: { label: 'Toegewezen', icon: 'UserPlus' },
}
