# Hackett & Hackett · briefing set

Static pages prepared around the Hackett & Hackett International Group relaunch:
the Tapestry, an investor deck, a digital relaunch briefing, two strategy
documents for the founder, and a recommended brand standard. The pages
themselves have no build step, no framework and no npm install; only the deck's
`.pdf` / `.pptx` export needs tooling, and that lives in `tools/`.

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
├── deck.html                   ← THE DECK MASTER. 14 slides, print/export at 1280×720 (see below)
├── deck-concepts.html          ← the three art directions the deck was chosen from, kept for reference
├── deck-assets/                ← the logo master, plus the photography the concept board uses
├── dist/                       ← git-ignored: the built .pdf and .pptx (see below)
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

### Three places the division list is duplicated

`investor-deck.html`, `deck.html` and `deck-concepts.html` each carry their own
short copy of the division names and their engines, so that each stays a
self-contained file. **If you add a division to `tapestry.html`, add its name and
engine to the `ENGINES` array in all three.** Nothing else is duplicated, and
every file computes its own counts, so none of them can drift internally.

They agree today on all sixteen divisions and on the 3 · 5 · 3 · 5 engine split.
`deck.html` and `deck-concepts.html` deliberately **shorten three names** so the
Broker column fits its block without wrapping:

| `tapestry.html` (the authority) | as the deck sets it |
|---|---|
| Security & Management Services | Security & Management |
| Real Estate & Property Maintenance | Real Estate & Property |
| Super Car Sales & Self Drive Hire | Super Car Sales |

**Super Car Sales is no longer named on the slide at all.** On the founder's
instruction of 29 August it was removed from the snapshot list while the counts
everywhere still say sixteen. It remains one of the sixteen; it is simply not
printed. **So the snapshot shows 15 names against a stated 16, and anyone who
counts will notice.** If that matters more than keeping cars off the page, the
clean fix is to let "Business & Asset Brokerage" carry it — the founder himself
describes car sales as a brokerage item — and say so in the room rather than on
the slide.

**The engine formerly called Broker is now Partnerships**, on the founder's
instruction. The division "Business & Asset Brokerage" keeps its name, because he
coined it himself in the same message. `tapestry.html` and `investor-deck.html`
still say Broker and need the same rename.

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

## The deck

`deck.html` is the deck master: **14 slides at 1280×720**, one per printed page.
Everything renders from the `SLIDES` array at the top of its single `<script>`,
so editing a slide means editing one entry, and the speaker notes in each
`notes:` field become real, editable PowerPoint notes on export.

Its art direction follows the founder's notes of 29 August, and there are two
hard rules behind it.

**No photography anywhere.** The printed leaflet has none, UKME's hero has none,
and a lifestyle house that leads with a picture of a car has argued itself back
into the ground transport category. The cover and the close are typographic, led
by the wordmark and the magenta letterspaced strapline.

**One palette only: black, magenta, white.** The deck originally grouped the
four engines by colour — magenta, amber, teal, blue. That was rejected outright
("he hates the other colored branding", "we dont even have heavy branding"), so
grouping is now carried by type, rules and position, and the palette matches the
deck Penny circulated, which is the version the founder accepts. **Do not
reintroduce a second accent colour to tell two groups apart.** Magenta on black
measures 4.42:1, so it is used for display type, rules and fills — never for
body copy, which stays white or grey.

The section-break numerals are outlined rather than filled, because magenta at
any partial opacity over black turns to mud and a solid one shouts over the
headline.

### The deck states no weaknesses

This is the third rule and the easiest one to break by accident. The deck used to
carry a slide headed *"Our access is proven. Our machinery is not built"*, with a
panel explaining that access ran through one person by memory and telephone. It
was cut on 29 August. **Read the company as operating**: partners and investors
already know it trades, the relaunch is an internal exercise, and a pitch deck
states the opportunity rather than briefing the room on what is missing. So no
"prototype", no "not yet built", no "credibility work", no admissions about what
is not measured.

Nothing here overstates: the platform slide says what the three systems do and
that they are rolling out, which is true, rather than claiming they are finished.
The candour that used to sit in the deck belongs in **`gap-sheet.html`**, which
exists for exactly that and never gets deployed.

**This applies to the speaker notes too.** They are real PowerPoint notes and
they travel inside the `.pptx`, so anything written to coach an admission — the
old notes said things like "be honest that we do not measure churn well yet" —
ships to whoever is sent the file. Notes now point at what to say, and offer to
follow up rather than answer weakly in the room.

`deck-concepts.html` is the board the layout was chosen from: three directions
side by side — **A The Ledger** (archival restraint), **B Midnight** (cinematic,
photographic) and **C The Marque** (hard colour blocking). The structure is C
with A's restraint, but C's colour blocking is gone. The board is kept because it
is the fastest way to re-argue a direction, and it is the only remaining user of
the photography in `deck-assets/`. **It still shows the rejected colour system,
so do not circulate it to the founder.**

### Two editions, one file

The deck ships in a **black edition** and a **cream "light" edition**. They are
the same `deck.html`: open `deck.html?theme=light` and the tokens swap. Nothing
in the slide markup is theme-aware, so the two can never drift apart and the
division list is not duplicated a fourth time.

The **cover and close stay black in both**. The wordmark master is white and
magenta *on black* and is composited with `mix-blend-mode: screen`, which needs a
black ground — on cream it washes out entirely. Holding those two slides dark
also matches the deck Penny circulated, which mixes black and light pages.
Magenta deepens to `#B00062` on cream, because `#E5007E` measures about 3.9:1
there and the letterspaced kickers are small.

### Building the .pdf and .pptx

Both come from the same renders, so they cannot disagree. Start the local server
first — the exporter loads the deck over HTTP, not from disk:

```bash
npx --yes serve . -l 5173
```

Then, from `tools/` (one-off `npm install` there first):

```bash
node export.js ../dist && node make-pptx.js ../dist
```

And for the light edition:

```bash
node export.js ../dist light && node make-pptx.js ../dist light
```

`serve` 301s `/deck.html` to `/deck` and **drops the query string on the way**,
so `export.js` retries at the clean path and hard-fails if the light class never
applied — otherwise it would quietly ship a black deck named `-Light`.

`export.js` writes the PDF and one PNG per slide. `pdf-page.js <url> <out>
[landscape]` prints any of the other pages through its own print stylesheet —
that is how `Hackett-Tapestry.pdf` and `Gap-Sheet-PRIVATE.pdf` are made.

### The PowerPoint is editable, not a stack of pictures

`make-pptx.js` does not paste those PNGs into slides. It walks the rendered deck
with `scene.js` and rebuilds each slide out of **native PowerPoint objects** —
rectangles for the bars, rules and borders, real text boxes for the copy, one
transparent PNG for the wordmark. 103 text boxes, 69 shapes and 2 images across
the fourteen slides, so anyone can retype a figure without asking for a rebuild.

Three things are lost in that conversion and cannot be recovered, because the
format has nowhere to put them:

- **The webfonts.** Unless Fraunces and Hanken Grotesk are installed on the
  machine opening the file, PowerPoint substitutes and the line breaks move.
  **The PDF is the fixed-layout artefact; the .pptx is the working one.**
- **Font weight 600.** PowerPoint has bold or not bold, so the 600-weight card
  headings are set at 700 and run wider than they do here.
- **Fraunces's optical-size axis.** The headings are drawn at `opsz 144`, which
  PowerPoint cannot ask for, so the display lines are set wider again.


**The fix is to install the two fonts.** Both are free and openly licensed —
[Fraunces](https://fonts.google.com/specimen/Fraunces) and
[Hanken Grotesk](https://fonts.google.com/specimen/Hanken+Grotesk). Install them
once on whichever machine opens the deck and the .pptx sets as designed.

Embedding them in the file was built and then removed, on the evidence.
PowerPoint does load embedded faces — `Presentation.Fonts.Item(i).Embedded`
reports true for every one — but it then lays the text out on the *embedded*
metrics while drawing *fallback* glyphs, so advances drift and words collide. It
reads worse than plain substitution, so the deck does not ship that way. The note
at the top of `finish-pptx.js` records it so nobody rebuilds it.

### The .pptx would not open at all

Worth knowing, because it looked like a font problem and was not. pptxgenjs
escapes `author` into `docProps/core.xml` but writes `company` into
`docProps/app.xml` **raw**, so "Hackett & Hackett" left a bare `&` in the XML and
PowerPoint refused the whole package as corrupt. One character. `finish-pptx.js`
writes that field itself, escaped — **do not set `pres.company` in
`make-pptx.js`**. If you add another document property, open the result in
PowerPoint before believing it; the zip lists and unzips perfectly either way.

One artefact to ignore: PowerPoint's `Slides.Export` image renderer repeats the
tail of a wrapped line ("…ever since. We / ever since. We look after…"). The runs
in the file are correct — check `ppt/slides/slideN.xml` — so that belongs to the
export API, not to the deck.
The last two make text wider, never narrower, so `scene.js` measures every line
under those conditions and grows the box to hold it — but only into space the
parent element already occupies, never across a gutter or into the next card.
Where there is no room the line wraps, and consecutive text blocks are merged
into one box so the overflow pushes the next block down instead of colliding
with it. Each block keeps its own line spacing and the gap above it, because
PowerPoint reads both per paragraph.

### Checking the conversion

The risky half is the extraction, not pptxgenjs turning numbers into XML. Both
checks re-draw each slide **from the same numbers handed to pptxgenjs**:

```bash
node compare-scene.js dark
```

scores every slide against its rebuild and writes a real / rebuilt / difference
composite for anything that got worse. `verify-scene.js [dark|light] [slides]`
renders the same rebuild to look at instead.

That score has a floor and always will — the two font limitations above put it
at 3-6% of pixels — so `compare-scene.js` measures against the recorded
`scene-baseline.json` and fails only on a slide that **got worse**. After a
deliberate change to the deck, read the composites, then re-record both editions:

```bash
node compare-scene.js dark --save && node compare-scene.js light --save
```

**The speaker notes ship inside the .pptx** and travel to whoever receives the
file. Check the notes, not only the slides, whenever the positioning changes.

Output lands in `dist/`, which is git-ignored: it is a build product, and
`Gap-Sheet-PRIVATE.pdf` must never reach a public repo. The scripts find the
Chromium that Playwright already cached; set `CHROME_EXE` to override.

### Two decks currently exist

`investor-deck.html` (13 slides, committed and live) and `deck.html` (14 slides,
the re-tune, uncommitted) are both investor overviews, and the built binaries in
`dist/` come from `deck.html`. They tell the same story in a different order and
`deck.html` supersedes the other on art direction. **Decide which one survives
before publishing either**, or the live URL and the file you hand out will not
match.

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
