"use client";

import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspaces, useCurrentWorkspace } from "@/hooks/use-workspace";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkspaceSelectorProps {
  collapsed?: boolean;
}

export function WorkspaceSelector({ collapsed = false }: WorkspaceSelectorProps) {
  const { data: workspaces, isLoading } = useWorkspaces();
  const { workspace: currentWorkspace, setWorkspace } = useCurrentWorkspace();

  if (isLoading) {
    return (
      <div className={cn("px-2", collapsed && "px-1")} role="status" aria-label="Workspace laden...">
        <Skeleton className={cn("h-10 w-full", collapsed && "h-10 w-10")} />
      </div>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return null;
  }

  return (
    <div className={cn("px-2", collapsed && "px-1")}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 font-normal",
              collapsed && "w-10 justify-center px-0"
            )}
            title={collapsed ? currentWorkspace?.name : undefined}
          >
            <Building2 className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
            {!collapsed && (
              <>
                <span className="flex-1 truncate text-left">
                  {currentWorkspace?.name ?? "Selecteer workspace"}
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => setWorkspace(ws.id)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                <span className="truncate">{ws.name}</span>
              </div>
              {ws.id === currentWorkspace?.id && (
                <Check className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-zinc-500 cursor-not-allowed opacity-50"
            disabled
            aria-label="Nieuwe workspace aanmaken (binnenkort beschikbaar)"
          >
            <Plus className="h-4 w-4" />
            <span>Nieuwe workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
