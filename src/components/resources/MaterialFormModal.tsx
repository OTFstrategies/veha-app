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
import type { Material, MaterialType } from "@/types/resources"

// =============================================================================
// Props
// =============================================================================

export interface MaterialFormData {
  name: string
  description?: string
  material_type: MaterialType
  unit: string
  unit_price: number
  quantity_in_stock: number
  min_stock_level: number
  supplier?: string
  supplier_article_number?: string
  notes?: string
}

interface MaterialFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  material?: Material
  onSubmit?: (data: MaterialFormData) => void
  onCancel?: () => void
  isLoading?: boolean
}

// =============================================================================
// Constants
// =============================================================================

const MATERIAL_TYPES: { value: MaterialType; label: string }[] = [
  { value: "verbruiksmateriaal", label: "Verbruiksmateriaal" },
  { value: "voorraad", label: "Voorraad" },
  { value: "onderdelen", label: "Onderdelen" },
]

// =============================================================================
// Component
// =============================================================================

export function MaterialFormModal({
  open,
  onOpenChange,
  material,
  onSubmit,
  onCancel,
  isLoading = false,
}: MaterialFormModalProps) {
  const isEditing = !!material

  // Form state
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [materialType, setMaterialType] = React.useState<MaterialType>("verbruiksmateriaal")
  const [unit, setUnit] = React.useState("stuk")
  const [unitPrice, setUnitPrice] = React.useState(0)
  const [quantityInStock, setQuantityInStock] = React.useState(0)
  const [minStockLevel, setMinStockLevel] = React.useState(0)
  const [supplier, setSupplier] = React.useState("")
  const [supplierArticleNumber, setSupplierArticleNumber] = React.useState("")
  const [notes, setNotes] = React.useState("")

  // Validation state
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Reset form when modal opens/closes or material changes
  React.useEffect(() => {
    if (open) {
      if (material) {
        setName(material.name)
        setDescription(material.description || "")
        setMaterialType(material.material_type)
        setUnit(material.unit)
        setUnitPrice(material.unit_price)
        setQuantityInStock(material.quantity_in_stock)
        setMinStockLevel(material.min_stock_level)
        setSupplier(material.supplier || "")
        setSupplierArticleNumber(material.supplier_article_number || "")
        setNotes(material.notes || "")
      } else {
        setName("")
        setDescription("")
        setMaterialType("verbruiksmateriaal")
        setUnit("stuk")
        setUnitPrice(0)
        setQuantityInStock(0)
        setMinStockLevel(0)
        setSupplier("")
        setSupplierArticleNumber("")
        setNotes("")
      }
      setErrors({})
    }
  }, [open, material])

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Naam is verplicht"
    }

    if (!unit.trim()) {
      newErrors.unit = "Eenheid is verplicht"
    }

    if (unitPrice < 0) {
      newErrors.unitPrice = "Prijs kan niet negatief zijn"
    }

    if (quantityInStock < 0) {
      newErrors.quantityInStock = "Voorraad kan niet negatief zijn"
    }

    if (minStockLevel < 0) {
      newErrors.minStockLevel = "Minimale voorraad kan niet negatief zijn"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validateForm()) return

    onSubmit?.({
      name: name.trim(),
      description: description.trim() || undefined,
      material_type: materialType,
      unit: unit.trim(),
      unit_price: unitPrice,
      quantity_in_stock: quantityInStock,
      min_stock_level: minStockLevel,
      supplier: supplier.trim() || undefined,
      supplier_article_number: supplierArticleNumber.trim() || undefined,
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
            {isEditing ? "Materiaal Bewerken" : "Nieuw Materiaal"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Pas de gegevens van het materiaal aan."
              : "Vul de gegevens in om een nieuw materiaal toe te voegen."}
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
              placeholder="Bijv. Straatzand"
              className={errors.name ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Material Type */}
          <div className="space-y-2">
            <Label htmlFor="materialType">Type</Label>
            <select
              id="materialType"
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value as MaterialType)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              {MATERIAL_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Unit and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">
                Eenheid <span className="text-red-500">*</span>
              </Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Bijv. m3, stuk, kg"
                className={errors.unit ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.unit && (
                <p className="text-xs text-red-500">{errors.unit}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Prijs per eenheid</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  &euro;
                </span>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  className={`pl-7 ${errors.unitPrice ? "border-red-500" : ""}`}
                  disabled={isLoading}
                />
              </div>
              {errors.unitPrice && (
                <p className="text-xs text-red-500">{errors.unitPrice}</p>
              )}
            </div>
          </div>

          {/* Stock Levels */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantityInStock">Voorraad</Label>
              <Input
                id="quantityInStock"
                type="number"
                min="0"
                value={quantityInStock}
                onChange={(e) => setQuantityInStock(parseInt(e.target.value) || 0)}
                className={errors.quantityInStock ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.quantityInStock && (
                <p className="text-xs text-red-500">{errors.quantityInStock}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStockLevel">Minimale voorraad</Label>
              <Input
                id="minStockLevel"
                type="number"
                min="0"
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(parseInt(e.target.value) || 0)}
                className={errors.minStockLevel ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.minStockLevel && (
                <p className="text-xs text-red-500">{errors.minStockLevel}</p>
              )}
            </div>
          </div>

          {/* Supplier Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Leverancier</Label>
              <Input
                id="supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Naam leverancier"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierArticleNumber">Artikelnummer</Label>
              <Input
                id="supplierArticleNumber"
                value={supplierArticleNumber}
                onChange={(e) => setSupplierArticleNumber(e.target.value)}
                placeholder="Leverancier artikelnr"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Beschrijving</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optionele beschrijving..."
              disabled={isLoading}
              rows={2}
            />
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
              rows={2}
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
