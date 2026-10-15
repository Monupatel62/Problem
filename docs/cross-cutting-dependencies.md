# Cross-Cutting Dependencies Found During Repository Scan

> Source: `Monupatel62/WoHoTech`, branch `cleanup/remove-wohoplay`.
> This records confirmed search hits, not a completed exhaustive audit.

## Navigation and public discovery

- `src/components/layout/site-footer.tsx` contains a footer link labelled `Problems` pointing to `/problems`.
- `src/app/robots.ts` includes `/problems/` in a crawler allow-list.
- `src/app/sitemap.ts` must be inspected for dynamic catalogue/topic/problem URL generation.
- `src/app/site-map/page.tsx` mentions problems in the HTML sitemap description/content.
- `public/llms.txt` has a Coding Problems section and `https://wohotech.in/problems`.
- `public/llms-full.txt` describes 800+ coding-practice problems and the online judge.
- `scripts/verify-seo.mjs` explicitly checks the individual problem page path.
- Problem pages use dedicated metadata/SEO eligibility logic in `src/lib/problems/seo.ts` and `src/app/problems/[slug]/page.tsx`.

These files are outside the feature directories and must be reviewed when removing the feature. Keep unrelated sitemap/SEO behavior intact.

## Package and operational scripts

Search results confirm root `package.json` contains judge Docker lifecycle commands and a judge smoke-test command. The following scripts were located:

- `scripts/problems/load-structured-problems.mjs`
- `scripts/problems/verify.mjs`
- `scripts/problems/smoke-local-bank.mjs`
- `scripts/problems/sync-bank.mjs`
- `scripts/problems/seed.mjs`
- `scripts/problems/validate-content.mjs`
- `scripts/problems/smoke-judge-service.mjs`
- `scripts/problems/judge-worker.mjs`
- `scripts/problems/judge-worker-direct.mjs`

The content validator expects each structured problem to have `problem.mdx`, `metadata.json`, `hints.json`, `editorial.mdx` and `testcases.json`. Confirm all content files and any generated bank/catalogue artifacts are copied before source deletion.

## Judge service configuration

- `src/lib/problems/judge-service-config.ts` reads `JUDGE_SERVICE_URL`.
- Judge smoke scripts read `JUDGE_SERVICE_URL` and `JUDGE_SERVICE_TOKEN`.
- `src/lib/problems/judge.ts` uses judge configuration and persistence helpers.
- Docker-related files include `docker/judge/Dockerfile`, `docker/judge/Dockerfile.render`, and `docker-compose.judge.yml`.

Document required variables and limits from the full source before creating destination deployment configuration. Never copy real secret values.

## Database coupling — high risk

Search results show:

- `prisma/schema.prisma` includes relations named `problemStatuses` and `problemSubmissions`.
- The schema includes a `ProblemSubmission` model and related enums.
- Migration `prisma/migrations/20260513090000_add_problem_catalog/migration.sql` creates problem-case/submission status enums and submission storage.
- `src/lib/problems/service.ts` queries and creates problem submission records.
- `src/app/api/problems/[slug]/submissions/route.ts` reads/writes submission data.
- `src/app/api/problems/[slug]/submissions/[id]/route.ts` reads submission details.

The database schema is shared with the larger app and references users. Do not remove a migration, model, relation, or production data until all references are mapped and a separate schema/data migration plan is reviewed. Repository extraction by itself must not alter the live database.

## Next concrete work

1. Inspect and record full source directory listings, including pagination and nested problem content.
2. Read the service, schema, migrations and all API route implementations.
3. Search each unique dependency outside feature folders.
4. Add a row to the transfer ledger for every file and content asset.
5. Transfer files to this repository and verify them before opening source-removal changes.
