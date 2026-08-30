/* Fix the one thing pptxgenjs writes unsafely.

   pptxgenjs escapes `author` into docProps/core.xml but writes `company` into
   docProps/app.xml RAW, so the ampersand in "Hackett & Hackett" produced
   `<Company>Hackett & Hackett …</Company>` — invalid XML. PowerPoint rejected the
   whole package as corrupt and the editable deck would not open at all. One
   character. It is written here instead, escaped, so DO NOT set `pres.company`
   in make-pptx.js.

   Font embedding was built here and then removed on the evidence. PowerPoint
   does load embedded faces — `Presentation.Fonts.Item(i).Embedded` reports true
   for all of them — but it then sets the text using the embedded metrics while
   drawing fallback glyphs, so advances drift, words collide and the deck reads
   WORSE than plain substitution. Verified against the installed PowerPoint, both
   in its own PDF export and on screen. The PDF remains the fixed-layout artefact;
   the .pptx needs Fraunces and Hanken Grotesk installed to look as designed. */
const JSZip = require('jszip');
const fs = require('fs');

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

module.exports = async function finishPptx(pptxPath, opts = {}) {
  if (!opts.company) return;
  const zip = await JSZip.loadAsync(fs.readFileSync(pptxPath));
  const app = await zip.file('docProps/app.xml').async('string');
  zip.file('docProps/app.xml', app.includes('<Company>')
    ? app.replace(/<Company>.*?<\/Company>/s, `<Company>${esc(opts.company)}</Company>`)
    : app.replace('</Properties>', `<Company>${esc(opts.company)}</Company></Properties>`));
  fs.writeFileSync(pptxPath, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
};
