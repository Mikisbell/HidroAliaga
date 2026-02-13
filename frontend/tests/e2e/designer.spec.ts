import { test, expect, Page } from '@playwright/test';
import { loginAs, TEST_USERS, goToProject, openDesignerTab as helperOpenDesignerTab } from './helpers';

/**
 * Diseñador de Red — End-to-End Test
 */

test.describe('Diseñador de Red', () => {
    test.setTimeout(90000);

    test.beforeEach(async ({ page }) => {
        // Login and navigate to project
        await loginAs(page, TEST_USERS.admin);
        await goToProject(page);
    });

    async function openDesignerTab(page: Page) {
        const tab = page.getByRole('tab', { name: /Diseñador de Red/i });
        await expect(tab).toBeVisible({ timeout: 10000 });
        await tab.click();
        await page.waitForSelector('.react-flow', { timeout: 25000 });
    }

    test('should show all project tabs', async ({ page }) => {
        await expect(page.getByRole('tab', { name: /Configuración/i })).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('tab', { name: /Editor de Tramos/i })).toBeVisible();
        await expect(page.getByRole('tab', { name: /Nudos/i })).toBeVisible();
        await expect(page.getByRole('tab', { name: /Diseñador de Red/i })).toBeVisible();
        await expect(page.getByRole('tab', { name: /Resultados/i })).toBeVisible();
        await expect(page.getByRole('tab', { name: /Optimización/i })).toBeVisible();
    });

    test('should load React Flow canvas in designer tab', async ({ page }) => {
        await openDesignerTab(page);
        await expect(page.locator('.react-flow')).toBeVisible();
        await expect(page.locator('.react-flow__background')).toBeVisible();
        await expect(page.locator('.react-flow__controls')).toBeVisible();
        await expect(page.locator('.react-flow__minimap')).toBeVisible();
    });

    test('should show component palette', async ({ page }) => {
        await openDesignerTab(page);
        await expect(page.getByText('Reservorio')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('C. Rompe Presión')).toBeVisible();
        await expect(page.getByText('Nudo / Unión')).toBeVisible();
        await expect(page.getByText('Tubería')).toBeVisible();
    });

    test('should activate node placement mode', async ({ page }) => {
        await openDesignerTab(page);
        await page.getByText('Nudo / Unión').click();
        await expect(page.getByText('Modo: Colocar Componente')).toBeVisible({ timeout: 3000 });
    });

    test('should activate pipe connection mode', async ({ page }) => {
        await openDesignerTab(page);
        await page.getByText('Tubería').click();
        await expect(page.getByText('Modo: Conectar')).toBeVisible({ timeout: 3000 });
    });

    test('should place a node on canvas click', async ({ page }) => {
        await openDesignerTab(page);

        // Force a stable state
        await page.waitForTimeout(2000);

        const initialCount = await page.locator('.react-flow__node').count();

        // Activate Nudo tool
        await page.getByText('Nudo / Unión').click({ force: true });
        await page.waitForTimeout(500);

        // Click canvas in top-left area to avoid existing center nodes
        const canvas = page.locator('.react-flow');
        await canvas.waitFor({ state: 'visible' });

        const box = await canvas.boundingBox();
        if (box) {
            // Move to safe spot
            await page.mouse.move(box.x + 150, box.y + 150);
            // Explicit down/up with pause to ensure it's registered as a click, not a drag
            await page.mouse.down();
            await page.waitForTimeout(300); // 300ms is safe for a 'click'
            await page.mouse.up();
        }

        // Wait for optimistic update
        try {
            await expect(async () => {
                const newCount = await page.locator('.react-flow__node').count();
                expect(newCount).toBeGreaterThan(initialCount);
            }).toPass({ timeout: 15000 });
        } catch (e) {
            await page.screenshot({ path: 'test-results/node-place-failure.png' });
            throw e;
        }
    });

    test('should have working zoom controls', async ({ page }) => {
        await openDesignerTab(page);
        const controls = page.locator('.react-flow__controls');
        await expect(controls).toBeVisible();
        const buttons = controls.locator('button');
        expect(await buttons.count()).toBeGreaterThanOrEqual(2);
        await buttons.first().click();
    });

    test('should open property inspector on node click without navigation', async ({ page }) => {
        await openDesignerTab(page);

        // Force stable state
        await page.waitForTimeout(1000);

        const initialUrl = page.url();

        // 1. Create a node first (Drag & Drop) to ensure we have something to click
        // Or assume one exists from previous steps/default project? 
        // Safer to just create one quickly via drag
        const paletteItem = page.getByText('Reservorio').first();
        const canvas = page.locator('.react-flow');
        const box = await canvas.boundingBox();
        if (box) {
            await paletteItem.hover();
            await page.mouse.down();
            await page.mouse.move(box.x + 300, box.y + 300);
            await page.mouse.up();
        }

        // 2. Click the Node
        // We need to wait for it to appear
        const node = page.locator('.react-flow__node').last();
        await node.waitFor({ state: 'visible', timeout: 5000 });
        await node.click({ force: true });

        // 3. Verify URL did NOT change
        expect(page.url()).toBe(initialUrl);

        // 4. Verify Inspector Appears
        // We look for the header text we added in PropertyInspector.tsx
        const inspectorHeader = page.getByText('Propiedades del Nudo');
        await expect(inspectorHeader).toBeVisible({ timeout: 5000 });

        // 5. Verify Inputs exist
        await expect(page.locator('input[name="cota_terreno"]')).toBeVisible();
    });

    test('should drag and drop a node from palette', async ({ page }) => {
        await openDesignerTab(page);

        // Force stable state
        await page.waitForTimeout(1000);
        await page.waitForSelector('.react-flow__node');

        const initialCount = await page.locator('.react-flow__node').count();

        // 1. Get Palette Item (Reservorio) - Force distinct selector
        const paletteItem = page.getByText('Reservorio').first();
        await expect(paletteItem).toBeVisible();

        // 2. Get Drop Target (Canvas Center + Offset to be safe)
        const canvas = page.locator('.react-flow');
        const canvasBox = await canvas.boundingBox();
        if (!canvasBox) throw new Error('Canvas not found');

        const dropX = canvasBox.x + canvasBox.width / 2 + 150;
        const dropY = canvasBox.y + canvasBox.height / 2 + 150;

        // 3. Perform Drag & Drop
        await paletteItem.hover();
        await page.mouse.down();
        await page.mouse.move(dropX, dropY, { steps: 10 }); // Smooth drag
        await page.mouse.up();

        // 4. Verify Creation (Optimistic)
        await expect(async () => {
            const newCount = await page.locator('.react-flow__node').count();
            expect(newCount).toBeGreaterThan(initialCount);
        }).toPass({ timeout: 10000 });
    });
});
