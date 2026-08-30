/* Walk a rendered slide and describe it as shapes + text runs, so the PowerPoint
   can be built from real editable objects instead of a flat picture.

   Returns, per slide, an ordered list of:
     {t:'rect', x,y,w,h, fill, alpha}          backgrounds, bars, rules, borders
     {t:'img',  x,y,w,h, data}                 images, alpha-keyed (see below)
     {t:'text', x,y,w,h, runs[], align, ...}   one box per text block

   All geometry is CSS px relative to the slide; the caller converts to inches. */
module.exports = function sceneScript() {
  const px = n => Math.round(n * 100) / 100;

  const hex = c => {
    const m = /rgba?\(([^)]+)\)/.exec(c);
    if (!m) return null;
    const p = m[1].split(',').map(s => parseFloat(s.trim()));
    const a = p.length > 3 ? p[3] : 1;
    if (a === 0) return null;
    const h = p.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
    return { hex: h.toUpperCase(), alpha: a };
  };

  /* mix-blend-mode:screen over black means "black becomes transparent". Redraw
     the mark to a canvas and key its alpha to luminance so the PowerPoint gets a
     transparent PNG rather than a black rectangle. */
  const keyed = img => {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height);
    const q = d.data;
    for (let i = 0; i < q.length; i += 4) {
      const lum = 0.2126 * q[i] + 0.7152 * q[i + 1] + 0.0722 * q[i + 2];
      q[i + 3] = Math.min(255, Math.round(lum * 1.35));
    }
    g.putImageData(d, 0, 0);
    return c.toDataURL('image/png');
  };

  /* PowerPoint needs a number. CSS `line-height: normal` has none, and leaving
     it out makes PowerPoint fall back to the font's own single spacing — which on
     a 42pt display face is far looser than the deck's leading. Measure it once
     per font signature instead. */
  const lhCache = new Map();
  const normalLH = cs => {
    const key = [cs.fontFamily, cs.fontSize, cs.fontWeight, cs.fontStyle, cs.fontVariationSettings].join('|');
    if (lhCache.has(key)) return lhCache.get(key);
    const d = document.createElement('div');
    d.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;line-height:normal;'
      + `font-family:${cs.fontFamily};font-size:${cs.fontSize};font-weight:${cs.fontWeight};`
      + `font-style:${cs.fontStyle};font-variation-settings:${cs.fontVariationSettings}`;
    d.textContent = 'Hg';
    document.body.append(d);
    const h = d.getBoundingClientRect().height;
    d.remove();
    lhCache.set(key, h);
    return h;
  };
  const lineH = cs => { const v = parseFloat(cs.lineHeight); return isNaN(v) ? normalLH(cs) : v; };
  const pt = n => px(n * 0.75);

  /* PowerPoint has no weight 600 and cannot drive Fraunces's optical-size axis,
     so it sets these lines WIDER than the browser does. Measure how much wider,
     under exactly the conditions the .pptx will have. */
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;left:-9999px;top:0;white-space:pre;visibility:hidden';
  const widthUnder = runs => {
    probe.innerHTML = '';
    for (const r of runs) {
      const sp = document.createElement('span');
      sp.style.cssText = `font-family:'${r.family}';font-size:${r.size / 0.75}px;`
        + `font-weight:${r.bold ? 700 : 400};font-style:${r.italic ? 'italic' : 'normal'};`
        + `letter-spacing:${r.spacing / 0.75}px`;
      sp.textContent = r.text + (r.trail ? ' ' : '');
      probe.append(sp);
    }
    document.body.append(probe);
    const w = probe.getBoundingClientRect().width;
    probe.remove();
    return w;
  };

  /* A box whose text sits CENTRED inside it — a flex cell stretched to the
     height of its row, like the connector arrows — must not be emitted as top
     aligned, or the glyph jumps to the top of the box in PowerPoint. Measure
     where the text actually sits rather than infer it from the CSS that put it
     there. */
  const vAlign = el => {
    const rng = document.createRange();
    rng.selectNodeContents(el);
    const rects = [...rng.getClientRects()];
    if (!rects.length) return 'top';
    const box = el.getBoundingClientRect();
    const above = Math.min(...rects.map(r => r.top)) - box.top;
    const below = box.bottom - Math.max(...rects.map(r => r.bottom));
    const slack = above + below;
    if (slack <= 4) return 'top';                       // nothing to align within
    if (Math.abs(above - below) <= slack * 0.34) return 'middle';
    return below < above ? 'bottom' : 'top';
  };

  /* The content box of whatever already contains this text — the only space a
     box may grow into, so widening can never reach across a gutter or a card. */
  const roomIn = parent => {
    if (!parent) return null;
    const r = parent.getBoundingClientRect(), cs = getComputedStyle(parent);
    return { left: r.left + (parseFloat(cs.paddingLeft) || 0),
             right: r.right - (parseFloat(cs.paddingRight) || 0) };
  };

  /* A run is named with the font's own family, and PowerPoint is left to pick
     the weight from the bold flag. Asking instead for the per-weight families
     Google ships ("Fraunces 144pt Medium") only pays off if those exact families
     are installed, and installing Fraunces from Google Fonts gives you one
     variable family, not those. See finish-pptx.js for why they are not embedded
     either. `weight` and `display` are still recorded, because the rebuild in
     scene-preview.js draws the deck as it looks with the fonts present. */
  const DISPLAY = /opsz["']?[^0-9]{0,2}144/;

  const hasBorder = cs => ["Top","Right","Bottom","Left"].some(k =>
    parseFloat(cs["border" + k + "Width"]) > 0 && cs["border" + k + "Style"] !== "none");

  /* A plain stacked text block: no fill, no rule, its own words, no nested
     blocks. Consecutive ones inside a container are merged into a SINGLE text
     box, because PowerPoint has no weight 600 — CSS 600 must become bold 700,
     which is wider and wraps where the HTML does not. Separate absolutely
     positioned boxes then collide; one box lets the overflow push down. */
  const simple = el => {
    if (el.tagName === "IMG") return false;
    const cs = getComputedStyle(el);
    if (cs.display === "none") return false;
    if (hex(cs.backgroundColor) || hasBorder(cs)) return false;
    if ([...el.children].some(c => isBlock(c))) return false;
    return [...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim());
  };

  const isBlock = el => {
    const d = getComputedStyle(el).display;
    return d === 'block' || d === 'flex' || d === 'grid' || d === 'list-item' || d === 'table';
  };

  return [...document.querySelectorAll('.slide')].map(slide => {
    const sr = slide.getBoundingClientRect();
    const out = [];
    const rel = r => ({ x: px(r.left - sr.left), y: px(r.top - sr.top), w: px(r.width), h: px(r.height) });

    const runsOf = el => {
      const runs = [];
      (function walk(node) {
        for (const n of node.childNodes) {
          if (n.nodeType === 3) {
            const parent = n.parentElement;
            const cs = getComputedStyle(parent);
            if (isBlock(parent) && parent !== el && parent.parentElement !== el) continue;
            let t = n.nodeValue.replace(/\s+/g, ' ');
            if (!t.trim()) { if (runs.length) runs[runs.length - 1].trail = true; continue; }
            if (cs.textTransform === 'uppercase') t = t.toUpperCase();
            const col = hex(cs.color);
            const wt = parseInt(cs.fontWeight, 10) || 400;
            const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
            const disp = DISPLAY.test(cs.fontVariationSettings || '');
            runs.push({
              text: t,
              weight: wt,                       // what the browser actually sets
              display: disp,                    // heading optical size, opsz 144
              family: fam,                      // the webfont family
              face: fam,                        // what the .pptx asks for
              bold: wt >= 600,
              italic: cs.fontStyle === 'italic',
              color: col ? col.hex : '000000',
              size: px(parseFloat(cs.fontSize) * 0.75),
              spacing: px((parseFloat(cs.letterSpacing) || 0) * 0.75)
            });
          } else if (n.nodeType === 1) {
            if (n.tagName === 'BR') { if (runs.length) runs[runs.length - 1].brk = true; continue; }
            if (isBlock(n)) continue;          // emitted as its own box
            walk(n);
          }
        }
      })(el);
      return runs;
    };

    (function walk(el) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      const r = el.getBoundingClientRect();
      if (r.width < 0.5 || r.height < 0.5) return;
      const g = rel(r);
      const op = parseFloat(cs.opacity);

      const bg = hex(cs.backgroundColor);
      if (bg) out.push({ t: 'rect', ...g, fill: bg.hex, alpha: bg.alpha * op });

      for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
        const bw = parseFloat(cs['border' + side + 'Width']);
        if (!bw || cs['border' + side + 'Style'] === 'none') continue;
        const bc = hex(cs['border' + side + 'Color']);
        if (!bc) continue;
        const b = side === 'Top'    ? { x: g.x, y: g.y, w: g.w, h: px(bw) }
                : side === 'Bottom' ? { x: g.x, y: px(g.y + g.h - bw), w: g.w, h: px(bw) }
                : side === 'Left'   ? { x: g.x, y: g.y, w: px(bw), h: g.h }
                :                     { x: px(g.x + g.w - bw), y: g.y, w: px(bw), h: g.h };
        out.push({ t: 'rect', ...b, fill: bc.hex, alpha: bc.alpha * op });
      }

      if (el.tagName === 'IMG') { out.push({ t: 'img', ...g, data: keyed(el) }); return; }

      const ownText = [...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim());
      if (ownText) {
        const runs = runsOf(el);
        if (runs.length) {
          /* A paragraph that the browser held on ONE line is the one at risk:
             PowerPoint's wider setting is what breaks it in two. Mark those, and
             only those, as candidates for extra width. */
          const paras = runs.reduce((a, r) => { a[a.length - 1].push(r); if (r.brk) a.push([]); return a; },
            [[]]).filter(p => p.length);
          if (Math.round(g.h / lineH(cs)) === paras.length) paras.forEach(p => { p[0].one = true; });
          const stroke = parseFloat(cs.webkitTextStrokeWidth) || 0;
          const sc = hex(cs.webkitTextStrokeColor);
          out.push({
            t: 'text', ...g, runs,
            align: cs.textAlign === 'right' ? 'right' : cs.textAlign === 'center' ? 'center' : 'left',
            room: roomIn(el.parentElement),
            valign: vAlign(el),
            lineSpacing: pt(lineH(cs)) || null,
            alpha: op,
            outline: stroke && sc ? { size: px(stroke * 0.75), color: sc.hex } : null
          });
        }
      }
      /* Merge consecutive plain text blocks into one box. */
      const kids = [...el.children].filter(c => isBlock(c) || !ownText);
      for (let i = 0; i < kids.length; i++) {
        if (!simple(kids[i])) { walk(kids[i]); continue; }
        /* Only merge children that are genuinely STACKED. A flex row lays its
           children out side by side (the snapshot bars, the kicker/meta row);
           stacking those would drop the right-hand half onto a second line. */
        /* Merging widens the box to the widest member, so blocks of DIFFERENT
           widths must not merge: a narrow lede next to a full-width heading would
           be re-flowed at the heading's width and lose a line. Same left edge,
           same width, genuinely stacked. */
        const stacked = (a, c) => {
          const ra = a.getBoundingClientRect(), rc = c.getBoundingClientRect();
          return rc.top >= ra.bottom - 2
            && Math.abs(rc.left - ra.left) < 2
            && Math.abs(rc.width - ra.width) < 2;
        };
        let j = i;
        while (j + 1 < kids.length && simple(kids[j + 1]) && stacked(kids[j], kids[j + 1])) j++;
        if (j === i) { walk(kids[i]); continue; }
        const group = kids.slice(i, j + 1);
        const first = group[0].getBoundingClientRect();
        const last = group[group.length - 1].getBoundingClientRect();
        const gc = getComputedStyle(group[0]);
        const runs = [];
        /* One box, but the blocks inside it stay separate PARAGRAPHS: each keeps
           its own line spacing (a 22pt heading and 13.5px body cannot share one)
           and the gap above it. The gap is measured between the boxes rather than
           read off margin-top, so collapsed margins land in the right place. */
        let prevBottom = null;
        group.forEach(k => {
          const kr = runsOf(k);
          if (!kr.length) return;
          const kc = getComputedStyle(k), krect = k.getBoundingClientRect();
          const ls = pt(lineH(kc));
          kr.forEach(r => { r.ls = ls; });
          kr[0].one = Math.round(krect.height / lineH(kc)) === 1;
          if (runs.length) {
            runs[runs.length - 1].brk = true;
            kr[0].before = prevBottom === null ? 0 : Math.max(0, pt(krect.top - prevBottom));
          }
          prevBottom = krect.bottom;
          runs.push(...kr);
        });
        if (runs.length) out.push({
          t: "text",
          x: px(first.left - sr.left), y: px(first.top - sr.top),
          w: px(Math.max(...group.map(k => k.getBoundingClientRect().width))),
          h: px(last.bottom - first.top),
          runs, align: gc.textAlign === "right" ? "right" : gc.textAlign === "center" ? "center" : "left",
          room: roomIn(el),
          lineSpacing: pt(lineH(gc)) || null,
          alpha: 1, outline: null, grouped: true
        });
        i = j;
      }
    })(slide);

    /* Grow each box to hold its single-line paragraphs at PowerPoint's wider
       setting, but never past the space its container already occupies. Where
       there is no room the line still wraps — that is what the merged boxes are
       for, so the overflow pushes down instead of colliding. */
    for (const o of out) {
      if (o.t !== 'text' || !o.room) continue;
      const paras = o.runs.reduce((a, r) => { a[a.length - 1].push(r); if (r.brk) a.push([]); return a; },
        [[]]).filter(p => p.length);
      let need = 0;
      for (const p of paras) if (p[0].one) need = Math.max(need, widthUnder(p));
      need = Math.ceil(need) + 1;                      // a hair, for rounding
      if (need <= o.w) continue;
      const left = o.room.left - sr.left, right = o.room.right - sr.left;
      const grown = o.align === 'right' ? Math.min(need, o.x + o.w - left)
                  : o.align === 'center' ? Math.min(need, 2 * Math.min(o.x + o.w / 2 - left, right - o.x - o.w / 2))
                  : Math.min(need, right - o.x);
      if (grown <= o.w) continue;
      if (o.align === 'right') o.x = px(o.x + o.w - grown);
      else if (o.align === 'center') o.x = px(o.x + (o.w - grown) / 2);
      o.w = px(grown);
    }

    for (const o of out) delete o.room;
    return out;
  });
};
