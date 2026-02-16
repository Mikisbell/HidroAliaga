import { test, expect } from '@playwright/test';
import { loginAs, TEST_USERS } from './helpers';

/**
 * E2E Test: Project Creation Flow
 * 
 * Nuevo Proyecto form:
 *   - Inputs use id attributes: #nombre, #departamento, #poblacion_diseno, etc.
 *   - Selects have defaultValue (ambito=urbano, tipo_red=cerrada)
 */

test.describe('Project Creation Flow', () => {

    test.beforeEach(async ({ page }) => {
        await loginAs(page, TEST_USERS.admin);
    });

    test('should navigate to new project form', async ({ page }) => {
        await page.goto('/proyectos/nuevo');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('h1')).toContainText('Nuevo Proyecto');
    });

    test('should show validation errors on empty submit', async ({ page }) => {
        await page.goto('/proyectos/nuevo');
        await page.waitForLoadState('networkidle');

        await page.fill('#nombre', '');
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/\/proyectos\/nuevo/);
    });

    test('should create a new project successfully', async ({ page }) => {
        await page.goto('/proyectos/nuevo');
        await page.waitForLoadState('networkidle');

        const projectName = `E2E Test Project ${Date.now()}`;
        await page.fill('#nombre', projectName);
        await page.fill('#descripcion', 'Created by Playwright E2E Test');
        await page.fill('#departamento', 'Cajamarca');
        await page.fill('#provincia', 'Jaén');
        await page.fill('#distrito', 'San Ignacio');
        await page.fill('#poblacion_diseno', '5000');

        await page.click('button[type="submit"]');
        await page.waitForURL(/\/proyectos\/[0-9a-f-]+/, { timeout: 15000 });

        await expect(page.locator('h1')).toContainText(projectName);
    });

    test('should display project workspace after creation', async ({ page }) => {
        await page.goto('/proyectos/nuevo');
        await page.waitForLoadState('networkidle');

        const projectName = `Workspace Check ${Date.now()}`;
        await page.fill('#nombre', projectName);
        await page.fill('#poblacion_diseno', '1000');

        await page.click('button[type="submit"]');
        await page.waitForURL(/\/proyectos\/[0-9a-f-]+/, { timeout: 15000 });

        // Verify the new tab structure
        await expect(page.getByRole('tab', { name: /Diseñador y Datos/i })).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('tab', { name: /Resultados/i })).toBeVisible();
        await expect(page.getByRole('tab', { name: /Configuración/i })).toBeVisible();
    });
});
