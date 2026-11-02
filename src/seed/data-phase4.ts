/**
 * Contenu de la phase 4 : grille du simulateur (prix FICTIFS à remplacer par la grille réelle),
 * modèle d'e-mail du simulateur et page « Impact » de démonstration.
 */

/** Prix au m² en GNF : ordres de grandeur de démonstration, à valider par l'entreprise. */
export const simulatorPricingSeed = {
  types: [
    { key: 'villa', economiqueMin: 3_500_000, economiqueMax: 4_500_000, standardMin: 5_000_000, standardMax: 6_500_000, hautDeGammeMin: 7_500_000, hautDeGammeMax: 10_000_000, baseMonths: 3, monthsPer100m2: 2.5, minSurface: 40, maxSurface: 1500 },
    { key: 'immeuble', economiqueMin: 3_800_000, economiqueMax: 4_800_000, standardMin: 5_200_000, standardMax: 6_800_000, hautDeGammeMin: 7_800_000, hautDeGammeMax: 10_500_000, baseMonths: 5, monthsPer100m2: 1.2, minSurface: 200, maxSurface: 10000 },
    { key: 'commerce', economiqueMin: 3_000_000, economiqueMax: 4_000_000, standardMin: 4_500_000, standardMax: 6_000_000, hautDeGammeMin: 6_500_000, hautDeGammeMax: 9_000_000, baseMonths: 2, monthsPer100m2: 1.5, minSurface: 20, maxSurface: 3000 },
    { key: 'bureaux', economiqueMin: 3_500_000, economiqueMax: 4_500_000, standardMin: 5_000_000, standardMax: 6_500_000, hautDeGammeMin: 7_000_000, hautDeGammeMax: 9_500_000, baseMonths: 4, monthsPer100m2: 1.3, minSurface: 50, maxSurface: 8000 },
    { key: 'renovation', economiqueMin: 1_200_000, economiqueMax: 1_800_000, standardMin: 2_000_000, standardMax: 3_000_000, hautDeGammeMin: 3_500_000, hautDeGammeMax: 5_000_000, baseMonths: 1, monthsPer100m2: 1, minSurface: 15, maxSurface: 3000 },
    { key: 'interieur', economiqueMin: 600_000, economiqueMax: 900_000, standardMin: 1_000_000, standardMax: 1_600_000, hautDeGammeMin: 2_000_000, hautDeGammeMax: 3_500_000, baseMonths: 1, monthsPer100m2: 0.8, minSurface: 10, maxSurface: 2000 },
  ],
  zones: [
    { key: 'conakry', coefficient: 1, extraMonths: 0 },
    { key: 'interieur', coefficient: 1.1, extraMonths: 1 },
    { key: 'sousRegion', coefficient: 1.25, extraMonths: 2 },
  ],
} as const

export const simulatorEmailTemplate = {
  service: 'simulateur' as const,
  name: 'Simulateur (pré-devis)',
  subject: '[ARCHI-DESIGN] Pré-devis simulateur – {type}',
  intro: 'Un visiteur a utilisé le simulateur et souhaite être rappelé. Le pré-devis PDF qu’il a reçu est joint.',
  ackSubject: { fr: 'Votre pré-devis {numero}', en: 'Your pre-quote {numero}' },
  ackIntro: {
    fr: 'Bonjour {client},\n\nVoici le pré-devis issu de notre simulateur, en pièce jointe. C’est une première fourchette : un architecte vous rappelle pour l’affiner selon votre terrain, vos plans et vos choix de matériaux.',
    en: 'Hello {client},\n\nPlease find attached the pre-quote from our simulator. It is a first range: an architect will call you to refine it according to your land, plans and choice of materials.',
  },
  ackDelay: { fr: 'Un architecte vous rappelle sous 48 heures ouvrées.', en: 'An architect will call you within 2 working days.' },
  ackOutro: { fr: 'Merci de votre confiance,\nL’équipe ARCHI-DESIGN Guinée', en: 'Thank you for your trust,\nThe ARCHI-DESIGN Guinea team' },
}

export const impactSeed = {
  intro: {
    fr: 'Chaque chantier fait travailler des artisans locaux, forme des jeunes et teste des solutions adaptées au climat. Ces chiffres sont mis à jour par l’équipe au fil des projets.',
    en: 'Every project employs local craftsmen, trains young people and tests climate-adapted solutions. The team updates these figures as projects progress.',
  },
  figures: [
    { value: 45, suffix: '', axis: 'emploi', label: { fr: 'emplois directs', en: 'direct jobs' }, detail: { fr: 'Architectes, peintres, calligraphes, techniciens et commerciaux.', en: 'Architects, painters, calligraphers, technicians and sales staff.' } },
    { value: 120, suffix: '+', axis: 'emploi', label: { fr: 'artisans mobilisés', en: 'craftsmen involved' }, detail: { fr: 'Maçons, menuisiers et ferronniers recrutés près des chantiers.', en: 'Masons, carpenters and metalworkers hired near our sites.' } },
    { value: 300, suffix: '+', axis: 'formation', label: { fr: 'jeunes formés', en: 'young people trained' }, detail: { fr: 'En peinture, dessin de plans et logiciels de conception.', en: 'In painting, drafting and design software.' } },
    { value: 60, suffix: ' %', axis: 'durable', label: { fr: 'de matériaux locaux', en: 'local materials' }, detail: { fr: 'Part moyenne de latérite, pierre, bois et bambou de Guinée dans nos constructions.', en: 'Average share of Guinean laterite, stone, wood and bamboo in our buildings.' } },
  ],
  stories: [
    { title: { fr: 'Des apprentis sur chaque chantier', en: 'Apprentices on every site' }, text: { fr: 'Chaque équipe accueille deux apprentis issus de nos formations : ils apprennent sur un vrai projet, encadrés par un chef d’équipe.', en: 'Each team hosts two apprentices from our courses: they learn on a real project, supervised by a team leader.' } },
    { title: { fr: 'Moins de climatisation', en: 'Less air conditioning' }, text: { fr: 'Ventilation traversante et double toiture font baisser la température intérieure de plusieurs degrés sans consommer d’électricité.', en: 'Cross-ventilation and double roofs lower indoor temperature by several degrees without using electricity.' } },
    { title: { fr: 'Le savoir-faire des calligraphes', en: 'The skill of calligraphers' }, text: { fr: 'Nos commandes font vivre un métier d’art guinéen et transmettent la technique à de jeunes calligraphes.', en: 'Our commissions keep a Guinean art craft alive and pass the technique to young calligraphers.' } },
  ],
}
