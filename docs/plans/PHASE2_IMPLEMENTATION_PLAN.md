# VEHA Dashboard - Fase 2 Implementatieplan

## Overzicht

Dit plan beschrijft de implementatie van de resterende features voor VEHA Dashboard, georganiseerd in 2 prioriteitsniveaus met concrete taken en geschatte inspanning.

**Totale geschatte inspanning:** 40-50 uur

---

## Hoge Prioriteit Features

### HP-1: Toast Notifications
**Geschatte inspanning:** 2-3 uur
**Status:** Component bestaat, moet geïntegreerd worden

#### Huidige Situatie
- `src/components/ui/toast.tsx` is volledig geïmplementeerd
- Ondersteunt: success, error, warning, info types
- Auto-dismiss na 5 seconden
- Dark mode ondersteuning
- **NIET** geïntegreerd in de applicatie

#### Taken

| # | Taak | Bestand | Inspanning |
|---|------|---------|------------|
| 1.1 | ToastProvider toevoegen aan root layout | `src/app/layout.tsx` | 15 min |
| 1.2 | Toast calls toevoegen aan ClientFormModal | `src/components/clients/ClientFormModal.tsx` | 20 min |
| 1.3 | Toast calls toevoegen aan ContactFormModal | `src/components/clients/ContactFormModal.tsx` | 15 min |
| 1.4 | Toast calls toevoegen aan LocationFormModal | `src/components/clients/LocationFormModal.tsx` | 15 min |
| 1.5 | Toast calls toevoegen aan EmployeeFormModal | `src/components/employees/EmployeeFormModal.tsx` | 20 min |
| 1.6 | Toast calls toevoegen aan AvailabilityFormModal | `src/components/employees/AvailabilityFormModal.tsx` | 15 min |
| 1.7 | Toast calls toevoegen aan TaskEditor | `src/components/projects/TaskEditor.tsx` | 20 min |
| 1.8 | Toast voor auth acties (login/logout) | `src/app/(auth)/*.tsx` | 30 min |

#### Implementatie

```tsx
// src/app/layout.tsx - Wijziging
import { ToastProvider } from "@/components/ui/toast"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
```

```tsx
// Voorbeeld toast gebruik in form
import { useToast } from "@/components/ui/toast"

function ClientFormModal() {
  const { toast } = useToast()

  async function onSubmit() {
    try {
      await saveClient(data)
      toast({ type: "success", message: "Klant succesvol opgeslagen" })
      onClose()
    } catch (error) {
      toast({ type: "error", message: "Fout bij opslaan klant" })
    }
  }
}
```

#### Verificatie
- [ ] Toast verschijnt bij succesvolle form submit
- [ ] Toast verschijnt bij error
- [ ] Toast auto-dismiss werkt
- [ ] Dark mode styling correct

---

### HP-2: Client Portal Verfijning
**Geschatte inspanning:** 8-10 uur
**Status:** Basis structuur bestaat, verfijning nodig

#### Huidige Situatie
- Routes: `/portal`, `/portal/projects/[id]` bestaan
- Componenten: PortalHeader, PortalProjectCard, PortalProjectView aanwezig
- RLS policies voor `klant_editor` en `klant_viewer` rollen
- **ONTBREEKT:** Role-based UI differences, filtering, mobile optimalisatie

#### Taken

| # | Taak | Bestand | Inspanning |
|---|------|---------|------------|
| 2.1 | Role-based UI conditionals toevoegen | `src/components/portal/PortalProjectView.tsx` | 1 uur |
| 2.2 | Notities/comments veld voor klanten | `src/components/portal/PortalProjectView.tsx` | 2 uur |
| 2.3 | Project filtering (status, type) | `src/app/(portal)/portal/page.tsx` | 1.5 uur |
| 2.4 | Project zoekfunctie | `src/app/(portal)/portal/page.tsx` | 1 uur |
| 2.5 | Mobile responsive verbeteringen | `src/components/portal/*.tsx` | 1.5 uur |
| 2.6 | Klant uitnodiging flow | `src/app/(portal)/invite/page.tsx` (nieuw) | 2 uur |

#### Database Wijziging

```sql
-- Nieuwe tabel voor klant notities
CREATE TABLE public.project_client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: klanten kunnen eigen notities toevoegen
CREATE POLICY "Clients can add notes to their projects"
  ON project_client_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
    AND public.get_user_role_in_workspace(
      (SELECT workspace_id FROM projects WHERE id = project_id)
    ) IN ('klant_editor')
  );
```

#### Implementatie Voorbeeld

```tsx
// Role-based UI in PortalProjectView
function PortalProjectView({ project, userRole }) {
  const canEdit = userRole === 'klant_editor'

  return (
    <div>
      {/* Read-only voor klant_viewer */}
      {canEdit ? (
        <NotesEditor projectId={project.id} />
      ) : (
        <NotesDisplay notes={project.clientNotes} />
      )}
    </div>
  )
}
```

#### Verificatie
- [ ] klant_viewer ziet geen edit buttons
- [ ] klant_editor kan notities toevoegen
- [ ] Filter op projectstatus werkt
- [ ] Zoeken op projectnaam werkt
- [ ] Mobile layout is gebruiksvriendelijk

---

### HP-3: Auto-Scheduling (Dependency Cascading)
**Geschatte inspanning:** 6-8 uur
**Status:** Logica bestaat in `src/lib/scheduling/`, UI integratie ontbreekt

#### Huidige Situatie
- `auto-schedule.ts`: Complete cascading logica voor FS/SS/FF/SF dependencies
- `critical-path.ts`: CPM algoritme geïmplementeerd
- `conflict-detection.ts`: Employee conflict detectie aanwezig
- **ONTBREEKT:** UI triggers, visuele feedback, dependency creation UI

#### Taken

| # | Taak | Bestand | Inspanning |
|---|------|---------|------------|
| 3.1 | Auto-schedule trigger bij dependency toevoegen | `src/queries/tasks.ts` | 1 uur |
| 3.2 | Dependency selector in TaskEditor | `src/components/projects/TaskEditor.tsx` | 2 uur |
| 3.3 | Cascade preview modal | `src/components/projects/CascadePreviewModal.tsx` (nieuw) | 2 uur |
| 3.4 | Visual feedback voor date changes | `src/components/projects/GanttPanel.tsx` | 1.5 uur |
| 3.5 | Undo functionaliteit | `src/stores/task-history-store.ts` (nieuw) | 1.5 uur |

#### Implementatie

```tsx
// src/queries/tasks.ts - Uitbreiding
export function useAddDependency() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, predecessorId, type, lag }) => {
      // 1. Voeg dependency toe
      await supabase.from('task_dependencies').insert({
        successor_id: taskId,
        predecessor_id: predecessorId,
        dependency_type: type,
        lag_days: lag
      })

      // 2. Haal alle tasks op
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*, task_dependencies(*)')
        .eq('project_id', projectId)

      // 3. Bereken nieuwe datums
      const updates = recalculateTaskDates(tasks, taskId)

      // 4. Update tasks met nieuwe datums
      for (const update of updates) {
        await supabase.from('tasks').update({
          start_date: update.startDate,
          end_date: update.endDate
        }).eq('id', update.taskId)
      }

      return updates
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
      toast({ type: 'success', message: 'Dependency toegevoegd, datums bijgewerkt' })
    }
  })
}
```

```tsx
// Cascade Preview Modal
function CascadePreviewModal({ changes, onConfirm, onCancel }) {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Datum Wijzigingen</DialogTitle>
          <DialogDescription>
            De volgende taken worden aangepast door deze dependency:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {changes.map(change => (
            <div key={change.taskId} className="flex justify-between">
              <span>{change.taskName}</span>
              <span className="text-orange-500">
                {change.oldDate} → {change.newDate}
              </span>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Annuleren</Button>
          <Button onClick={onConfirm}>Bevestigen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

#### Verificatie
- [ ] Dependency toevoegen triggert date recalculation
- [ ] Preview modal toont alle affected tasks
- [ ] Dates worden correct aangepast in database
- [ ] Gantt view toont nieuwe datums na refresh
- [ ] Undo functie werkt

---

## Medium Prioriteit Features

### MP-1: Critical Path Visualisatie
**Geschatte inspanning:** 4-5 uur
**Status:** Algoritme bestaat, visualisatie ontbreekt

#### Taken

| # | Taak | Bestand | Inspanning |
|---|------|---------|------------|
| 4.1 | Critical path highlighting in Gantt | `src/components/projects/TaskBar.tsx` | 1.5 uur |
| 4.2 | Float/slack indicator | `src/components/projects/GanttPanel.tsx` | 1 uur |
| 4.3 | Project duration summary | `src/components/projects/ProjectHeader.tsx` | 1 uur |
| 4.4 | Critical path toggle in toolbar | `src/components/projects/GanttToolbar.tsx` | 1 uur |

#### Implementatie

```tsx
// TaskBar.tsx - Critical path styling
function TaskBar({ task, isCritical, totalFloat }) {
  return (
    <div
      className={cn(
        "task-bar",
        isCritical && "border-2 border-red-500 bg-red-100 dark:bg-red-900/30",
        !isCritical && totalFloat > 5 && "opacity-70"
      )}
    >
      {task.name}
      {totalFloat > 0 && (
        <span className="text-xs text-stone-500 ml-2">
          +{totalFloat}d slack
        </span>
      )}
    </div>
  )
}
```

---

### MP-2: Conflict Detectie UI
**Geschatte inspanning:** 4-5 uur
**Status:** Detectie logica bestaat, UI feedback ontbreekt

#### Taken

| # | Taak | Bestand | Inspanning |
|---|------|---------|------------|
| 5.1 | Conflict warning badge in SchedulerPanel | `src/components/projects/SchedulerPanel.tsx` | 1.5 uur |
| 5.2 | Conflict detail popover | `src/components/projects/ConflictPopover.tsx` (nieuw) | 1.5 uur |
| 5.3 | Assignment validation bij task toewijzing | `src/components/projects/TaskEditor.tsx` | 1.5 uur |

#### Implementatie

```tsx
// ConflictPopover.tsx
function ConflictPopover({ conflicts }) {
  return (
    <Popover>
      <PopoverTrigger>
        <AlertTriangle className="h-4 w-4 text-orange-500" />
      </PopoverTrigger>
      <PopoverContent>
        <h4 className="font-semibold text-orange-600">Conflicten Gedetecteerd</h4>
        <ul className="mt-2 space-y-1">
          {conflicts.map(c => (
            <li key={c.id} className="text-sm">
              <span className="font-medium">{c.employeeName}</span> is al
              ingepland voor "{c.conflictingTask}" ({c.overlapDays} dagen overlap)
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
```

---

### MP-3: Dependency Arrows in Gantt
**Geschatte inspanning:** 5-6 uur
**Status:** DependencyArrow component bestaat, integratie ontbreekt

#### Taken

| # | Taak | Bestand | Inspanning |
|---|------|---------|------------|
| 6.1 | SVG overlay layer voor arrows | `src/components/projects/GanttPanel.tsx` | 2 uur |
| 6.2 | Arrow path berekening | `src/components/projects/DependencyArrow.tsx` | 1.5 uur |
| 6.3 | Arrow hover highlighting | `src/components/projects/DependencyArrow.tsx` | 1 uur |
| 6.4 | Toggle voor arrows in toolbar | `src/components/projects/GanttToolbar.tsx` | 30 min |

#### Implementatie

```tsx
// GanttPanel.tsx - Arrow overlay
function GanttPanel({ tasks, dependencies, showDependencies }) {
  const taskPositions = useMemo(() =>
    calculateTaskPositions(tasks), [tasks]
  )

  return (
    <div className="relative">
      {/* Task rows */}
      <div className="task-grid">
        {tasks.map(task => <TaskRow key={task.id} task={task} />)}
      </div>

      {/* Dependency arrows overlay */}
      {showDependencies && (
        <svg className="absolute inset-0 pointer-events-none">
          {dependencies.map(dep => (
            <DependencyArrow
              key={dep.id}
              from={taskPositions[dep.predecessorId]}
              to={taskPositions[dep.successorId]}
              type={dep.type}
            />
          ))}
        </svg>
      )}
    </div>
  )
}
```

---

### MP-4: Task Drag-to-Resize
**Geschatte inspanning:** 8-10 uur
**Status:** Niet geïmplementeerd, vereist drag-and-drop library

#### Library Keuze
**Aanbevolen:** `@dnd-kit/core` (modern, onderhouden, TypeScript support)

#### Taken

| # | Taak | Bestand | Inspanning |
|---|------|---------|------------|
| 7.1 | @dnd-kit installeren en configureren | `package.json` | 30 min |
| 7.2 | DndContext provider toevoegen | `src/components/projects/ProjectGanttScheduler.tsx` | 1 uur |
| 7.3 | Draggable task bar implementeren | `src/components/projects/TaskBar.tsx` | 2 uur |
| 7.4 | Resize handles voor start/eind datum | `src/components/projects/TaskBar.tsx` | 2 uur |
| 7.5 | Drop handler met date calculation | `src/components/projects/GanttPanel.tsx` | 2 uur |
| 7.6 | Visual feedback tijdens drag | `src/components/projects/TaskBar.tsx` | 1 uur |

#### Implementatie

```tsx
// TaskBar.tsx met drag support
import { useDraggable, useDroppable } from '@dnd-kit/core'

function DraggableTaskBar({ task, onDateChange }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { task }
  })

  const style = transform ? {
    transform: `translateX(${transform.x}px)`,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-bar cursor-grab active:cursor-grabbing"
    >
      {/* Left resize handle */}
      <div
        className="resize-handle left-0"
        onMouseDown={(e) => startResize(e, 'start')}
      />

      <span>{task.name}</span>

      {/* Right resize handle */}
      <div
        className="resize-handle right-0"
        onMouseDown={(e) => startResize(e, 'end')}
      />
    </div>
  )
}
```

---

## Implementatie Volgorde

```
Week 1: Toast Notifications + Client Portal Basis
├── HP-1: Toast integratie (2-3 uur)
├── HP-2.1-2.3: Portal role-based UI + notes (4 uur)
└── HP-2.4-2.5: Portal filtering + mobile (2.5 uur)

Week 2: Auto-Scheduling
├── HP-3.1-3.2: Dependency selector + trigger (3 uur)
├── HP-3.3-3.4: Preview modal + visual feedback (3.5 uur)
└── HP-3.5: Undo functionaliteit (1.5 uur)

Week 3: Visualisaties
├── MP-1: Critical Path visualisatie (4-5 uur)
├── MP-2: Conflict detectie UI (4-5 uur)
└── MP-3: Dependency arrows (5-6 uur)

Week 4: Drag-and-Drop
├── MP-4.1-4.3: DnD setup + draggable bars (3.5 uur)
├── MP-4.4-4.5: Resize handles + drop handler (4 uur)
└── MP-4.6: Visual feedback + polish (1 uur)
```

---

## Bestanden Overzicht

### Nieuwe Bestanden
- `src/components/projects/CascadePreviewModal.tsx`
- `src/components/projects/ConflictPopover.tsx`
- `src/stores/task-history-store.ts`
- `src/app/(portal)/invite/page.tsx`
- `supabase/migrations/003_project_client_notes.sql`

### Aan te Passen Bestanden
- `src/app/layout.tsx` - ToastProvider
- `src/components/ui/toast.tsx` - Minor fixes
- `src/components/clients/*.tsx` - Toast calls
- `src/components/employees/*.tsx` - Toast calls
- `src/components/projects/TaskEditor.tsx` - Dependency selector, conflict check
- `src/components/projects/TaskBar.tsx` - Critical path, drag support
- `src/components/projects/GanttPanel.tsx` - Arrows, visual feedback
- `src/components/projects/GanttToolbar.tsx` - New toggles
- `src/components/projects/SchedulerPanel.tsx` - Conflict badges
- `src/components/portal/*.tsx` - Role-based UI
- `src/queries/tasks.ts` - Auto-schedule mutations

---

## Verificatie Checklist

### Hoge Prioriteit
- [ ] Toast notifications werken in alle forms
- [ ] Client portal toont correcte content per rol
- [ ] klant_editor kan notities toevoegen
- [ ] Auto-scheduling triggert bij dependency changes
- [ ] Cascade preview toont affected tasks

### Medium Prioriteit
- [ ] Critical path tasks zijn visueel gemarkeerd
- [ ] Float/slack is zichtbaar per task
- [ ] Conflict warnings verschijnen bij dubbele boekingen
- [ ] Dependency arrows renderen correct
- [ ] Tasks kunnen versleept worden in Gantt
- [ ] Date changes worden correct berekend bij drag

---

## Risico's en Mitigatie

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| Drag-and-drop performance bij veel tasks | Hoog | Virtualisatie, debouncing |
| Complex dependency cycles | Medium | Cycle detection al geïmplementeerd |
| Mobile drag support | Medium | Touch events testen, fallback UI |
| Database race conditions | Hoog | Optimistic locking, transaction support |

---

*Plan opgesteld: 31 januari 2026*
*Geschatte totale inspanning: 40-50 uur*
