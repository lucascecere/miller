export function computeBand(annualIV) {
  return annualIV * Math.sqrt(52 / 7);
}

export function computeSigma(annualIV) {
  return annualIV / Math.sqrt(252);
}

const TIMEFRAME_CONFIG = {
  daily:  { stepsPerDay: 1,  horizonDays: 252, label: 'Daily'  },
  '2hr':  { stepsPerDay: 3.25, horizonDays: 5,  label: '2-Hour' },
  '30min':{ stepsPerDay: 13,  horizonDays: 2,  label: '30-Min' },
};

export async function generateChartInBrowser({
  s0, sigma, band,
  ticker = '', pplLow = null, pplMode = null, pplHigh = null,
  timeframe = 'daily', paths = 120,
}) {
  const cfg = TIMEFRAME_CONFIG[timeframe] || TIMEFRAME_CONFIG.daily;
  const steps = Math.round(cfg.stepsPerDay * cfg.horizonDays);

  // Scale daily sigma to per-step sigma for the chosen timeframe
  const scaledSigma = cfg.stepsPerDay === 1
    ? sigma
    : sigma / Math.sqrt(cfg.stepsPerDay);

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const pplLabel = (pplLow != null && pplHigh != null)
    ? `L:$${Number(pplLow).toFixed(0)}  M:$${Number(pplMode ?? s0).toFixed(0)}  H:$${Number(pplHigh).toFixed(0)}`
    : '';
  const annotation = [`$${ticker}`, today, pplLabel].filter(Boolean).join('   ');

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

        // Auto-label: ticker + date + PPL levels on chart, timeframe on x-axis
        const commentEl = doc.getElementById('chartComment');
        if (commentEl) commentEl.value = annotation;
        const xAxisEl = doc.getElementById('xAxisComment');
        if (xAxisEl) xAxisEl.value = cfg.label;

        win.run();

        setTimeout(() => {
          try {
            clearTimeout(timeout);
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
