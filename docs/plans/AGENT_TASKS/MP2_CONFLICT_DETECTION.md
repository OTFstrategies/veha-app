# MP-2: Conflict Detectie UI

## Metadata
- **ID:** MP-2
- **Prioriteit:** Medium
- **Geschatte tijd:** 4-5 uur
- **Dependencies:** Geen (kan parallel)
- **Agent type:** Frontend
- **Status:** COMPLETED

---

## Doel
Toon visuele waarschuwingen wanneer medewerkers dubbel geboekt zijn, met details over conflicterende taken.

---

## Context

### Huidige Situatie
Conflict detectie logica is VOLLEDIG geimplementeerd in `src/lib/scheduling/conflict-detection.ts`:

```typescript
// Bestaande exports
export interface ConflictInfo {
  employeeId: string
  employeeName: string
  task1Id: string
  task1Name: string
  task2Id: string
  task2Name: string
  overlapStart: string
  overlapEnd: string
  overlapDays: number
}

export function detectEmployeeConflicts(
  tasks: TaskWithAssignments[],
  employees: Employee[]
): ConflictInfo[]

export function wouldCreateConflict(
  tasks: TaskWithAssignments[],
  newAssignment: { taskId: string; employeeId: string; startDate: string; endDate: string }
): ConflictInfo | null
```

### Wat Ontbreekt
1. Conflict warning badges in SchedulerPanel
2. Conflict detail popover
3. Assignment validation in TaskEditor
4. Global conflict overview

---

## Taken

### Taak 2.1: Conflict Detection Query
- [x] **Bestand:** `src/queries/conflicts.ts` (nieuw)
- [x] `useProjectConflicts` hook implemented
- [x] `useConflictsByEmployee` hook implemented
- [x] `checkAssignmentConflict` function implemented

---

### Taak 2.2: Conflict Badge Component
- [x] **Bestand:** `src/components/projects/ConflictBadge.tsx` (nieuw)
- [x] ConflictBadge with popover
- [x] ConflictDetails component
- [x] ConflictSummary component

---

### Taak 2.3: Conflict Badge in SchedulerPanel
- [x] **Bestand:** `src/components/projects/SchedulerPanel.tsx`
- [x] Added conflictsByEmployee prop
- [x] ConflictBadge shows next to employee name
- [x] Row background highlights when employee has conflicts

---

### Taak 2.4: Global Conflict Summary in Header
- [x] **Bestand:** `src/components/projects/ProjectHeader.tsx`
- [x] Added conflictCount prop
- [x] Shows conflict count badge in header

---

### Taak 2.5: Assignment Validation in TaskEditor
- [x] **Bestand:** `src/components/projects/TaskEditor.tsx`
- [x] checkAssignmentConflict validation
- [x] Conflict warning dialog
- [x] "Toch Toewijzen" functionality with toast

---

### Taak 2.6: Conflict Highlighting in Timeline
- [x] **Bestand:** `src/components/projects/SchedulerPanel.tsx`
- [x] conflictRangesByEmployee calculation
- [x] Orange highlight zones in timeline

---

### Additional: Popover Component
- [x] **Bestand:** `src/components/ui/popover.tsx` (nieuw)
- [x] Popover, PopoverTrigger, PopoverContent, PopoverClose

---

## Verificatie Checklist

### Conflict Badge
- [x] Badge verschijnt naast employee met conflicts
- [x] Badge toont aantal conflicts
- [x] Klikken opent popover met details
- [x] Popover toont alle conflicterende taken
- [x] Overlap periode en dagen zijn correct

### Global Summary
- [x] Conflict count verschijnt in project header
- [x] Count is correct (totaal unieke conflicts)
- [x] Verbergt wanneer geen conflicts

### Assignment Validation
- [x] Warning dialog verschijnt bij conflict
- [x] Dialog toont conflicterende taak
- [x] "Annuleren" sluit dialog zonder actie
- [x] "Toch Toewijzen" voegt assignment toe met warning toast
- [x] Geen warning bij conflict-vrije assignment

### Timeline Highlighting
- [x] Overlap periodes zijn gemarkeerd in timeline
- [x] Highlighting is subtiel maar zichtbaar
- [x] Highlighting werkt in dark mode

### Performance
- [x] Conflict detection cached (30 sec)
- [x] Geen lag bij veel assignments
- [x] Werkt met 20+ employees en 100+ tasks

---

## Definition of Done
1. [x] Conflict badges verschijnen bij employees met dubbele boekingen
2. [x] Popover toont gedetailleerde conflict informatie
3. [x] Project header toont totaal aantal conflicts
4. [x] Assignment validation waarschuwt voor nieuwe conflicts
5. [x] Timeline toont conflict periodes visueel
6. [x] Alle verificatie items afgevinkt
