"use client";

import * as React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { EmployeeAvailability, AvailabilityStatus, SelectOption } from "@/types/employees";

// =============================================================================
// Props
// =============================================================================

interface AvailabilityFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availability?: EmployeeAvailability;
  statusOptions?: SelectOption[];
  onSubmit?: (data: Omit<EmployeeAvailability, "id">) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

// =============================================================================
// Status Styling
// =============================================================================

function getStatusColor(status: AvailabilityStatus): string {
  const colors: Record<AvailabilityStatus, string> = {
    beschikbaar: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    ziek: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    vakantie: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    vrij: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    training: "bg-zinc-200 text-zinc-700 border-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600",
  };
  return colors[status] || "bg-zinc-100 text-zinc-700 border-zinc-200";
}

// =============================================================================
// Component
// =============================================================================

export function AvailabilityFormModal({
  open,
  onOpenChange,
  availability,
  statusOptions = [],
  onSubmit,
  onCancel,
  isLoading = false,
}: AvailabilityFormModalProps) {
  const isEditing = !!availability;

  // Form state
  const [date, setDate] = React.useState("");
  const [status, setStatus] = React.useState<AvailabilityStatus>("ziek");
  const [notes, setNotes] = React.useState("");

  // Validation state
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Reset form when modal opens/closes or availability changes
  React.useEffect(() => {
    if (open) {
      if (availability) {
        setDate(availability.date);
        setStatus(availability.status);
        setNotes(availability.notes);
      } else {
        // Default to today's date
        setDate(format(new Date(), "yyyy-MM-dd"));
        setStatus("ziek");
        setNotes("");
      }
      setErrors({});
    }
  }, [open, availability]);

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!date) {
      newErrors.date = "Datum is verplicht";
    }

    if (!status) {
      newErrors.status = "Status is verplicht";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit?.({
      date,
      status,
      notes: notes.trim(),
    });
  }

  function handleCancel() {
    onCancel?.();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogClose />
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Afwezigheid Bewerken" : "Afwezigheid Toevoegen"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Pas de gegevens van de afwezigheid aan."
              : "Registreer een periode van afwezigheid."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">
              Datum <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={errors.date ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.date && (
              <p className="text-xs text-red-500">{errors.date}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value as AvailabilityStatus)}
                  disabled={isLoading}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm font-medium transition-all",
                    status === option.value
                      ? cn(getStatusColor(option.value as AvailabilityStatus), "ring-2 ring-offset-1 ring-zinc-400")
                      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {errors.status && (
              <p className="text-xs text-red-500">{errors.status}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notities</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optionele notities..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Annuleren
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Bezig...
                </span>
              ) : isEditing ? (
                "Opslaan"
              ) : (
                "Toevoegen"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
