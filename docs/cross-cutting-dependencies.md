# Cross-Cutting Dependency Audit

This document records the resolution status for the coding-practice feature extraction from WoHoTech.

## Destination resolutions

- Standalone Next.js root layout and styles are in the Problem repository; they do not import the WoHoTech site header/footer or assistant widgets.
- Feature-owned app routes, API handlers, UI components, core library, content, scripts, and judge Docker configuration have been transferred.
- The destination has its own package manifest and TypeScript/Next configuration.
- A dedicated Prisma schema and initial migration cover problems, examples, test cases, user progress, submissions, and notifications.
- Content validation, Prisma validation/generation, tests, type-check, production build, and judge smoke tests for JavaScript, Python, C++, and Java passed in CI.
- Required judge runtime settings are environment variables only; no production secrets were copied.

## Source cleanup

Feature-owned source path prefixes and judge deployment paths are absent from the current WoHoTech non-main cleanup branch. Identified residuals in the shared header icon, layout comment, and notification helper have been removed. Targeted scans of package scripts, Next config, sitemap/robots, header/footer, layout, Prisma schema, README and notification helper found no known feature-specific markers.

A repository-wide guard is now part of source CI and checks for feature-owned paths, route/import markers, judge service variables, and feature-only Prisma model/table names. The WoHoTech source CI is currently failing, so its guard result and overall cleanup are not yet certified green.

## Important safety constraints

- No migration was applied to the WoHoTech live database.
- No production database data was changed.
- WoHoTech `main` and Vercel deployment were not changed.
- Do not merge or deploy the source cleanup branch until its CI is green and the final diff is reviewed.
