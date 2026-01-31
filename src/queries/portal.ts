"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import type {
  PortalProject,
  PortalProjectDetail,
  PortalUser,
  PortalTaskSummary,
  ProjectManager,
  ProjectClientNote,
} from "@/types/portal";
import type { UserRole } from "@/types/database";

// =============================================================================
// Query Keys
// =============================================================================

export const portalKeys = {
  all: ["portal"] as const,
  user: () => [...portalKeys.all, "user"] as const,
  projects: (workspaceId: string, clientId: string | null) =>
    [...portalKeys.all, "projects", workspaceId, clientId] as const,
  project: (projectId: string) =>
    [...portalKeys.all, "project", projectId] as const,
  notes: (projectId: string) =>
    [...portalKeys.all, "notes", projectId] as const,
};

// =============================================================================
// Types for Supabase responses
// =============================================================================

interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
}

interface ClientData {
  id: string;
  name: string;
}

// =============================================================================
// Portal User Query
// =============================================================================

export function usePortalUser() {
  const supabase = createClient();
  const { workspaceId } = useCurrentWorkspace();

  return useQuery({
    queryKey: portalKeys.user(),
    queryFn: async (): Promise<PortalUser | null> => {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return null;
      }

      // Get user's workspace membership and role
      const { data: membership, error: membershipError } = await supabase
        .from("workspace_members")
        .select(
          `
          role,
          profile:profiles (
            id,
            email,
            full_name
          )
        `
        )
        .eq("profile_id", user.id)
        .eq("workspace_id", workspaceId ?? "")
        .single();

      if (membershipError || !membership) {
        return null;
      }

      const role = membership.role as UserRole;

      // Only allow client roles
      if (role !== "klant_editor" && role !== "klant_viewer") {
        return null;
      }

      // Handle profile data - Supabase returns either an object or array depending on the relation
      const profileData = membership.profile as ProfileData | ProfileData[] | null;
      const profile: ProfileData | null = Array.isArray(profileData)
        ? profileData[0] ?? null
        : profileData;

      if (!profile) {
        return null;
      }

      // Find the client associated with this user
      // This assumes the user's email matches a client contact email
      // or there's a direct link through client_id in a custom field
      const { data: clientContact, error: clientError } = await supabase
        .from("client_contacts")
        .select(
          `
          client:clients (
            id,
            name
          )
        `
        )
        .eq("email", profile.email)
        .single();

      let clientId: string | null = null;
      let clientName: string | null = null;

      if (!clientError && clientContact?.client) {
        const clientData = clientContact.client as ClientData | ClientData[];
        const client = Array.isArray(clientData) ? clientData[0] : clientData;
        if (client) {
          clientId = client.id;
          clientName = client.name;
        }
      }

      return {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: role as "klant_editor" | "klant_viewer",
        clientId,
        clientName,
      };
    },
    enabled: !!workspaceId,
    staleTime: 10 * 60 * 1000, // 10 minutes - user data rarely changes
  });
}

// =============================================================================
// Helper function to check if user is a portal user
// =============================================================================

export function useIsPortalUser() {
  const { data: user, isLoading } = usePortalUser();
  return {
    isPortalUser: !!user,
    isLoading,
    role: user?.role ?? null,
  };
}

// =============================================================================
// Portal Projects Query
// =============================================================================

export function usePortalProjects() {
  const supabase = createClient();
  const { workspaceId } = useCurrentWorkspace();
  const { data: portalUser } = usePortalUser();

  return useQuery({
    queryKey: portalKeys.projects(workspaceId ?? "", portalUser?.clientId ?? null),
    queryFn: async (): Promise<PortalProject[]> => {
      if (!workspaceId) {
        throw new Error("No workspace selected");
      }

      if (!portalUser?.clientId) {
        return [];
      }

      // Fetch projects for this client
      const { data: projects, error } = await supabase
        .from("projects")
        .select(
          `
          id,
          name,
          description,
          status,
          progress,
          start_date,
          end_date,
          work_type,
          location:client_locations (
            name,
            address,
            city
          ),
          tasks (
            id,
            status
          )
        `
        )
        .eq("workspace_id", workspaceId)
        .eq("client_id", portalUser.clientId)
        .neq("status", "geannuleerd")
        .order("start_date", { ascending: false });

      if (error) throw error;

      // Get unique project manager IDs (employees with projectleider role assigned to tasks)
      const projectIds = (projects ?? []).map((p) => p.id);

      const projectManagersMap = new Map<string, ProjectManager>();

      if (projectIds.length > 0) {
        const { data: assignments } = await supabase
          .from("task_assignments")
          .select(
            `
            task:tasks (
              project_id
            ),
            employee:employees (
              id,
              name,
              email,
              phone,
              role
            )
          `
          )
          .in(
            "task_id",
            (await supabase.from("tasks").select("id").in("project_id", projectIds)).data?.map(
              (t) => t.id
            ) ?? []
          );

        // Find project managers (projectleider) for each project
        for (const assignment of assignments ?? []) {
          const taskData = assignment.task as { project_id: string } | { project_id: string }[] | null;
          const task = Array.isArray(taskData) ? taskData[0] : taskData;
          const employeeData = assignment.employee as {
            id: string;
            name: string;
            email: string | null;
            phone: string | null;
            role: string;
          } | {
            id: string;
            name: string;
            email: string | null;
            phone: string | null;
            role: string;
          }[] | null;
          const employee = Array.isArray(employeeData) ? employeeData[0] : employeeData;

          if (task && employee && employee.role === "projectleider") {
            projectManagersMap.set(task.project_id, {
              id: employee.id,
              name: employee.name,
              email: employee.email,
              phone: employee.phone,
            });
          }
        }
      }

      return (projects ?? []).map((project): PortalProject => {
        const locationData = project.location as {
          name: string;
          address: string | null;
          city: string | null;
        } | {
          name: string;
          address: string | null;
          city: string | null;
        }[] | null;
        const location = Array.isArray(locationData) ? locationData[0] : locationData;

        const tasks = project.tasks as { id: string; status: string }[];
        const completedTaskCount = tasks?.filter((t) => t.status === "done").length ?? 0;

        return {
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          progress: project.progress,
          startDate: project.start_date,
          endDate: project.end_date,
          workType: project.work_type,
          locationName: location?.name ?? null,
          locationAddress: location?.address ?? null,
          locationCity: location?.city ?? null,
          projectManager: projectManagersMap.get(project.id) ?? null,
          taskCount: tasks?.length ?? 0,
          completedTaskCount,
        };
      });
    },
    enabled: !!workspaceId && !!portalUser?.clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes - project status may update
  });
}

// =============================================================================
// Portal Project Detail Query
// =============================================================================

export function usePortalProject(projectId: string) {
  const supabase = createClient();
  const { workspaceId } = useCurrentWorkspace();
  const { data: portalUser } = usePortalUser();

  return useQuery({
    queryKey: portalKeys.project(projectId),
    queryFn: async (): Promise<PortalProjectDetail | null> => {
      if (!workspaceId) {
        throw new Error("No workspace selected");
      }

      if (!portalUser?.clientId) {
        return null;
      }

      // Fetch project with tasks
      const { data: project, error } = await supabase
        .from("projects")
        .select(
          `
          id,
          name,
          description,
          status,
          progress,
          start_date,
          end_date,
          work_type,
          notes,
          budget_hours,
          actual_hours,
          client_id,
          location:client_locations (
            name,
            address,
            city
          ),
          tasks (
            id,
            name,
            status,
            progress,
            start_date,
            end_date,
            is_milestone,
            sort_order
          )
        `
        )
        .eq("id", projectId)
        .eq("workspace_id", workspaceId)
        .eq("client_id", portalUser.clientId)
        .single();

      if (error) throw error;

      if (!project) {
        return null;
      }

      // Get project manager
      let projectManager: ProjectManager | null = null;

      const { data: assignments } = await supabase
        .from("task_assignments")
        .select(
          `
          employee:employees (
            id,
            name,
            email,
            phone,
            role
          )
        `
        )
        .in(
          "task_id",
          (project.tasks as { id: string }[])?.map((t) => t.id) ?? []
        );

      for (const assignment of assignments ?? []) {
        const employeeData = assignment.employee as {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          role: string;
        } | {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          role: string;
        }[] | null;
        const employee = Array.isArray(employeeData) ? employeeData[0] : employeeData;

        if (employee && employee.role === "projectleider") {
          projectManager = {
            id: employee.id,
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
          };
          break;
        }
      }

      const locationData = project.location as {
        name: string;
        address: string | null;
        city: string | null;
      } | {
        name: string;
        address: string | null;
        city: string | null;
      }[] | null;
      const location = Array.isArray(locationData) ? locationData[0] : locationData;

      const tasks = (
        project.tasks as {
          id: string;
          name: string;
          status: string;
          progress: number;
          start_date: string;
          end_date: string;
          is_milestone: boolean;
          sort_order: number;
        }[]
      )
        ?.sort((a, b) => a.sort_order - b.sort_order)
        .map(
          (task): PortalTaskSummary => ({
            id: task.id,
            name: task.name,
            status: task.status as "todo" | "in_progress" | "done",
            progress: task.progress,
            startDate: task.start_date,
            endDate: task.end_date,
            isMilestone: task.is_milestone,
          })
        );

      const completedTaskCount = tasks?.filter((t) => t.status === "done").length ?? 0;

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        progress: project.progress,
        startDate: project.start_date,
        endDate: project.end_date,
        workType: project.work_type,
        locationName: location?.name ?? null,
        locationAddress: location?.address ?? null,
        locationCity: location?.city ?? null,
        projectManager,
        taskCount: tasks?.length ?? 0,
        completedTaskCount,
        tasks: tasks ?? [],
        notes: project.notes,
        budgetHours: project.budget_hours,
        actualHours: project.actual_hours,
      };
    },
    enabled: !!workspaceId && !!portalUser?.clientId && !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes - task status may update
  });
}

// =============================================================================
// Project Notes Query
// =============================================================================

export function useProjectNotes(projectId: string) {
  const supabase = createClient();
  const { workspaceId } = useCurrentWorkspace();

  return useQuery({
    queryKey: portalKeys.notes(projectId),
    queryFn: async (): Promise<ProjectClientNote[]> => {
      const { data, error } = await supabase
        .from("project_client_notes")
        .select(
          `
          id,
          project_id,
          profile_id,
          content,
          created_at,
          updated_at,
          profile:profiles (
            email,
            full_name
          )
        `
        )
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).map((note) => {
        const profileData = note.profile as { email: string; full_name: string | null } | { email: string; full_name: string | null }[] | null;
        const profile = Array.isArray(profileData) ? profileData[0] : profileData;

        return {
          id: note.id,
          projectId: note.project_id,
          profileId: note.profile_id,
          content: note.content,
          createdAt: note.created_at,
          updatedAt: note.updated_at,
          authorName: profile?.full_name ?? null,
          authorEmail: profile?.email ?? null,
        };
      });
    },
    enabled: !!projectId && !!workspaceId,
  });
}

// =============================================================================
// Add Project Note Mutation
// =============================================================================

export function useAddProjectNote() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ projectId, content }: { projectId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Niet ingelogd");
      }

      const { error } = await supabase
        .from("project_client_notes")
        .insert({
          project_id: projectId,
          profile_id: user.id,
          content,
        });

      if (error) throw error;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: portalKeys.notes(projectId) });
    },
  });
}

// =============================================================================
// Delete Project Note Mutation
// =============================================================================

export function useDeleteProjectNote() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ noteId, projectId }: { noteId: string; projectId: string }) => {
      const { error } = await supabase
        .from("project_client_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;

      return { projectId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: portalKeys.notes(result.projectId) });
    },
  });
}
