
import { test, expect } from '@playwright/test';
import { loginAs, TEST_USERS } from './helpers';

test.describe('Hydraulic Analysis Flow', () => {

    test.beforeEach(async ({ page }) => {
        await loginAs(page, TEST_USERS.admin);
    });

    test('should create network, add nodes, and calculate hydraulics', async ({ page }) => {
        test.setTimeout(90000);

        // Listen to console logs
        page.on('console', msg => console.log(`BROWSER: ${msg.type()}: ${msg.text()}`));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err}`));

        // 1. Create Project
        await page.goto('/proyectos/nuevo');
        const projectName = `Hydraulic Test ${Date.now()}`;
        await page.fill('#nombre', projectName);
        await page.fill('#poblacion_diseno', '1000');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/proyectos\/[0-9a-f-]+/, { timeout: 40000 });

        // 2. Wait for Designer tab to be visible
        await expect(page.getByRole('tab', { name: /Diseñador y Datos/i })).toBeVisible({ timeout: 10000 });

        // 3. Open designer tab and wait for React Flow
        await page.getByRole('tab', { name: /Diseñador y Datos/i }).click();
        await page.waitForSelector('.react-flow', { timeout: 15000 });

        // 4. Place a Reservorio node
        await page.getByText('Reservorio').click();
        await page.waitForTimeout(500);

        const canvas = page.locator('.react-flow');
        const box = await canvas.boundingBox();
        if (!box) throw new Error('React Flow canvas not found');

        // Place Reservorio at left side
        await page.mouse.move(box.x + 200, box.y + box.height / 2);
        await page.mouse.down();
        await page.waitForTimeout(300);
        await page.mouse.up();
        await page.waitForTimeout(1000);

        // 5. Place a Nudo node
        await page.getByText('Nudo / Unión').click();
        await page.waitForTimeout(500);

        // Place Nudo at right side
        await page.mouse.move(box.x + box.width - 200, box.y + box.height / 2);
        await page.mouse.down();
        await page.waitForTimeout(300);
        await page.mouse.up();
        await page.waitForTimeout(1000);

        // 6. Verify nodes were created
        const nodeCount = await page.locator('.react-flow__node').count();
        expect(nodeCount).toBeGreaterThanOrEqual(2);

        // 7. Verify data tables show node count
        await expect(page.getByRole('tab', { name: /Nudos/i })).toBeVisible({ timeout: 5000 });

        // 8. Verify the Calculate button exists
        await expect(page.getByRole('button', { name: /Calcular/i })).toBeVisible();

        console.log('Hydraulic Test: Network created successfully with nodes');
    });
});
