"use client"

import { useWorkspaceStore } from "@/stores/workspace-store"
import { useEquipment } from "@/queries/equipment"
import { Wrench, Plus, Truck, Hammer, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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
}

export function EquipmentList({ onAddEquipment, onViewEquipment }: EquipmentListProps) {
  const { currentWorkspaceId } = useWorkspaceStore()
  const { data: equipment, isLoading } = useEquipment(currentWorkspaceId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100" />
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
        <Button size="sm" className="gap-2" onClick={onAddEquipment}>
          <Plus className="h-4 w-4" />
          Middel toevoegen
        </Button>
      </div>

      {!equipment?.length ? (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-medium">Nog geen middelen</p>
          <p className="text-sm text-muted-foreground mt-1">Voeg je eerste middel toe om te beginnen</p>
          <Button size="sm" className="gap-2 mt-4" onClick={onAddEquipment}>
            <Plus className="h-4 w-4" />
            Middel toevoegen
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {equipment.map((item) => {
            const TypeIcon = typeIcons[item.equipment_type] || Wrench
            return (
              <div
                key={item.id}
                onClick={() => onViewEquipment?.(item.id)}
                className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors"
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
