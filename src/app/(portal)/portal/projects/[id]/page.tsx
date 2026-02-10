"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { usePortalProject, usePortalUser } from "@/queries/portal";
import {
  PortalProjectView,
  PortalProjectViewSkeleton,
} from "@/components/portal/PortalProjectView";
import { QueryError } from "@/components/ui/error-boundary";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

// =============================================================================
// Not Found Component
// =============================================================================

function ProjectNotFound() {
  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/portal" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Terug naar overzicht
          </Link>
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-4 rounded-full bg-zinc-200 p-4 dark:bg-zinc-700">
          <AlertCircle className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
        </div>
        <h2 className="mb-2 text-lg font-medium">Project niet gevonden</h2>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          Dit project bestaat niet of u heeft geen toegang tot dit project.
        </p>
        <Button asChild>
          <Link href="/portal">Terug naar overzicht</Link>
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function PortalProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { data: portalUser, isLoading: isUserLoading } = usePortalUser();
  const {
    data: project,
    isLoading: isProjectLoading,
    error,
    refetch,
  } = usePortalProject(projectId);

  const isLoading = isUserLoading || isProjectLoading;

  // Redirect if user doesn't have access
  React.useEffect(() => {
    if (!isUserLoading && !portalUser) {
      router.push("/login");
    }
  }, [isUserLoading, portalUser, router]);

  // Show loading state
  if (isLoading) {
    return <PortalProjectViewSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/portal" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Terug naar overzicht
            </Link>
          </Button>
        </div>
        <QueryError error={error as Error} onRetry={() => refetch()} />
      </div>
    );
  }

  // Show not found if project or user is null
  if (!project || !portalUser) {
    return <ProjectNotFound />;
  }

  return (
    <PortalProjectView
      project={project}
      userRole={portalUser.role}
      userId={portalUser.id}
    />
  );
}
