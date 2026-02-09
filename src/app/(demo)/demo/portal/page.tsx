"use client";

import * as React from "react";
import Link from "next/link";
import { FolderOpen, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEMO_PROJECTS } from "@/lib/demo-data";
import { DemoProjectCard } from "./DemoProjectCard";
import type { PortalProject } from "@/types/portal";

// =============================================================================
// Constants
// =============================================================================

const STATUS_OPTIONS = [
  { value: "gepland", label: "Gepland" },
  { value: "actief", label: "Actief" },
  { value: "on-hold", label: "On-hold" },
  { value: "afgerond", label: "Afgerond" },
] as const;

// =============================================================================
// Filter Hook (same logic as portal)
// =============================================================================

function useProjectFilters(projects: PortalProject[]) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);

  const filteredProjects = React.useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        searchQuery === "" ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(project.status);

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const toggleStatus = React.useCallback((status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  }, []);

  const clearFilters = React.useCallback(() => {
    setSearchQuery("");
    setStatusFilter([]);
  }, []);

  const hasActiveFilters = searchQuery !== "" || statusFilter.length > 0;

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    toggleStatus,
    filteredProjects,
    hasActiveFilters,
    clearFilters,
  };
}

// =============================================================================
// Page
// =============================================================================

export default function DemoPortalDashboardPage() {
  const projects = DEMO_PROJECTS;
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    toggleStatus,
    filteredProjects,
    hasActiveFilters,
    clearFilters,
  } = useProjectFilters(projects);

  const activeProjects = projects.filter((p) => p.status === "actief").length;
  const completedProjects = projects.filter((p) => p.status === "afgerond").length;
  const plannedProjects = projects.filter((p) => p.status === "gepland").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">Mijn Projecten</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Projecten voor CSU
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-lg glass p-3 sm:p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <div className="h-2 w-2 shrink-0 rounded-full bg-zinc-700 dark:bg-zinc-300" />
            <span className="truncate">Actief</span>
          </div>
          <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">{activeProjects}</p>
        </div>
        <div className="rounded-lg glass p-3 sm:p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <div className="h-2 w-2 shrink-0 rounded-full bg-zinc-400" />
            <span className="truncate">Gepland</span>
          </div>
          <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">{plannedProjects}</p>
        </div>
        <div className="rounded-lg glass p-3 sm:p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <div className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
            <span className="truncate">Afgerond</span>
          </div>
          <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">{completedProjects}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4" data-tour="search-filter">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="search"
            placeholder="Zoek projecten..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Zoek projecten"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="shrink-0 gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Status</span>
              {statusFilter.length > 0 && (
                <span className="ml-1 rounded-full bg-zinc-900 px-2 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {statusFilter.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {STATUS_OPTIONS.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={statusFilter.includes(option.value)}
                onCheckedChange={() => toggleStatus(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Results count */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span>
            {filteredProjects.length} project{filteredProjects.length !== 1 ? "en" : ""} gevonden
          </span>
          <button
            onClick={clearFilters}
            className="text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            Filters wissen
          </button>
        </div>
      )}

      {/* Project Grid */}
      <div data-tour="project-grid">
        <div className="mb-4 flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">
            {hasActiveFilters
              ? `Gefilterde Projecten (${filteredProjects.length})`
              : `Alle Projecten (${projects.length})`}
          </h2>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <DemoProjectCard
                key={project.id}
                project={project}
                isFirst={index === 0}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-muted-foreground">
              Geen projecten gevonden met de huidige filters.
            </p>
            <button
              onClick={clearFilters}
              className="mt-2 text-sm text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              Filters wissen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
