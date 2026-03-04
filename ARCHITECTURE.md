# ARCHITECTURE.md

## System Overview

Retrobit Exhibition Site is a static multilingual content site built with Eleventy (11ty).

The system is:

- Static (no backend)
- Content-driven
- Multilingual
- AR-linked via QR codes
- Media-heavy (images, audio, video)

Output: static files deployable to Netlify, Vercel, GitHub Pages, or any static host.

---

## Folder Structure

src/
  _includes/
    layouts/
    partials/
  _data/
  assets/
  hr/
  en/
  it/

dist/ (build output)

---

## Responsibility Boundaries

### Layout Layer

Location:
`_includes/layouts/` and `_includes/partials/`

Responsibilities:
- Header
- Footer
- Base HTML structure
- Shared scripts/styles

Must NOT:
- Contain language-specific business logic
- Contain hardcoded navigation
- Contain AR URLs

---

### Content Layer

Location:
`/hr/`, `/en/`, `/it/`

Responsibilities:
- Page-specific content
- Text, media blocks
- Structured metadata (frontmatter)

Must NOT:
- Duplicate header or footer
- Hardcode navigation logic
- Hardcode AR links

---

### Navigation

Location:
`_data/nav.json`

Responsibilities:
- Define menu structure
- Define ordering
- Define language labels

Templates render navigation dynamically from this file.

---

### Internationalization

Language-specific text labels:
`_data/i18n/*.json`

Language switching:
Folder-based structure (`/hr/`, `/en/`, `/it/`).

---

### AR Integration

AR link definitions:
`_data/ar_links.json`

QR images:
`/assets/qr/`

Templates:
Render QR blocks from data.
Never embed external AR URLs directly inside content.

---

### Media

All media:
`/assets/images/`
`/assets/audio/`
`/assets/video/`
`/assets/qr/`

Media must use relative paths:
`/assets/...`

---

### JavaScript

Single entry:
`/assets/js/main.js`

Responsibilities:
- Mobile nav toggle
- Simple animations
- Lightbox (if required)
- Accessibility enhancements

Must NOT:
- Contain domain logic
- Modify architecture dynamically

---

## Deployment Model

- Eleventy builds static files to `dist/`
- Hosting serves static files only
- No runtime server logic
