# VEHA Dashboard - Bryntum Feature Parity Roadmap

**Datum:** 4 februari 2026
**Doel:** Roadmap voor implementatie van ontbrekende Bryntum features
**Bron:** Gap Analysis (`docs/gap-analysis/2026-02-04-bryntum-comparison.md`)

---

## Executive Summary

**Huidige Status:** 48% feature parity met Bryntum originele requirements
**Target:** 80% feature parity (core + enhanced features)
**Geschatte Doorlooptijd:** 4-6 sprints (8-12 weken)

---

## Sprint Planning

### Sprint 1: Quick Wins & Foundation
**Focus:** Low-effort, high-value features

| Feature | Effort | Prioriteit | Files |
|---------|--------|------------|-------|
| Quick Find (Ctrl+F) | Low | Medium | New: `src/components/ui/search-dialog.tsx` |
| Grouping (Lists) | Low | Medium | Modify: `src/app/(app)/projects/page.tsx` |
| Column Filtering | Low | Medium | Modify: list components |

**Deliverables:**
- [ ] Global search dialog component
- [ ] Project list grouping by status/client
- [ ] Enhanced filter UI for resource lists

**Estimated Points:** 13

---

### Sprint 2: Data Export
**Focus:** PDF/Excel export voor rapportages

| Feature | Effort | Prioriteit | Files |
|---------|--------|------------|-------|
| PDF Export | Medium | High | New: `src/lib/export/pdf-generator.ts` |
| Excel Export | Medium | High | New: `src/lib/export/excel-generator.ts` |
| Export UI | Low | High | New: `src/components/ui/export-menu.tsx` |

**Dependencies:**
- Library: `@react-pdf/renderer` of `jspdf`
- Library: `xlsx` of `exceljs`

**Deliverables:**
- [ ] Export button in toolbar
- [ ] PDF: Project overview met Gantt snapshot
- [ ] Excel: Task list met alle velden

**Estimated Points:** 21

---

### Sprint 3: Baselines & Variance
**Focus:** Project baseline tracking

| Feature | Effort | Prioriteit | Files |
|---------|--------|------------|-------|
| Baseline Data Model | Medium | High | Database migration |
| Baseline UI | Medium | High | Modify: `TaskEditor.tsx`, `GanttPanel.tsx` |
| Variance Display | Low | High | Modify: `ProjectGanttScheduler.tsx` |

**Database Changes:**
```sql
ALTER TABLE tasks ADD COLUMN baseline_start_date DATE;
ALTER TABLE tasks ADD COLUMN baseline_end_date DATE;
ALTER TABLE tasks ADD COLUMN baseline_duration INTEGER;
```

**Deliverables:**
- [ ] "Set Baseline" button in toolbar
- [ ] Baseline bars in Gantt (ghost bars)
- [ ] Variance indicator (on-time, late, early)

**Estimated Points:** 21

---

### Sprint 4: Real-Time Collaboration
**Focus:** Multi-user editing zonder refresh

| Feature | Effort | Prioriteit | Files |
|---------|--------|------------|-------|
| Supabase Realtime Setup | Medium | High | New: `src/lib/realtime/subscriptions.ts` |
| Task Updates Broadcast | Medium | High | Modify: `src/queries/tasks.ts` |
| Presence Indicators | Low | Medium | New: `src/components/ui/presence.tsx` |

**Dependencies:**
- Supabase Realtime (already included)

**Deliverables:**
- [ ] Live task updates in Gantt
- [ ] User avatars showing who is viewing
- [ ] Conflict resolution for simultaneous edits

**Estimated Points:** 21

---

### Sprint 5: Resource Utilization
**Focus:** Capacity planning view

| Feature | Effort | Prioriteit | Files |
|---------|--------|------------|-------|
| Resource Histogram | High | High | New: `src/components/resources/ResourceHistogram.tsx` |
| Utilization API | Medium | High | New: `src/queries/resource-utilization.ts` |
| Over-allocation Alerts | Low | Medium | Modify: `ConflictWarning.tsx` |

**Dependencies:**
- Chart library: `recharts` (already installed)

**Deliverables:**
- [ ] Resource histogram view (bar chart per week)
- [ ] Over/under allocation highlighting
- [ ] Click to see task details

**Estimated Points:** 34

---

### Sprint 6: Advanced Scheduling (Optional)
**Focus:** Professional scheduling constraints

| Feature | Effort | Prioriteit | Files |
|---------|--------|------------|-------|
| Constraint Types | High | Medium | Modify: `auto-schedule.ts`, `TaskEditor.tsx` |
| Custom Calendars | High | Low | New: `src/lib/scheduling/calendars.ts` |
| Holiday Support | Medium | Low | Database + UI |

**Deliverables:**
- [ ] Constraint type selector in TaskEditor
- [ ] ASAP/ALAP scheduling mode
- [ ] MUST START ON / MUST FINISH ON constraints

**Estimated Points:** 34

---

## Feature Dependencies

```
Sprint 1 (Foundation)
    │
    ├──► Sprint 2 (Export)
    │
    ├──► Sprint 3 (Baselines) ──► Sprint 5 (Utilization)
    │
    └──► Sprint 4 (Real-Time)
              │
              └──► Sprint 6 (Advanced) [Optional]
```

---

## Effort Estimates

| Effort Level | Story Points | Hours | Description |
|--------------|--------------|-------|-------------|
| Low | 3-5 | 4-8 | Simple UI changes, config updates |
| Medium | 8-13 | 8-20 | New components, moderate complexity |
| High | 21-34 | 20-40 | Major features, database changes, integrations |

---

## Total Roadmap Summary

| Sprint | Features | Points | Cumulative Parity |
|--------|----------|--------|-------------------|
| 1 | Quick Find, Grouping, Filtering | 13 | 54% |
| 2 | PDF/Excel Export | 21 | 58% |
| 3 | Baselines | 21 | 62% |
| 4 | Real-Time Sync | 21 | 67% |
| 5 | Resource Utilization | 34 | 73% |
| 6 | Advanced Scheduling | 34 | 81% |

**Total Points:** 144 (6 sprints @ ~24 points/sprint average)

---

## Risk Assessment

### High Risk
| Risk | Mitigation |
|------|------------|
| Real-time conflicts | Implement optimistic locking + conflict resolution UI |
| Export performance | Chunk large exports, add progress indicator |

### Medium Risk
| Risk | Mitigation |
|------|------------|
| Baseline complexity | Start with simple date storage, enhance later |
| Resource histogram performance | Pre-aggregate data, cache calculations |

### Low Risk
| Risk | Mitigation |
|------|------------|
| Search performance | Add database indexes, use debouncing |

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Feature Parity | 48% | 80% |
| Gantt Completion | 62% | 90% |
| User Satisfaction | N/A | 4.0/5.0 |

---

## Next Steps

1. **Prioritize** - Review this roadmap met stakeholders
2. **Refine** - Break down Sprint 1 into detailed tasks
3. **Execute** - Start Sprint 1 implementatie
4. **Review** - Demo na elke sprint

---

## Appendix: Ontbrekende Features Lijst

| # | Feature | Sprint | Status |
|---|---------|--------|--------|
| 5 | Baselines | 3 | Planned |
| 15 | Real-Time Sync | 4 | Planned |
| 16 | Constraint Types | 6 | Optional |
| 21 | Grouping | 1 | Planned |
| 22 | Group Summaries | Backlog | Not Planned |
| 23 | Quick Find | 1 | Planned |
| 27 | Swimlanes | Backlog | Not Planned |
| 31 | Undo/Redo (Kanban) | Backlog | Not Planned |
| 32 | Column Sorting | Backlog | Not Planned |
| 33 | Column Toolbars | Backlog | Not Planned |
| 34 | Charts in Cards | Backlog | Not Planned |
| 37 | Resource Utilization | 5 | Planned |
| 42 | Data Export | 2 | Planned |
| 47 | Rich Text Editing | Backlog | Not Planned |
