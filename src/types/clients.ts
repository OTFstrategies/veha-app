// =============================================================================
// Client Types - Hierarchical Tree View
// =============================================================================

/**
 * Tree node types for the client tree
 */
export type TreeNodeType = 'client' | 'group' | 'contact' | 'location' | 'project'

/**
 * Group types within a client
 */
export type GroupType = 'contacts' | 'locations' | 'projects'

/**
 * Project status types
 */
export type ProjectStatus = 'gepland' | 'actief' | 'on-hold' | 'afgerond' | 'geannuleerd'

// =============================================================================
// Contact (Level 2 - Item)
// =============================================================================

export interface ClientContact {
  id: string
  name: string
  role?: string
  phone?: string
  email?: string
  is_primary: boolean
}

// =============================================================================
// Location (Level 2 - Item)
// =============================================================================

export interface ClientLocation {
  id: string
  name: string
  address?: string
  city?: string
  postal_code?: string
  is_primary: boolean
}

// =============================================================================
// Project (Level 2 - Item)
// =============================================================================

export interface ClientProject {
  id: string
  name: string
  status: ProjectStatus
  progress: number // 0-100
  start_date?: string
  end_date?: string
}

// =============================================================================
// Client (Level 0 - Root Node)
// =============================================================================

export interface Client {
  id: string
  name: string
  address?: string
  city?: string
  postal_code?: string
  phone?: string
  email?: string
  notes?: string
  is_active: boolean
  contacts: ClientContact[]
  locations: ClientLocation[]
  projects: ClientProject[]
}

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for the client tree component
 */
export interface ClientTreeProps {
  /** The list of clients to display */
  clients: Client[]
  /** Called when user selects a client */
  onClientSelect?: (clientId: string) => void
  /** Called when user clicks on a project (navigates to Gantt) */
  onProjectClick?: (projectId: string) => void
  /** Called when user wants to create a new client */
  onAddClient?: () => void
  /** Called when user wants to edit a client */
  onEditClient?: (clientId: string) => void
  /** Called when user wants to delete a client */
  onDeleteClient?: (clientId: string) => void
  /** Called when user wants to add a contact to a client */
  onAddContact?: (clientId: string) => void
  /** Called when user wants to add a location to a client */
  onAddLocation?: (clientId: string) => void
  /** Called when user wants to add a project to a client */
  onAddProject?: (clientId: string) => void
}
