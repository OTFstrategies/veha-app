"use client"

import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Package, Wrench, Calendar, BarChart3 } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { useWorkspaceStore } from "@/stores/workspace-store"

// Import existing employee page content
import EmployeesPageContent from "./EmployeesPageContent"
import { MaterialList } from "@/components/resources/MaterialList"
import { EquipmentList } from "@/components/resources/EquipmentList"
import { WeekPlanningSection } from "./WeekPlanningSection"
import { ResourceHistogram } from "@/components/resources/ResourceHistogram"
import { MaterialFormModal, type MaterialFormData } from "@/components/resources/MaterialFormModal"
import { EquipmentFormModal, type EquipmentFormData } from "@/components/resources/EquipmentFormModal"
import { useCreateMaterial, useMaterial, useUpdateMaterial } from "@/queries/materials"
import { useCreateEquipment, useEquipmentItem, useUpdateEquipment } from "@/queries/equipment"

const tabs = [
  { id: "medewerkers", label: "Medewerkers", icon: Users },
  { id: "materialen", label: "Materialen", icon: Package },
  { id: "middelen", label: "Middelen", icon: Wrench },
  { id: "weekplanning", label: "Weekplanning", icon: Calendar },
  { id: "bezetting", label: "Bezetting", icon: BarChart3 },
]

function ResourcesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "medewerkers"
  const { addToast } = useToast()
  const { currentWorkspaceId } = useWorkspaceStore()

  // State for modals
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false)
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false)

  // State for selected items (for edit modal views)
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null)
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null)

  // Queries for selected items
  const { data: selectedMaterial } = useMaterial(selectedMaterialId)
  const { data: selectedEquipment } = useEquipmentItem(selectedEquipmentId)

  // Mutations
  const createMaterial = useCreateMaterial()
  const createEquipment = useCreateEquipment()
  const updateMaterial = useUpdateMaterial()
  const updateEquipment = useUpdateEquipment()

  const handleTabChange = (value: string) => {
    router.push(`/resources?tab=${value}`)
  }

  // Material handlers
  const handleAddMaterial = () => {
    setSelectedMaterialId(null)
    setIsMaterialModalOpen(true)
  }

  const handleViewMaterial = (materialId: string) => {
    setSelectedMaterialId(materialId)
    setIsMaterialModalOpen(true)
  }

  const handleMaterialSubmit = async (data: MaterialFormData) => {
    if (!currentWorkspaceId) {
      addToast({ type: "error", title: "Geen werkruimte geselecteerd" })
      return
    }

    try {
      if (selectedMaterialId) {
        // Update existing material
        await updateMaterial.mutateAsync({
          id: selectedMaterialId,
          name: data.name,
          description: data.description,
          material_type: data.material_type,
          unit: data.unit,
          unit_price: data.unit_price,
          quantity_in_stock: data.quantity_in_stock,
          min_stock_level: data.min_stock_level,
          supplier: data.supplier,
          supplier_article_number: data.supplier_article_number,
          notes: data.notes,
        })
        addToast({ type: "success", title: "Materiaal bijgewerkt" })
      } else {
        // Create new material
        await createMaterial.mutateAsync({
          workspace_id: currentWorkspaceId,
          name: data.name,
          description: data.description,
          material_type: data.material_type,
          unit: data.unit,
          unit_price: data.unit_price,
          quantity_in_stock: data.quantity_in_stock,
          min_stock_level: data.min_stock_level,
          supplier: data.supplier,
          supplier_article_number: data.supplier_article_number,
          notes: data.notes,
        })
        addToast({ type: "success", title: "Materiaal toegevoegd" })
      }
      setIsMaterialModalOpen(false)
      setSelectedMaterialId(null)
    } catch (error) {
      console.error("Failed to save material:", error)
      addToast({ type: "error", title: selectedMaterialId ? "Fout bij bijwerken van materiaal" : "Fout bij toevoegen van materiaal" })
    }
  }

  // Equipment handlers
  const handleAddEquipment = () => {
    setSelectedEquipmentId(null)
    setIsEquipmentModalOpen(true)
  }

  const handleViewEquipment = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId)
    setIsEquipmentModalOpen(true)
  }

  const handleEquipmentSubmit = async (data: EquipmentFormData) => {
    if (!currentWorkspaceId) {
      addToast({ type: "error", title: "Geen werkruimte geselecteerd" })
      return
    }

    try {
      if (selectedEquipmentId) {
        // Update existing equipment
        await updateEquipment.mutateAsync({
          id: selectedEquipmentId,
          name: data.name,
          equipment_type: data.equipment_type,
          license_plate: data.license_plate,
          daily_rate: data.daily_rate,
          daily_capacity_hours: data.daily_capacity_hours,
          notes: data.notes,
        })
        addToast({ type: "success", title: "Middel bijgewerkt" })
      } else {
        // Create new equipment
        await createEquipment.mutateAsync({
          workspace_id: currentWorkspaceId,
          name: data.name,
          equipment_type: data.equipment_type,
          license_plate: data.license_plate,
          daily_rate: data.daily_rate,
          daily_capacity_hours: data.daily_capacity_hours,
          notes: data.notes,
        })
        addToast({ type: "success", title: "Middel toegevoegd" })
      }
      setIsEquipmentModalOpen(false)
      setSelectedEquipmentId(null)
    } catch (error) {
      console.error("Failed to save equipment:", error)
      addToast({ type: "error", title: selectedEquipmentId ? "Fout bij bijwerken van middel" : "Fout bij toevoegen van middel" })
    }
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
        <div className="shrink-0 border-b border-border px-6 pt-4">
          <TabsList className="mb-4">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto">
          <TabsContent value="medewerkers" className="h-full mt-0">
            <EmployeesPageContent />
          </TabsContent>

          <TabsContent value="materialen" className="h-full mt-0 p-6">
            <MaterialList
              onAddMaterial={handleAddMaterial}
              onViewMaterial={handleViewMaterial}
            />
          </TabsContent>

          <TabsContent value="middelen" className="h-full mt-0 p-6">
            <EquipmentList
              onAddEquipment={handleAddEquipment}
              onViewEquipment={handleViewEquipment}
            />
          </TabsContent>

          <TabsContent value="weekplanning" className="h-full mt-0">
            <WeekPlanningSection />
          </TabsContent>

          <TabsContent value="bezetting" className="h-full mt-0 p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Resource Bezetting</h2>
                <p className="text-sm text-muted-foreground">
                  Overzicht van teamcapaciteit en geplande uren per week
                </p>
              </div>
              <div className="bg-card rounded-lg border border-border p-6">
                <ResourceHistogram weeksToShow={12} height={400} />
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm text-muted-foreground font-medium">Legenda:</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-zinc-700 dark:bg-zinc-300" />
                  <span className="text-sm text-muted-foreground">Optimaal (70-100%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-red-500" />
                  <span className="text-sm text-muted-foreground">Overbezet (&gt;100%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-zinc-500 dark:bg-zinc-400" />
                  <span className="text-sm text-muted-foreground">Onderbezet (&lt;70%)</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Material Form Modal */}
      <MaterialFormModal
        open={isMaterialModalOpen}
        onOpenChange={(open) => {
          setIsMaterialModalOpen(open)
          if (!open) setSelectedMaterialId(null)
        }}
        material={selectedMaterial ?? undefined}
        onSubmit={handleMaterialSubmit}
        isLoading={createMaterial.isPending || updateMaterial.isPending}
      />

      {/* Equipment Form Modal */}
      <EquipmentFormModal
        open={isEquipmentModalOpen}
        onOpenChange={(open) => {
          setIsEquipmentModalOpen(open)
          if (!open) setSelectedEquipmentId(null)
        }}
        equipment={selectedEquipment ?? undefined}
        onSubmit={handleEquipmentSubmit}
        isLoading={createEquipment.isPending || updateEquipment.isPending}
      />
    </div>
  )
}

export default function ResourcesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-800" />
          <p className="text-sm text-muted-foreground">Laden...</p>
        </div>
      </div>
    }>
      <ResourcesPageContent />
    </Suspense>
  )
}
