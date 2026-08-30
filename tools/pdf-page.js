/* Print any of the briefing pages to PDF using the page's own print stylesheet. */
const { chromium } = require('playwright-core');
const EXE = require('./chrome')();

const [, , url, out, orient] = process.argv;

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
  await page.pdf({
    path: out,
    format: 'A4',
    landscape: orient === 'landscape',
    printBackground: true,
    margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' }
  });
  console.log('written:', out);
  await browser.close();
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
