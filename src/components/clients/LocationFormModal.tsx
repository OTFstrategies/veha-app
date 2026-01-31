"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import type { ClientLocation } from "@/types/clients"

// =============================================================================
// Types
// =============================================================================

export interface LocationFormData {
  name: string
  address: string
  city: string
  postal_code: string
  is_primary: boolean
}

interface LocationFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  location?: ClientLocation | null
  clientName?: string
  onSubmit: (data: LocationFormData) => void
  isSubmitting?: boolean
}

// =============================================================================
// Component
// =============================================================================

export function LocationFormModal({
  open,
  onOpenChange,
  location,
  clientName,
  onSubmit,
  isSubmitting = false,
}: LocationFormModalProps) {
  const isEditing = !!location

  // Form state
  const [formData, setFormData] = React.useState<LocationFormData>({
    name: "",
    address: "",
    city: "",
    postal_code: "",
    is_primary: false,
  })

  // Reset form when modal opens/closes or location changes
  React.useEffect(() => {
    if (open) {
      if (location) {
        setFormData({
          name: location.name,
          address: location.address || "",
          city: location.city || "",
          postal_code: location.postal_code || "",
          is_primary: location.is_primary,
        })
      } else {
        setFormData({
          name: "",
          address: "",
          city: "",
          postal_code: "",
          is_primary: false,
        })
      }
    }
  }, [open, location])

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_primary: checked }))
  }

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogClose />
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Locatie bewerken" : "Nieuwe locatie"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Wijzig de gegevens van deze locatie."
              : clientName
              ? `Voeg een locatie toe aan ${clientName}.`
              : "Vul de gegevens in om een nieuwe locatie toe te voegen."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="location-name">
              Naam <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Hoofdkantoor"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="location-address">Adres</Label>
            <Input
              id="location-address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Straat en huisnummer"
              disabled={isSubmitting}
            />
          </div>

          {/* City & Postal Code */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location-postal_code">Postcode</Label>
              <Input
                id="location-postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                placeholder="1234 AB"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location-city">Plaats</Label>
              <Input
                id="location-city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Amsterdam"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Primary Location */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="location-is_primary" className="cursor-pointer">
                Primaire locatie
              </Label>
              <p className="text-sm text-muted-foreground">
                Markeer als het hoofdadres voor deze klant.
              </p>
            </div>
            <Switch
              id="location-is_primary"
              checked={formData.is_primary}
              onCheckedChange={handleSwitchChange}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Annuleren
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || !formData.name.trim()}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Opslaan" : "Toevoegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
