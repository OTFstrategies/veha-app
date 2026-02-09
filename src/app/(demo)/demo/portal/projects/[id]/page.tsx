"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoProjectView } from "@/components/demo/DemoProjectView";
import { DEMO_PROJECT_DETAILS } from "@/lib/demo-data";

// =============================================================================
// Not Found
// =============================================================================

function ProjectNotFound() {
  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/demo/portal" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Terug naar overzicht
          </Link>
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-4 rounded-full bg-amber-100 p-4 dark:bg-amber-900/30">
          <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="mb-2 text-lg font-medium">Project niet gevonden</h2>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          Dit demo project bestaat niet. Probeer een van de projecten uit het overzicht.
        </p>
        <Button asChild>
          <Link href="/demo/portal">Terug naar overzicht</Link>
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// Page
// =============================================================================

export default function DemoProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const project = DEMO_PROJECT_DETAILS[projectId];

  if (!project) {
    return <ProjectNotFound />;
  }

  return <DemoProjectView project={project} />;
}
