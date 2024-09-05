import { test, expect } from '@playwright/test'
import { fakeUser, fakeProject } from 'utils/fakeData'

const user = fakeUser() // Generate fake user
const project = fakeProject() // Generate fake project

test('Visitor can navigate between login and signup pages', async ({ page }) => {
  await page.goto('/login')
  await expect(page).toHaveURL('/login')
  await page.goto('/signup')
  await expect(page).toHaveURL('/signup')
})

test('creating the project with new user', async ({ page }) => {
  // Navigate to the signup page
  await page.goto('/signup')

  // Fill out the signup form using fake user data
  const signupForm = page.getByRole('form', { name: 'Signup' })
  await signupForm.locator('input[data-testid="firstName"]').fill(user.firstName)
  await signupForm.locator('input[data-testid="lastName"]').fill(user.lastName)
  await signupForm.locator('input[type="email"]').fill(user.email)
  await signupForm.locator('input[id="username"]').fill(user.username)
  await signupForm.locator('input[type="password"]').fill(user.password)
  await signupForm.locator('button[type="submit"]').click()

  // Wait for signup to complete and redirect (optional based on app behavior)
  await page.waitForLoadState('networkidle')

  // Log in with the same user credentials
  await page.goto('http://localhost:5173/login')
  await page.locator('input[type="text"]').fill(user.username)
  await page.locator('input[name="password"]').fill(user.password)
  await page.getByRole('button', { name: 'Log in' }).click()

  await page.waitForLoadState('networkidle')

  await page.getByRole('textbox', { name: 'Project title' }).fill(project.title)
  await page.getByPlaceholder('Describe your Project here...').fill(project.description)
  await page.getByPlaceholder('Write instructions for').fill(project.instruction)
  await page.getByPlaceholder('Materials required for project').fill(project.materials)
  await page.getByRole('button', { name: 'Post Project' }).click()

  await page.waitForLoadState('networkidle')

  await expect(page.getByText(`Author: ${user.username}`)).toBeVisible()
  await expect(page.getByText(`Description: ${project.description}`)).toBeVisible()
  await expect(page.getByText(`Instructions: ${project.instruction}`)).toBeVisible()

  await expect(page.getByText('No ratings yet.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Edit Project' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Delete Project' })).toBeVisible()

  await page.getByText('Delete Project').click()
  await page.getByText('Yes, Delete').click()
})
