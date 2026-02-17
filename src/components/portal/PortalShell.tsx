"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { ToastProvider } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import type { UserRole } from "@/types/database";

// =============================================================================
// Types
// =============================================================================

interface PortalShellProps {
  children: React.ReactNode;
}

interface PortalUserData {
  email: string | null;
  fullName: string | null;
  role: "klant_editor" | "klant_viewer" | null;
  clientName: string | null;
}

interface ProfileData {
  email: string;
  full_name: string | null;
}

// =============================================================================
// Query Client
// =============================================================================

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

// =============================================================================
// Portal Access Check Hook
// =============================================================================

function usePortalAccess() {
  const router = useRouter();
  const [userData, setUserData] = React.useState<PortalUserData>({
    email: null,
    fullName: null,
    role: null,
    clientName: null,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthorized, setIsAuthorized] = React.useState(false);
  const { workspaceId } = useCurrentWorkspace();

  React.useEffect(() => {
    async function checkAccess() {
      if (!workspaceId) {
        setIsLoading(false);
        return;
      }

      const supabase = createClient();

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      // Get user's workspace membership
      const { data: membership, error: membershipError } = await supabase
        .from("workspace_members")
        .select(
          `
          role,
          profile:profiles (
            email,
            full_name
          )
        `
        )
        .eq("profile_id", user.id)
        .eq("workspace_id", workspaceId)
        .single();

      if (membershipError || !membership) {
        // User is not a member of this workspace
        router.push("/login");
        return;
      }

      const role = membership.role as UserRole;

      // Handle profile data - Supabase returns either an object or array depending on the relation
      const profileData = membership.profile as ProfileData | ProfileData[] | null;
      const profile: ProfileData | null = Array.isArray(profileData)
        ? profileData[0] ?? null
        : profileData;

      if (!profile) {
        router.push("/login");
        return;
      }

      // Check if user has portal access (klant_editor or klant_viewer)
      if (role !== "klant_editor" && role !== "klant_viewer") {
        // Non-portal users should use the regular app
        router.push("/dashboard");
        return;
      }

      // Get client name from client_contacts based on user email
      let clientName: string | null = null;

      const { data: clientContact } = await supabase
        .from("client_contacts")
        .select(
          `
          client:clients (
            name
          )
        `
        )
        .eq("email", profile.email)
        .single();

      if (clientContact?.client) {
        const clientData = clientContact.client as { name: string } | { name: string }[];
        clientName = Array.isArray(clientData) ? clientData[0]?.name ?? null : clientData.name;
      }

      setUserData({
        email: profile.email,
        fullName: profile.full_name,
        role: role as "klant_editor" | "klant_viewer",
        clientName,
      });
      setIsAuthorized(true);
      setIsLoading(false);
    }

    checkAccess();
  }, [router, workspaceId]);

  return { userData, isLoading, isAuthorized };
}

// =============================================================================
// Layout Content Component
// =============================================================================

function PortalLayoutContent({ children }: PortalShellProps) {
  const { userData, isLoading, isAuthorized } = usePortalAccess();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-800 dark:border-zinc-700 dark:border-t-zinc-200" />
          <p className="text-sm text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  // If not authorized, the hook will redirect
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <PortalHeader
        userEmail={userData.email}
        userName={userData.fullName}
        clientName={userData.clientName}
        userRole={userData.role}
      />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
          {children}
        </div>
      </main>
      <footer className="glass border-t border-zinc-200 px-3 py-3 sm:px-4 sm:py-4 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl text-center text-xs text-muted-foreground">
          <p>VEHA Klantportaal - Projecten en voortgang</p>
        </div>
      </footer>
    </div>
  );
}

// =============================================================================
// Exported Shell with Query Provider
// =============================================================================

export function PortalShell({ children }: PortalShellProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <PortalLayoutContent>{children}</PortalLayoutContent>
      </ToastProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
