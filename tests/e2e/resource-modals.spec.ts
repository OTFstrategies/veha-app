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
    await expect(page.locator('[role="tab"][data-state="active"]')).toContainText('Materialen')
  })

  // RM.2 — Material "nieuw" modal opent en sluit
  test('RM.2 Material create modal opens and closes', async ({ page }) => {
    await login(page)
    await page.goto(`${BASE_URL}/resources?tab=materialen`)
    await page.waitForLoadState('networkidle')

    const addButton = page.locator('button').filter({ hasText: /^Materiaal$/ }).first()
    await expect(addButton).toBeVisible({ timeout: 10000 })
    await addButton.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })

    // Close via Escape
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible({ timeout: 3000 })
  })
})
