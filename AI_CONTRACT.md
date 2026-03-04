# AI_CONTRACT.md

## Purpose
This file defines non-negotiable rules for AI-assisted development.
If a rule is not written here, the AI is allowed to violate it.

All changes must comply with this contract.

---

## 1. Architectural Integrity

- No one-off fixes for specific pages, languages, or values.
- No hardcoded exceptions inside templates.
- If behavior changes, it must be implemented as a rule, not a special case.

Bad example:
if (page.slug === "digitron") { ... }

Good example:
Behavior driven by structured data (e.g. nav.json, ar_links.json).

---

## 2. Separation of Concerns

- Layout files must not contain business logic.
- Content files must not duplicate header or footer.
- Navigation must be generated from a single data source.
- AR URLs must never be hardcoded inside page templates.
- UI must not contain decision logic that belongs to data or architecture.

---

## 3. Language Structure Rules

- Language folders must mirror each other: /hr/, /en/, /it/
- Slugs should stay consistent across languages where possible.
- No conditional spaghetti inside templates for language switching.
- All shared labels must live in `_data/i18n/*.json`.

---

## 4. AR / QR Rules

- QR codes are static images stored in `/assets/qr/`.
- External AR links are stored only in `_data/ar_links.json`.
- Every QR block must include a visible clickable URL for accessibility.
- No AR logic inside random page files.

---

## 5. Styling Rules

- Do not regenerate or refactor existing Webflow classes.
- Existing Webflow CSS is treated as legacy styling reference.
- No CSS frameworks (Tailwind, Bootstrap, etc.).
- No inline styles unless explicitly approved.

---

## 6. JavaScript Rules

- Single JS entry file: `/assets/js/main.js`
- No global namespace pollution.
- JS is for enhancement only (nav toggle, lightbox, simple animation).
- No business rules implemented in JS.

---

## 7. Media Rules

- All media must be referenced via `/assets/...`
- No external CDN unless explicitly approved.
- All images require alt attributes.

---

## 8. Completion Requirements

Before considering a task complete:

- No broken links.
- No duplicated layout code.
- All changed files are in correct architectural layer.
- Build runs without errors.
- Diff is minimal and readable.
