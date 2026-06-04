import { useEffect, useState } from 'react';
import { get, post } from '../api';
import { generateChartInBrowser, chartSrc, computeBand, computeSigma } from '../utils/generateChart';
import ChartLightbox from './ChartLightbox';

const TIMEFRAMES = [
  { key: 'daily',  label: 'Daily',  pathKey: 'path2d'    },
  { key: '2hr',    label: '2-Hour', pathKey: 'path2hr'   },
  { key: '30min',  label: '30-Min', pathKey: 'path30min' },
];

export default function ChartViewer({ ticker, tickerData }) {
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState('daily');
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
    const tf = TIMEFRAMES.find(t => t.key === activeTimeframe);
    const src = chartSrc(chart?.[tf.pathKey]);
    if (!src) return;
    const a = document.createElement('a');
    a.href = src;
    a.download = `${ticker}-${activeTimeframe}-PPL-chart.jpg`;
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
      const chartData = await generateChartInBrowser({
        s0: tickerData.price,
        sigma: tickerData.sigma || computeSigma(iv),
        band: computeBand(iv),
        ticker,
        pplLow: tickerData.pplLow,
        pplMode: tickerData.pplMode,
        pplHigh: tickerData.pplHigh,
        timeframe: activeTimeframe,
      });

      const result = await post(`/api/charts/upload/${ticker}`, {
        chartData2d: chartData.data2d,
        chartData3d: chartData.data3d,
        upPct: chartData.upPct,
        timeframe: activeTimeframe,
      });

      setChart(prev => ({ ...prev, ...result }));
    } catch (err) {
      setError(err.message);
    } finally {
      clearInterval(timer);
      setRegenerating(false);
      setElapsed(0);
    }
  }

  const tf = TIMEFRAMES.find(t => t.key === activeTimeframe);
  const currentPath = chart?.[tf.pathKey];
  const currentSrc = chartSrc(currentPath);

  const containerStyle = {
    background: '#0c0e17', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.75rem', overflow: 'hidden', position: 'relative',
  };

  const tabStyle = (active) => ({
    fontFamily: 'monospace', fontSize: '0.7rem', background: 'transparent',
    border: 'none', cursor: 'pointer', padding: '6px 10px',
    color: active ? '#7DF9FF' : '#6b6e85',
    borderBottom: active ? '2px solid #7DF9FF' : '2px solid transparent',
    transition: 'color 0.15s',
  });

  if (loading) return (
    <div style={{ ...containerStyle, height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#6b6e85', fontFamily: 'monospace', fontSize: '0.875rem' }}>Loading chart…</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {lightbox && <ChartLightbox src={lightbox} onClose={() => setLightbox(null)} />}

      {/* Timeframe tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {TIMEFRAMES.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTimeframe(t.key)}
            style={tabStyle(activeTimeframe === t.key)}
            onMouseOver={e => { if (activeTimeframe !== t.key) e.target.style.color = '#c8cad8'; }}
            onMouseOut={e => { if (activeTimeframe !== t.key) e.target.style.color = '#6b6e85'; }}
          >
            {t.label}
            {chart?.[t.pathKey] && (
              <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', background: '#4ade80', marginLeft: '5px', verticalAlign: 'middle' }} />
            )}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={containerStyle}>
        {currentSrc ? (
          <img
            src={currentSrc}
            alt={`${ticker} ${tf.label} PPL chart`}
            onClick={() => setLightbox(currentSrc)}
            style={{ width: '100%', display: 'block', cursor: 'zoom-in' }}
          />
        ) : (
          <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#6b6e85', fontFamily: 'monospace', fontSize: '0.875rem' }}>No {tf.label} chart yet</span>
            <span style={{ color: '#6b6e85', fontFamily: 'monospace', fontSize: '0.75rem' }}>Click Generate (~10 seconds)</span>
          </div>
        )}

        {currentSrc && (
          <button
            onClick={handleDownload}
            title="Download chart"
            style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', fontSize: '0.75rem', fontFamily: 'monospace', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.7)', color: '#c8cad8', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', transition: 'border-color 0.15s,color 0.15s' }}
            onMouseOver={e => { e.target.style.borderColor = '#7DF9FF'; e.target.style.color = '#7DF9FF'; }}
            onMouseOut={e => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; e.target.style.color = '#c8cad8'; }}
          >
            ↓ Download
          </button>
        )}
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', fontSize: '0.75rem', fontFamily: 'monospace', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.7)', color: '#c8cad8', padding: '6px 10px', borderRadius: '6px', cursor: regenerating ? 'not-allowed' : 'pointer', opacity: regenerating ? 0.6 : 1, transition: 'border-color 0.15s' }}
          onMouseOver={e => { if (!regenerating) { e.target.style.borderColor = '#7DF9FF'; e.target.style.color = '#7DF9FF'; } }}
          onMouseOut={e => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; e.target.style.color = '#c8cad8'; }}
        >
          {regenerating ? `Generating… ${elapsed}s` : 'Generate'}
        </button>
      </div>

      {error && <p style={{ color: '#f87171', fontSize: '0.75rem', fontFamily: 'monospace' }}>{error}</p>}
    </div>
  );
}
