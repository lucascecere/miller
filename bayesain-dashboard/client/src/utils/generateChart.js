// bandMult formula from Luke's spreadsheet: IV × √(52/7)
// This is the base Band value for the PPL generator (same as Luke's 30-min column baseline)
export function computeBand(annualIV) {
  return annualIV * Math.sqrt(52 / 7);
}

export async function generateChartInBrowser({ s0, sigma, band, low, mode, high, steps = 252, paths = 120 }) {
  const res = await fetch('/bayesain.html');
  let html = await res.text();
  // Strip auto-run at the bottom so we control when it fires
  html = html.replace(/syncTri\(\);\s*\nrun\(\);/, 'syncTri();');

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

        // Set s0 and trigger syncTri() via its oninput handler
        const s0El = doc.getElementById('s0');
        s0El.value = s0;
        s0El.dispatchEvent(new Event('input', { bubbles: true }));

        // Set all parameters matching Luke's workflow:
        // sigma = IV / sqrt(252)  — daily volatility
        // band  = IV × sqrt(52/7) — from spreadsheet formula
        // triLow/Mode/High        — from IV-derived lognormal (or manual override)
        doc.getElementById('sigma').value = sigma;
        if (band != null) doc.getElementById('bandMult').value = band;
        doc.getElementById('triLow').value = low;
        doc.getElementById('triMode').value = mode;
        doc.getElementById('triHigh').value = high;
        doc.getElementById('nPaths').value = paths;
        doc.getElementById('nSteps').value = steps;

        win.run();

        setTimeout(() => {
          try {
            clearTimeout(timeout);
            const canvas2d = doc.getElementById('c');
            const data2d = canvas2d ? canvas2d.toDataURL('image/jpeg', 0.9) : null;

            let data3d = null;
            const wrap3d = doc.getElementById('c3d-wrap');
            if (wrap3d && wrap3d.style.display !== 'none') {
              const canvas3d = doc.getElementById('c3d');
              if (canvas3d) data3d = canvas3d.toDataURL('image/jpeg', 0.9);
            }

            cleanup();
            resolve({ data2d, data3d });
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
