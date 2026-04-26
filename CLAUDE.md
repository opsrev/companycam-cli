# CompanyCam CLI

## Quick Reference

- **Stack**: TypeScript, ESM, Commander.js, native fetch
- **Build**: `tsup` -> `dist/`
- **Test**: `vitest` with mocked fetch
- **Dev**: `npm run dev -- <args>` (reads `.env`)

## Architecture

- `src/config.ts` — API key resolution from flag or env var
- `src/api-client.ts` — Bearer-authenticated GET with 429 retry
- `src/api-helpers.ts` — page/per_page pagination helper
- `src/commands/projects.ts` — list, get, photos
- `src/index.ts` — Commander wiring

## Conventions

- All output: JSON to stdout, errors as `{"error": "..."}` to stderr
- ESM with `.js` extensions in imports (TypeScript NodeNext requirement)
- Tests colocated with source (`*.test.ts`)
- Env var: `COMPANYCAM_API_KEY`

## Commits

All commits MUST use [Conventional Commits](https://www.conventionalcommits.org/) format. release-please reads them to compute the next version.

Types:
- `feat:` — new feature (minor bump)
- `fix:` — bug fix (patch bump)
- `feat!:` or `BREAKING CHANGE:` — major bump
- `docs:`, `chore:`, `refactor:`, `test:` — no version bump
