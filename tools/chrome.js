/* Locate the Chromium that Playwright has already cached on this machine.
   The path is version-stamped (chromium-1223, chromium-1231, ...), so pinning it
   breaks the build the first time Playwright updates. Resolve the newest one
   instead, and let CHROME_EXE override for a non-standard install. */
const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = function chromeExecutable() {
  if (process.env.CHROME_EXE) return process.env.CHROME_EXE;

  const root = process.platform === 'win32'
    ? path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright')
    : path.join(os.homedir(), '.cache', 'ms-playwright');

  const candidates = ['chrome-win64/chrome.exe', 'chrome-linux/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium'];
  const builds = fs.existsSync(root)
    ? fs.readdirSync(root).filter(d => d.startsWith('chromium-'))
        .sort((a, b) => (parseInt(b.split('-')[1], 10) || 0) - (parseInt(a.split('-')[1], 10) || 0))
    : [];

  for (const b of builds) {
    for (const c of candidates) {
      const p = path.join(root, b, c);
      if (fs.existsSync(p)) return p;
    }
  }
  throw new Error(
    `No Playwright Chromium found under ${root}.\n` +
    `Install one with:  npx --yes playwright install chromium\n` +
    `or point CHROME_EXE at an existing Chrome/Chromium binary.`);
};
