import { test, expect } from '@playwright/test'

test.describe('Site public', () => {
  test('affiche l’accueil en français par défaut', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/ARCHI-DESIGN Guinée/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    await expect(page.locator('h1').first()).toHaveText('De la conception à l’identité visuelle de vos espaces')
  })

  test('bascule en anglais en gardant la page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'English' }).first().click()

    await expect(page).toHaveURL(/\/en$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('affiche la page 404 traduite', async ({ page }) => {
    const response = await page.goto('/page-qui-n-existe-pas')

    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible()
  })

  test('sert le manifeste PWA', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest')
    expect(response.ok()).toBe(true)
    expect((await response.json()).short_name).toBe('ARCHI-DESIGN')
  })
})
