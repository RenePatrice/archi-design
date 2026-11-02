/**
 * Contenu de démonstration (français + anglais).
 * Les projets, témoignages, membres d'équipe et partenaires sont FICTIFS :
 * ils servent à voir le site rempli et sont à remplacer par les vrais dans le back-office.
 */
import type { PoleKey } from '@/lib/navigation'

type L = { fr: string; en: string }

export type PoleSeed = {
  key: PoleKey
  slug: string
  order: number
  tone: 'accent' | 'deep' | 'creative'
  hasServicePage: boolean
  title: L
  summary: L
  description: { fr: string[]; en: string[] }
  services: { title: L; text: L }[]
  pack: L
  whatsappMessage: L
}

export const poleSeeds: PoleSeed[] = [
  {
    key: 'architecture',
    slug: 'architecture-et-design',
    order: 1,
    tone: 'accent',
    hasServicePage: true,
    title: { fr: 'Architecture et design', en: 'Architecture and design' },
    summary: {
      fr: 'Conception, construction et rénovation de bâtiments résidentiels, commerciaux et institutionnels, pensés pour le climat guinéen.',
      en: 'Design, construction and renovation of residential, commercial and institutional buildings, suited to the Guinean climate.',
    },
    description: {
      fr: [
        'Nous dessinons des bâtiments qui restent frais sans climatisation permanente : orientation, ventilation traversante, débords de toiture et brise-soleil sont posés dès l’esquisse.',
        'Du permis de construire à la remise des clés, un architecte référent suit votre projet. Les maquettes 3D vous permettent de visiter votre maison avant le premier coup de pioche.',
      ],
      en: [
        'We design buildings that stay cool without constant air conditioning: orientation, cross-ventilation, roof overhangs and sun-shading are set from the first sketch.',
        'From building permit to handover, one lead architect follows your project. 3D models let you walk through your home before ground is broken.',
      ],
    },
    services: [
      {
        title: { fr: 'Conception architecturale', en: 'Architectural design' },
        text: { fr: 'Esquisse, avant-projet, permis de construire et plans d’exécution.', en: 'Sketch, preliminary design, permit and construction drawings.' },
      },
      {
        title: { fr: 'Réalisation et finitions', en: 'Construction and finishing' },
        text: { fr: 'Gros œuvre, second œuvre et finitions avec nos équipes et artisans partenaires.', en: 'Structural work, fit-out and finishes with our teams and partner craftsmen.' },
      },
      {
        title: { fr: 'Rénovation', en: 'Renovation' },
        text: { fr: 'Diagnostic, mise aux normes, extension et transformation de bâtiments existants.', en: 'Survey, upgrades, extensions and conversions of existing buildings.' },
      },
      {
        title: { fr: 'Architecture d’intérieur', en: 'Interior architecture' },
        text: { fr: 'Aménagement, éclairage, matériaux et ambiance de vos espaces.', en: 'Layout, lighting, materials and atmosphere of your spaces.' },
      },
      {
        title: { fr: 'Conception de mobilier', en: 'Furniture design' },
        text: { fr: 'Mobilier sur mesure fabriqué avec des menuisiers locaux.', en: 'Custom furniture built with local carpenters.' },
      },
    ],
    pack: {
      fr: 'Pack clé en main : plans, chantier, peinture et signalétique avec un seul interlocuteur.',
      en: 'Turnkey package: plans, construction, painting and signage with one contact.',
    },
    whatsappMessage: {
      fr: 'Bonjour ARCHI-DESIGN, j’ai un projet de construction ou de rénovation et je souhaite un devis.',
      en: 'Hello ARCHI-DESIGN, I have a construction or renovation project and would like a quote.',
    },
  },
  {
    key: 'peinture',
    slug: 'peinture',
    order: 2,
    tone: 'accent',
    hasServicePage: true,
    title: { fr: 'Peinture', en: 'Painting' },
    summary: {
      fr: 'Peinture bâtiment intérieure et extérieure, enduits et peinture décorative qui résistent au soleil et à la saison des pluies.',
      en: 'Interior and exterior building paint, renders and decorative painting that withstand sun and rainy season.',
    },
    description: {
      fr: [
        'Une façade guinéenne subit un soleil fort et des pluies abondantes. Nous préparons les supports, traitons l’humidité et choisissons des produits adaptés pour que la peinture tienne dans le temps.',
        'Côté décoration, nos peintres réalisent fresques, effets de matière et murales sur mesure.',
      ],
      en: [
        'A Guinean façade faces strong sun and heavy rain. We prepare surfaces, treat damp and choose suitable products so the paint lasts.',
        'For decoration, our painters create murals, textured effects and custom wall art.',
      ],
    },
    services: [
      {
        title: { fr: 'Peinture bâtiment', en: 'Building painting' },
        text: { fr: 'Intérieur, extérieur, enduits, ravalement et finitions.', en: 'Interior, exterior, renders, façade restoration and finishes.' },
      },
      {
        title: { fr: 'Peinture décorative', en: 'Decorative painting' },
        text: { fr: 'Fresques, effets de matière, stucs et murales.', en: 'Murals, textured effects, stucco and wall art.' },
      },
    ],
    pack: {
      fr: 'Peinture + fourniture des produits par notre boutique : prix global et teintes garanties.',
      en: 'Painting + products from our shop: one price, guaranteed colours.',
    },
    whatsappMessage: {
      fr: 'Bonjour ARCHI-DESIGN, je souhaite un devis peinture.',
      en: 'Hello ARCHI-DESIGN, I would like a painting quote.',
    },
  },
  {
    key: 'calligraphie',
    slug: 'calligraphie',
    order: 3,
    tone: 'creative',
    hasServicePage: true,
    title: { fr: 'Calligraphie', en: 'Calligraphy' },
    summary: {
      fr: 'Calligraphie arabe et latine : tableaux, enseignes, décoration murale et œuvres sur commande.',
      en: 'Arabic and Latin calligraphy: artworks, signs, wall decoration and commissions.',
    },
    description: {
      fr: [
        'Nos calligraphes travaillent à la main, au calame et au pinceau, sur toile, bois, verre ou directement sur le mur.',
        'Versets, devises d’entreprise, noms de famille, faire-part : chaque pièce est unique.',
      ],
      en: [
        'Our calligraphers work by hand, with reed pen and brush, on canvas, wood, glass or directly on walls.',
        'Verses, company mottos, family names, invitations: every piece is unique.',
      ],
    },
    services: [
      { title: { fr: 'Tableaux et œuvres sur commande', en: 'Commissioned artworks' }, text: { fr: 'Arabe ou latin, tous formats.', en: 'Arabic or Latin, any size.' } },
      { title: { fr: 'Enseignes calligraphiées', en: 'Calligraphic signs' }, text: { fr: 'Pour commerces, mosquées, écoles.', en: 'For shops, mosques, schools.' } },
      { title: { fr: 'Décoration murale', en: 'Wall decoration' }, text: { fr: 'Calligraphie peinte sur site.', en: 'Calligraphy painted on site.' } },
      { title: { fr: 'Cérémonies', en: 'Ceremonies' }, text: { fr: 'Faire-part, cartes, livres d’or.', en: 'Invitations, cards, guest books.' } },
    ],
    pack: { fr: 'Calligraphie murale posée sur des murs préparés par nos peintres.', en: 'Wall calligraphy on walls prepared by our painters.' },
    whatsappMessage: { fr: 'Bonjour ARCHI-DESIGN, je souhaite commander une calligraphie.', en: 'Hello ARCHI-DESIGN, I would like to order a calligraphy.' },
  },
  {
    key: 'serigraphie',
    slug: 'serigraphie-et-impression',
    order: 4,
    tone: 'deep',
    hasServicePage: true,
    title: { fr: 'Sérigraphie et impression', en: 'Screen printing and print' },
    summary: {
      fr: 'Sérigraphie textile, impression numérique, cachets et tampons, signalétique et communication visuelle.',
      en: 'Textile screen printing, digital printing, stamps and seals, signage and visual communication.',
    },
    description: {
      fr: [
        'T-shirts d’équipe, bâches de chantier, panneaux, cartes de visite, cachets officiels : nous produisons à Conakry, avec bon à tirer validé avant impression.',
      ],
      en: ['Team T-shirts, site banners, panels, business cards, official stamps: produced in Conakry, with a proof approved before printing.'],
    },
    services: [
      { title: { fr: 'Sérigraphie', en: 'Screen printing' }, text: { fr: 'Textile, objets promotionnels, supports rigides.', en: 'Textiles, promotional items, rigid media.' } },
      { title: { fr: 'Impression numérique', en: 'Digital printing' }, text: { fr: 'Affiches, bâches, autocollants, flyers.', en: 'Posters, banners, stickers, flyers.' } },
      { title: { fr: 'Cachets et tampons', en: 'Stamps and seals' }, text: { fr: 'Tampons encreurs et cachets d’entreprise.', en: 'Rubber stamps and company seals.' } },
      { title: { fr: 'Signalétique', en: 'Signage' }, text: { fr: 'Enseignes, plaques, orientation intérieure.', en: 'Shop signs, plaques, wayfinding.' } },
    ],
    pack: { fr: 'Identité visuelle déclinée de l’enseigne aux tenues.', en: 'Identity carried from shop sign to uniforms.' },
    whatsappMessage: { fr: 'Bonjour ARCHI-DESIGN, je souhaite une commande d’impression.', en: 'Hello ARCHI-DESIGN, I would like to place a print order.' },
  },
  {
    key: 'dessin',
    slug: 'dessin-d-art',
    order: 5,
    tone: 'creative',
    hasServicePage: true,
    title: { fr: 'Dessin d’art', en: 'Fine art drawing' },
    summary: {
      fr: 'Portraits, illustrations, dessins d’architecture et œuvres sur commande.',
      en: 'Portraits, illustrations, architectural drawings and commissions.',
    },
    description: {
      fr: ['Portrait de famille au fusain, perspective aquarellée de votre future maison, illustration pour un livre : nos dessinateurs travaillent à partir de vos photos ou de nos plans.'],
      en: ['Charcoal family portrait, watercolour view of your future home, book illustration: our artists work from your photos or our plans.'],
    },
    services: [
      { title: { fr: 'Portraits', en: 'Portraits' }, text: { fr: 'Fusain, crayon, peinture.', en: 'Charcoal, pencil, paint.' } },
      { title: { fr: 'Illustrations', en: 'Illustrations' }, text: { fr: 'Livres, affiches, supports de marque.', en: 'Books, posters, brand media.' } },
      { title: { fr: 'Dessins d’architecture', en: 'Architectural drawings' }, text: { fr: 'Perspectives et croquis de projets.', en: 'Project perspectives and sketches.' } },
    ],
    pack: { fr: 'Perspective dessinée offerte avec chaque avant-projet d’architecture.', en: 'Hand-drawn perspective with every architectural design.' },
    whatsappMessage: { fr: 'Bonjour ARCHI-DESIGN, je souhaite commander un dessin.', en: 'Hello ARCHI-DESIGN, I would like to order a drawing.' },
  },
  {
    key: 'formation',
    slug: 'formation',
    order: 6,
    tone: 'creative',
    hasServicePage: false,
    title: { fr: 'Formation', en: 'Training' },
    summary: {
      fr: 'Formations pratiques en peinture et conception architecturale, puis AutoCAD, SketchUp, Revit et rendu 3D.',
      en: 'Hands-on training in painting and architectural design, then AutoCAD, SketchUp, Revit and 3D rendering.',
    },
    description: {
      fr: ['Nous formons les jeunes aux métiers créatifs et techniques, sur nos chantiers et dans notre atelier. Le catalogue complet arrive bientôt sur le site.'],
      en: ['We train young people in creative and technical trades, on our sites and in our workshop. The full catalogue is coming soon.'],
    },
    services: [
      { title: { fr: 'Peinture', en: 'Painting' }, text: { fr: 'Peinture bâtiment et décorative.', en: 'Building and decorative painting.' } },
      { title: { fr: 'Conception architecturale', en: 'Architectural design' }, text: { fr: 'Dessin de plans, logiciels de CAO.', en: 'Drafting, CAD software.' } },
    ],
    pack: { fr: 'Les meilleurs apprenants rejoignent nos équipes de chantier.', en: 'Top trainees join our site teams.' },
    whatsappMessage: { fr: 'Bonjour ARCHI-DESIGN, je souhaite des informations sur vos formations.', en: 'Hello ARCHI-DESIGN, I would like information about your training.' },
  },
  {
    key: 'commerce',
    slug: 'commerce-general',
    order: 7,
    tone: 'accent',
    hasServicePage: false,
    title: { fr: 'Commerce général', en: 'General trade' },
    summary: {
      fr: 'Vente de peintures, enduits, matériel de construction et outils d’impression numérique.',
      en: 'Sale of paints, renders, building materials and digital printing tools.',
    },
    description: {
      fr: ['Les produits que nous utilisons sur nos chantiers, disponibles pour les particuliers, artisans et imprimeurs. La boutique en ligne arrive bientôt.'],
      en: ['The products we use on our sites, available to individuals, craftsmen and printers. The online shop is coming soon.'],
    },
    services: [
      { title: { fr: 'Peintures et enduits', en: 'Paints and renders' }, text: { fr: 'Intérieur, extérieur, nuancier complet.', en: 'Interior, exterior, full colour range.' } },
      { title: { fr: 'Matériel de construction', en: 'Building materials' }, text: { fr: 'Outillage et fournitures.', en: 'Tools and supplies.' } },
      { title: { fr: 'Outils d’impression', en: 'Printing tools' }, text: { fr: 'Encres, écrans, consommables.', en: 'Inks, screens, consumables.' } },
    ],
    pack: { fr: 'Produits livrés directement sur votre chantier.', en: 'Products delivered to your site.' },
    whatsappMessage: { fr: 'Bonjour ARCHI-DESIGN, je souhaite commander des produits.', en: 'Hello ARCHI-DESIGN, I would like to order products.' },
  },
  {
    key: 'prestation',
    slug: 'prestation-de-services',
    order: 8,
    tone: 'deep',
    hasServicePage: true,
    title: { fr: 'Prestation de services', en: 'Consulting services' },
    summary: {
      fr: 'Études, conseil, assistance à maîtrise d’ouvrage et suivi de chantier, y compris pour la diaspora.',
      en: 'Studies, advice, client-side project management and site supervision, including for the diaspora.',
    },
    description: {
      fr: [
        'Vous construisez depuis Paris, Dakar ou New York ? Nous suivons votre chantier à votre place : visites, photos datées, contrôle des dépenses et rapport régulier.',
      ],
      en: ['Building from Paris, Dakar or New York? We supervise your site on your behalf: visits, dated photos, cost control and regular reports.'],
    },
    services: [
      { title: { fr: 'Études', en: 'Studies' }, text: { fr: 'Faisabilité, chiffrage, études techniques.', en: 'Feasibility, costing, technical studies.' } },
      { title: { fr: 'Suivi de chantier', en: 'Site supervision' }, text: { fr: 'Contrôle qualité, délais et budget.', en: 'Quality, schedule and budget control.' } },
      { title: { fr: 'Conseil', en: 'Advice' }, text: { fr: 'Choix des matériaux, des entreprises, du terrain.', en: 'Choosing materials, contractors, land.' } },
      { title: { fr: 'Assistance', en: 'Assistance' }, text: { fr: 'Démarches administratives et réception des travaux.', en: 'Paperwork and works acceptance.' } },
    ],
    pack: { fr: 'Suivi à distance avec rapport photo pour la diaspora.', en: 'Remote supervision with photo reports for the diaspora.' },
    whatsappMessage: { fr: 'Bonjour ARCHI-DESIGN, je souhaite un suivi de chantier ou un conseil.', en: 'Hello ARCHI-DESIGN, I would like site supervision or advice.' },
  },
]

export type ProjectSeed = {
  slug: string
  pole: PoleKey
  type: 'residentiel' | 'commercial' | 'institutionnel' | 'renovation' | 'interieur' | 'mobilier' | 'decoratif' | 'signaletique'
  featured: boolean
  title: L
  summary: L
  description: { fr: string[]; en: string[] }
  city: string
  year: number
  surface?: number
  duration: L
  budget: L
  materials: L[]
  lat: number
  lng: number
  beforeAfter?: boolean
  quote?: L
}

const m = {
  lateriteBlocks: { fr: 'Blocs de latérite stabilisée', en: 'Stabilised laterite blocks' },
  concrete: { fr: 'Béton armé', en: 'Reinforced concrete' },
  wood: { fr: 'Bois local (iroko)', en: 'Local wood (iroko)' },
  lime: { fr: 'Enduit à la chaux', en: 'Lime render' },
  steel: { fr: 'Acier galvanisé', en: 'Galvanised steel' },
  glass: { fr: 'Verre feuilleté', en: 'Laminated glass' },
  paint: { fr: 'Peinture acrylique façade', en: 'Acrylic façade paint' },
  bamboo: { fr: 'Bambou', en: 'Bamboo' },
  stone: { fr: 'Pierre de Kindia', en: 'Kindia stone' },
  pvc: { fr: 'Dibond et PVC', en: 'Dibond and PVC' },
}

export const projectSeeds: ProjectSeed[] = [
  {
    slug: 'villa-bioclimatique-kipe',
    pole: 'architecture',
    type: 'residentiel',
    featured: true,
    title: { fr: 'Villa bioclimatique à Kipé', en: 'Bioclimatic villa in Kipé' },
    summary: {
      fr: 'Une maison familiale R+1 ventilée naturellement, protégée par une double toiture et des brise-soleil en bois.',
      en: 'A two-storey family home, naturally ventilated, shaded by a double roof and timber louvres.',
    },
    description: {
      fr: [
        'La famille voulait une maison fraîche sans dépendre de la climatisation. Les pièces de vie sont orientées nord-sud, traversées par le vent dominant.',
        '## Une double toiture',
        'Une toiture légère en acier recouvre la dalle et laisse circuler l’air : la chaleur ne s’accumule plus dans les chambres.',
      ],
      en: [
        'The family wanted a cool home without relying on air conditioning. Living spaces face north-south, crossed by the prevailing wind.',
        '## A double roof',
        'A light steel roof covers the slab and lets air flow: heat no longer builds up in the bedrooms.',
      ],
    },
    city: 'Conakry',
    year: 2025,
    surface: 240,
    duration: { fr: '11 mois', en: '11 months' },
    budget: { fr: '1,2 à 1,5 milliard GNF', en: 'GNF 1.2 to 1.5 billion' },
    materials: [m.lateriteBlocks, m.concrete, m.wood, m.lime],
    lat: 9.598,
    lng: -13.652,
    quote: {
      fr: 'Même en mars, les chambres restent fraîches la nuit. On a enfin coupé la clim.',
      en: 'Even in March the bedrooms stay cool at night. We finally switched off the AC.',
    },
  },
  {
    slug: 'siege-microfinance-kaloum',
    pole: 'architecture',
    type: 'institutionnel',
    featured: true,
    title: { fr: 'Siège d’une institution de microfinance', en: 'Microfinance head office' },
    summary: {
      fr: 'Un immeuble de bureaux R+3 à Kaloum, avec façade en résille de briques et accueil du public au rez-de-chaussée.',
      en: 'A four-storey office building in Kaloum with a brick lattice façade and public hall on the ground floor.',
    },
    description: {
      fr: ['La résille de briques filtre la lumière et protège les bureaux du soleil de l’après-midi tout en donnant une identité forte au bâtiment.'],
      en: ['The brick lattice filters light and shields offices from the afternoon sun while giving the building a strong identity.'],
    },
    city: 'Conakry',
    year: 2024,
    surface: 1350,
    duration: { fr: '18 mois', en: '18 months' },
    budget: { fr: 'Sur demande', en: 'On request' },
    materials: [m.concrete, m.lateriteBlocks, m.glass, m.steel],
    lat: 9.509,
    lng: -13.712,
  },
  {
    slug: 'renovation-facade-hotel-kindia',
    pole: 'peinture',
    type: 'renovation',
    featured: true,
    title: { fr: 'Rénovation de façade d’un hôtel', en: 'Hotel façade renovation' },
    summary: {
      fr: 'Traitement de l’humidité, enduits et mise en peinture complète d’un hôtel de 40 chambres.',
      en: 'Damp treatment, renders and full repaint of a 40-room hotel.',
    },
    description: {
      fr: ['Les façades étaient noircies et fissurées. Après traitement des remontées capillaires et reprise des enduits, nous avons appliqué une peinture façade microporeuse aux teintes ocre de la région.'],
      en: ['The façades were blackened and cracked. After treating rising damp and repairing renders, we applied a breathable façade paint in the ochre tones of the region.'],
    },
    city: 'Kindia',
    year: 2025,
    surface: 2100,
    duration: { fr: '3 mois', en: '3 months' },
    budget: { fr: '350 à 420 millions GNF', en: 'GNF 350 to 420 million' },
    materials: [m.lime, m.paint],
    lat: 10.057,
    lng: -12.865,
    beforeAfter: true,
  },
  {
    slug: 'restaurant-lambanyi',
    pole: 'architecture',
    type: 'commercial',
    featured: true,
    title: { fr: 'Restaurant en terrasse à Lambanyi', en: 'Terrace restaurant in Lambanyi' },
    summary: {
      fr: 'Conception, aménagement intérieur, mobilier et signalétique d’un restaurant de 120 couverts.',
      en: 'Design, interior, furniture and signage for a 120-seat restaurant.',
    },
    description: {
      fr: ['Un projet mené de bout en bout : plans, chantier, mobilier en bois local, enseigne lumineuse et tenues du personnel sérigraphiées.'],
      en: ['An end-to-end project: plans, construction, local timber furniture, illuminated sign and screen-printed staff uniforms.'],
    },
    city: 'Conakry',
    year: 2024,
    surface: 420,
    duration: { fr: '7 mois', en: '7 months' },
    budget: { fr: '900 millions à 1,1 milliard GNF', en: 'GNF 900 million to 1.1 billion' },
    materials: [m.wood, m.bamboo, m.steel, m.lime],
    lat: 9.664,
    lng: -13.614,
    quote: {
      fr: 'Un seul interlocuteur pour tout : on a ouvert à la date prévue.',
      en: 'One contact for everything: we opened on the planned date.',
    },
  },
  {
    slug: 'fresque-ecole-labe',
    pole: 'peinture',
    type: 'decoratif',
    featured: true,
    title: { fr: 'Fresque d’une école primaire', en: 'Primary school mural' },
    summary: {
      fr: 'Une fresque de 60 m² inspirée des motifs du leppi, réalisée avec les élèves.',
      en: 'A 60 m² mural inspired by leppi patterns, painted with the pupils.',
    },
    description: {
      fr: ['Les élèves ont dessiné les motifs, nos peintres les ont agrandis sur le mur de la cour. Un projet pédagogique autant que décoratif.'],
      en: ['Pupils drew the patterns, our painters enlarged them on the playground wall. As much a teaching project as a decorative one.'],
    },
    city: 'Labé',
    year: 2025,
    surface: 60,
    duration: { fr: '3 semaines', en: '3 weeks' },
    budget: { fr: '45 à 60 millions GNF', en: 'GNF 45 to 60 million' },
    materials: [m.paint],
    lat: 11.318,
    lng: -12.283,
  },
  {
    slug: 'enseigne-calligraphiee-mosquee',
    pole: 'calligraphie',
    type: 'signaletique',
    featured: false,
    title: { fr: 'Calligraphie murale d’une mosquée', en: 'Mosque wall calligraphy' },
    summary: {
      fr: 'Frise calligraphiée en arabe sur 24 mètres linéaires, peinte à la main et dorée.',
      en: 'A 24-metre Arabic calligraphy frieze, hand-painted and gilded.',
    },
    description: {
      fr: ['Le texte a été composé avec l’imam, tracé à l’échelle sur papier puis reporté et peint sur l’enduit.'],
      en: ['The text was composed with the imam, drawn to scale on paper, then transferred and painted onto the plaster.'],
    },
    city: 'Kankan',
    year: 2024,
    duration: { fr: '5 semaines', en: '5 weeks' },
    budget: { fr: 'Sur demande', en: 'On request' },
    materials: [m.lime, m.paint],
    lat: 10.385,
    lng: -9.305,
  },
  {
    slug: 'interieur-appartement-nongo',
    pole: 'architecture',
    type: 'interieur',
    featured: true,
    title: { fr: 'Appartement réaménagé à Nongo', en: 'Remodelled flat in Nongo' },
    summary: {
      fr: 'Un trois-pièces ouvert, éclairé naturellement, avec cuisine et rangements sur mesure.',
      en: 'An open three-room flat with natural light, custom kitchen and storage.',
    },
    description: {
      fr: ['Cloisons supprimées, cuisine ouverte sur le séjour, rangements intégrés en bois : l’appartement paraît deux fois plus grand.'],
      en: ['Walls removed, kitchen opened onto the living room, built-in timber storage: the flat feels twice as large.'],
    },
    city: 'Conakry',
    year: 2025,
    surface: 95,
    duration: { fr: '10 semaines', en: '10 weeks' },
    budget: { fr: '180 à 220 millions GNF', en: 'GNF 180 to 220 million' },
    materials: [m.wood, m.lime, m.paint],
    lat: 9.676,
    lng: -13.589,
    beforeAfter: true,
  },
  {
    slug: 'signaletique-centre-sante-boke',
    pole: 'serigraphie',
    type: 'signaletique',
    featured: false,
    title: { fr: 'Signalétique d’un centre de santé', en: 'Health centre signage' },
    summary: {
      fr: 'Enseigne, plaques de services et orientation des patients, en français et en pular.',
      en: 'Main sign, department plaques and patient wayfinding in French and Pular.',
    },
    description: {
      fr: ['Des pictogrammes simples et deux langues pour que chaque patient trouve son chemin, qu’il sache lire ou non.'],
      en: ['Simple pictograms and two languages so every patient finds their way, whether or not they can read.'],
    },
    city: 'Boké',
    year: 2023,
    duration: { fr: '6 semaines', en: '6 weeks' },
    budget: { fr: '70 à 90 millions GNF', en: 'GNF 70 to 90 million' },
    materials: [m.pvc, m.steel],
    lat: 10.94,
    lng: -14.29,
  },
  {
    slug: 'mobilier-bureaux-ong',
    pole: 'architecture',
    type: 'mobilier',
    featured: false,
    title: { fr: 'Mobilier des bureaux d’une ONG', en: 'Office furniture for an NGO' },
    summary: {
      fr: '40 postes de travail, salle de réunion et accueil fabriqués avec des menuisiers de Conakry.',
      en: '40 workstations, meeting room and reception built with Conakry carpenters.',
    },
    description: {
      fr: ['Bois massif local, quincaillerie robuste, dimensions adaptées aux bureaux existants : un mobilier qui se répare sur place.'],
      en: ['Local solid wood, sturdy hardware, sized for the existing offices: furniture that can be repaired locally.'],
    },
    city: 'Conakry',
    year: 2023,
    duration: { fr: '2 mois', en: '2 months' },
    budget: { fr: '250 à 300 millions GNF', en: 'GNF 250 to 300 million' },
    materials: [m.wood, m.steel],
    lat: 9.55,
    lng: -13.66,
  },
  {
    slug: 'boutique-matosson',
    pole: 'serigraphie',
    type: 'commercial',
    featured: false,
    title: { fr: 'Identité et enseigne d’une boutique', en: 'Shop identity and sign' },
    summary: {
      fr: 'Logo, enseigne lumineuse, vitrophanie, sacs et tenues sérigraphiés pour une boutique de mode.',
      en: 'Logo, illuminated sign, window graphics, bags and uniforms for a fashion shop.',
    },
    description: {
      fr: ['De l’enseigne aux sacs, une identité cohérente produite entièrement dans nos ateliers.'],
      en: ['From the sign to the shopping bags, a consistent identity produced entirely in our workshops.'],
    },
    city: 'Conakry',
    year: 2024,
    duration: { fr: '4 semaines', en: '4 weeks' },
    budget: { fr: '35 à 50 millions GNF', en: 'GNF 35 to 50 million' },
    materials: [m.pvc],
    lat: 9.583,
    lng: -13.637,
  },
  {
    slug: 'maison-pierre-mamou',
    pole: 'architecture',
    type: 'residentiel',
    featured: false,
    title: { fr: 'Maison en pierre à Mamou', en: 'Stone house in Mamou' },
    summary: {
      fr: 'Une maison de plain-pied en pierre locale, adaptée aux nuits fraîches du Fouta-Djalon.',
      en: 'A single-storey house in local stone, suited to the cool nights of Fouta Djallon.',
    },
    description: {
      fr: ['Murs épais en pierre pour l’inertie thermique, grande véranda au sud et récupération des eaux de pluie.'],
      en: ['Thick stone walls for thermal mass, a large south veranda and rainwater harvesting.'],
    },
    city: 'Mamou',
    year: 2023,
    surface: 160,
    duration: { fr: '9 mois', en: '9 months' },
    budget: { fr: '700 à 850 millions GNF', en: 'GNF 700 to 850 million' },
    materials: [m.stone, m.wood, m.lime],
    lat: 10.375,
    lng: -12.091,
  },
  {
    slug: 'portrait-famille-fusain',
    pole: 'dessin',
    type: 'decoratif',
    featured: false,
    title: { fr: 'Portrait de famille au fusain', en: 'Charcoal family portrait' },
    summary: {
      fr: 'Un portrait grand format de trois générations, réalisé d’après photographies.',
      en: 'A large-format portrait of three generations, drawn from photographs.',
    },
    description: {
      fr: ['Format 100 × 70 cm, fusain et craie blanche sur papier teinté, encadré dans notre atelier.'],
      en: ['100 × 70 cm, charcoal and white chalk on tinted paper, framed in our workshop.'],
    },
    city: 'Conakry',
    year: 2025,
    duration: { fr: '3 semaines', en: '3 weeks' },
    budget: { fr: '6 à 9 millions GNF', en: 'GNF 6 to 9 million' },
    materials: [],
    lat: 9.62,
    lng: -13.6,
  },
]

export const testimonialSeeds = [
  {
    author: 'Mariama D.',
    context: { fr: 'Propriétaire, villa à Kipé', en: 'Owner, villa in Kipé' },
    quote: {
      fr: 'Depuis la France, je recevais chaque semaine les photos du chantier. La maison a été livrée comme sur la maquette 3D.',
      en: 'From France I received site photos every week. The house was delivered just like the 3D model.',
    },
    pole: 'prestation' as PoleKey,
  },
  {
    author: 'Ibrahima S.',
    context: { fr: 'Gérant de restaurant, Lambanyi', en: 'Restaurant manager, Lambanyi' },
    quote: {
      fr: 'Plans, peinture, enseigne et tenues : tout est venu de la même équipe. On a gagné des semaines.',
      en: 'Plans, paint, sign and uniforms all came from the same team. We saved weeks.',
    },
    pole: 'architecture' as PoleKey,
  },
  {
    author: 'Fatoumata B.',
    context: { fr: 'Directrice d’école, Labé', en: 'School head, Labé' },
    quote: {
      fr: 'Les enfants passent devant leur fresque tous les matins avec fierté.',
      en: 'The children walk past their mural every morning with pride.',
    },
    pole: 'peinture' as PoleKey,
  },
]

export const teamSeeds = [
  { name: 'Prénom Nom', role: { fr: 'Architecte, gérant', en: 'Architect, managing director' } },
  { name: 'Prénom Nom', role: { fr: 'Responsable chantiers', en: 'Site manager' } },
  { name: 'Prénom Nom', role: { fr: 'Calligraphe', en: 'Calligrapher' } },
  { name: 'Prénom Nom', role: { fr: 'Responsable atelier impression', en: 'Print workshop manager' } },
]

export const partnerSeeds = ['Partenaire 1', 'Partenaire 2', 'Partenaire 3', 'Partenaire 4', 'Partenaire 5']

export const figureSeeds = [
  { value: 120, suffix: '+', label: { fr: 'projets livrés', en: 'projects delivered' } },
  { value: 8, suffix: '', label: { fr: 'pôles de métiers', en: 'trade divisions' } },
  { value: 45, suffix: '', label: { fr: 'emplois créés', en: 'jobs created' } },
  { value: 300, suffix: '+', label: { fr: 'jeunes formés', en: 'young people trained' } },
]

export const aboutSeed = {
  intro: {
    fr: 'ARCHI-DESIGN Guinée SARL réunit architectes, peintres, calligraphes, dessinateurs, imprimeurs et formateurs. Nous accompagnons nos clients de la conception à l’identité visuelle de leurs espaces.',
    en: 'ARCHI-DESIGN Guinea SARL brings together architects, painters, calligraphers, artists, printers and trainers. We support our clients from design to the visual identity of their spaces.',
  },
  vision: {
    fr: 'Être un acteur majeur de la transformation des espaces et de la créativité en Afrique de l’Ouest, en proposant des solutions intégrées qui associent architecture, design, innovation, savoir-faire local et développement durable.',
    en: 'To be a leading player in transforming spaces and creativity in West Africa, offering integrated solutions combining architecture, design, innovation, local know-how and sustainable development.',
  },
  mission: {
    fr: 'Concevoir, transformer et valoriser les espaces et les environnements professionnels et résidentiels grâce à des solutions architecturales, décoratives, graphiques et techniques accessibles, innovantes et adaptées aux besoins de nos clients.',
    en: 'To design, transform and enhance professional and residential spaces through accessible, innovative architectural, decorative, graphic and technical solutions tailored to our clients’ needs.',
  },
  values: [
    { title: { fr: 'Ancrage local', en: 'Local roots' }, text: { fr: 'Matériaux, artisans et références culturelles de Guinée.', en: 'Guinean materials, craftsmen and cultural references.' } },
    { title: { fr: 'Exigence', en: 'High standards' }, text: { fr: 'Des finitions soignées et des délais tenus.', en: 'Careful finishes and deadlines met.' } },
    { title: { fr: 'Transparence', en: 'Transparency' }, text: { fr: 'Devis détaillés et suivi régulier du chantier.', en: 'Detailed quotes and regular site updates.' } },
    { title: { fr: 'Durabilité', en: 'Sustainability' }, text: { fr: 'Bâtiments sobres en énergie et adaptés au climat.', en: 'Energy-efficient, climate-adapted buildings.' } },
    { title: { fr: 'Transmission', en: 'Passing on skills' }, text: { fr: 'Former la prochaine génération de talents.', en: 'Training the next generation of talent.' } },
    { title: { fr: 'Créativité', en: 'Creativity' }, text: { fr: 'L’art et l’artisanat au service des lieux.', en: 'Art and craft serving places.' } },
  ],
  history: [
    { year: '20XX', title: { fr: 'Création de l’entreprise', en: 'Company founded' }, text: { fr: 'Date et récit à compléter dans le back-office.', en: 'Date and story to complete in the back office.' } },
    { year: '20XX', title: { fr: 'Ouverture de l’atelier d’impression', en: 'Print workshop opens' }, text: { fr: 'À compléter.', en: 'To be completed.' } },
    { year: '2026', title: { fr: 'Lancement du site et des formations', en: 'Website and training launch' }, text: { fr: 'À compléter.', en: 'To be completed.' } },
  ],
  commitments: [
    {
      title: { fr: 'Architecture bioclimatique', en: 'Bioclimatic architecture' },
      text: { fr: 'Ventilation naturelle, protection solaire et gestion de l’eau dans chaque projet.', en: 'Natural ventilation, sun protection and water management in every project.' },
    },
    {
      title: { fr: 'Matériaux locaux', en: 'Local materials' },
      text: { fr: 'Latérite, pierre, bois et bambou de Guinée chaque fois que possible.', en: 'Guinean laterite, stone, wood and bamboo wherever possible.' },
    },
    {
      title: { fr: 'Emplois locaux', en: 'Local jobs' },
      text: { fr: 'Artisans et techniciens recrutés près des chantiers.', en: 'Craftsmen and technicians hired near our sites.' },
    },
    {
      title: { fr: 'Formation des jeunes', en: 'Youth training' },
      text: { fr: 'Apprentissage sur chantier et en atelier.', en: 'Apprenticeships on site and in the workshop.' },
    },
  ],
}

export const pageSeeds = [
  {
    slug: 'mentions-legales',
    title: { fr: 'Mentions légales', en: 'Legal notice' },
    content: {
      fr: [
        '## Éditeur du site',
        'ARCHI-DESIGN Guinée SARL, Conakry, Guinée. RCCM et NIF : à compléter dans les réglages du site.',
        '## Hébergement',
        'À compléter lors de la mise en ligne.',
        '## Propriété intellectuelle',
        'Les textes, plans, photographies et visuels de ce site appartiennent à ARCHI-DESIGN Guinée SARL ou à leurs auteurs. Toute reproduction nécessite une autorisation écrite.',
      ],
      en: [
        '## Publisher',
        'ARCHI-DESIGN Guinea SARL, Conakry, Guinea. Company registration and tax numbers: to be completed in the site settings.',
        '## Hosting',
        'To be completed at launch.',
        '## Intellectual property',
        'Texts, plans, photographs and visuals on this site belong to ARCHI-DESIGN Guinea SARL or their authors. Any reproduction requires written permission.',
      ],
    },
  },
  {
    slug: 'confidentialite',
    title: { fr: 'Politique de confidentialité', en: 'Privacy policy' },
    content: {
      fr: [
        '## Données collectées',
        'Lorsque vous remplissez un formulaire, nous recevons votre nom, votre téléphone, votre ville, votre e-mail s’il est renseigné et votre message. Aucune donnée bancaire n’est collectée.',
        '## Utilisation',
        'Ces informations servent uniquement à répondre à votre demande et à suivre votre projet. Elles ne sont ni vendues ni cédées.',
        '## Conservation et droits',
        'Vous pouvez demander l’accès, la correction ou la suppression de vos données en nous écrivant à l’adresse indiquée sur la page Contact.',
      ],
      en: [
        '## Data collected',
        'When you fill in a form we receive your name, phone, city, e-mail if provided and your message. No banking data is collected.',
        '## Use',
        'This information is only used to answer your request and follow up on your project. It is neither sold nor shared.',
        '## Retention and rights',
        'You may request access, correction or deletion of your data by writing to the address on the Contact page.',
      ],
    },
  },
  {
    slug: 'cgv',
    title: { fr: 'Conditions générales de vente', en: 'Terms of sale' },
    content: {
      fr: [
        '## Commandes',
        'Les demandes envoyées depuis le site ne valent pas commande ferme : l’équipe confirme le prix et le délai avant toute réalisation.',
        '## Règlement',
        'Le site ne gère aucun paiement. Le règlement se fait directement avec l’entreprise : espèces, virement, mobile money, à la livraison ou sur place.',
        'Conditions détaillées à compléter.',
      ],
      en: [
        '## Orders',
        'Requests sent from the site are not binding orders: the team confirms price and lead time before any work.',
        '## Payment',
        'The site handles no payments. Payment is made directly with the company: cash, transfer, mobile money, on delivery or on site.',
        'Detailed terms to be completed.',
      ],
    },
  },
]
