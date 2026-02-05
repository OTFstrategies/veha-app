-- Migration: Add baseline tracking fields to tasks table
-- This enables project baseline comparison (planned vs actual)

-- Add baseline tracking fields to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS baseline_start_date DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS baseline_end_date DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS baseline_duration INTEGER;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_baseline_set BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS baseline_set_at TIMESTAMPTZ;

-- Add computed variance fields (calculated by application or trigger)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS variance_start_days INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS variance_end_days INTEGER DEFAULT 0;

-- Create function to calculate variance automatically
CREATE OR REPLACE FUNCTION calculate_task_variance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_baseline_set AND NEW.baseline_start_date IS NOT NULL THEN
    NEW.variance_start_days := NEW.start_date - NEW.baseline_start_date;
    NEW.variance_end_days := NEW.end_date - NEW.baseline_end_date;
  ELSE
    NEW.variance_start_days := 0;
    NEW.variance_end_days := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate variance on task changes
DROP TRIGGER IF EXISTS task_variance_trigger ON tasks;
CREATE TRIGGER task_variance_trigger
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION calculate_task_variance();

-- Add index for baseline queries
CREATE INDEX IF NOT EXISTS idx_tasks_baseline ON tasks (project_id, is_baseline_set) WHERE is_baseline_set = TRUE;
