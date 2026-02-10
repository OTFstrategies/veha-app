import { test, Page } from '@playwright/test';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:1000';
const LOGIN_EMAIL = process.env.TEST_LOGIN_EMAIL!;
const LOGIN_PASSWORD = process.env.TEST_LOGIN_PASSWORD!;

// Helper to login and navigate to VEHA App
async function loginAndSelectVehaApp(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Check if on login page
  const emailInput = page.locator('input[type="email"], input[name="email"]');
  if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailInput.fill(LOGIN_EMAIL);
    await page.fill('input[type="password"], input[name="password"]', LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }

  // Now we should be on the hub page - click VEHA App
  const vehaAppBtn = page.locator('button:has-text("VEHA App")');
  await vehaAppBtn.waitFor({ state: 'visible', timeout: 10000 });
  await vehaAppBtn.click();

  // Wait for navigation away from hub
  await page.waitForTimeout(2000);
  await page.waitForLoadState('networkidle');

  // Verify we're in the app (not on hub anymore)
  const currentUrl = page.url();
  console.log('Current URL after VEHA App click:', currentUrl);
}

// Navigate directly to a page within the app
async function navigateToAppPage(page: Page, path: string) {
  // First ensure we're logged in and in the app
  await loginAndSelectVehaApp(page);

  // Now navigate to the specific page
  await page.goto(`${BASE_URL}${path}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Take a debug screenshot
  const debugPath = `test-results/debug-${path.replace(/\//g, '-')}.png`;
  await page.screenshot({ path: debugPath });
  console.log(`Navigated to ${path}, screenshot saved to ${debugPath}`);
}

test.describe('Feature 4: CRUD Toast Notifications', () => {

  test('4.1 Create project toast', async ({ page }) => {
    await navigateToAppPage(page, '/projects');

    // Look for the new project button
    const newProjectBtn = page.locator('button:has-text("Nieuw"), button:has-text("New"), a:has-text("Nieuw")').first();

    if (await newProjectBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newProjectBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/4.1-new-project-dialog.png' });

      // Fill form if visible
      const nameInput = page.locator('input').first();
      if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nameInput.fill(`Test Project ${Date.now()}`);

        // Submit
        const submitBtn = page.locator('button[type="submit"], button:has-text("Opslaan")').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    }

    await page.screenshot({ path: 'test-results/4.1-create-project-result.png' });
  });

  test('4.2 Update project toast', async ({ page }) => {
    await navigateToAppPage(page, '/projects');

    // Click on first project to view/edit
    const projectLink = page.locator('table tbody tr a, [class*="project"] a, table tbody tr').first();

    if (await projectLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await projectLink.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'test-results/4.2-project-detail.png' });

      // Look for save button and click if visible
      const saveBtn = page.locator('button[type="submit"], button:has-text("Opslaan")').first();
      if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await saveBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    await page.screenshot({ path: 'test-results/4.2-update-project-result.png' });
  });

  test('4.3 Delete project toast', async ({ page }) => {
    await navigateToAppPage(page, '/projects');

    // Find action menu button (three dots or similar)
    const actionBtn = page.locator('button:has(svg[class*="MoreVertical"]), button:has(svg[class*="more"]), [aria-label*="actions"], [aria-label*="menu"]').first();

    if (await actionBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await actionBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/4.3-action-menu.png' });

      // Click delete
      const deleteItem = page.locator('[role="menuitem"]:has-text("Verwijder"), button:has-text("Verwijder"), text=Verwijderen').first();
      if (await deleteItem.isVisible({ timeout: 2000 }).catch(() => false)) {
        await deleteItem.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/4.3-delete-confirm.png' });

        // Confirm
        const confirmBtn = page.locator('[role="alertdialog"] button:has-text("Verwijder"), button[class*="destructive"]').first();
        if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    }

    await page.screenshot({ path: 'test-results/4.3-delete-result.png' });
  });

  test('4.4 Create client toast', async ({ page }) => {
    await navigateToAppPage(page, '/clients');

    const newClientBtn = page.locator('button:has-text("Nieuw"), button:has-text("New"), a:has-text("Nieuw")').first();

    if (await newClientBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newClientBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/4.4-new-client-dialog.png' });

      const nameInput = page.locator('input').first();
      if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nameInput.fill(`Test Client ${Date.now()}`);

        const submitBtn = page.locator('button[type="submit"], button:has-text("Opslaan")').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    }

    await page.screenshot({ path: 'test-results/4.4-create-client-result.png' });
  });

  test('4.5 Update client toast', async ({ page }) => {
    await navigateToAppPage(page, '/clients');

    const clientLink = page.locator('table tbody tr a, [class*="client"] a, table tbody tr').first();

    if (await clientLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await clientLink.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'test-results/4.5-client-detail.png' });

      const saveBtn = page.locator('button[type="submit"], button:has-text("Opslaan")').first();
      if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await saveBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    await page.screenshot({ path: 'test-results/4.5-update-client-result.png' });
  });

  test('4.6 Delete client toast', async ({ page }) => {
    await navigateToAppPage(page, '/clients');

    const actionBtn = page.locator('button:has(svg[class*="MoreVertical"]), button:has(svg[class*="more"]), [aria-label*="actions"]').first();

    if (await actionBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await actionBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/4.6-action-menu.png' });

      const deleteItem = page.locator('[role="menuitem"]:has-text("Verwijder"), text=Verwijderen').first();
      if (await deleteItem.isVisible({ timeout: 2000 }).catch(() => false)) {
        await deleteItem.click();
        await page.waitForTimeout(500);

        const confirmBtn = page.locator('[role="alertdialog"] button:has-text("Verwijder"), button[class*="destructive"]').first();
        if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    }

    await page.screenshot({ path: 'test-results/4.6-delete-client-result.png' });
  });

  test('4.7 Toast stacking - trigger 3 quickly', async ({ page }) => {
    await navigateToAppPage(page, '/resources/materials');

    // Try to trigger multiple operations quickly
    for (let i = 0; i < 3; i++) {
      const newBtn = page.locator('button:has-text("Nieuw"), button:has-text("Toevoegen")').first();
      if (await newBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await newBtn.click();
        await page.waitForTimeout(300);

        const nameInput = page.locator('input').first();
        if (await nameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await nameInput.fill(`Stack Test ${i}`);
          const submitBtn = page.locator('button[type="submit"]').first();
          if (await submitBtn.isVisible()) {
            await submitBtn.click();
            await page.waitForTimeout(400);
          }
        }
      }
    }

    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/4.7-toast-stacking.png' });
  });

  test('4.8 Manual close - click X', async ({ page }) => {
    await navigateToAppPage(page, '/resources/materials');

    // Trigger a toast
    const newBtn = page.locator('button:has-text("Nieuw"), button:has-text("Toevoegen")').first();
    if (await newBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await newBtn.click();
      await page.waitForTimeout(500);

      const nameInput = page.locator('input').first();
      if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nameInput.fill(`Close Test ${Date.now()}`);
        const submitBtn = page.locator('button[type="submit"]').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(1500);
        }
      }
    }

    await page.screenshot({ path: 'test-results/4.8-toast-visible.png' });

    // Try to find and click close button on toast
    const closeBtn = page.locator('[class*="toast"] button, [class*="Toast"] button').first();
    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/4.8-toast-closed.png' });
    }
  });

  test('4.9 Consistent messaging', async ({ page }) => {
    // Test that all pages have consistent layout
    const pagePaths = ['/projects', '/clients', '/resources/materials'];

    for (const path of pagePaths) {
      await navigateToAppPage(page, path);
      await page.screenshot({ path: `test-results/4.9-consistent-${path.replace(/\//g, '-')}.png` });
    }
  });
});
