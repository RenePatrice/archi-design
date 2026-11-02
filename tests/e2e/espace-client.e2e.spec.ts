import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

import { test, expect, type Page } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config.js'

/*
 * Espace client (phase 5). Utilise le client de démonstration créé par « npm run seed »
 * (SEED_CLIENT_EMAIL / SEED_CLIENT_PASSWORD dans .env).
 */

const email = process.env.SEED_CLIENT_EMAIL!
const password = process.env.SEED_CLIENT_PASSWORD!
const other = { email: `autre-client-${Date.now()}@example.com`, password: 'Autre-client-2026!' }
let projectId = 0

async function loginAs(page: Page, creds: { email: string; password: string }, expectSuccess = true) {
  await page.goto('/espace-client')
  await page.waitForLoadState('networkidle')
  await page.getByLabel('E-mail').fill(creds.email)
  await page.getByLabel('Mot de passe').fill(creds.password)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  if (expectSuccess) await expect(page.getByRole('heading', { name: /^Bonjour/ })).toBeVisible({ timeout: 30_000 })
}

/**
 * Téléchargement fait par le navigateur lui-même : il envoie l'en-tête Sec-Fetch-Site,
 * exigé par la protection CSRF de Payload pour accepter le cookie de session.
 */
const browserStatus = (page: Page, url: string) => page.evaluate(async (u) => (await fetch(u)).status, url)

test.beforeAll(async () => {
  expect(email && password, 'SEED_CLIENT_EMAIL et SEED_CLIENT_PASSWORD doivent être dans .env').toBeTruthy()
  const payload = await getPayload({ config })
  const client = (await payload.find({ collection: 'users', where: { email: { equals: email } } })).docs[0]
  projectId = (await payload.find({ collection: 'client-projects', where: { clients: { equals: client.id } } })).docs[0].id
  await payload.create({ collection: 'users', data: { ...other, name: 'Autre client', role: 'client' } })
})

test.afterAll(async () => {
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'users', where: { email: { equals: other.email } } })
  await payload.delete({ collection: 'project-messages', where: { body: { like: 'Test E2E espace client' } } })
})

test.describe('Accès protégé', () => {
  test('un visiteur non connecté voit la connexion et rien d’autre', async ({ page, request }) => {
    await page.goto(`/espace-client/projets/${projectId}`)
    await expect(page).toHaveURL(/\/espace-client$/)
    await expect(page.getByRole('heading', { name: 'Suivez votre projet en ligne' })).toBeVisible()

    // L'API ne renvoie rien et les fichiers privés sont refusés
    const projects = await (await request.get('/api/client-projects')).json()
    expect(projects.docs ?? []).toHaveLength(0)
    expect((await request.get('/api/client-files/file/plan-rdc-demo.pdf')).status()).toBe(403)
  })

  test('un mauvais mot de passe est refusé sans détail', async ({ page }) => {
    await loginAs(page, { email, password: 'mauvais-mot-de-passe' }, false)
    await expect(page.getByText('E-mail ou mot de passe incorrect.')).toBeVisible()
  })

  test('un autre client ne voit pas ce projet', async ({ page }) => {
    await loginAs(page, other)
    await expect(page.getByText('Aucun projet n’est encore rattaché à votre compte.')).toBeVisible()
    const response = await page.goto(`/espace-client/projets/${projectId}`)
    expect(response?.status()).toBe(404)
    expect(await browserStatus(page, '/api/client-files/file/plan-rdc-demo.pdf')).toBe(403)
  })
})

test.describe('Client connecté', () => {
  test('voit son projet, ses étapes, ses actualités et ses documents', async ({ page }) => {
    await loginAs(page, { email, password })
    await expect(page.getByRole('heading', { name: /Bonjour Mariama Diallo/ })).toBeVisible()
    await page.getByRole('link', { name: 'Villa R+1 à Kipé' }).click()
    await page.waitForURL(/\/espace-client\/projets\/\d+/)

    await expect(page.getByRole('progressbar', { name: 'Avancement' })).toHaveAttribute('aria-valuenow', '62')
    await expect(page.getByText('Toiture et menuiseries')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Pose de la charpente' })).toBeVisible()

    // Documents visibles, document interne caché
    await expect(page.getByRole('link', { name: /Plan du rez-de-chaussée/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Facture d’acompte n° 2/ })).toBeVisible()
    await expect(page.getByText('Note interne de chantier')).toHaveCount(0)

    // Les fichiers se téléchargent avec la session du client, pas le document interne
    const plan = await page.evaluate(async () => {
      const res = await fetch('/api/client-files/file/plan-rdc-demo.pdf')
      return { status: res.status, type: res.headers.get('content-type') }
    })
    expect(plan).toEqual({ status: 200, type: expect.stringContaining('application/pdf') })
    expect(await browserStatus(page, '/api/client-files/file/note-interne-demo.pdf')).toBe(403)

    // Les photos de chantier s'affichent
    const firstPhoto = page.locator('#actualites ~ ol img, section[aria-labelledby=actualites] img').first()
    await expect(firstPhoto).toBeVisible()
    expect(await firstPhoto.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
  })

  test('envoie un message à l’équipe, qui reçoit un e-mail', async ({ page }) => {
    await loginAs(page, { email, password })
    await page.goto(`/espace-client/projets/${projectId}`)
    await page.waitForLoadState('networkidle')
    const body = `Test E2E espace client ${Date.now()}`
    await page.getByLabel('Votre message').fill(body)
    await page.getByRole('button', { name: 'Envoyer' }).click()
    await expect(page.getByText('Message envoyé.')).toBeVisible()
    await expect(page.getByText(body)).toBeVisible()

    const payload = await getPayload({ config })
    const message = (await payload.find({ collection: 'project-messages', where: { body: { equals: body } } })).docs[0]
    expect(message.fromStaff).toBe(false)

    // Sans SMTP, l'e-mail à l'équipe est écrit dans .emails/
    await expect
      .poll(async () => {
        const files = (await readdir(path.resolve('.emails'))).filter((f) => f.includes('Message_client'))
        for (const f of files) if ((await readFile(path.resolve('.emails', f), 'utf8')).includes(body)) return true
        return false
      }, { timeout: 20_000 })
      .toBe(true)
  })

  test('se déconnecte', async ({ page }) => {
    await loginAs(page, { email, password })
    await page.getByRole('button', { name: 'Se déconnecter' }).click()
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible()
  })
})

test.describe('Mot de passe oublié', () => {
  test('le lien reçu permet de choisir un nouveau mot de passe', async ({ page }) => {
    await page.goto('/espace-client/mot-de-passe')
    await page.waitForLoadState('networkidle')
    await page.getByLabel('E-mail').fill(other.email)
    await page.getByRole('button', { name: 'Recevoir le lien' }).click()
    await expect(page.getByText(/Si un compte existe avec cette adresse/)).toBeVisible()

    // Jeton récupéré directement (l'e-mail n'est pas envoyé sans SMTP)
    const payload = await getPayload({ config })
    const token = await payload.forgotPassword({ collection: 'users', data: { email: other.email }, disableEmail: true })
    await page.goto(`/espace-client/mot-de-passe?token=${token}`)
    await page.waitForLoadState('networkidle')
    await page.getByLabel(/^Nouveau mot de passe/).fill('Nouveau-mdp-2026')
    await page.getByLabel('Confirmer le mot de passe').fill('Nouveau-mdp-2026')
    await page.getByRole('button', { name: 'Enregistrer et me connecter' }).click()
    await expect(page.getByRole('heading', { name: /Bonjour Autre client/ })).toBeVisible()
  })
})
