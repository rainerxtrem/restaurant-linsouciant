# Restaurant L'Insouciant — site web

Site vitrine bilingue (FR / EN) du restaurant **L'Insouciant**, 6-8 rue de la
Mission, 72000 Le Mans — chef Corentin Courtien.

Reprend l'intégralité du contenu de l'ancien site
[restaurant-linsouciant.fr](https://www.restaurant-linsouciant.fr/) (propulsé
par Zenchef) : accueil, cartes & menus, photos, accès & contact, pages
légales, réservation Zenchef, newsletter, bons cadeaux.

## Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router, React 19) |
| Base de données | PostgreSQL + Prisma 6 |
| i18n | `next-intl` — FR par défaut (`/menus`), EN préfixé (`/en/menus`) |
| Auth back-office | NextAuth (Auth.js) v5, identifiants + mot de passe |
| Emails | Resend (API HTTP) |
| Paiement bons cadeaux | Stripe Checkout + certificat PDF (pdfkit) |
| Réservation | Widget Zenchef |
| Styles | Tailwind CSS (palette encre / or / vin, Fraunces + Inter) |
| Hébergement | Railway + plugin PostgreSQL (voir `railway/`) |

## Développement local

Prérequis : Node ≥ 20, une base PostgreSQL (via Docker : `docker compose up -d db`).

```bash
cp .env.example .env          # ajuster DATABASE_URL, AUTH_SECRET…
npm install
npm run prisma:migrate        # applique les migrations
npm run db:seed               # compte admin + contenu du site
npm run dev                   # http://localhost:3000
```

Back-office : `http://localhost:3000/admin` (identifiants du seed :
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`).

## Scripts

| Script | Rôle |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` / `start` | build & serveur de production |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (config Next) |
| `npm run test` | Vitest |
| `npm run prisma:migrate` | migration de dev |
| `npm run prisma:deploy` | migration de prod (`migrate deploy`) |
| `npm run db:seed` | seed |
| `npm run prisma:studio` | explorateur de base |

## Structure

```
src/
  app/
    (site)/[locale]/      pages publiques bilingues
    (admin)/admin/        back-office (français, non indexé)
    api/                  webhooks Stripe, médias, cron, admin
  components/
    site/                 header, footer, formulaires, menus, horaires…
    admin/                éditeurs (menus, pages, réglages, galerie…)
    public/               composants réutilisables (reveal, lightbox, cookies)
  lib/
    services/             menu, gallery, page, newsletter, gift-voucher, settings
    i18n.ts               helper de contenu traduit (champs *En)
  i18n/                   routing / middleware next-intl
messages/                 chaînes d'UI fr.json / en.json
prisma/                   schéma + migrations + seed
railway/                  doc de déploiement + gabarit de variables
```

## Back-office (`/admin`)

Tableau de bord · **Cartes & menus** (formules, accords mets-vins, sections,
plats, FR + EN) · **Photos** (albums + médiathèque) · **Pages** (mentions
légales, confidentialité, cookies, accessibilité, CGV — éditeur riche) ·
**Messages** de contact · **Bons cadeaux** (création manuelle, statut, renvoi,
PDF, export CSV) · **Newsletter** (abonnés, export) · **Réglages**
(coordonnées, horaires, Zenchef, réseaux, mentions légales, images, SEO) ·
**Administrateurs** (super-admin uniquement).

## Déploiement

Voir [`railway/README.md`](railway/README.md). En résumé : service web
Dockerfile + plugin PostgreSQL, variables d'environnement listées dans
`railway/.env.railway.example`, migrations appliquées automatiquement au
démarrage (`docker-entrypoint.sh`), seed lancé une fois à la main.

## Contenu repris de l'ancien site

- **Menu Premier Pas** : mardi→vendredi midi — Entrée+Plat 32 €, Plat+Dessert
  32 €, Entrée+Plat+Dessert 38 €.
- **Menus Plaisir** : mercredi→samedi midi & soir — Balade de saison 4 plats
  75 €, Invitation au voyage 6 plats 98 €, accords mets-vins 30 / 36 / 42 €.
- **Horaires** : lundi & dimanche fermés · mardi 12h-14h · mer-sam 12h-14h &
  19h-21h30.
- **Photos** : les albums « Le Restaurant » et « Les Plats » sont créés vides
  — les images de l'ancien site sont hébergées sur le CDN Zenchef et doivent
  être ré-uploadées depuis `/admin/photos`.
