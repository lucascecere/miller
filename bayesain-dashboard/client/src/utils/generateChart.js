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

// After simulation completes, overlay the actual PPL level lines.
// The 4 random stdevLines bayesain.html draws look like price targets but aren't —
// we cover their right-side labels and replace them with our real PPL labels.
function overlayPPLLines(doc, win, { pplLow, pplMode, pplHigh }) {
  if (pplLow == null || pplHigh == null) return;
  const args = win._lastDrawArgs;
  if (!args) return;

  const allPaths    = args[0];
  const frozenLines = args[11];
  const s0val       = args[7];

  let yMin = Infinity, yMax = -Infinity;
  allPaths.forEach(path => path.forEach(v => {
    if (v < yMin) yMin = v;
    if (v > yMax) yMax = v;
  }));
  yMin = Math.min(yMin, s0val);
  yMax = Math.max(yMax, s0val);
  if (frozenLines) frozenLines.forEach(fl => {
    yMin = Math.min(yMin, fl.v);
    yMax = Math.max(yMax, fl.v);
  });
  const pad = (yMax - yMin) * 0.06;
  yMin -= pad;
  yMax += pad;

  const canvas = doc.getElementById('c');
  if (!canvas) return;
  const dpr = win.devicePixelRatio || 1;
  const W   = canvas.width / dpr;
  const H   = canvas.height / dpr;

  // Match bayesain.html layout constants exactly
  const marginL = 72, marginT = 20, marginB = 44;
  const marginR = W - marginL - Math.floor((W - marginL - 8) * 0.81);
  const pw      = (W - marginL - marginR) * 0.77;
  const ph      = H - marginT - marginB;
  const toY     = v => marginT + (1 - (v - yMin) / (yMax - yMin)) * ph;

  // lineEndX matches where bayesain.html draws the stdevLine labels
  const lineEndX = marginL + pw * 1.12;

  const ctx = canvas.getContext('2d');
  ctx.save();

  // Erase the random stdevLine labels on the right side
  if (frozenLines && frozenLines.length > 0) {
    ctx.fillStyle = 'rgba(7,9,15,1)';
    frozenLines.forEach(fl => {
      const y = toY(fl.v);
      if (y >= marginT - 5 && y <= marginT + ph + 5) {
        ctx.fillRect(lineEndX + 1, y - 13, W - lineEndX + 5, 26);
      }
    });
  }

  // Draw the real PPL lines and labels in the same right-side position
  const pplLines = [
    { v: pplLow,  col: '#f87171', lbl: `PPL-L  $${pplLow.toFixed(2)}`  },
    { v: pplMode, col: '#fbbf24', lbl: `PPL-M  $${pplMode.toFixed(2)}` },
    { v: pplHigh, col: '#4ade80', lbl: `PPL-H  $${pplHigh.toFixed(2)}` },
  ];

  pplLines.forEach(({ v, col, lbl }) => {
    const y = toY(v);
    if (y < marginT - 2 || y > marginT + ph + 2) return;

    // Dashed line across the full plot width
    ctx.strokeStyle = col;
    ctx.lineWidth   = 2;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(marginL, y);
    ctx.lineTo(lineEndX, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label on the right, same position as the erased stdevLine labels
    ctx.fillStyle    = col;
    ctx.font         = 'bold 13px IBM Plex Mono, monospace';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(lbl, lineEndX + 5, y);
  });

  ctx.restore();
}

// Generates a single timeframe chart.
// Returns { data2d, data3d, upPct, timeframe, pplLow, pplMode, pplHigh }
// where pplLow/Mode/High are read directly from bayesain.html's syncTri() —
// the same values the simulation used. These are the source of truth.
export async function generateChartInBrowser({
  s0, sigma, band,
  ticker = '', timeframe = 'daily', paths = 120,
  // pplLow/Mode/High are optional overrides; if omitted, we read from the HTML
  pplLow: pplLowIn = null, pplMode: pplModeIn = null, pplHigh: pplHighIn = null,
}) {
  const cfg         = TIMEFRAME_CONFIG[timeframe] || TIMEFRAME_CONFIG.daily;
  const steps       = Math.round(cfg.stepsPerDay * cfg.horizonDays);
  const scaledSigma = cfg.stepsPerDay === 1 ? sigma : sigma / Math.sqrt(cfg.stepsPerDay);

  const today      = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const annotation = [`$${ticker}`, today, cfg.label].filter(Boolean).join('   ');

  const res  = await fetch('/bayesain.html');
  let html   = await res.text();
  html       = html.replace(/syncTri\(\);\s*[\s\S]*?run\(\);/, 'syncTri();');

  const blob   = new Blob([html], { type: 'text/html' });
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

    const timeout = setTimeout(() => { cleanup(); reject(new Error('Chart generation timed out')); }, 20000);

    iframe.onload = () => {
      try {
        const doc = iframe.contentDocument;
        const win = iframe.contentWindow;

        // Set s0 — this triggers oninput="syncTri()" which sets triLow/triMode/triHigh
        const s0El = doc.getElementById('s0');
        s0El.value = s0;
        s0El.dispatchEvent(new Event('input', { bubbles: true }));

        // Read PPL values directly from bayesain.html after syncTri fires.
        // These are the authoritative values — same ones used in the simulation.
        const pplLow  = pplLowIn  != null ? pplLowIn  : parseFloat(doc.getElementById('triLow').value);
        const pplMode = pplModeIn != null ? pplModeIn : parseFloat(doc.getElementById('triMode').value);
        const pplHigh = pplHighIn != null ? pplHighIn : parseFloat(doc.getElementById('triHigh').value);

        doc.getElementById('sigma').value  = scaledSigma;
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

            // Overlay the PPL lines using the HTML-sourced values
            try { overlayPPLLines(doc, win, { pplLow, pplMode, pplHigh }); } catch (_) {}

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

// Generates the daily chart only — single source of truth for PPL levels.
export async function generateAllCharts({ s0, sigma, band, ticker }) {
  const daily = await generateChartInBrowser({ s0, sigma, band, ticker, timeframe: 'daily' });
  return [daily];
}

export function chartSrc(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `/${path}`;
}
