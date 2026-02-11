
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Smoke Test: Critical Path', () => {

    test('should login and load map editor', async ({ page }) => {
        test.setTimeout(60000); // 1 minute timeout for smoke test

        // 1. Login
        await page.goto('/login');
        await page.fill('input[type="email"]', 'admin@hidroaliaga.com');
        await page.fill('input[type="password"]', 'admin123'); // Default dev password
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard');

        // 2. Create New Project
        await page.goto('/proyectos/nuevo');
        const projectName = `Smoke Test ${Date.now()}`;
        await page.fill('#nombre', projectName);
        await page.fill('#poblacion_diseno', '500');
        await page.click('button[type="submit"]');

        // 3. Verify Map Load
        // Wait for redirection to project page
        await page.waitForURL(/\/proyectos\/[0-9a-f-]+/, { timeout: 30000 });

        // Assert "Mapa Visual" tab is present
        await expect(page.locator('text=Mapa Visual')).toBeVisible();

        // Assert Canvas/Map container exists
        // We use a more generic selector if .leaflet-container is slow to mount
        // But .leaflet-container is the key proof Leaflet loaded.
        try {
            await page.waitForSelector('.leaflet-container', { timeout: 15000 });
            console.log('Smoke Test: Map Loaded Successfully');
        } catch (e) {
            console.log('Smoke Test: Map Container Not Found via Selector');
            // Check for loading state
            if (await page.isVisible('text=Cargando mapa...')) {
                console.log('Smoke Test: Map stuck in loading state');
            }
            throw e;
        }
    });
});
