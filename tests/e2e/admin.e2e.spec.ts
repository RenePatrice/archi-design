import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

test.describe('Back-office', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()

    const context = await browser.newContext({ locale: 'fr-FR' })
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('ouvre le tableau de bord en français', async () => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin$/)
    await expect(page.locator('span[title="Tableau de bord"]').first()).toBeVisible()
  })

  test('affiche la liste des utilisateurs', async () => {
    await page.goto('/admin/collections/users')
    await expect(page.locator('h1', { hasText: 'Utilisateurs' }).first()).toBeVisible()
  })

  test('ouvre le formulaire de création', async () => {
    await page.goto('/admin/collections/users/create')
    await expect(page).toHaveURL(/\/admin\/collections\/users\/[a-zA-Z0-9-_]+/)
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })
})
