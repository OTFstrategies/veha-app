// =============================================================================
// Database Types - Generated from Supabase schema
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// =============================================================================
// Enums
// =============================================================================

export type UserRole = 'admin' | 'vault_medewerker' | 'medewerker' | 'klant_editor' | 'klant_viewer'
export type ProjectStatus = 'gepland' | 'actief' | 'on-hold' | 'afgerond' | 'geannuleerd'
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'
export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF'
export type WorkType = 'straatwerk' | 'kitwerk' | 'reinigen' | 'kantoor' | 'overig'
export type EmployeeRole = 'uitvoerder' | 'voorman' | 'specialist' | 'projectleider'
export type AvailabilityStatus = 'beschikbaar' | 'ziek' | 'vakantie' | 'vrij' | 'training'
export type EquipmentType = 'voertuig' | 'machine' | 'gereedschap'
export type EquipmentStatus = 'beschikbaar' | 'in_gebruik' | 'onderhoud' | 'defect'

// =============================================================================
// Table Types
// =============================================================================

export interface Workspace {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  profile_id: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  workspace_id: string
  name: string
  address: string | null
  city: string | null
  postal_code: string | null
  phone: string | null
  email: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ClientContact {
  id: string
  client_id: string
  name: string
  role: string | null
  phone: string | null
  email: string | null
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface ClientLocation {
  id: string
  client_id: string
  name: string
  address: string | null
  city: string | null
  postal_code: string | null
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  workspace_id: string
  profile_id: string | null
  name: string
  role: EmployeeRole
  email: string | null
  phone: string | null
  hourly_rate: number
  weekly_capacity: number
  skills: string[]
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EmployeeAvailability {
  id: string
  employee_id: string
  date: string
  status: AvailabilityStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  workspace_id: string
  client_id: string
  location_id: string | null
  name: string
  description: string | null
  work_type: WorkType
  status: ProjectStatus
  start_date: string
  end_date: string
  budget_hours: number
  actual_hours: number
  progress: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  parent_id: string | null
  wbs: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  duration: number
  progress: number
  is_milestone: boolean
  is_summary: boolean
  status: TaskStatus
  priority: TaskPriority
  sort_order: number
  created_at: string
  updated_at: string
}

export interface TaskDependency {
  id: string
  predecessor_id: string
  successor_id: string
  dependency_type: DependencyType
  lag_days: number
  created_at: string
}

export interface TaskAssignment {
  id: string
  task_id: string
  employee_id: string
  planned_hours: number
  actual_hours: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface TimeEntry {
  id: string
  task_id: string
  employee_id: string
  date: string
  hours: number
  description: string | null
  created_at: string
  updated_at: string
}

export interface Equipment {
  id: string
  workspace_id: string
  name: string
  equipment_type: EquipmentType
  license_plate: string | null
  daily_rate: number
  status: EquipmentStatus
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EquipmentAssignment {
  id: string
  task_id: string
  equipment_id: string
  start_date: string
  end_date: string
  notes: string | null
  created_at: string
  updated_at: string
}

// =============================================================================
// Database Interface
// =============================================================================

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: Workspace
        Insert: Omit<Workspace, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Workspace, 'id' | 'created_at'>>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      workspace_members: {
        Row: WorkspaceMember
        Insert: Omit<WorkspaceMember, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<WorkspaceMember, 'id' | 'created_at'>>
      }
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Client, 'id' | 'created_at'>>
      }
      client_contacts: {
        Row: ClientContact
        Insert: Omit<ClientContact, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ClientContact, 'id' | 'created_at'>>
      }
      client_locations: {
        Row: ClientLocation
        Insert: Omit<ClientLocation, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ClientLocation, 'id' | 'created_at'>>
      }
      employees: {
        Row: Employee
        Insert: Omit<Employee, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Employee, 'id' | 'created_at'>>
      }
      employee_availability: {
        Row: EmployeeAvailability
        Insert: Omit<EmployeeAvailability, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<EmployeeAvailability, 'id' | 'created_at'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'actual_hours' | 'progress'>
        Update: Partial<Omit<Project, 'id' | 'created_at'>>
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Task, 'id' | 'created_at'>>
      }
      task_dependencies: {
        Row: TaskDependency
        Insert: Omit<TaskDependency, 'id' | 'created_at'>
        Update: Partial<Omit<TaskDependency, 'id' | 'created_at'>>
      }
      task_assignments: {
        Row: TaskAssignment
        Insert: Omit<TaskAssignment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TaskAssignment, 'id' | 'created_at'>>
      }
      time_entries: {
        Row: TimeEntry
        Insert: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TimeEntry, 'id' | 'created_at'>>
      }
      equipment: {
        Row: Equipment
        Insert: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Equipment, 'id' | 'created_at'>>
      }
      equipment_assignments: {
        Row: EquipmentAssignment
        Insert: Omit<EquipmentAssignment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<EquipmentAssignment, 'id' | 'created_at'>>
      }
    }
    Enums: {
      user_role: UserRole
      project_status: ProjectStatus
      task_status: TaskStatus
      task_priority: TaskPriority
      dependency_type: DependencyType
      work_type: WorkType
      employee_role: EmployeeRole
      availability_status: AvailabilityStatus
      equipment_type: EquipmentType
      equipment_status: EquipmentStatus
    }
  }
}
