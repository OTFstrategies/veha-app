"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Workspace, UserRole } from "@/types/database";

interface WorkspaceWithRole extends Workspace {
  role: UserRole;
}

// Query key constants for consistency
export const WORKSPACE_QUERY_KEYS = {
  all: ["workspaces"] as const,
  members: (workspaceId: string | null) =>
    ["workspace-members", workspaceId] as const,
};

export function useWorkspaces() {
  const supabase = createClient();

  return useQuery({
    queryKey: WORKSPACE_QUERY_KEYS.all,
    queryFn: async (): Promise<WorkspaceWithRole[]> => {
      const { data: memberships, error } = await supabase
        .from("workspace_members")
        .select(
          `
          role,
          workspace:workspaces (
            id,
            name,
            slug,
            created_at,
            updated_at
          )
        `
        );

      if (error) throw error;

      return memberships.map((m) => ({
        ...(m.workspace as unknown as Workspace),
        role: m.role as UserRole,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  });
}

export function useCurrentWorkspace() {
  const { currentWorkspaceId, setCurrentWorkspace } = useWorkspaceStore();
  const { data: workspaces, isLoading } = useWorkspaces();

  const currentWorkspace = workspaces?.find(
    (w) => w.id === currentWorkspaceId
  );

  // Validate and auto-select workspace
  useEffect(() => {
    if (isLoading || !workspaces || workspaces.length === 0) return;

    const validIds = workspaces.map((w) => w.id);

    // Check of stored workspace nog bestaat in Hub
    if (currentWorkspaceId && !validIds.includes(currentWorkspaceId)) {
      console.warn("[VEHA] Stored workspace not found in Hub, resetting to first workspace");
      setCurrentWorkspace(workspaces[0].id);
      return;
    }

    // Auto-select first workspace als geen geselecteerd
    if (!currentWorkspaceId) {
      setCurrentWorkspace(workspaces[0].id);
    }
  }, [isLoading, workspaces, currentWorkspaceId, setCurrentWorkspace]);

  // Return the actual workspace ID (either current or first available)
  const effectiveWorkspaceId =
    currentWorkspaceId && currentWorkspace
      ? currentWorkspaceId
      : (workspaces?.[0]?.id ?? null);

  return {
    workspace: currentWorkspace ?? workspaces?.[0] ?? null,
    workspaceId: effectiveWorkspaceId,
    workspaces: workspaces ?? [],
    isLoading,
    setWorkspace: setCurrentWorkspace,
    hasWorkspaces: (workspaces?.length ?? 0) > 0,
  };
}

export function useWorkspaceRole() {
  const { workspace } = useCurrentWorkspace();
  return workspace?.role ?? null;
}

export function useIsWorkspaceAdmin() {
  const role = useWorkspaceRole();
  return role === "admin";
}

export function useCreateWorkspace() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { setCurrentWorkspace } = useWorkspaceStore();

  return useMutation({
    mutationFn: async ({ name, slug }: { name: string; slug: string }) => {
      // Create workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .insert({ name, slug })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Add current user as admin
      const { error: memberError } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: workspace.id,
          profile_id: user.id,
          role: "admin" as UserRole,
        });

      if (memberError) throw memberError;

      return workspace;
    },
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEYS.all });
      setCurrentWorkspace(workspace.id);
    },
  });
}

export function useInviteToWorkspace() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { workspaceId } = useCurrentWorkspace();

  return useMutation({
    mutationFn: async ({
      email,
      role,
    }: {
      email: string;
      role: UserRole;
    }) => {
      if (!workspaceId) throw new Error("No workspace selected");

      // First, find the profile by email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (profileError) {
        throw new Error(
          profileError.code === "PGRST116"
            ? "User not found with this email address"
            : "Error finding user"
        );
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from("workspace_members")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("profile_id", profile.id)
        .single();

      if (existingMember) {
        throw new Error("User is already a member of this workspace");
      }

      // Add as workspace member
      const { error } = await supabase.from("workspace_members").insert({
        workspace_id: workspaceId,
        profile_id: profile.id,
        role,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: WORKSPACE_QUERY_KEYS.members(workspaceId),
      });
    },
  });
}

export function useWorkspaceMembers() {
  const supabase = createClient();
  const { workspaceId } = useCurrentWorkspace();

  return useQuery({
    queryKey: WORKSPACE_QUERY_KEYS.members(workspaceId),
    queryFn: async () => {
      if (!workspaceId) return [];

      const { data, error } = await supabase
        .from("workspace_members")
        .select(
          `
          id,
          role,
          created_at,
          profile:profiles (
            id,
            email,
            full_name,
            avatar_url
          )
        `
        )
        .eq("workspace_id", workspaceId);

      if (error) throw error;
      return data;
    },
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useRemoveWorkspaceMember() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { workspaceId } = useCurrentWorkspace();

  return useMutation({
    mutationFn: async (memberId: string) => {
      if (!workspaceId) throw new Error("No workspace selected");

      const { error } = await supabase
        .from("workspace_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: WORKSPACE_QUERY_KEYS.members(workspaceId),
      });
    },
  });
}
