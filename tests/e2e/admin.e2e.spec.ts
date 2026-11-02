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

  test('ouvre un projet suivi de l’espace client avec ses onglets', async () => {
    await page.goto('/admin/collections/client-projects')
    await page.getByRole('link', { name: 'Villa R+1 à Kipé' }).first().click()
    // Les onglets du back-office Payload sont des boutons
    await expect(page.getByRole('button', { name: 'Documents', exact: true })).toBeVisible({ timeout: 30_000 })
    await expect(page.getByRole('button', { name: 'Actualités', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Messages', exact: true }).click()
    await expect(page.getByText('pouvez-vous me confirmer la teinte').first()).toBeVisible()
  })
})
