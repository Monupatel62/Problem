# Source Removal Gates

Source deletion is prohibited until all gates below are satisfied. These gates apply to the coding-practice section being moved from WoHoTech into this repository.

## Gate 1 — Scope and dependency audit

- [ ] Enumerate every source file and nested content asset in the selected source branch.
- [ ] Trace every import from the feature to shared WoHoTech code.
- [ ] Find every incoming reference from outside the feature directories.
- [ ] Identify navigation, SEO, sitemap, metadata, tests, CI, package scripts, Docker and environment dependencies.
- [ ] Identify database models and migrations; document which are shared and which are feature-exclusive.
- [ ] Record source commit and file/blob SHAs.

## Gate 2 — Destination transfer

- [ ] Transfer the complete feature implementation and all content, assets, fixtures and scripts.
- [ ] Preserve licenses and source attribution where applicable.
- [ ] Rework imports/configuration only in separately reviewed commits.
- [ ] Do not copy secrets, production credentials, or local build outputs.
- [ ] Compare all source/destination files; no file may be silently omitted.
- [ ] Ensure the destination has its own package/configuration and documented environment variables.

## Gate 3 — Destination validation

- [ ] Install dependencies using the repository's chosen package manager.
- [ ] Typecheck and lint.
- [ ] Run unit/integration tests.
- [ ] Run production build.
- [ ] Test catalogue, topic filters, individual practice route, run/submit flows, daily challenge, progress, study plan, recommendations and analytics as applicable.
- [ ] Test judge service health and language execution using safe smoke tests.
- [ ] Verify authentication, validation, rate limits, timeouts, output limits and error handling.
- [ ] Verify no source-only aliases or missing shared imports remain.
- [ ] Confirm CI and security checks pass.

## Gate 4 — Source removal on a non-main branch

- [ ] Remove feature-owned files only after Gates 1–3 pass.
- [ ] Remove references from navigation, imports, metadata, sitemap, scripts and config.
- [ ] Remove only feature-exclusive database schema/migrations when safe; preserve shared schema and migration history unless explicitly proven removable.
- [ ] Search the entire source repository for route paths, import aliases, unique component/library names, environment names and judge worker names.
- [ ] Classify generic “problem” wording in unrelated educational material rather than deleting by broad text match.
- [ ] Run full source typecheck, lint, tests and production build.
- [ ] Confirm no dangling imports, broken links, stale sitemap entries or build tracing exclusions remain.

## Gate 5 — Review and deployment boundary

- [ ] Open a PR from the extraction branch for review.
- [ ] Wait for CI and security checks.
- [ ] Inspect the final diff and re-run the repository-wide search.
- [ ] Do not merge to `main`, alter the live database, or trigger Vercel deployment as part of this workflow without explicit authorization.
- [ ] Report exact counts and links for transferred files, removed files, remaining matches and checks.

## Current status

No gate is complete yet. Initial directory and representative-file discovery has begun; the destination contains an extraction README and these planning documents only. Do not interpret this documentation commit as a code transfer or as permission to delete source files.
