/* Draw the scene graph back from the same numbers handed to pptxgenjs, for the
   eye. compare-scene.js scores the same rebuild; this one is for looking at.

   Usage: node verify-scene.js [dark|light] [slides]      e.g. ... light 1,4,5 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const sceneScript = require('./scene.js');
const preview = require('./scene-preview.js');
const EXE = require('./chrome')();

const LIGHT = (process.argv[2] || 'dark').toLowerCase() === 'light';
const WANT = (process.argv[3] || '1,4,5,11').split(',').map(Number);
const CANDIDATES = LIGHT
  ? ['http://localhost:5173/deck.html?theme=light', 'http://localhost:5173/deck?theme=light']
  : ['http://localhost:5173/deck.html'];

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });

  let themed = false;
  for (const url of CANDIDATES) {
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(1200);
    themed = await p.evaluate(() => document.querySelector('.deck').classList.contains('light'));
    if (!LIGHT || themed) break;
  }
  if (LIGHT && !themed) throw new Error('asked for the light edition but the deck never applied it');

  const scenes = await p.evaluate(`(${sceneScript.toString()})()`);
  const file = path.join(__dirname, '_scene-preview.html');
  fs.writeFileSync(file, preview(scenes, WANT, true));

  const p2 = await b.newPage({ viewport: { width: 1320, height: 780 }, deviceScaleFactor: 2 });
  await p2.goto('file:///' + file.split(path.sep).join('/'), { waitUntil: 'networkidle' });
  await p2.evaluate(() => document.fonts.ready);
  await p2.waitForTimeout(1500);
  const els = await p2.$$('.s');
  for (let i = 0; i < els.length; i++) {
    await els[i].screenshot({ path: path.join(__dirname, `_scene-${WANT[i]}.png`) });
  }
  console.log('rebuilt slides:', WANT.join(', '));
  await b.close();
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
