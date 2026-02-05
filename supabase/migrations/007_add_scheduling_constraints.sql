-- Migration: Add scheduling constraint fields and calendar support
-- This enables advanced scheduling with task constraints and working calendars

-- =============================================================================
-- Task Constraints
-- =============================================================================

-- Add constraint type field to tasks (default ASAP)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS constraint_type TEXT DEFAULT 'ASAP';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS constraint_date DATE;

-- =============================================================================
-- Calendars Table
-- =============================================================================

-- Create calendars table for defining working days
CREATE TABLE IF NOT EXISTS calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  -- Working days (JSON array of day numbers: 0=Sunday, 1=Monday, etc.)
  working_days JSONB DEFAULT '[1, 2, 3, 4, 5]'::jsonb,
  -- Working hours per day
  hours_per_day NUMERIC(4,2) DEFAULT 8.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add calendar_id reference to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS calendar_id UUID REFERENCES calendars(id);

-- =============================================================================
-- Holidays Table
-- =============================================================================

-- Create holidays table for non-working days
CREATE TABLE IF NOT EXISTS calendar_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- Indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_calendars_workspace ON calendars(workspace_id);
CREATE INDEX IF NOT EXISTS idx_calendars_default ON calendars(workspace_id, is_default) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_calendar_holidays_calendar ON calendar_holidays(calendar_id, date);
CREATE INDEX IF NOT EXISTS idx_tasks_calendar ON tasks(calendar_id) WHERE calendar_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_constraint ON tasks(constraint_type) WHERE constraint_type != 'ASAP';

-- =============================================================================
-- Validation Triggers
-- =============================================================================

-- Ensure only one default calendar per workspace
CREATE OR REPLACE FUNCTION check_default_calendar()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE calendars
    SET is_default = FALSE
    WHERE workspace_id = NEW.workspace_id
      AND id != NEW.id
      AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calendar_default_trigger ON calendars;
CREATE TRIGGER calendar_default_trigger
  BEFORE INSERT OR UPDATE ON calendars
  FOR EACH ROW
  EXECUTE FUNCTION check_default_calendar();

-- Update timestamp trigger for calendars
DROP TRIGGER IF EXISTS calendars_updated_at_trigger ON calendars;
CREATE TRIGGER calendars_updated_at_trigger
  BEFORE UPDATE ON calendars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
