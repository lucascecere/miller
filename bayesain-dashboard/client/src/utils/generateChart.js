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

// Overlay another timeframe's stdev bands onto a base chart as dashed lines.
// baseResult  — the chart to draw on (provides image + y-scale)
// overlayResult — the simulation whose frozenLines get drawn
// prefix — label prefix shown on each line (e.g. '2H' or '30m')
// highColor / lowColor — line colors for resistance and support bands
async function addTimeframeOverlay(baseResult, overlayResult, prefix, highColor, lowColor) {
  if (!baseResult?.data2d) return baseResult;
  if (!overlayResult?.frozenLines?.length) return baseResult;

  const { yMin, yMax, W, H, dpr, marginL, marginT, pw, ph } = baseResult;
  if (!W || !H || !dpr) return baseResult;

  const toY      = v => marginT + (1 - (v - yMin) / (yMax - yMin)) * ph;
  const lineEndX = marginL + pw * 1.12;

  const img = new Image();
  img.src = baseResult.data2d;
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

  const canvas = document.createElement('canvas');
  canvas.width  = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0);
  ctx.save();
  ctx.scale(dpr, dpr);

  const colors = [highColor, highColor, lowColor, lowColor];
  overlayResult.frozenLines.forEach((line, i) => {
    const y = toY(line.v);
    if (y < marginT - 2 || y > marginT + ph + 2) return;

    const col = colors[i] || '#c8cad8';

    ctx.strokeStyle = col;
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(marginL, y);
    ctx.lineTo(lineEndX, y);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.globalAlpha = 0.9;

    const label = prefix + ' $' + line.v.toFixed(2);
    ctx.font = 'bold 11px IBM Plex Mono, monospace';
    const tw = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(lineEndX + 3, y - 9, tw + 6, 18);
    ctx.fillStyle = col;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, lineEndX + 6, y);
  });

  ctx.globalAlpha = 1.0;
  ctx.restore();

  const newData2d = canvas.toDataURL('image/jpeg', 0.9);
  return { ...baseResult, data2d: newData2d };
}

// Generates one timeframe chart using bayesain.html's own defaults — only the
// stock price (s0) and annotation label are injected. Sigma, bandMult, nPaths,
// and nSteps are left exactly as Luke set them in the HTML.
export async function generateChartInBrowser({ s0, ticker = '', timeframe = 'daily' }) {
  const cfg        = TIMEFRAME_CONFIG[timeframe] || TIMEFRAME_CONFIG.daily;
  const today      = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const annotation = [`$${ticker}`, today, cfg.label].filter(Boolean).join('   ');

  const res  = await fetch('/bayesain.html');
  let html   = await res.text();

  // Prevent auto-run — we trigger run() manually after setting inputs
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

        // Only set the stock price — everything else uses Luke's HTML defaults
        const s0El = doc.getElementById('s0');
        s0El.value = s0;
        s0El.dispatchEvent(new Event('input', { bubbles: true }));

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

            // Read the frozen stdev band lines — these are the PPL levels Luke reads off the chart
            const args        = win._lastDrawArgs;
            const frozenLines = args?.[11] || null;

            // Compute y-scale info needed for overlay drawing later
            let yMin = Infinity, yMax = -Infinity;
            const allPaths = args?.[0] || [];
            allPaths.forEach(path => path.forEach(v => {
              if (v < yMin) yMin = v;
              if (v > yMax) yMax = v;
            }));
            yMin = Math.min(yMin, s0);
            yMax = Math.max(yMax, s0);
            if (frozenLines) frozenLines.forEach(fl => {
              yMin = Math.min(yMin, fl.v);
              yMax = Math.max(yMax, fl.v);
            });
            const pad = (yMax - yMin) * 0.06;
            yMin -= pad;
            yMax += pad;

            const dpr  = win.devicePixelRatio || 1;
            const W    = canvas2d ? canvas2d.width  / dpr : 1200;
            const H    = canvas2d ? canvas2d.height / dpr : 700;
            const marginL = 72, marginT = 20, marginB = 44;
            const marginR = W - marginL - Math.floor((W - marginL - 8) * 0.81);
            const pw      = (W - marginL - marginR) * 0.77;
            const ph      = H - marginT - marginB;

            // Map frozenLines to named PPL values (0=outer high, 1=inner high, 2=inner low, 3=outer low)
            const pplHigh = frozenLines?.[0]?.v ?? null;
            const pplLow  = frozenLines?.[3]?.v ?? null;
            const pplMode = parseFloat(doc.getElementById('triMode')?.value) || s0;

            cleanup();
            resolve({
              data2d, data3d, upPct, timeframe,
              frozenLines, pplHigh, pplLow, pplMode,
              // Y-scale info for add30minOverlay
              yMin, yMax, W, H, dpr, marginL, marginT, marginB, marginR, pw, ph,
            });
          } catch (err) { cleanup(); reject(err); }
        }, 9500);
      } catch (err) { clearTimeout(timeout); cleanup(); reject(err); }
    };

    iframe.onerror = () => { clearTimeout(timeout); cleanup(); reject(new Error('Failed to load chart tool')); };
  });
}

// Generates all 3 timeframes. The 2hr chart gets the 30min stdev bands overlaid
// so a single chart shows both timeframe perspectives — that combined chart is
// what gets posted.
export async function generateAllCharts({ s0, ticker }) {
  const [daily, twoHour_raw, thirtyMin] = await Promise.all([
    generateChartInBrowser({ s0, ticker, timeframe: 'daily'  }),
    generateChartInBrowser({ s0, ticker, timeframe: '2hr'    }),
    generateChartInBrowser({ s0, ticker, timeframe: '30min'  }),
  ]);

  // Daily chart shows both 2hr and 30min bands overlaid for full context
  // 2hr = purple, 30min = cyan/orange so they're visually distinct
  const dailyWith2hr  = await addTimeframeOverlay(daily,        twoHour_raw, '2H',  '#c084fc', '#f472b6');
  const dailyWithBoth = await addTimeframeOverlay(dailyWith2hr, thirtyMin,   '30m', '#7DF9FF', '#ff8c00');

  return { daily: dailyWithBoth, twoHour: twoHour_raw, thirtyMin };
}

export function chartSrc(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `/${path}`;
}
