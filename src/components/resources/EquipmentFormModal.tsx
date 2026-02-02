"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import type { Equipment, EquipmentType } from "@/types/database"

// =============================================================================
// Props
// =============================================================================

export interface EquipmentFormData {
  name: string
  equipment_type: EquipmentType
  license_plate?: string
  daily_rate: number
  daily_capacity_hours: number
  notes?: string
}

interface EquipmentFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment?: Equipment
  onSubmit?: (data: EquipmentFormData) => void
  onCancel?: () => void
  isLoading?: boolean
}

// =============================================================================
// Constants
// =============================================================================

const EQUIPMENT_TYPES: { value: EquipmentType; label: string }[] = [
  { value: "voertuig", label: "Voertuig" },
  { value: "machine", label: "Machine" },
  { value: "gereedschap", label: "Gereedschap" },
]

// =============================================================================
// Component
// =============================================================================

export function EquipmentFormModal({
  open,
  onOpenChange,
  equipment,
  onSubmit,
  onCancel,
  isLoading = false,
}: EquipmentFormModalProps) {
  const isEditing = !!equipment

  // Form state
  const [name, setName] = React.useState("")
  const [equipmentType, setEquipmentType] = React.useState<EquipmentType>("voertuig")
  const [licensePlate, setLicensePlate] = React.useState("")
  const [dailyRate, setDailyRate] = React.useState(0)
  const [dailyCapacityHours, setDailyCapacityHours] = React.useState(8)
  const [notes, setNotes] = React.useState("")

  // Validation state
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Reset form when modal opens/closes or equipment changes
  React.useEffect(() => {
    if (open) {
      if (equipment) {
        setName(equipment.name)
        setEquipmentType(equipment.equipment_type)
        setLicensePlate(equipment.license_plate || "")
        setDailyRate(equipment.daily_rate)
        setDailyCapacityHours(equipment.daily_capacity_hours)
        setNotes(equipment.notes || "")
      } else {
        setName("")
        setEquipmentType("voertuig")
        setLicensePlate("")
        setDailyRate(0)
        setDailyCapacityHours(8)
        setNotes("")
      }
      setErrors({})
    }
  }, [open, equipment])

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Naam is verplicht"
    }

    if (dailyRate < 0) {
      newErrors.dailyRate = "Dagtarief kan niet negatief zijn"
    }

    if (dailyCapacityHours < 0 || dailyCapacityHours > 24) {
      newErrors.dailyCapacityHours = "Capaciteit moet tussen 0 en 24 uur liggen"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validateForm()) return

    onSubmit?.({
      name: name.trim(),
      equipment_type: equipmentType,
      license_plate: licensePlate.trim() || undefined,
      daily_rate: dailyRate,
      daily_capacity_hours: dailyCapacityHours,
      notes: notes.trim() || undefined,
    })
  }

  function handleCancel() {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogClose />
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Middel Bewerken" : "Nieuw Middel"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Pas de gegevens van het middel aan."
              : "Vul de gegevens in om een nieuw middel toe te voegen."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Naam <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bijv. Bedrijfsbus 1"
              className={errors.name ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Equipment Type */}
          <div className="space-y-2">
            <Label htmlFor="equipmentType">Type</Label>
            <select
              id="equipmentType"
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value as EquipmentType)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              {EQUIPMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* License Plate (only for vehicles) */}
          <div className="space-y-2">
            <Label htmlFor="licensePlate">Kenteken</Label>
            <Input
              id="licensePlate"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              placeholder="Bijv. AB-123-CD"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Alleen invullen voor voertuigen
            </p>
          </div>

          {/* Daily Rate and Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dailyRate">Dagtarief</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  &euro;
                </span>
                <Input
                  id="dailyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)}
                  className={`pl-7 ${errors.dailyRate ? "border-red-500" : ""}`}
                  disabled={isLoading}
                />
              </div>
              {errors.dailyRate && (
                <p className="text-xs text-red-500">{errors.dailyRate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dailyCapacityHours">Capaciteit (uren/dag)</Label>
              <Input
                id="dailyCapacityHours"
                type="number"
                min="0"
                max="24"
                value={dailyCapacityHours}
                onChange={(e) => setDailyCapacityHours(parseInt(e.target.value) || 0)}
                className={errors.dailyCapacityHours ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.dailyCapacityHours && (
                <p className="text-xs text-red-500">{errors.dailyCapacityHours}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notities</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Interne notities..."
              disabled={isLoading}
              rows={3}
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
  )
}
