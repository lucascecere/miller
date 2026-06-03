const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateChart({ ticker, s0, sigma, low, mode, high, steps = 252, paths = 120 }) {
  const chartsDir = path.resolve(__dirname, '../../public/charts');
  fs.mkdirSync(chartsDir, { recursive: true });

  const date = new Date().toISOString().split('T')[0];
  const path2d = `charts/${ticker}-${date}-2d.png`;
  const path3d = `charts/${ticker}-${date}-3d.png`;
  const fullPath2d = path.resolve(__dirname, '../../public', path2d);
  const fullPath3d = path.resolve(__dirname, '../../public', path3d);

  let browser;
  try {
    const launchOptions = {
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    };
    // On Railway/Linux the bundled Puppeteer Chrome is at a known path
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 800 });

    const htmlPath = path.resolve(__dirname, '../../public/bayesain.html');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#c');

    // Set s0 and trigger syncTri()
    await page.$eval('#s0', (el, val) => {
      el.value = val;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, String(s0));

    await page.$eval('#sigma',   (el, val) => { el.value = val; }, String(sigma));
    await page.$eval('#triLow',  (el, val) => { el.value = val; }, String(low));
    await page.$eval('#triMode', (el, val) => { el.value = val; }, String(mode));
    await page.$eval('#triHigh', (el, val) => { el.value = val; }, String(high));
    await page.$eval('#nPaths',  (el, val) => { el.value = val; }, String(paths));
    await page.$eval('#nSteps',  (el, val) => { el.value = val; }, String(steps));

    // Click run (#runBtn is an <img> with onclick handler)
    await page.click('#runBtn');

    // Wait for full 27-iteration animation + burst paths
    await new Promise(resolve => setTimeout(resolve, 9000));

    const canvas2d = await page.$('#c');
    if (canvas2d) {
      const buffer2d = await canvas2d.screenshot({ type: 'png' });
      fs.writeFileSync(fullPath2d, buffer2d);
    }

    let has3d = false;
    const wrap3d = await page.$('#c3d-wrap');
    if (wrap3d) {
      const is3dVisible = await page.$eval('#c3d-wrap', el => el.style.display !== 'none');
      if (is3dVisible) {
        const canvas3d = await page.$('#c3d');
        if (canvas3d) {
          const buffer3d = await canvas3d.screenshot({ type: 'png' });
          fs.writeFileSync(fullPath3d, buffer3d);
          has3d = true;
        }
      }
    }

    return { path2d, path3d: has3d ? path3d : null, generatedAt: new Date().toISOString() };
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { generateChart };
