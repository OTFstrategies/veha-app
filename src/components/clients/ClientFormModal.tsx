"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import type { Client } from "@/types/clients"

// =============================================================================
// Types
// =============================================================================

export interface ClientFormData {
  name: string
  address: string
  city: string
  postal_code: string
  phone: string
  email: string
  notes: string
  is_active: boolean
}

interface ClientFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client | null
  onSubmit: (data: ClientFormData) => void
  isSubmitting?: boolean
}

// =============================================================================
// Component
// =============================================================================

export function ClientFormModal({
  open,
  onOpenChange,
  client,
  onSubmit,
  isSubmitting = false,
}: ClientFormModalProps) {
  const isEditing = !!client

  // Form state
  const [formData, setFormData] = React.useState<ClientFormData>({
    name: "",
    address: "",
    city: "",
    postal_code: "",
    phone: "",
    email: "",
    notes: "",
    is_active: true,
  })

  // Reset form when modal opens/closes or client changes
  React.useEffect(() => {
    if (open) {
      if (client) {
        setFormData({
          name: client.name,
          address: client.address || "",
          city: client.city || "",
          postal_code: client.postal_code || "",
          phone: client.phone || "",
          email: client.email || "",
          notes: client.notes || "",
          is_active: client.is_active,
        })
      } else {
        setFormData({
          name: "",
          address: "",
          city: "",
          postal_code: "",
          phone: "",
          email: "",
          notes: "",
          is_active: true,
        })
      }
    }
  }, [open, client])

  // Handle form changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_active: checked }))
  }

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogClose />
        <DialogHeader>
          <DialogTitle>{isEditing ? "Klant bewerken" : "Nieuwe klant"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Wijzig de gegevens van deze klant."
              : "Vul de gegevens in om een nieuwe klant toe te voegen."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Bedrijfsnaam <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Naam van het bedrijf"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Adres</Label>
            <Input
              id="address"
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
              <Label htmlFor="postal_code">Postcode</Label>
              <Input
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                placeholder="1234 AB"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Plaats</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Amsterdam"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefoon</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+31 6 12345678"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="info@bedrijf.nl"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notities</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Extra informatie over deze klant..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="is_active" className="cursor-pointer">
                Actieve klant
              </Label>
              <p className="text-sm text-muted-foreground">
                Inactieve klanten worden standaard verborgen in overzichten.
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
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
