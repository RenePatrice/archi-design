# ARCHI-DESIGN Guinée — site web

Site bilingue (français / anglais) d’ARCHI-DESIGN Guinée SARL : Next.js 16, Payload CMS 3 (back-office intégré) et PostgreSQL.

## Prérequis

- Node.js 20.18 ou plus récent (testé avec 22.22)
- PostgreSQL 17, installé sur la machine **ou** lancé avec Docker (`docker compose up -d`, voir `docker-compose.yml`)

## Installation

```bash
npm install
cp .env.example .env        # puis compléter les valeurs (voir ci-dessous)
```

Dans `.env` :

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Connexion PostgreSQL, ex. `postgres://postgres:MOT_DE_PASSE@127.0.0.1:5432/archi_design` |
| `PAYLOAD_SECRET` | Chaîne aléatoire d’au moins 32 caractères |
| `NEXT_PUBLIC_SITE_URL` | Adresse publique du site, sans barre finale |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Numéro WhatsApp par défaut (chiffres, indicatif compris) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Premier compte administrateur |

Créer la base (une seule fois) :

```bash
"C:\Program Files\PostgreSQL\17\bin\createdb.exe" -U postgres archi_design
```

## Lancer le projet

```bash
npm run dev     # http://localhost:3000 (site) et http://localhost:3000/admin (back-office)
npm run seed    # crée l'administrateur et les réglages du site (relançable sans doublon)
```

En développement, Payload crée et met à jour les tables automatiquement.
Sans seed, le premier compte créé sur `/admin` devient administrateur.

## Commandes utiles

| Commande | Effet |
| --- | --- |
| `npm run build` puis `npm start` | Version de production |
| `npm run typecheck` / `npm run lint` | Vérification des types et du code |
| `npm run test:unit` | Tests unitaires (sans base) |
| `npm run test:int` | Tests d’intégration (base démarrée) |
| `npm run test:e2e` | Tests de bout en bout Playwright (`npx playwright install chromium` la première fois) |
| `npm run generate:types` | Régénère `src/payload-types.ts` après un changement de collection |
| `npm run migrate:create` / `npm run migrate` | Crée / applique les migrations de production |
| `npm run icons` | Régénère les icônes PWA (à relancer avec le vrai logo) |

## Organisation

```
src/
├── app/
│   ├── (site)/[locale]/   Pages publiques FR (/) et EN (/en)
│   ├── (payload)/         Back-office et API Payload (fichiers générés)
│   └── manifest.ts        Manifeste PWA
├── access/roles.ts        Rôles admin / équipe / client et règles d'accès
├── collections/           Utilisateurs, Médiathèque (et les suivantes)
├── globals/               Réglages du site (coordonnées, WhatsApp, horaires)
├── components/ui/         Design system : boutons, champs, cartes
├── components/layout/     En-tête, pied de page, langue, thème, WhatsApp
├── i18n/ + messages/      Traductions next-intl (fr.json, en.json)
├── lib/                   Utilitaires (liens wa.me, polices, réglages)
├── seed/                  Données initiales
└── proxy.ts               Détection de la langue
public/sw.js               Service worker (mode hors ligne)
```

## Contenu et back-office

Tout le contenu du site se modifie dans `/admin`, sans toucher au code :

| Rubrique du back-office | Ce qu’elle alimente |
| --- | --- |
| Pôles et services | Pages `/services/…`, chaîne de valeur, menu du pied de page, e-mail de réception par pôle |
| Réalisations | Portfolio `/realisations` (brouillon ou publié), projets phares de l’accueil |
| Témoignages, Équipe, Partenaires | Accueil et page « À propos » |
| Pages légales et textes | Mentions légales, confidentialité, CGV (adresse = slug, ex. `/cgv`) |
| Chiffres clés | Compteurs animés de l’accueil |
| Page « À propos » | Vision, mission, valeurs, histoire, engagements |
| Réglages du site | Coordonnées, WhatsApp, horaires, position GPS du siège, RCCM, NIF |
| Messages de contact | Messages reçus par le formulaire, avec statut |

| Commandes et demandes | Devis, commandes boutique, impressions, inscriptions : numéro AD-AAAA-NNNN, statut, fichiers joints, état des e-mails |
| Modèles d’e-mail | Objet et textes de chaque e-mail (un par service), adresses de réception, accusé de réception FR/EN |
| Produits | Boutique : prix indicatif, unité, stock, teinte, fiche technique |
| Formations, Sessions de formation | Catalogue, calendrier et formulaire d’inscription |
| Tarifs impression | Prix par support (à la pièce ou au m²), minimums, remises : calcul en direct sur `/impression` |

| Grille du simulateur | Prix au m² par type et finition, coefficients par zone : simulateur et PDF de pré-devis |
| Maquettes 3D | Fichiers `.glb` reliés à une réalisation (champ « Maquette 3D » de la fiche) |
| Page « Impact » | Indicateurs animés, récits de terrain |

`npm run seed` remplit un **contenu de démonstration** : 12 réalisations, témoignages, équipe et
partenaires **fictifs**, avec des visuels générés (« Visuel de démonstration »). Remplacez-les par
les vrais au fil de l’eau ; le seed ne recrée ni n’écrase jamais un élément existant.

Le site public se met à jour automatiquement dès qu’un contenu est enregistré.

## Commandes et e-mails (sans paiement en ligne)

Chaque formulaire (devis, impression, boutique, inscription, contact) suit le même parcours :

1. la demande est **enregistrée en base** avec un numéro (AD-2026-0001), avant tout envoi ;
2. l’**e-mail à l’entreprise** part vers les adresses du modèle du service (à défaut : « Boîte de réception par défaut » des réglages), avec boutons « Répondre sur WhatsApp » et « Appeler » et les fichiers joints ;
3. l’**accusé de réception** part au client s’il a donné son e-mail, dans sa langue ;
4. la page de confirmation propose **« Envoyer aussi sur WhatsApp »** (lien wa.me pré-rempli).

En cas d’échec, l’envoi est retenté 3 fois ; le résultat est visible dans l’onglet « Envoi des e-mails » de la demande.

### Messagerie LWS

Dans l’espace client LWS (Messagerie › configuration du client mail), relevez le serveur SMTP, puis dans `.env` :

```
SMTP_HOST=mail.votre-domaine.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=contact@votre-domaine.com
SMTP_PASS=mot-de-passe-de-la-boite
EMAIL_FROM=contact@votre-domaine.com
EMAIL_FROM_NAME=ARCHI-DESIGN Guinée
```

Port 587 : mettre `SMTP_SECURE=false`. Pour éviter les spams, vérifier dans la zone DNS LWS que **SPF, DKIM et DMARC** sont actifs pour le domaine.

**Sans `SMTP_HOST`** (développement), aucun e-mail ne part : chaque message est enregistré en HTML dans `.emails/` pour être ouvert dans un navigateur.

## Outils en ligne (phase 4)

| Page | Fonction |
| --- | --- |
| `/simulateur` | Fourchette de coût et de délai en direct ; PDF de pré-devis (`/pdf/pre-devis`) ; envoi à l’équipe avec le PDF joint |
| `/configurateur` | Teintes des peintures de la boutique sur une pièce type ou sur la photo du visiteur (traitée dans le navigateur, jamais envoyée) |
| Fiche projet | Maquette 3D (rotation, zoom, réalité augmentée), téléchargée seulement à la demande |
| `/realisations/carte` | Carte des réalisations (MapLibre + OpenFreeMap, gratuit et sans clé), chargée à la demande |
| `/impact` | Indicateurs du back-office en compteurs animés, réalisations par ville |

**Maquettes 3D** : exporter en `.glb` depuis SketchUp, Revit ou Blender, viser moins de 5 Mo (textures réduites, compression Draco), puis l’ajouter dans « Maquettes 3D » et la relier à la réalisation.

**Carte** : le « worker » de MapLibre est copié dans `public/vendor/` par `npm install` (script `postinstall`).

## Espace client (phase 5)

Le client suit son projet sur `/espace-client` : avancement, étapes, actualités et photos de chantier datées, documents (plans, devis, factures), messages avec l’équipe.

**Ouvrir l’espace d’un client** (back-office) :

1. *Utilisateurs* › créer le compte (rôle « Client », langue des e-mails) et lui communiquer son e-mail ; il choisit son mot de passe via « Mot de passe oublié ? » ;
2. *Projets suivis* › créer le projet, choisir le ou les clients, le responsable, les étapes et l’avancement ;
3. au fil du chantier : *Actualités de chantier* (texte + photos), *Documents clients* (plans, factures…), et réponses dans *Messages clients*.

Le client est prévenu par e-mail d’une nouvelle actualité, d’un document marqué « Prévenir le client » ou d’une réponse ; l’équipe (responsable du projet, sinon la boîte par défaut) est prévenue de chaque message du client.

**Sécurité** : un client ne voit que ses projets ; les fichiers sont privés (`private-uploads/client`) et vérifiés à chaque téléchargement ; un document peut rester interne (« Visible par le client » décoché) ; les pages de l’espace client ne sont jamais gardées en cache sur l’appareil.

Le seed crée un client de démonstration si `SEED_CLIENT_EMAIL` et `SEED_CLIENT_PASSWORD` sont renseignés dans `.env`.

## Mise en ligne

- **Guide pas à pas** (Vercel + Neon, puis serveur LWS) : [`docs/DEPLOIEMENT.md`](docs/DEPLOIEMENT.md)
- **Checklist de recette** : [`docs/RECETTE.md`](docs/RECETTE.md)
- Sur Vercel, le script `vercel-build` applique les migrations (`src/migrations/`) avant le build.
- Point de surveillance : `/health` (200 si le site et la base répondent).
- GitHub Actions (`.github/workflows/ci.yml`) vérifie migrations, lint, types, tests et build à chaque push.

## Charte graphique

Palette « Latérite & Leppi » et typographies (Archivo, Manrope, IBM Plex Mono), centralisées dans
`src/app/(site)/[locale]/globals.css`. Aperçu interne : `/design-system`.
Le logotype est provisoire (`src/components/layout/wordmark.tsx`) en attendant le logo officiel.

## Rôles

- **Administrateur** : tout, y compris les comptes et les réglages du site
- **Équipe** : contenus, médias et (phase 3) commandes
- **Client** : pas d’accès au back-office ; espace client à la phase 5
