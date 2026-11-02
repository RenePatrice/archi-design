import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

import { test, expect, type Page } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config.js'

/*
 * Parcours de la phase 3 : boutique, impression, formations, devis.
 * Sans SMTP configuré, les e-mails sont écrits dans .emails/ : on vérifie leur contenu.
 * Les commandes créées par les tests sont supprimées à la fin.
 */

const marker = `E2E-${Date.now()}`
const created: string[] = []

async function fillCustomer(page: Page, extra: { email?: string } = {}) {
  await page.getByLabel('Nom complet').fill(`Client ${marker}`)
  await page.getByLabel(/^Téléphone/).fill('+224 620 11 22 33')
  if (extra.email) await page.getByLabel(/^E-mail/).fill(extra.email)
  await page.getByLabel('Ville').fill('Conakry')
  await page.getByRole('checkbox', { name: /J’accepte/ }).check()
}

/** Attend la confirmation et renvoie le numéro AD-AAAA-NNNN affiché. */
async function submitAndGetNumber(page: Page) {
  await page.getByRole('button', { name: 'Envoyer ma demande' }).click()
  const number = page.getByTestId('numero-demande')
  await expect(number).toHaveText(/^AD-\d{4}-\d{4,}$/, { timeout: 30_000 })
  const value = (await number.textContent())!
  created.push(value)
  await expect(page.getByRole('heading', { name: 'Demande bien reçue' })).toBeVisible()
  return value
}

/** Attend que les e-mails soient envoyés (ils partent après la réponse) et renvoie la commande. */
async function waitForOrder(number: string) {
  const payload = await getPayload({ config })
  await expect
    .poll(
      async () => (await payload.find({ collection: 'orders', where: { number: { equals: number } }, depth: 1 })).docs[0]?.companyEmailStatus,
      { timeout: 30_000 },
    )
    .toBe('envoye')
  return (await payload.find({ collection: 'orders', where: { number: { equals: number } }, depth: 1 })).docs[0]
}

async function emailFor(number: string, subjectPart: string) {
  const dir = path.resolve('.emails')
  const files = (await readdir(dir)).filter((f) => f.includes(number.replace(/-/g, '-')) || true)
  for (const file of files.reverse()) {
    const html = await readFile(path.join(dir, file), 'utf8')
    if (html.includes(number) && html.split('\n')[0].includes(subjectPart)) return html
  }
  return null
}

test.afterAll(async () => {
  const payload = await getPayload({ config })
  if (created.length) await payload.delete({ collection: 'orders', where: { number: { in: created } } })
})

test.describe('Boutique', () => {
  test('du produit au panier, puis commande enregistrée avec les prix de la base', async ({ page }) => {
    await page.goto('/boutique/peinture-acrylique-ocre-laterite-20l')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Augmenter la quantité' }).click()
    await page.getByRole('button', { name: 'Ajouter au panier' }).click()
    await expect(page.getByRole('button', { name: 'Ajouté au panier' })).toBeVisible()
    await expect(page.getByRole('link', { name: /Panier, 2 articles/ })).toBeVisible()

    await page.goto('/boutique/panier')
    await expect(page.getByTestId('total-panier')).toHaveText(/1\s840\s000 GNF/)

    await fillCustomer(page, { email: 'client-test@example.com' })
    await page.getByLabel('Mode de réception souhaité').selectOption('livraison')
    const number = await submitAndGetNumber(page)

    // Le panier est vidé après la commande
    await expect(page.getByRole('link', { name: 'Panier vide' })).toBeVisible()

    const order = await waitForOrder(number)
    expect(order.service).toBe('boutique')
    expect(order.lines?.[0]).toMatchObject({ reference: 'PEI-ACR-OCR-20', quantity: 2, unitPrice: 920_000, subtotal: 1_840_000 })
    expect(order.estimatedTotal).toBe(1_840_000)
    expect(order.customerEmailStatus).toBe('envoye')

    const companyEmail = await emailFor(number, `Commande n° ${number}`)
    expect(companyEmail).toContain('Répondre sur WhatsApp')
    expect(companyEmail).toContain('PEI-ACR-OCR-20')
    const ackEmail = await emailFor(number, `Votre commande ${number}`)
    expect(ackEmail).toContain('Aucun paiement n’est demandé en ligne')
  })

  test('un prix modifié dans le navigateur est ignoré par le serveur', async ({ page }) => {
    await page.goto('/boutique')
    await page.evaluate(() =>
      localStorage.setItem(
        'archi-design:panier',
        JSON.stringify([{ id: 0, slug: 'faux', name: 'Produit inventé', reference: 'X', price: 1, unit: 'pièce', quantity: 1 }]),
      ),
    )
    await page.goto('/boutique/panier')
    await fillCustomer(page)
    await page.getByRole('button', { name: 'Envoyer ma demande' }).click()
    await expect(page.getByText('Votre panier est vide ou contient un produit indisponible.')).toBeVisible()
  })
})

test.describe('Impression en ligne', () => {
  test('calcule le prix en direct et enregistre le fichier joint', async ({ page }) => {
    await page.goto('/impression')
    await page.waitForLoadState('networkidle')
    await page.getByLabel(/^Support/).selectOption('bache')
    await page.getByLabel(/^Quantité/).fill('2')
    await expect(page.getByText('Indiquez la largeur et la hauteur pour calculer le prix.')).toBeVisible()
    await page.getByLabel('Largeur (cm)').fill('300')
    await page.getByLabel('Hauteur (cm)').fill('100')
    await expect(page.getByTestId('prix-indicatif')).toHaveText(/900\s000 GNF/)

    // Image PNG valide de 1 × 1 pixel (Payload vérifie le contenu réel des fichiers)
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
    await page.getByLabel(/^Fichiers joints/).setInputFiles({ name: 'bache-ouverture.png', mimeType: 'image/png', buffer: png })
    await page.getByLabel(/bon à tirer/).check()
    await fillCustomer(page)
    const number = await submitAndGetNumber(page)

    const order = await waitForOrder(number)
    expect(order.service).toBe('serigraphie')
    expect(order.estimatedTotal).toBe(900_000)
    expect(order.files).toHaveLength(1)
    expect(order.customerEmailStatus).toBe('sansEmail')
    expect(order.details?.map((d) => d.label)).toEqual(expect.arrayContaining(['Support', 'Quantité', 'Prix indicatif']))

    const companyEmail = await emailFor(number, `Commande d’impression – bâche`)
    expect(companyEmail).toContain('bache-ouverture')
  })
})

test.describe('Formations', () => {
  test('inscription à une session depuis le calendrier', async ({ page }) => {
    await page.goto('/formations')
    await page.getByRole('link', { name: 'S’inscrire' }).first().click()
    // En développement, la page de destination peut mettre du temps à compiler
    await page.waitForURL(/\/formations\/.+\?session=\d+#inscription/, { timeout: 60_000 })
    await page.waitForLoadState('networkidle')
    await expect(page.getByLabel('Session')).not.toHaveValue('')

    await page.getByLabel('Votre niveau').selectOption('debutant')
    await page.getByLabel('Modalité de règlement').selectOption('echelonne')
    await fillCustomer(page)
    const number = await submitAndGetNumber(page)

    const order = await waitForOrder(number)
    expect(order.service).toBe('formation')
    expect(order.session).toBeTruthy()
  })
})

test.describe('Devis', () => {
  test('signale les champs obligatoires du service', async ({ page }) => {
    await page.goto('/devis/architecture')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Envoyer ma demande' }).click()
    await expect(page.getByText('Certains champs sont à corriger.')).toBeVisible()
    await expect(page.getByText('Choisissez une option dans la liste.')).toBeVisible()
  })

  test('une demande de projet produit l’e-mail avec le type dans l’objet', async ({ page }) => {
    await page.goto('/devis/architecture')
    await page.waitForLoadState('networkidle')
    await page.getByLabel('Type de projet').selectOption('villa')
    await page.getByLabel('Localisation du projet').fill('Kipé, Conakry')
    await page.getByLabel('Surface approximative (m²)').fill('240')
    await page.getByRole('checkbox', { name: 'Maquette 3D' }).check()
    await page.getByRole('checkbox', { name: 'Suivi de chantier' }).check()
    await fillCustomer(page)
    const number = await submitAndGetNumber(page)

    await waitForOrder(number)
    const companyEmail = await emailFor(number, 'Demande de projet – villa / maison')
    expect(companyEmail).toContain('Maquette 3D, Suivi de chantier')
    expect(companyEmail).toContain('240 m²')
  })
})
