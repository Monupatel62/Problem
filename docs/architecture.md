# Coding Practice Architecture

## Scope

The extracted Problem application contains:

- Catalogue, topic browsing, daily challenge, study plan, progress and recommendations.
- Per-problem practice workspace, editor, examples, test results and submissions.
- API handlers for catalogue, problem detail, judging, submissions, analytics, daily challenge, recommendations and topics.
- Structured problem content with metadata, hints, editorials, test cases and starter code.
- Judge client/configuration and an isolated Docker worker service.
- Dedicated Prisma schema and migration for problem data and progress.

## Runtime flow

1. The catalogue and topic pages load definitions from the problem bank/catalogue and structured content loader.
2. The practice workspace renders statement, examples, editor and run/submit controls.
3. API handlers validate request shape and size before dispatching judge work.
4. The judge client calls the configured judge service and receives test results.
5. Submission/progress paths persist through the standalone Prisma data layer when a database is configured.
6. Daily challenge, study plan, recommendations and analytics consume the same service layer.

## Validation status

The destination's content validation, Prisma validation/generation, automated tests, type-check, production build, and isolated judge smoke tests for JavaScript/Python/C++/Java passed on commit `6a2b3340ef71c3954aef413dabbef01476f49e12`. The ESLint audit currently fails on inherited lint violations in extracted feature code and the shared `/code` runner; manual UI review also remains.

## Separation and deployment

The destination app has its own package/configuration and Prisma schema. No source production secrets were copied and no migration was applied to a live database. The WoHoTech feature paths were removed only from non-main branch `cleanup/remove-wohoplay`; its CI remains failing, so do not merge or deploy yet.
