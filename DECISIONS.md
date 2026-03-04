# DECISIONS.md

## 2026-01 - Static Architecture

Chose Eleventy over React/NextJS to:

- Keep the site lightweight
- Avoid unnecessary runtime JS
- Minimize security surface
- Simplify long-term maintenance

---

## 2026-01 - Folder-Based Internationalization

Implemented multilingual structure using:

/hr/
/en/
/it/

Instead of runtime i18n library.

Reason:
- Cleaner SEO URLs
- Simpler mental model
- No client-side language routing

---

## 2026-01 - AR Hosted Externally

AR experiences are hosted externally (e.g., 8thWall).

Site responsibility:
- Provide QR codes
- Provide direct URL links
- No AR rendering logic hosted locally

---

## 2026-01 - Webflow CSS Preservation

Existing Webflow CSS is preserved as reference styling.

We do not regenerate or refactor Webflow classes unless explicitly requested.

Reason:
- Avoid breaking layout
- Reduce refactor risk
- Maintain visual consistency
