// Band formula from Luke's spreadsheet: IV × √(52/7)
export function computeBand(annualIV) {
  return annualIV * Math.sqrt(52 / 7);
}

// sigma formula: IV / √252 (daily volatility for 252-step daily chart)
export function computeSigma(annualIV) {
  return annualIV / Math.sqrt(252);
}

export async function generateChartInBrowser({ s0, sigma, band, steps = 252, paths = 120 }) {
  const res = await fetch('/bayesain.html');
  let html = await res.text();
  // Strip the auto-run so we control when it fires
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

        // Set S₀ — this triggers oninput="syncTri()" which automatically
        // computes triLow = S₀×0.93, triMode = S₀, triHigh = S₀×1.07.
        // We do NOT override those — the HTML handles PPL levels itself.
        const s0El = doc.getElementById('s0');
        s0El.value = s0;
        s0El.dispatchEvent(new Event('input', { bubbles: true }));

        // sigma = IV / √252  (from spreadsheet formula)
        // band  = IV × √(52/7) (from spreadsheet formula)
        doc.getElementById('sigma').value = sigma;
        if (band != null) doc.getElementById('bandMult').value = band;
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
