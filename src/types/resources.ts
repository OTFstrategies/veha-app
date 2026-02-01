// =============================================================================
// Resource Types for VEHA Dashboard
// =============================================================================

export type ResourceType = 'medewerker' | 'materiaal' | 'middel';

// =============================================================================
// Materials
// =============================================================================

export type MaterialType = 'verbruiksmateriaal' | 'voorraad' | 'onderdelen';
export type MaterialStatus = 'op_voorraad' | 'bijna_op' | 'besteld' | 'niet_beschikbaar';

export interface Material {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  material_type: MaterialType;
  unit: string;
  unit_price: number;
  quantity_in_stock: number;
  min_stock_level: number;
  status: MaterialStatus;
  supplier: string | null;
  supplier_article_number: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaterialAssignment {
  id: string;
  material_id: string;
  project_id: string | null;
  task_id: string | null;
  quantity: number;
  assigned_date: string;
  notes: string | null;
  created_at: string;
}

// =============================================================================
// Equipment (Middelen) - Extended
// =============================================================================

// Re-export existing types from database.ts
export type { EquipmentType, EquipmentStatus } from './database';

export interface EquipmentExtended {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  equipment_type: string;
  license_plate: string | null;
  daily_rate: number;
  daily_capacity_hours: number;
  status: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EquipmentAvailability {
  id: string;
  equipment_id: string;
  date: string;
  status: string;
  available_hours: number | null;
  notes: string | null;
  created_at: string;
}

export interface EquipmentDayAssignment {
  id: string;
  equipment_id: string;
  project_id: string | null;
  task_id: string | null;
  date: string;
  hours: number;
  notes: string | null;
  created_at: string;
}

// =============================================================================
// Week Planning Resources
// =============================================================================

export type ResourceAvailabilityStatus = 'beschikbaar' | 'beperkt' | 'niet_beschikbaar' | 'vakantie' | 'ziek';

export interface ResourceAvailability {
  status: ResourceAvailabilityStatus;
  availableHours: number;
  notes?: string;
}

export interface ResourceAssignment {
  id: string;
  resourceId: string;
  projectId: string | null;
  projectName?: string;
  taskId: string | null;
  taskName?: string;
  date: string;
  hours: number;
  notes?: string;
}

export interface ResourceDayEntry {
  date: string;
  availability: ResourceAvailability | null;
  assignments: ResourceAssignment[];
  plannedHours: number;
  availableHours: number;
  utilizationPercentage: number;
}

export interface WeekResource {
  id: string;
  type: ResourceType;
  name: string;
  initials?: string;
  color?: string;
  defaultCapacity: number;
  days: Record<string, ResourceDayEntry>; // key is date string YYYY-MM-DD
}

// =============================================================================
// Form Types
// =============================================================================

export interface CreateMaterialInput {
  workspace_id: string;
  name: string;
  description?: string;
  material_type: MaterialType;
  unit?: string;
  unit_price?: number;
  quantity_in_stock?: number;
  min_stock_level?: number;
  supplier?: string;
  supplier_article_number?: string;
  notes?: string;
}

export interface UpdateMaterialInput {
  name?: string;
  description?: string;
  material_type?: MaterialType;
  unit?: string;
  unit_price?: number;
  quantity_in_stock?: number;
  min_stock_level?: number;
  status?: MaterialStatus;
  supplier?: string;
  supplier_article_number?: string;
  notes?: string;
  is_active?: boolean;
}

export interface CreateEquipmentDayAssignmentInput {
  equipment_id: string;
  project_id?: string;
  task_id?: string;
  date: string;
  hours: number;
  notes?: string;
}

export interface CreateMaterialAssignmentInput {
  material_id: string;
  project_id?: string;
  task_id?: string;
  quantity: number;
  assigned_date: string;
  notes?: string;
}

// =============================================================================
// API Response Types
// =============================================================================

export interface MaterialWithAssignments extends Material {
  assignments: MaterialAssignment[];
}

export interface EquipmentWithAvailability extends EquipmentExtended {
  availability: EquipmentAvailability[];
  day_assignments: EquipmentDayAssignment[];
}

// =============================================================================
// Unified Resource View Types (for week planning)
// =============================================================================

export interface UnifiedResource {
  id: string;
  type: ResourceType;
  name: string;
  initials?: string;
  color?: string;
  defaultCapacity: number;
  isActive: boolean;
  // Additional metadata
  metadata: {
    // For employees
    role?: string;
    skills?: string[];
    // For equipment
    equipmentType?: string;
    licensePlate?: string;
    // For materials
    materialType?: string;
    unit?: string;
    quantityInStock?: number;
  };
}

export interface ResourceFilter {
  types?: ResourceType[];
  isActive?: boolean;
  searchQuery?: string;
}

// =============================================================================
// Resource Utilization Types
// =============================================================================

export interface ResourceUtilization {
  resourceId: string;
  resourceType: ResourceType;
  resourceName: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalCapacityHours: number;
  totalPlannedHours: number;
  utilizationPercentage: number;
  dailyBreakdown: {
    date: string;
    capacityHours: number;
    plannedHours: number;
    utilizationPercentage: number;
  }[];
}
