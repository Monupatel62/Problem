# WoHoTech Problem Section Removal — Status and Merge Gate

## Objective

Move the standalone coding-practice feature into `Monupatel62/Problem` and remove that feature from WoHoTech without deleting unrelated educational lessons or the independent `/code` editor/compiler.

## Destination transfer evidence

- Destination repository: [Monupatel62/Problem](https://github.com/Monupatel62/Problem)
- Destination branch: `extract/wohotech-problems`
- Structured content transfer: 694 files, previously verified against the audited source snapshot with 0 missing files and 0 Git blob SHA mismatches.
- Destination validation was recorded as passing for content validation, Prisma validation/generation, tests, TypeScript type-check, production build, and isolated judge smoke tests for JavaScript, Python, C++, and Java on commit `2e74f39614fc764b2442aa218187f3e167d3f06a`.
- See [transfer progress](transfer-progress.md), [extraction inventory](extraction-inventory.md), and [architecture](architecture.md) for details.

## WoHoTech cleanup review

- Cleanup PR: [WoHoTech PR #8](https://github.com/Monupatel62/WoHoTech/pull/8)
- Branch: `cleanup/remove-problem-section`
- Latest recorded head when this document was written: `dccebe455be2047d46786f483a382c310c54fac7`
- PR is open and unmerged. WoHoTech `main` must remain unchanged until all gates pass.
- The PR records removal of the feature routes, APIs, components, libraries, problem content, judge worker setup, and feature-specific scripts; it also records cross-cutting cleanup in navigation, metadata, package scripts, notifications, PWA configuration, assistant guidance, and Prisma.
- The independent `/code` editor/compiler is intended to remain available.

## Current blocker

GitHub Actions run [38753225328](https://github.com/Monupatel62/WoHoTech/actions/runs/38753225328) failed before usable job steps/logs were available. The GitHub UI reported that the job was not started because recent account payments failed or the spending limit needs to be increased. The owner has instructed that no payment be made.

Therefore:
- This failure does **not** establish that the code itself failed.
- It also does **not** establish that the code passed.
- Do not increase spending limits or make payments for this task.
- Use the local verification steps in [local-verification.md](local-verification.md) and record results against the exact branch commit.

## Required gates before merge or deployment

- [ ] Run install from the lockfile successfully.
- [ ] Prisma client generation succeeds.
- [ ] Prisma schema validation succeeds.
- [ ] TypeScript check succeeds.
- [ ] ESLint succeeds or every remaining issue is explicitly reviewed and documented.
- [ ] Relevant tests succeed with required environment variables configured.
- [ ] Production build succeeds.
- [ ] Re-scan the complete proposed diff for residual Problem feature imports, routes, API paths, navigation entries, schema models/relations, scripts, metadata, and configuration.
- [ ] Confirm no unrelated educational content was removed.
- [ ] Confirm the independent `/code` editor/compiler remains intact.
- [ ] Reconfirm destination content count and blob verification if source content changes.
- [ ] Review the latest PR head and ensure the checks apply to that exact SHA.

Until these gates are satisfied, keep PR #8 open and unmerged, do not deploy to Vercel, and do not apply any database migration to production.
