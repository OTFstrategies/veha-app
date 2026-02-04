"use client"

import * as React from "react"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { useMaterials, useDeleteMaterial } from "@/queries/materials"
import { Package, Plus, MoreHorizontal } from "lucide-react"
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

const statusLabels: Record<string, string> = {
  op_voorraad: "Op voorraad",
  bijna_op: "Bijna op",
  besteld: "Besteld",
  niet_beschikbaar: "Niet beschikbaar",
}

const statusColors: Record<string, string> = {
  op_voorraad: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  bijna_op: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  besteld: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  niet_beschikbaar: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

const typeLabels: Record<string, string> = {
  verbruiksmateriaal: "Verbruiksmateriaal",
  voorraad: "Voorraad",
  onderdelen: "Onderdelen",
}

interface MaterialListProps {
  onAddMaterial?: () => void
  onViewMaterial?: (materialId: string) => void
  onEditMaterial?: (materialId: string) => void
}

export function MaterialList({ onAddMaterial, onViewMaterial, onEditMaterial }: MaterialListProps) {
  const { currentWorkspaceId } = useWorkspaceStore()
  const { data: materials, isLoading } = useMaterials(currentWorkspaceId)
  const deleteMaterial = useDeleteMaterial()
  const { addToast } = useToast()

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [materialToDelete, setMaterialToDelete] = React.useState<{ id: string; name: string } | null>(null)

  const handleDeleteClick = (id: string, name: string) => {
    setMaterialToDelete({ id, name })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (materialToDelete) {
      await deleteMaterial.mutateAsync(materialToDelete.id)
      addToast({ type: "success", title: "Verwijderd" })
      setDeleteDialogOpen(false)
      setMaterialToDelete(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" role="status" aria-label="Materialen laden">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100" />
        <span className="sr-only">Laden...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Materialen</h2>
          <p className="text-sm text-muted-foreground">Beheer je materiaalvoorraad</p>
        </div>
        <Button
          size="sm"
          className="h-9 gap-1.5 bg-zinc-800 text-zinc-50 hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
          onClick={onAddMaterial}
        >
          <Plus className="h-4 w-4" />
          Materiaal
        </Button>
      </div>

      {!materials?.length ? (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-medium">Nog geen materialen</p>
          <p className="text-sm text-muted-foreground mt-1">Voeg je eerste materiaal toe om te beginnen</p>
          <Button
            size="sm"
            className="h-9 gap-1.5 mt-4 bg-zinc-800 text-zinc-50 hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
            onClick={onAddMaterial}
          >
            <Plus className="h-4 w-4" />
            Materiaal
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {materials.map((material) => (
            <div
              key={material.id}
              className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <button
                onClick={() => onViewMaterial?.(material.id)}
                className="flex-1 flex items-center justify-between cursor-pointer text-left"
                type="button"
                aria-label={`Bekijk ${material.name}`}
              >
                <div className="space-y-1">
                  <p className="font-medium">{material.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{material.quantity_in_stock} {material.unit}</span>
                    <span className="text-zinc-300 dark:text-zinc-600">|</span>
                    <span>{typeLabels[material.material_type] || material.material_type}</span>
                    {material.supplier && (
                      <>
                        <span className="text-zinc-300 dark:text-zinc-600">|</span>
                        <span>{material.supplier}</span>
                      </>
                    )}
                  </div>
                </div>
                <Badge className={statusColors[material.status] || "bg-zinc-100 text-zinc-800"}>
                  {statusLabels[material.status] || material.status}
                </Badge>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-8 w-8"
                    aria-label="Materiaal acties"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewMaterial?.(material.id)}>
                    Bekijken
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEditMaterial?.(material.id)}>
                    Bewerken
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 dark:text-red-400"
                    onClick={() => handleDeleteClick(material.id, material.name)}
                  >
                    Verwijderen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Materiaal verwijderen"
        description={`Weet je zeker dat je "${materialToDelete?.name}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`}
        confirmLabel="Verwijderen"
        cancelLabel="Annuleren"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={deleteMaterial.isPending}
      />
    </div>
  )
}
