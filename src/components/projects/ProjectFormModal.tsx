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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useClients } from "@/queries/clients";
import type { Project, WorkType, ProjectStatus } from "@/types/projects";

// =============================================================================
// Schema
// =============================================================================

const projectFormSchema = z
  .object({
    name: z.string().min(1, "Naam is verplicht").max(100),
    clientId: z.string().min(1, "Klant is verplicht"),
    description: z.string().max(500).optional(),
    workType: z.enum(["straatwerk", "kitwerk", "reinigen", "kantoor", "overig"]),
    startDate: z.string().min(1, "Startdatum is verplicht"),
    endDate: z.string().min(1, "Einddatum is verplicht"),
    status: z
      .enum(["gepland", "actief", "on-hold", "afgerond", "geannuleerd"])
      .optional(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "Einddatum moet na startdatum liggen",
    path: ["endDate"],
  });

export type ProjectFormData = z.infer<typeof projectFormSchema>;

// =============================================================================
// Constants
// =============================================================================

const workTypeOptions: { value: WorkType; label: string }[] = [
  { value: "straatwerk", label: "Straatwerk" },
  { value: "kitwerk", label: "Kitwerk" },
  { value: "reinigen", label: "Reinigen" },
  { value: "kantoor", label: "Kantoor" },
  { value: "overig", label: "Overig" },
];

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: "gepland", label: "Gepland" },
  { value: "actief", label: "Actief" },
  { value: "on-hold", label: "On-hold" },
  { value: "afgerond", label: "Afgerond" },
  { value: "geannuleerd", label: "Geannuleerd" },
];

// =============================================================================
// Props
// =============================================================================

interface ProjectFormModalProps {
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

  // Fetch clients for dropdown
  const { data: clients = [], isLoading: isLoadingClients } = useClients();

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      clientId: "",
      description: "",
      workType: "straatwerk",
      startDate: "",
      endDate: "",
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
          description: project.description || "",
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
          startDate: "",
          endDate: "",
          status: "gepland",
        });
      }
    }
  }, [open, project, reset]);

  // Handle form submission
  const onFormSubmit = async (data: ProjectFormData) => {
    await onSubmit(data);
  };

  // Watch values for conditional rendering
  const selectedWorkType = watch("workType");
  const selectedStatus = watch("status");
  const selectedClientId = watch("clientId");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogClose />
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Project bewerken" : "Nieuw project"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Wijzig de gegevens van dit project."
              : "Vul de gegevens in om een nieuw project toe te voegen."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Projectnaam <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Naam van het project"
              className={errors.name ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Client dropdown */}
          <div className="space-y-2">
            <Label htmlFor="clientId">
              Klant <span className="text-red-500">*</span>
            </Label>
            <select
              id="clientId"
              {...register("clientId")}
              className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.clientId ? "border-red-500" : "border-input"
              }`}
              disabled={isSubmitting || isLoadingClients}
              value={selectedClientId}
            >
              <option value="">Selecteer een klant...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {errors.clientId && (
              <p className="text-xs text-red-500">{errors.clientId.message}</p>
            )}
          </div>

          {/* Work Type dropdown */}
          <div className="space-y-2">
            <Label htmlFor="workType">
              Type werk <span className="text-red-500">*</span>
            </Label>
            <select
              id="workType"
              {...register("workType")}
              className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.workType ? "border-red-500" : ""
              }`}
              disabled={isSubmitting}
              value={selectedWorkType}
            >
              {workTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.workType && (
              <p className="text-xs text-red-500">{errors.workType.message}</p>
            )}
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                Startdatum <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
                className={errors.startDate ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {errors.startDate && (
                <p className="text-xs text-red-500">
                  {errors.startDate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">
                Einddatum <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate")}
                className={errors.endDate ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {errors.endDate && (
                <p className="text-xs text-red-500">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Status dropdown (only in edit mode) */}
          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                {...register("status")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
                value={selectedStatus}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="text-xs text-red-500">{errors.status.message}</p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Omschrijving</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Optionele beschrijving van het project..."
              rows={3}
              className={errors.description ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Annuleren
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? "Opslaan" : "Toevoegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
