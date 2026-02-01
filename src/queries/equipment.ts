import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { Equipment } from "@/types/database"

// =============================================================================
// Query Keys
// =============================================================================

export const equipmentKeys = {
  all: ["equipment"] as const,
  lists: () => [...equipmentKeys.all, "list"] as const,
  list: (workspaceId: string) => [...equipmentKeys.lists(), workspaceId] as const,
  details: () => [...equipmentKeys.all, "detail"] as const,
  detail: (id: string) => [...equipmentKeys.details(), id] as const,
}

// =============================================================================
// Types
// =============================================================================

export interface CreateEquipmentInput {
  workspace_id: string
  name: string
  equipment_type: Equipment["equipment_type"]
  license_plate?: string
  daily_rate?: number
  daily_capacity_hours?: number
  notes?: string
}

export interface UpdateEquipmentInput {
  name?: string
  equipment_type?: Equipment["equipment_type"]
  license_plate?: string
  daily_rate?: number
  daily_capacity_hours?: number
  status?: Equipment["status"]
  notes?: string
  is_active?: boolean
}

// =============================================================================
// Query Hooks
// =============================================================================

export function useEquipment(workspaceId: string | null) {
  return useQuery({
    queryKey: equipmentKeys.list(workspaceId || ""),
    queryFn: async () => {
      if (!workspaceId) return []
      const supabase = createClient()
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("is_active", true)
        .order("name")

      if (error) throw new Error(`Failed to fetch equipment: ${error.message}`)
      return data as Equipment[]
    },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useEquipmentItem(id: string | null) {
  return useQuery({
    queryKey: equipmentKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) return null
      const supabase = createClient()
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("id", id)
        .single()

      if (error) throw new Error(`Failed to fetch equipment item: ${error.message}`)
      return data as Equipment
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// =============================================================================
// Mutation Hooks
// =============================================================================

export function useCreateEquipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateEquipmentInput) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("equipment")
        .insert({
          workspace_id: input.workspace_id,
          name: input.name,
          equipment_type: input.equipment_type,
          license_plate: input.license_plate || null,
          daily_rate: input.daily_rate || 0,
          daily_capacity_hours: input.daily_capacity_hours || 8,
          notes: input.notes || null,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw new Error(`Failed to create equipment: ${error.message}`)
      return data as Equipment
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.list(variables.workspace_id) })
    },
  })
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateEquipmentInput & { id: string }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("equipment")
        .update(input)
        .eq("id", id)
        .select()
        .single()

      if (error) throw new Error(`Failed to update equipment: ${error.message}`)
      return data as Equipment
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() })
    },
  })
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      // Soft delete
      const { error } = await supabase
        .from("equipment")
        .update({ is_active: false })
        .eq("id", id)

      if (error) throw new Error(`Failed to delete equipment: ${error.message}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.all })
    },
  })
}
