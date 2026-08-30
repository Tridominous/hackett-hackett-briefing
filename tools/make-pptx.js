/* Build an EDITABLE PowerPoint from deck.html.

   Every slide is emitted as native PowerPoint objects — rectangles for the
   bars, rules and borders, real text boxes for the copy, a transparent PNG for
   the wordmark. Nothing is a flat picture, so the team can retype anything.

   Usage: node make-pptx.js <outdir> [theme]        theme: dark (default) | light

   Two honest limitations of editable text, both unavoidable:
   - Fraunces and Hanken Grotesk are webfonts. Unless they are installed on the
     machine opening the file, PowerPoint substitutes and the line breaks move.
     The PDF is the fixed-layout artefact; this is the working one.
   - The outlined section numerals become PowerPoint text outlines, which are a
     close approximation rather than an exact match for -webkit-text-stroke.

   NOTE: speaker notes ship inside this file and travel to whoever receives it. */
const PptxGenJS = require('pptxgenjs');
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const sceneScript = require('./scene.js');
const finishPptx = require('./finish-pptx.js');

const EXE = require('./chrome')();
const OUT = process.argv[2];
const LIGHT = (process.argv[3] || 'dark').toLowerCase() === 'light';
const PX = 96;                                   // css px per inch
const W = 1280, H = 720;

const CANDIDATES = LIGHT
  ? ['http://localhost:5173/deck.html?theme=light', 'http://localhost:5173/deck?theme=light']
  : ['http://localhost:5173/deck.html'];

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
  const notes = await page.evaluate(() =>
    [...document.querySelectorAll('.slide')].map(s => s.getAttribute('data-notes') || ''));
  await browser.close();

  const pres = new PptxGenJS();
  pres.defineLayout({ name: 'HH169', width: 13.333, height: 7.5 });
  pres.layout = 'HH169';
  pres.author  = 'Hackett & Hackett International Group Limited';
  pres.title   = 'Investor Overview';
  pres.subject = 'Investor Overview';

  let rects = 0, texts = 0, imgs = 0;

  scenes.forEach((scene, i) => {
    const slide = pres.addSlide();
    // The first rect is the slide's own background; use it as the page fill.
    const ground = scene.find(o => o.t === 'rect' && o.w >= W - 1 && o.h >= H - 1);
    slide.background = { color: ground ? ground.fill : (LIGHT ? 'F6F1E5' : '0B0C0E') };

    for (const o of scene) {
      if (o === ground) continue;
      const box = { x: o.x / PX, y: o.y / PX, w: o.w / PX, h: o.h / PX };

      if (o.t === 'rect') {
        slide.addShape(pres.ShapeType.rect, {
          ...box, fill: { color: o.fill, transparency: Math.round((1 - o.alpha) * 100) },
          line: { type: 'none' }
        });
        rects++;
      } else if (o.t === 'img') {
        slide.addImage({ data: o.data, ...box });
        imgs++;
      } else if (o.t === 'text') {
        /* A run carrying `brk` ENDS a paragraph. pptxgenjs builds the paragraph
           properties by looping every run in the paragraph and letting the LAST
           one win, so line spacing and space-before have to be stamped on all of
           them — put on the first run alone, they are silently discarded. */
        const paras = [];
        let cur = [];
        for (const r of o.runs) { cur.push(r); if (r.brk) { paras.push(cur); cur = []; } }
        if (cur.length) paras.push(cur);

        const runs = [];
        for (const p of paras) {
          const lineSpacing = p[0].ls || o.lineSpacing || undefined;
          const paraSpaceBefore = p[0].before || undefined;
          for (const r of p) runs.push({
            text: r.text + (r.trail ? ' ' : ''),
            options: {
              bold: r.bold, italic: r.italic, color: r.color, fontSize: r.size,
              fontFace: r.face, charSpacing: r.spacing || undefined,
              breakLine: !!r.brk,
              lineSpacing, paraSpaceBefore
            }
          });
        }
        slide.addText(runs, {
          ...box, valign: o.valign || 'top', align: o.align, margin: 0, wrap: true, shrinkText: false,
          lineSpacing: o.lineSpacing || undefined,
          transparency: o.alpha < 1 ? Math.round((1 - o.alpha) * 100) : undefined,
          outline: o.outline ? { size: o.outline.size, color: o.outline.color } : undefined
        });
        texts++;
      }
    }
    if (notes[i]) slide.addNotes(notes[i]);
  });

  const outFile = path.join(OUT, 'Hackett-Hackett-Investor-Deck' + (LIGHT ? '-Light' : '') + '.pptx');
  await pres.writeFile({ fileName: outFile });
  await finishPptx(outFile, { company: 'Hackett & Hackett International Group Limited' });
  const kb = Math.round(fs.statSync(outFile).size / 1024);
  console.log(`pptx written: ${outFile} (${kb} KB, ${scenes.length} slides, ${LIGHT ? 'light' : 'black'})`);
  console.log(`  editable objects: ${texts} text boxes, ${rects} shapes, ${imgs} images`);

})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
