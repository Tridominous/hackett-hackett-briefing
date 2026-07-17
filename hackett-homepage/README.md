# Hackett &amp; Hackett — Homepage Concept

A reimagined, single-page homepage concept for **Hackett &amp; Hackett** (luxury chauffeur, close
protection &amp; private travel). Built as a self-contained, dependency-free `index.html` so it
deploys anywhere static in minutes.

> Independent interview / portfolio concept — not affiliated with or endorsed by Hackett &amp; Hackett.

---

## What's in here

```
hackett-homepage/
├── index.html     ← the entire site (HTML + CSS + JS inline, inline SVG art)
├── .nojekyll      ← tells GitHub Pages to serve files as-is
└── README.md      ← you are here
```

No build step. No framework. No npm install. One file.

**Design notes**
- Typefaces load from Google Fonts (Fraunces + Hanken Grotesk). If a network blocks them,
  the page gracefully falls back to Georgia / system sans — layout is unaffected.
- Committed dark "midnight concierge" art direction; brass/champagne accent.
- Signature: cinematic hero (drifting light, self-drawing route, cursor parallax) + a working
  glass **instant-quote** card. Respects `prefers-reduced-motion` and keyboard focus throughout.

---

## Preview locally

Any static server works. From inside `hackett-homepage/`:

```bash
# Python (already on most machines)
python -m http.server 8000
# then open http://localhost:8000

# …or Node
npx --yes serve .
```

---

## Deploy: GitHub Pages

The simplest path — this folder becomes the repo root.

1. Create a new GitHub repo (e.g. `hackett-homepage`).
2. Put the **contents** of this folder (`index.html`, `.nojekyll`) at the repo root and push:
   ```bash
   git init
   git add .
   git commit -m "Hackett & Hackett homepage concept"
   git branch -M main
   git remote add origin https://github.com/<you>/hackett-homepage.git
   git push -u origin main
   ```
3. Repo → **Settings → Pages** → *Build and deployment* → **Deploy from a branch** →
   Branch: `main`, folder: `/ (root)` → **Save**.
4. Live in ~1 minute at `https://<you>.github.io/hackett-homepage/`.

> Keeping this inside a larger repo? GitHub Pages only serves from the repo **root** or a
> **`/docs`** folder — rename `hackett-homepage/` to `docs/` and pick `/docs` in step 3.

---

## Deploy: Vercel

Even faster.

- **No-git option:** go to [vercel.com/new](https://vercel.com/new) → drag this folder onto the
  page → Deploy.
- **CLI option:** from inside this folder:
  ```bash
  npm i -g vercel
  vercel        # accept defaults; Framework Preset = "Other"
  vercel --prod # promote to production
  ```
- **Git option:** import the repo on Vercel; no configuration needed for a static site.

---

## Customising

Everything is driven by CSS custom properties near the top of `index.html` (`:root { … }`) —
change `--brass`, `--void`, fonts, or radius in one place. Copy lives in plain HTML; the
indicative fleet rates (`£75`, `£100`) and quote-card rates sit in the markup and the
`data-rate` attributes.
