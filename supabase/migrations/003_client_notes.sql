-- Client notes tabel voor het klantportaal
-- Klanten kunnen notities toevoegen aan projecten

CREATE TABLE public.project_client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index voor snelle queries
CREATE INDEX idx_project_client_notes_project ON public.project_client_notes(project_id);
CREATE INDEX idx_project_client_notes_created ON public.project_client_notes(created_at DESC);

-- RLS inschakelen
ALTER TABLE public.project_client_notes ENABLE ROW LEVEL SECURITY;

-- Klanten kunnen notes lezen van hun eigen projecten
CREATE POLICY "Users can view notes on accessible projects"
  ON public.project_client_notes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE p.id = project_client_notes.project_id
      AND wm.profile_id = auth.uid()
    )
  );

-- Alleen klant_editor kan notes toevoegen
CREATE POLICY "Editors can insert notes"
  ON public.project_client_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE p.id = project_client_notes.project_id
      AND wm.profile_id = auth.uid()
      AND wm.role = 'klant_editor'
    )
  );

-- Alleen eigen notes kunnen worden bijgewerkt
CREATE POLICY "Users can update own notes"
  ON public.project_client_notes
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Alleen eigen notes kunnen worden verwijderd
CREATE POLICY "Users can delete own notes"
  ON public.project_client_notes
  FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());

-- Updated_at trigger
CREATE TRIGGER update_project_client_notes_updated_at
  BEFORE UPDATE ON public.project_client_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
