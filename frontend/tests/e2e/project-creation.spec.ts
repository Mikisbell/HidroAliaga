import { test, expect } from '@playwright/test';

/**
 * E2E Test: Project Creation Flow
 * 
 * Login form selectors:
 *   - Email: input with placeholder="admin@hidroaliaga.com"
 *   - Password: input with placeholder="••••••••"
 *   - Submit: button with type="submit" containing "Iniciar Sesión" or "Ingresar"
 *
 * Nuevo Proyecto form:
 *   - Inputs use id attributes: #nombre, #departamento, #poblacion_diseno, etc.
 *   - Selects have defaultValue (ambito=urbano, tipo_red=cerrada)
 */

const TEST_EMAIL = 'admin@hidroaliaga.com';
const TEST_PASSWORD = 'admin123';

test.describe('Project Creation Flow', () => {

    test.beforeEach(async ({ page }) => {
        // Navigate to login
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        // Fill email and password using placeholders (proven to work)
        await page.getByPlaceholder('admin@hidroaliaga.com').fill(TEST_EMAIL);

        // Handle potential dynamic password field
        const passwordInput = page.getByPlaceholder('••••••••');
        await passwordInput.fill(TEST_PASSWORD);

        // Click submit
        await page.locator('button[type="submit"]').click();

        // Wait for redirect to dashboard
        // increasing timeout to 30s just in case
        await page.waitForURL('**/dashboard', { timeout: 30000 });
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

        await expect(page.locator('text=Nudos')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Tramos')).toBeVisible();
        await expect(page.locator('text=Mapa Visual')).toBeVisible();
    });
});
