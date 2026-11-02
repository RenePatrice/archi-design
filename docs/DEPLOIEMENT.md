# Guide de mise en ligne

Deux hébergements sont prévus :

1. **Vercel + Neon** (mise en ligne rapide) ;
2. **serveur privé LWS** (bascule ultérieure, coût fixe, même fournisseur que la messagerie).

Le code est le même dans les deux cas : seules les variables d’environnement changent.

---

## 1. Vercel + Neon

### 1.1 Avant de commencer

- Compte **Vercel** relié à GitHub. L’offre gratuite *Hobby* est réservée à un usage **non commercial** : passer en **Pro** avant l’ouverture au public.
- Le dépôt `RenePatrice/archi-design` sur GitHub.

### 1.2 Créer le projet

1. Vercel › **Add New… › Project** › importer `archi-design`.
2. Framework : *Next.js* (détecté). Ne rien changer à la commande de build : Vercel lance automatiquement le script `vercel-build` du projet (migrations de la base, puis build).
3. **Ne pas cliquer sur Deploy tout de suite** : créer d’abord la base et le stockage (étapes suivantes), sinon le premier build échoue faute de base.

### 1.3 Base de données (Neon)

1. Dans le projet Vercel : **Storage › Create Database › Neon (Postgres)**.
2. Région : **Frankfurt (eu-central-1)**, la plus proche des fonctions Vercel de Paris (`cdg1`, fixé dans `vercel.json`).
3. Relier la base au projet : Vercel ajoute `DATABASE_URL` (et d’autres variables) automatiquement.

### 1.4 Stockage des fichiers (Vercel Blob)

1. **Storage › Create › Blob**, relier au projet.
2. Vercel ajoute `BLOB_READ_WRITE_TOKEN`. Dès qu’elle existe, photos, plans, maquettes et documents clients sont enregistrés dans Blob (le disque de Vercel est effacé à chaque déploiement).

### 1.5 Variables d’environnement

**Settings › Environment Variables** (environnements *Production* et *Preview*) :

| Variable | Valeur |
| --- | --- |
| `PAYLOAD_SECRET` | nouvelle chaîne aléatoire : `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` (ne **pas** réutiliser celle du développement) |
| `NEXT_PUBLIC_SITE_URL` | `https://archi-design.vercel.app` au début, puis `https://archidesignguinee.com` |
| `NEXT_PUBLIC_UPLOAD_FILE_MB` | `4` (limite de 4,5 Mo par requête sur Vercel) |
| `NEXT_PUBLIC_UPLOAD_TOTAL_MB` | `4` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | numéro WhatsApp, chiffres seulement (le back-office reste prioritaire) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `EMAIL_FROM_NAME` | paramètres de la messagerie LWS (voir README) |

`DATABASE_URL` et `BLOB_READ_WRITE_TOKEN` sont posées par Vercel aux étapes 1.3 et 1.4.

### 1.6 Premier déploiement

1. **Deployments › Redeploy** (ou un push sur `main`). Le journal doit afficher `Migrating: 20261102_070727_initial` puis le build.
2. Ouvrir `https://…vercel.app/admin` : l’écran *Créer le premier utilisateur* apparaît ; ce compte devient **administrateur**.
3. Back-office › *Réglages du site* : coordonnées, WhatsApp, boîte de réception par défaut, position GPS, RCCM, NIF.
4. Vérifier `https://…vercel.app/health` → `{"status":"ok","database":"ok"}`.

### 1.7 Remplir la base (contenu de départ)

La base Neon est vide après le premier déploiement. Pour y charger les modèles d’e-mail, les 8 pôles, la page À propos, les grilles du simulateur et de l’impression, les pages légales et **des exemples de chaque type de contenu** (réalisations, produits, formations, témoignages, équipe, partenaires, maquette 3D) :

1. Ouvrir le fichier **`.env.production.local`** à la racine du projet (il n’est jamais envoyé sur GitHub).
2. Y coller, depuis Vercel › *Settings › Environment Variables* (icône œil) : `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, et l’adresse du site dans `NEXT_PUBLIC_SITE_URL`.
3. Dans un terminal, à la racine du projet :

```bash
npm run seed:production
```

Le script refuse de démarrer s’il vise la base de votre ordinateur ou si le jeton Blob manque. Il ne crée **aucun compte** : l’administrateur se crée ensuite sur `/admin`. Il est relançable sans créer de doublons.

Si le script signale des tables absentes (premier déploiement non terminé) : `npm run migrate:production`, puis relancer le remplissage.

Les réalisations, produits, prix, témoignages, membres d’équipe et chiffres sont des **exemples fictifs** à remplacer avant l’ouverture au public (voir `docs/RECETTE.md`).

### 1.8 Nom de domaine

1. Vercel › **Settings › Domains** › ajouter `archidesignguinee.com` et `www.archidesignguinee.com`.
2. Dans la zone DNS (LWS ou Cloudflare), créer les enregistrements indiqués par Vercel (A `76.76.21.21` et CNAME `cname.vercel-dns.com`).
3. Mettre `NEXT_PUBLIC_SITE_URL=https://archidesignguinee.com` puis redéployer.
4. **Ne pas toucher aux enregistrements MX, SPF, DKIM** : ils servent à la messagerie LWS.

### 1.9 Mises à jour

Chaque push sur `main` déclenche un déploiement (migrations comprises). Une branche ou une *pull request* produit un **déploiement de prévisualisation** pour valider avant la production. GitHub Actions vérifie le code à chaque push (onglet *Actions*).

**Nouvelle collection ou nouveau champ** : en développement, `npm run migrate:create nom-du-changement`, puis committer le fichier de `src/migrations/`.

---

## 2. Serveur privé LWS (bascule)

### 2.1 Serveur

- VPS **Ubuntu 24.04 LTS**, 2 vCPU / 4 Go de RAM minimum.
- Installer : Node.js 22 (NodeSource), PostgreSQL 17, Caddy, PM2 (`npm i -g pm2`), git.

### 2.2 Base de données

```bash
sudo -u postgres psql -c "CREATE USER archi WITH PASSWORD 'mot-de-passe-fort';"
sudo -u postgres psql -c "CREATE DATABASE archi_design OWNER archi;"
```

Récupérer les données de Neon : `pg_dump "<URL Neon>" | psql "postgres://archi:…@127.0.0.1/archi_design"`.

### 2.3 Application

```bash
git clone https://github.com/RenePatrice/archi-design.git /srv/archi-design && cd /srv/archi-design
cp .env.example .env   # compléter : DATABASE_URL locale, PAYLOAD_SECRET (le même que sur Vercel), SMTP…
npm ci
npm run migrate
npm run build
pm2 start deploy/ecosystem.config.cjs && pm2 save && pm2 startup
```

Sur LWS, **ne pas** définir `BLOB_READ_WRITE_TOKEN` : les fichiers vont sur le disque (`media/`, `private-uploads/`). Les limites d’envoi peuvent remonter (`NEXT_PUBLIC_UPLOAD_FILE_MB=10`, `NEXT_PUBLIC_UPLOAD_TOTAL_MB=50`).

**Fichiers déjà dans Vercel Blob** : les télécharger (console Vercel › Storage › Blob, ou `npx vercel blob list`) dans `media/` et `private-uploads/`.

### 2.4 HTTPS

Copier `deploy/Caddyfile` dans `/etc/caddy/Caddyfile` (adapter le domaine), `sudo systemctl reload caddy`, puis pointer les enregistrements DNS A vers l’IP du VPS. Le certificat Let’s Encrypt est automatique.

### 2.5 Sauvegardes

Sauvegarde quotidienne chiffrée de la base et des fichiers (cron) :

```bash
0 3 * * * pg_dump -Fc archi_design | gpg --batch --symmetric --passphrase-file /root/.backup-pass > /backups/db-$(date +\%F).dump.gpg
0 3 * * * tar czf /backups/fichiers-$(date +\%F).tgz -C /srv/archi-design media private-uploads
```

…puis copie vers un stockage externe (rclone vers R2 ou un autre serveur) et suppression des sauvegardes de plus de 30 jours.

### 2.6 Mise à jour

```bash
cd /srv/archi-design && git pull && npm ci && npm run migrate && npm run build && pm2 reload archi-design
```

---

## 3. Surveillance

- **UptimeRobot** (gratuit) : surveiller `https://archidesignguinee.com/health` toutes les 5 minutes, alerte par e-mail et SMS.
- **Google Search Console** : soumettre `https://archidesignguinee.com/sitemap.xml`.
- **Google Business Profile** : créer la fiche de l’entreprise (recherches locales « architecte Conakry »).
