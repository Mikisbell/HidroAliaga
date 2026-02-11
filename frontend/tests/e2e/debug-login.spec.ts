import { test, expect } from '@playwright/test';

test('Debug: Login flow step by step', async ({ page }) => {
    // Step 1: Navigate to login
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/debug-screenshots/01-login-page.png' });

    console.log('Step 1 - Login page loaded. URL:', page.url());

    // Step 2: Check what's visible
    const emailInput = page.getByPlaceholder('admin@hidroaliaga.com');
    const isEmailVisible = await emailInput.isVisible();
    console.log('Step 2 - Email input visible:', isEmailVisible);

    if (!isEmailVisible) {
        // Try to find ALL inputs
        const inputs = page.locator('input');
        const count = await inputs.count();
        console.log('Number of inputs found:', count);
        for (let i = 0; i < count; i++) {
            const type = await inputs.nth(i).getAttribute('type');
            const placeholder = await inputs.nth(i).getAttribute('placeholder');
            console.log(`  Input ${i}: type=${type}, placeholder=${placeholder}`);
        }
        await page.screenshot({ path: 'tests/debug-screenshots/02-no-email-input.png' });
        return;
    }

    // Step 3: Fill email
    await emailInput.fill('admin@hidroaliaga.com');
    console.log('Step 3 - Email filled');

    // Step 4: Fill password
    const passwordInput = page.getByPlaceholder('••••••••');
    const isPasswordVisible = await passwordInput.isVisible();
    console.log('Step 4 - Password input visible:', isPasswordVisible);

    if (isPasswordVisible) {
        await passwordInput.fill('admin123');
        console.log('Step 4 - Password filled');
    }

    await page.screenshot({ path: 'tests/debug-screenshots/03-filled-form.png' });

    // Step 5: Click submit
    const submitBtn = page.locator('button[type="submit"]');
    console.log('Step 5 - Submit button visible:', await submitBtn.isVisible());
    await submitBtn.click();

    // Step 6: Wait and observe
    await page.waitForTimeout(5000);
    console.log('Step 6 - After submit. URL:', page.url());
    await page.screenshot({ path: 'tests/debug-screenshots/04-after-submit.png' });

    // Step 7: Check final state
    const isOnDashboard = page.url().includes('/dashboard');
    const isOnLogin = page.url().includes('/login');
    console.log('Step 7 - On dashboard:', isOnDashboard, ', Still on login:', isOnLogin);

    if (isOnLogin) {
        // Check for error messages
        const bodyText = await page.locator('body').innerText();
        if (bodyText.includes('inválidas') || bodyText.includes('Invalid')) {
            console.log('ERROR: Invalid credentials message found!');
        }
    }
});
