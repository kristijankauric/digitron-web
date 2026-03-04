# PROJECT_HANDOVER.md

## Svrha
Ovaj dokument je kratki onboarding za novi Codex chat.
Daj ga kao prvi kontekst kad kreneš raditi dalje u `!ELEVENTY`.

---

## 1) Što je bio cilj
- Presložiti legacy Webflow eksport u održivu strukturu.
- Pripremiti projekt za više jezika (HR, EN, IT).
- Izvući shared dijelove (header/footer/nav) na jedno mjesto.
- Stabilizirati lokalne assete (slike/audio/font) i Eleventy build.

---

## 2) Gdje je sada source of truth
- Aktivni projekt: `!ELEVENTY/`
- Eleventy input: `!ELEVENTY/src/`
- Eleventy output: `!ELEVENTY/dist/`
- Legacy materijali postoje izvan `!ELEVENTY`, ali više nisu radni source.

---

## 3) Što je već odrađeno

### Arhitektura i templating
- Uveden Eleventy projekt u podfolderu `!ELEVENTY`.
- Header i footer izvučeni u partiale:
  - `src/_includes/partials/header.njk`
  - `src/_includes/partials/footer.njk`
- Glavni layout:
  - `src/_includes/layouts/base.njk`
- Stranice koriste layout umjesto dupliranog markup-a.

### Navigacija i sadržaj
- Navigacija centralizirana u:
  - `src/_data/nav.json`
- Menu nazivi promijenjeni:
  - "Razvoj strojeva za računanje" -> "Povijest računanja"
  - "Razni kalkulatori i njihove priče" -> "Svijet kalkulatora"
- URL-ovi stabilizirani na folder/index model (`/.../slug/`).

### i18n
- Uveden i18n data sloj za HR:
  - `src/_data/i18n/hr.json`
- Header/footer čitaju shared HR labele iz i18n (nema više hardcodea za te labele).

### Asseti i media
- Projekt radi s lokalnim assetima kroz `/assets/...`.
- Audio je prebačen na lokalni source (`/assets/audio/hr/...`) gdje je mapirano.
- Zamijenjeni logo elementi na `Digitron.Buje` (header + footer).
- Uklonjen EU logo iz headera po zahtjevu.

### UI i behavior popravci
- Popravljano ponašanje dropdown menija (single-open hover/focus behavior).
- Podešeno pozicioniranje dropdowna (centralno ispod prve 3 stavke, language desno).
- Smanjen vizualni glitch pri inicijalnom renderu menija (font-ready pristup).
- Ujednačavano poravnanje hero uvodnog dijela između stranica.
- Uklonjen gornji prazni razmak iznad glavnog menija.

### JS konsolidacija
- Inline skripte iz layouta prebačene u:
  - `src/assets/js/main.js`
- `base.njk` sada samo uključuje JS datoteke (`jquery.js`, `webflow-script.js`, `main.js`).
- `main.js` pokriva:
  - audio play/pause UI,
  - `?qr` logiku za AR button visibility,
  - `preventDefault` za action anchor-e,
  - hero image lazy hydration po varijanti,
  - legacy `.html -> /` redirect,
  - single-open dropdown behavior,
  - font-ready klasu.

### Encoding/tekst
- Više puta rješavan problem krivih hrvatskih znakova.
- Ispravljeni UTF-8 problemi u ključnim fileovima.
- `nav.json` je ponovno snimljen s ispravnim dijakritikama.

### Dokumentacija projekta
Dodani/uređeni dokumenti:
- `AI_CONTRACT.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`

---

## 4) Trenutno otvorene stvari (gdje smo stali)
1. EN i IT i18n data još nisu kompletirani (`i18n/en.json`, `i18n/it.json`).
2. Treba potvrditi workflow pravila u `README` (dev/build/output).
3. Treba odlučiti policy za `dist/` (`.gitignore` ili commit strategija).
4. Još postoji legacy oslonac na `jquery.js` i `webflow-script.js` (namjerno privremeno).
5. Inline CSS u `base.njk` još postoji; poželjno kasnije prebaciti u CSS file.

Napomena: AR data layer (`_data/ar_links.json`) je svjesno preskočen po zadnjoj uputi.

---

## 5) Build status
- Eleventy build prolazi lokalno bez greške (`npx @11ty/eleventy`).
- Stranice se generiraju pod `dist/hr/...` + landing za `en/` i `it/`.

---

## 6) Preporučeni prvi prompt za novi chat
Kopiraj ovo u novi Codex chat:

"Radimo isključivo u `!ELEVENTY` folderu. Pročitaj `PROJECT_HANDOVER.md`, `AI_CONTRACT.md`, `ARCHITECTURE.md` i `DECISIONS.md`. Nemoj dirati legacy foldere. Nastavi od točke 'Trenutno otvorene stvari': prvo napravi `i18n/en.json` i `i18n/it.json`, zatim provjeri `README` + `.gitignore` policy za `dist`, pa predloži minimalni plan za language switch fallback." 

---

## 7) Brzi commandi
U `!ELEVENTY`:
- Dev server: `npm run dev`
- Build: `npx @11ty/eleventy`

