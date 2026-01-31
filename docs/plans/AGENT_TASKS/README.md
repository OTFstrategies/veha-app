# VEHA Dashboard - Fase 2 Agent Tasks

## Overzicht

Dit document beschrijft 7 parallelle taken die door een agent team tegelijk kunnen worden uitgevoerd.

**Totale geschatte inspanning:** 40-50 uur
**Aanbevolen team:** 3-4 agents parallel

---

## Task Matrix

| ID | Taak | Tijd | Agent | Dependencies | Status |
|----|------|------|-------|--------------|--------|
| HP-1 | Toast Notifications | 2-3u | Frontend | Geen | ⬜ |
| HP-2 | Client Portal | 8-10u | Full-stack | Geen | ⬜ |
| HP-3 | Auto-Scheduling | 6-8u | Full-stack | Geen | ⬜ |
| MP-1 | Critical Path Vis | 4-5u | Frontend | Geen | ⬜ |
| MP-2 | Conflict Detection UI | 4-5u | Frontend | Geen | ⬜ |
| MP-3 | Dependency Arrows | 5-6u | Frontend | Geen | ⬜ |
| MP-4 | Drag-to-Resize | 8-10u | Frontend | Geen | ⬜ |

---

## Parallellisatie Strategie

### Optimale Verdeling (4 Agents)

```
Agent 1 (Frontend Focus):
├── HP-1: Toast Notifications (2-3u)
└── MP-1: Critical Path Vis (4-5u)
    Totaal: 6-8u

Agent 2 (Full-stack):
└── HP-2: Client Portal (8-10u)
    Totaal: 8-10u

Agent 3 (Full-stack):
└── HP-3: Auto-Scheduling (6-8u)
    Totaal: 6-8u

Agent 4 (Frontend Interactions):
├── MP-2: Conflict Detection UI (4-5u)
└── MP-3: Dependency Arrows (5-6u)
    Totaal: 9-11u

After initial completion:
Agent 1 or 3: MP-4: Drag-to-Resize (8-10u)
```

### Minimale Verdeling (2 Agents)

```
Agent 1 (UI/UX):
├── HP-1: Toast Notifications
├── MP-1: Critical Path Vis
├── MP-2: Conflict Detection UI
└── MP-3: Dependency Arrows
    Totaal: 15-19u

Agent 2 (Business Logic):
├── HP-2: Client Portal
├── HP-3: Auto-Scheduling
└── MP-4: Drag-to-Resize
    Totaal: 22-28u
```

---

## Agent Instructies

### Vooraf

Elke agent moet:
1. Het specifieke task document lezen in `docs/plans/AGENT_TASKS/`
2. De genoemde bestanden verkennen om context te krijgen
3. De verificatie checklist gebruiken als acceptance criteria

### Code Conventies

- **Taal:** Nederlands voor UI teksten, Engels voor code/comments
- **Styling:** TailwindCSS met stone kleuren
- **State:** React Query voor server state, Zustand voor UI state
- **Types:** TypeScript strict mode
- **Testing:** Handmatige verificatie via checklist

### Git Workflow

Elke agent maakt een feature branch:
```bash
git checkout -b feature/HP1-toast-notifications
git checkout -b feature/HP2-client-portal
git checkout -b feature/HP3-auto-scheduling
# etc.
```

Na completion:
```bash
git add .
git commit -m "feat(HP-1): integrate toast notifications

- Add ToastProvider to root layout
- Add toast calls to all form modals
- Dutch translations for all messages

Closes #HP-1"
```

---

## Task Details

### HP-1: Toast Notifications
**File:** `HP1_TOAST_NOTIFICATIONS.md`
**Scope:** Integreer bestaand toast component
**Key Files:**
- `src/app/layout.tsx`
- `src/components/clients/*.tsx`
- `src/components/employees/*.tsx`
- `src/components/projects/TaskEditor.tsx`

---

### HP-2: Client Portal
**File:** `HP2_CLIENT_PORTAL.md`
**Scope:** Verfijn portal met notes, filtering, role-based UI
**Key Files:**
- `supabase/migrations/003_client_notes.sql`
- `src/queries/portal.ts`
- `src/components/portal/*.tsx`
- `src/app/(portal)/**/*.tsx`

---

### HP-3: Auto-Scheduling
**File:** `HP3_AUTO_SCHEDULING.md`
**Scope:** UI voor dependency management met cascade preview
**Key Files:**
- `src/lib/scheduling/auto-schedule.ts` (bestaat)
- `src/queries/tasks.ts`
- `src/components/projects/TaskEditor.tsx`
- `src/components/projects/CascadePreviewModal.tsx` (nieuw)
- `src/stores/task-history-store.ts` (nieuw)

---

### MP-1: Critical Path Visualisatie
**File:** `MP1_CRITICAL_PATH.md`
**Scope:** Visualiseer critical path in Gantt
**Key Files:**
- `src/lib/scheduling/critical-path.ts` (bestaat)
- `src/queries/tasks.ts`
- `src/components/projects/TaskBar.tsx`
- `src/components/projects/GanttToolbar.tsx`

---

### MP-2: Conflict Detection UI
**File:** `MP2_CONFLICT_DETECTION.md`
**Scope:** Toon conflict warnings voor dubbele boekingen
**Key Files:**
- `src/lib/scheduling/conflict-detection.ts` (bestaat)
- `src/queries/conflicts.ts` (nieuw)
- `src/components/projects/ConflictBadge.tsx` (nieuw)
- `src/components/projects/SchedulerPanel.tsx`

---

### MP-3: Dependency Arrows
**File:** `MP3_DEPENDENCY_ARROWS.md`
**Scope:** Render dependency pijlen in Gantt
**Key Files:**
- `src/components/projects/DependencyArrow.tsx` (bestaat, uitbreiden)
- `src/components/projects/utils/task-positions.ts` (nieuw)
- `src/components/projects/utils/dependency-paths.ts` (nieuw)
- `src/components/projects/GanttPanel.tsx`

---

### MP-4: Drag-to-Resize
**File:** `MP4_DRAG_TO_RESIZE.md`
**Scope:** Drag-and-drop voor task bars
**Key Files:**
- `package.json` (@dnd-kit dependencies)
- `src/components/projects/DraggableTaskBar.tsx` (nieuw)
- `src/components/projects/ResizableTaskBar.tsx` (nieuw)
- `src/components/projects/ProjectGanttScheduler.tsx`

---

## Verificatie Workflow

Na elke task completion:

1. **Self-test:** Agent voert eigen verificatie checklist uit
2. **Commit:** Agent commit met descriptive message
3. **Update status:** Markeer task als ✅ in dit document
4. **Next task:** Begin aan volgende task indien toegewezen

---

## Integration Points

Let op deze gedeelde bestanden waar meerdere tasks wijzigingen maken:

| Bestand | Tasks |
|---------|-------|
| `src/app/layout.tsx` | HP-1 |
| `src/queries/tasks.ts` | HP-3, MP-1 |
| `src/components/projects/GanttPanel.tsx` | MP-1, MP-3, MP-4 |
| `src/components/projects/GanttToolbar.tsx` | HP-3, MP-1, MP-3 |
| `src/components/projects/TaskEditor.tsx` | HP-1, HP-3, MP-2 |
| `src/components/projects/ProjectGanttScheduler.tsx` | MP-3, MP-4 |

**Merge strategie:** First-come-first-serve, latere agents rebased op main

---

## Definition of Done (Hele Fase)

- [ ] Alle 7 tasks hebben status ✅
- [ ] Alle verificatie checklists zijn volledig afgevinkt
- [ ] Geen TypeScript errors
- [ ] Geen console errors in browser
- [ ] Dark mode werkt op alle nieuwe components
- [ ] Nederlandse vertalingen overal consistent
- [ ] Feature branches gemerged naar main
- [ ] Deployed naar Vercel en getest

---

*Laatste update: 31 januari 2026*
