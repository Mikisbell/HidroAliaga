import { Page } from '@playwright/test';

/**
 * Reusable helper functions for E2E tests
 */

export interface TestUser {
    email: string;
    password: string;
}

export const TEST_USERS = {
    admin: { email: 'admin@hidroaliaga.com', password: 'admin123' },
    userA: { email: 'user_a@test.com', password: 'password123' },
    userB: { email: 'user_b@test.com', password: 'password123' },
} as const;

/**
 * Login helper with robust error handling
 */
export async function loginAs(page: Page, user: TestUser, options: { timeout?: number } = {}) {
    const timeout = options.timeout || 30000;

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard with better error handling
    try {
        await page.waitForURL('**/dashboard', { timeout });
        await page.waitForLoadState('networkidle');
    } catch (error) {
        // Check if there's an error message on the page
        const errorMsg = await page.locator('[role="alert"], .error, .text-red-500').textContent();
        if (errorMsg) {
            throw new Error(`Login failed: ${errorMsg}`);
        }
        throw error;
    }
}

/**
 * Navigate to an existing project or create a new one
 */
export async function goToProject(page: Page, options: { createNew?: boolean } = {}) {
    // If createNew is true or no projects exist, create a new one
    if (options.createNew) {
        await page.goto('/proyectos/nuevo');
        await page.fill('#nombre', `E2E Test Project ${Date.now()}`);
        await page.fill('#poblacion_diseno', '500');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/proyectos\/[0-9a-f-]+/, { timeout: 30000 });
        await page.waitForLoadState('networkidle');
        return;
    }

    // Try to find existing project
    await page.goto('/proyectos');
    await page.waitForLoadState('networkidle');

    const projectLinks = page.locator('a[href^="/proyectos/"]').filter({
        hasNotText: /nuevo|Ver todos|Proyectos/i
    });

    const count = await projectLinks.count();
    if (count > 0) {
        await projectLinks.first().click();
        await page.waitForURL(/\/proyectos\/[0-9a-f-]+/, { timeout: 15000 });
        await page.waitForLoadState('networkidle');
    } else {
        // No projects found, create one
        await goToProject(page, { createNew: true });
    }
}

/**
 * Open designer tab in project view
 */
export async function openDesignerTab(page: Page) {
    const tab = page.getByRole('tab', { name: /Diseñador de Red/i });
    await tab.click({ timeout: 10000 });
    await page.waitForSelector('.react-flow', { timeout: 25000 });
    await page.waitForLoadState('networkidle');
}

/**
 * Wait for authentication to complete (usefulfor async operations)
 */
export async function waitForAuth(page: Page, timeout = 10000) {
    // Wait for either dashboard or login page
    await Promise.race([
        page.waitForURL('**/dashboard', { timeout }),
        page.waitForURL('**/login', { timeout }),
    ]);
}

/**
 * Cleanup helper - delete test projects
 */
export async function cleanupTestProjects(page: Page) {
    await page.goto('/proyectos');
    await page.waitForLoadState('networkidle');

    // Find all E2E test projects
    const testProjects = page.locator('[data-testid="project-card"]').filter({
        hasText: /E2E Test|Smoke Test|Test \d+/i
    });

    const count = await testProjects.count();
    for (let i = 0; i < count; i++) {
        try {
            await testProjects.nth(0).locator('[aria-label="Delete"]').click();
            await page.getByRole('button', { name: /confirmar|delete|eliminar/i }).click();
            await page.waitForTimeout(500);
        } catch {
            // Continue if deletion fails
        }
    }
}
