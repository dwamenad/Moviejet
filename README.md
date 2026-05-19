# Moviejet

Moviejet now ships as a split deployment:

- the repo root is the admin/backend app
- `apps/public-site` is the static public website

This keeps `moviejet.org` fast and static for visitors, while `admin.moviejet.org` handles logins, publishing, storage, and deploy-hook rebuilds.

## Screenshots

### Homepage

![Moviejet homepage](docs/screenshots/homepage.png)

### Story archive

![Moviejet story archive](docs/screenshots/archive.png)

### Admin dashboard

![Moviejet admin dashboard](docs/screenshots/admin.png)

## Stack

- Next.js App Router
- Tailwind CSS v4
- Postgres storage with a file-backed JSON fallback for local editing
- Cookie-based admin login with optional Google OAuth for content management
- Standalone Next.js output for the admin/backend app
- Static-export Next.js site for the public frontend

## Repo layout

- `src/*`: admin/backend application
- `src/app/api/public/content`: published-content JSON feed for the static site
- `apps/public-site/*`: static public site that builds from published content
- `scripts/export-public-content.ts`: writes a local snapshot for the static app

## Local setup

1. Copy `.env.example` to `.env`.
2. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (or `ADMIN_PASSWORD_HASH`), and `SESSION_SECRET`.
3. Optional: set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_ADMIN_EMAILS` if you want Google sign-in for admins.
4. Optional: set `DATABASE_URL` if you want local Postgres instead of the default file store.
5. Install backend dependencies:

```bash
npm install
```

6. Install public-site dependencies:

```bash
npm --prefix apps/public-site install
```

7. Seed starter content:

```bash
npm run content:seed
```

8. Export the initial public snapshot:

```bash
npm run content:export-public
```

9. Start the admin/backend app:

```bash
npm run dev
```

10. In another terminal, start the public site:

```bash
npm run public:dev
```

Local defaults:

- admin/backend: `http://localhost:3000`
- public site: `http://localhost:3001` if you run it that way in your host/dev workflow

The static app reads from `CONTENT_SOURCE_URL` when available, and falls back to `apps/public-site/content/published-content.json` for local builds.

## Production deploy

Production is now a two-app deployment.

### 1. Admin/backend app

The repo root remains a standard Node or Docker deployment.

Recommended target:

- Render web service
- custom domain: `admin.moviejet.org`
- managed Postgres for `DATABASE_URL`

### Required environment variables

- `ADMIN_EMAIL`
- `ADMIN_EMAILS` optional comma-separated password-login aliases
- `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH`
- `SESSION_SECRET`
- `GOOGLE_CLIENT_ID` optional
- `GOOGLE_CLIENT_SECRET` optional
- `GOOGLE_ADMIN_EMAILS` optional comma-separated Google admin allowlist
- `GOOGLE_OAUTH_REDIRECT_URI` optional override for the Google callback URL
- `GOOGLE_WORKSPACE_DOMAIN` optional Workspace domain hint/restriction
- `DATABASE_URL` recommended for production
- `DATA_DIR` optional and only used when `DATABASE_URL` is not set
- `PUBLIC_SITE_URL` recommended, for example `https://moviejet.org`
- `PUBLIC_SITE_DEPLOY_HOOK_URL` optional but recommended so publishes trigger a public rebuild
- `PUBLIC_CONTENT_SNAPSHOT_PATH` optional local snapshot target for dev tooling

### Build and run directly

```bash
npm ci
npm run build
npm run start
```

### Docker deploy

```bash
docker build -t moviejet .
docker run \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/moviejet" \
  -e ADMIN_EMAIL="admin@moviejet.org" \
  -e ADMIN_PASSWORD_HASH="replace-me" \
  -e SESSION_SECRET="replace-me" \
  moviejet
```

If you omit `DATABASE_URL`, mount a writable volume and keep using the local JSON store instead.

### Render deploy

This repo includes a Render Blueprint in `render.yaml` for the admin/backend service plus a managed Postgres database.

1. Push the latest repo contents to GitHub.
2. In Render, create a new Blueprint and select this repository.
3. Keep the included service settings:
   - web service name: `moviejet`
   - runtime: Docker
   - branch: `master`
   - health check: `/api/health`
   - managed Postgres database: `moviejet-db`
4. When Render prompts for environment variables, provide:
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD_HASH`
   - `PUBLIC_SITE_URL`
   - `PUBLIC_SITE_DEPLOY_HOOK_URL` once the public site deploy hook exists
5. Let Render generate `SESSION_SECRET` automatically.
6. Add the custom domain `admin.moviejet.org` in Render.
7. Update the `admin.moviejet.org` DNS records so they point to the Render service.

Important:

- On first boot with `DATABASE_URL`, the app creates the `posts` table automatically.
- If the database is empty, the app imports starter content from `data/posts.json`.
- Do not set `ADMIN_PASSWORD` in production if you already set `ADMIN_PASSWORD_HASH`.
- The admin app exposes published content at `/api/public/content` for the static site build.
- Story saves and deletes will call `PUBLIC_SITE_DEPLOY_HOOK_URL` when it is configured.

### 2. Public site

Deploy `apps/public-site` as a static site.

Recommended targets:

- Vercel
- Netlify
- Render Static Site
- Cloudflare Pages

Required environment variables for the public site:

- `CONTENT_SOURCE_URL=https://admin.moviejet.org`
- `CONTENT_SOURCE_STRICT=true` recommended in production
- `ADMIN_SITE_URL=https://admin.moviejet.org`

Build expectations for the public site:

- app root: `apps/public-site`
- build command: `npm ci && npm run build`
- publish/output directory: `out`

The public build fetches published content from `https://admin.moviejet.org/api/public/content` and writes static HTML for the homepage, archive, and story pages.

### Deploy hook flow

To make publishing automatic:

1. Create a deploy hook in your static host for `apps/public-site`.
2. Copy that hook URL into the admin/backend as `PUBLIC_SITE_DEPLOY_HOOK_URL`.
3. When an editor saves or deletes a story, the admin app triggers the hook.
4. The static host rebuilds `moviejet.org` from the latest published content feed.

### Password hashing

Use this to generate a production-safe admin password hash:

```bash
npm run password:hash -- "your-password-here"
```

Paste the resulting hash into Render as the value for `ADMIN_PASSWORD_HASH`.

### Google OAuth setup

To add Google sign-in for admin users:

1. In Google Cloud Console, create a Web application OAuth client.
2. Add these authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback`
   - `https://admin.moviejet.org/auth/google/callback`
3. Copy the client ID and client secret into:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
4. Set `GOOGLE_ADMIN_EMAILS` to the comma-separated Google accounts that should be allowed into `/admin`.
5. Optional: set `GOOGLE_WORKSPACE_DOMAIN` if you only want to allow users from a specific Google Workspace domain.

The password login can stay enabled as a fallback, or you can rely entirely on Google sign-in.

### Health check

- Health endpoint: `/api/health`

## DNS setup

After both services are live:

1. Point `admin.moviejet.org` to the Render admin/backend service.
2. Point `moviejet.org` and `www.moviejet.org` to the static public site host.
3. In HostGator, open `Domains -> moviejet.org -> DNS`.
4. Remove old website records for the root domain, `www`, and `admin` that still point to the previous hosting.
5. Remove conflicting `AAAA` records when your new host tells you to do so.
6. Add the new records from the two hosts, then save.
7. Verify `moviejet.org`, `www.moviejet.org`, and `admin.moviejet.org` in their respective dashboards once DNS propagates.

Keep existing mail-related records such as `MX`, `TXT`, `SPF`, or `DKIM` unless you are intentionally changing email service.

## Admin access

- Login page: `https://admin.moviejet.org/login`
- Admin dashboard: `https://admin.moviejet.org/admin`

The editor can:

- create new stories
- update story content
- publish or save drafts
- choose a homepage spotlight story
- mark stories as featured
- add a YouTube trailer link for the trailer block

Admin sign-in options:

- password login with `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH`
- Google OAuth with an email allowlist via `GOOGLE_ADMIN_EMAILS`

## Handoff notes

- The domain can be transferred separately from the codebase.
- The hosting account, domain registrar, and admin credentials should all end up under the final owner.
- For production, replace the plain `ADMIN_PASSWORD` with `ADMIN_PASSWORD_HASH`.
- Keep the admin/backend and public-site deployments separate so the visitor-facing site stays static.
- If publishing must appear instantly on `moviejet.org`, keep the static host deploy hook connected to `PUBLIC_SITE_DEPLOY_HOOK_URL`.
