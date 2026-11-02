import { readdir } from 'node:fs/promises'
import path from 'node:path'

import { test, expect } from '@playwright/test'
import { getPayload } from 'payload'
import sharp from 'sharp'

import config from '../../src/payload.config.js'

/*
 * Fonctions de la phase 4 : simulateur + PDF, configurateur de couleurs, maquette 3D, carte, impact.
 */

const created: string[] = []

test.afterAll(async () => {
  const payload = await getPayload({ config })
  if (created.length) await payload.delete({ collection: 'orders', where: { number: { in: created } } })
})

test.describe('Simulateur de devis', () => {
  test('met à jour la fourchette et fournit un PDF', async ({ page, request }) => {
    await page.goto('/simulateur')
    await page.waitForLoadState('networkidle')
    const budget = page.getByTestId('sim-budget')
    await expect(budget).toBeVisible()
    const before = await budget.textContent()

    await page.getByLabel('Surface (m²)').fill('400')
    await page.getByText('Haut de gamme', { exact: true }).click()
    await expect(budget).not.toHaveText(before!)
    await expect(page.getByTestId('sim-duree')).toHaveText(/\d+ à \d+ mois/)

    // Le lien de téléchargement renvoie un vrai PDF
    const href = await page.getByRole('link', { name: 'Télécharger le pré-devis PDF' }).getAttribute('href')
    expect(href).toContain('surface=400')
    const pdf = await request.get(href!)
    expect(pdf.headers()['content-type']).toBe('application/pdf')
    expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-')
  })

  test('envoie le pré-devis à l’équipe avec le PDF en pièce jointe', async ({ page }) => {
    await page.goto('/simulateur')
    await page.waitForLoadState('networkidle')
    await page.getByText('Bureaux', { exact: true }).click()
    await page.getByLabel('Surface (m²)').fill('600')

    await page.getByLabel('Nom complet').fill('Test Simulateur')
    await page.getByLabel(/^Téléphone/).fill('+224 621 00 00 00')
    await page.getByLabel(/^E-mail/).fill('simulateur@example.com')
    await page.getByLabel('Ville').fill('Conakry')
    await page.getByRole('checkbox', { name: /J’accepte/ }).check()
    await page.getByRole('button', { name: 'Envoyer ma demande' }).click()

    const number = page.getByTestId('numero-demande')
    await expect(number).toHaveText(/^AD-\d{4}-\d{4,}$/, { timeout: 30_000 })
    const value = (await number.textContent())!
    created.push(value)

    const payload = await getPayload({ config })
    await expect
      .poll(async () => (await payload.find({ collection: 'orders', where: { number: { equals: value } } })).docs[0]?.companyEmailStatus, {
        timeout: 30_000,
      })
      .toBe('envoye')
    const order = (await payload.find({ collection: 'orders', where: { number: { equals: value } } })).docs[0]
    expect(order.service).toBe('simulateur')
    expect(order.details?.find((d) => d.label === 'Surface')?.value).toBe('600 m²')
    expect(order.details?.some((d) => d.label === 'Budget estimé')).toBe(true)

    // Sans SMTP, le PDF joint est enregistré à côté de l'e-mail dans .emails/
    const files = await readdir(path.resolve('.emails'))
    expect(files.some((f) => f.endsWith(`pre-devis-${value}.pdf`))).toBe(true)
  })
})

test.describe('Configurateur de couleurs', () => {
  test('peint le mur de la pièce type avec la teinte choisie', async ({ page }) => {
    await page.goto('/configurateur')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Peinture intérieure mate, indigo leppi' }).click()
    await expect(page.locator('svg[role=img] polygon[fill="#24305E"]').first()).toBeVisible()
    await expect(page.getByText('#24305E · PEI-INT-IND-15')).toBeVisible()
  })

  test('repeint la zone touchée sur une photo, sans l’envoyer', async ({ page }) => {
    await page.goto('/configurateur')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Ma photo' }).click()

    // Photo de test : mur clair à gauche, fenêtre sombre à droite
    const photo = await sharp({ create: { width: 200, height: 100, channels: 3, background: '#E6DCC8' } })
      .composite([{ input: { create: { width: 100, height: 100, channels: 3, background: '#28407A' } }, left: 100, top: 0 }])
      .png()
      .toBuffer()
    const uploads: string[] = []
    page.on('request', (r) => r.method() === 'POST' && uploads.push(r.url()))
    await page.locator('input[type=file]').setInputFiles({ name: 'mur.png', mimeType: 'image/png', buffer: photo })
    await page.getByRole('button', { name: 'Peinture acrylique façade, ocre latérite' }).click()

    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    await canvas.click({ position: { x: 20, y: 20 } })
    const pixels = await canvas.evaluate((c: HTMLCanvasElement) => {
      const ctx = c.getContext('2d')!
      return { wall: Array.from(ctx.getImageData(10, 10, 1, 1).data), window: Array.from(ctx.getImageData(c.width - 10, 10, 1, 1).data) }
    })
    expect(pixels.wall[0]).toBeGreaterThan(pixels.wall[2] + 60) // le mur est devenu ocre (rouge > bleu)
    expect(pixels.window.slice(0, 3)).toEqual([40, 64, 122]) // la fenêtre n'a pas bougé
    expect(uploads).toEqual([]) // la photo n'a jamais quitté le navigateur
  })
})

test.describe('Maquette 3D', () => {
  test('ne se télécharge qu’à la demande puis s’affiche', async ({ page }) => {
    const glbRequests: string[] = []
    page.on('request', (r) => r.url().endsWith('.glb') && glbRequests.push(r.url()))
    await page.goto('/realisations/villa-bioclimatique-kipe')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Maquette 3D' })).toBeVisible()
    expect(glbRequests).toEqual([])

    await page.getByRole('button', { name: 'Afficher la maquette 3D' }).click()
    const viewer = page.locator('model-viewer')
    await expect(viewer).toBeAttached({ timeout: 30_000 })
    await expect.poll(() => glbRequests.length, { timeout: 30_000 }).toBeGreaterThan(0)
  })
})

test.describe('Carte et impact', () => {
  test('la carte liste les projets localisés et affiche leurs points', async ({ page }) => {
    await page.goto('/realisations/carte')
    await expect(page.getByText('12 projets localisés')).toBeVisible()
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Afficher la carte interactive' }).click()
    await expect(page.getByTestId('carte-maplibre')).toBeVisible({ timeout: 30_000 })
    await expect(page.locator('.maplibregl-marker')).toHaveCount(12, { timeout: 30_000 })
  })

  test('la page Impact affiche les indicateurs du back-office', async ({ page }) => {
    await page.goto('/impact')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ce que nos chantiers laissent derrière eux')
    await expect(page.getByText('jeunes formés')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Voir la carte' })).toBeVisible()
  })
})
