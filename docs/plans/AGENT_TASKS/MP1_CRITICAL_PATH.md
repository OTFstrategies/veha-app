# MP-1: Critical Path Visualisatie

## Metadata
- **ID:** MP-1
- **Prioriteit:** Medium
- **Geschatte tijd:** 4-5 uur
- **Dependencies:** Geen (kan parallel)
- **Agent type:** Frontend
- **Status:** COMPLETED

---

## Doel
Visualiseer het kritieke pad in de Gantt chart zodat projectmanagers kunnen zien welke taken geen vertraging mogen oplopen.

---

## Context

### Huidige Situatie
CPM algoritme is VOLLEDIG geimplementeerd in `src/lib/scheduling/critical-path.ts`:

```typescript
// Bestaande exports
export interface CriticalPathResult {
  taskId: string
  earlyStart: number
  earlyFinish: number
  lateStart: number
  lateFinish: number
  totalFloat: number
  freeFloat: number
  isCritical: boolean
}

export function calculateCriticalPath(tasks: TaskWithDeps[]): Map<string, CriticalPathResult>
```

### Wat Ontbreekt
1. ~~UI toggle om critical path te tonen/verbergen~~ DONE
2. ~~Visuele highlighting van critical path tasks~~ DONE
3. ~~Float/slack indicator per task~~ DONE
4. ~~Project duration summary~~ DONE

---

## Taken

### Taak 1.1: Critical Path Query - [x] COMPLETED
**Bestand:** `src/queries/tasks.ts` - Uitbreiden

Added `useCriticalPath` hook that calculates critical path for project tasks using `calculateCriticalPathDetailed` from scheduling lib with 5 minute stale time cache.

---

### Taak 1.2: Critical Path Toggle in Toolbar - [x] COMPLETED
**Bestand:** `src/components/projects/GanttToolbar.tsx`

Added Route icon import and showCriticalPath props with "Kritiek Pad" toggle button with active state styling.

---

### Taak 1.3: Critical Path State in ProjectGanttScheduler - [x] COMPLETED
**Bestand:** `src/components/projects/ProjectGanttScheduler.tsx`

Added `showCriticalPath` state and integrated `useCriticalPath` query.

---

### Taak 1.4: TaskBar Critical Path Styling - [x] COMPLETED
**Bestand:** `src/components/projects/TaskBar.tsx`

Added `criticalPathInfo` prop of type `TaskScheduleInfo` with:
- Red styling for critical tasks with ring border
- "KRITIEK" label above critical tasks
- Float indicator (+Xd) for non-critical tasks
- Reduced opacity for high slack tasks (>5 days)

---

### Taak 1.5: Float Column in Task Grid - [x] COMPLETED
**Bestand:** `src/components/projects/GanttPanel.tsx`

Added Slack column (50px width) showing:
- "-" when critical path disabled
- "0d" for critical tasks (red color)
- Float value for non-critical tasks

---

### Taak 1.6: Project Duration Summary - [x] COMPLETED
**Bestand:** `src/components/projects/ProjectHeader.tsx`

Added `criticalPathData` prop with critical path stats display showing project duration and critical task count using Route and Clock icons.

---

### Taak 1.7: Legend voor Critical Path - [x] COMPLETED
**Bestand:** `src/components/projects/GanttLegend.tsx` (nieuw)

Created new component showing legend when critical path is enabled with color coding for critical path, normal tasks, and high slack tasks.

---

## Verificatie Checklist

### Toggle Functionaliteit
- [x] "Kritiek Pad" button verschijnt in toolbar
- [x] Button togglet visual state
- [x] Button toont active state wanneer ingeschakeld

### Visuele Highlighting
- [x] Critical path tasks zijn rood gekleurd
- [x] Critical path tasks hebben ring/border
- [x] "KRITIEK" label verschijnt boven critical tasks
- [x] Normale tasks zijn blauw/beige (VEHA colors)
- [x] Tasks met veel slack zijn lichter (opacity)
- [x] Float indicator (+Xd) verschijnt boven normale tasks

### Slack Kolom
- [x] Kolom verschijnt in task grid
- [x] Toont "0d" voor critical tasks (rood)
- [x] Toont correcte float voor andere tasks
- [x] Header label is "Slack"

### Project Stats
- [x] Projectduur wordt berekend
- [x] Aantal critical tasks wordt getoond
- [x] Stats updaten wanneer tasks wijzigen

### Legend
- [x] Legend verschijnt wanneer critical path actief is
- [x] Legend verbergt wanneer uitgeschakeld
- [x] Alle kleuren zijn gedocumenteerd

### Performance
- [x] Critical path berekening cached (5 min)
- [x] Toggle is instant (geen delay)
- [x] Werkt met 50+ tasks zonder lag

---

## Definition of Done
1. [x] Critical path toggle werkt in toolbar
2. [x] Tasks zijn visueel gedifferentieerd
3. [x] Float/slack is zichtbaar per task
4. [x] Project duration summary toont correcte waarden
5. [x] Legend documenteert alle visuele elementen
6. [x] Alle verificatie items afgevinkt

## Implementation Notes
- TypeScript compilation passes with no errors
- Committed with message: `feat(MP-1): add critical path visualization`
