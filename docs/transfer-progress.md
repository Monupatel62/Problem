# Problems Extraction — Transfer Progress

Last verified against source commit `9fab984a6bf353d87dca9d04590cd9c75ba3c524` on `cleanup/remove-wohoplay`.

## Destination status

- Working branch: `extract/wohotech-problems`
- 132 tracked files currently present.
- Feature implementation copied: 12 problem pages, 14 API routes, 20 UI components, 10 library modules, 12 scripts, 3 judge Docker files, and `docker-compose.judge.yml`.
- Structured problem content: 55 / 694 files transferred; 639 pending.
- Architecture, inventory, cross-cutting dependencies, source-removal gates, and README docs are present.
- No source files removed. No database, `main` branch, or Vercel deployment changed.

## Current blockers before source removal

1. Transfer and verify the remaining 639 structured content files.
2. Build the standalone Next.js app/package configuration without importing the entire WoHoTech root setup.
3. Resolve imports of shared UI/auth/database utilities and isolate required environment variables.
4. Review shared Prisma schema/migrations and plan an independent schema without touching production.
5. Transfer SEO/runtime configs and tests; remove WoHoTech branding/domain references where they should become independent.
6. Run content validator, typecheck, lint, tests, build and judge smoke tests in the destination.
7. Run a whole-source-reference scan and review a source-only removal diff.

**Status: in progress — not yet safe to remove the Problems section from WoHoTech.**
