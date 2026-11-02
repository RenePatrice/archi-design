import { test, expect } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config.js'

/*
 * Parcours de la vitrine (phase 2). Nécessite la base remplie par « npm run seed ».
 */

test.describe('Vitrine', () => {
  test('l’accueil présente les pôles, la chaîne de valeur et les projets phares', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Un interlocuteur pour tout votre projet' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Projets phares' })).toBeVisible()

    // Chaîne de valeur : choisir « Peinture » affiche son pack intégré
    const tabs = page.getByRole('tablist', { name: 'Étapes de la chaîne de valeur' })
    await tabs.getByRole('tab', { name: /Peinture/ }).click()
    await expect(page.getByRole('tabpanel')).toContainText('Les teintes choisies avec l’architecte')

    // Navigation clavier entre les étapes
    await page.keyboard.press('ArrowRight')
    await expect(tabs.getByRole('tab', { name: /Signalétique/ })).toHaveAttribute('aria-selected', 'true')
  })

  test('une page de pôle liste ses prestations et ses réalisations', async ({ page }) => {
    await page.goto('/services/peinture')
    await expect(page.getByRole('heading', { level: 1, name: 'Peinture' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Nos prestations' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Réalisations de ce pôle' })).toBeVisible()
  })

  test('le portfolio se filtre sans rechargement et garde le filtre dans l’adresse', async ({ page }) => {
    await page.goto('/realisations')
    await expect(page.getByText('12 projets')).toBeVisible()
    // Attend que la partie interactive soit chargée avant de manipuler les filtres
    await page.waitForLoadState('networkidle')

    await page.getByLabel('Ville').selectOption('Kindia')
    await expect(page).toHaveURL(/ville=Kindia/)
    await expect(page.getByText('1 projet', { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Rénovation de façade d’un hôtel' })).toBeVisible()

    await page.getByRole('button', { name: 'Effacer les filtres' }).click()
    await expect(page.getByText('12 projets')).toBeVisible()
  })

  test('la fiche projet affiche la fiche technique, l’avant/après et la galerie', async ({ page }) => {
    await page.goto('/realisations/renovation-facade-hotel-kindia')
    await expect(page.getByRole('heading', { name: 'Fiche technique' })).toBeVisible()
    await expect(page.getByText('2 100 m²')).toBeVisible()

    const slider = page.getByRole('slider', { name: 'Comparer avant et après' })
    await slider.fill('20')
    await expect(slider).toHaveValue('20')

    await page.getByRole('button', { name: 'Agrandir l’image 1' }).click()
    await expect(page.getByText('Image 1 sur 3')).toBeVisible()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByText('Image 2 sur 3')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('les pages existent en anglais', async ({ page }) => {
    await page.goto('/en/services/peinture')
    await expect(page.getByRole('heading', { level: 1, name: 'Painting' })).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })
})

test.describe('Formulaire de contact', () => {
  const marker = `Test E2E ${Date.now()}`

  test.afterAll(async () => {
    const payload = await getPayload({ config })
    await payload.delete({ collection: 'contact-messages', where: { subject: { equals: marker } } })
  })

  test('signale les champs manquants', async ({ page }) => {
    await page.goto('/contact')
    await page.getByRole('button', { name: 'Envoyer le message' }).click()
    await expect(page.getByText('Indiquez votre nom (2 caractères minimum).')).toBeVisible()
    await expect(page.getByText('Votre accord est nécessaire pour traiter la demande.')).toBeVisible()
  })

  test('enregistre un message et propose l’envoi sur WhatsApp', async ({ page }) => {
    await page.goto('/contact?pole=peinture')
    await page.waitForLoadState('networkidle')
    await expect(page.getByLabel('Votre demande concerne')).toHaveValue('peinture')

    await page.getByLabel('Nom complet').fill('Aïssatou Camara')
    await page.getByLabel(/Téléphone/).fill('+224 620 00 00 00')
    await page.getByLabel('Objet').fill(marker)
    await page.getByRole('textbox', { name: /^Message/ }).fill('Peinture extérieure d’une villa de 200 m² à Kipé.')
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Envoyer le message' }).click()

    await expect(page.getByText('Message reçu.')).toBeVisible()

    const payload = await getPayload({ config })
    const { docs } = await payload.find({ collection: 'contact-messages', where: { subject: { equals: marker } }, depth: 1 })
    expect(docs).toHaveLength(1)
    expect(docs[0].name).toBe('Aïssatou Camara')
    expect(typeof docs[0].pole === 'object' && docs[0].pole?.key).toBe('peinture')
  })
})
