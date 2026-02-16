import { Page } from '@playwright/test';

/**
 * Reusable helper functions for E2E tests
 */

export interface TestUser {
    email: string;
    password: string;
    id?: string;
}

export const TEST_USERS = {
    admin: { email: 'admin@hidroaliaga.com', password: 'admin123', id: '11111111-1111-1111-1111-111111111111' },
    userA: { email: 'user_a@test.com', password: 'password123', id: '22222222-2222-2222-2222-222222222222' },
    userB: { email: 'user_b@test.com', password: 'password123', id: '33333333-3333-3333-3333-333333333333' },
} as const;

export const TEST_PROJECT_ID = 'aaaa1111-1111-1111-1111-111111111111';

/**
 * Login helper — In E2E test mode (NEXT_PUBLIC_SKIP_AUTH=true), 
 * middleware is bypassed so we can navigate directly to dashboard.
 * For real auth tests, set SKIP_AUTH=false.
 */
export async function loginAs(page: Page, _user: TestUser, options: { timeout?: number } = {}) {
    const timeout = options.timeout || 30000;

    // Since the webServer is started with NEXT_PUBLIC_SKIP_AUTH=true,
    // middleware allows all requests through. Just navigate directly.

    // Set cookie for API route identification
    if (_user.id) {
        await page.context().addCookies([{
            name: 'e2e-user-id',
            value: _user.id,
            domain: 'localhost',
            path: '/'
        }]);
    }

    await page.goto('/dashboard');

    // Wait for the page to fully load
    try {
        await page.waitForLoadState('networkidle', { timeout });
    } catch {
        // networkidle can be flaky, domcontentloaded is sufficient
        await page.waitForLoadState('domcontentloaded');
    }

    // If we got redirected to login (SKIP_AUTH not working), try form login
    if (page.url().includes('/login')) {
        console.log('SKIP_AUTH not active, attempting form login...');
        await page.fill('[data-testid="login-email"]', _user.email);
        await page.fill('[data-testid="login-password"]', _user.password);
        await page.click('[data-testid="login-submit"]');
        await page.waitForURL('**/dashboard', { timeout });
        await page.waitForLoadState('networkidle');
    }
}

/**
 * Navigate to an existing project or create a new one
 */
export async function goToProject(page: Page, options: { createNew?: boolean } = {}) {
    // If createNew is true, create a new project
    if (options.createNew) {
        await page.goto('/proyectos/nuevo');
        await page.waitForLoadState('domcontentloaded');
        await page.fill('#nombre', `E2E Test Project ${Date.now()}`);
        await page.fill('#poblacion_diseno', '500');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/proyectos\/[0-9a-f-]+/);
        await page.waitForLoadState('domcontentloaded');
        return;
    }

    // Try to find existing project
    await page.goto('/proyectos');
    await page.waitForLoadState('domcontentloaded');

    // Wait for project list to load
    try {
        await page.waitForSelector('[data-testid="project-card"], text=No hay proyectos', { timeout: 10000 });
    } catch {
        // Continue if timeout, might be empty
    }

    const projectLinks = page.locator('a[href^="/proyectos/"]').filter({
        hasNotText: /nuevo|Ver todos/i
    });

    const count = await projectLinks.count();
    if (count > 0) {
        await projectLinks.first().click();
        await page.waitForURL(/\/proyectos\/[0-9a-f-]+/);
        await page.waitForLoadState('domcontentloaded');
    } else {
        // No projects found, create one
        await goToProject(page, { createNew: true });
    }
}

/**
 * Open designer tab in project view
 */
export async function openDesignerTab(page: Page) {
    const tab = page.getByRole('tab', { name: /Diseñador y Datos/i });
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
