# Hackett & Hackett · Digital Relaunch (interview presentation)

The briefing James presents from: SWOT, PESTLE, initiatives, the email fix and a
phased roadmap, linking out to the live homepage concept. Static files only; no
build step, no framework, no npm install.

> Independent interview / portfolio concept; not affiliated with or endorsed by
> Hackett & Hackett.

## Live URLs

- **Briefing:** https://tridominous.github.io/hackett-hackett-briefing/
- **Homepage concept (the demo):** https://tridominous.github.io/hackett-hackett-concept/
  (its own repo: [`hackett-hackett-concept`](https://github.com/Tridominous/hackett-hackett-concept))
- **v1 of the concept (illustrated):** https://tridominous.github.io/hackett-hackett-briefing/hackett-homepage/
- **Presenter notes:** https://tridominous.github.io/hackett-hackett-briefing/presenter-notes.html

Both sites sit on the same `tridominous.github.io` origin, so the light/dark choice
(stored in `localStorage` under `hh-theme`) carries from the briefing into the demo.

## What's in here

```
hackett/
├── index.html              ← the briefing (SWOT, PESTLE, initiatives, roadmap)
├── presenter-notes.html    ← private speaking notes (not linked from the briefing)
├── hackett-homepage/       ← v1 of the concept (illustrated), kept for reference
├── hackett-homepage-v2/    ← local only: its own repo, deployed separately (see above)
├── .nojekyll               ← tells GitHub Pages to serve files as-is
└── README.md               ← you are here
```

`hackett-homepage-v2/` is git-ignored here because it is already a standalone repo
with its own Pages deployment; the briefing's buttons point at that live URL.

## Preview locally

From this folder:

```bash
npx --yes serve .    # → http://localhost:3000
```

(Don't use `python -m http.server` on this machine: `python` is a Microsoft Store
alias stub, not a real interpreter.)

## Redeploying

Pages serves from `main`, `/ (root)`. To publish a change:

```bash
git add -A
git commit -m "describe the change"
git push
```

Live in about a minute.

## A note on presenter-notes.html

It isn't linked from the briefing and carries `noindex`, but on a public repo
anyone who guesses the URL can open it. If you'd rather keep it fully private,
delete it from the deployed branch (or add it to `.gitignore`) and open your local
copy during the interview instead.
