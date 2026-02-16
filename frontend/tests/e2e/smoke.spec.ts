
import { test, expect } from '@playwright/test';
import { loginAs, TEST_USERS, goToProject } from './helpers';

test.describe('Smoke Test: Critical Path', () => {

    test('should login and load map editor', async ({ page }) => {
        test.setTimeout(60000);

        // 1. Login
        await loginAs(page, TEST_USERS.admin);

        // 2. Create New Project
        await page.goto('/proyectos/nuevo');
        const projectName = `Smoke Test ${Date.now()}`;
        await page.fill('#nombre', projectName);
        await page.fill('#poblacion_diseno', '500');
        await page.click('button[type="submit"]');

        // 3. Verify Project Loads (redirects to project page)
        await page.waitForURL(/\/proyectos\/[0-9a-f-]+/, { timeout: 30000 });

        // 4. Assert "Diseñador y Datos" tab is present (replaced "Mapa Visual")
        await expect(page.getByRole('tab', { name: /Diseñador y Datos/i })).toBeVisible({ timeout: 10000 });

        // 5. Assert React Flow canvas exists (replaced Leaflet)
        try {
            await page.waitForSelector('.react-flow', { timeout: 15000 });
            console.log('Smoke Test: React Flow Designer Loaded Successfully');
        } catch (e) {
            console.log('Smoke Test: React Flow Container Not Found');
            throw e;
        }
    });
});
