# Hackett & Hackett · briefing set

Six static pages prepared around the Hackett & Hackett International Group
relaunch: the Tapestry, an investor overview, a digital relaunch briefing, two
strategy documents for the founder, and a recommended brand standard. No build
step, no framework, no npm install.

> Independent concept and analysis; not affiliated with or endorsed by
> Hackett & Hackett.

## Live URLs

Served from the custom domain in `CNAME`:

- **The Tapestry:** https://briefing.jamesmou.com/tapestry.html
- **Investor overview:** https://briefing.jamesmou.com/investor-deck.html
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
├── tapestry.html               ← THE APEX PAGE. The whole group as one continuous cloth
├── investor-deck.html          ← 13-slide investor overview, projector ready
├── gap-sheet.html              ← LOCAL ONLY, git-ignored: claims to verify, doc conflicts (see below)
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

| | Count | Notes |
|---|---:|---|
| Service divisions | **16** | 14 from the group structure, plus Business & Asset Brokerage (15) and Social Housing (16), added on the founder's direction |
| Named delivery partners (tier 3) | **19** | Attached to 7 divisions; the other 9 have none |
| Company sponsors (tier 4) | **0** | The tier exists in the structure but is empty |
| Supporting charities (tier 5) | **5** | Missing People, Amnesty, Shawmind, Film + TV Charity, WWF |

Divisions 15 and 16 formalise brokerage work the founder already does
personally. The list is expected to keep growing, which is why the Tapestry
counts divisions from its data rather than hard-coding a number into a sentence.

**`tapestry.html` is now the single authority for this list.** Its `DATA` block,
at the top of the page's one `<script>`, holds every division, engine, partner,
project, governance role and number. Change the list there and the page redraws;
counts, engine groupings and the network scene all recalculate.

Divisions are grouped into four engines — **Move · Make · Serve · Broker**
(3 · 5 · 3 · 5) — and a new division joins an engine rather than lengthening a
flat list.

### Two places the division list is duplicated

`investor-deck.html` carries its own short copy of the division names and their
engines, so that it stays a self-contained file. **If you add a division to
`tapestry.html`, add its name and engine to the `ENGINES` array in
`investor-deck.html` too.** Nothing else is duplicated; both files compute their
counts, so they cannot drift internally.

The older pages still describe the original fourteen. If the structure changes
again, update `press.html` section 1, `strategy-briefing.html` sections 1 / 4 /
5 / 6, `group-strategy-review.html` sections 3 / 4, and the factsheet in
`index.html`.

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

## Driving the Tapestry

| Key | Does |
|---|---|
| `P` | Toggle present mode — chrome hides, one scene fills the screen, borders dim to hairlines |
| `←` `→` `space` | Move along the cloth (a lateral pan, not a cut) |
| `Home` `End` | First / last scene |
| `Esc` | Leave present mode |

Also: drag to pan, wheel to scroll sideways, click any tick on the thread at the
bottom to fly to that scene. Print unwraps the cloth into a linear document and
forces the light palette regardless of the theme on screen.

Verified at 1440×900, 1366×768 and 1280×720; every scene fits without internal
scrolling in present mode at all three.

## gap-sheet.html and presenter-notes.html — do not deploy

Both are private working documents. Neither is linked from any public page and
both carry `noindex`, but **this repo is public and serves GitHub Pages**, so
anyone who guesses the URL can open whatever is committed here.

- **`gap-sheet.html`** — the candid companion to the Tapestry: claims that need
  verifying before an investor sees them, the conflicts between the eleven
  source documents, and the credential exposure in the WhatsApp archive. Written
  for James and Edwin only. **This one would do real damage if it leaked**, since
  it lists exactly which claims are unverified. It is in `.gitignore` and stays
  on local disk. Do not commit it.
- **`presenter-notes.html`** — delivery notes written in the second person
  ("this is your credibility peak"). Not audience-facing. **Still tracked, and
  therefore already live** at `briefing.jamesmou.com/presenter-notes.html`.
  To take it down: `git rm --cached presenter-notes.html`, add it to
  `.gitignore`, then push.

`press.html` also carries `noindex`, since it is a proposal rather than a
published company standard. `tapestry.html` and `investor-deck.html` carry
`noindex` too while they are drafts under review.
