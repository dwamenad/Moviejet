# Moviejet

Moviejet is a Next.js editorial entertainment site with a lightweight backend for publishing stories, spotlighting featured posts, and handing day-to-day content updates to a non-technical editor.

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
- File-backed JSON content store for local editing
- Cookie-based admin login for content management
- Standalone Next.js output for Node/VPS deployment

## Local setup

1. Copy `.env.example` to `.env`.
2. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (or `ADMIN_PASSWORD_HASH`), and `SESSION_SECRET`.
3. Install dependencies:

```bash
npm install
```

4. Seed starter content:

```bash
npm run content:seed
```

5. Start the dev server:

```bash
npm run dev
```

## Production deploy

This app is now prepared for a standard Node.js or container deployment.

Important:

- It needs a host that can run a Node.js process.
- It needs a writable persistent filesystem for `data/posts.json`.
- Shared WordPress-only hosting is not enough for this build.

### Required environment variables

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH`
- `SESSION_SECRET`
- `DATA_DIR` optional, defaults to `./data`

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
  -e ADMIN_EMAIL="admin@moviejet.org" \
  -e ADMIN_PASSWORD_HASH="replace-me" \
  -e SESSION_SECRET="replace-me" \
  -v moviejet_data:/app/data \
  moviejet
```

### Render deploy

This repo now includes a Render Blueprint in `render.yaml` for a Docker-based web service with a persistent disk.

1. Push the latest repo contents to GitHub.
2. In Render, create a new Blueprint and select this repository.
3. Keep the included service settings:
   - web service name: `moviejet`
   - runtime: Docker
   - branch: `master`
   - health check: `/api/health`
   - persistent disk mount: `/app/data`
4. When Render prompts for environment variables, provide:
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD_HASH`
5. Let Render generate `SESSION_SECRET` automatically.
6. After the first successful deploy, add the custom domain `moviejet.org` in Render.
7. Update the `moviejet.org` DNS records in HostGator so they point to the Render service.

Important:

- Render persistent disks require a paid web service plan.
- This app stores content in `posts.json`, so the persistent disk is required.
- Do not set `ADMIN_PASSWORD` in production if you already set `ADMIN_PASSWORD_HASH`.

### Password hashing

Use this to generate a production-safe admin password hash:

```bash
npm run password:hash -- "your-password-here"
```

Paste the resulting hash into Render as the value for `ADMIN_PASSWORD_HASH`.

### Health check

- Health endpoint: `/api/health`

## Pointing `moviejet.org` to Render

After the Render service is live:

1. In Render, open the service and add the custom domain `moviejet.org`.
2. Copy the DNS records Render tells you to create.
3. In HostGator, open `Domains -> moviejet.org -> DNS`.
4. Remove old website records for the root domain and `www` that still point to the previous hosting.
5. Remove any `AAAA` records for `moviejet.org` and `www`.
6. Add the new records from Render, then save.
7. Return to Render and click Verify on the custom domain once DNS propagates.

Keep existing mail-related records such as `MX`, `TXT`, `SPF`, or `DKIM` unless you are intentionally changing email service.

## Admin access

- Login page: `/login`
- Admin dashboard: `/admin`

The editor can:

- create new stories
- update story content
- publish or save drafts
- choose a homepage spotlight story
- mark stories as featured
- add a YouTube trailer link for the trailer block

## Handoff notes

- The domain can be transferred separately from the codebase.
- The hosting account, domain registrar, and admin credentials should all end up under the final owner.
- For production, replace the plain `ADMIN_PASSWORD` with `ADMIN_PASSWORD_HASH` and move from file storage to a managed database if you need multiple editors or durable cloud hosting.
