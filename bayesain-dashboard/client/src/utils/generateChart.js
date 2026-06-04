export function computeBand(annualIV) {
  return annualIV * Math.sqrt(52 / 7);
}

export function computeSigma(annualIV) {
  return annualIV / Math.sqrt(252);
}

const TIMEFRAME_CONFIG = {
  daily:  { stepsPerDay: 1,    horizonDays: 252, label: 'Daily'  },
  '2hr':  { stepsPerDay: 3.25, horizonDays: 5,   label: '2-Hour' },
  '30min':{ stepsPerDay: 13,   horizonDays: 2,   label: '30-Min' },
};

// Replaces the random stdevLines section in bayesain.html's draw() with code
// that draws the actual PPL levels (triLow/triMode/triHigh from syncTri).
// Runs inside draw() so it has direct access to ctx, toY, marginL, pw, yMin, yMax.
const PPL_DRAW_CODE = `
  const _triLow  = parseFloat(document.getElementById('triLow').value)  || s0 * 0.93;
  const _triMode = parseFloat(document.getElementById('triMode').value) || s0;
  const _triHigh = parseFloat(document.getElementById('triHigh').value) || s0 * 1.07;
  const stdevLines = [
    { v: _triHigh, label: 'PPL-H', col: '#00FF41' },
    { v: _triMode, label: 'PPL-M', col: '#fbbf24' },
    { v: _triLow,  label: 'PPL-L', col: '#FF2020' },
  ];
  const _pplEndX = marginL + pw * 1.12;
  stdevLines.forEach(({ v, label, col }) => {
    if (v < yMin || v > yMax) return;
    const y = toY(v);
    ctx.setLineDash([10, 5]);
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(marginL, y);
    ctx.lineTo(_pplEndX, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = 'bold 13px IBM Plex Mono, monospace';
    ctx.fillStyle = col;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label + '  $' + v.toFixed(2), _pplEndX + 5, y);
    ctx.textBaseline = 'alphabetic';
  });
  ctx.setLineDash([]);


`;

export async function generateChartInBrowser({
  s0, sigma, band,
  ticker = '', timeframe = 'daily', paths = 120,
  pplLow: pplLowIn = null, pplMode: pplModeIn = null, pplHigh: pplHighIn = null,
}) {
  const cfg         = TIMEFRAME_CONFIG[timeframe] || TIMEFRAME_CONFIG.daily;
  const steps       = Math.round(cfg.stepsPerDay * cfg.horizonDays);
  const scaledSigma = cfg.stepsPerDay === 1 ? sigma : sigma / Math.sqrt(cfg.stepsPerDay);

  const today      = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const annotation = [`$${ticker}`, today, cfg.label].filter(Boolean).join('   ');

  const res = await fetch('/bayesain.html');
  let html  = await res.text();

  // Prevent auto-run on load
  html = html.replace(/syncTri\(\);\s*[\s\S]*?run\(\);/, 'syncTri();');

  // Replace the random stdevLines section with actual PPL level lines.
  // The regex matches from "let stdevLines;" through the closing setLineDash
  // and the blank lines that follow — the rest of draw() is untouched.
  html = html.replace(
    /  let stdevLines;[\s\S]*?  ctx\.setLineDash\(\[\]\);\n\n\n/,
    PPL_DRAW_CODE
  );

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

        // Set s0 — triggers syncTri() which sets triLow/triMode/triHigh
        const s0El = doc.getElementById('s0');
        s0El.value = s0;
        s0El.dispatchEvent(new Event('input', { bubbles: true }));

        // Read PPL values from the HTML after syncTri fires — source of truth
        const pplLow  = pplLowIn  != null ? pplLowIn  : parseFloat(doc.getElementById('triLow').value);
        const pplMode = pplModeIn != null ? pplModeIn : parseFloat(doc.getElementById('triMode').value);
        const pplHigh = pplHighIn != null ? pplHighIn : parseFloat(doc.getElementById('triHigh').value);

        // bayesain.html sigma = annualized vol; scaledSigma is per-step, convert back
        doc.getElementById('sigma').value  = scaledSigma * Math.sqrt(steps);
        if (band != null) doc.getElementById('bandMult').value = band;
        doc.getElementById('nPaths').value = paths;
        doc.getElementById('nSteps').value = steps;

        const commentEl = doc.getElementById('chartComment');
        if (commentEl) commentEl.value = annotation;
        const xAxisEl = doc.getElementById('xAxisComment');
        if (xAxisEl) xAxisEl.value = cfg.label;

        win.run();

        setTimeout(() => {
          try {
            clearTimeout(timeout);

            const canvas2d = doc.getElementById('c');
            const data2d   = canvas2d ? canvas2d.toDataURL('image/jpeg', 0.9) : null;

            let data3d = null;
            if (timeframe === 'daily') {
              const wrap3d = doc.getElementById('c3d-wrap');
              if (wrap3d && wrap3d.style.display !== 'none') {
                const canvas3d = doc.getElementById('c3d');
                if (canvas3d) data3d = canvas3d.toDataURL('image/jpeg', 0.9);
              }
            }

            const finals = win._finalBurstFinals || [];
            const upPct  = finals.length > 0
              ? Math.round((finals.filter(f => f >= s0).length / finals.length) * 100)
              : null;

            cleanup();
            resolve({ data2d, data3d, upPct, timeframe, pplLow, pplMode, pplHigh });
          } catch (err) { cleanup(); reject(err); }
        }, 9500);
      } catch (err) { clearTimeout(timeout); cleanup(); reject(err); }
    };

    iframe.onerror = () => { clearTimeout(timeout); cleanup(); reject(new Error('Failed to load chart tool')); };
  });
}

export async function generateAllCharts({ s0, sigma, band, ticker }) {
  const daily = await generateChartInBrowser({ s0, sigma, band, ticker, timeframe: 'daily' });
  return [daily];
}

export function chartSrc(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `/${path}`;
}
