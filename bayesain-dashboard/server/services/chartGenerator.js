const path = require('path');
const fs = require('fs');

const IS_VERCEL = !!process.env.VERCEL;

// On Vercel, write to /tmp (writable). Locally, write to public/charts/.
function getChartsDir() {
  if (IS_VERCEL) return '/tmp/charts';
  return path.resolve(__dirname, '../../public/charts');
}

async function launchBrowser() {
  if (IS_VERCEL) {
    const chromium = require('@sparticuz/chromium');
    const puppeteer = require('puppeteer-core');
    const executablePath = await chromium.executablePath();
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1400, height: 800 },
      executablePath,
      headless: chromium.headless,
    });
  } else {
    const puppeteer = require('puppeteer-core');
    // Use locally installed Chrome
    const executablePath =
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      (process.platform === 'darwin'
        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        : '/usr/bin/google-chrome-stable');
    return puppeteer.launch({
      executablePath,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      defaultViewport: { width: 1400, height: 800 },
    });
  }
}

async function generateChart({ ticker, s0, sigma, low, mode, high, steps = 252, paths = 120 }) {
  const chartsDir = getChartsDir();
  fs.mkdirSync(chartsDir, { recursive: true });

  const date = new Date().toISOString().split('T')[0];
  const file2d = `${ticker}-${date}-2d.png`;
  const file3d = `${ticker}-${date}-3d.png`;
  const fullPath2d = path.join(chartsDir, file2d);
  const fullPath3d = path.join(chartsDir, file3d);

  // URL paths returned to frontend:
  // - On Vercel: served via API endpoint (since /tmp isn't publicly accessible)
  // - Locally: served as static files from public/charts/
  const path2d = IS_VERCEL ? `/api/charts/file/${ticker}/${date}/2d` : `charts/${file2d}`;
  const path3d = IS_VERCEL ? `/api/charts/file/${ticker}/${date}/3d` : `charts/${file3d}`;

  // Read the HTML and strip the auto-run calls so we control when the chart runs
  const htmlPath = path.resolve(__dirname, '../../public/bayesain.html');
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  // Remove the two auto-run calls at the end of the script block
  htmlContent = htmlContent.replace(/syncTri\(\);\s*\nrun\(\);/, 'syncTri();');

  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
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

    // Trigger the chart run
    await page.evaluate(() => window.run());

    // Wait for 27-iteration animation + burst paths to complete
    await new Promise(resolve => setTimeout(resolve, 9500));

    // Screenshot the 2D canvas
    const canvas2d = await page.$('#c');
    if (canvas2d) {
      const buffer = await canvas2d.screenshot({ type: 'png' });
      fs.writeFileSync(fullPath2d, buffer);
    }

    // Screenshot 3D canvas if visible
    let has3d = false;
    const wrap3d = await page.$('#c3d-wrap');
    if (wrap3d) {
      const visible = await page.$eval('#c3d-wrap', el => el.style.display !== 'none');
      if (visible) {
        const canvas3d = await page.$('#c3d');
        if (canvas3d) {
          const buffer = await canvas3d.screenshot({ type: 'png' });
          fs.writeFileSync(fullPath3d, buffer);
          has3d = true;
        }
      }
    }

    return {
      path2d,
      path3d: has3d ? path3d : null,
      generatedAt: new Date().toISOString()
    };
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { generateChart };
