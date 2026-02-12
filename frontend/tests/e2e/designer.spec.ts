import { test, expect, Page } from '@playwright/test';

/**
 * Diseñador de Red — End-to-End Test
 */

test.describe('Diseñador de Red', () => {
    test.setTimeout(90000);

    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('input[type="email"]', 'admin@hidroaliaga.com');
        await page.fill('input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard', { timeout: 15000 });

        // Navigate to existing project via sidebar link with UUID pattern
        // Sidebar has links like /proyectos/0e9f25ef-e302-4773-bf4e-8920f2bb4155
        const projectLink = page.locator('a[href*="/proyectos/"]')
            .filter({ hasNot: page.locator(':text("nuevo")') })
            .filter({ hasNot: page.locator(':text("Ver todos")') })
            .filter({ hasNot: page.locator(':text("Proyectos")') })
            .first();

        // Wait for sidebar to populate
        await page.waitForTimeout(2000);

        // Direct approach: use goto with the first project UUID we know exists
        const links = page.locator('a[href^="/proyectos/"]');
        const allHrefs: string[] = [];
        const count = await links.count();
        for (let i = 0; i < count; i++) {
            const href = await links.nth(i).getAttribute('href');
            if (href && href.match(/\/proyectos\/[0-9a-f]{8}-/)) {
                allHrefs.push(href);
                break;
            }
        }

        if (allHrefs.length > 0) {
            await page.goto(allHrefs[0]);
        } else {
            // Absolute fallback: create a project
            await page.goto('/proyectos/nuevo');
            await page.fill('input[placeholder*="Red de Agua"]', `Test ${Date.now()}`);
            await page.fill('input[id="poblacion_diseno"], input[aria-label*="Población"]', '200');
            await page.click('button:has-text("Crear Proyecto")');
            await page.waitForURL(/\/proyectos\/[0-9a-f]{8}-/, { timeout: 30000 });
        }

        await page.waitForURL(/\/proyectos\/[0-9a-f]{8}-/, { timeout: 15000 });
        await page.waitForLoadState('networkidle');
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
        const initialCount = await page.locator('.react-flow__node').count();

        await page.getByText('Reservorio').first().click();
        await page.waitForTimeout(500);

        const box = await page.locator('.react-flow').boundingBox();
        if (box) {
            await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        }
        await page.waitForTimeout(1500);

        const newCount = await page.locator('.react-flow__node').count();
        expect(newCount).toBeGreaterThanOrEqual(initialCount + 1);
    });

    test('should have working zoom controls', async ({ page }) => {
        await openDesignerTab(page);
        const controls = page.locator('.react-flow__controls');
        await expect(controls).toBeVisible();
        const buttons = controls.locator('button');
        expect(await buttons.count()).toBeGreaterThanOrEqual(2);
        await buttons.first().click();
    });
});
