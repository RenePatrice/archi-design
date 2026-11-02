/**
 * Contenu de la phase 3 : modèles d'e-mail (objets du cahier des charges, section 6.4),
 * tarifs d'impression, produits et formations de DÉMONSTRATION (prix fictifs, à remplacer).
 */
import type { RequestService } from '@/lib/requests/services'

type L = { fr: string; en: string }

const ack = (fr: string, en: string): L => ({ fr, en })
const delay48 = ack('Nous vous répondons sous 48 heures ouvrées.', 'We will reply within 2 working days.')
const outro = ack(
  'Merci de votre confiance,\nL’équipe ARCHI-DESIGN Guinée',
  'Thank you for your trust,\nThe ARCHI-DESIGN Guinea team',
)

type EmailTemplateSeed = {
  service: RequestService
  name: string
  subject: string
  intro: string
  ackSubject: L
  ackIntro: L
  ackDelay: L
}

const templates: EmailTemplateSeed[] = [
  {
    service: 'architecture',
    name: 'Architecture et design',
    subject: '[ARCHI-DESIGN] Demande de projet – {type}',
    intro: 'Nouvelle demande de projet. Rappeler le client pour fixer une première visite ou un rendez-vous.',
    ackSubject: ack('Votre projet {numero} est bien reçu', 'Your project {numero} has been received'),
    ackIntro: ack(
      'Bonjour {client},\n\nMerci d’avoir pensé à ARCHI-DESIGN pour votre projet. Un architecte étudie votre demande et vous contacte pour en parler et, si besoin, organiser une visite.',
      'Hello {client},\n\nThank you for considering ARCHI-DESIGN for your project. An architect is reviewing your request and will contact you to discuss it and, if needed, arrange a visit.',
    ),
    ackDelay: delay48,
  },
  {
    service: 'peinture',
    name: 'Peinture',
    subject: '[ARCHI-DESIGN] Devis peinture – {type}',
    intro: 'Nouvelle demande de devis peinture.',
    ackSubject: ack('Votre demande de devis peinture {numero}', 'Your painting quote request {numero}'),
    ackIntro: ack(
      'Bonjour {client},\n\nNous avons bien reçu votre demande de devis peinture. Notre chef d’équipe vous rappelle pour préciser les surfaces et, si nécessaire, passer voir les murs.',
      'Hello {client},\n\nWe have received your painting quote request. Our team leader will call you to confirm the areas and, if needed, come and see the walls.',
    ),
    ackDelay: delay48,
  },
  {
    service: 'calligraphie',
    name: 'Calligraphie',
    subject: '[ARCHI-DESIGN] Commande de calligraphie',
    intro: 'Nouvelle commande de calligraphie. Vérifier le texte avec le client avant tout tracé.',
    ackSubject: ack('Votre commande de calligraphie {numero}', 'Your calligraphy order {numero}'),
    ackIntro: ack(
      'Bonjour {client},\n\nNotre calligraphe a bien reçu votre commande. Nous vous recontactons pour valider le texte, le format et le style avant de commencer.',
      'Hello {client},\n\nOur calligrapher has received your order. We will contact you to confirm the text, size and style before starting.',
    ),
    ackDelay: delay48,
  },
  {
    service: 'serigraphie',
    name: 'Sérigraphie et impression',
    subject: '[ARCHI-DESIGN] Commande d’impression – {type}',
    intro: 'Nouvelle commande d’impression. Préparer le bon à tirer (BAT) et l’envoyer au client par e-mail ou WhatsApp.',
    ackSubject: ack('Votre commande d’impression {numero}', 'Your print order {numero}'),
    ackIntro: ack(
      'Bonjour {client},\n\nVotre commande d’impression est bien enregistrée. Nous vérifions votre fichier et vous envoyons un bon à tirer à valider avant impression. Le prix indiqué sur le site est confirmé à cette étape.',
      'Hello {client},\n\nYour print order has been registered. We are checking your file and will send you a proof to approve before printing. The price shown on the site is confirmed at that stage.',
    ),
    ackDelay: ack('Bon à tirer envoyé sous 24 à 48 heures ouvrées.', 'Proof sent within 1 to 2 working days.'),
  },
  {
    service: 'dessin',
    name: 'Dessin d’art',
    subject: '[ARCHI-DESIGN] Commande de dessin',
    intro: 'Nouvelle commande de dessin d’art.',
    ackSubject: ack('Votre commande de dessin {numero}', 'Your drawing order {numero}'),
    ackIntro: ack(
      'Bonjour {client},\n\nMerci pour votre commande. Notre dessinateur vous contacte pour confirmer le format, la technique et le délai.',
      'Hello {client},\n\nThank you for your order. Our artist will contact you to confirm size, technique and timing.',
    ),
    ackDelay: delay48,
  },
  {
    service: 'formation',
    name: 'Inscription formation',
    subject: '[ARCHI-DESIGN] Inscription – {formation}',
    intro: 'Nouvelle inscription. Confirmer la place et les modalités de règlement avec l’apprenant.',
    ackSubject: ack('Votre inscription {numero} est enregistrée', 'Your enrolment {numero} is registered'),
    ackIntro: ack(
      'Bonjour {client},\n\nVotre inscription à la formation « {formation} » est bien enregistrée. Nous vous appelons pour confirmer votre place. Le règlement se fait directement avec nous, sur place ou en plusieurs fois.',
      'Hello {client},\n\nYour enrolment in “{formation}” is registered. We will call you to confirm your seat. Payment is made directly with us, on site or in instalments.',
    ),
    ackDelay: delay48,
  },
  {
    service: 'boutique',
    name: 'Commande boutique',
    subject: '[ARCHI-DESIGN] Commande n° {numero}',
    intro: 'Nouvelle commande boutique. Vérifier le stock, confirmer prix et livraison avec le client.',
    ackSubject: ack('Votre commande {numero}', 'Your order {numero}'),
    ackIntro: ack(
      'Bonjour {client},\n\nNous avons bien reçu votre commande. Nous vérifions la disponibilité des produits et vous contactons pour confirmer le prix, la livraison ou le retrait. Aucun paiement n’est demandé en ligne.',
      'Hello {client},\n\nWe have received your order. We are checking product availability and will contact you to confirm price and delivery or pick-up. No online payment is required.',
    ),
    ackDelay: ack('Confirmation sous 24 heures ouvrées.', 'Confirmation within 1 working day.'),
  },
  {
    service: 'prestation',
    name: 'Prestation de services',
    subject: '[ARCHI-DESIGN] Demande de prestation – {type}',
    intro: 'Nouvelle demande de prestation (étude, suivi, conseil ou assistance).',
    ackSubject: ack('Votre demande {numero}', 'Your request {numero}'),
    ackIntro: ack(
      'Bonjour {client},\n\nNous avons bien reçu votre demande. Un responsable vous contacte pour en préciser le périmètre et vous proposer une offre.',
      'Hello {client},\n\nWe have received your request. A manager will contact you to define the scope and send you a proposal.',
    ),
    ackDelay: delay48,
  },
  {
    service: 'contact',
    name: 'Contact général',
    subject: '[ARCHI-DESIGN] Nouveau message',
    intro: 'Nouveau message reçu depuis la page Contact.',
    ackSubject: ack('Nous avons bien reçu votre message', 'We have received your message'),
    ackIntro: ack(
      'Bonjour {client},\n\nMerci pour votre message. Nous vous répondons rapidement.',
      'Hello {client},\n\nThank you for your message. We will get back to you shortly.',
    ),
    ackDelay: delay48,
  },
]

export const emailTemplateSeeds = templates.map((t) => ({ ...t, ackOutro: outro }))

/** Tarifs d'impression de démonstration (GNF). À ajuster dans « Tarifs impression ». */
export const printPricingSeed = [
  { key: 'textile', pricing: 'unit', price: 60_000, minQuantity: 10, setupFee: 150_000, discounts: [{ fromQuantity: 50, percent: 10 }, { fromQuantity: 200, percent: 20 }] },
  { key: 'affiche', pricing: 'area', price: 120_000, minQuantity: 1, setupFee: 0, discounts: [{ fromQuantity: 20, percent: 10 }] },
  { key: 'bache', pricing: 'area', price: 150_000, minQuantity: 1, setupFee: 0, discounts: [] },
  { key: 'carte', pricing: 'unit', price: 1_500, minQuantity: 100, setupFee: 0, discounts: [{ fromQuantity: 500, percent: 15 }] },
  { key: 'autocollant', pricing: 'area', price: 180_000, minQuantity: 1, setupFee: 0, discounts: [] },
  { key: 'cachet', pricing: 'unit', price: 250_000, minQuantity: 1, setupFee: 0, discounts: [] },
] as const

export const productSeeds: {
  reference: string
  slug: string
  category: 'peinture' | 'enduit' | 'materiel' | 'impression'
  name: L
  unit: L
  summary: L
  price: number
  stock: number
  colorHex?: string
}[] = [
  { reference: 'PEI-ACR-BLC-20', slug: 'peinture-acrylique-blanc-kaolin-20l', category: 'peinture', name: { fr: 'Peinture acrylique façade, blanc kaolin', en: 'Acrylic façade paint, kaolin white' }, unit: { fr: 'seau de 20 L', en: '20 L bucket' }, summary: { fr: 'Peinture microporeuse pour façades, résiste aux UV et à la pluie.', en: 'Breathable façade paint, UV and rain resistant.' }, price: 850_000, stock: 24, colorHex: '#F2F1EC' },
  { reference: 'PEI-ACR-OCR-20', slug: 'peinture-acrylique-ocre-laterite-20l', category: 'peinture', name: { fr: 'Peinture acrylique façade, ocre latérite', en: 'Acrylic façade paint, laterite ochre' }, unit: { fr: 'seau de 20 L', en: '20 L bucket' }, summary: { fr: 'La teinte terre rouge de nos chantiers.', en: 'The red-earth shade of our projects.' }, price: 920_000, stock: 12, colorHex: '#A0521E' },
  { reference: 'PEI-ACR-SAB-20', slug: 'peinture-acrylique-sable-20l', category: 'peinture', name: { fr: 'Peinture acrylique façade, sable', en: 'Acrylic façade paint, sand' }, unit: { fr: 'seau de 20 L', en: '20 L bucket' }, summary: { fr: 'Un beige chaud qui reste lumineux au soleil.', en: 'A warm beige that stays bright in the sun.' }, price: 900_000, stock: 8, colorHex: '#E0A46A' },
  { reference: 'PEI-INT-VFT-15', slug: 'peinture-interieure-vert-fouta-15l', category: 'peinture', name: { fr: 'Peinture intérieure mate, vert Fouta', en: 'Matt interior paint, Fouta green' }, unit: { fr: 'seau de 15 L', en: '15 L bucket' }, summary: { fr: 'Lessivable, faible odeur, pour pièces de vie.', en: 'Washable, low odour, for living spaces.' }, price: 640_000, stock: 0, colorHex: '#1F4A3A' },
  { reference: 'PEI-INT-IND-15', slug: 'peinture-interieure-indigo-15l', category: 'peinture', name: { fr: 'Peinture intérieure mate, indigo leppi', en: 'Matt interior paint, leppi indigo' }, unit: { fr: 'seau de 15 L', en: '15 L bucket' }, summary: { fr: 'Un bleu profond inspiré des pagnes de Labé.', en: 'A deep blue inspired by Labé cloth.' }, price: 680_000, stock: 6, colorHex: '#24305E' },
  { reference: 'END-CHX-25', slug: 'enduit-a-la-chaux-25kg', category: 'enduit', name: { fr: 'Enduit à la chaux', en: 'Lime render' }, unit: { fr: 'sac de 25 kg', en: '25 kg bag' }, summary: { fr: 'Enduit respirant pour murs en latérite ou en parpaing.', en: 'Breathable render for laterite or block walls.' }, price: 210_000, stock: 40 },
  { reference: 'END-LIS-25', slug: 'enduit-de-lissage-25kg', category: 'enduit', name: { fr: 'Enduit de lissage intérieur', en: 'Interior smoothing filler' }, unit: { fr: 'sac de 25 kg', en: '25 kg bag' }, summary: { fr: 'Pour une finition parfaitement lisse avant peinture.', en: 'For a perfectly smooth finish before painting.' }, price: 185_000, stock: 30 },
  { reference: 'MAT-ROU-230', slug: 'rouleau-peinture-230mm', category: 'materiel', name: { fr: 'Rouleau de peinture 230 mm', en: '230 mm paint roller' }, unit: { fr: 'pièce', en: 'piece' }, summary: { fr: 'Manchon microfibre pour peintures acryliques.', en: 'Microfibre sleeve for acrylic paints.' }, price: 45_000, stock: 60 },
  { reference: 'MAT-TRU-INOX', slug: 'truelle-inox', category: 'materiel', name: { fr: 'Truelle inox', en: 'Stainless trowel' }, unit: { fr: 'pièce', en: 'piece' }, summary: { fr: 'Pour enduits et finitions.', en: 'For renders and finishes.' }, price: 65_000, stock: 25 },
  { reference: 'MAT-BAC-20', slug: 'bache-de-protection-4x5', category: 'materiel', name: { fr: 'Bâche de protection 4 × 5 m', en: '4 × 5 m dust sheet' }, unit: { fr: 'pièce', en: 'piece' }, summary: { fr: 'Protège sols et meubles pendant les travaux.', en: 'Protects floors and furniture during works.' }, price: 55_000, stock: 18 },
  { reference: 'IMP-ENC-PLA-1', slug: 'encre-plastisol-1kg', category: 'impression', name: { fr: 'Encre plastisol sérigraphie', en: 'Plastisol screen ink' }, unit: { fr: 'pot de 1 kg', en: '1 kg tub' }, summary: { fr: 'Pour textile coton et polyester.', en: 'For cotton and polyester textiles.' }, price: 230_000, stock: 15 },
  { reference: 'IMP-ECR-43T', slug: 'ecran-serigraphie-43t', category: 'impression', name: { fr: 'Écran de sérigraphie 43T', en: '43T screen printing frame' }, unit: { fr: 'pièce', en: 'piece' }, summary: { fr: 'Cadre aluminium 40 × 50 cm, prêt à insoler.', en: 'Aluminium frame 40 × 50 cm, ready to expose.' }, price: 350_000, stock: 0 },
]

export const trainingSeeds: {
  slug: string
  title: L
  summary: L
  duration: L
  price: number | null
  level: 'debutant' | 'intermediaire' | 'avance' | 'tous'
  trainer: string
  program: L[]
  sessions: { inDays: number; lengthDays: number; seats: number }[]
}[] = [
  {
    slug: 'peinture-batiment-initiation',
    title: { fr: 'Peinture bâtiment : initiation', en: 'Building painting: introduction' },
    summary: { fr: 'Préparer un support, choisir les produits, peindre proprement un intérieur et une façade.', en: 'Prepare surfaces, choose products and paint an interior and façade cleanly.' },
    duration: { fr: '2 semaines (60 h)', en: '2 weeks (60 h)' },
    price: 1_500_000,
    level: 'debutant',
    trainer: 'Chef d’équipe peinture',
    program: [
      { fr: 'Diagnostic des murs et traitement de l’humidité', en: 'Wall survey and damp treatment' },
      { fr: 'Enduits et préparation des supports', en: 'Renders and surface preparation' },
      { fr: 'Application au rouleau et au pistolet', en: 'Roller and spray application' },
      { fr: 'Chantier pratique encadré', en: 'Supervised practical site' },
    ],
    sessions: [{ inDays: 30, lengthDays: 12, seats: 15 }, { inDays: 90, lengthDays: 12, seats: 15 }],
  },
  {
    slug: 'peinture-decorative',
    title: { fr: 'Peinture décorative et fresques', en: 'Decorative painting and murals' },
    summary: { fr: 'Effets de matière, patines, report de motifs et réalisation d’une fresque.', en: 'Textured effects, patinas, pattern transfer and painting a mural.' },
    duration: { fr: '3 semaines (90 h)', en: '3 weeks (90 h)' },
    price: 2_400_000,
    level: 'intermediaire',
    trainer: 'Peintre décorateur',
    program: [
      { fr: 'Couleurs et harmonies', en: 'Colour and harmony' },
      { fr: 'Effets de matière et patines', en: 'Textures and patinas' },
      { fr: 'Report de motifs du leppi et du bogolan', en: 'Transferring leppi and bogolan patterns' },
      { fr: 'Fresque collective', en: 'Group mural' },
    ],
    sessions: [{ inDays: 45, lengthDays: 18, seats: 10 }],
  },
  {
    slug: 'conception-architecturale-autocad',
    title: { fr: 'Conception architecturale et AutoCAD', en: 'Architectural design and AutoCAD' },
    summary: { fr: 'Lire et dessiner des plans de maison, du croquis au dossier de permis.', en: 'Read and draw house plans, from sketch to permit drawings.' },
    duration: { fr: '6 semaines (120 h)', en: '6 weeks (120 h)' },
    price: 3_500_000,
    level: 'debutant',
    trainer: 'Architecte',
    program: [
      { fr: 'Bases du dessin d’architecture', en: 'Architectural drawing basics' },
      { fr: 'AutoCAD : plans, coupes, façades', en: 'AutoCAD: plans, sections, elevations' },
      { fr: 'Architecture bioclimatique en climat tropical', en: 'Bioclimatic design in a tropical climate' },
      { fr: 'Projet final : une villa R+1', en: 'Final project: a two-storey villa' },
    ],
    sessions: [{ inDays: 21, lengthDays: 40, seats: 12 }],
  },
  {
    slug: 'sketchup-rendu-3d',
    title: { fr: 'SketchUp et rendu 3D', en: 'SketchUp and 3D rendering' },
    summary: { fr: 'Modéliser un projet et produire des images réalistes pour convaincre un client.', en: 'Model a project and produce realistic images to win clients.' },
    duration: { fr: '4 semaines (80 h)', en: '4 weeks (80 h)' },
    price: null,
    level: 'intermediaire',
    trainer: 'Architecte d’intérieur',
    program: [
      { fr: 'Modélisation SketchUp', en: 'SketchUp modelling' },
      { fr: 'Matériaux et éclairage', en: 'Materials and lighting' },
      { fr: 'Rendu photoréaliste', en: 'Photorealistic rendering' },
    ],
    sessions: [],
  },
]
