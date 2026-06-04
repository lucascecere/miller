import { useEffect, useState } from 'react';
import { get, post } from '../api';
import { generateAllCharts, chartSrc, computeBand, computeSigma } from '../utils/generateChart';
import ChartLightbox from './ChartLightbox';

export default function ChartViewer({ ticker, tickerData, onRegenerated }) {
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const [error, setError] = useState('');

  async function loadChart() {
    try {
      const data = await get(`/api/charts/latest/${ticker}`);
      setChart(data);
    } catch {
      setChart(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadChart(); }, [ticker]);

  function handleDownload() {
    const src = chartSrc(chart?.path2d);
    if (!src) return;
    const a = document.createElement('a');
    a.href = src;
    a.download = `${ticker}-PPL-chart.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function handleRegenerate() {
    if (!tickerData?.price) return setError('No price data — go back and run Refresh Prices first');
    setRegenerating(true);
    setError('');
    setElapsed(0);

    const timer = setInterval(() => setElapsed(s => s + 1), 1000);
    try {
      const iv = tickerData.ivCurrent || 0.20;
      const [daily] = await generateAllCharts({
        s0:    tickerData.price,
        sigma: tickerData.sigma || computeSigma(iv),
        band:  computeBand(iv),
        ticker,
      });

      const result = await post(`/api/charts/upload/${ticker}`, {
        chartData2d: daily.data2d,
        chartData3d: daily.data3d,
        upPct:       daily.upPct,
        timeframe:   'daily',
        pplLow:      daily.pplLow,
        pplMode:     daily.pplMode,
        pplHigh:     daily.pplHigh,
      });

      setChart(prev => ({ ...prev, path2d: result.path2d, path3d: result.path3d }));

      // Tell PostView to reload data so tweet templates + PPL levels stay in sync
      if (onRegenerated) onRegenerated();
    } catch (err) {
      setError(err.message);
    } finally {
      clearInterval(timer);
      setRegenerating(false);
      setElapsed(0);
    }
  }

  const currentSrc = chartSrc(chart?.path2d);

  const containerStyle = {
    background: '#0c0e17', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.75rem', overflow: 'hidden', position: 'relative',
  };

  if (loading) return (
    <div style={{ ...containerStyle, height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#6b6e85', fontFamily: 'monospace', fontSize: '0.875rem' }}>Loading chart…</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {lightbox && <ChartLightbox src={lightbox} onClose={() => setLightbox(null)} />}

      <div style={containerStyle}>
        {currentSrc ? (
          <img
            src={currentSrc}
            alt={`${ticker} PPL chart`}
            onClick={() => setLightbox(currentSrc)}
            style={{ width: '100%', display: 'block', cursor: 'zoom-in' }}
          />
        ) : (
          <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#6b6e85', fontFamily: 'monospace', fontSize: '0.875rem' }}>No chart yet for today</span>
            <span style={{ color: '#6b6e85', fontFamily: 'monospace', fontSize: '0.75rem' }}>Click Generate (~10 seconds)</span>
          </div>
        )}

        {currentSrc && (
          <button
            onClick={handleDownload}
            style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', fontSize: '0.75rem', fontFamily: 'monospace', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.7)', color: '#c8cad8', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', transition: 'border-color 0.15s,color 0.15s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#7DF9FF'; e.currentTarget.style.color = '#7DF9FF'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#c8cad8'; }}
          >
            ↓ Download
          </button>
        )}

        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', fontSize: '0.75rem', fontFamily: 'monospace', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.7)', color: '#c8cad8', padding: '6px 10px', borderRadius: '6px', cursor: regenerating ? 'not-allowed' : 'pointer', opacity: regenerating ? 0.6 : 1, transition: 'border-color 0.15s' }}
          onMouseOver={e => { if (!regenerating) { e.currentTarget.style.borderColor = '#7DF9FF'; e.currentTarget.style.color = '#7DF9FF'; } }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#c8cad8'; }}
        >
          {regenerating ? `Generating… ${elapsed}s` : 'Generate'}
        </button>
      </div>

      {error && <p style={{ color: '#f87171', fontSize: '0.75rem', fontFamily: 'monospace' }}>{error}</p>}
    </div>
  );
}
