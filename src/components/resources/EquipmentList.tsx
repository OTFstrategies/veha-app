"use client"

import * as React from "react"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { useEquipment, useDeleteEquipment } from "@/queries/equipment"
import { Wrench, Plus, Truck, Hammer, Settings, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/toast"
import { FilterBar, type FilterOption } from "@/components/ui/filter-bar"

const statusLabels: Record<string, string> = {
  beschikbaar: "Beschikbaar",
  in_gebruik: "In gebruik",
  onderhoud: "Onderhoud",
  defect: "Defect",
}

const statusColors: Record<string, string> = {
  beschikbaar: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  in_gebruik: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  onderhoud: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  defect: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  voertuig: Truck,
  machine: Settings,
  gereedschap: Hammer,
}

const typeLabels: Record<string, string> = {
  voertuig: "Voertuig",
  machine: "Machine",
  gereedschap: "Gereedschap",
}

interface EquipmentListProps {
  onAddEquipment?: () => void
  onViewEquipment?: (equipmentId: string) => void
  onEditEquipment?: (equipmentId: string) => void
}

export function EquipmentList({ onAddEquipment, onViewEquipment, onEditEquipment }: EquipmentListProps) {
  const { currentWorkspaceId } = useWorkspaceStore()
  const { data: equipment, isLoading } = useEquipment(currentWorkspaceId)
  const deleteEquipment = useDeleteEquipment()
  const { addToast } = useToast()

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [equipmentToDelete, setEquipmentToDelete] = React.useState<{ id: string; name: string } | null>(null)

  // Filter state
  const [statusFilter, setStatusFilter] = React.useState<string[]>([])
  const [typeFilter, setTypeFilter] = React.useState<string[]>([])

  // Filter options
  const statusOptions: FilterOption[] = [
    { value: "beschikbaar", label: "Beschikbaar" },
    { value: "in_gebruik", label: "In gebruik" },
    { value: "onderhoud", label: "Onderhoud" },
    { value: "defect", label: "Defect" },
  ]

  const typeOptions: FilterOption[] = [
    { value: "voertuig", label: "Voertuig" },
    { value: "machine", label: "Machine" },
    { value: "gereedschap", label: "Gereedschap" },
  ]

  // Filtered equipment
  const filteredEquipment = React.useMemo(() => {
    if (!equipment) return []
    return equipment.filter((e) => {
      if (statusFilter.length > 0 && !statusFilter.includes(e.status)) return false
      if (typeFilter.length > 0 && !typeFilter.includes(e.equipment_type)) return false
      return true
    })
  }, [equipment, statusFilter, typeFilter])

  const handleDeleteClick = (id: string, name: string) => {
    setEquipmentToDelete({ id, name })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (equipmentToDelete) {
      try {
        await deleteEquipment.mutateAsync(equipmentToDelete.id)
        addToast({ type: "success", title: "Verwijderd" })
      } catch {
        addToast({ type: "error", title: "Fout bij verwijderen" })
      }
      setDeleteDialogOpen(false)
      setEquipmentToDelete(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" role="status" aria-label="Middelen laden">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100" />
        <span className="sr-only">Laden...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Middelen</h2>
          <p className="text-sm text-muted-foreground">Beheer voertuigen, machines en gereedschap</p>
        </div>
        <Button
          size="sm"
          className="h-9 gap-1.5 bg-zinc-800 text-zinc-50 hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
          onClick={onAddEquipment}
        >
          <Plus className="h-4 w-4" />
          Middel
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <FilterBar
          label="Status"
          options={statusOptions}
          selected={statusFilter}
          onChange={setStatusFilter}
        />
        <FilterBar
          label="Type"
          options={typeOptions}
          selected={typeFilter}
          onChange={setTypeFilter}
        />
      </div>

      {!filteredEquipment?.length ? (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-medium">Nog geen middelen</p>
          <p className="text-sm text-muted-foreground mt-1">Voeg je eerste middel toe om te beginnen</p>
          <Button
            size="sm"
            className="h-9 gap-1.5 mt-4 bg-zinc-800 text-zinc-50 hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
            onClick={onAddEquipment}
          >
            <Plus className="h-4 w-4" />
            Middel
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {filteredEquipment.map((item) => {
            const TypeIcon = typeIcons[item.equipment_type] || Wrench
            return (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <button
                  onClick={() => onViewEquipment?.(item.id)}
                  className="flex-1 flex items-center justify-between cursor-pointer text-left"
                  type="button"
                  aria-label={`Bekijk ${item.name}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <TypeIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{item.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{typeLabels[item.equipment_type] || item.equipment_type}</span>
                        {item.license_plate && (
                          <>
                            <span className="text-zinc-300 dark:text-zinc-600">|</span>
                            <span className="font-mono">{item.license_plate}</span>
                          </>
                        )}
                        {item.daily_capacity_hours > 0 && (
                          <>
                            <span className="text-zinc-300 dark:text-zinc-600">|</span>
                            <span>{item.daily_capacity_hours}u/dag</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className={statusColors[item.status] || "bg-zinc-100 text-zinc-800"}>
                    {statusLabels[item.status] || item.status}
                  </Badge>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 h-8 w-8"
                      aria-label="Middel acties"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewEquipment?.(item.id)}>
                      Bekijken
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditEquipment?.(item.id)}>
                      Bewerken
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 dark:text-red-400"
                      onClick={() => handleDeleteClick(item.id, item.name)}
                    >
                      Verwijderen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          })}
        </div>
      )}

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Middel verwijderen"
        description={`Weet je zeker dat je "${equipmentToDelete?.name}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`}
        confirmLabel="Verwijderen"
        cancelLabel="Annuleren"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={deleteEquipment.isPending}
      />
    </div>
  )
}
