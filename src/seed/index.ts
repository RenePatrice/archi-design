/**
 * Données initiales et de démonstration.
 * Usage : npm run seed
 *
 * Relançable sans risque : un élément déjà présent (même adresse/slug) n'est ni recréé
 * ni écrasé, pour ne jamais effacer ce que l'équipe a saisi dans le back-office.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { aboutSeed, figureSeeds, pageSeeds, partnerSeeds, poleSeeds, projectSeeds, teamSeeds, testimonialSeeds } from './data'
import { emailTemplateSeeds, printPricingSeed, productSeeds, trainingSeeds } from './data-phase3'
import { demoImage } from './images'
import { richText } from './lexical'

const payload = await getPayload({ config })
const log = (message: string) => payload.logger.info(message)

/* ───────────── 1. Compte administrateur ───────────── */
const email = process.env.SEED_ADMIN_EMAIL
const password = process.env.SEED_ADMIN_PASSWORD
if (!email || !password || password === 'CHANGE_ME') {
  payload.logger.error('Renseignez SEED_ADMIN_EMAIL et SEED_ADMIN_PASSWORD dans .env avant de lancer le seed.')
  process.exit(1)
}
const admins = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
if (admins.totalDocs === 0) {
  await payload.create({ collection: 'users', data: { email, password, name: 'Administrateur', role: 'admin' } })
  log(`Administrateur créé : ${email}`)
}

/* ───────────── Outils ───────────── */

/** Image de démonstration dans la médiathèque (réutilisée si elle existe déjà). */
async function media(seed: number, name: string, alt: { fr: string; en: string }) {
  const existing = await payload.find({ collection: 'media', where: { filename: { equals: `${name}.webp` } }, limit: 1 })
  if (existing.docs[0]) return existing.docs[0].id
  const doc = await payload.create({ collection: 'media', locale: 'fr', data: { alt: alt.fr }, file: await demoImage(seed, name) })
  await payload.update({ collection: 'media', id: doc.id, locale: 'en', data: { alt: alt.en } })
  return doc.id
}

/** Ajoute la traduction anglaise d'un tableau en réutilisant les identifiants des lignes françaises. */
function withIds<T extends object>(rows: { id?: string | null }[] | null | undefined, values: T[]) {
  return values.map((value, i) => ({ id: rows?.[i]?.id, ...value }))
}

/* ───────────── 2. Pôles ───────────── */
const poleIds: Record<string, number> = {}
for (const seed of poleSeeds) {
  const found = await payload.find({ collection: 'poles', where: { key: { equals: seed.key } }, limit: 1 })
  if (found.docs[0]) {
    poleIds[seed.key] = found.docs[0].id
    continue
  }
  const image = await media(seed.order * 7, `pole-${seed.key}`, seed.title)
  const doc = await payload.create({
    collection: 'poles',
    locale: 'fr',
    data: {
      key: seed.key,
      slug: seed.slug,
      order: seed.order,
      tone: seed.tone,
      hasServicePage: seed.hasServicePage,
      title: seed.title.fr,
      summary: seed.summary.fr,
      description: richText(...seed.description.fr),
      services: seed.services.map((s) => ({ title: s.title.fr, text: s.text.fr })),
      pack: seed.pack.fr,
      whatsappMessage: seed.whatsappMessage.fr,
      image,
    },
  })
  await payload.update({
    collection: 'poles',
    id: doc.id,
    locale: 'en',
    data: {
      title: seed.title.en,
      summary: seed.summary.en,
      description: richText(...seed.description.en),
      services: withIds(doc.services, seed.services.map((s) => ({ title: s.title.en, text: s.text.en }))),
      pack: seed.pack.en,
      whatsappMessage: seed.whatsappMessage.en,
    },
  })
  poleIds[seed.key] = doc.id
  log(`Pôle créé : ${seed.title.fr}`)
}

/* ───────────── 3. Réalisations (fictives) ───────────── */
for (const [index, seed] of projectSeeds.entries()) {
  const found = await payload.find({ collection: 'projects', where: { slug: { equals: seed.slug } }, limit: 1, draft: true })
  if (found.docs[0]) continue

  const n = 100 + index * 10
  const cover = await media(n, `projet-${seed.slug}`, seed.title)
  const gallery = [
    { image: await media(n + 1, `projet-${seed.slug}-2`, seed.title) },
    { image: await media(n + 2, `projet-${seed.slug}-3`, seed.title) },
    { image: await media(n + 3, `projet-${seed.slug}-4`, seed.title) },
  ]
  const beforeAfter = seed.beforeAfter
    ? {
        beforeImage: await media(n + 4, `projet-${seed.slug}-avant`, { fr: `${seed.title.fr}, avant`, en: `${seed.title.en}, before` }),
        afterImage: await media(n + 5, `projet-${seed.slug}-apres`, { fr: `${seed.title.fr}, après`, en: `${seed.title.en}, after` }),
      }
    : {}

  const doc = await payload.create({
    collection: 'projects',
    locale: 'fr',
    data: {
      _status: 'published',
      slug: seed.slug,
      featured: seed.featured,
      pole: poleIds[seed.pole],
      type: seed.type,
      title: seed.title.fr,
      summary: seed.summary.fr,
      description: richText(...seed.description.fr),
      clientQuote: seed.quote?.fr,
      city: seed.city,
      country: 'Guinée',
      year: seed.year,
      surface: seed.surface,
      duration: seed.duration.fr,
      budgetRange: seed.budget.fr,
      materials: seed.materials.map((mat) => ({ name: mat.fr })),
      latitude: seed.lat,
      longitude: seed.lng,
      coverImage: cover,
      gallery,
      ...beforeAfter,
    },
  })
  await payload.update({
    collection: 'projects',
    id: doc.id,
    locale: 'en',
    data: {
      _status: 'published',
      title: seed.title.en,
      summary: seed.summary.en,
      description: richText(...seed.description.en),
      clientQuote: seed.quote?.en,
      duration: seed.duration.en,
      budgetRange: seed.budget.en,
      materials: withIds(doc.materials, seed.materials.map((mat) => ({ name: mat.en }))),
    },
  })
  log(`Réalisation créée : ${seed.title.fr}`)
}

/* ───────────── 4. Témoignages, équipe, partenaires ───────────── */
if ((await payload.count({ collection: 'testimonials' })).totalDocs === 0) {
  for (const [i, seed] of testimonialSeeds.entries()) {
    const doc = await payload.create({
      collection: 'testimonials',
      locale: 'fr',
      data: { author: seed.author, context: seed.context.fr, quote: seed.quote.fr, pole: poleIds[seed.pole], order: i + 1 },
    })
    await payload.update({ collection: 'testimonials', id: doc.id, locale: 'en', data: { context: seed.context.en, quote: seed.quote.en } })
  }
  log('Témoignages de démonstration créés.')
}

if ((await payload.count({ collection: 'team-members' })).totalDocs === 0) {
  for (const [i, seed] of teamSeeds.entries()) {
    const doc = await payload.create({ collection: 'team-members', locale: 'fr', data: { name: seed.name, role: seed.role.fr, order: i + 1 } })
    await payload.update({ collection: 'team-members', id: doc.id, locale: 'en', data: { role: seed.role.en } })
  }
  log('Équipe de démonstration créée.')
}

if ((await payload.count({ collection: 'partners' })).totalDocs === 0) {
  for (const [i, name] of partnerSeeds.entries()) {
    await payload.create({ collection: 'partners', data: { name, order: i + 1 } })
  }
  log('Partenaires de démonstration créés.')
}

/* ───────────── 5. Pages légales ───────────── */
for (const seed of pageSeeds) {
  const found = await payload.find({ collection: 'pages', where: { slug: { equals: seed.slug } }, limit: 1 })
  if (found.docs[0]) continue
  const doc = await payload.create({
    collection: 'pages',
    locale: 'fr',
    data: { slug: seed.slug, title: seed.title.fr, content: richText(...seed.content.fr) },
  })
  await payload.update({ collection: 'pages', id: doc.id, locale: 'en', data: { title: seed.title.en, content: richText(...seed.content.en) } })
  log(`Page créée : ${seed.title.fr}`)
}

/* ───────────── 6. Globaux (remplis seulement s'ils sont vides) ───────────── */
const settings = await payload.findGlobal({ slug: 'site-settings', locale: 'fr' })
if (settings.latitude == null) {
  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'fr',
    data: {
      companyName: 'ARCHI-DESIGN Guinée SARL',
      tagline: 'Construire mieux avec les ressources et les réalités de notre territoire.',
      address: 'Conakry, Guinée',
      openingHours: 'Lundi – samedi, 8 h 30 – 18 h',
      latitude: 9.5370,
      longitude: -13.6785,
    },
  })
  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'en',
    data: {
      tagline: 'Building better with the resources and realities of our land.',
      openingHours: 'Monday – Saturday, 8:30 am – 6 pm',
    },
  })
  log('Réglages du site complétés (position à corriger dans le back-office).')
}

const figures = await payload.findGlobal({ slug: 'key-figures', locale: 'fr' })
if (!figures.figures?.length) {
  const doc = await payload.updateGlobal({
    slug: 'key-figures',
    locale: 'fr',
    data: { figures: figureSeeds.map((f) => ({ value: f.value, suffix: f.suffix, label: f.label.fr })) },
  })
  await payload.updateGlobal({
    slug: 'key-figures',
    locale: 'en',
    data: { figures: withIds(doc.figures, figureSeeds.map((f) => ({ value: f.value, suffix: f.suffix, label: f.label.en }))) },
  })
  log('Chiffres clés de démonstration créés.')
}

const about = await payload.findGlobal({ slug: 'about-page', locale: 'fr' })
if (!about.vision) {
  const doc = await payload.updateGlobal({
    slug: 'about-page',
    locale: 'fr',
    data: {
      intro: aboutSeed.intro.fr,
      vision: aboutSeed.vision.fr,
      mission: aboutSeed.mission.fr,
      values: aboutSeed.values.map((v) => ({ title: v.title.fr, text: v.text.fr })),
      history: aboutSeed.history.map((h) => ({ year: h.year, title: h.title.fr, text: h.text.fr })),
      commitments: aboutSeed.commitments.map((c) => ({ title: c.title.fr, text: c.text.fr })),
    },
  })
  await payload.updateGlobal({
    slug: 'about-page',
    locale: 'en',
    data: {
      intro: aboutSeed.intro.en,
      vision: aboutSeed.vision.en,
      mission: aboutSeed.mission.en,
      values: withIds(doc.values, aboutSeed.values.map((v) => ({ title: v.title.en, text: v.text.en }))),
      history: withIds(doc.history, aboutSeed.history.map((h) => ({ year: h.year, title: h.title.en, text: h.text.en }))),
      commitments: withIds(doc.commitments, aboutSeed.commitments.map((c) => ({ title: c.title.en, text: c.text.en }))),
    },
  })
  log('Page « À propos » remplie.')
}


/* ───────────── 7. Modèles d'e-mail (un par service) ───────────── */
for (const seed of emailTemplateSeeds) {
  const found = await payload.find({ collection: 'email-templates', where: { service: { equals: seed.service } }, limit: 1 })
  if (found.docs[0]) continue
  const doc = await payload.create({
    collection: 'email-templates',
    locale: 'fr',
    data: {
      service: seed.service,
      name: seed.name,
      subject: seed.subject,
      intro: seed.intro,
      ackSubject: seed.ackSubject.fr,
      ackIntro: seed.ackIntro.fr,
      ackDelay: seed.ackDelay.fr,
      ackOutro: seed.ackOutro.fr,
    },
  })
  await payload.update({
    collection: 'email-templates',
    id: doc.id,
    locale: 'en',
    data: { ackSubject: seed.ackSubject.en, ackIntro: seed.ackIntro.en, ackDelay: seed.ackDelay.en, ackOutro: seed.ackOutro.en },
  })
  log(`Modèle d’e-mail créé : ${seed.name}`)
}

/* ───────────── 8. Tarifs d'impression ───────────── */
const pricing = await payload.findGlobal({ slug: 'print-pricing' })
if (!pricing.supports?.length) {
  await payload.updateGlobal({
    slug: 'print-pricing',
    data: { supports: printPricingSeed.map((s) => ({ ...s, discounts: [...s.discounts] })) },
  })
  log('Tarifs d’impression de démonstration créés.')
}

/* ───────────── 9. Produits de la boutique (fictifs) ───────────── */
for (const [index, seed] of productSeeds.entries()) {
  const found = await payload.find({ collection: 'products', where: { reference: { equals: seed.reference } }, limit: 1, draft: true })
  if (found.docs[0]) continue
  const image = await media(400 + index, `produit-${seed.slug}`, seed.name)
  const doc = await payload.create({
    collection: 'products',
    locale: 'fr',
    data: {
      _status: 'published',
      reference: seed.reference,
      slug: seed.slug,
      category: seed.category,
      name: seed.name.fr,
      unit: seed.unit.fr,
      summary: seed.summary.fr,
      price: seed.price,
      stock: seed.stock,
      colorHex: seed.colorHex,
      images: [image],
      technicalSheet: richText(`Référence ${seed.reference}.`, 'Fiche technique détaillée à compléter dans le back-office.'),
    },
  })
  await payload.update({
    collection: 'products',
    id: doc.id,
    locale: 'en',
    data: {
      _status: 'published',
      name: seed.name.en,
      unit: seed.unit.en,
      summary: seed.summary.en,
      technicalSheet: richText(`Reference ${seed.reference}.`, 'Detailed technical sheet to be completed in the back office.'),
    },
  })
}
log('Produits de démonstration vérifiés.')

/* ───────────── 10. Formations et sessions (fictives) ───────────── */
for (const [index, seed] of trainingSeeds.entries()) {
  const found = await payload.find({ collection: 'trainings', where: { slug: { equals: seed.slug } }, limit: 1 })
  if (found.docs[0]) continue
  const image = await media(500 + index, `formation-${seed.slug}`, seed.title)
  const doc = await payload.create({
    collection: 'trainings',
    locale: 'fr',
    data: {
      slug: seed.slug,
      title: seed.title.fr,
      summary: seed.summary.fr,
      duration: seed.duration.fr,
      price: seed.price ?? undefined,
      level: seed.level,
      trainer: seed.trainer,
      order: index + 1,
      image,
      description: richText(seed.summary.fr, 'Formation pratique, en petits groupes, avec mise en situation sur nos chantiers et dans notre atelier.'),
      program: seed.program.map((m) => ({ title: m.fr })),
    },
  })
  await payload.update({
    collection: 'trainings',
    id: doc.id,
    locale: 'en',
    data: {
      title: seed.title.en,
      summary: seed.summary.en,
      duration: seed.duration.en,
      description: richText(seed.summary.en, 'Hands-on training in small groups, with practice on our sites and in our workshop.'),
      program: withIds(doc.program, seed.program.map((m) => ({ title: m.en }))),
    },
  })
  for (const session of seed.sessions) {
    const start = new Date()
    start.setUTCHours(8, 0, 0, 0)
    start.setUTCDate(start.getUTCDate() + session.inDays)
    const end = new Date(start)
    end.setUTCDate(end.getUTCDate() + session.lengthDays)
    await payload.create({
      collection: 'training-sessions',
      data: { training: doc.id, startDate: start.toISOString(), endDate: end.toISOString(), location: 'Conakry', seats: session.seats, status: 'ouverte' },
    })
  }
  log(`Formation créée : ${seed.title.fr}`)
}

log('Seed terminé.')
process.exit(0)
