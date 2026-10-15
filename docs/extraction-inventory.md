# Extraction Inventory and Audit Checklist

> Updated after destination CI passed. Source deletion is present only on the non-main WoHoTech cleanup branch; the branch is not ready to merge while its CI is failing.

## Source snapshot and transfer

- Source repository: `Monupatel62/WoHoTech`
- Source branch: `cleanup/remove-wohoplay`
- Audited source snapshot: `9fab984a6bf353d87dca9d04590cd9c75ba3c524`
- Destination repository: `Monupatel62/Problem`
- Destination branch: `extract/wohotech-problems`
- Original recursive source tree: 6,797 entries.
- Structured content under `src/content/problems/`: 694 files.
- Transfer verification: 694 source files and 694 destination files; 0 missing and 0 Git blob SHA mismatches against the audited snapshot.
- Validated destination commit: `6a2b3340ef71c3954aef413dabbef01476f49e12`.

## Feature-owned files transferred

| Source path | Audited file count | Destination state |
|---|---:|---|
| `src/app/problems/` | 12 | transferred |
| `src/app/api/problems/` | 14 | transferred |
| `src/components/problems/` | 20 | transferred |
| `src/lib/problems/` | 10 | transferred |
| `src/content/problems/` | 694 | transferred; SHA parity verified |
| `scripts/problems/` | 12 | transferred |
| `docker/judge/` | 3 | transferred |
| `docker-compose.judge.yml` | 1 | transferred |
| **Total in these groups** | **766** | transferred |

## Destination validation

- [x] Standalone package and Next.js app configuration added.
- [x] Dedicated Prisma schema and initial migration added for the extracted platform.
- [x] Structured content validation passed.
- [x] Prisma schema validation and client generation passed.
- [x] Automated tests passed.
- [x] TypeScript type-check passed.
- [x] Next.js production build passed.
- [x] Isolated judge service health check and JavaScript, Python, C++, and Java smoke tests passed.
- [ ] ESLint audit: attempted, but it fails on existing violations in extracted feature code and the shared `/code` runner (explicit `any`, React effect/ref rules, `prefer-const`, and unescaped entities). It is not a passing check.
- [ ] Full feature-level manual UI review is still needed before production deployment.

CI evidence: [build/typecheck](https://github.com/Monupatel62/Problem/actions/runs/38738315441) · [tests/judge smoke](https://github.com/Monupatel62/Problem/actions/runs/38738315380).

## Source removal and residual-reference checks

Feature-owned directories and judge deployment paths are absent from the current WoHoTech `cleanup/remove-wohoplay` tree. Targeted scans of package/config, header/footer, layout, sitemap/robots, Prisma schema, README, retired-module script and shared notification helper found no coding-practice route/model markers. A repository-wide extraction guard is now wired into source CI.

The WoHoTech branch CI is still red. The exact failing step has not been independently verified from the available run logs; do not attribute it to the extraction guard without evidence. Do not merge the branch until CI is green and the final diff is reviewed.

## Database and deployment boundary

The destination schema is independent. No migration has been run against WoHoTech's live database, no production database data was altered, and no Vercel deployment was triggered. Do not delete or alter any live data as part of repository extraction.
