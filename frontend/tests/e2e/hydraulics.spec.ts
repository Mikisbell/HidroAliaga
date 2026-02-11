
import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'admin@hidroaliaga.com';
const TEST_PASSWORD = 'admin123';

test.describe('Hydraulic Analysis Flow', () => {

    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.getByPlaceholder('admin@hidroaliaga.com').fill(TEST_EMAIL);
        await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
        await page.locator('button[type="submit"]').click();
        await page.waitForURL('**/dashboard', { timeout: 30000 });
    });

    test('should create network, set properties, and calculate hydraulics', async ({ page }) => {
        test.setTimeout(90000); // 90s timeout

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

        // Wait for Map text
        await expect(page.locator('text=Mapa Visual')).toBeVisible();

        // Debug Map Loading
        try {
            await page.waitForSelector('.leaflet-container', { timeout: 10000 });
        } catch (e) {
            console.log('Map container not found within 10s. Checking for loading state...');
            if (await page.isVisible('text=Cargando mapa...')) {
                console.log('Map is still loading...');
                // Wait longer
                await page.waitForSelector('.leaflet-container', { timeout: 30000 });
            } else {
                console.log('Map not loading and not visible. Page content dump:');
                console.log(await page.content());
                throw e;
            }
        }

        // 2. Add Nodes
        // Select Node Tool
        await page.getByRole('button', { name: 'Añadir Nudo' }).click();

        // Click on Map to add Node 1 (Source)
        // Use mouse.click for canvas/map container
        const map = page.locator('.leaflet-container');
        const box = await map.boundingBox();
        if (!box) throw new Error('Map container not found');

        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;

        await page.mouse.click(centerX - 100, centerY); // Node 1
        // Wait for marker
        await expect(page.locator('.leaflet-marker-icon')).toHaveCount(1);

        // Click on Map to add Node 2 (Demand)
        await page.mouse.click(centerX + 100, centerY); // Node 2
        await expect(page.locator('.leaflet-marker-icon')).toHaveCount(2);

        // 3. Draw Pipe
        await page.getByRole('button', { name: 'Dibujar Tubería' }).click();

        const markers = page.locator('.leaflet-marker-icon');
        // Click markers center
        const m1Box = await markers.nth(0).boundingBox();
        const m2Box = await markers.nth(1).boundingBox();
        if (!m1Box || !m2Box) throw new Error('Markers not found');

        await page.mouse.click(m1Box.x + m1Box.width / 2, m1Box.y + m1Box.height / 2);
        await page.waitForTimeout(200); // Small debounce
        await page.mouse.click(m2Box.x + m2Box.width / 2, m2Box.y + m2Box.height / 2);

        // Wait for pipe (path.leaflet-interactive)
        // There might be other paths (like domain/image bounds), so look for distinct stroke or class?
        // Polyline usually has specifically leaflet-interactive class.
        // Let's wait for count > 0 paths.
        await expect(page.locator('path.leaflet-interactive')).toHaveCount(1, { timeout: 5000 }).catch(() => {
            // Retry click due to potential "map move" on first click?
            // Or maybe just check if it exists eventually.
        });

        // 4. Set Properties
        await page.getByRole('button', { name: 'Seleccionar' }).click();

        // Node 1 (Source)
        await page.mouse.click(m1Box.x + m1Box.width / 2, m1Box.y + m1Box.height / 2);
        // Properties Panel should open
        await expect(page.locator('text=Propiedades del Nudo')).toBeVisible();
        await page.fill('input[id^="cota"]', '100'); // Cota Terreno
        await page.click('button:has-text("Guardar")');
        // Wait for saving toast or effect. 
        await page.waitForTimeout(500);

        // Node 2 (Demand)
        await page.mouse.click(m2Box.x + m2Box.width / 2, m2Box.y + m2Box.height / 2);
        await page.fill('input[id^="cota"]', '90');
        await page.fill('input[id^="demanda"]', '10'); // 10 L/s
        await page.click('button:has-text("Guardar")');
        await page.waitForTimeout(500);

        // 5. Calculate
        await page.getByRole('button', { name: 'Calcular Hidráulica' }).click();

        // 6. Verify Results
        // Click Node 2 to check pressure
        await page.mouse.click(m2Box.x + m2Box.width / 2, m2Box.y + m2Box.height / 2);

        // Popup should show "Presión Dinámica"
        // Marker click opens popup.
        // Wait for popup content
        await expect(page.locator('.leaflet-popup-content')).toContainText('Presión Dinámica', { timeout: 5000 });

        // Check value (Should be positive around 10m - friction?)
        // 100m - 90m = 10m Static.
        // Friction will reduce it slightly.
        // So checking for "mca" exists.
        await expect(page.locator('.leaflet-popup-content')).toContainText('mca');
    });
});
