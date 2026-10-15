# Source Removal Gates

## Current status

Destination validation passed on commit `2e74f39614fc764b2442aa218187f3e167d3f06a`: content validation, Prisma validation/generation, tests, type-check, production build, and four-language judge smoke tests. Feature-owned paths have been removed on WoHoTech's non-main `cleanup/remove-wohoplay` branch.

**The source branch is not merge-ready:** its CI remains failing. Keep WoHoTech `main`, the live database, and Vercel untouched until the source CI and final diff review pass.

## Gate 1 — Scope and transfer

- [x] Enumerate the feature-owned source path groups.
- [x] Transfer the app pages, API routes, UI components, core library, scripts, judge files, and content.
- [x] Verify all 694 structured content blobs against the audited source snapshot.
- [x] Add a standalone package/configuration and dedicated Prisma schema/migration.

## Gate 2 — Destination validation

- [x] Content validator.
- [x] Prisma schema validation and client generation.
- [x] Automated tests.
- [x] TypeScript type-check.
- [x] Production build.
- [x] Isolated judge service health check and JavaScript/Python/C++/Java smoke tests.
- [ ] Resolve ESLint errors and complete manual UI review.

## Gate 3 — Source cleanup

- [x] Remove feature-owned paths from the non-main source cleanup branch.
- [x] Remove identified references from shared header/layout and notification helper.
- [x] Confirm no direct feature-owned paths remain in the recursive source tree.
- [x] Add a whole-repository extraction guard to source CI.
- [ ] Confirm the extraction guard passes in CI.
- [ ] Confirm source typecheck, lint, tests, and build all pass.
- [ ] Review the final source diff and open a PR for review.

## Gate 4 — Production boundary

- [x] Keep WoHoTech `main` unchanged.
- [x] Keep the live database unchanged; no migration has been applied.
- [x] Keep Vercel deployment untouched.
- [ ] Do not merge or deploy until the source CI is green and the final diff has been reviewed.
