# HP-3: Auto-Scheduling (Dependency Cascading)

## Metadata
- **ID:** HP-3
- **Prioriteit:** Hoog
- **Geschatte tijd:** 6-8 uur
- **Dependencies:** Geen (kan parallel)
- **Agent type:** Full-stack

---

## Doel
Implementeer automatische datum cascading wanneer task dependencies worden toegevoegd of gewijzigd, met visuele preview en undo functionaliteit.

---

## Context

### Huidige Situatie
De scheduling logica is VOLLEDIG geimplementeerd in `src/lib/scheduling/`:

```typescript
// auto-schedule.ts - Bestaande functies
export function recalculateTaskDates(
  tasks: TaskWithDependencies[],
  changedTaskId: string
): TaskDateUpdate[]

export function validateDependencyNoCycle(
  tasks: TaskWithDependencies[],
  predecessorId: string,
  successorId: string
): boolean

// Ondersteunde dependency types: FS, SS, FF, SF
// Ondersteunt lag/lead times (positief/negatief)
```

### Wat Ontbreekt
1. UI om dependencies toe te voegen in TaskEditor
2. Trigger die recalculateTaskDates aanroept
3. Preview modal die affected tasks toont
4. Visual feedback in Gantt na date changes
5. Undo functionaliteit

### Database Schema (bestaat al)
```sql
-- task_dependencies tabel
CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY,
  predecessor_id UUID REFERENCES tasks(id),
  successor_id UUID REFERENCES tasks(id),
  dependency_type TEXT DEFAULT 'FS', -- FS, SS, FF, SF
  lag_days INTEGER DEFAULT 0
);
```

---

## Taken

### Taak 3.1: Task History Store voor Undo
- [x] **Bestand:** `src/stores/task-history-store.ts` (nieuw)
- [x] Zustand store met undo/redo functionaliteit
- [x] TaskSnapshot interface (id, startDate, endDate)
- [x] HistoryEntry interface (timestamp, description, snapshots)
- [x] pushState, undo, redo, canUndo, canRedo, clear actions
- [x] Max 20 history entries

---

### Taak 3.2: Dependency Queries en Mutations
- [x] **Bestand:** `src/queries/tasks.ts` - Uitbreiden
- [x] usePreviewDependencyChanges mutation (preview zonder te saven)
- [x] useAddDependencyWithCascade mutation (voegt dependency toe + cascading updates)
- [x] useUndoTaskChanges mutation (herstelt vorige datums)
- [x] useRemoveDependency mutation (verwijdert dependency)
- [x] DependencyPreview type export

---

### Taak 3.3: Cascade Preview Modal
- [x] **Bestand:** `src/components/projects/CascadePreviewModal.tsx` (nieuw)
- [x] Dialog component met affected tasks preview
- [x] Toont oude en nieuwe datums
- [x] Aantal taken die worden aangepast
- [x] Bevestig/Annuleer buttons
- [x] Loading state

---

### Taak 3.4: Dependency Selector in TaskEditor
- [x] **Bestand:** `src/components/projects/TaskEditor.tsx` - Uitbreiden
- [x] Dependencies tab met volledige functionaliteit
- [x] Predecessor dropdown (filtert zichzelf en bestaande dependencies)
- [x] Dependency type selector (FS/SS/FF/SF)
- [x] Lag days input (positief/negatief)
- [x] Bestaande dependencies lijst met verwijder knop
- [x] Preview modal integratie
- [x] Toast notificaties

---

### Taak 3.5: Undo Button in Toolbar
- [x] **Bestand:** `src/components/projects/GanttToolbar.tsx` - Uitbreiden
- [x] Undo/Redo buttons toegevoegd
- [x] Disabled state wanneer geen history
- [x] Toast bij succesvolle undo
- [x] projectId prop toegevoegd voor undo context

---

### Taak 3.6: Visual Feedback voor Date Changes
- [x] **Bestand:** `src/components/projects/GanttPanel.tsx` - Uitbreiden
- [x] recentlyChangedTaskIds prop toegevoegd
- [x] Highlight styling voor gewijzigde taken (animate-pulse, orange achtergrond)
- [x] Start/Eind datums in oranje voor gewijzigde taken
- [x] **Bestand:** `src/components/projects/TaskBar.tsx` - Uitbreiden
- [x] isHighlighted prop voor task bars
- [x] Oranje highlight animatie voor milestone, summary en regular tasks

---

## Verificatie Checklist

### Dependency Toevoegen
- [x] Kan predecessor selecteren uit dropdown
- [x] Kan dependency type kiezen (FS/SS/FF/SF)
- [x] Kan lag days instellen (positief en negatief)
- [x] Preview modal toont affected tasks
- [x] Preview toont oude en nieuwe datums
- [x] Bevestigen past datums aan in database
- [x] Toast toont aantal bijgewerkte taken

### Validatie
- [x] Circulaire dependencies worden geweigerd met error message
- [x] Kan niet zichzelf als predecessor selecteren
- [x] Bestaande dependencies worden niet dubbel getoond

### Undo Functionaliteit
- [x] Undo button verschijnt in toolbar
- [x] Undo herstelt vorige datums
- [x] Toast toont wat ongedaan is gemaakt
- [x] Undo button is disabled als er niets te undo is

### Visual Feedback
- [x] Affected tasks highlighten na dependency toevoegen
- [x] Highlight styling aanwezig (animate-pulse, orange)
- [x] Gantt refresht automatisch met nieuwe datums

### Bestaande Dependencies
- [x] Lijst van bestaande dependencies wordt getoond
- [x] Kan dependencies verwijderen
- [x] Verwijderen triggert GEEN auto-recalculation (alleen toevoegen)

---

## Definition of Done
1. [x] Dependency selector werkt in TaskEditor
2. [x] Preview modal toont alle affected tasks
3. [x] Auto-scheduling triggert correct bij dependency toevoegen
4. [x] Undo functionaliteit werkt
5. [x] Visual feedback voor gewijzigde tasks
6. [x] Alle verificatie items afgevinkt
