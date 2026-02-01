"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { EmployeeList } from "@/components/employees/EmployeeList"
import { EmployeeFormModal } from "@/components/employees/EmployeeFormModal"
import { useToast } from "@/components/ui/toast"
import { useEmployees, useCreateEmployee, useDeleteEmployee, useUpdateEmployee } from "@/queries/employees"
import { useWorkspaceStore } from "@/stores/workspace-store"
import type { Employee, SelectOption } from "@/types/employees"

// Role options for filtering and forms
const roleOptions: SelectOption[] = [
  { value: "uitvoerder", label: "Uitvoerder" },
  { value: "voorman", label: "Voorman" },
  { value: "specialist", label: "Specialist" },
  { value: "projectleider", label: "Projectleider" },
]

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
]

export default function EmployeesPageContent() {
  const router = useRouter()
  const { currentWorkspaceId } = useWorkspaceStore()
  const { addToast } = useToast()

  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [editingEmployeeId, setEditingEmployeeId] = React.useState<string | null>(null)

  // Fetch employees
  const { data: employees = [], isLoading, error } = useEmployees(currentWorkspaceId)

  // Mutations
  const createEmployee = useCreateEmployee()
  const updateEmployee = useUpdateEmployee()
  const deleteEmployee = useDeleteEmployee()

  // Find the employee being edited
  const editingEmployee = editingEmployeeId
    ? employees.find((e) => e.id === editingEmployeeId)
    : undefined

  // Handlers
  function handleView(id: string) {
    router.push(`/employees/${id}`)
  }

  function handleEdit(id: string) {
    setEditingEmployeeId(id)
  }

  function handleDelete(id: string) {
    if (window.confirm("Weet je zeker dat je deze medewerker wilt deactiveren?")) {
      deleteEmployee.mutate(id, {
        onSuccess: () => {
          addToast({ type: "success", title: "Medewerker gedeactiveerd" })
        },
        onError: () => {
          addToast({ type: "error", title: "Fout bij deactiveren van medewerker" })
        },
      })
    }
  }

  function handleCreate() {
    setIsCreateModalOpen(true)
  }

  async function handleCreateSubmit(data: Omit<Employee, "id" | "availability" | "assignments">) {
    if (!currentWorkspaceId) return

    try {
      await createEmployee.mutateAsync({
        workspaceId: currentWorkspaceId,
        name: data.name,
        role: data.role,
        email: data.email,
        phone: data.phone,
        hourlyRate: data.hourlyRate,
        weeklyCapacity: data.weeklyCapacity,
        skills: data.skills,
        color: data.color,
      })
      addToast({ type: "success", title: "Medewerker succesvol aangemaakt" })
      setIsCreateModalOpen(false)
    } catch {
      addToast({ type: "error", title: "Fout bij opslaan van medewerker" })
    }
  }

  async function handleEditSubmit(data: Omit<Employee, "id" | "availability" | "assignments">) {
    if (!editingEmployeeId) return

    try {
      await updateEmployee.mutateAsync({
        id: editingEmployeeId,
        name: data.name,
        role: data.role,
        email: data.email,
        phone: data.phone,
        hourlyRate: data.hourlyRate,
        weeklyCapacity: data.weeklyCapacity,
        skills: data.skills,
        color: data.color,
        isActive: data.isActive,
      })
      addToast({ type: "success", title: "Medewerker succesvol bijgewerkt" })
      setEditingEmployeeId(null)
    } catch {
      addToast({ type: "error", title: "Fout bij opslaan van medewerker" })
    }
  }

  function handleCreateCancel() {
    setIsCreateModalOpen(false)
  }

  function handleEditCancel() {
    setEditingEmployeeId(null)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-800" />
          <p className="text-sm text-muted-foreground">Medewerkers laden...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Er is een fout opgetreden bij het laden van medewerkers.
          </p>
          <p className="mt-1 text-xs text-red-500">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <EmployeeList
        employees={employees}
        roles={roleOptions}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

      {/* Create Modal */}
      <EmployeeFormModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        roles={roleOptions}
        skillOptions={skillOptions}
        onSubmit={handleCreateSubmit}
        onCancel={handleCreateCancel}
        isLoading={createEmployee.isPending}
      />

      {/* Edit Modal */}
      <EmployeeFormModal
        open={!!editingEmployeeId}
        onOpenChange={(open) => !open && setEditingEmployeeId(null)}
        employee={editingEmployee}
        roles={roleOptions}
        skillOptions={skillOptions}
        onSubmit={handleEditSubmit}
        onCancel={handleEditCancel}
        isLoading={updateEmployee.isPending}
      />
    </>
  )
}
