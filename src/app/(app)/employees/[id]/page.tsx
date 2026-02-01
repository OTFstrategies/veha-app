"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { EmployeeDetail } from "@/components/employees/EmployeeDetail";
import { EmployeeFormModal } from "@/components/employees/EmployeeFormModal";
import { AvailabilityFormModal } from "@/components/employees/AvailabilityFormModal";
import { useToast } from "@/components/ui/toast";
import {
  useEmployee,
  useUpdateEmployee,
  useAddAvailability,
  useUpdateAvailability,
  useDeleteAvailability,
} from "@/queries/employees";
import type { Employee, EmployeeAvailability, SelectOption } from "@/types/employees";

// Role options for the form
const roleOptions: SelectOption[] = [
  { value: "uitvoerder", label: "Uitvoerder" },
  { value: "voorman", label: "Voorman" },
  { value: "specialist", label: "Specialist" },
  { value: "projectleider", label: "Projectleider" },
];

// Skill options for the form
const skillOptions: SelectOption[] = [
  { value: "straatwerk", label: "Straatwerk" },
  { value: "kitwerk", label: "Kitwerk" },
  { value: "reinigen", label: "Reinigen" },
  { value: "kantoorwerk", label: "Kantoorwerk" },
  { value: "elektra", label: "Elektra" },
  { value: "loodgieter", label: "Loodgieter" },
  { value: "timmerman", label: "Timmerman" },
  { value: "metselaar", label: "Metselaar" },
];

// Availability status options
const statusOptions: SelectOption[] = [
  { value: "beschikbaar", label: "Beschikbaar" },
  { value: "ziek", label: "Ziek" },
  { value: "vakantie", label: "Vakantie" },
  { value: "vrij", label: "Vrij" },
  { value: "training", label: "Training" },
];

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;
  const { addToast } = useToast();

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = React.useState(false);
  const [editingAvailabilityId, setEditingAvailabilityId] = React.useState<string | null>(null);

  // Fetch employee
  const { data: employee, isLoading, error } = useEmployee(employeeId);

  // Mutations
  const updateEmployee = useUpdateEmployee();
  const addAvailability = useAddAvailability();
  const updateAvailability = useUpdateAvailability(employeeId);
  const deleteAvailability = useDeleteAvailability(employeeId);

  // Find the availability being edited
  const editingAvailability = editingAvailabilityId
    ? employee?.availability.find((a) => a.id === editingAvailabilityId)
    : undefined;

  // Handlers
  function handleBack() {
    router.push("/employees");
  }

  function handleEdit() {
    setIsEditModalOpen(true);
  }

  async function handleEditSubmit(data: Omit<Employee, "id" | "availability" | "assignments">) {
    if (!employee) return;

    try {
      await updateEmployee.mutateAsync({
        id: employee.id,
        name: data.name,
        role: data.role,
        email: data.email,
        phone: data.phone,
        hourlyRate: data.hourlyRate,
        weeklyCapacity: data.weeklyCapacity,
        skills: data.skills,
        color: data.color,
        isActive: data.isActive,
      });
      addToast({ type: "success", title: "Medewerker succesvol bijgewerkt" });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Failed to update employee:", err);
      addToast({ type: "error", title: "Fout bij opslaan van medewerker" });
    }
  }

  async function handleDeactivate() {
    if (!employee) return;

    const action = employee.isActive ? "deactiveren" : "activeren";
    if (window.confirm(`Weet je zeker dat je deze medewerker wilt ${action}?`)) {
      try {
        await updateEmployee.mutateAsync({
          id: employee.id,
          isActive: !employee.isActive,
        });
        if (employee.isActive) {
          addToast({ type: "success", title: "Medewerker gedeactiveerd" });
        } else {
          addToast({ type: "success", title: "Medewerker geactiveerd" });
        }
      } catch (err) {
        console.error("Failed to toggle employee status:", err);
        addToast({ type: "error", title: "Fout bij wijzigen status" });
      }
    }
  }

  function handleAddAvailability() {
    setEditingAvailabilityId(null);
    setIsAvailabilityModalOpen(true);
  }

  function handleEditAvailability(availabilityId: string) {
    setEditingAvailabilityId(availabilityId);
    setIsAvailabilityModalOpen(true);
  }

  async function handleDeleteAvailability(availabilityId: string) {
    if (window.confirm("Weet je zeker dat je deze afwezigheid wilt verwijderen?")) {
      try {
        await deleteAvailability.mutateAsync(availabilityId);
        addToast({ type: "success", title: "Afwezigheid verwijderd" });
      } catch (err) {
        console.error("Failed to delete availability:", err);
        addToast({ type: "error", title: "Fout bij verwijderen van afwezigheid" });
      }
    }
  }

  async function handleAvailabilitySubmit(data: Omit<EmployeeAvailability, "id">) {
    try {
      if (editingAvailabilityId) {
        await updateAvailability.mutateAsync({
          id: editingAvailabilityId,
          date: data.date,
          status: data.status,
          notes: data.notes,
        });
        addToast({ type: "success", title: "Beschikbaarheid opgeslagen" });
      } else {
        await addAvailability.mutateAsync({
          employeeId,
          date: data.date,
          status: data.status,
          notes: data.notes,
        });
        addToast({ type: "success", title: "Beschikbaarheid opgeslagen" });
      }
      setIsAvailabilityModalOpen(false);
      setEditingAvailabilityId(null);
    } catch (err) {
      console.error("Failed to save availability:", err);
      addToast({ type: "error", title: "Fout bij opslaan van beschikbaarheid" });
    }
  }

  function handleAvailabilityCancel() {
    setIsAvailabilityModalOpen(false);
    setEditingAvailabilityId(null);
  }

  function handleTaskClick(taskId: string, projectId: string) {
    router.push(`/projects/${projectId}?task=${taskId}`);
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-800" />
          <p className="text-sm text-muted-foreground">Medewerker laden...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Er is een fout opgetreden bij het laden van de medewerker.
          </p>
          <p className="mt-1 text-xs text-red-500">{error.message}</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!employee) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-muted-foreground">Medewerker niet gevonden.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <EmployeeDetail
        employee={employee}
        onBack={handleBack}
        onEdit={handleEdit}
        onDeactivate={handleDeactivate}
        onAddAvailability={handleAddAvailability}
        onEditAvailability={handleEditAvailability}
        onDeleteAvailability={handleDeleteAvailability}
        onTaskClick={handleTaskClick}
      />

      {/* Edit Employee Modal */}
      <EmployeeFormModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        employee={employee}
        roles={roleOptions}
        skillOptions={skillOptions}
        onSubmit={handleEditSubmit}
        onCancel={() => setIsEditModalOpen(false)}
        isLoading={updateEmployee.isPending}
      />

      {/* Availability Modal */}
      <AvailabilityFormModal
        open={isAvailabilityModalOpen}
        onOpenChange={(open) => {
          setIsAvailabilityModalOpen(open);
          if (!open) setEditingAvailabilityId(null);
        }}
        availability={editingAvailability}
        statusOptions={statusOptions}
        onSubmit={handleAvailabilitySubmit}
        onCancel={handleAvailabilityCancel}
        isLoading={addAvailability.isPending || updateAvailability.isPending}
      />
    </>
  );
}
