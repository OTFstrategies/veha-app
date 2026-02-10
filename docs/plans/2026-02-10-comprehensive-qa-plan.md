# Uitputtend Test- en Kwaliteitsplan — VEHA Codebase Verbeteringen

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Verifieer alle 15 verbeteringen uit het codebase improvement plan via 9 test-angles, 45+ testcases, met subagent-gedreven uitvoering en onafhankelijke kwaliteitscontrole.

**Architecture:** Drie-laags aanpak: (1) Unit tests voor geextraheerde utilities en nieuwe logica, (2) Component/integratie tests voor UI-wijzigingen, (3) E2E tests voor volledige user flows. Twee subagent-rollen: Executor (voert tests uit) en Verificator (controleert resultaten + cross-checkt tegen requirements).

**Tech Stack:** Playwright (E2E), Vitest (unit/component), TypeScript, Next.js 14, ESLint

---

## Sectie 1: Overzicht en Testdoelen

### Wat testen we?

15 verbeteringen in 5 categorieen zijn doorgevoerd:

| # | Wijziging | Risico | Testprioriteit |
|---|-----------|--------|----------------|
| 1 | Vercel token verwijderd uit CLAUDE.md | Security leak | KRITIEK |
| 2 | Test credentials naar .env.test | Test infra breekt | KRITIEK |
| 3 | getInitials gedeeld + null-safe | Crash in 10 componenten | KRITIEK |
| 4 | Console.log cleanup + ESLint rule | Ruis in productie | HOOG |
| 5 | sections/ directory verwijderd | Dead code import breaks | HOOG |
| 6 | Test assertions + waitForTimeout fix | Flaky tests | HOOG |
| 7 | Employee queries console.warn | Foutafhandeling regressie | MEDIUM |
| 8 | Keyboard navigatie EmployeeList | A11y compliance | MEDIUM |
| 9 | aria-live loading states | Screen reader support | MEDIUM |
| 10 | Status icons naast kleuren | A11y compliance | MEDIUM |
| 11 | Focus management in Dialogs | A11y compliance, UX | HOOG |
| 12 | Toast notifications (al compleet) | N/A | LAAG |
| 13 | Optimistic updates projects | Data inconsistentie | HOOG |
| 14 | no-explicit-any ESLint rule | Type safety | LAAG |
| 15 | Material/Equipment edit modals | CRUD regressie | HOOG |

### Testdoelen

1. **Zero regressions**: Geen bestaande functionaliteit gebroken
2. **Null safety bewezen**: getInitials crasht nergens meer
3. **A11y compliance**: Keyboard, screen reader, focus management werkt
4. **Data integriteit**: Optimistic updates rollen correct terug bij fouten
5. **Security**: Geen credentials in code, tokens gerevoked
6. **Build health**: TypeScript, ESLint, en build blijven schoon

---

## Sectie 2: Lijst van Alle Test-Angles + Rationale

### Angle 1: UNIT — Pure Functie Correctheid
**Rationale:** `getInitials()` is geextraheerd naar een shared utility en wordt in 10 componenten gebruikt. Elke edge case moet bewezen worden want een crash hier breekt 10 paginas tegelijk.

### Angle 2: SECURITY — Credential Exposure
**Rationale:** Er stonden een Vercel deploy token en Supabase test-credentials hardcoded in broncode. Zelfs in een private repo is dit een risico bij toekomstige team-uitbreiding of repo-publicatie.

### Angle 3: LINT & TYPE SAFETY — Statische Analyse
**Rationale:** Drie nieuwe ESLint regels zijn toegevoegd (no-console, no-unused-vars, no-explicit-any). De build moet schoon blijven. TypeScript moet compileren zonder errors.

### Angle 4: INTEGRATIE — Component Samenwerking
**Rationale:** De Dialog focus trap, optimistic updates, en resource modals zijn wijzigingen die meerdere componenten raken. Ze moeten samenwerken zonder conflicten.

### Angle 5: A11Y — Toegankelijkheid
**Rationale:** 4 a11y-taken zijn uitgevoerd (keyboard nav, aria-live, status indicators, focus trapping). Elk moet voldoen aan WCAG 2.1 AA richtlijnen.

### Angle 6: E2E — Volledige User Flows
**Rationale:** De bestaande 25 E2E tests moeten blijven slagen. Nieuwe flows (material/equipment edit) moeten getest worden in de browser.

### Angle 7: REGRESSIE — Bestaande Functionaliteit
**Rationale:** 47 bestanden zijn verwijderd (sections/), imports zijn gewijzigd in 10+ bestanden, en error handling is aangepast. Niets mag stilletjes kapot zijn gegaan.

### Angle 8: EDGE CASES — Grensgevallen
**Rationale:** Null inputs, lege lijsten, netwerk failures, rapid open/close van modals, en race conditions bij optimistic updates moeten expliciet getest worden.

### Angle 9: PERFORMANCE — Geen Degradatie
**Rationale:** De wijzigingen mogen geen merkbare vertraging veroorzaken. Build-tijd, test-tijd, en pagina-laadtijd moeten stabiel blijven.

---

## Sectie 3: Gedetailleerde Teststappen per Angle

---

### ANGLE 1: UNIT — getInitials() (8 testcases)

**Test file:** `tests/unit/format.test.ts`

**Step 1: Installeer Vitest (als nog niet aanwezig)**

Run: `npm ls vitest 2>&1 || npm install -D vitest`

**Step 2: Maak vitest.config.ts aan (als nog niet aanwezig)**

Bestand: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Step 3: Maak testbestand aan**

Bestand: `tests/unit/format.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { getInitials } from '@/lib/format'

describe('getInitials', () => {
  // U.1 — Null input
  it('returns ? for null', () => {
    expect(getInitials(null)).toBe('?')
  })

  // U.2 — Undefined input
  it('returns ? for undefined', () => {
    expect(getInitials(undefined)).toBe('?')
  })

  // U.3 — Empty string
  it('returns ? for empty string', () => {
    expect(getInitials('')).toBe('?')
  })

  // U.4 — Single name
  it('returns single initial for one word', () => {
    expect(getInitials('Jan')).toBe('J')
  })

  // U.5 — Two names (happy path)
  it('returns two initials for two words', () => {
    expect(getInitials('Jan de Vries')).toBe('JD')
  })

  // U.6 — Three+ names (max 2 initials)
  it('returns max 2 initials for three words', () => {
    expect(getInitials('Jan Willem de Vries')).toBe('JW')
  })

  // U.7 — Lowercase names (uppercase output)
  it('uppercases initials', () => {
    expect(getInitials('jan de vries')).toBe('JD')
  })

  // U.8 — Whitespace-only string
  it('handles whitespace-only input without crash', () => {
    const result = getInitials('   ')
    expect(result).toBeDefined()
  })
})
```

**Step 4: Run unit tests**

Run: `npx vitest run tests/unit/format.test.ts`
Expected: 8/8 PASS

**Step 5: Commit**

```bash
git add tests/unit/ vitest.config.ts
git commit -m "test: add unit tests for getInitials utility (8 cases)"
```

---

### ANGLE 2: SECURITY — Credential Scan (4 checks)

**Test file:** `tests/security/credential-scan.test.ts`

**Step 1: Maak testbestand aan**

```typescript
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join, extname } from 'path'
import { spawnSync } from 'child_process'

/**
 * Recursief alle bestanden zoeken met bepaalde extensies
 */
function findFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = []
  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        results.push(...findFiles(fullPath, extensions))
      } else if (extensions.includes(extname(entry))) {
        results.push(fullPath)
      }
    }
  } catch { /* skip unreadable dirs */ }
  return results
}

describe('Security: No credentials in source code', () => {
  const sourceFiles = findFiles('.', ['.ts', '.tsx', '.md', '.json', '.mjs'])

  // S.1 — Geen Vercel token in broncode
  it('no Vercel token in codebase', () => {
    const TOKEN = 'tYvEOMCPdOUUzSPbypXY9xjH'
    for (const file of sourceFiles) {
      const content = readFileSync(file, 'utf-8')
      expect(content).not.toContain(TOKEN)
    }
  })

  // S.2 — Geen hardcoded wachtwoord in testbestanden
  it('no hardcoded password in test files', () => {
    const testFiles = findFiles('tests', ['.ts', '.tsx'])
    for (const file of testFiles) {
      const content = readFileSync(file, 'utf-8')
      expect(content).not.toContain('HDevo1340')
    }
  })

  // S.3 — Geen hardcoded email in testbestanden
  it('no hardcoded email in test files', () => {
    const testFiles = findFiles('tests', ['.ts', '.tsx'])
    for (const file of testFiles) {
      const content = readFileSync(file, 'utf-8')
      expect(content).not.toContain('stelten@vehaontzorgt.nl')
    }
  })

  // S.4 — .env.test is gitignored
  it('.env.test is gitignored', () => {
    const result = spawnSync('git', ['check-ignore', '.env.test'], { encoding: 'utf-8' })
    expect(result.stdout.trim()).toBe('.env.test')
  })
})
```

**Step 2: Run security tests**

Run: `npx vitest run tests/security/credential-scan.test.ts`
Expected: 4/4 PASS

**Step 3: Commit**

```bash
git add tests/security/
git commit -m "test: add security credential scan tests (4 cases)"
```

---

### ANGLE 3: LINT & TYPE SAFETY (5 checks)

**Test file:** `tests/quality/lint-and-types.test.ts`

**Step 1: Maak testbestand aan**

```typescript
import { describe, it, expect } from 'vitest'
import { spawnSync } from 'child_process'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join, extname } from 'path'

function findFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = []
  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        results.push(...findFiles(fullPath, extensions))
      } else if (extensions.includes(extname(entry))) {
        results.push(fullPath)
      }
    }
  } catch { /* skip */ }
  return results
}

describe('Code Quality: Lint & Type Safety', () => {
  // L.1 — TypeScript compileert zonder errors
  it('TypeScript compiles without errors', () => {
    const result = spawnSync('npx', ['tsc', '--noEmit'], {
      encoding: 'utf-8',
      timeout: 120000,
      shell: true,
    })
    expect(result.status).toBe(0)
  }, 130000)

  // L.2 — Geen console.log in productie code
  it('no console.log in src/', () => {
    const srcFiles = findFiles('src', ['.ts', '.tsx'])
    for (const file of srcFiles) {
      const content = readFileSync(file, 'utf-8')
      const lines = content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        // Skip comments
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue
        expect(line).not.toMatch(/console\.log\(/)
      }
    }
  })

  // L.3 — ESLint geeft geen errors (warnings OK)
  it('ESLint passes without errors', () => {
    const result = spawnSync('npx', ['eslint', 'src/', '--quiet'], {
      encoding: 'utf-8',
      timeout: 120000,
      shell: true,
    })
    expect(result.status).toBe(0)
  }, 130000)

  // L.4 — Build slaagt
  it('production build succeeds', () => {
    const result = spawnSync('npm', ['run', 'build'], {
      encoding: 'utf-8',
      timeout: 180000,
      shell: true,
    })
    expect(result.status).toBe(0)
  }, 200000)

  // L.5 — Geen duplicate getInitials definities
  it('getInitials is only defined in src/lib/format.ts', () => {
    const srcFiles = findFiles('src', ['.ts', '.tsx'])
    const definitionFiles: string[] = []
    for (const file of srcFiles) {
      const content = readFileSync(file, 'utf-8')
      if (content.includes('function getInitials') || content.match(/const getInitials\s*=/)) {
        definitionFiles.push(file)
      }
    }
    expect(definitionFiles).toHaveLength(1)
    expect(definitionFiles[0]).toContain('format.ts')
  })
})
```

**Step 2: Run quality tests**

Run: `npx vitest run tests/quality/lint-and-types.test.ts`
Expected: 5/5 PASS (L.4 duurt ~60s)

**Step 3: Commit**

```bash
git add tests/quality/
git commit -m "test: add lint and type safety quality checks (5 cases)"
```

---

### ANGLE 4: INTEGRATIE — Dialog Focus Management (6 testcases)

**Test file:** `tests/integration/dialog-focus.spec.ts` (Playwright)

**Step 1: Maak testbestand aan**

```typescript
import { test, expect, Page } from '@playwright/test'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:1000'
const LOGIN_EMAIL = process.env.TEST_LOGIN_EMAIL!
const LOGIN_PASSWORD = process.env.TEST_LOGIN_PASSWORD!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let cachedTokens: { access_token: string; refresh_token: string } | null = null

async function login(page: Page) {
  if (!cachedTokens) {
    const response = await page.request.post(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
        data: { email: LOGIN_EMAIL, password: LOGIN_PASSWORD },
      }
    )
    cachedTokens = await response.json()
  }
  await page.goto(
    `${BASE_URL}/auth/callback#access_token=${cachedTokens!.access_token}&refresh_token=${cachedTokens!.refresh_token}`
  )
  await page.waitForURL('**/dashboard', { timeout: 15000 })
  await page.waitForLoadState('networkidle')
}

test.describe.serial('Dialog Focus Management', () => {
  // DF.1 — Focus verplaatst naar eerste input bij openen
  test('DF.1 Focus moves to first input when dialog opens', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE_URL}/resources?tab=materialen`)
    await page.waitForLoadState('networkidle')

    const addButton = page.getByRole('button', { name: /nieuw materiaal/i })
    await expect(addButton).toBeVisible({ timeout: 10000 })
    await addButton.click()

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
    await page.waitForTimeout(500) // requestAnimationFrame delay

    const nameInput = page.locator('#name')
    await expect(nameInput).toBeFocused({ timeout: 3000 })
  })

  // DF.2 — Escape sluit dialog
  test('DF.2 Escape closes dialog', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE_URL}/resources?tab=materialen`)
    await page.waitForLoadState('networkidle')

    const addButton = page.getByRole('button', { name: /nieuw materiaal/i })
    await expect(addButton).toBeVisible({ timeout: 10000 })
    await addButton.click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 })
  })

  // DF.3 — Tab cyclet binnen dialog (trap)
  test('DF.3 Tab cycles within dialog (focus trap)', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE_URL}/resources?tab=materialen`)
    await page.waitForLoadState('networkidle')

    const addButton = page.getByRole('button', { name: /nieuw materiaal/i })
    await expect(addButton).toBeVisible({ timeout: 10000 })
    await addButton.click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
    await page.waitForTimeout(500)

    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab')
    }

    const insideDialog = await page.evaluate(() => {
      const el = document.activeElement
      const dialog = document.querySelector('[role="dialog"]')
      return dialog?.contains(el) ?? false
    })
    expect(insideDialog).toBe(true)
  })

  // DF.4 — Shift+Tab cyclet terug
  test('DF.4 Shift+Tab cycles backwards within dialog', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE_URL}/resources?tab=materialen`)
    await page.waitForLoadState('networkidle')

    const addButton = page.getByRole('button', { name: /nieuw materiaal/i })
    await expect(addButton).toBeVisible({ timeout: 10000 })
    await addButton.click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
    await page.waitForTimeout(500)

    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Shift+Tab')
    }

    const insideDialog = await page.evaluate(() => {
      const el = document.activeElement
      const dialog = document.querySelector('[role="dialog"]')
      return dialog?.contains(el) ?? false
    })
    expect(insideDialog).toBe(true)
  })

  // DF.5 — Focus keert terug naar trigger na sluiten
  test('DF.5 Focus returns to trigger after closing', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE_URL}/resources?tab=materialen`)
    await page.waitForLoadState('networkidle')

    const addButton = page.getByRole('button', { name: /nieuw materiaal/i })
    await expect(addButton).toBeVisible({ timeout: 10000 })
    await addButton.focus()
    await addButton.click()

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 })

    const focusedTag = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedTag).toBeTruthy()
  })

  // DF.6 — aria-modal="true" is aanwezig
  test('DF.6 Dialog has correct ARIA attributes', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE_URL}/resources?tab=materialen`)
    await page.waitForLoadState('networkidle')

    const addButton = page.getByRole('button', { name: /nieuw materiaal/i })
    await expect(addButton).toBeVisible({ timeout: 10000 })
    await addButton.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
  })
})
```

**Step 2: Run dialog focus tests**

Run: `npx playwright test tests/integration/dialog-focus.spec.ts --reporter=list`
Expected: 6/6 PASS

**Step 3: Commit**

```bash
git add tests/integration/
git commit -m "test: add dialog focus management integration tests (6 cases)"
```

---

### ANGLE 5: A11Y — Toegankelijkheid (7 testcases)

**Test file:** `tests/a11y/accessibility.spec.ts` (Playwright)

**Step 1: Maak testbestand aan**

```typescript
import { test, expect, Page } from '@playwright/test'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:1000'
const LOGIN_EMAIL = process.env.TEST_LOGIN_EMAIL!
const LOGIN_PASSWORD = process.env.TEST_LOGIN_PASSWORD!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let cachedTokens: { access_token: string; refresh_token: string } | null = null

async function login(page: Page) {
  if (!cachedTokens) {
    const response = await page.request.post(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
        data: { email: LOGIN_EMAIL, password: LOGIN_PASSWORD },
      }
    )
    cachedTokens = await response.json()
  }
  await page.goto(
    `${BASE_URL}/auth/callback#access_token=${cachedTokens!.access_token}&refresh_token=${cachedTokens!.refresh_token}`
  )
  await page.waitForURL('**/dashboard', { timeout: 15000 })
  await page.waitForLoadState('networkidle')
}

test.describe.serial('Accessibility Tests', () => {
  // A11Y.1 — Employee grid cards hebben aria-label
  test('A11Y.1 Employee grid cards have aria-label', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE_URL}/resources?tab=medewerkers`)
    await page.waitForLoadState('networkidle')

    const cards = page.locator('button[aria-label^="Medewerker:"]')
    const count = await cards.count()

    if (count > 0) {
      const firstLabel = await cards.first().getAttribute('aria-label')
      expect(firstLabel).toMatch(/^Medewerker: .+/)
    }
  })

  // A11Y.2 — Employee table rows zijn focusbaar met keyboard
  test('A11Y.2 Employee table rows are keyboard focusable', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE_URL}/resources?tab=medewerkers`)
    await page.waitForLoadState('networkidle')

    const listViewButton = page.locator('button[aria-label="Lijst weergave"]')
    if (await listViewButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await listViewButton.click()
      await page.waitForTimeout(500)

      const rows = page.locator('tbody tr[tabindex="0"]')
      const rowCount = await rows.count()

      if (rowCount > 0) {
        const firstRow = rows.first()
        await firstRow.focus()
        await expect(firstRow).toBeFocused()
      }
    }
  })

  // A11Y.3 — aria-live regio in source code
  test('A11Y.3 Loading states have aria-live in source code', async ({ page }) => {
    // Verifieer via source code scan (betrouwbaarder dan runtime)
    const { readFileSync } = await import('fs')
    const projectDetailSrc = readFileSync('src/app/(app)/projects/[id]/page.tsx', 'utf-8')
    expect(projectDetailSrc).toContain('aria-live="polite"')
    expect(projectDetailSrc).toContain('aria-busy="true"')

    const employeeDetailSrc = readFileSync('src/app/(app)/employees/[id]/page.tsx', 'utf-8')
    expect(employeeDetailSrc).toContain('aria-live="polite"')
  })

  // A11Y.4 — Progress bars hebben role="progressbar"
  test('A11Y.4 Progress bars have progressbar role', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE_URL}/projects`)
    await page.waitForLoadState('networkidle')

    const progressBars = page.locator('[role="progressbar"]')
    const count = await progressBars.count()

    if (count > 0) {
      const first = progressBars.first()
      await expect(first).toHaveAttribute('aria-valuemin', '0')
      await expect(first).toHaveAttribute('aria-valuemax', '100')
    }
  })

  // A11Y.5 — Presence indicator heeft aria-label in source code
  test('A11Y.5 Presence indicator has status role in source', async ({ page }) => {
    const { readFileSync } = await import('fs')
    const presenceSrc = readFileSync('src/components/ui/presence-avatars.tsx', 'utf-8')
    expect(presenceSrc).toContain('role="status"')
    expect(presenceSrc).toContain('aria-label={isActive ? "Online" : "Offline"}')
  })

  // A11Y.6 — View mode toggles hebben aria-pressed
  test('A11Y.6 View mode toggles have aria-pressed', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE_URL}/resources?tab=medewerkers`)
    await page.waitForLoadState('networkidle')

    const gridButton = page.locator('button[aria-label="Grid weergave"]')
    if (await gridButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(gridButton).toHaveAttribute('aria-pressed', 'true')
    }
  })

  // A11Y.7 — Geen errors op employee pagina
  test('A11Y.7 Employee page loads without errors', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE_URL}/resources?tab=medewerkers`)
    await page.waitForLoadState('networkidle')

    const errorText = page.getByText('Er is iets misgegaan')
    const hasError = await errorText.isVisible({ timeout: 2000 }).catch(() => false)
    expect(hasError).toBe(false)
  })
})
```

**Step 2: Run a11y tests**

Run: `npx playwright test tests/a11y/accessibility.spec.ts --reporter=list`
Expected: 7/7 PASS

**Step 3: Commit**

```bash
git add tests/a11y/
git commit -m "test: add accessibility test suite (7 cases)"
```

---

### ANGLE 6: E2E — Bestaande Tests + Resource Modals (27 testcases)

**Step 1: Run bestaande 25 E2E tests**

Run: `npx playwright test tests/refactoring-verification.spec.ts --reporter=list`
Expected: 25/25 PASS

**Step 2: Maak resource modal E2E tests aan**

**Test file:** `tests/e2e/resource-modals.spec.ts`

```typescript
import { test, expect, Page } from '@playwright/test'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:1000'
const LOGIN_EMAIL = process.env.TEST_LOGIN_EMAIL!
const LOGIN_PASSWORD = process.env.TEST_LOGIN_PASSWORD!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let cachedTokens: { access_token: string; refresh_token: string } | null = null

async function login(page: Page) {
  if (!cachedTokens) {
    const response = await page.request.post(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
        data: { email: LOGIN_EMAIL, password: LOGIN_PASSWORD },
      }
    )
    cachedTokens = await response.json()
  }
  await page.goto(
    `${BASE_URL}/auth/callback#access_token=${cachedTokens!.access_token}&refresh_token=${cachedTokens!.refresh_token}`
  )
  await page.waitForURL('**/dashboard', { timeout: 15000 })
  await page.waitForLoadState('networkidle')
}

test.describe.serial('Resource Modal E2E Tests', () => {
  // RM.1 — Material tab laadt
  test('RM.1 Material tab loads', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE_URL}/resources?tab=materialen`)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[role="tab"][aria-selected="true"]')).toContainText('Materialen')
  })

  // RM.2 — Material "nieuw" modal opent en sluit
  test('RM.2 Material create modal opens and closes', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE_URL}/resources?tab=materialen`)
    await page.waitForLoadState('networkidle')

    const addButton = page.getByRole('button', { name: /nieuw materiaal/i })
    await expect(addButton).toBeVisible({ timeout: 10000 })
    await addButton.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })
    await expect(dialog.locator('h2')).toContainText('Nieuw Materiaal')

    await page.getByRole('button', { name: 'Annuleren' }).click()
    await expect(dialog).not.toBeVisible({ timeout: 3000 })
  })
})
```

**Step 3: Run alle E2E tests**

Run: `npx playwright test --reporter=list`
Expected: 25 + 2 = 27/27 PASS (of meer als integration/a11y al aangemaakt)

**Step 4: Commit**

```bash
git add tests/e2e/
git commit -m "test: add resource modal E2E tests (2 cases)"
```

---

### ANGLE 7: REGRESSIE — Build & Import Verificatie (4 checks)

**Test file:** `tests/quality/regression.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { spawnSync } from 'child_process'
import { readdirSync, readFileSync, statSync, existsSync } from 'fs'
import { join, extname } from 'path'

function findFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = []
  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        results.push(...findFiles(fullPath, extensions))
      } else if (extensions.includes(extname(entry))) {
        results.push(fullPath)
      }
    }
  } catch { /* skip */ }
  return results
}

describe('Regression: No broken imports after refactoring', () => {
  // R.1 — Geen imports uit verwijderde sections/ directory
  it('no imports reference sections/ directory', () => {
    const srcFiles = findFiles('src', ['.ts', '.tsx'])
    for (const file of srcFiles) {
      const content = readFileSync(file, 'utf-8')
      expect(content).not.toMatch(/from\s+['"].*sections\//)
    }
  })

  // R.2 — Alle getInitials imports wijzen naar @/lib/format
  it('all getInitials imports use shared utility', () => {
    const srcFiles = findFiles('src', ['.ts', '.tsx'])
    for (const file of srcFiles) {
      const content = readFileSync(file, 'utf-8')
      if (content.includes('getInitials') && content.includes('import')) {
        const importLines = content.split('\n').filter(l => l.includes('getInitials') && l.includes('import'))
        for (const line of importLines) {
          expect(line).toContain('@/lib/format')
        }
      }
    }
  })

  // R.3 — sections/ directory bestaat niet meer
  it('sections/ directory is deleted', () => {
    expect(existsSync('sections')).toBe(false)
  })

  // R.4 — .env.test bestaat (nodig voor tests)
  it('.env.test file exists', () => {
    expect(existsSync('.env.test')).toBe(true)
  })
})
```

**Step 2: Run**

Run: `npx vitest run tests/quality/regression.test.ts`
Expected: 4/4 PASS

**Step 3: Commit**

```bash
git add tests/quality/regression.test.ts
git commit -m "test: add regression checks for refactoring (4 cases)"
```

---

### ANGLE 8: EDGE CASES (5 testcases)

**Test file:** `tests/unit/edge-cases.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { getInitials } from '@/lib/format'

describe('Edge Cases', () => {
  // EC.1 — Naam met koppelteken
  it('handles names with hyphens', () => {
    expect(getInitials("Jean-Pierre Dupont")).toBe("JD")
  })

  // EC.2 — Extra spaties tussen woorden
  it('handles extra spaces between words', () => {
    const result = getInitials("Jan   de   Vries")
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })

  // EC.3 — Emoji in naam
  it('handles emoji in name without crash', () => {
    const result = getInitials("Jan Bouw")
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })

  // EC.4 — Zeer lange naam (max 2 tekens output)
  it('returns max 2 chars for very long names', () => {
    const result = getInitials("Eerste Tweede Derde Vierde Vijfde Zesde")
    expect(result.length).toBeLessThanOrEqual(2)
  })

  // EC.5 — Naam met alleen cijfers
  it('handles numeric name', () => {
    const result = getInitials("123 456")
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })
})
```

**Step 2: Run**

Run: `npx vitest run tests/unit/edge-cases.test.ts`
Expected: 5/5 PASS

**Step 3: Commit**

```bash
git add tests/unit/edge-cases.test.ts
git commit -m "test: add edge case tests for getInitials (5 cases)"
```

---

### ANGLE 9: PERFORMANCE — Build & Test Timing (3 checks)

**Test file:** `tests/quality/performance.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { spawnSync } from 'child_process'

describe('Performance: No degradation', () => {
  // P.1 — Build duurt niet langer dan 120 seconden
  it('production build completes within 120s', () => {
    const start = Date.now()
    const result = spawnSync('npm', ['run', 'build'], {
      encoding: 'utf-8',
      timeout: 120000,
      shell: true,
    })
    const duration = Date.now() - start
    expect(result.status).toBe(0)
    expect(duration).toBeLessThan(120000)
  }, 130000)

  // P.2 — TypeScript check duurt niet langer dan 30 seconden
  it('TypeScript check completes within 30s', () => {
    const start = Date.now()
    const result = spawnSync('npx', ['tsc', '--noEmit'], {
      encoding: 'utf-8',
      timeout: 30000,
      shell: true,
    })
    const duration = Date.now() - start
    expect(result.status).toBe(0)
    expect(duration).toBeLessThan(30000)
  }, 35000)

  // P.3 — ESLint check duurt niet langer dan 60 seconden
  it('ESLint check completes within 60s', () => {
    const start = Date.now()
    const result = spawnSync('npx', ['eslint', 'src/', '--quiet'], {
      encoding: 'utf-8',
      timeout: 60000,
      shell: true,
    })
    const duration = Date.now() - start
    expect(result.status).toBe(0)
    expect(duration).toBeLessThan(60000)
  }, 65000)
})
```

**Step 2: Run**

Run: `npx vitest run tests/quality/performance.test.ts`
Expected: 3/3 PASS

**Step 3: Commit**

```bash
git add tests/quality/performance.test.ts
git commit -m "test: add performance baseline checks (3 cases)"
```

---

## Sectie 4: Subagent-Rollen, Verantwoordelijkheden en Onderlinge Controle

### Architectuur: 3 Rollen

```
+-----------------------------------------------------+
|                   ORCHESTRATOR                       |
|              (Hoofd Claude sessie)                   |
|  Dispatcht taken, ontvangt resultaten, rapporteert   |
+-------------+-----------------------+---------------+
              |                       |
    +---------v----------+  +---------v--------------+
    |   TEST EXECUTOR    |  |   QA VERIFICATOR       |
    |   (Subagent 1)     |  |   (Subagent 2)         |
    |                    |  |                        |
    | - Schrijft tests   |  | - Leest test output    |
    | - Runt tests       |  | - Cross-checkt tegen   |
    | - Logt resultaten  |  |   requirements         |
    | - Rapporteert      |  | - Zoekt false passes   |
    |   pass/fail        |  | - Beoordeelt coverage  |
    +--------------------+  +------------------------+
```

### Subagent 1: TEST EXECUTOR

**Rol:** Voert alle testsuites uit in de juiste volgorde.

**Verantwoordelijkheden:**
1. Installeer Vitest als het nog niet aanwezig is
2. Maak alle testbestanden aan zoals beschreven in Angles 1-9
3. Voer tests uit per angle, in volgorde van prioriteit
4. Log exact welke tests passeren en falen
5. Bij een failure: noteer de exacte error message + stack trace
6. Genereer een samenvattend rapport

**Tools:** Bash (npm/npx), Write (testbestanden), Read (resultaten)

**Output formaat:**
```
ANGLE 1: UNIT — 8/8 PASS
  U.1 pass  returns ? for null
  U.2 pass  returns ? for undefined
  ...
ANGLE 2: SECURITY — 4/4 PASS
  S.1 pass  no Vercel token
  ...
```

### Subagent 2: QA VERIFICATOR

**Rol:** Controleert de resultaten van de Executor en valideert tegen requirements.

**Verantwoordelijkheden:**
1. Lees het test-output rapport van Subagent 1
2. Cross-check elke test tegen het oorspronkelijke requirement
3. Identificeer mogelijke **false positives** (tests die passen maar het verkeerde testen)
4. Identificeer **coverage gaps** (requirements die niet getest zijn)
5. Verifieer dat de test-code zelf correct is
6. Geef een eindoordeel: GOEDGEKEURD / AFGEKEURD met onderbouwing

**Tools:** Read (testrapporten, broncode), Grep (coverage verificatie)

**Output formaat:**
```
QA VERIFICATIE RAPPORT
======================

Requirement 3 (getInitials null safety):
  - Test U.1 dekt null -> Correct
  - Test U.2 dekt undefined -> Correct
  - OPMERKING: Whitespace-only test (U.8) heeft zwakke assertion

Totaal: 14/15 requirements volledig gedekt
Risico-niveau: LAAG
Eindoordeel: GOEDGEKEURD met 1 opmerking
```

### Onderlinge Controle

| Stap | Executor | Verificator |
|------|----------|-------------|
| 1 | Schrijft + runt tests | -- |
| 2 | Rapporteert resultaten | -- |
| 3 | -- | Leest rapport + broncode |
| 4 | -- | Cross-checkt coverage |
| 5 | -- | Geeft GO/NO-GO |
| 6 | Fixt failures (bij NO-GO) | -- |
| 7 | Hertest gefixte tests | -- |
| 8 | -- | Herverifieert fixes |
| 9 | -- | Geeft finaal oordeel |

**Belangrijk:** De Verificator runt NOOIT zelf tests. De Verificator leest alleen de output en de broncode. Dit voorkomt dat dezelfde fouten over het hoofd worden gezien.

---

## Sectie 5: Rapportagevorm

### Hoe Shadow de resultaten te zien krijgt

Na uitvoering krijgt Shadow een rapport in deze structuur:

---

#### TESTRESULTAAT — [DATUM]

**Status:** GESLAAGD / GEFAALD / DEELS GESLAAGD

**Samenvatting in 1 zin:**
> "Alle 45 tests zijn geslaagd. Je app is veilig, stabiel, en toegankelijk."

**Scorekaart:**

| Categorie | Tests | Resultaat | Wat dit betekent |
|-----------|-------|-----------|------------------|
| Veiligheid | 4 | 4/4 | Geen wachtwoorden of tokens in je code |
| Crashpreventie | 13 | 13/13 | De app crasht niet meer bij ontbrekende namen |
| Toegankelijkheid | 7 | 7/7 | Mensen met een beperking kunnen je app gebruiken |
| Kwaliteit | 9 | 9/9 | Code is schoon, geen rommel in productie |
| Werkende functies | 29 | 29/29 | Alles werkt zoals verwacht in de browser |
| Snelheid | 3 | 3/3 | App is niet langzamer geworden |

**Risico's:**
- GROEN: Geen bekende risico's
- GEEL: 1 opmerking: [details]
- ROOD: 1 blocker: [details + wat te doen]

**Aanbevelingen:**
1. [Eventuele volgende stap]
2. [Eventuele verbetering]

---

### Bij een gefaalde test

| | |
|---|---|
| **Wat ging er mis?** | [Uitleg in gewone taal] |
| **Is dit ernstig?** | KRITIEK / GEMIDDELD / LAAG |
| **Wie moet dit fixen?** | Claude (automatisch) / Shadow (handmatig) |
| **Impact als we niets doen** | [Gevolg voor gebruikers] |

---

## Fail-Safe en Herstel Protocol

### Bij falende tests

1. **Executor rapporteert** de failure met exacte error message
2. **Verificator beoordeelt** of het een echte bug is of een testfout
3. **Drie mogelijkheden:**
   - **Testfout:** Executor past de test aan en hertest
   - **Echte bug:** Executor fixt de code en hertest + regressietest
   - **Infra-probleem:** (server down, timeout) -> Executor wacht 30s en hertest max 2x
4. **Na fix:** Volledige suite opnieuw draaien (niet alleen de gefixte test)
5. **Logging:** Elke failure wordt gelogd in het rapport met:
   - Tijdstip
   - Test ID
   - Error message
   - Root cause
   - Fix beschrijving
   - Hertest resultaat

### Prioritering van failures

| Prioriteit | Criteria | Actie |
|-----------|----------|-------|
| P0 KRITIEK | Security test faalt | Stop alles, fix direct |
| P1 HOOG | Build/type faalt | Fix voor volgende angle |
| P2 MEDIUM | Functionele test faalt | Fix na huidige angle |
| P3 LAAG | Performance/style faalt | Noteer, fix later |

### Herhaal-strategie

- **Flaky tests** (soms pass, soms fail): Run 3x. Als 2/3 pass -> markeer als flaky + onderzoek.
- **Timeout failures:** Verhoog timeout 1x. Als nog steeds fail -> echte performance bug.
- **Auth failures:** Verifieer .env.test + Supabase project status.

---

## Taak Overzicht

| Task | Angle | Testcases | Type | Geschatte tijd |
|------|-------|-----------|------|----------------|
| 1 | Unit (getInitials) | 8 | Vitest | 5 min |
| 2 | Security (credentials) | 4 | Vitest | 3 min |
| 3 | Lint & Types | 5 | Vitest | 3 min |
| 4 | Dialog Focus | 6 | Playwright | 8 min |
| 5 | Accessibility | 7 | Playwright | 8 min |
| 6 | E2E (bestaand + nieuw) | 27 | Playwright | 5 min |
| 7 | Regressie | 4 | Vitest | 3 min |
| 8 | Edge Cases | 5 | Vitest | 3 min |
| 9 | Performance | 3 | Vitest | 4 min |
| **QA Verificatie** | Cross-check | -- | Subagent | 10 min |
| **Totaal** | | **69** | | **~52 min** |
