import { useEffect, useState } from 'react';
import { get, post } from '../api';
import { generateAllCharts, chartSrc } from '../utils/generateChart';
import ChartLightbox from './ChartLightbox';

const TABS = [
  { id: '2hr',   label: '2-Hour' },
  { id: '30min', label: '30-Min' },
];

export default function ChartViewer({ ticker, tickerData, onRegenerated }) {
  const [chart, setChart]               = useState(null);
  const [activeTab, setActiveTab]       = useState('2hr');
  const [loading, setLoading]           = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [elapsed, setElapsed]           = useState(0);
  const [lightbox, setLightbox]         = useState(null);
  const [error, setError]               = useState('');

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

  function srcForTab(tab) {
    if (!chart) return null;
    if (tab === '2hr')   return chartSrc(chart.path2hr);
    if (tab === '30min') return chartSrc(chart.path30min);
    return null;
  }

  function handleDownload() {
    const src = srcForTab(activeTab);
    if (!src) return;
    const a = document.createElement('a');
    a.href     = src;
    a.download = `${ticker}-PPL-${activeTab}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function handleRegenerate() {
    if (!tickerData?.price) return setError('No price data — run Refresh Prices first');
    setRegenerating(true);
    setError('');
    setElapsed(0);

    const timer = setInterval(() => setElapsed(s => s + 1), 1000);
    try {
      const iv = tickerData?.iv_current || tickerData?.ivCurrent || 0.30;
      const { twoHour, thirtyMin } = await generateAllCharts({
        s0: tickerData.price,
        iv,
        ticker,
      });

      await Promise.all([
        post(`/api/charts/upload/${ticker}`, {
          chartData2d: twoHour.data2d,
          upPct:       twoHour.upPct,
          timeframe:   '2hr',
          pplLow:      twoHour.pplLow,
          pplMode:     twoHour.pplMode,
          pplHigh:     twoHour.pplHigh,
        }),
        post(`/api/charts/upload/${ticker}`, {
          chartData2d: thirtyMin.data2d,
          upPct:       thirtyMin.upPct,
          timeframe:   '30min',
          pplLow:      thirtyMin.pplLow,
          pplMode:     thirtyMin.pplMode,
          pplHigh:     thirtyMin.pplHigh,
        }),
      ]);

      await loadChart();
      if (onRegenerated) onRegenerated();
    } catch (err) {
      setError(err.message);
    } finally {
      clearInterval(timer);
      setRegenerating(false);
      setElapsed(0);
    }
  }

  const currentSrc = srcForTab(activeTab);

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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          const hasSrc = !!srcForTab(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontFamily: 'monospace', fontSize: '0.7rem',
                padding: '4px 10px', borderRadius: '5px', cursor: 'pointer',
                border: active ? '1px solid #7DF9FF' : '1px solid rgba(255,255,255,0.15)',
                color: active ? '#7DF9FF' : hasSrc ? '#c8cad8' : '#6b6e85',
                background: active ? 'rgba(125,249,255,0.08)' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

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
            <span style={{ color: '#6b6e85', fontFamily: 'monospace', fontSize: '0.75rem' }}>Click Generate (~30 seconds)</span>
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
