/* Render a scene graph back to HTML using ONLY the numbers handed to pptxgenjs.

   Shared by verify-scene.js (eyeball) and compare-scene.js (pixel diff) so both
   judge the same rebuild. If this reproduces the real slide, the extraction is
   sound — which is the risky half of the conversion; pptxgenjs turning those
   numbers into XML is not.

   The text model mirrors PowerPoint's, not HTML's: a run carrying `brk` ENDS a
   paragraph (pptxgenjs `breakLine`), and `before` is space above the paragraph
   that follows (`paraSpaceBefore`). So paragraphs are divs with a margin-top,
   which is what PowerPoint will actually lay out — a <br> with an inline margin
   would flatter the rebuild by collapsing gaps the .pptx really has. */
const FONTS = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Hanken+Grotesk:wght@300;400;500;600;700;800&display=swap';

const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* The slide's own background becomes the page fill in PowerPoint, exactly as
   make-pptx.js treats it, so it is the ground here rather than a rect. */
const groundOf = scene => scene.find(o => o.t === 'rect' && o.w >= 1279 && o.h >= 719);

/* The .pptx now carries the exact static instance for every weight and optical
   size, so the rebuild is drawn at the real weight and axis rather than at a
   substitute's. What this shows is what the file shows on a machine that honours
   the embedded fonts. */
const runHTML = r =>
  `<span style="font-family:'${r.family || r.face}';font-size:${r.size / 0.75}px;`
  + `font-weight:${r.weight || (r.bold ? 700 : 400)};`
  + (r.display ? 'font-variation-settings:"opsz" 144;' : '')
  + `font-style:${r.italic ? 'italic' : 'normal'};color:#${r.color};letter-spacing:${r.spacing / 0.75}px">`
  + esc(r.text) + (r.trail ? ' ' : '') + '</span>';

function textHTML(o) {
  const paras = [];
  let cur = [];
  for (const r of o.runs) {
    cur.push(r);
    if (r.brk) { paras.push(cur); cur = []; }
  }
  if (cur.length) paras.push(cur);
  return paras.map(p => {
    const css = [];
    if (p[0].before) css.push(`margin-top:${p[0].before / 0.75}px`);
    const ls = p[0].ls || o.lineSpacing;
    if (ls) css.push(`line-height:${ls / 0.75}px`);
    return `<div style="${css.join(';')}">${p.map(runHTML).join('') || '&nbsp;'}</div>`;
  }).join('');
}

function slideHTML(scene) {
  const ground = groundOf(scene);
  const body = scene.filter(o => o !== ground).map(o => {
    const pos = `left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px`;
    if (o.t === 'rect') return `<div style="position:absolute;${pos};background:#${o.fill};opacity:${o.alpha}"></div>`;
    if (o.t === 'img')  return `<img src="${o.data}" style="position:absolute;${pos}">`;
    const stroke = o.outline
      ? `-webkit-text-stroke:${o.outline.size / 0.75}px #${o.outline.color};` : '';
    const vert = o.valign && o.valign !== 'top'
      ? `display:flex;flex-direction:column;justify-content:${o.valign === 'middle' ? 'center' : 'flex-end'};` : '';
    return `<div style="position:absolute;${pos};text-align:${o.align};${stroke}${vert}`
         + `line-height:${o.lineSpacing ? o.lineSpacing / 0.75 + 'px' : 'normal'};opacity:${o.alpha};`
         + `overflow:visible">${textHTML(o)}</div>`;
  }).join('');
  return `<div class="s" style="background:#${ground ? ground.fill : '000'}">${body}</div>`;
}

/* want: 1-based slide numbers. captions: label each rebuild (eyeball mode). */
module.exports = function preview(scenes, want, captions = true) {
  const html = want.map(n =>
    slideHTML(scenes[n - 1])
    + (captions ? `<div class="cap">slide ${n} — rebuilt from the scene graph</div>` : '')).join('');
  return `<meta charset="utf-8"><link href="${FONTS}" rel="stylesheet">
<style>body{margin:0;background:${captions ? '#3a3d42' : '#000'};font-family:system-ui}
.s{position:relative;width:1280px;height:720px;margin:${captions ? '20px auto 4px' : '0'};overflow:hidden}
.cap{color:#aaa;font-size:12px;text-align:center;margin-bottom:18px}</style>${html}`;
};
module.exports.slideHTML = slideHTML;
module.exports.groundOf = groundOf;
