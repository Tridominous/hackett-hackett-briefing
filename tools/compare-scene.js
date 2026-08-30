/* Pixel-diff every slide against its rebuild from the scene graph.

   verify-scene.js shows you a rebuild to look at. This one scores it, so a
   regression in scene.js cannot slip through on the slides nobody screenshots.
   Anything over the threshold gets a composite written out — real, rebuilt, and
   a mask of where they disagree — so the eye only has to go where the numbers
   already point.

   The floor is NOT zero and never will be: PowerPoint cannot drive Fraunces's
   optical-size axis and has no font weight 600, so every Fraunces line is set a
   little wider than the browser sets it. That is a property of the format, not a
   defect, so this scores each slide against a RECORDED BASELINE and fails only on
   a slide that got worse. Re-record with --save after a deliberate change to the
   deck or the extractor, and read the composites before you do.

   Usage: node compare-scene.js [dark|light] [slides] [--save]
   Exit code 1 if any slide regressed against the baseline. */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const sceneScript = require('./scene.js');
const preview = require('./scene-preview.js');
const EXE = require('./chrome')();

const LIGHT = (process.argv[2] || 'dark').toLowerCase() === 'light';
const PICK = process.argv[3] && !process.argv[3].startsWith('--')
  ? process.argv[3].split(',').map(Number) : null;
const W = 1280, H = 720;

const SAVE = process.argv.includes('--save');
const BASELINE = path.join(__dirname, 'scene-baseline.json');
const SLACK = 0.004;              // 0.4pp of drift before a slide counts as worse
const CEILING = 0.10;             // a slide with no baseline may not exceed this
const CHANNEL = 26;               // per-channel delta that counts as "off"

const CANDIDATES = LIGHT
  ? ['http://localhost:5173/deck.html?theme=light', 'http://localhost:5173/deck?theme=light']
  : ['http://localhost:5173/deck.html'];

const b64 = buf => 'data:image/png;base64,' + buf.toString('base64');

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  const page = await browser.newPage({ viewport: { width: W, height: H } });

  let themed = false;
  for (const url of CANDIDATES) {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);
    themed = await page.evaluate(() => document.querySelector('.deck').classList.contains('light'));
    if (!LIGHT || themed) break;
  }
  if (LIGHT && !themed) throw new Error('asked for the light edition but the deck never applied it');

  const scenes = await page.evaluate(`(${sceneScript.toString()})()`);
  const want = PICK || scenes.map((_, i) => i + 1);

  const real = [];
  for (const n of want) real.push(b64(await page.locator('.slide').nth(n - 1).screenshot()));

  const file = path.join(__dirname, '_cmp-preview.html');
  fs.writeFileSync(file, preview(scenes, want, false));
  const p2 = await browser.newPage({ viewport: { width: W, height: H } });
  await p2.goto('file:///' + file.split(path.sep).join('/'), { waitUntil: 'networkidle' });
  await p2.evaluate(() => document.fonts.ready);
  await p2.waitForTimeout(1500);
  const els = await p2.$$('.s');
  const rebuilt = [];
  for (const el of els) rebuilt.push(b64(await el.screenshot()));

  const p3 = await browser.newPage({ viewport: { width: 400, height: 300 } });
  await p3.goto('about:blank');
  const results = [];
  for (let i = 0; i < want.length; i++) {
    const r = await p3.evaluate(async ([a, b, W, H, CH]) => {
      const load = src => new Promise((res, rej) => {
        const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src;
      });
      const [ia, ib] = await Promise.all([load(a), load(b)]);
      const grab = im => {
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.drawImage(im, 0, 0, W, H);
        return g.getImageData(0, 0, W, H);
      };
      const da = grab(ia), db = grab(ib);
      const out = document.createElement('canvas');
      out.width = W; out.height = H * 3;
      const g = out.getContext('2d');
      g.drawImage(ia, 0, 0, W, H);
      g.drawImage(ib, 0, H, W, H);
      const mask = g.createImageData(W, H);
      let off = 0, sum = 0;
      for (let p = 0; p < da.data.length; p += 4) {
        const d = Math.max(
          Math.abs(da.data[p] - db.data[p]),
          Math.abs(da.data[p + 1] - db.data[p + 1]),
          Math.abs(da.data[p + 2] - db.data[p + 2]));
        sum += d;
        const bad = d > CH;
        if (bad) off++;
        mask.data[p] = bad ? 255 : 16;
        mask.data[p + 1] = bad ? 0 : 16;
        mask.data[p + 2] = bad ? 128 : 16;
        mask.data[p + 3] = 255;
      }
      g.putImageData(mask, 0, H * 2);
      const n = da.data.length / 4;
      return { pct: off / n, mean: sum / n, png: out.toDataURL('image/png') };
    }, [real[i], rebuilt[i], W, H, CHANNEL]);
    results.push({ n: want[i], ...r });
  }
  await browser.close();

  const tag = LIGHT ? 'light' : 'dark';
  const base = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : {};
  const was = base[tag] || {};
  let failed = 0;

  console.log('');
  console.log(`  slide   pixels off      was   verdict   (${tag} edition)`);
  for (const r of results) {
    const prev = was[r.n];
    const bad = prev === undefined ? r.pct > CEILING : r.pct > prev + SLACK;
    const name = `_cmp-${tag}-${String(r.n).padStart(2, '0')}.png`;
    if (bad) { failed++; fs.writeFileSync(path.join(__dirname, name), Buffer.from(r.png.split(',')[1], 'base64')); }
    const delta = prev === undefined ? '' :
      ` (${r.pct - prev >= 0 ? '+' : ''}${((r.pct - prev) * 100).toFixed(2)})`;
    console.log(`   ${String(r.n).padStart(2)}      ${(r.pct * 100).toFixed(2).padStart(6)}%   `
      + `${(prev === undefined ? '--' : (prev * 100).toFixed(2)).padStart(6)}   `
      + (bad ? `WORSE${delta} -> ${name}` : prev === undefined ? 'new' : `ok${delta}`));
  }

  if (SAVE) {
    base[tag] = Object.fromEntries(results.map(r => [r.n, Number(r.pct.toFixed(4))]));
    fs.writeFileSync(BASELINE, JSON.stringify(base, null, 2));
    console.log('');
    console.log(`  baseline recorded for the ${tag} edition`);
    process.exit(0);
  }
  console.log('');
  console.log(failed ? `  ${failed} slide(s) worse than the baseline` : '  no slide regressed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
