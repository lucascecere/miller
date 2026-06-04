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

// After win.run() finishes, overlay the actual PPL level lines on the canvas.
// The random stdevLines bayesain.html draws look like price targets but aren't —
// this overlays the real PPL levels so they match the tweet and cards exactly.
function overlayPPLLines(doc, win, { pplLow, pplMode, pplHigh, s0 }) {
  if (pplLow == null || pplHigh == null) return;

  const args = win._lastDrawArgs;
  if (!args) return;

  const allPaths   = args[0];
  const frozenLines = args[11];
  const s0val      = args[7];

  // Recompute yMin/yMax exactly as draw() does in tight-fit mode (final state)
  let yMin = Infinity, yMax = -Infinity;
  allPaths.forEach(path => {
    path.forEach(v => { if (v < yMin) yMin = v; if (v > yMax) yMax = v; });
  });
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
  const W = canvas.width / dpr;
  const H = canvas.height / dpr;

  // Match draw()'s layout constants exactly
  const marginL = 72, marginT = 20, marginB = 44;
  const marginR = W - marginL - Math.floor((W - marginL - 8) * 0.81);
  const pw = (W - marginL - marginR) * 0.77;
  const ph = H - marginT - marginB;

  const toY = v => marginT + (1 - (v - yMin) / (yMax - yMin)) * ph;

  const ctx = canvas.getContext('2d');
  ctx.save();

  const pplLines = [
    { v: pplLow,              col: 'rgba(248,113,113,1)',  lbl: `PPL-L  $${Number(pplLow).toFixed(2)}`             },
    { v: pplMode != null ? pplMode : s0, col: 'rgba(251,191,36,1)',  lbl: `PPL-M  $${Number(pplMode ?? s0).toFixed(2)}` },
    { v: pplHigh,             col: 'rgba(74,222,128,1)',   lbl: `PPL-H  $${Number(pplHigh).toFixed(2)}`            },
  ];

  pplLines.forEach(({ v, col, lbl }) => {
    const y = toY(v);
    if (y < marginT - 2 || y > marginT + ph + 2) return;

    // Dashed line across the plot area
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(marginL, y);
    ctx.lineTo(marginL + pw, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label on left y-axis (same side as s0 label)
    ctx.fillStyle = col;
    ctx.font = 'bold 13px IBM Plex Mono, monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(lbl, marginL - 5, y);
  });

  ctx.restore();
}

export async function generateChartInBrowser({
  s0, sigma, band,
  ticker = '', pplLow = null, pplMode = null, pplHigh = null,
  timeframe = 'daily', paths = 120,
}) {
  const cfg = TIMEFRAME_CONFIG[timeframe] || TIMEFRAME_CONFIG.daily;
  const steps = Math.round(cfg.stepsPerDay * cfg.horizonDays);

  const scaledSigma = cfg.stepsPerDay === 1
    ? sigma
    : sigma / Math.sqrt(cfg.stepsPerDay);

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const annotation = [`$${ticker}`, today, cfg.label].filter(Boolean).join('   ');

  const res = await fetch('/bayesain.html');
  let html = await res.text();
  html = html.replace(/syncTri\(\);\s*[\s\S]*?run\(\);/, 'syncTri();');

  const blob = new Blob([html], { type: 'text/html' });
  const blobUrl = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.src = blobUrl;
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

        const s0El = doc.getElementById('s0');
        s0El.value = s0;
        s0El.dispatchEvent(new Event('input', { bubbles: true }));

        doc.getElementById('sigma').value = scaledSigma;
        if (band != null) doc.getElementById('bandMult').value = band;
        doc.getElementById('nPaths').value = paths;
        doc.getElementById('nSteps').value = steps;

        // Ticker + date + timeframe in the annotation box (PPL shown via overlayPPLLines instead)
        const commentEl = doc.getElementById('chartComment');
        if (commentEl) commentEl.value = annotation;
        const xAxisEl = doc.getElementById('xAxisComment');
        if (xAxisEl) xAxisEl.value = cfg.label;

        win.run();

        setTimeout(() => {
          try {
            clearTimeout(timeout);

            // Overlay the actual PPL level lines before capturing
            try {
              overlayPPLLines(doc, win, { pplLow, pplMode, pplHigh, s0 });
            } catch (_) { /* best-effort */ }

            const canvas2d = doc.getElementById('c');
            const data2d = canvas2d ? canvas2d.toDataURL('image/jpeg', 0.9) : null;

            let data3d = null;
            if (timeframe === 'daily') {
              const wrap3d = doc.getElementById('c3d-wrap');
              if (wrap3d && wrap3d.style.display !== 'none') {
                const canvas3d = doc.getElementById('c3d');
                if (canvas3d) data3d = canvas3d.toDataURL('image/jpeg', 0.9);
              }
            }

            const finals = win._finalBurstFinals || [];
            const upPct = finals.length > 0
              ? Math.round((finals.filter(f => f >= s0).length / finals.length) * 100)
              : null;

            cleanup();
            resolve({ data2d, data3d, upPct, timeframe });
          } catch (err) { cleanup(); reject(err); }
        }, 9500);
      } catch (err) { clearTimeout(timeout); cleanup(); reject(err); }
    };

    iframe.onerror = () => { clearTimeout(timeout); cleanup(); reject(new Error('Failed to load chart tool')); };
  });
}

export function chartSrc(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `/${path}`;
}
