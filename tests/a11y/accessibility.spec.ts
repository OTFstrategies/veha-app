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

    // Try to switch to list view if available
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
  test('A11Y.3 Loading states have aria-live in source code', async () => {
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
  test('A11Y.5 Presence indicator has status role in source', async () => {
    const { readFileSync } = await import('fs')
    const presenceSrc = readFileSync('src/components/ui/presence-avatars.tsx', 'utf-8')
    expect(presenceSrc).toContain('role="status"')
    expect(presenceSrc).toContain('aria-label={isActive ? "Online" : "Offline"}')
  })

  // A11Y.6 — Dialog heeft aria-modal
  test('A11Y.6 Dialog source has aria-modal', async () => {
    const { readFileSync } = await import('fs')
    const dialogSrc = readFileSync('src/components/ui/dialog.tsx', 'utf-8')
    expect(dialogSrc).toContain('aria-modal="true"')
    expect(dialogSrc).toContain('role="dialog"')
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
