# VEHA Dashboard — Status

**Laatste update:** 10 februari 2026
**Branch:** master
**Live:** https://veha-app.vercel.app
**Commits:** 107

---

## Huidige Staat

Het VEHA Dashboard is een werkend project planning en resource management platform. De app is live op Vercel en bevat:

- Dashboard met KPI-cards en overzichten
- Projectbeheer (Grid, Kanban, Gantt views)
- Takenbeheer met drag & drop, inline editing
- Resource management (medewerkers, materialen, equipment)
- Klantportaal (aparte portal-routes)
- Weekplanning
- Supabase Auth (login/signup/forgot-password)

---

## Wat er deze sessie gedaan is

### 1. Codebase Improvement Plan (15 taken, alle afgerond)

| # | Wijziging | Commit |
|---|-----------|--------|
| 1 | Vercel token verwijderd uit CLAUDE.md | (vorige sessie) |
| 2 | Test credentials naar .env.test | (vorige sessie) |
| 3 | getInitials gedeeld + null-safe | `1f3ba29` |
| 4 | Console.log cleanup + ESLint no-console rule | `eb139b2` |
| 5 | sections/ directory verwijderd (22 dode bestanden) | `83ce6e3` |
| 6 | Test assertions versterkt, waitForTimeout gereduceerd | `cf4faef` |
| 7 | Employee queries console.warn + graceful degradation | `d4439ec` |
| 8 | Keyboard navigatie EmployeeList (Tab, Enter, Space) | `065eef6` |
| 9 | aria-live regions op loading states | `b64b095` |
| 10 | Status icons: progressbar role, presence labels | `3474947` |
| 11 | Focus trapping + auto-focus in Dialog component | `903945e` |
| 12 | Toast notifications (was al compleet) | — |
| 13 | Optimistic updates voor project mutations | `493f076` |
| 14 | no-explicit-any ESLint rule | `2514a2e` |
| 15 | Material/Equipment detail/edit modals | `4041e38` |

### 2. Huisstijl & Design System

| Wijziging | Commit |
|-----------|--------|
| Oklch CSS tokens, zinc rings, warm stone accent, motion library | `eca0b96` |
| Dark mode overrides voor Gantt, semantic, brand tokens | `89bdd1a` |
| Status state CSS tokens | `14fb51f` |
| Migrate alle gekleurde Tailwind classes naar zinc monochroom | `c7b68b8` |
| Glassmorphism op cards, dropdowns, popover, toast | `7370e42` |
| Motion animations (staggered cards, sidebar indicator) | `ea46683` |

### 3. QA Test Suite (69 tests, allemaal geslaagd)

| Angle | Tests | Type | Resultaat |
|-------|-------|------|-----------|
| Unit: getInitials | 8 | Vitest | 8/8 |
| Edge Cases | 5 | Vitest | 5/5 |
| Security: credential scan | 4 | Vitest | 4/4 |
| Lint & Type Safety | 5 | Vitest | 5/5 |
| Regression | 4 | Vitest | 4/4 |
| Performance | 3 | Vitest | 3/3 |
| Dialog Focus Management | 6 | Playwright | 6/6 |
| Accessibility | 7 | Playwright | 7/7 |
| E2E: Resource Modals | 2 | Playwright | 2/2 |
| Bestaande E2E (refactoring) | 25 | Playwright | 25/25 |
| **Totaal** | **69** | | **69/69** |

### 4. Bugfix tijdens QA

Dialog auto-focus selecteerde de X-knop in plaats van het eerste invoerveld. Gefixt: inputs krijgen nu voorrang boven buttons (`0174240`).

---

## Test Infrastructure

```
tests/
  unit/format.test.ts              # getInitials null-safety
  unit/edge-cases.test.ts          # Koppeltekens, spaties, lange namen
  security/credential-scan.test.ts # Token/wachtwoord scan
  quality/lint-and-types.test.ts   # TSC, ESLint, build, console.log
  quality/regression.test.ts       # Geen gebroken imports
  quality/performance.test.ts      # Build/TSC/ESLint timing
  integration/dialog-focus.spec.ts # Focus trap, auto-focus, Escape
  a11y/accessibility.spec.ts       # ARIA, keyboard, progressbar
  e2e/resource-modals.spec.ts      # Material tab + modal
  refactoring-verification.spec.ts # 25 bestaande E2E tests
vitest.config.ts
```

**Draaien:**
- Vitest: `npx vitest run`
- Playwright: `npx playwright test`
- Alles: `npx vitest run && npx playwright test`

---

## Open Items / Volgende Stappen

### Prioriteit 1 (aanbevolen)
- [ ] Integration test toevoegen voor optimistic update rollback bij server error
- [ ] E2E test toevoegen voor material/equipment edit-flow (niet alleen create)

### Prioriteit 2 (nice-to-have)
- [ ] Visuele test dat status-iconen naast kleuren staan
- [ ] waitForTimeout in legacy `feature4-crud-toasts.spec.ts` refactoren naar waitForSelector
- [ ] Axe-core accessibility audit toevoegen

### Ideeën uit brainstorm (42 issues geidentificeerd)
- Volledige lijst: zie `docs/plans/2026-02-10-comprehensive-qa-plan.md`
- 15/42 zijn afgehandeld in het improvement plan

---

## Bekende Issues

| Issue | Ernst | Context |
|-------|-------|---------|
| ESLint kan >60s duren bij concurrent processen | LAAG | Timeout verhoogd naar 90s in performance test |
| .env.test bevat plaintext credentials | LAAG | Gitignored, maar niet encrypted |
| 27 ongecommitte gewijzigde bestanden in working tree | INFO | Layout/portal/dashboard files + deleted test screenshots |

---

## Performance Baselines

| Metric | Waarde | Limiet |
|--------|--------|--------|
| Production build | 43s | <120s |
| TypeScript check | 8s | <60s |
| ESLint check | 19s | <90s |
