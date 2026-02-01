-- =============================================================================
-- VEHA Dashboard - Equipment Capacity Tracking
-- Migration: 005_equipment_capacity.sql
-- =============================================================================

-- =============================================================================
-- Alter Equipment Table
-- =============================================================================

-- Add capacity tracking to equipment
ALTER TABLE equipment
ADD COLUMN IF NOT EXISTS daily_capacity_hours DECIMAL(4,1) DEFAULT 8.0;

-- =============================================================================
-- New Tables
-- =============================================================================

-- Equipment availability for specific dates (exceptions to default capacity)
CREATE TABLE equipment_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'beschikbaar',
  available_hours DECIMAL(4,1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(equipment_id, date)
);

-- Equipment day assignments to projects/tasks
-- Note: This is different from the existing equipment_assignments table which uses date ranges
-- This table allows per-day hour tracking similar to employee assignments
CREATE TABLE equipment_day_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  hours DECIMAL(4,1) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT equipment_day_assignment_target CHECK (project_id IS NOT NULL OR task_id IS NOT NULL)
);

-- =============================================================================
-- Indexes
-- =============================================================================

CREATE INDEX idx_equipment_availability_equipment ON equipment_availability(equipment_id);
CREATE INDEX idx_equipment_availability_date ON equipment_availability(date);
CREATE INDEX idx_equipment_day_assignments_equipment ON equipment_day_assignments(equipment_id);
CREATE INDEX idx_equipment_day_assignments_date ON equipment_day_assignments(date);
CREATE INDEX idx_equipment_day_assignments_project ON equipment_day_assignments(project_id);
CREATE INDEX idx_equipment_day_assignments_task ON equipment_day_assignments(task_id);

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

ALTER TABLE equipment_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_day_assignments ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS Policies for Equipment Availability
-- =============================================================================

-- Equipment availability: accessible if equipment is accessible (via workspace)
CREATE POLICY equipment_availability_select ON equipment_availability FOR SELECT
  USING (equipment_id IN (
    SELECT e.id FROM equipment e
    WHERE e.workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE profile_id = auth.uid()
    )
  ));

CREATE POLICY equipment_availability_insert ON equipment_availability FOR INSERT
  WITH CHECK (equipment_id IN (
    SELECT e.id FROM equipment e
    WHERE e.workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE profile_id = auth.uid()
      AND role IN ('admin', 'vault_medewerker')
    )
  ));

CREATE POLICY equipment_availability_update ON equipment_availability FOR UPDATE
  USING (equipment_id IN (
    SELECT e.id FROM equipment e
    WHERE e.workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE profile_id = auth.uid()
      AND role IN ('admin', 'vault_medewerker')
    )
  ));

CREATE POLICY equipment_availability_delete ON equipment_availability FOR DELETE
  USING (equipment_id IN (
    SELECT e.id FROM equipment e
    WHERE e.workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE profile_id = auth.uid()
      AND role IN ('admin', 'vault_medewerker')
    )
  ));

-- =============================================================================
-- RLS Policies for Equipment Day Assignments
-- =============================================================================

CREATE POLICY equipment_day_assignments_select ON equipment_day_assignments FOR SELECT
  USING (equipment_id IN (
    SELECT e.id FROM equipment e
    WHERE e.workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE profile_id = auth.uid()
    )
  ));

CREATE POLICY equipment_day_assignments_insert ON equipment_day_assignments FOR INSERT
  WITH CHECK (equipment_id IN (
    SELECT e.id FROM equipment e
    WHERE e.workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE profile_id = auth.uid()
      AND role IN ('admin', 'vault_medewerker')
    )
  ));

CREATE POLICY equipment_day_assignments_update ON equipment_day_assignments FOR UPDATE
  USING (equipment_id IN (
    SELECT e.id FROM equipment e
    WHERE e.workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE profile_id = auth.uid()
      AND role IN ('admin', 'vault_medewerker')
    )
  ));

CREATE POLICY equipment_day_assignments_delete ON equipment_day_assignments FOR DELETE
  USING (equipment_id IN (
    SELECT e.id FROM equipment e
    WHERE e.workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE profile_id = auth.uid()
      AND role IN ('admin', 'vault_medewerker')
    )
  ));
