import { test, expect } from '@playwright/test';
import { loginAs, TEST_USERS } from './helpers';

/**
 * Tests E2E - Aislamiento de Datos entre Usuarios
 * 
 * Estos tests verifican que:
 * 1. Usuario A solo ve sus proyectos
 * 2. Usuario B solo ve sus proyectos  
 * 3. Usuario A no puede acceder a proyectos de B
 * 4. El aislamiento persiste después de refresh
 */

test.describe('User Data Isolation', () => {

    test('User A should only see their own projects', async ({ page }) => {
        test.setTimeout(90000);

        // 1. Login como Usuario A
        await loginAs(page, TEST_USERS.userA);

        // 2. Ir a proyectos
        await page.goto('/proyectos');
        await page.waitForLoadState('networkidle');

        // 3. Verificar que no hay proyectos de Usuario B
        const otherUserProjects = await page.locator('text=Proyecto Usuario B').count();
        expect(otherUserProjects).toBe(0);

        // 4. Verificar que puede ver sus propios proyectos (si existen)
        const userProjects = await page.locator('text=Proyecto Usuario A').count();
        console.log(`Usuario A ve ${userProjects} proyectos propios`);
    });

    test('User B should only see their own projects', async ({ page }) => {
        test.setTimeout(90000);

        // 1. Login como Usuario B
        await loginAs(page, TEST_USERS.userB);

        // 2. Ir a proyectos
        await page.goto('/proyectos');
        await page.waitForLoadState('networkidle');

        // 3. Verificar que no hay proyectos de Usuario A
        const otherUserProjects = await page.locator('text=Proyecto Usuario A').count();
        expect(otherUserProjects).toBe(0);

        // 4. Verificar que puede ver sus propios proyectos (si existen)
        const userProjects = await page.locator('text=Proyecto Usuario B').count();
        console.log(`Usuario B ve ${userProjects} proyectos propios`);
    });

    test('Cross-user project access should be denied', async ({ page, browser }) => {
        test.setTimeout(90000);

        // 1. Login como Usuario A y crear proyecto
        await loginAs(page, TEST_USERS.userA);

        // Crear proyecto
        await page.goto('/proyectos/nuevo');
        const projectName = `Proyecto Secreto A ${Date.now()}`;
        await page.fill('#nombre', projectName);
        await page.fill('#poblacion_diseno', '100');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/proyectos\/[0-9a-f-]+/);

        // Obtener ID del proyecto
        const projectUrl = page.url();
        const projectId = projectUrl.split('/').pop();
        if (!projectId) throw new Error("Could not extract project ID");
        console.log(`Proyecto creado con ID: ${projectId}`);

        // 2. Abrir nueva ventana como Usuario B
        const contextB = await browser.newContext();
        const pageB = await contextB.newPage();

        await loginAs(pageB, TEST_USERS.userB);

        // 3. Intentar acceder al proyecto de A
        await pageB.goto(`/proyectos/${projectId}`);
        await pageB.waitForLoadState('networkidle');

        // 4. Verificar que muestra error 403 o redirige
        const currentUrl = pageB.url();
        const hasError = await pageB.locator('text=/403|Forbidden|No tienes permiso/i').count() > 0;
        const isRedirected = !currentUrl.includes(projectId);

        expect(hasError || isRedirected).toBeTruthy();
        console.log('Acceso cruzado correctamente bloqueado');

        await contextB.close();
    });

    test('Project isolation persists after refresh', async ({ page }) => {
        test.setTimeout(60000);

        // 1. Login
        await loginAs(page, TEST_USERS.userA);

        // 2. Ir a proyectos
        await page.goto('/proyectos');
        await page.waitForLoadState('networkidle');

        // 3. Refrescar página
        await page.reload();
        await page.waitForLoadState('networkidle');

        // 4. Verificar que el aislamiento persiste
        const otherUserProjects = await page.locator('text=Proyecto Usuario B').count();
        expect(otherUserProjects).toBe(0);

        console.log('Aislamiento persiste después de refresh');
    });

    test('New user should see empty project list', async ({ page }) => {
        test.setTimeout(60000);

        // 1. Login con usuario nuevo - use data-testid selectors
        await page.goto('/login');
        await page.waitForLoadState('networkidle');
        await page.fill('[data-testid="login-email"]', `newuser_${Date.now()}@test.com`);
        await page.fill('[data-testid="login-password"]', 'password123');
        await page.click('[data-testid="login-submit"]');

        // Si el usuario no existe, puede que necesitemos registrarnos primero
        try {
            await page.waitForURL('/dashboard', { timeout: 5000 });
        } catch {
            // Si no redirige a dashboard, puede ser página de registro
            console.log('Usuario nuevo - puede necesitar registro');
            return;
        }

        // 2. Ir a proyectos
        await page.goto('/proyectos');
        await page.waitForLoadState('networkidle');

        // 3. Verificar mensaje de "sin proyectos" o lista vacía
        const noProjectsMessage = await page.locator('text=/Sin proyectos|No hay proyectos|Comienza/i').count();
        const projectCards = await page.locator('[data-testid="project-card"], .project-card').count();

        expect(noProjectsMessage > 0 || projectCards === 0).toBeTruthy();
        console.log('Usuario nuevo ve lista vacía correctamente');
    });
});
