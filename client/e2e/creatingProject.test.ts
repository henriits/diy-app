import { test, expect } from '@playwright/test'

test('Visitor can navigate between login and signup pages', async ({ page }) => {
  await page.goto('/login')
  await expect(page).toHaveURL('/login')
  await page.goto('/signup')
  await expect(page).toHaveURL('/signup')
})
