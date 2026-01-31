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
import type { ClientContact } from "@/types/clients"

// =============================================================================
// Types
// =============================================================================

export interface ContactFormData {
  name: string
  role: string
  phone: string
  email: string
  is_primary: boolean
}

interface ContactFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact?: ClientContact | null
  clientName?: string
  onSubmit: (data: ContactFormData) => void
  isSubmitting?: boolean
}

// =============================================================================
// Component
// =============================================================================

export function ContactFormModal({
  open,
  onOpenChange,
  contact,
  clientName,
  onSubmit,
  isSubmitting = false,
}: ContactFormModalProps) {
  const isEditing = !!contact

  // Form state
  const [formData, setFormData] = React.useState<ContactFormData>({
    name: "",
    role: "",
    phone: "",
    email: "",
    is_primary: false,
  })

  // Reset form when modal opens/closes or contact changes
  React.useEffect(() => {
    if (open) {
      if (contact) {
        setFormData({
          name: contact.name,
          role: contact.role || "",
          phone: contact.phone || "",
          email: contact.email || "",
          is_primary: contact.is_primary,
        })
      } else {
        setFormData({
          name: "",
          role: "",
          phone: "",
          email: "",
          is_primary: false,
        })
      }
    }
  }, [open, contact])

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
            {isEditing ? "Contactpersoon bewerken" : "Nieuwe contactpersoon"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Wijzig de gegevens van deze contactpersoon."
              : clientName
              ? `Voeg een contactpersoon toe aan ${clientName}.`
              : "Vul de gegevens in om een nieuwe contactpersoon toe te voegen."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="contact-name">
              Naam <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contact-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Jan de Vries"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="contact-role">Functie</Label>
            <Input
              id="contact-role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Projectmanager"
              disabled={isSubmitting}
            />
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Telefoon</Label>
              <Input
                id="contact-phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+31 6 12345678"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">E-mail</Label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jan@bedrijf.nl"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Primary Contact */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="contact-is_primary" className="cursor-pointer">
                Primair contactpersoon
              </Label>
              <p className="text-sm text-muted-foreground">
                Markeer als het hoofdcontact voor deze klant.
              </p>
            </div>
            <Switch
              id="contact-is_primary"
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
