/**
 * Données initiales et de démonstration.
 * Usage : npm run seed              (base de développement)
 *         npm run seed:production   (base Neon + stockage Vercel Blob, voir docs/DEPLOIEMENT.md)
 *
 * En production, aucun compte n'est créé : l'administrateur se crée sur /admin
 * (écran « Créer le premier utilisateur »).
 *
 * Relançable sans risque : un élément déjà présent (même adresse/slug) n'est ni recréé
 * ni écrasé, pour ne jamais effacer ce que l'équipe a saisi dans le back-office.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { aboutSeed, figureSeeds, pageSeeds, partnerSeeds, poleSeeds, projectSeeds, teamSeeds, testimonialSeeds } from './data'
import { emailTemplateSeeds, printPricingSeed, productSeeds, trainingSeeds } from './data-phase3'
import { impactSeed, simulatorEmailTemplate, simulatorPricingSeed } from './data-phase4'
import { buildDemoPlanPdf } from './demo-pdf'
import { buildDemoVillaGlb } from './glb'
import { demoImage } from './images'
import { richText } from './lexical'

const isProduction = process.env.NODE_ENV === 'production'

/* ───────────── 0. Garde-fous du mode production ───────────── */
if (isProduction) {
  const db = process.env.DATABASE_URL || process.env.POSTGRES_URL || ''
  if (!db || /@(localhost|127\.0\.0\.1)[:/]/.test(db)) {
    console.error(
      '\n✖ Base de production introuvable : renseignez DATABASE_URL (adresse Neon) dans .env.production.local.\n' +
        '  Le remplissage est arrêté pour ne pas viser la base de votre ordinateur par erreur.\n',
    )
    process.exit(1)
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error(
      '\n✖ BLOB_READ_WRITE_TOKEN manquant dans .env.production.local.\n' +
        '  Sans lui, les photos et la maquette 3D resteraient sur votre disque et seraient invisibles en ligne.\n',
    )
    process.exit(1)
  }
}

const payload = await getPayload({ config })
const log = (message: string) => payload.logger.info(message)
if (isProduction) log(`Remplissage de la base de production (${new URL(process.env.DATABASE_URL || process.env.POSTGRES_URL!).host})…`)

/* ───────────── 1. Compte administrateur (développement uniquement) ───────────── */
// En production, aucun compte n'est créé ici : sinon l'écran « Créer le premier utilisateur »
// de /admin ne s'afficherait plus.
if (!isProduction) {
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

/* ───────────── 11. Simulateur : grille et modèle d'e-mail ───────────── */
const simulator = await payload.findGlobal({ slug: 'simulator-pricing' })
if (!simulator.types?.length) {
  await payload.updateGlobal({
    slug: 'simulator-pricing',
    data: { types: simulatorPricingSeed.types.map((t) => ({ ...t })), zones: simulatorPricingSeed.zones.map((z) => ({ ...z })) },
  })
  log('Grille du simulateur de démonstration créée.')
}
{
  const t = simulatorEmailTemplate
  const found = await payload.find({ collection: 'email-templates', where: { service: { equals: t.service } }, limit: 1 })
  if (!found.docs[0]) {
    const doc = await payload.create({
      collection: 'email-templates',
      locale: 'fr',
      data: { service: t.service, name: t.name, subject: t.subject, intro: t.intro, ackSubject: t.ackSubject.fr, ackIntro: t.ackIntro.fr, ackDelay: t.ackDelay.fr, ackOutro: t.ackOutro.fr },
    })
    await payload.update({
      collection: 'email-templates',
      id: doc.id,
      locale: 'en',
      data: { ackSubject: t.ackSubject.en, ackIntro: t.ackIntro.en, ackDelay: t.ackDelay.en, ackOutro: t.ackOutro.en },
    })
    log('Modèle d’e-mail du simulateur créé.')
  }
}

/* ───────────── 12. Page « Impact » ───────────── */
const impact = await payload.findGlobal({ slug: 'impact-page', locale: 'fr' })
if (!impact.figures?.length) {
  const storyImages = await Promise.all(impactSeed.stories.map((_, i) => media(600 + i, `impact-recit-${i + 1}`, impactSeed.stories[i].title)))
  const doc = await payload.updateGlobal({
    slug: 'impact-page',
    locale: 'fr',
    data: {
      intro: impactSeed.intro.fr,
      figures: impactSeed.figures.map((f) => ({ value: f.value, suffix: f.suffix, axis: f.axis as 'emploi', label: f.label.fr, detail: f.detail.fr })),
      stories: impactSeed.stories.map((s, i) => ({ title: s.title.fr, text: s.text.fr, image: storyImages[i] })),
    },
  })
  await payload.updateGlobal({
    slug: 'impact-page',
    locale: 'en',
    data: {
      intro: impactSeed.intro.en,
      figures: withIds(doc.figures, impactSeed.figures.map((f) => ({ value: f.value, suffix: f.suffix, axis: f.axis as 'emploi', label: f.label.en, detail: f.detail.en }))),
      stories: withIds(doc.stories, impactSeed.stories.map((s, i) => ({ title: s.title.en, text: s.text.en, image: storyImages[i] }))),
    },
  })
  log('Page « Impact » remplie.')
}

/* ───────────── 13. Maquette 3D de démonstration (villa de Kipé) ───────────── */
const villa = (await payload.find({ collection: 'projects', where: { slug: { equals: 'villa-bioclimatique-kipe' } }, limit: 1, depth: 0 })).docs[0]
if (villa && !villa.model) {
  const glb = buildDemoVillaGlb()
  const model = await payload.create({
    collection: 'models',
    locale: 'fr',
    data: { title: 'Villa bioclimatique à Kipé (maquette de démonstration)', poster: typeof villa.coverImage === 'number' ? villa.coverImage : undefined },
    file: { data: glb, mimetype: 'model/gltf-binary', name: 'villa-kipe-demo.glb', size: glb.length },
  })
  await payload.update({ collection: 'models', id: model.id, locale: 'en', data: { title: 'Bioclimatic villa in Kipé (demo model)' } })
  await payload.update({ collection: 'projects', id: villa.id, data: { model: model.id, _status: 'published' } })
  log(`Maquette 3D créée (${Math.round(glb.length / 1024)} Ko) et reliée à la villa de Kipé.`)
}

/* ───────────── 14. Espace client de démonstration ───────────── */
// Jamais en production : un compte client de démonstration n'a rien à faire sur le site en ligne
const clientEmail = isProduction ? undefined : process.env.SEED_CLIENT_EMAIL
const clientPassword = process.env.SEED_CLIENT_PASSWORD
if (clientEmail && clientPassword) {
  // Les notifications e-mail sont coupées pour les données de démonstration
  const quiet = { skipNotify: true }
  let client = (await payload.find({ collection: 'users', where: { email: { equals: clientEmail } }, limit: 1 })).docs[0]
  if (!client) {
    client = await payload.create({
      collection: 'users',
      data: { email: clientEmail, password: clientPassword, name: 'Mariama Diallo (démo)', role: 'client', phone: '+33 6 00 00 00 00', locale: 'fr' },
    })
    log(`Client de démonstration créé : ${clientEmail} (mot de passe dans .env, SEED_CLIENT_PASSWORD)`)
  }
  const existing = await payload.find({ collection: 'client-projects', where: { clients: { equals: client.id } }, limit: 1 })
  if (!existing.docs[0]) {
    const adminUser = (await payload.find({ collection: 'users', where: { role: { equals: 'admin' } }, limit: 1 })).docs[0]
    const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString()
    const tracked = await payload.create({
      collection: 'client-projects',
      context: quiet,
      data: {
        title: 'Villa R+1 à Kipé',
        clients: [client.id],
        manager: adminUser?.id,
        status: 'enCours',
        progress: 62,
        location: 'Kipé, Conakry',
        startDate: day(-150),
        expectedEndDate: day(120),
        project: villa?.id,
        summary: 'Construction d’une villa bioclimatique R+1 de 240 m², suivie à distance depuis la France.',
        stages: [
          { title: 'Études et plans', status: 'termine', date: day(-150), note: 'Plans validés, maquette 3D remise.' },
          { title: 'Permis de construire', status: 'termine', date: day(-110) },
          { title: 'Fondations', status: 'termine', date: day(-80) },
          { title: 'Élévation des murs et dalle', status: 'termine', date: day(-30) },
          { title: 'Toiture et menuiseries', status: 'enCours', date: day(-5), note: 'Charpente posée, couverture en cours.' },
          { title: 'Finitions et peinture', status: 'aVenir', date: day(60) },
          { title: 'Réception et remise des clés', status: 'aVenir', date: day(120) },
        ],
      },
    })

    const photo = async (seed: number, title: string) => {
      const img = await demoImage(seed, `chantier-${seed}`)
      return payload.create({ collection: 'client-files', context: quiet, data: { title, clientProject: tracked.id, kind: 'photo', visibleToClient: true }, file: img })
    }
    const p1 = await photo(701, 'Dalle de l’étage coulée')
    const p2 = await photo(702, 'Murs de l’étage')
    const p3 = await photo(703, 'Charpente de la double toiture')
    const p4 = await photo(704, 'Vue depuis la rue')

    await payload.create({ collection: 'project-updates', context: quiet, data: { clientProject: tracked.id, date: day(-30), title: 'Dalle de l’étage coulée', text: 'La dalle de l’étage a été coulée et a séché 21 jours avant de reprendre les travaux. Les réservations pour l’électricité et la plomberie sont en place.', photos: [p1.id, p2.id], notifyClient: false } })
    await payload.create({ collection: 'project-updates', context: quiet, data: { clientProject: tracked.id, date: day(-5), title: 'Pose de la charpente', text: 'La charpente métallique de la double toiture est posée. La couverture en tôle latérite sera terminée avant les premières pluies.', photos: [p3.id, p4.id], notifyClient: false } })

    const plan = await buildDemoPlanPdf('Plan du rez-de-chaussée (démonstration)')
    await payload.create({ collection: 'client-files', context: quiet, data: { title: 'Plan du rez-de-chaussée', clientProject: tracked.id, kind: 'plan', visibleToClient: true }, file: { data: plan, mimetype: 'application/pdf', name: 'plan-rdc-demo.pdf', size: plan.length } })
    const invoice = await buildDemoPlanPdf('Facture d’acompte n° 2 (démonstration)')
    await payload.create({ collection: 'client-files', context: quiet, data: { title: 'Facture d’acompte n° 2', clientProject: tracked.id, kind: 'facture', visibleToClient: true }, file: { data: invoice, mimetype: 'application/pdf', name: 'facture-acompte-2-demo.pdf', size: invoice.length } })
    const internal = await buildDemoPlanPdf('Note interne (non visible du client)')
    await payload.create({ collection: 'client-files', context: quiet, data: { title: 'Note interne de chantier', clientProject: tracked.id, kind: 'autre', visibleToClient: false }, file: { data: internal, mimetype: 'application/pdf', name: 'note-interne-demo.pdf', size: internal.length } })

    await payload.create({ collection: 'project-messages', context: quiet, overrideAccess: true, data: { clientProject: tracked.id, body: 'Bonjour, pouvez-vous me confirmer la teinte prévue pour la façade ?', author: client.id, fromStaff: false } })
    await payload.create({ collection: 'project-messages', context: quiet, overrideAccess: true, data: { clientProject: tracked.id, body: 'Bonjour Madame Diallo, nous partons sur l’ocre latérite validé ensemble. Nous vous enverrons une photo de l’échantillon sur le mur la semaine prochaine.', author: adminUser?.id, fromStaff: true } })
    log('Projet suivi de démonstration créé (étapes, actualités, photos, documents, messages).')
  }
} else {
  log('Espace client de démonstration ignoré : renseignez SEED_CLIENT_EMAIL et SEED_CLIENT_PASSWORD dans .env.')
}

/* ───────────── 15. Demandes de démonstration (tableau de bord) ───────────── */
// Développement uniquement : alimente les indicateurs et graphiques du back-office
if (!isProduction && (await payload.count({ collection: 'orders' })).totalDocs === 0) {
  const services = ['architecture', 'architecture', 'peinture', 'serigraphie', 'serigraphie', 'boutique', 'formation', 'simulateur', 'calligraphie', 'dessin', 'prestation'] as const
  const statuses = ['nouvelle', 'contactee', 'confirmee', 'livree', 'livree', 'annulee'] as const
  const names = ['Mamadou Bah', 'Fatoumata Camara', 'Ibrahima Sow', 'Aïssatou Diallo', 'Ousmane Barry', 'Kadiatou Condé', 'Alpha Touré', 'Mariama Sylla']
  const now = new Date()
  const perYear: Record<number, number> = {}
  // Activité croissante sur 12 mois, déterministe (pas de Math.random : même résultat à chaque seed)
  const orders: { date: Date; i: number }[] = []
  let i = 0
  for (let m = 11; m >= 0; m--) {
    const count = 3 + Math.round((11 - m) * 0.6) + (m % 3)
    for (let k = 0; k < count; k++) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1 + ((k * 7 + m * 3) % 27), 9 + (k % 8))
      if (d <= now) orders.push({ date: d, i: i++ })
    }
  }
  for (const { date, i: n } of orders) {
    const year = date.getFullYear()
    perYear[year] = (perYear[year] ?? 0) + 1
    const recent = now.getTime() - date.getTime() < 10 * 86_400_000
    await payload.create({
      collection: 'orders',
      context: { skipNotify: true },
      data: {
        number: `AD-${year}-${String(perYear[year]).padStart(4, '0')}`,
        createdAt: date.toISOString(),
        service: services[n % services.length],
        status: recent ? 'nouvelle' : statuses[n % statuses.length],
        customerName: `${names[n % names.length]} (démo)`,
        customerPhone: `+224 62${String(1000000 + n * 7919).slice(-7)}`,
        estimatedTotal: [2_500_000, 850_000, 12_000_000, 450_000, 6_800_000][n % 5],
      },
    })
  }
  log(`${orders.length} demandes de démonstration créées.`)
}

log('Seed terminé.')
process.exit(0)
