# VEHA Dashboard - Complete Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implementeer alle openstaande features: Toast Notifications, Client Portal verbeteringen, en Gantt features (auto-scheduling, conflict detection, undo UI).

**Architecture:**
- Toast system is al gebouwd (`src/components/ui/toast.tsx`), alleen integratie nodig
- Portal gebruikt bestaande queries en RLS, uitbreiden met read-only Gantt view
- Gantt scheduling engine is volledig (`src/lib/scheduling/`), UI integratie nodig

**Tech Stack:** Next.js 14, TailwindCSS, Supabase (RLS), React Query, Zustand

---

## Phase 1: Toast Notifications (Quick Win)

### Task 1.1: Integreer ToastProvider in Root Layout

**Files:**
- Modify: `src/app/layout.tsx`

**Step 1: Lees huidige layout**

Bekijk de huidige root layout structuur.

**Step 2: Voeg ToastProvider toe**

```tsx
// src/app/layout.tsx - voeg import toe
import { ToastProvider } from "@/components/ui/toast"

// Wrap children met ToastProvider (binnen QueryProvider, buiten body content)
<QueryProvider>
  <ToastProvider>
    {children}
  </ToastProvider>
</QueryProvider>
```

**Step 3: Test toast werkt**

Open browser console en test:
```javascript
// In React DevTools of component
const { addToast } = useToast()
addToast({ type: 'success', title: 'Test werkt!' })
```

**Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: integrate ToastProvider in root layout"
```

---

### Task 1.2: Toast in Resource Mutations

**Files:**
- Modify: `src/app/(app)/resources/page.tsx`

**Step 1: Verifieer useToast import**

Check dat `useToast` al geïmporteerd is (is al aanwezig).

**Step 2: Voeg toast toe aan delete success**

De delete functionaliteit in `MaterialList` en `EquipmentList` moet toast tonen.
Check dat `addToast` wordt aangeroepen na succesvolle delete.

```tsx
// Na succesvolle delete in handleConfirmDelete:
addToast({ type: "success", title: "Verwijderd" })
```

**Step 3: Test delete met toast**

1. Ga naar /resources
2. Voeg test item toe
3. Verwijder item
4. Verwacht: groene toast "Verwijderd"

**Step 4: Commit**

```bash
git add src/app/(app)/resources/page.tsx
git commit -m "feat: add toast notifications to resource mutations"
```

---

### Task 1.3: Toast in alle CRUD Mutations

**Files:**
- Modify: `src/queries/clients.ts`
- Modify: `src/queries/projects.ts`
- Modify: `src/queries/employees.ts`
- Modify: `src/queries/tasks.ts`

**Step 1: Identificeer mutations zonder toast**

Check alle `useMutation` hooks en voeg `onSuccess` toast toe waar nodig.

**Step 2: Patroon voor mutation met toast**

```tsx
// Voorbeeld patroon - NIET in queries, maar in components die mutations aanroepen
const createClient = useCreateClient()

const handleSubmit = async (data) => {
  try {
    await createClient.mutateAsync(data)
    addToast({ type: "success", title: "Klant toegevoegd" })
  } catch (error) {
    addToast({ type: "error", title: "Fout bij toevoegen", description: error.message })
  }
}
```

**Step 3: Commit**

```bash
git add src/app/
git commit -m "feat: add toast notifications to all CRUD operations"
```

---

## Phase 2: Client Portal Improvements

### Task 2.1: Portal Project Detail met Taak Voortgang

**Files:**
- Modify: `src/components/portal/PortalProjectView.tsx`

**Step 1: Lees huidige component**

Check huidige task rendering in PortalProjectView.

**Step 2: Voeg taak progress bars toe**

```tsx
// In task mapping, voeg progress indicator toe
<div className="flex items-center gap-3">
  <span className="flex-1 truncate">{task.name}</span>
  <div className="w-20 bg-zinc-200 rounded-full h-2 dark:bg-zinc-700">
    <div
      className="bg-green-600 h-2 rounded-full"
      style={{ width: `${task.progress}%` }}
    />
  </div>
  <span className="text-xs text-muted-foreground w-10 text-right">
    {task.progress}%
  </span>
</div>
```

**Step 3: Test in portal**

1. Login als klant_editor/klant_viewer
2. Open project detail
3. Verwacht: taken met progress bars

**Step 4: Commit**

```bash
git add src/components/portal/PortalProjectView.tsx
git commit -m "feat: add task progress bars to portal project view"
```

---

### Task 2.2: Read-Only Gantt voor Portal

**Files:**
- Create: `src/components/portal/PortalGantt.tsx`
- Modify: `src/app/(portal)/portal/projects/[id]/page.tsx`

**Step 1: Maak simplified read-only Gantt**

```tsx
// src/components/portal/PortalGantt.tsx
"use client"

import * as React from "react"
import { format, differenceInDays, addDays, startOfWeek, endOfWeek } from "date-fns"
import { nl } from "date-fns/locale"

interface PortalTask {
  id: string
  name: string
  startDate: string
  endDate: string
  progress: number
  status: string
}

interface PortalGanttProps {
  tasks: PortalTask[]
  projectStartDate: string
  projectEndDate: string
}

export function PortalGantt({ tasks, projectStartDate, projectEndDate }: PortalGanttProps) {
  const startDate = new Date(projectStartDate)
  const endDate = new Date(projectEndDate)
  const totalDays = differenceInDays(endDate, startDate) + 1

  // Genereer week headers
  const weeks: Date[] = []
  let current = startOfWeek(startDate, { weekStartsOn: 1 })
  while (current <= endDate) {
    weeks.push(current)
    current = addDays(current, 7)
  }

  const getTaskPosition = (task: PortalTask) => {
    const taskStart = new Date(task.startDate)
    const taskEnd = new Date(task.endDate)
    const left = (differenceInDays(taskStart, startDate) / totalDays) * 100
    const width = ((differenceInDays(taskEnd, taskStart) + 1) / totalDays) * 100
    return { left: `${Math.max(0, left)}%`, width: `${Math.min(100 - left, width)}%` }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500"
      case "in_progress": return "bg-blue-500"
      case "not_started": return "bg-zinc-300 dark:bg-zinc-600"
      default: return "bg-zinc-400"
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-100 dark:bg-zinc-800 border-b">
        <div className="flex">
          <div className="w-48 shrink-0 p-2 font-medium border-r">Taak</div>
          <div className="flex-1 flex">
            {weeks.map((week, i) => (
              <div
                key={i}
                className="flex-1 p-2 text-xs text-center border-r last:border-r-0"
              >
                {format(week, "d MMM", { locale: nl })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="divide-y">
        {tasks.map((task) => {
          const pos = getTaskPosition(task)
          return (
            <div key={task.id} className="flex hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <div className="w-48 shrink-0 p-2 text-sm truncate border-r">
                {task.name}
              </div>
              <div className="flex-1 relative h-10 py-2 px-1">
                <div
                  className={`absolute h-6 rounded ${getStatusColor(task.status)} opacity-80`}
                  style={{ left: pos.left, width: pos.width }}
                >
                  {task.progress > 0 && (
                    <div
                      className="h-full bg-green-700 rounded-l"
                      style={{ width: `${task.progress}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**Step 2: Integreer in project detail page**

```tsx
// src/app/(portal)/portal/projects/[id]/page.tsx
// Voeg import toe
import { PortalGantt } from "@/components/portal/PortalGantt"

// In component, voeg Gantt sectie toe na taken lijst
{project.tasks && project.tasks.length > 0 && (
  <div className="mt-8">
    <h2 className="text-lg font-semibold mb-4">Planning</h2>
    <PortalGantt
      tasks={project.tasks}
      projectStartDate={project.startDate}
      projectEndDate={project.endDate}
    />
  </div>
)}
```

**Step 3: Test portal Gantt**

1. Login als klant
2. Open project met taken
3. Verwacht: Simpele Gantt view met task bars

**Step 4: Commit**

```bash
git add src/components/portal/PortalGantt.tsx src/app/(portal)/portal/projects/\[id\]/page.tsx
git commit -m "feat: add read-only Gantt view to client portal"
```

---

## Phase 3: Gantt UI Improvements

### Task 3.1: Undo/Redo Buttons in Gantt Toolbar

**Files:**
- Modify: `src/components/projects/GanttToolbar.tsx`
- Modify: `src/stores/task-history-store.ts`

**Step 1: Lees huidige toolbar**

Check GanttToolbar voor bestaande controls.

**Step 2: Voeg undo/redo buttons toe**

```tsx
// In GanttToolbar.tsx, voeg imports toe
import { Undo2, Redo2 } from "lucide-react"
import { useTaskHistoryStore } from "@/stores/task-history-store"

// In component
const { canUndo, canRedo, undo, redo } = useTaskHistoryStore()

// In toolbar, voeg buttons toe
<div className="flex items-center gap-1 border-r pr-2 mr-2">
  <Button
    variant="ghost"
    size="icon"
    onClick={undo}
    disabled={!canUndo}
    title="Ongedaan maken (Ctrl+Z)"
  >
    <Undo2 className="h-4 w-4" />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    onClick={redo}
    disabled={!canRedo}
    title="Opnieuw (Ctrl+Y)"
  >
    <Redo2 className="h-4 w-4" />
  </Button>
</div>
```

**Step 3: Test undo/redo**

1. Open project Gantt
2. Sleep een taak
3. Klik undo
4. Verwacht: taak terug op originele positie

**Step 4: Commit**

```bash
git add src/components/projects/GanttToolbar.tsx
git commit -m "feat: add undo/redo buttons to Gantt toolbar"
```

---

### Task 3.2: Keyboard Shortcuts voor Undo/Redo

**Files:**
- Modify: `src/components/projects/ProjectGanttScheduler.tsx`

**Step 1: Voeg keyboard listener toe**

```tsx
// In ProjectGanttScheduler.tsx
import { useTaskHistoryStore } from "@/stores/task-history-store"

// In component
const { undo, redo, canUndo, canRedo } = useTaskHistoryStore()

React.useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      if (canUndo) undo()
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault()
      if (canRedo) redo()
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [undo, redo, canUndo, canRedo])
```

**Step 2: Test keyboard shortcuts**

1. Open Gantt, sleep taak
2. Druk Ctrl+Z
3. Verwacht: taak ongedaan gemaakt

**Step 3: Commit**

```bash
git add src/components/projects/ProjectGanttScheduler.tsx
git commit -m "feat: add Ctrl+Z/Y keyboard shortcuts for undo/redo"
```

---

### Task 3.3: Conflict Detection UI in Gantt

**Files:**
- Modify: `src/components/projects/GanttPanel.tsx`
- Create: `src/components/projects/ConflictWarning.tsx`

**Step 1: Maak ConflictWarning component**

```tsx
// src/components/projects/ConflictWarning.tsx
"use client"

import { AlertTriangle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ConflictWarningProps {
  conflicts: Array<{
    employeeName: string
    taskName: string
    date: string
  }>
}

export function ConflictWarning({ conflicts }: ConflictWarningProps) {
  if (conflicts.length === 0) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-medium">{conflicts.length} conflict(en)</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            {conflicts.slice(0, 5).map((c, i) => (
              <p key={i} className="text-xs">
                {c.employeeName} is al ingepland voor "{c.taskName}" op {c.date}
              </p>
            ))}
            {conflicts.length > 5 && (
              <p className="text-xs text-muted-foreground">
                en {conflicts.length - 5} meer...
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

**Step 2: Integreer in GanttPanel**

```tsx
// In GanttPanel.tsx, voeg conflict detection toe
import { detectEmployeeConflicts } from "@/lib/scheduling/conflict-detection"
import { ConflictWarning } from "./ConflictWarning"

// In component, bereken conflicts
const conflicts = React.useMemo(() => {
  if (!tasks || !assignments) return []
  return detectEmployeeConflicts(tasks, assignments)
}, [tasks, assignments])

// In toolbar of header sectie
<ConflictWarning conflicts={conflicts} />
```

**Step 3: Test conflict detection**

1. Wijs dezelfde medewerker toe aan overlappende taken
2. Verwacht: amber waarschuwing met conflict details

**Step 4: Commit**

```bash
git add src/components/projects/ConflictWarning.tsx src/components/projects/GanttPanel.tsx
git commit -m "feat: add conflict detection warnings to Gantt view"
```

---

### Task 3.4: Critical Path Toggle in Toolbar

**Files:**
- Modify: `src/components/projects/GanttToolbar.tsx`
- Modify: `src/components/projects/GanttPanel.tsx`

**Step 1: Voeg toggle state toe**

```tsx
// In parent component dat GanttToolbar en GanttPanel bevat
const [showCriticalPath, setShowCriticalPath] = React.useState(false)

// Pass naar toolbar
<GanttToolbar
  showCriticalPath={showCriticalPath}
  onToggleCriticalPath={() => setShowCriticalPath(!showCriticalPath)}
/>

// Pass naar panel
<GanttPanel
  showCriticalPath={showCriticalPath}
/>
```

**Step 2: Voeg toggle button toe in toolbar**

```tsx
// In GanttToolbar.tsx
import { Route } from "lucide-react"

<Button
  variant={showCriticalPath ? "secondary" : "ghost"}
  size="sm"
  onClick={onToggleCriticalPath}
  className="gap-1.5"
>
  <Route className="h-4 w-4" />
  Critical Path
</Button>
```

**Step 3: Style critical path tasks**

```tsx
// In GanttPanel task rendering, voeg conditional styling toe
const isCritical = criticalPathTasks?.includes(task.id)

<div
  className={cn(
    "task-bar",
    isCritical && showCriticalPath && "ring-2 ring-red-500 ring-offset-1"
  )}
/>
```

**Step 4: Commit**

```bash
git add src/components/projects/GanttToolbar.tsx src/components/projects/GanttPanel.tsx
git commit -m "feat: add critical path toggle to Gantt toolbar"
```

---

## Phase 4: Auto-Scheduling Integration

### Task 4.1: Cascade Preview bij Dependency Wijziging

**Files:**
- Modify: `src/components/projects/TaskEditor.tsx`

**Step 1: Check bestaande dependency UI**

Lees TaskEditor voor dependency management sectie.

**Step 2: Voeg preview toe bij dependency selectie**

```tsx
// In TaskEditor dependency sectie
import { usePreviewDependencyChanges } from "@/queries/tasks"

const [selectedPredecessor, setSelectedPredecessor] = React.useState<string | null>(null)

const { data: preview } = usePreviewDependencyChanges(
  selectedPredecessor ? {
    taskId: task.id,
    predecessorId: selectedPredecessor,
    type: "FS",
    lag: 0
  } : null
)

// Toon preview
{preview && (
  <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-sm">
    <p className="font-medium text-amber-800 dark:text-amber-200">
      Deze wijziging zal {preview.affectedTasks.length} taken verplaatsen:
    </p>
    <ul className="mt-1 text-xs text-amber-700 dark:text-amber-300">
      {preview.affectedTasks.slice(0, 3).map(t => (
        <li key={t.id}>• {t.name}: {t.newStartDate} - {t.newEndDate}</li>
      ))}
    </ul>
  </div>
)}
```

**Step 3: Test preview**

1. Open task editor
2. Selecteer een predecessor
3. Verwacht: preview van datum wijzigingen

**Step 4: Commit**

```bash
git add src/components/projects/TaskEditor.tsx
git commit -m "feat: add cascade preview when adding task dependencies"
```

---

## Summary Checklist

| Phase | Task | Status |
|-------|------|--------|
| 1.1 | ToastProvider in layout | ☐ |
| 1.2 | Toast in resource mutations | ☐ |
| 1.3 | Toast in all CRUD | ☐ |
| 2.1 | Portal task progress bars | ☐ |
| 2.2 | Read-only Portal Gantt | ☐ |
| 3.1 | Undo/Redo buttons | ☐ |
| 3.2 | Keyboard shortcuts | ☐ |
| 3.3 | Conflict detection UI | ☐ |
| 3.4 | Critical path toggle | ☐ |
| 4.1 | Dependency cascade preview | ☐ |

---

## Testing Commands

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build
npm run build

# Deploy
npx vercel --prod
```

---

*Plan created: 2026-02-04*
