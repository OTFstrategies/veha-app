"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Workspace, WorkspaceMember, UserRole } from "@/types/database";

interface WorkspaceWithRole extends Workspace {
  role: UserRole;
}

export function useWorkspaces() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async (): Promise<WorkspaceWithRole[]> => {
      const { data: memberships, error } = await supabase
        .from("workspace_members")
        .select(`
          role,
          workspace:workspaces (
            id,
            name,
            slug,
            created_at,
            updated_at
          )
        `);

      if (error) throw error;

      return memberships.map((m) => ({
        ...(m.workspace as unknown as Workspace),
        role: m.role as UserRole,
      }));
    },
  });
}

export function useCurrentWorkspace() {
  const { currentWorkspaceId, setCurrentWorkspace } = useWorkspaceStore();
  const { data: workspaces, isLoading } = useWorkspaces();

  const currentWorkspace = workspaces?.find(
    (w) => w.id === currentWorkspaceId
  );

  // Auto-select first workspace if none selected or current is invalid
  const shouldAutoSelect = !isLoading && workspaces && workspaces.length > 0 && 
    (!currentWorkspaceId || !currentWorkspace);
  
  if (shouldAutoSelect) {
    setCurrentWorkspace(workspaces[0].id);
  }

  // Return the actual workspace ID (either current or first available)
  const effectiveWorkspaceId = currentWorkspaceId && currentWorkspace 
    ? currentWorkspaceId 
    : (workspaces?.[0]?.id ?? null);

  return {
    workspace: currentWorkspace ?? workspaces?.[0],
    workspaceId: effectiveWorkspaceId,
    isLoading,
    setWorkspace: setCurrentWorkspace,
  };
}

export function useWorkspaceRole() {
  const { workspace } = useCurrentWorkspace();
  return workspace?.role ?? null;
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
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
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

      if (profileError) throw new Error("User not found");

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
        queryKey: ["workspace-members", workspaceId],
      });
    },
  });
}

export function useWorkspaceMembers() {
  const supabase = createClient();
  const { workspaceId } = useCurrentWorkspace();

  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];

      const { data, error } = await supabase
        .from("workspace_members")
        .select(`
          id,
          role,
          created_at,
          profile:profiles (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq("workspace_id", workspaceId);

      if (error) throw error;
      return data;
    },
    enabled: !!workspaceId,
  });
}
