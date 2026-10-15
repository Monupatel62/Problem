# Extraction Inventory and Audit Checklist

> Live ledger for the WoHoTech Problems extraction. Counts are branch-specific snapshots; transfer is not yet complete.

## Source snapshot

- Source repository: `Monupatel62/WoHoTech`
- Source branch: `cleanup/remove-wohoplay`
- Audited source commit: `9fab984a6bf353d87dca9d04590cd9c75ba3c524`
- Destination repository: `Monupatel62/Problem`
- Destination branch: `extract/wohotech-problems`
- Source recursive tree: 6,797 entries, not truncated.
- Confirmed source files under `src/content/problems/`: 694 files, about 340 KB.
- Destination currently has 55 of those 694 structured-content files (first four dozen-plus files by path order); **639 remain**.
- Destination branch currently contains 132 tracked files across documentation and copied feature code. This is a partial transfer, not a runnable/release-ready extraction.

## Confirmed source inventory

| Source path prefix | Source files | Bytes (approx.) | Destination state |
|---|---:|---:|---|
| `src/app/problems/` | 12 | 102,304 | 12 transferred |
| `src/app/api/problems/` | 14 | 26,930 | 14 transferred |
| `src/components/problems/` | 20 | 163,948 | 20 transferred |
| `src/lib/problems/` | 10 | 693,708 | 10 transferred |
| `src/content/problems/` | 694 | 340,526 | 55 transferred; 639 pending |
| `scripts/problems/` | 12 | 196,857 | 12 transferred |
| `docker/judge/` | 3 | 2,525 | 3 transferred |
| `docker-compose.judge.yml` | 1 | 1,315 | transferred |
| **Total in these feature-owned groups** | **766** | — | **Partial** |

The inventory excludes cross-cutting references and shared database/config files, which are tracked separately below. Source tree sizes may differ slightly from fetched text byte lengths because GitHub reports stored file sizes.

## Cross-cutting dependencies that still need handling

- [ ] Root `package.json`: extract only necessary dependencies/scripts; do not copy the entire WoHoTech package setup blindly.
- [ ] Next.js configuration, TypeScript path aliases, MDX loader and runtime dependencies.
- [ ] Shared UI primitives and imported components outside `src/components/problems/`.
- [ ] Global navigation/footer/sidebar references to `/problems`.
- [ ] SEO metadata, JSON-LD, sitemap, robots rules, canonical URLs, `public/llms.txt`, `public/llms-full.txt`, and `scripts/verify-seo.mjs`.
- [ ] CI workflows and deployment configs for judge/content jobs.
- [ ] Environment variable names for judge endpoint/token, limits, fallback behavior and safe configuration. Never copy actual secrets.
- [ ] Prisma models/enums/indexes/relations used by submissions, progress, favorites, streaks, daily challenges and analytics.
- [ ] Migrations `20260513090000_add_problem_catalog` and `20260518090000_add_problem_submission_test_results`; classify shared vs feature-only schema before changing anything.
- [ ] Tests, fixtures, mocks, Playwright flows and package scripts.
- [ ] Repository-wide references to `/problems`, `api/problems`, `@/lib/problems`, `@/components/problems`, `src/content/problems`, `scripts/problems` and judge environment names.
- [ ] Verify whether generic uses of “problem” refer to unrelated content; never delete unrelated material by keyword alone.

## Content contract

Structured problem folders use the format documented by `src/content/problems/README.md`:
`problem.mdx`, `metadata.json`, `hints.json`, `editorial.mdx`, `testcases.json`, and optional language starter-code files. The validator `scripts/problems/validate-content.mjs` must be run against the complete transferred tree before considering content complete.

## Verification gates

- [ ] Finish transferring all 694 structured content files and compare destination file contents against the source.
- [ ] Create a standalone app/package setup for the extracted repository.
- [ ] Resolve imports outside the copied feature and decide whether to copy, replace, or remove each dependency.
- [ ] Extract only required database schema into a dedicated schema/migration plan; do not apply migrations to the live DB.
- [ ] Run content validation, typecheck, lint, tests, build, and judge smoke tests in the destination repo.
- [ ] Search the source branch for all direct and indirect references, including SEO, sitemap, navigation, scripts, config, schema and tests.
- [ ] Review a source-removal diff only after destination parity and validation pass.
- [ ] Do not delete source files until every relevant gate is verified.

## Branch and production safety

- Source discovery is on `cleanup/remove-wohoplay`, not `main`.
- Destination writes are on `extract/wohotech-problems`, not `main`.
- No source files have been deleted as part of this extraction.
- Do not change the live database, merge to `main`, or deploy to Vercel as part of this work without explicit approval.
