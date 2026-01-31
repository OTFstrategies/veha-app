"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ClientTree } from "@/components/clients/ClientTree"
import { ClientFormModal, type ClientFormData } from "@/components/clients/ClientFormModal"
import { ContactFormModal, type ContactFormData } from "@/components/clients/ContactFormModal"
import { LocationFormModal, type LocationFormData } from "@/components/clients/LocationFormModal"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/toast"
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  useCreateContact,
  useCreateLocation,
} from "@/queries/clients"
import { useWorkspaceStore } from "@/stores/workspace-store"
import type { Client } from "@/types/clients"

// =============================================================================
// Types
// =============================================================================

type ModalMode = "create" | "edit"

interface ClientModalState {
  open: boolean
  mode: ModalMode
  client: Client | null
}

interface ContactModalState {
  open: boolean
  clientId: string | null
  clientName: string
}

interface LocationModalState {
  open: boolean
  clientId: string | null
  clientName: string
}

interface DeleteConfirmState {
  open: boolean
  clientId: string | null
  clientName: string
}

// =============================================================================
// Page Component
// =============================================================================

export default function ClientsPage() {
  const router = useRouter()
  const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId)
  const { addToast } = useToast()

  // ---------------------------------------------------------------------------
  // Data Queries & Mutations
  // ---------------------------------------------------------------------------

  const { data: clients = [], isLoading, error } = useClients()

  const createClientMutation = useCreateClient()
  const updateClientMutation = useUpdateClient()
  const deleteClientMutation = useDeleteClient()
  const createContactMutation = useCreateContact()
  const createLocationMutation = useCreateLocation()

  // ---------------------------------------------------------------------------
  // Modal States
  // ---------------------------------------------------------------------------

  const [clientModal, setClientModal] = React.useState<ClientModalState>({
    open: false,
    mode: "create",
    client: null,
  })

  const [contactModal, setContactModal] = React.useState<ContactModalState>({
    open: false,
    clientId: null,
    clientName: "",
  })

  const [locationModal, setLocationModal] = React.useState<LocationModalState>({
    open: false,
    clientId: null,
    clientName: "",
  })

  const [deleteConfirm, setDeleteConfirm] = React.useState<DeleteConfirmState>({
    open: false,
    clientId: null,
    clientName: "",
  })

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  // Client handlers
  const handleAddClient = () => {
    setClientModal({
      open: true,
      mode: "create",
      client: null,
    })
  }

  const handleEditClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    if (client) {
      setClientModal({
        open: true,
        mode: "edit",
        client,
      })
    }
  }

  const handleDeleteClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    if (client) {
      setDeleteConfirm({
        open: true,
        clientId,
        clientName: client.name,
      })
    }
  }

  const handleClientSelect = (clientId: string) => {
    // Could navigate to client detail page or show a detail panel
    console.log("Selected client:", clientId)
  }

  const handleClientModalClose = () => {
    setClientModal({
      open: false,
      mode: "create",
      client: null,
    })
  }

  const handleClientSubmit = async (data: ClientFormData) => {
    try {
      if (clientModal.mode === "edit" && clientModal.client) {
        await updateClientMutation.mutateAsync({
          id: clientModal.client.id,
          ...data,
        })
        addToast({ type: "success", title: "Klant succesvol bijgewerkt" })
      } else {
        await createClientMutation.mutateAsync(data)
        addToast({ type: "success", title: "Klant succesvol aangemaakt" })
      }
      handleClientModalClose()
    } catch (err) {
      console.error("Failed to save client:", err)
      addToast({ type: "error", title: "Fout bij opslaan van klant" })
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.clientId) return

    try {
      await deleteClientMutation.mutateAsync(deleteConfirm.clientId)
      addToast({ type: "success", title: "Klant verwijderd" })
      setDeleteConfirm({
        open: false,
        clientId: null,
        clientName: "",
      })
    } catch (err) {
      console.error("Failed to delete client:", err)
      addToast({ type: "error", title: "Fout bij verwijderen van klant" })
    }
  }

  // Contact handlers
  const handleAddContact = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    setContactModal({
      open: true,
      clientId,
      clientName: client?.name || "",
    })
  }

  const handleContactModalClose = () => {
    setContactModal({
      open: false,
      clientId: null,
      clientName: "",
    })
  }

  const handleContactSubmit = async (data: ContactFormData) => {
    if (!contactModal.clientId) return

    try {
      await createContactMutation.mutateAsync({
        client_id: contactModal.clientId,
        ...data,
      })
      addToast({ type: "success", title: "Contactpersoon succesvol aangemaakt" })
      handleContactModalClose()
    } catch (err) {
      console.error("Failed to create contact:", err)
      addToast({ type: "error", title: "Fout bij opslaan van contactpersoon" })
    }
  }

  // Location handlers
  const handleAddLocation = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    setLocationModal({
      open: true,
      clientId,
      clientName: client?.name || "",
    })
  }

  const handleLocationModalClose = () => {
    setLocationModal({
      open: false,
      clientId: null,
      clientName: "",
    })
  }

  const handleLocationSubmit = async (data: LocationFormData) => {
    if (!locationModal.clientId) return

    try {
      await createLocationMutation.mutateAsync({
        client_id: locationModal.clientId,
        ...data,
      })
      addToast({ type: "success", title: "Locatie succesvol aangemaakt" })
      handleLocationModalClose()
    } catch (err) {
      console.error("Failed to create location:", err)
      addToast({ type: "error", title: "Fout bij opslaan van locatie" })
    }
  }

  // Project handlers
  const handleAddProject = (clientId: string) => {
    // Navigate to project creation page with client pre-selected
    router.push(`/projects/new?clientId=${clientId}`)
  }

  const handleProjectClick = (projectId: string) => {
    // Navigate to project detail/Gantt view
    router.push(`/projects/${projectId}`)
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // No workspace selected
  if (!workspaceId) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
            Geen werkruimte geselecteerd
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Selecteer een werkruimte om klanten te bekijken.
          </p>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
        <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">
          Klanten laden...
        </p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
            Fout bij laden
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {error.message || "Er is iets misgegaan bij het laden van de klanten."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <ClientTree
        clients={clients}
        onClientSelect={handleClientSelect}
        onProjectClick={handleProjectClick}
        onAddClient={handleAddClient}
        onEditClient={handleEditClient}
        onDeleteClient={handleDeleteClient}
        onAddContact={handleAddContact}
        onAddLocation={handleAddLocation}
        onAddProject={handleAddProject}
        className="h-full"
      />

      {/* Client Form Modal */}
      <ClientFormModal
        open={clientModal.open}
        onOpenChange={(open) => {
          if (!open) handleClientModalClose()
        }}
        client={clientModal.client}
        onSubmit={handleClientSubmit}
        isSubmitting={createClientMutation.isPending || updateClientMutation.isPending}
      />

      {/* Contact Form Modal */}
      <ContactFormModal
        open={contactModal.open}
        onOpenChange={(open) => {
          if (!open) handleContactModalClose()
        }}
        clientName={contactModal.clientName}
        onSubmit={handleContactSubmit}
        isSubmitting={createContactMutation.isPending}
      />

      {/* Location Form Modal */}
      <LocationFormModal
        open={locationModal.open}
        onOpenChange={(open) => {
          if (!open) handleLocationModalClose()
        }}
        clientName={locationModal.clientName}
        onSubmit={handleLocationSubmit}
        isSubmitting={createLocationMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirm({
              open: false,
              clientId: null,
              clientName: "",
            })
          }
        }}
        title="Klant verwijderen"
        description={`Weet je zeker dat je "${deleteConfirm.clientName}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt. Alle contactpersonen en locaties worden ook verwijderd.`}
        confirmLabel="Verwijderen"
        cancelLabel="Annuleren"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={deleteClientMutation.isPending}
      />
    </>
  )
}
