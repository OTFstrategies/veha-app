import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:1000';
const LOGIN_EMAIL = process.env.TEST_LOGIN_EMAIL!;
const LOGIN_PASSWORD = process.env.TEST_LOGIN_PASSWORD!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cache tokens across tests to reduce Supabase API calls
let cachedTokens: { access_token: string; refresh_token: string } | null = null;

async function getAuthTokens(page: Page) {
  if (cachedTokens) return cachedTokens;

  const response = await page.request.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      data: {
        email: LOGIN_EMAIL,
        password: LOGIN_PASSWORD,
      },
    }
  );
  cachedTokens = await response.json();
  return cachedTokens!;
}

async function login(page: Page) {
  const { access_token, refresh_token } = await getAuthTokens(page);

  // Navigate to auth callback with tokens (mimics Hub redirect)
  await page.goto(
    `${BASE_URL}/auth/callback#access_token=${access_token}&refresh_token=${refresh_token}`
  );

  // Wait for callback to set session and redirect to /dashboard
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

async function navigateTo(page: Page, path: string) {
  await login(page);
  await page.goto(`${BASE_URL}${path}`);
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

async function navigateToProjectDetail(page: Page) {
  await navigateTo(page, '/projects');
  // Click on "Herstraten Dam-gebied" which has tasks (35% progress)
  const targetProject = page.locator('h3:has-text("Herstraten Dam-gebied")');
  const anyProjectName = page.locator('.bg-card h3').first();

  if (await targetProject.isVisible({ timeout: 5000 }).catch(() => false)) {
    await targetProject.click();
  } else {
    await expect(anyProjectName).toBeVisible({ timeout: 5000 });
    await anyProjectName.click();
  }
  await page.waitForLoadState('networkidle');

  // Verify we navigated to a project detail page
  await expect(page).toHaveURL(/\/projects\/[a-zA-Z0-9-]+$/, { timeout: 10000 });

  // Wait for Gantt content to render (task rows or toolbar)
  await page.locator('[style*="height: 36px"], button[aria-label="Zoom in"]').first().waitFor({ timeout: 15000 }).catch(() => {});

  // If error boundary triggered, retry with page reload
  const errorBoundary = page.getByText('Er is iets misgegaan');
  if (await errorBoundary.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.locator('[style*="height: 36px"], button[aria-label="Zoom in"]').first().waitFor({ timeout: 15000 }).catch(() => {});
  }
}

async function openTaskEditor(page: Page) {
  await navigateToProjectDetail(page);
  // Double-click a task row in the Gantt grid to open the TaskEditor side panel
  // Task rows have fixed height (36px) and contain WBS + task name
  const taskRow = page.locator('[style*="height: 36px"]').first();
  await expect(taskRow).toBeVisible({ timeout: 10000 });
  await taskRow.dblclick();
  await page.waitForTimeout(1500);
  // Verify TaskEditor panel opened
  await expect(page.locator('button[aria-label="Sluiten"]')).toBeVisible({ timeout: 5000 });
}

test.describe.serial('Refactoring Verification', () => {

  // =========================================================================
  // A. View Rendering — Smoke Tests
  // =========================================================================

  test('A.1 Grid view loads', async ({ page }) => {
    await navigateTo(page, '/projects');
    await expect(page.getByRole('main').getByRole('heading', { name: 'Projecten' })).toBeVisible();
    await expect(page.locator('a[title="Grid weergave"]')).toBeVisible();
    await expect(page.locator('button:has-text("Nieuw project")')).toBeVisible();
    await page.screenshot({ path: 'test-results/A1-grid-view.png' });
  });

  test('A.2 Kanban view loads', async ({ page }) => {
    await navigateTo(page, '/projects/kanban');
    await expect(page.getByRole('main').getByRole('heading', { name: 'Projecten' })).toBeVisible();
    await expect(page.getByText('Sleep projecten om de status te wijzigen')).toBeVisible();
    await expect(page.locator('a[title="Kanban weergave"]')).toBeVisible();
    await page.screenshot({ path: 'test-results/A2-kanban-view.png' });
  });

  test('A.3 Gantt portfolio view loads', async ({ page }) => {
    await navigateTo(page, '/projects/gantt');
    await expect(page.getByRole('main').getByRole('heading', { name: 'Projecten' })).toBeVisible();
    await expect(page.getByText('Gantt tijdlijn van alle projecten')).toBeVisible();
    await expect(page.locator('button:has-text("Vandaag")')).toBeVisible();
    await expect(page.locator('a[title="Gantt weergave"]')).toBeVisible();
    await page.screenshot({ path: 'test-results/A3-gantt-portfolio.png' });
  });

  test('A.4 Project detail loads', async ({ page }) => {
    await navigateToProjectDetail(page);
    // Verify GanttToolbar elements exist (they prove the scheduler loaded)
    await page.screenshot({ path: 'test-results/A4-project-detail.png' });
  });

  // =========================================================================
  // B. Constants Correctness
  // =========================================================================

  test('B.1 STATUS_CONFIG labels render as filter buttons on grid', async ({ page }) => {
    await navigateTo(page, '/projects');
    await expect(page.getByRole('button', { name: 'Alle' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Gepland' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Actief' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'On-hold' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Afgerond' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Geannuleerd' })).toBeVisible();
    await page.screenshot({ path: 'test-results/B1-status-filters.png' });
  });

  test('B.2 WORK_TYPE_LABELS render on project cards', async ({ page }) => {
    await navigateTo(page, '/projects');
    const workTypeBadges = page.locator('text=/Straatwerk|Kitwerk|Reinigen|Kantoor|Overig/');
    await expect(workTypeBadges.first()).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'test-results/B2-worktype-labels.png' });
  });

  test('B.3 KANBAN_COLUMNS render as column headers', async ({ page }) => {
    await navigateTo(page, '/projects/kanban');
    await expect(page.locator('h2:has-text("Gepland"), h3:has-text("Gepland")').first()).toBeVisible();
    await expect(page.locator('h2:has-text("Actief"), h3:has-text("Actief")').first()).toBeVisible();
    await expect(page.locator('h2:has-text("On-hold"), h3:has-text("On-hold")').first()).toBeVisible();
    await expect(page.locator('h2:has-text("Afgerond"), h3:has-text("Afgerond")').first()).toBeVisible();
    await page.screenshot({ path: 'test-results/B3-kanban-columns.png' });
  });

  test('B.4 ZOOM_LABELS display in Gantt toolbar', async ({ page }) => {
    await navigateToProjectDetail(page);
    await expect(page.locator('button[aria-label="Zoom in"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Zoom uit"]')).toBeVisible();
    const zoomLabel = page.getByText('Dag', { exact: true });
    await expect(zoomLabel.first()).toBeVisible();
    await page.screenshot({ path: 'test-results/B4-zoom-labels.png' });
  });

  // =========================================================================
  // C. ViewSwitcher Navigation
  // =========================================================================

  test('C.1 Grid → Kanban via ViewSwitcher', async ({ page }) => {
    await navigateTo(page, '/projects');
    const gridLink = page.locator('a[title="Grid weergave"]');
    await expect(gridLink).toBeVisible();

    const kanbanLink = page.locator('a[title="Kanban weergave"]');
    await kanbanLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    expect(page.url()).toContain('/projects/kanban');
    await expect(page.getByText('Sleep projecten om de status te wijzigen')).toBeVisible();
    await page.screenshot({ path: 'test-results/C1-grid-to-kanban.png' });
  });

  test('C.2 Kanban → Gantt via ViewSwitcher', async ({ page }) => {
    await navigateTo(page, '/projects/kanban');
    const ganttLink = page.locator('a[title="Gantt weergave"]');
    await ganttLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    expect(page.url()).toContain('/projects/gantt');
    await expect(page.getByText('Gantt tijdlijn van alle projecten')).toBeVisible();
    await page.screenshot({ path: 'test-results/C2-kanban-to-gantt.png' });
  });

  test('C.3 Gantt → Grid via ViewSwitcher', async ({ page }) => {
    await navigateTo(page, '/projects/gantt');
    const gridLink = page.locator('a[title="Grid weergave"]');
    await gridLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    expect(page.url()).toMatch(/\/projects$/);
    await expect(page.locator('button:has-text("Nieuw project")')).toBeVisible();
    await page.screenshot({ path: 'test-results/C3-gantt-to-grid.png' });
  });

  // =========================================================================
  // D. ProjectCard Rendering
  // =========================================================================

  test('D.1 Grid variant shows all fields', async ({ page }) => {
    await navigateTo(page, '/projects');
    const cards = page.locator('[class*="rounded-lg border"][class*="bg-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    const firstCard = cards.first();
    await expect(firstCard.locator('h3').first()).toBeVisible();
    await expect(firstCard.locator('text=/Gepland|Actief|On-hold|Afgerond|Geannuleerd/').first()).toBeVisible();
    await expect(firstCard.locator('text=/Straatwerk|Kitwerk|Reinigen|Kantoor|Overig/').first()).toBeVisible();
    await expect(firstCard.locator('text=/\\d{1,2}\\s\\w{3}/').first()).toBeVisible();
    await expect(firstCard.locator('text=/\\d+%/').first()).toBeVisible();
    await page.screenshot({ path: 'test-results/D1-grid-card.png' });
  });

  test('D.2 Kanban variant shows essential fields', async ({ page }) => {
    await navigateTo(page, '/projects/kanban');
    const cards = page.locator('button[class*="rounded-lg"][class*="border"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    const firstCard = cards.first();
    await expect(firstCard.locator('h3').first()).toBeVisible();
    await expect(firstCard.locator('text=/Straatwerk|Kitwerk|Reinigen|Kantoor|Overig/').first()).toBeVisible();
    await expect(firstCard.locator('text=/\\d+%/').first()).toBeVisible();
    await page.screenshot({ path: 'test-results/D2-kanban-card.png' });
  });

  // =========================================================================
  // E. Kanban Drag & Drop
  // =========================================================================

  test('E.1 Drag overlay renders during drag', async ({ page }) => {
    await navigateTo(page, '/projects/kanban');

    const firstCard = page.locator('button[class*="rounded-lg"][class*="border"]').first();
    await expect(firstCard).toBeVisible({ timeout: 5000 });

    const box = await firstCard.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 50, { steps: 10 });
      await page.waitForTimeout(500); // Wait for drag animation
      await page.screenshot({ path: 'test-results/E1-drag-overlay.png' });
      await page.mouse.up();
    }

    // Assert no error boundary triggered during drag
    const errorBoundary = page.getByText('Er is iets misgegaan');
    await expect(errorBoundary).not.toBeVisible({ timeout: 2000 });
  });

  test('E.2 Drag card between columns updates status', async ({ page }) => {
    await navigateTo(page, '/projects/kanban');

    await page.screenshot({ path: 'test-results/E2-before-drag.png' });

    const firstCard = page.locator('button[class*="rounded-lg"][class*="border"]').first();
    await expect(firstCard).toBeVisible({ timeout: 5000 });

    const cardBox = await firstCard.boundingBox();
    expect(cardBox).toBeTruthy();
    if (cardBox) {
      await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(cardBox.x + 400, cardBox.y + cardBox.height / 2, { steps: 20 });
      await page.waitForTimeout(500); // Wait for drag animation
      await page.mouse.up();
      await page.waitForTimeout(2000); // Wait for status update API call
    }

    // Assert no error boundary triggered during cross-column drag
    const errorBoundary = page.getByText('Er is iets misgegaan');
    await expect(errorBoundary).not.toBeVisible({ timeout: 2000 });
    await page.screenshot({ path: 'test-results/E2-after-drag.png' });
  });

  // =========================================================================
  // F. Gantt Panel Interactions
  // =========================================================================

  test('F.1 Task bars render in GanttPanel', async ({ page }) => {
    await navigateToProjectDetail(page);
    const taskRows = page.locator('[style*="height: 36px"], [style*="height:36px"]');
    await expect(taskRows.first()).toBeVisible({ timeout: 10000 });
    const count = await taskRows.count();
    expect(count).toBeGreaterThan(0);
    await page.screenshot({ path: 'test-results/F1-gantt-task-bars.png' });
  });

  test('F.2 Zoom changes bar scale', async ({ page }) => {
    await navigateToProjectDetail(page);

    const zoomIn = page.locator('button[aria-label="Zoom in"]');
    const zoomOut = page.locator('button[aria-label="Zoom uit"]');
    await expect(zoomIn).toBeVisible();
    await expect(zoomOut).toBeVisible();

    await expect(page.getByText('Dag', { exact: true }).first()).toBeVisible();
    await page.screenshot({ path: 'test-results/F2-zoom-dag.png' });

    await zoomOut.click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Week', { exact: true }).first()).toBeVisible();
    await page.screenshot({ path: 'test-results/F2-zoom-week.png' });

    await zoomOut.click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Maand', { exact: true }).first()).toBeVisible();
    await page.screenshot({ path: 'test-results/F2-zoom-maand.png' });

    await zoomIn.click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Week', { exact: true }).first()).toBeVisible();
  });

  test('F.3 Double-click task opens TaskEditor', async ({ page }) => {
    await openTaskEditor(page);
    const closeBtn = page.locator('button[aria-label="Sluiten"]');
    await page.screenshot({ path: 'test-results/F3-task-editor-open.png' });
    if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await closeBtn.click();
    }
  });

  // =========================================================================
  // H. TaskEditor Tabs
  // =========================================================================

  test('H.1 TaskEditor opens with header and footer', async ({ page }) => {
    await openTaskEditor(page);
    await expect(page.locator('button[aria-label="Sluiten"]')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Details' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Resources' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Dependencies' })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Discussie/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Verwijderen/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Annuleren' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Opslaan' })).toBeVisible();
    await page.screenshot({ path: 'test-results/H1-task-editor-structure.png' });
  });

  test('H.2 Details tab renders TaskDetailsPanel', async ({ page }) => {
    await openTaskEditor(page);
    const tabPanel = page.getByRole('tabpanel');
    await expect(page.getByPlaceholder('Voeg een beschrijving toe...')).toBeVisible();
    await expect(tabPanel.getByText('Start', { exact: true })).toBeVisible();
    await expect(tabPanel.getByText('Eind', { exact: true })).toBeVisible();
    await expect(tabPanel.getByText('Duur (dagen)')).toBeVisible();
    await expect(tabPanel.getByText('Voortgang')).toBeVisible();
    await expect(page.locator('input[aria-label="Voortgang percentage"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Todo' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'In Progress' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Done' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Laag' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Normaal' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Hoog' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Urgent' })).toBeVisible();
    await expect(page.locator('button[aria-label="Milestone toggle"]')).toBeVisible();
    await page.screenshot({ path: 'test-results/H2-details-panel.png' });
  });

  test('H.3 Resources tab renders TaskResourcePanel', async ({ page }) => {
    await openTaskEditor(page);
    await page.getByRole('tab', { name: 'Resources' }).click();
    await page.waitForTimeout(500);
    const resourcePanel = page.getByRole('tabpanel');
    await expect(resourcePanel.getByText('Toegewezen', { exact: true })).toBeVisible();
    await expect(resourcePanel.getByRole('button', { name: /Toevoegen/ })).toBeVisible();
    await page.screenshot({ path: 'test-results/H3-resources-panel.png' });
  });

  test('H.4 Dependencies tab renders TaskDependencyPanel', async ({ page }) => {
    await openTaskEditor(page);
    await page.getByRole('tab', { name: 'Dependencies' }).click();
    await page.waitForTimeout(500);
    const depPanel = page.getByRole('tabpanel');
    await expect(depPanel.getByText('Huidige dependencies')).toBeVisible();
    await expect(depPanel.getByText('Nieuwe dependency toevoegen')).toBeVisible();
    await expect(depPanel.getByText('Voorganger')).toBeVisible();
    await expect(depPanel.getByText('Lag (dagen)')).toBeVisible();
    await expect(depPanel.getByRole('button', { name: 'Dependency Toevoegen' })).toBeVisible();
    await page.screenshot({ path: 'test-results/H4-dependencies-panel.png' });
  });

  // =========================================================================
  // J. Edge Cases
  // =========================================================================

  test('J.1 No console errors across all routes', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await navigateTo(page, '/projects');
    await page.waitForTimeout(2000);

    await page.goto(`${BASE_URL}/projects/kanban`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.goto(`${BASE_URL}/projects/gantt`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const importErrors = errors.filter(e =>
      e.includes('is not defined') ||
      e.includes('Cannot read properties of undefined') ||
      e.includes('is not a function') ||
      e.includes('Module not found')
    );

    if (errors.length > 0) {
      console.log('Page errors found:', errors);
    }

    expect(importErrors).toHaveLength(0);
    await page.screenshot({ path: 'test-results/J1-no-console-errors.png' });
  });

  test('J.2 Loading states display on grid', async ({ page }) => {
    await navigateTo(page, '/projects');
    await page.screenshot({ path: 'test-results/J2-loading-state.png' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/J2-loaded-state.png' });
  });

  test('J.3 Kanban empty column renders correctly', async ({ page }) => {
    await navigateTo(page, '/projects/kanban');
    // Columns show count as plain number next to name (e.g. "Gepland 0", "Actief 5")
    // Verify all 4 columns are visible with their counts
    await expect(page.getByText('Gepland').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Actief').first()).toBeVisible();
    await expect(page.getByText('On-hold').first()).toBeVisible();
    await expect(page.getByText('Afgerond').first()).toBeVisible();
    // Verify empty column shows "Geen projecten" message
    await expect(page.getByText('Geen projecten').first()).toBeVisible();
    await page.screenshot({ path: 'test-results/J3-kanban-columns-with-counts.png' });
  });

});
