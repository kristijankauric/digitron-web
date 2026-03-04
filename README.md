# Retrobit Eleventy

Static multilingual site built with Eleventy.

## Scope
- Active workspace: `!ELEVENTY/`
- Source of truth: `src/`
- Build output: `dist/`
- Do not modify legacy folders outside `!ELEVENTY`

## Project Rules
- Follow `AI_CONTRACT.md`, `ARCHITECTURE.md`, and `DECISIONS.md`.
- Keep templates data-driven (`src/_data/*`), avoid one-off hardcoded logic.
- AR layer is intentionally postponed for now.

## Development Workflow
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Production build: `npm run build`

## Output Policy (`dist`)
- `dist/` is generated output.
- `dist/` should not be edited manually.
- `dist/` is ignored in version control by default (see `.gitignore`).

## Current i18n Data
- `src/_data/i18n/hr.json`
- `src/_data/i18n/en.json`
- `src/_data/i18n/it.json`
