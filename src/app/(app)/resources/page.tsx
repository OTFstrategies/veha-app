"use client"

import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Package, Wrench, Calendar } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { useWorkspaceStore } from "@/stores/workspace-store"

// Import existing employee page content
import EmployeesPageContent from "./EmployeesPageContent"
import { MaterialList } from "@/components/resources/MaterialList"
import { EquipmentList } from "@/components/resources/EquipmentList"
import { WeekPlanningSection } from "./WeekPlanningSection"
import { MaterialFormModal, type MaterialFormData } from "@/components/resources/MaterialFormModal"
import { EquipmentFormModal, type EquipmentFormData } from "@/components/resources/EquipmentFormModal"
import { useCreateMaterial } from "@/queries/materials"
import { useCreateEquipment } from "@/queries/equipment"

const tabs = [
  { id: "medewerkers", label: "Medewerkers", icon: Users },
  { id: "materialen", label: "Materialen", icon: Package },
  { id: "middelen", label: "Middelen", icon: Wrench },
  { id: "weekplanning", label: "Weekplanning", icon: Calendar },
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

  // State for selected items (for future edit modal views)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null)

  // Mutations
  const createMaterial = useCreateMaterial()
  const createEquipment = useCreateEquipment()

  const handleTabChange = (value: string) => {
    router.push(`/resources?tab=${value}`)
  }

  // Material handlers
  const handleAddMaterial = () => {
    setIsMaterialModalOpen(true)
  }

  const handleViewMaterial = (materialId: string) => {
    setSelectedMaterialId(materialId)
    // TODO: Open material detail/edit modal
  }

  const handleMaterialSubmit = async (data: MaterialFormData) => {
    if (!currentWorkspaceId) {
      addToast({ type: "error", title: "Geen werkruimte geselecteerd" })
      return
    }

    try {
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
      setIsMaterialModalOpen(false)
    } catch (error) {
      console.error("Failed to create material:", error)
      addToast({ type: "error", title: "Fout bij toevoegen van materiaal" })
    }
  }

  // Equipment handlers
  const handleAddEquipment = () => {
    setIsEquipmentModalOpen(true)
  }

  const handleViewEquipment = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId)
    // TODO: Open equipment detail/edit modal
  }

  const handleEquipmentSubmit = async (data: EquipmentFormData) => {
    if (!currentWorkspaceId) {
      addToast({ type: "error", title: "Geen werkruimte geselecteerd" })
      return
    }

    try {
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
      setIsEquipmentModalOpen(false)
    } catch (error) {
      console.error("Failed to create equipment:", error)
      addToast({ type: "error", title: "Fout bij toevoegen van middel" })
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
        </div>
      </Tabs>

      {/* Material Form Modal */}
      <MaterialFormModal
        open={isMaterialModalOpen}
        onOpenChange={setIsMaterialModalOpen}
        onSubmit={handleMaterialSubmit}
        isLoading={createMaterial.isPending}
      />

      {/* Equipment Form Modal */}
      <EquipmentFormModal
        open={isEquipmentModalOpen}
        onOpenChange={setIsEquipmentModalOpen}
        onSubmit={handleEquipmentSubmit}
        isLoading={createEquipment.isPending}
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
