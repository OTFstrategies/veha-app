import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { Material, CreateMaterialInput, UpdateMaterialInput } from "@/types/resources"

// =============================================================================
// Query Keys
// =============================================================================

export const materialKeys = {
  all: ["materials"] as const,
  lists: () => [...materialKeys.all, "list"] as const,
  list: (workspaceId: string) => [...materialKeys.lists(), workspaceId] as const,
  details: () => [...materialKeys.all, "detail"] as const,
  detail: (id: string) => [...materialKeys.details(), id] as const,
}

// =============================================================================
// Query Hooks
// =============================================================================

export function useMaterials(workspaceId: string | null) {
  return useQuery({
    queryKey: materialKeys.list(workspaceId || ""),
    queryFn: async () => {
      if (!workspaceId) return []
      const supabase = createClient()
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("is_active", true)
        .order("name")

      if (error) throw new Error(`Failed to fetch materials: ${error.message}`)
      return data as Material[]
    },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useMaterial(id: string | null) {
  return useQuery({
    queryKey: materialKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) return null
      const supabase = createClient()
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .eq("id", id)
        .single()

      if (error) throw new Error(`Failed to fetch material: ${error.message}`)
      return data as Material
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// =============================================================================
// Mutation Hooks
// =============================================================================

export function useCreateMaterial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateMaterialInput) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("materials")
        .insert(input)
        .select()
        .single()

      if (error) throw new Error(`Failed to create material: ${error.message}`)
      return data as Material
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: materialKeys.list(variables.workspace_id) })
    },
  })
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateMaterialInput & { id: string }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("materials")
        .update(input)
        .eq("id", id)
        .select()
        .single()

      if (error) throw new Error(`Failed to update material: ${error.message}`)
      return data as Material
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: materialKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() })
    },
  })
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      // Soft delete
      const { error } = await supabase
        .from("materials")
        .update({ is_active: false })
        .eq("id", id)

      if (error) throw new Error(`Failed to delete material: ${error.message}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.all })
    },
  })
}
