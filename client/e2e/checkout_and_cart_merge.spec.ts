import { test, expect } from '@playwright/test';

test.describe('Stitchx Plus — End-to-End User Purchase & Cart Merge Flows', () => {
  test('Complete Guest Purchase Flow: Browse -> Customize -> Cart -> Register -> Checkout -> Order Confirmation', async ({ page }) => {
    // 1. Guest Browse Home Page
    await page.goto('/');
    await expect(page.locator('h1')).toContainText(/Stitchx Plus|Crafted/i);

    // 2. Navigate to Collections Page
    await page.click('text=Collections');
    await expect(page).toHaveURL(/\/collections/);
    await expect(page.locator('h1')).toContainText('Curated Bespoke Collections');

    // 3. Select Garment to Customize
    await page.goto('/customize');
    await expect(page.locator('h1')).toContainText('3D Suit Customization Studio');

    // 4. Progress through Customization Wizard (Fabric -> Style -> Review)
    const nextBtn = page.locator('button:has-text("Next Step")');
    if (await nextBtn.isVisible()) {
      await nextBtn.click(); // Advance from fabric to lapels
      await page.waitForTimeout(300);
      await nextBtn.click(); // Advance to lining
    }

    // 5. Add Customization to Shopping Cart
    await page.click('button:has-text("Add Custom Suit to Bag")');
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.locator('h1')).toContainText('Your Bespoke Shopping Bag');

    // 6. Proceed to Checkout
    await page.click('text=Proceed to Checkout');
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.locator('h1')).toContainText('Bespoke Checkout');

    // 7. Complete Shipping Form
    await page.fill('input[name="firstName"]', 'Lord');
    await page.fill('input[name="lastName"]', 'Savile');
    await page.fill('input[name="email"]', 'savile@stitchx.com');
    await page.fill('input[name="phone"]', '+1 212-555-0199');
    await page.fill('input[name="street"]', '14 Savile Row');
    await page.fill('input[name="city"]', 'New York');
    await page.fill('input[name="state"]', 'NY');
    await page.fill('input[name="zipCode"]', '10001');

    await page.click('button:has-text("Continue to Shipping Method")');

    // 8. Select Delivery Method & Proceed to Payment
    await page.click('button:has-text("Proceed to Order Review & Payment")');
    await expect(page.locator('text=Order Review & Payment')).toBeVisible();

    // 9. Submit Order Payment
    await page.click('button:has-text("Pay & Complete Bespoke Order")');
    await page.waitForURL(/\/order-confirmation\//);
    await expect(page.locator('h1')).toContainText('Order Confirmed');
  });

  test('Guest Cart to Authenticated User Cart Merge Flow', async ({ page }) => {
    // 1. Add item to guest cart
    await page.goto('/collections');
    await page.click('button:has-text("Add")'); // Add first item to guest cart

    // 2. Verify item is in guest cart
    await page.goto('/cart');
    await expect(page.locator('text=Subtotal')).toBeVisible();

    // 3. Navigate to Login Page
    await page.goto('/login');
    await page.fill('input[type="email"]', 'patron@stitchx.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button:has-text("Sign In to Account")');

    // 4. Verify post-login redirection and merged cart state
    await page.goto('/cart');
    await expect(page.locator('h1')).toContainText('Your Bespoke Shopping Bag');
  });
});
