# Extraction Inventory and Audit Checklist

> This is an evolving inventory. A checked source directory means it was located, not that every nested file has been copied or reviewed.

## Confirmed feature directories

- [x] `src/app/problems/`
- [x] `src/app/api/problems/`
- [x] `src/components/problems/`
- [x] `src/lib/problems/`
- [x] `src/content/problems/`
- [x] `scripts/problems/`
- [x] `docker/judge/` (directory referenced by discovered deployment files)
- [x] `docker-compose.judge.yml` (file referenced in search results)
- [ ] Enumerate every nested file and record source path, blob SHA, size and transfer status.
- [ ] Inspect root `package.json` scripts and dependencies.
- [ ] Inspect `next.config.ts`, TypeScript aliases and content loader configuration.
- [ ] Search global navigation/header/footer/sidebar for links to the feature.
- [ ] Search metadata, JSON-LD, sitemap generation, robots rules, canonical URLs and Open Graph content.
- [ ] Search tests, fixtures, Playwright flows, mocks and test scripts.
- [ ] Search CI workflows and deployment configs for judge/content jobs.
- [ ] Search environment variable names for judge endpoint, token, limits and fallback behavior.
- [ ] Inspect Prisma schema models/enums/indexes/relations used by submissions, progress, streaks, daily challenges or analytics.
- [ ] Inspect all related migrations and classify shared vs exclusively feature-owned schema.
- [ ] Search references to `/problems`, `api/problems`, `@/lib/problems`, `@/components/problems`, `src/content/problems`, `scripts/problems` and judge environment names throughout the repository.
- [ ] Record whether generic words such as “problem” occur in unrelated educational content; do not delete unrelated course/interview material by keyword alone.

## Initial files confirmed by GitHub source listings/search

- `src/app/problems/page.tsx`
- `src/app/problems/topics/page.tsx`
- `src/app/problems/topics/topics-hub.tsx`
- `src/app/problems/daily/page.tsx`
- `src/app/problems/study-plan/page.tsx`
- `src/app/problems/[slug]/problem-practice-workspace.tsx`
- `src/app/api/problems/route.ts`
- `src/app/api/problems/[slug]/judge/route.ts`
- `src/app/api/problems/recommendations/route.ts`
- `src/components/problems/problems-table.tsx`
- `src/components/problems/problems-toolbar.tsx`
- `src/components/problems/problems-sidebar.tsx`
- `src/lib/problems/bank.ts`
- `src/lib/problems/catalog.ts`
- `src/lib/problems/content-loader.ts`
- `src/lib/problems/topics.ts`
- `src/lib/problems/judge.ts`
- `src/lib/problems/judge-service-config.ts`
- `scripts/problems/load-structured-problems.mjs`
- `scripts/problems/judge-worker.mjs`
- `scripts/problems/judge-worker-direct.mjs`
- `scripts/problems/smoke-judge-service.mjs`
- `docker/judge/Dockerfile`
- `docker/judge/Dockerfile.render`
- `docker-compose.judge.yml`

The list above is deliberately not presented as exhaustive.

## Transfer ledger

Use one row per file, not one row per directory. Mark a file **transferred** only after comparing destination content to the source (preferably by Git blob SHA/content hash). Mark **verified** only after dependencies and tests are accounted for.

| Source path | Destination path | Source SHA | Transferred | Verified | Notes |
|---|---|---|---|---|---|
| Pending full enumeration | — | — | No | No | Do not remove source files yet |

## Evidence and branch safety

- Source discovery is being performed on `cleanup/remove-wohoplay`, not `main`.
- Destination writes belong on `extract/wohotech-problems`, not `main`.
- Do not change the live database or Vercel deployment as part of repository extraction.
- Never infer completion from a README or a branch existing.
