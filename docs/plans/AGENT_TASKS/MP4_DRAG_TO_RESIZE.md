# MP-4: Task Drag-to-Resize

## Metadata
- **ID:** MP-4
- **Prioriteit:** Medium
- **Geschatte tijd:** 8-10 uur
- **Dependencies:** Geen (kan parallel)
- **Agent type:** Frontend
- **Status:** COMPLETED

---

## Doel
Implementeer drag-and-drop functionaliteit om task bars in de Gantt chart te verplaatsen en te resizen.

---

## Context

### Huidige Situatie
- [x] @dnd-kit/core en @dnd-kit/utilities geinstalleerd
- [x] DraggableTaskBar component gemaakt met drag en resize handles
- [x] Auto-schedule logica bestaat al voor date recalculation

### Library Keuze
**@dnd-kit/core** - Modern, onderhouden, TypeScript support, accessible

---

## Taken

### Taak 4.1: Install Dependencies
- [x] COMPLETED

**Commando:**
```bash
npm install @dnd-kit/core @dnd-kit/utilities
```

---

### Taak 4.2: DnD Context Provider
- [x] COMPLETED

**Bestand:** `src/components/projects/ProjectGanttScheduler.tsx`

DndContext is toegevoegd met:
- MouseSensor met 5px activation distance
- TouchSensor met 200ms delay
- handleDragStart, handleDragMove, handleDragEnd handlers
- State voor activeTaskId en dragPreview

---

### Taak 4.3: Draggable TaskBar
- [x] COMPLETED

**Bestand:** `src/components/projects/DraggableTaskBar.tsx` (nieuw)

Component bevat:
- useDraggable hook van @dnd-kit/core
- Support voor alle task types (regular, milestone, summary)
- Critical path styling
- Dependency highlighting
- Date preview tooltip tijdens drag
- Resize handles met ew-resize cursor

---

### Taak 4.4: Resize Handles
- [x] COMPLETED (geintegreerd in DraggableTaskBar)

Resize handles:
- Links voor start date
- Rechts voor end date
- Verschijnen on hover met transition
- Voorkomen drag via stopPropagation

---

### Taak 4.5: Resize Logic in ProjectGanttScheduler
- [x] COMPLETED

**Bestand:** `src/components/projects/ProjectGanttScheduler.tsx`

Toegevoegd:
- resizingTask state met taskId, handle, originalStart, originalEnd, startX
- Mouse move/up event listeners voor resize
- Minimum duration van 1 dag
- Preview update tijdens resize

---

### Taak 4.6: Update Task Dates Mutation
- [x] COMPLETED

**Bestand:** `src/queries/tasks.ts`

useUpdateTaskDates mutation:
- Slaat vorige state op voor undo
- Update start_date, end_date, duration in database
- Optimistic updates
- Invalidates queries na success

---

### Taak 4.7: Visual Feedback During Drag
- [x] COMPLETED

**Bestand:** `src/components/projects/GanttPanel.tsx` en `src/components/projects/GhostTaskBar.tsx`

Toegevoegd:
- GhostTaskBar component toont originele positie
- DraggableTaskBar toont preview positie
- Date columns in grid tonen preview dates
- Shadow en opacity feedback tijdens drag

---

### Taak 4.8: Snap to Grid (Optioneel)
- [x] COMPLETED

**Bestand:** `src/components/projects/utils/snap.ts` (nieuw)

Utilities:
- snapToDay - snap naar dag grens
- snapToWeek - snap naar week grens
- pixelsToDays - convert pixels naar dagen
- addDaysToDate - voeg dagen toe aan date string
- formatDate - format Date naar YYYY-MM-DD

---

## Verificatie Checklist

### Basic Drag
- [x] Kan task bar oppakken met mouse
- [x] Task beweegt mee met mouse
- [x] Original position toont ghost outline
- [x] Date preview toont tijdens drag
- [x] Loslaten update task dates
- [x] Toast confirmation na drop

### Resize
- [x] Resize handles verschijnen on hover
- [x] Kan left handle draggen (start date)
- [x] Kan right handle draggen (end date)
- [x] Minimum duration van 1 dag
- [x] Date preview toont tijdens resize
- [x] Loslaten update task dates

### Visual Feedback
- [x] Task bar wordt semi-transparent tijdens drag
- [x] Cursor verandert naar grab/grabbing
- [x] Resize cursor (ew-resize) op handles
- [x] Ghost bar toont original position
- [x] Smooth animation (geen jumps)

### Touch Support
- [x] Drag werkt op touch devices (via TouchSensor)
- [x] Touch delay voorkomt accidental drags (200ms)
- [x] Resize werkt met touch (via mouse events)

### Undo
- [x] Drag/resize changes zijn undo-able
- [x] History store wordt correct bijgewerkt

### Performance
- [x] Geen lag tijdens drag met 50+ tasks
- [x] Smooth 60fps tijdens drag
- [x] Memo's voorkomen re-renders

### Edge Cases
- [x] Kan niet draggen naar negatieve dates
- [x] Kan niet resizen naar 0 of negatieve duration
- [x] Werkt correct met scrolled timeline
- [x] Werkt correct met zoomed timeline

---

## Definition of Done
1. [x] Task bars kunnen worden versleept
2. [x] Task bars kunnen worden geresized
3. [x] Visual feedback is duidelijk en responsive
4. [x] Touch support werkt basis functionaliteit
5. [x] Undo integration werkt
6. [x] Alle verificatie items afgevinkt

---

## Implemented Files

- `src/components/projects/DraggableTaskBar.tsx` - New draggable task bar component
- `src/components/projects/GhostTaskBar.tsx` - Ghost bar showing original position
- `src/components/projects/utils/snap.ts` - Snap utilities for drag operations
- `src/components/projects/ProjectGanttScheduler.tsx` - Updated with DnD context
- `src/components/projects/GanttPanel.tsx` - Updated to use DraggableTaskBar
- `src/queries/tasks.ts` - Added useUpdateTaskDates mutation
