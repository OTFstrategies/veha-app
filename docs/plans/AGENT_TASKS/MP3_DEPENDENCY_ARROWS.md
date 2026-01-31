# MP-3: Dependency Arrows in Gantt

## Metadata
- **ID:** MP-3
- **Prioriteit:** Medium
- **Geschatte tijd:** 5-6 uur
- **Dependencies:** Geen (kan parallel)
- **Agent type:** Frontend
- **Status:** Voltooid

---

## Doel
Render visuele pijlen tussen taken in de Gantt chart om dependencies weer te geven.

---

## Context

### Huidige Situatie
- `DependencyArrow.tsx` component bestaat al in `src/components/projects/`
- Basis SVG path logica is geïmplementeerd
- **NIET** geïntegreerd in GanttPanel

### Bestaande Component
```tsx
// src/components/projects/DependencyArrow.tsx
interface DependencyArrowProps {
  from: { x: number; y: number }
  to: { x: number; y: number }
  type: 'FS' | 'SS' | 'FF' | 'SF'
}
```

---

## Taken

### Taak 3.1: Task Position Calculator
- [x] **Voltooid** - Position calculation geïntegreerd in GanttPanel.tsx

**Implementatie:** In plaats van een aparte utility file wordt de positieberekening direct in GanttPanel gedaan via `dependencyArrows` memoized array.

---

### Taak 3.2: Dependency Path Calculator
- [x] **Voltooid** - Path calculation geïntegreerd in DependencyArrow.tsx

**Implementatie:** De DependencyArrow component berekent intern de SVG path op basis van fromX/fromY/toX/toY coördinaten. Ondersteunt L-shaped en S-shaped paden.

---

### Taak 3.3: Enhanced DependencyArrow Component
- [x] **Voltooid** - `src/components/projects/DependencyArrow.tsx`

**Implementatie:**
- Accepteert `fromX`, `fromY`, `toX`, `toY` props
- Berekent intern SVG path met L-shape of S-shape routing
- Ondersteunt `isHighlighted` prop voor hover state
- Bevat `onMouseEnter` en `onMouseLeave` callbacks
- Heeft invisible wider hit area (stroke-[12]) voor makkelijker hoveren
- Werkt in dark mode met juiste kleuren

---

### Taak 3.4: Dependencies Overlay in GanttPanel
- [x] **Voltooid** - `src/components/projects/GanttPanel.tsx`

**Implementatie:**
- `dependencyArrows` memoized array berekent alle arrow posities
- `hoveredDependencyId` state voor tracking welke dependency wordt gehovered
- `isTaskHighlightedByDependency` callback bepaalt of task moet highlighten
- TaskBar en grid rows tonen blauwe highlight wanneer dependency wordt gehovered
- Arrows worden gerenderd met correcte `fromX/fromY/toX/toY` op basis van dependency type (FS, SS, FF, SF)

---

### Taak 3.5: Dependencies Toggle in Toolbar
- [x] **Voltooid** - `src/components/projects/GanttToolbar.tsx`

**Implementatie:**
- Toegevoegd: Dedicated "Afhankelijkheden" toggle button met GitBranch icon
- Button toont active state (variant="default") wanneer ingeschakeld
- Ook beschikbaar in "Weergave" dropdown menu
- Nederlandse tekst: "Afhankelijkheden"

---

### Taak 3.6: Hover Highlighting
- [x] **Voltooid** - Geïntegreerd in GanttPanel.tsx en TaskBar.tsx

**Implementatie:**
- Grid rows krijgen `bg-blue-50 dark:bg-blue-900/20` highlight
- TaskBar component accepteert `isDependencyHighlighted` prop
- TaskBar toont blauwe achtergrond en ring wanneer gehovered via dependency
- Highlight verdwijnt automatisch bij mouse leave

---

### Taak 3.7: Dependency Type Colors (Optioneel)
- [ ] Niet geïmplementeerd (optioneel)

**Opmerking:** Huidige implementatie gebruikt één kleur (stone-400/blue-500 voor highlight). Type-specifieke kleuren kunnen later worden toegevoegd.

---

## Verificatie Checklist

### Arrow Rendering
- [x] Arrows verschijnen tussen linked tasks
- [x] FS dependencies: arrow van rechts predecessor naar links successor
- [x] SS dependencies: arrow van links naar links
- [x] FF dependencies: arrow van rechts naar rechts
- [x] SF dependencies: arrow van links predecessor naar rechts successor
- [x] Arrow heads wijzen in de juiste richting

### Path Quality
- [x] Paths zijn smooth (geen scherpe hoeken, Q-curves voor corners)
- [x] Paths overlappen niet met task bars
- [x] Paths voor taken op verschillende rijen zijn L of S-shaped
- [x] Paths voor taken op dezelfde rij zijn straight lines

### Toggle
- [x] "Afhankelijkheden" button in toolbar
- [x] Toggle toont/verbergt alle arrows
- [x] Button active state wanneer ingeschakeld

### Hover Interaction
- [x] Hover op arrow highlight de arrow
- [x] Hover highlight ook de linked tasks
- [x] Highlight verdwijnt bij mouse leave
- [x] Hover area is groter dan visuele lijn (makkelijk te selecteren)

### Performance
- [x] Geen lag met 20+ dependencies (memoized calculations)
- [x] SVG rendering is efficient
- [x] Memo's voorkomen onnodige recalculations

### Dark Mode
- [x] Arrows zichtbaar in dark mode
- [x] Kleuren werken in beide themes

---

## Definition of Done
1. [x] Dependencies worden visueel weergegeven als pijlen
2. [x] Alle 4 dependency types (FS, SS, FF, SF) renderen correct
3. [x] Toggle werkt om arrows te tonen/verbergen
4. [x] Hover highlighting werkt op arrows en linked tasks
5. [x] Performance is acceptabel met veel dependencies
6. [x] Alle verificatie items afgevinkt
