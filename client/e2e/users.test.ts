import { test, expect } from '@playwright/test'
import { asUser } from 'utils/api'
import { fakeUser } from 'utils/fakeData'

const user = fakeUser()

test.describe.serial('signup and login sequence', () => {
  const URL_LOGGED_IN = '/dashboard/create-project'

  test('visitor can signup', async ({ page }) => {
    await page.goto('/signup')
    const successMessage = page.getByTestId('successMessage')
    await expect(successMessage).toBeHidden()

    const form = page.getByRole('form', { name: 'Signup' })
    await form.locator('input[data-testid="firstName"]').fill(user.firstName)
    await form.locator('input[data-testid="lastName"]').fill(user.lastName)
    await form.locator('input[type="email"]').fill(user.email)
    await form.locator('input[id="username"]').fill(user.username)
    await form.locator('input[type="password"]').fill(user.password)
    await form.locator('button[type="submit"]').click()

    await expect(successMessage).toBeVisible()
  })

  test('visitor can not access dashboard before login', async ({ page }) => {
    await page.goto(URL_LOGGED_IN)
    await page.waitForURL('/login')
  })

  test('visitor can login', async ({ page }) => {
    await page.goto('/login')
    const form = page.getByRole('form', { name: 'Login' })
    await expect(form).toBeVisible()
    await form.locator('input[id="username"]').fill(user.username)
    await form.locator('input[type="password"]').fill(user.password)
    await form.locator('button[type="submit"]').click()

    await expect(page).toHaveURL(URL_LOGGED_IN)

    await page.reload()
    await expect(page).toHaveURL(URL_LOGGED_IN)
  })
})

test('visitor can logout', async ({ page }) => {
  const user = fakeUser()

  await asUser(page, user, async () => {
    await page.goto('/dashboard/create-project')
    const logoutLink = page.getByRole('link', { name: 'Logout' })

    await expect(logoutLink).toBeVisible()

    await Promise.all([page.waitForURL('/login'), logoutLink.click()])

    await expect(logoutLink).toBeHidden()
    await expect(page).toHaveURL('/login')

    await page.goto('/dashboard/create-project')
    await expect(page).toHaveURL('/login')
  })
})
