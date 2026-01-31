import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useWorkspaceStore } from "@/stores/workspace-store"
import type { Client as DbClient, ClientContact as DbContact, ClientLocation as DbLocation, Project } from "@/types/database"
import type { Client, ClientContact, ClientLocation, ClientProject } from "@/types/clients"

// =============================================================================
// Query Keys
// =============================================================================

export const clientKeys = {
  all: ["clients"] as const,
  lists: () => [...clientKeys.all, "list"] as const,
  list: (workspaceId: string) => [...clientKeys.lists(), workspaceId] as const,
  details: () => [...clientKeys.all, "detail"] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
}

export const contactKeys = {
  all: ["contacts"] as const,
  byClient: (clientId: string) => [...contactKeys.all, "client", clientId] as const,
}

export const locationKeys = {
  all: ["locations"] as const,
  byClient: (clientId: string) => [...locationKeys.all, "client", clientId] as const,
}

// =============================================================================
// Types
// =============================================================================

export interface CreateClientInput {
  name: string
  address?: string
  city?: string
  postal_code?: string
  phone?: string
  email?: string
  notes?: string
  is_active?: boolean
}

export interface UpdateClientInput extends Partial<CreateClientInput> {
  id: string
}

export interface CreateContactInput {
  client_id: string
  name: string
  role?: string
  phone?: string
  email?: string
  is_primary?: boolean
}

export interface UpdateContactInput extends Partial<Omit<CreateContactInput, "client_id">> {
  id: string
}

export interface CreateLocationInput {
  client_id: string
  name: string
  address?: string
  city?: string
  postal_code?: string
  is_primary?: boolean
}

export interface UpdateLocationInput extends Partial<Omit<CreateLocationInput, "client_id">> {
  id: string
}

// =============================================================================
// Transform Functions
// =============================================================================

function transformProject(project: Project): ClientProject {
  return {
    id: project.id,
    name: project.name,
    status: project.status,
    progress: project.progress,
    start_date: project.start_date,
    end_date: project.end_date,
  }
}

function transformContact(contact: DbContact): ClientContact {
  return {
    id: contact.id,
    name: contact.name,
    role: contact.role ?? undefined,
    phone: contact.phone ?? undefined,
    email: contact.email ?? undefined,
    is_primary: contact.is_primary,
  }
}

function transformLocation(location: DbLocation): ClientLocation {
  return {
    id: location.id,
    name: location.name,
    address: location.address ?? undefined,
    city: location.city ?? undefined,
    postal_code: location.postal_code ?? undefined,
    is_primary: location.is_primary,
  }
}

interface DbClientWithRelations extends DbClient {
  client_contacts: DbContact[]
  client_locations: DbLocation[]
  projects: Project[]
}

function transformClient(dbClient: DbClientWithRelations): Client {
  return {
    id: dbClient.id,
    name: dbClient.name,
    address: dbClient.address ?? undefined,
    city: dbClient.city ?? undefined,
    postal_code: dbClient.postal_code ?? undefined,
    phone: dbClient.phone ?? undefined,
    email: dbClient.email ?? undefined,
    notes: dbClient.notes ?? undefined,
    is_active: dbClient.is_active,
    contacts: (dbClient.client_contacts || []).map(transformContact),
    locations: (dbClient.client_locations || []).map(transformLocation),
    projects: (dbClient.projects || []).map(transformProject),
  }
}

// =============================================================================
// Fetch Functions
// =============================================================================

async function fetchClients(workspaceId: string): Promise<Client[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("clients")
    .select(`
      *,
      client_contacts (*),
      client_locations (*),
      projects (*)
    `)
    .eq("workspace_id", workspaceId)
    .order("name", { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch clients: ${error.message}`)
  }

  return (data || []).map((client) => transformClient(client as DbClientWithRelations))
}

async function fetchClient(clientId: string): Promise<Client> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("clients")
    .select(`
      *,
      client_contacts (*),
      client_locations (*),
      projects (*)
    `)
    .eq("id", clientId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch client: ${error.message}`)
  }

  return transformClient(data as DbClientWithRelations)
}

// =============================================================================
// Client Hooks
// =============================================================================

export function useClients(
  options?: Omit<UseQueryOptions<Client[], Error>, "queryKey" | "queryFn">
) {
  const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId)

  return useQuery({
    queryKey: clientKeys.list(workspaceId || ""),
    queryFn: () => fetchClients(workspaceId!),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes - client data is relatively stable
    ...options,
  })
}

export function useClient(
  clientId: string,
  options?: Omit<UseQueryOptions<Client, Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: clientKeys.detail(clientId),
    queryFn: () => fetchClient(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes - client data is relatively stable
    ...options,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId)

  return useMutation({
    mutationFn: async (input: CreateClientInput) => {
      if (!workspaceId) {
        throw new Error("No workspace selected")
      }

      const supabase = createClient()

      const { data, error } = await supabase
        .from("clients")
        .insert({
          workspace_id: workspaceId,
          name: input.name,
          address: input.address || null,
          city: input.city || null,
          postal_code: input.postal_code || null,
          phone: input.phone || null,
          email: input.email || null,
          notes: input.notes || null,
          is_active: input.is_active ?? true,
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create client: ${error.message}`)
      }

      return data
    },
    onMutate: async (newClient) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: clientKeys.list(workspaceId || "") })

      // Snapshot the previous value
      const previousClients = queryClient.getQueryData<Client[]>(
        clientKeys.list(workspaceId || "")
      )

      // Optimistically update to the new value
      if (previousClients) {
        const optimisticClient: Client = {
          id: `temp-${Date.now()}`,
          name: newClient.name,
          address: newClient.address,
          city: newClient.city,
          postal_code: newClient.postal_code,
          phone: newClient.phone,
          email: newClient.email,
          notes: newClient.notes,
          is_active: newClient.is_active ?? true,
          contacts: [],
          locations: [],
          projects: [],
        }

        queryClient.setQueryData<Client[]>(clientKeys.list(workspaceId || ""), [
          ...previousClients,
          optimisticClient,
        ])
      }

      return { previousClients }
    },
    onError: (_error, _newClient, context) => {
      // Rollback on error
      if (context?.previousClients) {
        queryClient.setQueryData(
          clientKeys.list(workspaceId || ""),
          context.previousClients
        )
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: clientKeys.list(workspaceId || "") })
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId)

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateClientInput) => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("clients")
        .update({
          name: input.name,
          address: input.address,
          city: input.city,
          postal_code: input.postal_code,
          phone: input.phone,
          email: input.email,
          notes: input.notes,
          is_active: input.is_active,
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update client: ${error.message}`)
      }

      return data
    },
    onMutate: async (updatedClient) => {
      await queryClient.cancelQueries({ queryKey: clientKeys.list(workspaceId || "") })

      const previousClients = queryClient.getQueryData<Client[]>(
        clientKeys.list(workspaceId || "")
      )

      if (previousClients) {
        queryClient.setQueryData<Client[]>(
          clientKeys.list(workspaceId || ""),
          previousClients.map((client) =>
            client.id === updatedClient.id
              ? { ...client, ...updatedClient }
              : client
          )
        )
      }

      return { previousClients }
    },
    onError: (_error, _updatedClient, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(
          clientKeys.list(workspaceId || ""),
          context.previousClients
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.list(workspaceId || "") })
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId)

  return useMutation({
    mutationFn: async (clientId: string) => {
      const supabase = createClient()

      const { error } = await supabase.from("clients").delete().eq("id", clientId)

      if (error) {
        throw new Error(`Failed to delete client: ${error.message}`)
      }

      return clientId
    },
    onMutate: async (clientId) => {
      await queryClient.cancelQueries({ queryKey: clientKeys.list(workspaceId || "") })

      const previousClients = queryClient.getQueryData<Client[]>(
        clientKeys.list(workspaceId || "")
      )

      if (previousClients) {
        queryClient.setQueryData<Client[]>(
          clientKeys.list(workspaceId || ""),
          previousClients.filter((client) => client.id !== clientId)
        )
      }

      return { previousClients }
    },
    onError: (_error, _clientId, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(
          clientKeys.list(workspaceId || ""),
          context.previousClients
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.list(workspaceId || "") })
    },
  })
}

// =============================================================================
// Contact Hooks
// =============================================================================

export function useCreateContact() {
  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId)

  return useMutation({
    mutationFn: async (input: CreateContactInput) => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("client_contacts")
        .insert({
          client_id: input.client_id,
          name: input.name,
          role: input.role || null,
          phone: input.phone || null,
          email: input.email || null,
          is_primary: input.is_primary ?? false,
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create contact: ${error.message}`)
      }

      return data
    },
    onMutate: async (newContact) => {
      await queryClient.cancelQueries({ queryKey: clientKeys.list(workspaceId || "") })

      const previousClients = queryClient.getQueryData<Client[]>(
        clientKeys.list(workspaceId || "")
      )

      if (previousClients) {
        const optimisticContact: ClientContact = {
          id: `temp-${Date.now()}`,
          name: newContact.name,
          role: newContact.role,
          phone: newContact.phone,
          email: newContact.email,
          is_primary: newContact.is_primary ?? false,
        }

        queryClient.setQueryData<Client[]>(
          clientKeys.list(workspaceId || ""),
          previousClients.map((client) =>
            client.id === newContact.client_id
              ? { ...client, contacts: [...client.contacts, optimisticContact] }
              : client
          )
        )
      }

      return { previousClients }
    },
    onError: (_error, _newContact, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(
          clientKeys.list(workspaceId || ""),
          context.previousClients
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.list(workspaceId || "") })
    },
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId)

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateContactInput) => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("client_contacts")
        .update({
          name: input.name,
          role: input.role,
          phone: input.phone,
          email: input.email,
          is_primary: input.is_primary,
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update contact: ${error.message}`)
      }

      return data
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.list(workspaceId || "") })
    },
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId)

  return useMutation({
    mutationFn: async (contactId: string) => {
      const supabase = createClient()

      const { error } = await supabase.from("client_contacts").delete().eq("id", contactId)

      if (error) {
        throw new Error(`Failed to delete contact: ${error.message}`)
      }

      return contactId
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.list(workspaceId || "") })
    },
  })
}

// =============================================================================
// Location Hooks
// =============================================================================

export function useCreateLocation() {
  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId)

  return useMutation({
    mutationFn: async (input: CreateLocationInput) => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("client_locations")
        .insert({
          client_id: input.client_id,
          name: input.name,
          address: input.address || null,
          city: input.city || null,
          postal_code: input.postal_code || null,
          is_primary: input.is_primary ?? false,
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create location: ${error.message}`)
      }

      return data
    },
    onMutate: async (newLocation) => {
      await queryClient.cancelQueries({ queryKey: clientKeys.list(workspaceId || "") })

      const previousClients = queryClient.getQueryData<Client[]>(
        clientKeys.list(workspaceId || "")
      )

      if (previousClients) {
        const optimisticLocation: ClientLocation = {
          id: `temp-${Date.now()}`,
          name: newLocation.name,
          address: newLocation.address,
          city: newLocation.city,
          postal_code: newLocation.postal_code,
          is_primary: newLocation.is_primary ?? false,
        }

        queryClient.setQueryData<Client[]>(
          clientKeys.list(workspaceId || ""),
          previousClients.map((client) =>
            client.id === newLocation.client_id
              ? { ...client, locations: [...client.locations, optimisticLocation] }
              : client
          )
        )
      }

      return { previousClients }
    },
    onError: (_error, _newLocation, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(
          clientKeys.list(workspaceId || ""),
          context.previousClients
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.list(workspaceId || "") })
    },
  })
}

export function useUpdateLocation() {
  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId)

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateLocationInput) => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("client_locations")
        .update({
          name: input.name,
          address: input.address,
          city: input.city,
          postal_code: input.postal_code,
          is_primary: input.is_primary,
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update location: ${error.message}`)
      }

      return data
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.list(workspaceId || "") })
    },
  })
}

export function useDeleteLocation() {
  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId)

  return useMutation({
    mutationFn: async (locationId: string) => {
      const supabase = createClient()

      const { error } = await supabase.from("client_locations").delete().eq("id", locationId)

      if (error) {
        throw new Error(`Failed to delete location: ${error.message}`)
      }

      return locationId
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.list(workspaceId || "") })
    },
  })
}
