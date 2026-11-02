# Checklist de recette

À dérouler sur le site en ligne (préproduction Vercel, puis production) avant l’ouverture au public.
Cocher chaque ligne ; noter tout défaut avec la page, le téléphone utilisé et une capture.

## A. Contrôles automatiques (déjà en place)

| Contrôle | Commande | Attendu |
| --- | --- | --- |
| Lint, types | `npm run lint`, `npm run typecheck` | aucune erreur |
| Tests unitaires (28) | `npm run test:unit` | tous réussis |
| Tests de bout en bout (35) | `npm run test:e2e` (base remplie par `npm run seed`) | tous réussis |
| Build, migrations | GitHub Actions (onglet *Actions*) | coche verte |

## B. Critères d’acceptation du cahier des charges

- [ ] Toutes les pages du plan du site s’affichent et sont lisibles sur téléphone (Accueil, À propos, Services, Réalisations, Formations, Boutique, Impression, Simulateur, Blog *(non inclus, voir D)*, Espace client, Contact, pages légales).
- [ ] L’équipe ajoute, modifie et supprime **seule** un projet, un produit, une formation, sans aide technique.
- [ ] **Chaque formulaire** envoie le bon modèle d’e-mail à l’entreprise et l’accusé de réception au client : devis architecture, peinture, calligraphie, dessin, prestation, impression, boutique, inscription, simulateur, contact.
- [ ] Le bouton **« Envoyer aussi sur WhatsApp »** ouvre WhatsApp avec le récapitulatif pré-rempli.
- [ ] Le **simulateur** produit un PDF correct (montants, accents, coordonnées de l’entreprise).
- [ ] Une **commande boutique de test** arrive par e-mail avec les informations de la commande et du client, et apparaît dans *Commandes et demandes*.
- [ ] **Lighthouse mobile ≥ 90** (performance, accessibilité, bonnes pratiques, SEO) sur l’accueil, une page de service, le portfolio, une fiche projet et la boutique (Chrome › Outils de développement › Lighthouse › Mobile).
- [ ] Aucun défaut critique ou majeur ouvert.

## C. Mise en ligne (cahier des charges § 12.5)

- [ ] Domaine et HTTPS actifs, `www` redirige vers le domaine principal (ou l’inverse).
- [ ] Variables de production renseignées (voir `docs/DEPLOIEMENT.md`) ; `PAYLOAD_SECRET` différent du développement.
- [ ] Compte administrateur créé ; comptes de l’équipe créés avec le rôle *Équipe*.
- [ ] *Réglages du site* complets ; *Modèles d’e-mail* relus (objets, textes, adresses de réception).
- [ ] **Une commande de test par modèle d’e-mail** : e-mail reçu **en boîte de réception** (pas en spam) chez Gmail et Outlook, informations complètes, boutons « Répondre sur WhatsApp » et « Appeler » fonctionnels.
- [ ] SPF, DKIM et DMARC actifs pour le domaine (outil : mail-tester.com, score ≥ 9/10).
- [ ] Contenu de démonstration **remplacé ou supprimé** : réalisations, témoignages, équipe, partenaires, produits et prix, formations, grille du simulateur, tarifs d’impression, page Impact.
- [ ] `sitemap.xml` soumis à Google Search Console ; fiche Google Business Profile créée.
- [ ] `/health` surveillé par UptimeRobot.
- [ ] Sauvegardes vérifiées (Neon : historique de restauration ; LWS : restauration testée une fois).
- [ ] Formation de l’équipe au back-office (2 séances) et guide remis.

## D. Parcours à tester à la main (téléphone Android d’entrée de gamme, 3G)

- [ ] Accueil chargé en moins de 3 s ; les images apparaissent progressivement.
- [ ] Site installé sur l’écran d’accueil (menu du navigateur › *Ajouter à l’écran d’accueil*) ; réouvert **hors connexion** : pages déjà vues consultables, sinon page « Vous êtes hors ligne ».
- [ ] Formulaire coupé en cours de saisie (mode avion) puis rouvert : le brouillon est restauré.
- [ ] Panier conservé après fermeture du navigateur.
- [ ] Configurateur : photo du mur prise avec le téléphone, mur repeint en touchant l’écran.
- [ ] Maquette 3D : « Voir chez moi » ouvre la réalité augmentée (Android : Scene Viewer).
- [ ] Carte : déplacement à deux doigts, la page défile normalement avec un doigt.
- [ ] Espace client : connexion, photos de chantier, téléchargement d’un plan, envoi d’un message ; un autre client **ne voit pas** ce projet.
- [ ] Mot de passe oublié : e-mail reçu, lien valable, connexion automatique après changement.
- [ ] Bascule français / anglais sur chaque type de page ; e-mails reçus dans la langue du client.
- [ ] Mode sombre lisible partout.

## E. Hors périmètre de cette version

Fonctions du cahier des charges non livrées, à planifier :

- Blog / actualités / ressources ; recherche globale ; générateur de cartes de visite et cachets.
- Galerie « Identité guinéenne », fiches « Architecture bioclimatique », espace emploi et candidatures, portfolio d’artistes dédié.
- Visite virtuelle 360° (les maquettes 3D sont livrées).
- Anti-spam Cloudflare Turnstile (piège à robots et limitation par adresse IP en place) ; statistiques Umami ; Sentry.
- Double authentification des administrateurs.
