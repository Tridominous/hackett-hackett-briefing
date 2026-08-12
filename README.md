# Hackett & Hackett · briefing set

Four static pages prepared around the Hackett & Hackett International Group
digital relaunch: a digital relaunch briefing, two strategy documents for the
founder, and a recommended brand standard. No build step, no framework, no
npm install.

> Independent concept and analysis; not affiliated with or endorsed by
> Hackett & Hackett.

## Live URLs

Served from the custom domain in `CNAME`:

- **Digital relaunch briefing:** https://briefing.jamesmou.com/
- **Strategy briefing:** https://briefing.jamesmou.com/strategy-briefing.html
- **Strategic reality review:** https://briefing.jamesmou.com/group-strategy-review.html
- **Brand & press standards:** https://briefing.jamesmou.com/press.html
- **Homepage concept (the demo):** https://tridominous.github.io/hackett-hackett-concept/
  (its own repo: [`hackett-hackett-concept`](https://github.com/Tridominous/hackett-hackett-concept))
- **v1 of the concept (illustrated):** https://briefing.jamesmou.com/hackett-homepage/

All pages share the light/dark choice, stored in `localStorage` under `hh-theme`.

## What's in here

```
hackett/
├── index.html                  ← digital relaunch briefing (SWOT, PESTLE, initiatives, roadmap)
├── strategy-briefing.html      ← founder-facing strategy: service map, group structure, 12-month plan
├── group-strategy-review.html  ← the long analysis: division matrix, SWOT, PESTLE, comparators, sources
├── press.html                  ← recommended brand standards: colour, logo, type, house style, boilerplate
├── presenter-notes.html        ← private speaking notes — NOT for sharing, see below
├── hackett-homepage/           ← v1 of the concept (illustrated), kept for reference
├── hackett-homepage-v2/        ← local only: its own repo, deployed separately (see above)
├── CNAME                       ← custom domain for GitHub Pages
├── .nojekyll                   ← tells GitHub Pages to serve files as-is
└── README.md                   ← you are here
```

`hackett-homepage-v2/` is git-ignored here because it is already a standalone repo
with its own Pages deployment; the briefing's buttons point at that live URL.

## The agreed facts

Every page draws from the group structure document. The two counts that get
conflated most often are different things:

| | Count | Notes |
|---|---:|---|
| Service divisions (tier 2) | **14** | Named exactly as the group structure names them |
| Named delivery partners (tier 3) | **19** | Attached to 7 of the 14 divisions; 7 divisions have none |
| Company sponsors (tier 4) | **0** | The tier exists in the structure but is empty |
| Supporting charities (tier 5) | **5** | Missing People, Amnesty, Shawmind, Film + TV Charity, WWF |

Section 6 of `strategy-briefing.html` renders the full five-tier structure as an
interactive diagram, with a plain-text register underneath that is what prints.
`press.html` carries the same numbers as the canonical fact block.

If any of these change, update `press.html` section 1, `strategy-briefing.html`
sections 1 / 4 / 5 / 6, `group-strategy-review.html` sections 3 / 4, and the
factsheet in `index.html`.

## Preview locally

From this folder:

```bash
npx --yes serve . -l 5173
```

(Don't use `python -m http.server` on this machine: `python` is a Microsoft Store
alias stub, not a real interpreter. `.claude/launch.json` is configured to use
`serve` for the same reason.)

## Redeploying

Pages serves from `main`, `/ (root)`. To publish a change:

```bash
git add -A
git commit -m "describe the change"
git push
```

Live in about a minute.

## presenter-notes.html — do not deploy

This file is private delivery notes written in the second person ("this is your
credibility peak"). It is not audience-facing and should be removed from the
deployed branch before the set is shared. It isn't linked from the briefing and
carries `noindex`, but on a public repo anyone who guesses the URL can open it.
Keep a local copy and add it to `.gitignore`.

`press.html` also carries `noindex`, since it is a proposal rather than a
published company standard.
