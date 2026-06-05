// Luke's confirmed settings (from IMG_7266.HEIC):
//   Volatility Σ = annualIV / sqrt(252)  — daily sigma
//   Band *       = annualIV * sqrt(52/7) — matches his 2.619 for MSTR at 96% IV
//   nSteps       = 252 always (HTML default, same for all timeframes)
//   Timeframe label is annotation-only, not a different simulation config

export function computeSigma(annualIV) {
  return annualIV / Math.sqrt(252);
}

export function computeBand(annualIV) {
  return annualIV * Math.sqrt(52 / 7);
}

const TIMEFRAME_LABEL = {
  '2hr':   '2-Hour Time Frame',
  '30min': '30-Minute Time Frame',
};

export async function generateChartInBrowser({ s0, iv, ticker = '', timeframe = '2hr' }) {
  const sigma = computeSigma(iv);
  const band  = computeBand(iv);
  const label = TIMEFRAME_LABEL[timeframe] || '2-Hour Time Frame';
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const annotation = `$${ticker}  (as of ${today})`;

  const res  = await fetch('/bayesain.html');
  let html   = await res.text();

  // Prevent auto-run — we set inputs then call run() manually
  html = html.replace(/syncTri\(\);\s*[\s\S]*?run\(\);/, 'syncTri();');

  const blob    = new Blob([html], { type: 'text/html' });
  const blobUrl = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.src   = blobUrl;
    iframe.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1200px;height:700px;visibility:hidden;pointer-events:none';
    document.body.appendChild(iframe);

    const cleanup = () => {
      URL.revokeObjectURL(blobUrl);
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
    };

    const timeout = setTimeout(() => { cleanup(); reject(new Error('Chart generation timed out')); }, 25000);

    iframe.onload = () => {
      try {
        const doc = iframe.contentDocument;
        const win = iframe.contentWindow;

        // Set price
        const s0El = doc.getElementById('s0');
        s0El.value = s0;
        s0El.dispatchEvent(new Event('input', { bubbles: true }));

        // Set sigma (daily vol) and bandMult — these are the only overrides Luke uses
        const sigmaEl = doc.getElementById('sigma');
        if (sigmaEl) sigmaEl.value = sigma;

        const bandEl = doc.getElementById('bandMult');
        if (bandEl) bandEl.value = band;

        // Set annotation labels
        const commentEl = doc.getElementById('chartComment');
        if (commentEl) commentEl.value = annotation;
        const xAxisEl = doc.getElementById('xAxisComment');
        if (xAxisEl) xAxisEl.value = label;

        win.run();

        setTimeout(() => {
          try {
            clearTimeout(timeout);

            const canvas2d = doc.getElementById('c');
            const data2d   = canvas2d ? canvas2d.toDataURL('image/jpeg', 0.9) : null;

            const finals = win._finalBurstFinals || [];
            const upPct  = finals.length > 0
              ? Math.round((finals.filter(f => f >= s0).length / finals.length) * 100)
              : null;

            // frozenLines = the 4 stdev band lines bayesain.html draws
            // [0]=outer high (green), [1]=inner high (green), [2]=inner low (red), [3]=outer low (red)
            const args        = win._lastDrawArgs;
            const frozenLines = args?.[11] || null;
            const pplHigh     = frozenLines?.[0]?.v ?? null;
            const pplLow      = frozenLines?.[3]?.v ?? null;
            const pplMode     = parseFloat(doc.getElementById('triMode')?.value) || s0;

            cleanup();
            resolve({ data2d, upPct, timeframe, frozenLines, pplHigh, pplLow, pplMode });
          } catch (err) { cleanup(); reject(err); }
        }, 9500);
      } catch (err) { clearTimeout(timeout); cleanup(); reject(err); }
    };

    iframe.onerror = () => { clearTimeout(timeout); cleanup(); reject(new Error('Failed to load chart tool')); };
  });
}

// Always fetches live IV from the server right before generating so bands match the stock's
// actual implied volatility — never relies on stale DB data.
export async function generateAllCharts({ ticker, s0: fallbackS0 }) {
  // Fetch live price + IV for this specific ticker
  let s0 = fallbackS0;
  let iv = 0.20;
  try {
    const res  = await fetch(`/api/tickers/${encodeURIComponent(ticker)}/iv`);
    const data = await res.json();
    if (data.iv  != null) iv  = data.iv;
    if (data.price != null) s0 = data.price;
  } catch (e) {
    console.warn(`IV fetch failed for ${ticker}, using fallback`);
  }

  const [twoHour, thirtyMin] = await Promise.all([
    generateChartInBrowser({ s0, iv, ticker, timeframe: '2hr'   }),
    generateChartInBrowser({ s0, iv, ticker, timeframe: '30min' }),
  ]);
  return { twoHour, thirtyMin };
}

export function chartSrc(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `/${path}`;
}
