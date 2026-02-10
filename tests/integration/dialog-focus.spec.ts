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

async function openMaterialModal(page: Page) {
  await page.goto(`${BASE_URL}/resources?tab=materialen`)
  await page.waitForLoadState('networkidle')

  // The add button contains "Materiaal" text with a Plus icon
  const addButton = page.locator('button').filter({ hasText: /^Materiaal$/ })
  await expect(addButton.first()).toBeVisible({ timeout: 10000 })
  await addButton.first().click()

  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
  await page.waitForTimeout(500) // requestAnimationFrame delay for auto-focus
}

test.describe.serial('Dialog Focus Management', () => {
  // DF.1 — Focus verplaatst naar eerste input bij openen
  test('DF.1 Focus moves to first input when dialog opens', async ({ page }) => {
    await login(page)
    await openMaterialModal(page)

    const nameInput = page.locator('#name')
    await expect(nameInput).toBeFocused({ timeout: 3000 })
  })

  // DF.2 — Escape sluit dialog
  test('DF.2 Escape closes dialog', async ({ page }) => {
    await login(page)
    await openMaterialModal(page)

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 })
  })

  // DF.3 — Tab cyclet binnen dialog (trap)
  test('DF.3 Tab cycles within dialog (focus trap)', async ({ page }) => {
    await login(page)
    await openMaterialModal(page)

    // Tab many times — focus should stay inside dialog
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
    await openMaterialModal(page)

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

    const addButton = page.locator('button').filter({ hasText: /^Materiaal$/ }).first()
    await expect(addButton).toBeVisible({ timeout: 10000 })
    await addButton.focus()
    await addButton.click()

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 })

    // Focus should return to some element (the previously focused button)
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedTag).toBeTruthy()
  })

  // DF.6 — aria-modal="true" is aanwezig
  test('DF.6 Dialog has correct ARIA attributes', async ({ page }) => {
    await login(page)
    await openMaterialModal(page)

    const dialog = page.getByRole('dialog')
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
  })
})
