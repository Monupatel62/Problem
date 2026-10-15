# Coding Practice Architecture

> Status: discovery document, not proof of a completed migration.
> Source branch inspected: `Monupatel62/WoHoTech` → `cleanup/remove-wohoplay`.
> Destination working branch: `extract/wohotech-problems`.

## Scope discovered

The feature is a full coding-practice product, not just one page. It includes:

- Problem catalogue and structured problem content.
- Topic browsing, daily challenge, study plan, progress, analytics and recommendations.
- Per-problem practice workspace and code editor.
- API handlers for catalogue, problem details, judging, submissions, analytics, daily challenge and recommendations.
- Judge service configuration, judge client/dispatcher and worker programs.
- Scripts for loading structured content, adding problem batches and smoke-testing the judge service.
- Docker/judge deployment files and related environment configuration.
- Prisma schema/migration references and any user-progress/submission persistence used by the feature.
- Navigation, metadata, structured data, sitemap/robots rules, internal links, tests and package scripts that reference these paths.

## Source locations confirmed

| Area | Source location | Notes |
|---|---|---|
| Main page | `src/app/problems/page.tsx` | Landing/catalogue page and metadata |
| Topic page | `src/app/problems/topics/` | Topic browser |
| Daily page | `src/app/problems/daily/` | Daily challenge |
| Study plan | `src/app/problems/study-plan/` | Study plan |
| Practice workspace | `src/app/problems/[slug]/` | Problem-specific practice experience |
| API | `src/app/api/problems/` | Multiple endpoint families |
| UI components | `src/components/problems/` | Editor, table, sidebar, progress and challenge UI |
| Core library | `src/lib/problems/` | Bank, catalogue, content loader, topics, services and judge |
| Structured content | `src/content/problems/` | Topic folders and problem content |
| Scripts | `scripts/problems/` | Content generation/loading and judge checks |
| Judge deployment | `docker/judge/`, `docker-compose.judge.yml` | Worker/container configuration; confirm exact current files before moving |
| Database | `prisma/schema.prisma`, `prisma/migrations/` | Must inspect references before deciding what is feature-owned |

## Runtime flow (to verify against full source)

1. A visitor opens the catalogue or a topic route.
2. Page/server code loads definitions from the problem bank/catalogue and structured content loader.
3. The practice workspace renders the statement, examples, editor and test/submit controls.
4. The API validates request shape, size, authentication and rate/abuse limits as applicable.
5. The judge client invokes the configured judge service or documented fallback.
6. The result is returned to the UI; authenticated submission/progress/analytics paths may persist user-specific data.
7. Daily challenge, recommendations, study plan and progress screens use the related service/API paths.

This flow is an architectural hypothesis based on discovered paths. Inspect the actual implementations and tests before treating every step as confirmed.

## Critical extraction rule

Do not copy only `src/app/problems`. The section has transitive dependencies outside that directory. Trace imports, route handlers, shared components, libraries, package scripts, environment variables, database models/migrations, content loaders, SEO, tests and deployment files before removing anything from the source.

## Next discovery tasks

- Build a complete path inventory from the source branch, including nested directories.
- Read every first-party file in the feature's direct directories.
- Search imports and references outside those directories.
- Classify each dependency as feature-owned, shared, or unrelated.
- Document each database model and migration dependency; never delete shared production data.
- Transfer source files unchanged before refactoring, retaining source paths where practical.
- Run destination build/tests and judge smoke tests before source deletion.
