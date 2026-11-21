# WohoTech

WohoTech is a Next.js 16 + Prisma + PostgreSQL platform for engineering notes, coding tutorials, tools, and course catalog discovery.

## Project Planning

- Full execution roadmap: [ROADMAP.md](./ROADMAP.md)
- Phase-1 day plan: [PHASE-1.md](./PHASE-1.md)
- Day-1 live status: [DAY-1-STATUS.md](./DAY-1-STATUS.md)

## Requirements

- Node.js 20+
- npm 10+
- Docker Desktop (recommended for local PostgreSQL)

## Local Setup (Recommended)

From this directory (`technoteshub`):

```bash
npm install
docker start technoteshub-db || docker run --name technoteshub-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=technoteshub -p 5432:5432 -d postgres:16
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Daily Start Commands

```bash
docker start technoteshub-db
taskkill /F /IM node.exe 2>nul
if exist .next rmdir /s /q .next
npm run dev
```

## Environment

Default local `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/technoteshub?schema=public"
NEXTAUTH_SECRET="dev-only-change-this-secret"
NEXTAUTH_URL="http://localhost:3000"
```

Sarvam assistant env:

```env
SARVAM_API_KEY="your-sarvam-api-key"
SARVAM_CREDITS_URL="https://dashboard.sarvam.ai/pricing"
```

- Assistant endpoint: `/api/assistant/sarvam-chat`
- UI: global right-side panel with fullscreen support (mobile opens fullscreen)

Multi-provider AI router env (optional):

```env
GROQ_API_KEY=""
GEMINI_API_KEY=""
COHERE_API_KEY=""
HUGGINGFACE_API_KEY=""
OPENROUTER_API_KEY=""
TAVILY_API_KEY=""
JINA_API_KEY=""
```

- Unified endpoint: `/api/assistant/chat`
- Modes: `auto`, `fast`, `smart`, `rag`, `fallback`
- Extra endpoints:
  - `/api/assistant/pdf-qa`
  - `/api/assistant/math`
  - `/api/assistant/web-search`

## Troubleshooting

### `P1001: Can't reach database server at localhost:5432`

- Ensure Docker Desktop engine is running.
- Start DB container:

```bash
docker start technoteshub-db
```

### `Unable to acquire lock at .next/dev/lock` or port conflict

- Stop existing Node dev processes and clear `.next`:

```bash
taskkill /F /IM node.exe
if exist .next rmdir /s /q .next
npm run dev
```

### `No categories available yet`

- DB is empty or seed not run. Execute:

```bash
npx prisma migrate dev --name init
npm run prisma:seed
```

## Useful Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run Prisma migrations
- `npm run prisma:seed` - Seed initial data

## Production Deployment Checklist

1. Set production env values:

```env
DATABASE_URL="your-neon-pooled-url"
NEXTAUTH_SECRET="strong-random-secret"
NEXTAUTH_URL="https://your-domain.com"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
GOOGLE_SITE_VERIFICATION="google-site-verification-token"
NEXT_PUBLIC_ADSENSE_CLIENT="ca-pub-xxxxxxxxxxxxxxxx"
NEXT_PUBLIC_ADSENSE_HOME_SLOT="1234567890"
NEXT_PUBLIC_ADSENSE_NOTES_SLOT="1234567890"
NEXT_PUBLIC_ADSENSE_CODING_SLOT="1234567890"
NEXT_PUBLIC_ADSENSE_TOOLS_SLOT="1234567890"
ADS_TXT_ENTRY="google.com, pub-xxxxxxxxxxxxxxxx, DIRECT, f08c47fec0942fa0"
```

2. Run deploy-time DB tasks:

```bash
npm run prisma:deploy
npx prisma generate
```

3. Build and verify:

```bash
npm run deploy:check
```

4. Verify endpoints after deploy:
- `/robots.txt`
- `/sitemap.xml`
- `/ads.txt`
- `/api/subjects?category=ug&page=1&pageSize=12`
- `/api/assistant/important-topics`

## Current Catalog Runtime Note

- If `Course/CourseCategory/CourseCohort` models are not present in Prisma client, app automatically serves a full fallback catalog parsed from `prisma/seed.mjs`.
- This keeps `/subjects` and `/subjects/[slug]` deploy-safe even before DB schema alignment.
- `npm run prisma:seed` currently depends on legacy schema fields and may fail unless your schema matches `prisma/seed.mjs`.

## One-Click Deploy

Replace `<YOUR_GITHUB_REPO_URL>` with your public GitHub repo URL.

### Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=<YOUR_GITHUB_REPO_URL>)

Files included:
- `railway.toml` (build/start/healthcheck)
- `.env.production.example` (copy required envs to Railway Variables)

Deployment note:
- `npm run prisma:deploy` safely baselines an already-existing production database the first time it sees tables without Prisma migration history, then falls back to normal `prisma migrate deploy` on later releases.

### Required Deploy Env (quick start)

At minimum set these in production:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_SITE_URL`
- `AUTH_SECRET`
- OAuth keys if using social login:
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

## Google Search Console + AdSense Setup

1. Add your production domain property in Search Console.
2. Put Search Console token in `GOOGLE_SITE_VERIFICATION`.
3. Submit `https://your-domain.com/sitemap.xml`.
4. Create AdSense site and ad units.
5. Put `NEXT_PUBLIC_ADSENSE_CLIENT` and all slot IDs in production env.
6. Put publisher line in `ADS_TXT_ENTRY` so `https://your-domain.com/ads.txt` resolves correctly.
