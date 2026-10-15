# Problem

Standalone coding-practice platform extracted from WoHoTech.

**Destination status:** all 694 structured problem-content files are transferred and SHA-verified against the audited source snapshot. The standalone Next.js app now passes content validation, Prisma validation and generation, tests, TypeScript type-check, production build, and isolated judge smoke tests for JavaScript, Python, C++, and Java.

- Destination branch: `extract/wohotech-problems`
- Latest validated commit: `6a2b3340ef71c3954aef413dabbef01476f49e12`
- [Production-build/typecheck CI](https://github.com/Monupatel62/Problem/actions/runs/38738315441)
- [Tests and four-language judge smoke CI](https://github.com/Monupatel62/Problem/actions/runs/38738315380)

A full ESLint run was attempted but did not pass: inherited lint errors remain in the extracted feature and the shared `/code` runner (notably explicit `any`, React effect/ref rules, and `prefer-const`). Lint is not a blocking CI step yet; this is recorded as remaining cleanup, not a pass.\n\nThe feature-owned source paths have been removed from the non-main WoHoTech branch `cleanup/remove-wohoplay`. Targeted checks of navigation, layout, sitemap/robots, package scripts, Prisma schema, and notification helpers found no remaining feature-specific references. A whole-repository source guard has also been added; **the WoHoTech cleanup branch CI is still failing, so the source branch is not merge-ready**.

## Extraction documents

- [Architecture and runtime map](docs/architecture.md)
- [Source inventory and transfer ledger](docs/extraction-inventory.md)
- [Cross-cutting dependency audit](docs/cross-cutting-dependencies.md)
- [Source-removal gates](docs/source-removal-gates.md)
- [Transfer progress](docs/transfer-progress.md)

## Safety boundary

All work is confined to non-main branches. WoHoTech `main`, the live database, and the Vercel deployment have not been changed. The standalone Prisma migration has **not** been applied to any live database. Do not merge the WoHoTech cleanup branch or deploy until its CI and final review pass.
