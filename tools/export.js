/* Export the HTML deck to (a) a 16:9 PDF and (b) one PNG per slide.
   Uses the Chromium that Playwright already cached on this machine.

   Usage: node export.js <outdir> [theme]
     theme "light" builds the cream edition from the same deck.html via
     ?theme=light, so the two editions can never drift apart. */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const EXE = require('./chrome')();
const OUT = process.argv[2] || '.';
const THEME = (process.argv[3] || 'dark').toLowerCase();
const LIGHT = THEME === 'light';

// `serve` 301s /deck.html -> /deck and DROPS the query string on the way, so
// the light edition has to be requested at the already-clean path. Try the
// plain filename first (works on any static server), then the clean one.
const CANDIDATES = LIGHT
  ? ['http://localhost:5173/deck.html?theme=light', 'http://localhost:5173/deck?theme=light']
  : ['http://localhost:5173/deck.html'];
const NAME = 'Hackett-Hackett-Investor-Deck' + (LIGHT ? '-Light' : '');
const SLIDEDIR = LIGHT ? 'slides-light' : 'slides';
const W = 1280, H = 720;

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });

  let themed = false;
  for (const url of CANDIDATES) {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200); // let webfonts settle
    themed = await page.evaluate(() => document.querySelector('.deck').classList.contains('light'));
    if (!LIGHT || themed) break;
  }
  if (LIGHT && !themed) throw new Error('asked for the light edition but the deck never applied it');

  const n = await page.evaluate(() => document.querySelectorAll('.slide').length);
  console.log(`slides found: ${n}  (${LIGHT ? 'light' : 'black'} edition)`);

  const pdfPath = path.join(OUT, `${NAME}.pdf`);
  await page.pdf({
    path: pdfPath, width: `${W}px`, height: `${H}px`,
    printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' },
    pageRanges: `1-${n}`
  });
  console.log('pdf written:', pdfPath, fs.statSync(pdfPath).size, 'bytes');

  const dir = path.join(OUT, SLIDEDIR);
  fs.mkdirSync(dir, { recursive: true });
  const notes = [];
  for (let i = 0; i < n; i++) {
    const el = page.locator('.slide').nth(i);
    await el.screenshot({ path: path.join(dir, `slide-${String(i + 1).padStart(2, '0')}.png`) });
    notes.push(await el.getAttribute('data-notes'));
  }
  fs.writeFileSync(path.join(OUT, LIGHT ? 'notes-light.json' : 'notes.json'), JSON.stringify(notes, null, 2));
  console.log('pngs written:', n, '->', dir);

  await browser.close();
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
