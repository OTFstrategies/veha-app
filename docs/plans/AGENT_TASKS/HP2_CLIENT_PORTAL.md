# HP-2: Client Portal Verfijning

## Metadata
- **ID:** HP-2
- **Prioriteit:** Hoog
- **Geschatte tijd:** 8-10 uur
- **Dependencies:** Geen (kan parallel)
- **Agent type:** Full-stack

---

## Doel
Verfijn het client portal met role-based UI, notities functionaliteit, filtering en mobile optimalisatie.

---

## Context

### Huidige Situatie
- Portal routes bestaan: `/portal`, `/portal/projects/[id]`
- Componenten aanwezig: PortalHeader, PortalProjectCard, PortalProjectView
- Rollen gedefinieerd: `klant_editor`, `klant_viewer`
- RLS policies aanwezig in database

### Wat Ontbreekt
1. UI verschilt niet tussen klant_editor en klant_viewer
2. Geen notities/comments functionaliteit voor klanten
3. Geen filtering of zoeken op projecten
4. Mobile layout kan beter

### Bestaande Types
```typescript
// src/types/portal.ts
interface PortalUser {
  id: string
  email: string
  role: 'klant_editor' | 'klant_viewer'
  clientId: string
  clientName: string
}

interface PortalProject {
  id: string
  name: string
  description: string
  status: string
  progress: number
  startDate: string
  endDate: string
  // ...
}
```

---

## Taken

### Taak 2.1: Database Migratie voor Client Notes
- [x] **Bestand:** `supabase/migrations/003_client_notes.sql` (nieuw)

**SQL:**
```sql
-- Client notes tabel
CREATE TABLE public.project_client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index voor snelle queries
CREATE INDEX idx_project_client_notes_project ON project_client_notes(project_id);
CREATE INDEX idx_project_client_notes_created ON project_client_notes(created_at DESC);

-- RLS inschakelen
ALTER TABLE project_client_notes ENABLE ROW LEVEL SECURITY;

-- Klanten kunnen notes lezen van hun eigen projecten
CREATE POLICY "Users can view notes on accessible projects"
  ON project_client_notes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE p.id = project_client_notes.project_id
      AND wm.profile_id = auth.uid()
    )
  );

-- Alleen klant_editor kan notes toevoegen
CREATE POLICY "Editors can insert notes"
  ON project_client_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM projects p
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE p.id = project_client_notes.project_id
      AND wm.profile_id = auth.uid()
      AND wm.role = 'klant_editor'
    )
  );

-- Alleen eigen notes kunnen worden bijgewerkt
CREATE POLICY "Users can update own notes"
  ON project_client_notes
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Alleen eigen notes kunnen worden verwijderd
CREATE POLICY "Users can delete own notes"
  ON project_client_notes
  FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());

-- Updated_at trigger
CREATE TRIGGER update_project_client_notes_updated_at
  BEFORE UPDATE ON project_client_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Uitvoeren:**
```bash
# Via Supabase MCP tool of dashboard
```

---

### Taak 2.2: Types Uitbreiden
- [x] **Bestand:** `src/types/portal.ts`

**Toevoegen:**
```typescript
export interface ProjectClientNote {
  id: string
  projectId: string
  profileId: string
  content: string
  createdAt: string
  updatedAt: string
  // Joined data
  authorName?: string
  authorEmail?: string
}

export interface PortalProjectDetail {
  // Bestaande velden...
  clientNotes: ProjectClientNote[]
}
```

---

### Taak 2.3: Queries Uitbreiden
- [x] **Bestand:** `src/queries/portal.ts`

**Toevoegen:**
```typescript
// Nieuwe query voor notes
export function useProjectNotes(projectId: string) {
  const { workspace } = useCurrentWorkspace()

  return useQuery({
    queryKey: ['portal', 'notes', projectId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('project_client_notes')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          profiles (
            email,
            full_name
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(note => ({
        id: note.id,
        projectId,
        profileId: note.profile_id,
        content: note.content,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
        authorName: note.profiles?.full_name,
        authorEmail: note.profiles?.email
      }))
    },
    enabled: !!projectId && !!workspace
  })
}

// Mutation voor nieuwe note
export function useAddProjectNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ projectId, content }: { projectId: string; content: string }) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('project_client_notes')
        .insert({
          project_id: projectId,
          profile_id: user?.id,
          content
        })

      if (error) throw error
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'notes', projectId] })
    }
  })
}

// Mutation voor note verwijderen
export function useDeleteProjectNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (noteId: string) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('project_client_notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'notes'] })
    }
  })
}
```

---

### Taak 2.4: ClientNotes Component
- [x] **Bestand:** `src/components/portal/ClientNotes.tsx` (nieuw)

```tsx
"use client"

import * as React from "react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Send, Trash2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useProjectNotes, useAddProjectNote, useDeleteProjectNote } from "@/queries/portal"
import { useToast } from "@/components/ui/toast"
import type { ProjectClientNote } from "@/types/portal"

interface ClientNotesProps {
  projectId: string
  userRole: 'klant_editor' | 'klant_viewer'
  currentUserId: string
}

export function ClientNotes({ projectId, userRole, currentUserId }: ClientNotesProps) {
  const [newNote, setNewNote] = React.useState("")
  const { data: notes, isLoading } = useProjectNotes(projectId)
  const addNote = useAddProjectNote()
  const deleteNote = useDeleteProjectNote()
  const { toast } = useToast()

  const canAddNotes = userRole === 'klant_editor'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newNote.trim()) return

    try {
      await addNote.mutateAsync({ projectId, content: newNote.trim() })
      setNewNote("")
      toast({ type: 'success', message: 'Notitie toegevoegd' })
    } catch (error) {
      toast({ type: 'error', message: 'Fout bij toevoegen notitie' })
    }
  }

  async function handleDelete(noteId: string) {
    if (!confirm('Weet je zeker dat je deze notitie wilt verwijderen?')) return

    try {
      await deleteNote.mutateAsync(noteId)
      toast({ type: 'success', message: 'Notitie verwijderd' })
    } catch (error) {
      toast({ type: 'error', message: 'Fout bij verwijderen notitie' })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-stone-100 dark:bg-stone-800 rounded animate-pulse" />
        <div className="h-20 bg-stone-100 dark:bg-stone-800 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-stone-500" />
        <h3 className="font-semibold text-stone-900 dark:text-stone-100">
          Notities ({notes?.length || 0})
        </h3>
      </div>

      {/* Add note form - alleen voor editors */}
      {canAddNotes && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Voeg een notitie toe..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!newNote.trim() || addNote.isPending}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {addNote.isPending ? 'Verzenden...' : 'Verstuur'}
            </Button>
          </div>
        </form>
      )}

      {/* Notes list */}
      <div className="space-y-4">
        {notes?.length === 0 ? (
          <p className="text-sm text-stone-500 dark:text-stone-400 text-center py-8">
            Nog geen notities voor dit project.
            {canAddNotes && ' Voeg de eerste toe!'}
          </p>
        ) : (
          notes?.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              canDelete={note.profileId === currentUserId}
              onDelete={() => handleDelete(note.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function NoteCard({
  note,
  canDelete,
  onDelete
}: {
  note: ProjectClientNote
  canDelete: boolean
  onDelete: () => void
}) {
  return (
    <div className="rounded-lg border border-stone-200 dark:border-stone-700 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-stone-900 dark:text-stone-100 whitespace-pre-wrap">
            {note.content}
          </p>
        </div>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="shrink-0 h-8 w-8 text-stone-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
        <span>{note.authorName || note.authorEmail}</span>
        <span>•</span>
        <span>
          {format(new Date(note.createdAt), "d MMM yyyy 'om' HH:mm", { locale: nl })}
        </span>
      </div>
    </div>
  )
}
```

---

### Taak 2.5: PortalProjectView Uitbreiden
- [x] **Bestand:** `src/components/portal/PortalProjectView.tsx`

**Wijzigingen:**
1. Import ClientNotes component
2. Voeg role prop toe
3. Voeg notities sectie toe

```tsx
// Toevoegen aan imports
import { ClientNotes } from "./ClientNotes"

// Props uitbreiden
interface PortalProjectViewProps {
  project: PortalProjectDetail
  userRole: 'klant_editor' | 'klant_viewer'
  userId: string
}

// In de component, na de tasks section:
<div className="mt-8 border-t border-stone-200 dark:border-stone-700 pt-8">
  <ClientNotes
    projectId={project.id}
    userRole={userRole}
    currentUserId={userId}
  />
</div>
```

---

### Taak 2.6: Project Filtering en Zoeken
- [x] **Bestand:** `src/app/(portal)/portal/page.tsx`

**Toevoegen boven de project grid:**
```tsx
"use client"

import * as React from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function PortalDashboard() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string[]>([])

  const { data: projects } = usePortalProjects()

  // Filter logica
  const filteredProjects = React.useMemo(() => {
    if (!projects) return []

    return projects.filter(project => {
      // Search filter
      const matchesSearch = searchQuery === "" ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter.length === 0 ||
        statusFilter.includes(project.status)

      return matchesSearch && matchesStatus
    })
  }, [projects, searchQuery, statusFilter])

  const statusOptions = [
    { value: 'planned', label: 'Gepland' },
    { value: 'active', label: 'Actief' },
    { value: 'on_hold', label: 'On-hold' },
    { value: 'completed', label: 'Afgerond' },
  ]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            type="search"
            placeholder="Zoek projecten..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Status
              {statusFilter.length > 0 && (
                <span className="ml-1 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs px-2">
                  {statusFilter.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {statusOptions.map(option => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={statusFilter.includes(option.value)}
                onCheckedChange={(checked) => {
                  setStatusFilter(prev =>
                    checked
                      ? [...prev, option.value]
                      : prev.filter(s => s !== option.value)
                  )
                }}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Results count */}
      <p className="text-sm text-stone-500 dark:text-stone-400">
        {filteredProjects.length} project{filteredProjects.length !== 1 ? 'en' : ''} gevonden
      </p>

      {/* Project grid - gebruik filteredProjects */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map(project => (
          <PortalProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
```

---

### Taak 2.7: Role-Based UI Indicators
- [x] **Bestand:** `src/components/portal/PortalProjectView.tsx`

**Voeg toe aan de header sectie:**
```tsx
// Toon role badge
{userRole === 'klant_viewer' && (
  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-xs text-stone-600 dark:text-stone-400">
    <Eye className="h-3 w-3" />
    Alleen lezen
  </div>
)}
```

---

### Taak 2.8: Mobile Responsive Verbeteringen
- [x] **Bestanden:** Alle portal componenten

**Check en fix:**
1. `PortalHeader.tsx` - Hamburger menu voor mobile
2. `PortalProjectCard.tsx` - Stack layout op small screens
3. `PortalProjectView.tsx` - Single column layout op mobile
4. `ClientNotes.tsx` - Full width textarea op mobile

**CSS verbeteringen:**
```tsx
// PortalProjectCard - responsive
<div className="grid gap-2 sm:grid-cols-2">
  {/* content */}
</div>

// PortalProjectView - responsive stats
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {/* stats cards */}
</div>

// ClientNotes - responsive
<Textarea className="min-h-[100px] sm:min-h-[80px]" />
```

---

## Verificatie Checklist

### Database
- [ ] Migratie succesvol uitgevoerd
- [ ] project_client_notes tabel bestaat
- [ ] RLS policies werken correct

### Notities Functionaliteit
- [ ] klant_editor kan notities toevoegen
- [ ] klant_viewer kan notities NIET toevoegen (form niet zichtbaar)
- [ ] Notities verschijnen direct na toevoegen
- [ ] Eigen notities kunnen verwijderd worden
- [ ] Andere notities kunnen NIET verwijderd worden
- [ ] Timestamps zijn correct in NL formaat

### Filtering
- [ ] Zoeken op projectnaam werkt
- [ ] Zoeken op beschrijving werkt
- [ ] Status filter werkt
- [ ] Meerdere status filters combineren werkt
- [ ] "X projecten gevonden" count is correct

### Role-Based UI
- [ ] klant_viewer ziet "Alleen lezen" badge
- [ ] klant_editor ziet notitie form
- [ ] klant_viewer ziet GEEN notitie form

### Mobile
- [ ] Portal werkt op mobile (320px breed)
- [ ] Filters stacken op mobile
- [ ] Project cards zijn leesbaar
- [ ] Notities zijn touch-friendly
- [ ] Geen horizontal scroll

---

## Definition of Done
1. Database migratie toegepast
2. Notities CRUD werkt voor klant_editor
3. Filtering en zoeken geimplementeerd
4. Role-based UI differences zichtbaar
5. Mobile responsive op alle portal pagina's
6. Alle verificatie items afgevinkt
