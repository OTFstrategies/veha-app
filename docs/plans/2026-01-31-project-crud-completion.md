# Project CRUD Completion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the missing Project create/edit functionality to allow users to create new projects and edit existing ones.

**Architecture:** Add a ProjectFormModal component with full CRUD support, integrate it into both the projects list page and project detail page. Use existing patterns from ClientFormModal and EmployeeFormModal.

**Tech Stack:** React, TypeScript, TanStack Query, Supabase, Zod for validation

---

## Current State Analysis

The codebase has:
- ✅ Project list page (`src/app/(app)/projects/page.tsx`)
- ✅ Project detail/Gantt page (`src/app/(app)/projects/[id]/page.tsx`)
- ✅ Project queries (`src/queries/projects.ts`)
- ✅ Project types (`src/types/projects.ts`)
- ❌ Project create/edit modal (TODO comments at lines 278-279, 293-294)
- ❌ `useCreateProject` mutation

---

## Task 1: Add Create Project Mutation

**Files:**
- Modify: `src/queries/projects.ts`

**Step 1: Read the existing queries file**

Review the current mutations to understand the pattern used.

**Step 2: Add the useCreateProject mutation**

Add after the existing `useDeleteProject` mutation:

```typescript
export function useCreateProject() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { workspaceId } = useCurrentWorkspace();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      clientId: string;
      description?: string;
      workType: WorkType;
      startDate: string;
      endDate: string;
      status?: ProjectStatus;
    }) => {
      if (!workspaceId) throw new Error("No workspace selected");

      const { data: project, error } = await supabase
        .from("projects")
        .insert({
          workspace_id: workspaceId,
          client_id: data.clientId,
          name: data.name,
          description: data.description ?? null,
          work_type: data.workType,
          start_date: data.startDate,
          end_date: data.endDate,
          status: data.status ?? "gepland",
          progress: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
```

**Step 3: Add the useUpdateProject mutation**

```typescript
export function useUpdateProject() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      name?: string;
      clientId?: string;
      description?: string;
      workType?: WorkType;
      startDate?: string;
      endDate?: string;
      status?: ProjectStatus;
      progress?: number;
    }) => {
      const updateData: Record<string, unknown> = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.clientId !== undefined) updateData.client_id = data.clientId;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.workType !== undefined) updateData.work_type = data.workType;
      if (data.startDate !== undefined) updateData.start_date = data.startDate;
      if (data.endDate !== undefined) updateData.end_date = data.endDate;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.progress !== undefined) updateData.progress = data.progress;

      const { data: project, error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", data.id)
        .select()
        .single();

      if (error) throw error;
      return project;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
    },
  });
}
```

**Step 4: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add src/queries/projects.ts
git commit -m "$(cat <<'EOF'
feat(projects): add useCreateProject and useUpdateProject mutations

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Create ProjectFormModal Component

**Files:**
- Create: `src/components/projects/ProjectFormModal.tsx`

**Step 1: Create the ProjectFormModal component**

```typescript
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClients } from "@/queries/clients";
import type { Project, ProjectStatus, WorkType } from "@/types/projects";

// =============================================================================
// Schema
// =============================================================================

const projectFormSchema = z.object({
  name: z.string().min(1, "Naam is verplicht").max(100, "Naam mag maximaal 100 tekens zijn"),
  clientId: z.string().min(1, "Klant is verplicht"),
  description: z.string().max(500, "Beschrijving mag maximaal 500 tekens zijn").optional(),
  workType: z.enum(["straatwerk", "kitwerk", "reinigen", "kantoor", "overig"]),
  startDate: z.string().min(1, "Startdatum is verplicht"),
  endDate: z.string().min(1, "Einddatum is verplicht"),
  status: z.enum(["gepland", "actief", "on-hold", "afgerond", "geannuleerd"]).optional(),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  { message: "Einddatum moet na startdatum liggen", path: ["endDate"] }
);

type ProjectFormData = z.infer<typeof projectFormSchema>;

// =============================================================================
// Constants
// =============================================================================

const WORK_TYPE_OPTIONS: { value: WorkType; label: string }[] = [
  { value: "straatwerk", label: "Straatwerk" },
  { value: "kitwerk", label: "Kitwerk" },
  { value: "reinigen", label: "Reinigen" },
  { value: "kantoor", label: "Kantoor" },
  { value: "overig", label: "Overig" },
];

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "gepland", label: "Gepland" },
  { value: "actief", label: "Actief" },
  { value: "on-hold", label: "On-hold" },
  { value: "afgerond", label: "Afgerond" },
  { value: "geannuleerd", label: "Geannuleerd" },
];

// =============================================================================
// Props
// =============================================================================

export interface ProjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  isSubmitting?: boolean;
}

// =============================================================================
// Component
// =============================================================================

export function ProjectFormModal({
  open,
  onOpenChange,
  project,
  onSubmit,
  isSubmitting = false,
}: ProjectFormModalProps) {
  const isEditing = !!project;
  const { data: clients = [] } = useClients();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      clientId: "",
      description: "",
      workType: "straatwerk",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "gepland",
    },
  });

  // Reset form when modal opens/closes or project changes
  React.useEffect(() => {
    if (open) {
      if (project) {
        reset({
          name: project.name,
          clientId: project.clientId,
          description: project.description ?? "",
          workType: project.workType,
          startDate: project.startDate,
          endDate: project.endDate,
          status: project.status,
        });
      } else {
        reset({
          name: "",
          clientId: "",
          description: "",
          workType: "straatwerk",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          status: "gepland",
        });
      }
    }
  }, [open, project, reset]);

  const selectedClientId = watch("clientId");
  const selectedWorkType = watch("workType");
  const selectedStatus = watch("status");

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const selectedWorkTypeLabel = WORK_TYPE_OPTIONS.find((o) => o.value === selectedWorkType)?.label;
  const selectedStatusLabel = STATUS_OPTIONS.find((o) => o.value === selectedStatus)?.label;

  async function onFormSubmit(data: ProjectFormData) {
    await onSubmit(data);
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Project bewerken" : "Nieuw project"}
      description={isEditing ? "Wijzig de projectgegevens" : "Vul de gegevens in voor het nieuwe project"}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Projectnaam *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Bijv. Straatwerk Hoofdstraat"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Client */}
        <div className="space-y-2">
          <Label>Klant *</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                disabled={isSubmitting}
              >
                {selectedClient?.name ?? "Selecteer klant..."}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[300px]">
              {clients.map((client) => (
                <DropdownMenuItem
                  key={client.id}
                  onClick={() => setValue("clientId", client.id)}
                >
                  {client.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {errors.clientId && (
            <p className="text-sm text-destructive">{errors.clientId.message}</p>
          )}
        </div>

        {/* Work Type */}
        <div className="space-y-2">
          <Label>Type werk *</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                disabled={isSubmitting}
              >
                {selectedWorkTypeLabel ?? "Selecteer type..."}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {WORK_TYPE_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setValue("workType", option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Startdatum *</Label>
            <Input
              id="startDate"
              type="date"
              {...register("startDate")}
              disabled={isSubmitting}
            />
            {errors.startDate && (
              <p className="text-sm text-destructive">{errors.startDate.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Einddatum *</Label>
            <Input
              id="endDate"
              type="date"
              {...register("endDate")}
              disabled={isSubmitting}
            />
            {errors.endDate && (
              <p className="text-sm text-destructive">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        {/* Status (only for edit) */}
        {isEditing && (
          <div className="space-y-2">
            <Label>Status</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  disabled={isSubmitting}
                >
                  {selectedStatusLabel ?? "Selecteer status..."}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {STATUS_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setValue("status", option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Beschrijving</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Optionele beschrijving van het project..."
            rows={3}
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annuleren
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Opslaan" : "Aanmaken"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export type { ProjectFormData };
```

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/projects/ProjectFormModal.tsx
git commit -m "$(cat <<'EOF'
feat(projects): add ProjectFormModal component

- Form with validation using Zod
- Support for create and edit modes
- Client selector dropdown
- Work type and status dropdowns
- Date range validation

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Integrate Modal into Projects Page

**Files:**
- Modify: `src/app/(app)/projects/page.tsx`

**Step 1: Add imports at top of file**

After existing imports, add:

```typescript
import { ProjectFormModal, type ProjectFormData } from "@/components/projects/ProjectFormModal"
import { useCreateProject, useUpdateProject } from "@/queries/projects"
```

**Step 2: Add modal state and mutations inside component**

After the existing state declarations (`search`, `statusFilter`), add:

```typescript
const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
const [editingProject, setEditingProject] = React.useState<Project | null>(null)

const createProject = useCreateProject()
const updateProject = useUpdateProject()
```

**Step 3: Replace handleEdit handler**

Replace the existing `handleEdit` function:

```typescript
const handleEdit = (id: string) => {
  const project = projects?.find((p) => p.id === id)
  if (project) {
    setEditingProject(project)
  }
}
```

**Step 4: Replace handleCreate handler**

Replace the existing `handleCreate` function:

```typescript
const handleCreate = () => {
  setIsCreateModalOpen(true)
}
```

**Step 5: Add submit handlers**

After `handleCreate`, add:

```typescript
const handleCreateSubmit = async (data: ProjectFormData) => {
  await createProject.mutateAsync({
    name: data.name,
    clientId: data.clientId,
    description: data.description,
    workType: data.workType,
    startDate: data.startDate,
    endDate: data.endDate,
  })
  setIsCreateModalOpen(false)
}

const handleEditSubmit = async (data: ProjectFormData) => {
  if (!editingProject) return
  await updateProject.mutateAsync({
    id: editingProject.id,
    name: data.name,
    clientId: data.clientId,
    description: data.description,
    workType: data.workType,
    startDate: data.startDate,
    endDate: data.endDate,
    status: data.status,
  })
  setEditingProject(null)
}
```

**Step 6: Add modals before closing fragment**

Before the final `</div>` of the return statement, add:

```typescript
{/* Create Modal */}
<ProjectFormModal
  open={isCreateModalOpen}
  onOpenChange={setIsCreateModalOpen}
  onSubmit={handleCreateSubmit}
  isSubmitting={createProject.isPending}
/>

{/* Edit Modal */}
<ProjectFormModal
  open={!!editingProject}
  onOpenChange={(open) => !open && setEditingProject(null)}
  project={editingProject}
  onSubmit={handleEditSubmit}
  isSubmitting={updateProject.isPending}
/>
```

**Step 7: Wrap return in fragment**

Change the return statement to wrap everything in a fragment:

```typescript
return (
  <>
    <div className="space-y-6">
      {/* ... existing content ... */}
    </div>

    {/* Create Modal */}
    <ProjectFormModal ... />

    {/* Edit Modal */}
    <ProjectFormModal ... />
  </>
)
```

**Step 8: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 9: Commit**

```bash
git add src/app/\(app\)/projects/page.tsx
git commit -m "$(cat <<'EOF'
feat(projects): integrate create/edit modals into projects page

- Wire up create modal with handleCreateSubmit
- Wire up edit modal with handleEditSubmit
- Connect to useCreateProject and useUpdateProject mutations

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Add Edit Button to Project Detail Page

**Files:**
- Modify: `src/app/(app)/projects/[id]/page.tsx`

**Step 1: Add imports**

After existing imports, add:

```typescript
import { ProjectFormModal, type ProjectFormData } from '@/components/projects/ProjectFormModal'
import { useUpdateProject } from '@/queries/projects'
```

**Step 2: Add modal state**

After the queries section, add:

```typescript
const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
const updateProjectMutation = useUpdateProject()
```

**Step 3: Update handleEditProject**

Replace the existing `handleEditProject` callback:

```typescript
const handleEditProject = React.useCallback(() => {
  setIsEditModalOpen(true)
}, [])

const handleEditProjectSubmit = React.useCallback(async (data: ProjectFormData) => {
  await updateProjectMutation.mutateAsync({
    id: projectId,
    name: data.name,
    clientId: data.clientId,
    description: data.description,
    workType: data.workType,
    startDate: data.startDate,
    endDate: data.endDate,
    status: data.status,
  })
  setIsEditModalOpen(false)
}, [updateProjectMutation, projectId])
```

**Step 4: Add modal to render**

Change the return with `ProjectGanttScheduler` to wrap in a fragment and add modal:

```typescript
return (
  <>
    <div className="-m-6 flex h-[calc(100vh-64px)] flex-col">
      <ProjectGanttScheduler
        project={project}
        employees={employees}
        onBack={handleBack}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProject}
        onTaskDatesChange={handleTaskDatesChange}
        onTaskProgressChange={handleTaskProgressChange}
        onTaskEdit={handleTaskEdit}
        onTaskDelete={handleTaskDelete}
        onTaskAdd={handleTaskAdd}
        onClientClick={handleClientClick}
      />
    </div>

    <ProjectFormModal
      open={isEditModalOpen}
      onOpenChange={setIsEditModalOpen}
      project={project}
      onSubmit={handleEditProjectSubmit}
      isSubmitting={updateProjectMutation.isPending}
    />
  </>
)
```

**Step 5: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add src/app/\(app\)/projects/\[id\]/page.tsx
git commit -m "$(cat <<'EOF'
feat(projects): add edit modal to project detail page

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Verify Full Integration

**Step 1: Run the development server**

Run: `npm run dev`
Expected: Server starts without errors

**Step 2: Manual testing checklist**

- [ ] Navigate to /projects
- [ ] Click "Nieuw project" button
- [ ] Verify modal opens with empty form
- [ ] Fill in form and submit
- [ ] Verify project appears in list
- [ ] Click edit on a project
- [ ] Verify modal opens with project data
- [ ] Modify and save
- [ ] Verify changes are reflected

**Step 3: Final commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat(projects): complete project CRUD functionality

- Added useCreateProject and useUpdateProject mutations
- Created ProjectFormModal with Zod validation
- Integrated modals into projects list and detail pages
- Full create, read, update, delete flow now working

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Summary

This plan completes the missing Project CRUD functionality:

1. **Task 1**: Add mutations (`useCreateProject`, `useUpdateProject`)
2. **Task 2**: Create `ProjectFormModal` component
3. **Task 3**: Integrate modal into projects list page
4. **Task 4**: Add edit modal to project detail page
5. **Task 5**: Verify and test the full integration

After this, all core CRUD operations for Projects will be functional.
