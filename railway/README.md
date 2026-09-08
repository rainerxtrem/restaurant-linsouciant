# Déploiement Railway + PostgreSQL

Le site tourne sur [Railway](https://railway.com) : un service **web** (image
Docker construite à partir du `Dockerfile` à la racine) + un plugin
**PostgreSQL**. La configuration de déploiement est dans `railway.json`
(racine) ; ce dossier ne contient que la documentation et le gabarit de
variables (`.env.railway.example`).

## 1. Créer le projet

```bash
npm i -g @railway/cli
railway login
railway init            # crée le projet
railway add --database postgres   # ajoute le plugin PostgreSQL
```

Dans l'interface Railway : **New → GitHub Repo** et sélectionner
`rainerxtrem/restaurant-linsouciant` pour le service web (déploiement auto à
chaque push sur `main`).

## 2. Variables d'environnement

Onglet **Variables** du service web — voir `railway/.env.railway.example`.
Points d'attention :

- `DATABASE_URL` : ne pas la saisir, la **référencer** :
  `${{Postgres.DATABASE_URL}}`.
- `AUTH_SECRET` : `openssl rand -base64 32`.
- `NEXTAUTH_URL` / `NEXT_PUBLIC_SITE_URL` : le domaine final
  (`https://restaurant-linsouciant.fr`).
- `STORAGE_DRIVER=s3` + identifiants **Cloudflare R2** : un volume Railway
  suffit pour un seul restaurant mais R2 est plus sûr (sauvegardes,
  redéploiements). Avec un volume : `STORAGE_DRIVER=local`,
  `LOCAL_STORAGE_DIR=/app/storage/uploads`, monter un volume sur
  `/app/storage`, et `NEXT_PUBLIC_MEDIA_BASE_URL=https://<domaine>/media`.
- Les variables `NEXT_PUBLIC_*` sont **injectées au build** : Railway les
  transmet automatiquement comme `--build-arg` (voir les `ARG` du
  `Dockerfile`). Après modification d'une de ces variables → **redéployer**.

## 3. Migrations & seed

Les migrations Prisma (`prisma migrate deploy`) sont appliquées
**automatiquement à chaque démarrage** du conteneur (voir
`docker-entrypoint.sh`). Le premier déploiement crée donc le schéma.

Le seed (compte admin + contenu du site) se lance **une seule fois**, à la
main :

```bash
railway run npm run db:seed
```

(pense à définir `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` avant.)

## 4. Domaine & webhook Stripe

- **Settings → Networking → Custom Domain** : ajouter
  `restaurant-linsouciant.fr` et suivre les enregistrements DNS proposés.
- **Stripe Dashboard → Developers → Webhooks → Add endpoint** :
  `https://restaurant-linsouciant.fr/api/webhooks/stripe`, événement
  `checkout.session.completed`. Copier le secret dans `STRIPE_WEBHOOK_SECRET`.

## 5. Tâches planifiées

Railway n'a pas de cron pour un service web toujours démarré : c'est
**GitHub Actions** qui appelle `POST /api/cron/gift-voucher-reminders` chaque
matin (voir `.github/workflows/gift-voucher-reminders.yml`). Renseigner le
secret GitHub `CRON_SECRET` (identique à la variable Railway) et
`SITE_URL`.

## 6. Déploiement continu

- Push sur `main` → Railway redéploie le service web (intégration GitHub
  native).
- `.github/workflows/ci.yml` valide chaque PR (typecheck, lint, tests,
  build, `prisma validate`).
- `.github/workflows/deploy.yml` applique `prisma migrate deploy` via la CLI
  Railway après un push sur `main` (nécessite le secret `RAILWAY_TOKEN`) —
  filet de sécurité en plus des migrations lancées par l'entrypoint.

## Santé

`GET /api/health` renvoie `200` si l'app répond et que la base est joignable
(`healthcheckPath` dans `railway.json`).
