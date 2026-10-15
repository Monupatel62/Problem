# Problem

This repository is the destination for the coding-practice feature being extracted from WoHoTech.

**Current status: all 694 structured problem-content files are transferred and SHA-verified against the audited source snapshot. The standalone app/package setup, dependency isolation, tests and build validation are still pending. Nothing has been removed from WoHoTech.**

Source repository: [Monupatel62/WoHoTech](https://github.com/Monupatel62/WoHoTech), branch `cleanup/remove-wohoplay`  
Destination working branch: `extract/wohotech-problems`

## Extraction documents

- [Architecture and runtime map](docs/architecture.md)
- [Source inventory and transfer ledger](docs/extraction-inventory.md)
- [Mandatory source-removal gates](docs/source-removal-gates.md)

## Required workflow

1. Scan and enumerate the complete source feature, including nested content and assets.
2. Trace cross-directory imports, API dependencies, navigation, SEO, tests, CI, judge deployment and database references.
3. Transfer and compare every required file.
4. Run destination validation and security checks.
5. Only then remove feature-owned code from the non-main WoHoTech cleanup branch.
6. Re-scan the whole source repository and verify CI before proposing any merge.

The `main` branches, live database and Vercel deployment are outside this workflow. Do not delete source files while any transfer or validation gate is incomplete.
