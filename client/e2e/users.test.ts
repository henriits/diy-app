import { test, expect } from '@playwright/test'
import { asUser } from 'utils/api'
import { fakeUser } from 'utils/fakeData'

const user = fakeUser()

test('Visitor can navigate between login and signup pages', async ({ page }) => {
  await page.goto('/login')
  await expect(page).toHaveURL('/login')
  await page.goto('/signup')
  await expect(page).toHaveURL('/signup')
})

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

  // await expect(successMessage).toBeVisible()
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

test('visitor can logout', async ({ page }) => {
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

test('visitor sees create project page', async ({ page }) => {
  await asUser(page, user, async () => {
    await page.goto('/dashboard/create-project')
    const form = page.getByRole('textbox', { name: 'Project title' })
    await expect(form).toBeVisible()
  })
})

test('visitor can create a project', async ({ page }) => {
  await asUser(page, user, async () => {
    await page.goto('/dashboard/create-project')
    await page.getByRole('textbox', { name: 'Project title' }).fill('new')
    await page.getByRole('button', { name: 'Post Project' }).click()
    const image = page.getByRole('button', { name: 'View Larger Image' })
    await expect(image).toBeVisible()
  })
})

test('visitor can view created project', async ({ page }) => {
  await asUser(page, user, async () => {
    await page.goto('/dashboard/my-projects')

    // Assuming there's a list of project titles, we select the one with title "new"
    await page.getByRole('link', { name: 'new' }).click()

    const image = page.getByRole('button', { name: 'View Larger Image' })
    await expect(image).toBeVisible()
  })
})

test('visitor can comment project', async ({ page }) => {
  await asUser(page, user, async () => {
    await page.goto('/dashboard/my-projects')
    await page.getByRole('link', { name: 'new' }).click()

    await page.locator('.comment-input').fill('comment')
    await page.getByRole('button', { name: 'Submit Comment' }).click()
    // Capture the comment using class selector
    const comment = await page.locator('.comment-content')

    // Check that the comment is visible on the page
    await expect(comment).toBeVisible()

    // Optionally, validate the comment's content
    await expect(comment).toHaveText('comment')
  })
})
