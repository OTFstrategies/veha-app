'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useCurrentWorkspace } from '@/hooks/use-workspace'
import type {
  Thread,
  ThreadMessage,
  ThreadAttachment,
  ThreadEntityType,
  ThreadStatusTag,
  ThreadPriority,
  ThreadCategory,
} from '@/types/threads'

// =============================================================================
// Query Keys
// =============================================================================

export const threadKeys = {
  all: ['threads'] as const,
  entity: (entityType: ThreadEntityType, entityId: string) =>
    [...threadKeys.all, entityType, entityId] as const,
  detail: (threadId: string) => [...threadKeys.all, 'detail', threadId] as const,
  messages: (threadId: string) => [...threadKeys.all, 'messages', threadId] as const,
}

// =============================================================================
// Threads for Entity
// =============================================================================

export function useThreads(entityType: ThreadEntityType, entityId: string | null) {
  const supabase = createClient()
  const { workspaceId } = useCurrentWorkspace()

  return useQuery({
    queryKey: threadKeys.entity(entityType, entityId ?? ''),
    queryFn: async (): Promise<Thread[]> => {
      if (!workspaceId || !entityId) return []

      const { data, error } = await supabase
        .from('threads')
        .select(`
          id,
          workspace_id,
          entity_type,
          entity_id,
          title,
          created_by,
          is_resolved,
          created_at,
          updated_at,
          creator:profiles!threads_created_by_fkey (
            full_name,
            email
          ),
          thread_messages (
            id,
            created_at
          )
        `)
        .eq('workspace_id', workspaceId)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('updated_at', { ascending: false })

      if (error) throw error

      return (data ?? []).map((thread): Thread => {
        const creatorData = thread.creator as
          | { full_name: string | null; email: string }
          | { full_name: string | null; email: string }[]
          | null
        const creator = Array.isArray(creatorData) ? creatorData[0] : creatorData

        const messages = thread.thread_messages as { id: string; created_at: string }[]
        const sortedMessages = [...(messages ?? [])].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

        return {
          id: thread.id,
          workspaceId: thread.workspace_id,
          entityType: thread.entity_type as ThreadEntityType,
          entityId: thread.entity_id,
          title: thread.title,
          createdBy: thread.created_by,
          creatorName: creator?.full_name ?? 'Onbekend',
          creatorEmail: creator?.email ?? '',
          isResolved: thread.is_resolved,
          messageCount: messages?.length ?? 0,
          lastMessageAt: sortedMessages[0]?.created_at ?? null,
          createdAt: thread.created_at,
          updatedAt: thread.updated_at,
        }
      })
    },
    enabled: !!workspaceId && !!entityId,
    staleTime: 1000 * 60 * 2,
  })
}

// =============================================================================
// Thread Messages
// =============================================================================

export function useThreadMessages(threadId: string | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: threadKeys.messages(threadId ?? ''),
    queryFn: async (): Promise<ThreadMessage[]> => {
      if (!threadId) return []

      const { data, error } = await supabase
        .from('thread_messages')
        .select(`
          id,
          thread_id,
          author_id,
          content,
          status_tag,
          priority,
          category,
          mentions,
          is_edited,
          created_at,
          updated_at,
          author:profiles!thread_messages_author_id_fkey (
            full_name,
            email
          ),
          thread_attachments (
            id,
            file_name,
            file_size,
            file_type,
            storage_path,
            created_at
          )
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Resolve mention names
      const allMentionIds = new Set<string>()
      ;(data ?? []).forEach((msg) => {
        ;(msg.mentions as string[] ?? []).forEach((id) => allMentionIds.add(id))
      })

      const mentionNamesMap = new Map<string, string>()
      if (allMentionIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', Array.from(allMentionIds))

        profiles?.forEach((p) => {
          mentionNamesMap.set(p.id, p.full_name ?? 'Onbekend')
        })
      }

      return (data ?? []).map((msg): ThreadMessage => {
        const authorData = msg.author as
          | { full_name: string | null; email: string }
          | { full_name: string | null; email: string }[]
          | null
        const author = Array.isArray(authorData) ? authorData[0] : authorData

        const attachments = (msg.thread_attachments as Array<{
          id: string
          file_name: string
          file_size: number
          file_type: string
          storage_path: string
          created_at: string
        }>) ?? []

        const mentions = (msg.mentions as string[]) ?? []

        return {
          id: msg.id,
          threadId: msg.thread_id,
          authorId: msg.author_id,
          authorName: author?.full_name ?? 'Onbekend',
          authorEmail: author?.email ?? '',
          content: msg.content,
          statusTag: msg.status_tag as ThreadStatusTag | null,
          priority: msg.priority as ThreadPriority,
          category: msg.category as ThreadCategory,
          mentions,
          mentionNames: mentions.map((id) => mentionNamesMap.get(id) ?? 'Onbekend'),
          isEdited: msg.is_edited,
          attachments: attachments.map((a): ThreadAttachment => ({
            id: a.id,
            messageId: msg.id,
            fileName: a.file_name,
            fileSize: a.file_size,
            fileType: a.file_type,
            storagePath: a.storage_path,
            createdAt: a.created_at,
          })),
          createdAt: msg.created_at,
          updatedAt: msg.updated_at,
        }
      })
    },
    enabled: !!threadId,
    staleTime: 1000 * 30,
  })
}

// =============================================================================
// Create Thread
// =============================================================================

interface CreateThreadInput {
  entityType: ThreadEntityType
  entityId: string
  title: string
  firstMessage: string
  statusTag?: ThreadStatusTag
  priority?: ThreadPriority
  category?: ThreadCategory
  mentions?: string[]
}

export function useCreateThread() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  const { workspaceId } = useCurrentWorkspace()

  return useMutation({
    mutationFn: async (input: CreateThreadInput) => {
      if (!workspaceId) throw new Error('Geen workspace geselecteerd')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Niet ingelogd')

      // Create thread
      const { data: thread, error: threadError } = await supabase
        .from('threads')
        .insert({
          workspace_id: workspaceId,
          entity_type: input.entityType,
          entity_id: input.entityId,
          title: input.title,
          created_by: user.id,
        })
        .select('id')
        .single()

      if (threadError) throw threadError

      // Create first message
      const { error: msgError } = await supabase
        .from('thread_messages')
        .insert({
          thread_id: thread.id,
          author_id: user.id,
          content: input.firstMessage,
          status_tag: input.statusTag ?? null,
          priority: input.priority ?? 'normal',
          category: input.category ?? 'algemeen',
          mentions: input.mentions ?? [],
        })

      if (msgError) throw msgError

      return thread
    },
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({
        queryKey: threadKeys.entity(input.entityType, input.entityId),
      })
    },
  })
}

// =============================================================================
// Add Message
// =============================================================================

interface AddMessageInput {
  threadId: string
  content: string
  statusTag?: ThreadStatusTag
  priority?: ThreadPriority
  category?: ThreadCategory
  mentions?: string[]
  entityType: ThreadEntityType
  entityId: string
}

export function useAddMessage() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (input: AddMessageInput) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Niet ingelogd')

      const { data, error } = await supabase
        .from('thread_messages')
        .insert({
          thread_id: input.threadId,
          author_id: user.id,
          content: input.content,
          status_tag: input.statusTag ?? null,
          priority: input.priority ?? 'normal',
          category: input.category ?? 'algemeen',
          mentions: input.mentions ?? [],
        })
        .select('id')
        .single()

      if (error) throw error

      // Update thread's updated_at
      await supabase
        .from('threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', input.threadId)

      return data
    },
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: threadKeys.messages(input.threadId) })
      queryClient.invalidateQueries({
        queryKey: threadKeys.entity(input.entityType, input.entityId),
      })
    },
  })
}

// =============================================================================
// Update Message
// =============================================================================

export function useUpdateMessage() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      messageId,
      content,
      threadId,
    }: {
      messageId: string
      content: string
      threadId: string
    }) => {
      const { error } = await supabase
        .from('thread_messages')
        .update({ content, is_edited: true })
        .eq('id', messageId)

      if (error) throw error
      return { threadId }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: threadKeys.messages(result.threadId) })
    },
  })
}

// =============================================================================
// Delete Message
// =============================================================================

export function useDeleteMessage() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      messageId,
      threadId,
      entityType,
      entityId,
    }: {
      messageId: string
      threadId: string
      entityType: ThreadEntityType
      entityId: string
    }) => {
      const { error } = await supabase
        .from('thread_messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error
      return { threadId, entityType, entityId }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: threadKeys.messages(result.threadId) })
      queryClient.invalidateQueries({
        queryKey: threadKeys.entity(result.entityType, result.entityId),
      })
    },
  })
}

// =============================================================================
// Resolve Thread
// =============================================================================

export function useResolveThread() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      threadId,
      isResolved,
      entityType,
      entityId,
    }: {
      threadId: string
      isResolved: boolean
      entityType: ThreadEntityType
      entityId: string
    }) => {
      const { error } = await supabase
        .from('threads')
        .update({ is_resolved: isResolved })
        .eq('id', threadId)

      if (error) throw error
      return { entityType, entityId }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: threadKeys.entity(result.entityType, result.entityId),
      })
    },
  })
}
