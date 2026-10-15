# Local Verification Without Paid GitHub Actions

## Why local verification is needed

The WoHoTech cleanup pull request is currently blocked before GitHub Actions starts a runner. The visible GitHub error says the job was not started because recent account payments failed or the spending limit needs to be increased. The repository owner has chosen not to make a payment, so do not raise the spending limit or make a payment just to run CI.

This is a runner/account restriction, not evidence that the source code itself failed a check. It also does not mean the code has passed.

## Requirements

- Git
- Node.js 22.x and npm 10+
- Internet access to install npm dependencies
- Sufficient disk space for the dependency tree and Next.js build
- Environment variables required by the project, where applicable

Run all commands from the WoHoTech cleanup branch checkout, not from `main`.

## Commands

Clone the proposed cleanup branch:

```bash
git clone --branch cleanup/remove-problem-section https://github.com/Monupatel62/WoHoTech.git
cd WoHoTech
```

Install exactly from the lockfile:

```bash
npm ci --legacy-peer-deps
```

Generate and validate Prisma:

```bash
npx prisma generate
npx prisma validate
```

Run static checks:

```bash
npx tsc --noEmit
npx eslint . --max-warnings 50
```

Run tests and production build:

```bash
npx jest --ci --passWithNoTests
npm run build
```

The test suite may require a valid `DATABASE_URL` and project-specific environment variables. Do not paste secrets into chat, commit them, or put them in shell history. If a command reports a missing environment variable, record the variable name only and configure a safe local value where appropriate.

## How to report results

- Record the exact command and whether it passed or failed.
- If it fails, capture the first actionable error and relevant stack trace.
- Do not call a check successful if it was skipped or never started.
- Fix failures on `cleanup/remove-problem-section`, rerun the affected check, and keep the result tied to the exact commit SHA.
- Run `npm run build` separately because the current CI workflow only runs its production-build job on a push to `main`, not on pull requests.
- Do not merge the cleanup PR or deploy to Vercel solely because local static checks pass. Review all results and the final diff first.

## Scope warning

This guide is for verification only. It does not authorize a merge, deployment, database migration, spending-limit increase, or payment.
