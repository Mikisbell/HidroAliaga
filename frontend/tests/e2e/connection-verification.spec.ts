import { test, expect, Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { loginAs, TEST_USERS, TEST_PROJECT_ID } from './helpers';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env for Supabase direct access
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const NUDO_A_ID = 'cccc1111-1111-1111-1111-111111111111';
const NUDO_B_ID = 'cccc2222-2222-2222-2222-222222222222';

function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(url, key);
}

test.describe('Connection Logic Verification', () => {
    test.setTimeout(120000);

    test.beforeEach(async ({ page }) => {
        const supabase = getSupabase();

        // Clean up any previous test data - simpler queries to avoid syntax headers
        // Delete any tramos connected to our test nodes
        await supabase.from('tramos').delete().eq('nudo_inicio', NUDO_A_ID);
        await supabase.from('tramos').delete().eq('nudo_inicio', NUDO_B_ID);
        await supabase.from('tramos').delete().eq('nudo_fin', NUDO_A_ID);
        await supabase.from('tramos').delete().eq('nudo_fin', NUDO_B_ID);

        // Now safe to delete nodes
        await supabase.from('nudos').delete().in('id', [NUDO_A_ID, NUDO_B_ID]);

        // Seed two junction nodes at known positions
        const { error: errA } = await supabase.from('nudos').insert({
            id: NUDO_A_ID,
            proyecto_id: TEST_PROJECT_ID,
            codigo: 'J-TEST-A',
            tipo: 'union',
            latitud: 0.2,      // ReactFlow y = latitud * 1000 = 200px
            longitud: 0.2,     // ReactFlow x = longitud * 1000 = 200px
            cota_terreno: 100,
            demanda_base: 0,
            elevacion: 0,
            numero_viviendas: 0,
            altura_agua: 0,
        });
        if (errA) console.error('Failed to create Nudo A:', JSON.stringify(errA));

        const { error: errB } = await supabase.from('nudos').insert({
            id: NUDO_B_ID,
            proyecto_id: TEST_PROJECT_ID,
            codigo: 'J-TEST-B',
            tipo: 'union',
            latitud: 0.2,      // Same y as Node A
            longitud: 0.5,     // ReactFlow x = 500px (300px right of Node A)
            cota_terreno: 95,
            demanda_base: 0,
            elevacion: 0,
            numero_viviendas: 0,
            altura_agua: 0,
        });
        if (errB) console.error('Failed to create Nudo B:', JSON.stringify(errB));

        // Login and navigate
        await loginAs(page, TEST_USERS.admin);
        await page.goto(`/proyectos/${TEST_PROJECT_ID}`);
        await page.waitForLoadState('domcontentloaded');
    });

    test.afterEach(async () => {
        // Cleanup seeded data
        const supabase = getSupabase();
        await supabase.from('tramos').delete().eq('nudo_inicio', NUDO_A_ID);
        await supabase.from('tramos').delete().eq('nudo_inicio', NUDO_B_ID);
        await supabase.from('tramos').delete().eq('nudo_fin', NUDO_A_ID);
        await supabase.from('tramos').delete().eq('nudo_fin', NUDO_B_ID);
        await supabase.from('nudos').delete().in('id', [NUDO_A_ID, NUDO_B_ID]);
    });

    test('should show seeded nodes and allow connecting them', async ({ page }) => {
        // 1. Wait for ReactFlow canvas
        const canvas = page.locator('.react-flow');
        await expect(canvas).toBeVisible({ timeout: 30000 });
        await page.waitForTimeout(3000); // Let ReactFlow render nodes

        // 2. Verify nodes appear
        const nodes = page.locator('.react-flow__node');
        const nodeCount = await nodes.count();
        console.log(`Found ${nodeCount} nodes on canvas`);
        expect(nodeCount).toBeGreaterThanOrEqual(2);

        // 3. Get initial edge count
        const initialEdges = await page.locator('.react-flow__edge').count();
        console.log(`Initial edges: ${initialEdges}`);

        // 4. Find the two test nodes and their handles
        const nodeA = nodes.nth(0);
        const nodeB = nodes.nth(1);

        const boxA = await nodeA.boundingBox();
        const boxB = await nodeB.boundingBox();
        if (!boxA || !boxB) throw new Error('Could not get node bounding boxes');

        console.log(`Node A box: ${JSON.stringify(boxA)}`);
        console.log(`Node B box: ${JSON.stringify(boxB)}`);

        // 5. Drag from right handle of Node A to left handle of Node B
        //    NodeCard.tsx has handles on all 4 sides:
        //    Right (Source): Position.Right => center of right edge
        //    Left (Target): Position.Left  => center of left edge
        const startX = boxA.x + boxA.width;  // Right edge of Node A
        const startY = boxA.y + boxA.height / 2;
        const endX = boxB.x;                  // Left edge of Node B
        const endY = boxB.y + boxB.height / 2;

        console.log(`Dragging from (${startX}, ${startY}) to (${endX}, ${endY})`);

        // Hover Node A first to ensure handles are visible
        await nodeA.hover();
        await page.waitForTimeout(500);

        // Perform connection drag
        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.waitForTimeout(300);

        // Move in small steps to simulate real drag
        await page.mouse.move(endX, endY, { steps: 25 });
        await page.waitForTimeout(300);
        await page.mouse.up();

        // 6. Wait for connection to be created
        await page.waitForTimeout(2000);

        const newEdgeCount = await page.locator('.react-flow__edge').count();
        console.log(`Edge count after connection attempt: ${newEdgeCount}`);

        // Verify new edge was created
        if (newEdgeCount > initialEdges) {
            console.log('✅ Connection created successfully!');
        } else {
            console.log('⚠️  No new edge detected. Taking screenshot for inspection.');
            await page.screenshot({ path: 'test-results/connection-attempt.png', fullPage: true });
        }

        expect(newEdgeCount).toBeGreaterThan(initialEdges);

        // 7. Test deletion: Select Node A and delete
        await page.mouse.click(boxA.x + boxA.width / 2, boxA.y + boxA.height / 2);
        await page.waitForTimeout(500);
        await page.keyboard.press('Delete');
        await page.waitForTimeout(2000);

        // Verify edge was removed along with the node
        const finalEdges = await page.locator('.react-flow__edge').count();
        console.log(`Edge count after deletion: ${finalEdges}`);
        expect(finalEdges).toBe(initialEdges);
    });

    test('should show seeded nodes on the canvas', async ({ page }) => {
        // Simpler smoke test: just verify the seeded nodes appear
        const canvas = page.locator('.react-flow');
        await expect(canvas).toBeVisible({ timeout: 30000 });
        await page.waitForTimeout(3000);

        const nodes = page.locator('.react-flow__node');
        const count = await nodes.count();
        console.log(`Smoke test: Found ${count} nodes`);

        // Take screenshot regardless for visual verification
        await page.screenshot({ path: 'test-results/seeded-nodes.png', fullPage: true });

        expect(count).toBeGreaterThanOrEqual(2);
    });
});
