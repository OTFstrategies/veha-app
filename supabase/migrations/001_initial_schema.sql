-- =============================================================================
-- VEHA Dashboard - Initial Database Schema
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- Enums
-- =============================================================================

CREATE TYPE user_role AS ENUM (
  'admin',
  'vault_medewerker',
  'medewerker',
  'klant_editor',
  'klant_viewer'
);

CREATE TYPE project_status AS ENUM (
  'gepland',
  'actief',
  'on-hold',
  'afgerond',
  'geannuleerd'
);

CREATE TYPE task_status AS ENUM (
  'todo',
  'in_progress',
  'done'
);

CREATE TYPE task_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

CREATE TYPE dependency_type AS ENUM (
  'FS', -- Finish-to-Start
  'SS', -- Start-to-Start
  'FF', -- Finish-to-Finish
  'SF'  -- Start-to-Finish
);

CREATE TYPE work_type AS ENUM (
  'straatwerk',
  'kitwerk',
  'reinigen',
  'kantoor',
  'overig'
);

CREATE TYPE employee_role AS ENUM (
  'uitvoerder',
  'voorman',
  'specialist',
  'projectleider'
);

CREATE TYPE availability_status AS ENUM (
  'beschikbaar',
  'ziek',
  'vakantie',
  'vrij',
  'training'
);

CREATE TYPE equipment_type AS ENUM (
  'voertuig',
  'machine',
  'gereedschap'
);

CREATE TYPE equipment_status AS ENUM (
  'beschikbaar',
  'in_gebruik',
  'onderhoud',
  'defect'
);

-- =============================================================================
-- Core Tables
-- =============================================================================

-- Workspaces (multi-tenant)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (linked to Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace Members (links profiles to workspaces with roles)
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'medewerker',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, profile_id)
);

-- =============================================================================
-- Business Tables
-- =============================================================================

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  phone VARCHAR(50),
  email VARCHAR(255),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Contacts
CREATE TABLE client_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Locations
CREATE TABLE client_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  role employee_role NOT NULL DEFAULT 'uitvoerder',
  email VARCHAR(255),
  phone VARCHAR(50),
  hourly_rate DECIMAL(10, 2) DEFAULT 0,
  weekly_capacity INTEGER DEFAULT 40,
  skills TEXT[] DEFAULT '{}',
  color VARCHAR(20) DEFAULT '#3b82f6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee Availability
CREATE TABLE employee_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status availability_status NOT NULL DEFAULT 'beschikbaar',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  location_id UUID REFERENCES client_locations(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  work_type work_type NOT NULL DEFAULT 'overig',
  status project_status NOT NULL DEFAULT 'gepland',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget_hours DECIMAL(10, 2) DEFAULT 0,
  actual_hours DECIMAL(10, 2) DEFAULT 0,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  wbs VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration INTEGER NOT NULL DEFAULT 1,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  is_milestone BOOLEAN DEFAULT false,
  is_summary BOOLEAN DEFAULT false,
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'normal',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Dependencies
CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  predecessor_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  successor_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  dependency_type dependency_type NOT NULL DEFAULT 'FS',
  lag_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(predecessor_id, successor_id)
);

-- Task Assignments
CREATE TABLE task_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  planned_hours DECIMAL(10, 2) DEFAULT 0,
  actual_hours DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, employee_id)
);

-- Time Entries
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  equipment_type equipment_type NOT NULL,
  license_plate VARCHAR(20),
  daily_rate DECIMAL(10, 2) DEFAULT 0,
  status equipment_status NOT NULL DEFAULT 'beschikbaar',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment Assignments
CREATE TABLE equipment_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- Indexes
-- =============================================================================

CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_profile ON workspace_members(profile_id);
CREATE INDEX idx_clients_workspace ON clients(workspace_id);
CREATE INDEX idx_client_contacts_client ON client_contacts(client_id);
CREATE INDEX idx_client_locations_client ON client_locations(client_id);
CREATE INDEX idx_employees_workspace ON employees(workspace_id);
CREATE INDEX idx_employee_availability_employee ON employee_availability(employee_id);
CREATE INDEX idx_employee_availability_date ON employee_availability(date);
CREATE INDEX idx_projects_workspace ON projects(workspace_id);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_parent ON tasks(parent_id);
CREATE INDEX idx_tasks_dates ON tasks(start_date, end_date);
CREATE INDEX idx_task_dependencies_predecessor ON task_dependencies(predecessor_id);
CREATE INDEX idx_task_dependencies_successor ON task_dependencies(successor_id);
CREATE INDEX idx_task_assignments_task ON task_assignments(task_id);
CREATE INDEX idx_task_assignments_employee ON task_assignments(employee_id);
CREATE INDEX idx_time_entries_task ON time_entries(task_id);
CREATE INDEX idx_time_entries_employee ON time_entries(employee_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);
CREATE INDEX idx_equipment_workspace ON equipment(workspace_id);
CREATE INDEX idx_equipment_assignments_task ON equipment_assignments(task_id);
CREATE INDEX idx_equipment_assignments_equipment ON equipment_assignments(equipment_id);

-- =============================================================================
-- Functions
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_members_updated_at BEFORE UPDATE ON workspace_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_contacts_updated_at BEFORE UPDATE ON client_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_locations_updated_at BEFORE UPDATE ON client_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_availability_updated_at BEFORE UPDATE ON employee_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_assignments_updated_at BEFORE UPDATE ON task_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_assignments_updated_at BEFORE UPDATE ON equipment_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_assignments ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS Helper Functions
-- =============================================================================

-- Get current user's workspace IDs
CREATE OR REPLACE FUNCTION get_user_workspace_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT workspace_id
  FROM workspace_members
  WHERE profile_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user's role in a workspace
CREATE OR REPLACE FUNCTION get_user_role_in_workspace(ws_id UUID)
RETURNS user_role AS $$
DECLARE
  user_role_result user_role;
BEGIN
  SELECT role INTO user_role_result
  FROM workspace_members
  WHERE workspace_id = ws_id AND profile_id = auth.uid();

  RETURN user_role_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has access to a workspace
CREATE OR REPLACE FUNCTION user_has_workspace_access(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM workspace_members
    WHERE workspace_id = ws_id AND profile_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- RLS Policies
-- =============================================================================

-- Profiles: Users can view and edit their own profile
CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY profiles_update ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Workspaces: Users can view workspaces they're members of
CREATE POLICY workspaces_select ON workspaces
  FOR SELECT USING (id IN (SELECT get_user_workspace_ids()));

-- Workspace Members: Users can view members of their workspaces
CREATE POLICY workspace_members_select ON workspace_members
  FOR SELECT USING (workspace_id IN (SELECT get_user_workspace_ids()));

-- Admins can manage workspace members
CREATE POLICY workspace_members_insert ON workspace_members
  FOR INSERT WITH CHECK (
    get_user_role_in_workspace(workspace_id) = 'admin'
  );

CREATE POLICY workspace_members_update ON workspace_members
  FOR UPDATE USING (
    get_user_role_in_workspace(workspace_id) = 'admin'
  );

CREATE POLICY workspace_members_delete ON workspace_members
  FOR DELETE USING (
    get_user_role_in_workspace(workspace_id) = 'admin'
  );

-- Clients: Workspace members can view, staff can edit
CREATE POLICY clients_select ON clients
  FOR SELECT USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY clients_insert ON clients
  FOR INSERT WITH CHECK (
    get_user_role_in_workspace(workspace_id) IN ('admin', 'vault_medewerker')
  );

CREATE POLICY clients_update ON clients
  FOR UPDATE USING (
    get_user_role_in_workspace(workspace_id) IN ('admin', 'vault_medewerker')
  );

CREATE POLICY clients_delete ON clients
  FOR DELETE USING (
    get_user_role_in_workspace(workspace_id) = 'admin'
  );

-- Client Contacts: Access based on client access
CREATE POLICY client_contacts_select ON client_contacts
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE workspace_id IN (SELECT get_user_workspace_ids()))
  );

CREATE POLICY client_contacts_insert ON client_contacts
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT id FROM clients
      WHERE workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(workspace_id) IN ('admin', 'vault_medewerker')
    )
  );

CREATE POLICY client_contacts_update ON client_contacts
  FOR UPDATE USING (
    client_id IN (
      SELECT id FROM clients
      WHERE workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(workspace_id) IN ('admin', 'vault_medewerker')
    )
  );

CREATE POLICY client_contacts_delete ON client_contacts
  FOR DELETE USING (
    client_id IN (
      SELECT id FROM clients
      WHERE workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(workspace_id) IN ('admin', 'vault_medewerker')
    )
  );

-- Client Locations: Same as contacts
CREATE POLICY client_locations_select ON client_locations
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE workspace_id IN (SELECT get_user_workspace_ids()))
  );

CREATE POLICY client_locations_insert ON client_locations
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT id FROM clients
      WHERE workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(workspace_id) IN ('admin', 'vault_medewerker')
    )
  );

CREATE POLICY client_locations_update ON client_locations
  FOR UPDATE USING (
    client_id IN (
      SELECT id FROM clients
      WHERE workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(workspace_id) IN ('admin', 'vault_medewerker')
    )
  );

CREATE POLICY client_locations_delete ON client_locations
  FOR DELETE USING (
    client_id IN (
      SELECT id FROM clients
      WHERE workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(workspace_id) IN ('admin', 'vault_medewerker')
    )
  );

-- Employees: Workspace members can view, staff can edit
CREATE POLICY employees_select ON employees
  FOR SELECT USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY employees_insert ON employees
  FOR INSERT WITH CHECK (
    get_user_role_in_workspace(workspace_id) IN ('admin', 'vault_medewerker')
  );

CREATE POLICY employees_update ON employees
  FOR UPDATE USING (
    get_user_role_in_workspace(workspace_id) IN ('admin', 'vault_medewerker')
  );

CREATE POLICY employees_delete ON employees
  FOR DELETE USING (
    get_user_role_in_workspace(workspace_id) = 'admin'
  );

-- Employee Availability: Based on employee access
CREATE POLICY employee_availability_select ON employee_availability
  FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE workspace_id IN (SELECT get_user_workspace_ids()))
  );

CREATE POLICY employee_availability_insert ON employee_availability
  FOR INSERT WITH CHECK (
    employee_id IN (
      SELECT id FROM employees
      WHERE workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(workspace_id) IN ('admin', 'vault_medewerker')
    )
  );

CREATE POLICY employee_availability_update ON employee_availability
  FOR UPDATE USING (
    employee_id IN (
      SELECT id FROM employees
      WHERE workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(workspace_id) IN ('admin', 'vault_medewerker')
    )
  );

CREATE POLICY employee_availability_delete ON employee_availability
  FOR DELETE USING (
    employee_id IN (
      SELECT id FROM employees
      WHERE workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(workspace_id) IN ('admin', 'vault_medewerker')
    )
  );

-- Projects: Workspace members can view, staff can edit
CREATE POLICY projects_select ON projects
  FOR SELECT USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY projects_insert ON projects
  FOR INSERT WITH CHECK (
    get_user_role_in_workspace(workspace_id) IN ('admin', 'vault_medewerker')
  );

CREATE POLICY projects_update ON projects
  FOR UPDATE USING (
    get_user_role_in_workspace(workspace_id) IN ('admin', 'vault_medewerker', 'klant_editor')
  );

CREATE POLICY projects_delete ON projects
  FOR DELETE USING (
    get_user_role_in_workspace(workspace_id) = 'admin'
  );

-- Tasks: Based on project access
CREATE POLICY tasks_select ON tasks
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE workspace_id IN (SELECT get_user_workspace_ids()))
  );

CREATE POLICY tasks_insert ON tasks
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects
      WHERE workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(workspace_id) IN ('admin', 'vault_medewerker')
    )
  );

CREATE POLICY tasks_update ON tasks
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM projects
      WHERE workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(workspace_id) IN ('admin', 'vault_medewerker', 'medewerker')
    )
  );

CREATE POLICY tasks_delete ON tasks
  FOR DELETE USING (
    project_id IN (
      SELECT id FROM projects
      WHERE workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(workspace_id) IN ('admin', 'vault_medewerker')
    )
  );

-- Task Dependencies: Based on task access
CREATE POLICY task_dependencies_select ON task_dependencies
  FOR SELECT USING (
    predecessor_id IN (
      SELECT id FROM tasks WHERE project_id IN (
        SELECT id FROM projects WHERE workspace_id IN (SELECT get_user_workspace_ids())
      )
    )
  );

CREATE POLICY task_dependencies_insert ON task_dependencies
  FOR INSERT WITH CHECK (
    predecessor_id IN (
      SELECT t.id FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE p.workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(p.workspace_id) IN ('admin', 'vault_medewerker')
    )
  );

CREATE POLICY task_dependencies_delete ON task_dependencies
  FOR DELETE USING (
    predecessor_id IN (
      SELECT t.id FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE p.workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(p.workspace_id) IN ('admin', 'vault_medewerker')
    )
  );

-- Task Assignments: Based on task access
CREATE POLICY task_assignments_select ON task_assignments
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM tasks WHERE project_id IN (
        SELECT id FROM projects WHERE workspace_id IN (SELECT get_user_workspace_ids())
      )
    )
  );

CREATE POLICY task_assignments_insert ON task_assignments
  FOR INSERT WITH CHECK (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE p.workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(p.workspace_id) IN ('admin', 'vault_medewerker')
    )
  );

CREATE POLICY task_assignments_update ON task_assignments
  FOR UPDATE USING (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE p.workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(p.workspace_id) IN ('admin', 'vault_medewerker', 'medewerker')
    )
  );

CREATE POLICY task_assignments_delete ON task_assignments
  FOR DELETE USING (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE p.workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(p.workspace_id) IN ('admin', 'vault_medewerker')
    )
  );

-- Time Entries: Based on task access
CREATE POLICY time_entries_select ON time_entries
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM tasks WHERE project_id IN (
        SELECT id FROM projects WHERE workspace_id IN (SELECT get_user_workspace_ids())
      )
    )
  );

CREATE POLICY time_entries_insert ON time_entries
  FOR INSERT WITH CHECK (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE p.workspace_id IN (SELECT get_user_workspace_ids())
    )
  );

CREATE POLICY time_entries_update ON time_entries
  FOR UPDATE USING (
    employee_id IN (
      SELECT id FROM employees WHERE profile_id = auth.uid()
    )
    OR task_id IN (
      SELECT t.id FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE p.workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(p.workspace_id) IN ('admin', 'vault_medewerker')
    )
  );

CREATE POLICY time_entries_delete ON time_entries
  FOR DELETE USING (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE p.workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(p.workspace_id) IN ('admin', 'vault_medewerker')
    )
  );

-- Equipment: Workspace members can view, staff can edit
CREATE POLICY equipment_select ON equipment
  FOR SELECT USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY equipment_insert ON equipment
  FOR INSERT WITH CHECK (
    get_user_role_in_workspace(workspace_id) IN ('admin', 'vault_medewerker')
  );

CREATE POLICY equipment_update ON equipment
  FOR UPDATE USING (
    get_user_role_in_workspace(workspace_id) IN ('admin', 'vault_medewerker')
  );

CREATE POLICY equipment_delete ON equipment
  FOR DELETE USING (
    get_user_role_in_workspace(workspace_id) = 'admin'
  );

-- Equipment Assignments: Based on task access
CREATE POLICY equipment_assignments_select ON equipment_assignments
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM tasks WHERE project_id IN (
        SELECT id FROM projects WHERE workspace_id IN (SELECT get_user_workspace_ids())
      )
    )
  );

CREATE POLICY equipment_assignments_insert ON equipment_assignments
  FOR INSERT WITH CHECK (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE p.workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(p.workspace_id) IN ('admin', 'vault_medewerker')
    )
  );

CREATE POLICY equipment_assignments_update ON equipment_assignments
  FOR UPDATE USING (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE p.workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(p.workspace_id) IN ('admin', 'vault_medewerker')
    )
  );

CREATE POLICY equipment_assignments_delete ON equipment_assignments
  FOR DELETE USING (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE p.workspace_id IN (SELECT get_user_workspace_ids())
      AND get_user_role_in_workspace(p.workspace_id) IN ('admin', 'vault_medewerker')
    )
  );

-- =============================================================================
-- Profile Creation Trigger
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
