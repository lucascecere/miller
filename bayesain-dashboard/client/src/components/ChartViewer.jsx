import { useEffect, useState } from 'react';
import { get, post } from '../api';
import { generateChartInBrowser, chartSrc, computeBand, computeSigma } from '../utils/generateChart';
import ChartLightbox from './ChartLightbox';

async function downloadChart(url, filename) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, '_blank');
  }
}

function DownloadBtn({ url, filename }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); downloadChart(url, filename); }}
      title="Download chart"
      style={{fontSize:'0.75rem',fontFamily:'monospace',border:'1px solid rgba(255,255,255,0.2)',background:'rgba(0,0,0,0.7)',color:'#c8cad8',padding:'6px 8px',borderRadius:'6px',cursor:'pointer',transition:'border-color 0.15s,color 0.15s',display:'flex',alignItems:'center',gap:'4px'}}
      onMouseOver={e=>{e.currentTarget.style.borderColor='#7DF9FF';e.currentTarget.style.color='#7DF9FF';}}
      onMouseOut={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.2)';e.currentTarget.style.color='#c8cad8';}}
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 12l-4-4h2.5V2h3v6H12L8 12z"/>
        <path d="M2 14h12v-1.5H2V14z"/>
      </svg>
    </button>
  );
}

export default function ChartViewer({ ticker, tickerData }) {
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [show3d, setShow3d] = useState(false);
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
      });

      const result = await post(`/api/charts/upload/${ticker}`, {
        chartData2d: chartData.data2d,
        chartData3d: chartData.data3d,
      });

      setChart(result);
    } catch (err) {
      setError(err.message);
    } finally {
      clearInterval(timer);
      setRegenerating(false);
      setElapsed(0);
    }
  }

  const containerStyle = {
    background:'#0c0e17', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:'0.75rem', overflow:'hidden', position:'relative'
  };

  if (loading) return (
    <div style={{...containerStyle, height:'200px', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <span style={{color:'#6b6e85',fontFamily:'monospace',fontSize:'0.875rem'}}>Loading chart…</span>
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
      {lightbox && <ChartLightbox src={lightbox} onClose={() => setLightbox(null)} />}
      <div style={containerStyle}>
        {chart ? (
          <img
            src={chartSrc(chart.path2d)}
            alt={`${ticker} PPL chart`}
            onClick={() => setLightbox(chartSrc(chart.path2d))}
            style={{width:'100%',display:'block',cursor:'zoom-in'}}
          />
        ) : (
          <div style={{height:'200px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'0.5rem'}}>
            <span style={{color:'#6b6e85',fontFamily:'monospace',fontSize:'0.875rem'}}>No chart yet for today</span>
            <span style={{color:'#6b6e85',fontFamily:'monospace',fontSize:'0.75rem'}}>Click Regenerate to create one (~10 seconds)</span>
          </div>
        )}
        <div style={{position:'absolute',top:'0.75rem',right:'0.75rem',display:'flex',gap:'6px',alignItems:'center'}}>
          {chart && <DownloadBtn url={chartSrc(chart.path2d)} filename={`${ticker}_2d.jpg`} />}
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            style={{fontSize:'0.75rem',fontFamily:'monospace',border:'1px solid rgba(255,255,255,0.2)',background:'rgba(0,0,0,0.7)',color:'#c8cad8',padding:'6px 10px',borderRadius:'6px',cursor:regenerating?'not-allowed':'pointer',opacity:regenerating?0.6:1,transition:'border-color 0.15s'}}
            onMouseOver={e=>{if(!regenerating){e.target.style.borderColor='#7DF9FF';e.target.style.color='#7DF9FF';}}}
            onMouseOut={e=>{e.target.style.borderColor='rgba(255,255,255,0.2)';e.target.style.color='#c8cad8';}}
          >
            {regenerating ? `Generating… ${elapsed}s` : 'Regenerate'}
          </button>
        </div>
      </div>

      {error && <p style={{color:'#f87171',fontSize:'0.75rem',fontFamily:'monospace'}}>{error}</p>}

      {chart && chart.path3d && (
        <div>
          <button
            onClick={() => setShow3d(!show3d)}
            style={{fontSize:'0.75rem',fontFamily:'monospace',color:'#6b6e85',background:'transparent',border:'none',cursor:'pointer',padding:0}}
            onMouseOver={e=>e.target.style.color='#c8cad8'}
            onMouseOut={e=>e.target.style.color='#6b6e85'}
          >
            {show3d ? '▲ Hide 3D View' : '▼ Show 3D View'}
          </button>
          {show3d && (
            <div style={{...containerStyle,marginTop:'0.5rem',position:'relative'}}>
              <img
                src={chartSrc(chart.path3d)}
                alt={`${ticker} 3D chart`}
                onClick={() => setLightbox(chartSrc(chart.path3d))}
                style={{width:'100%',display:'block',cursor:'zoom-in'}}
              />
              <div style={{position:'absolute',top:'0.75rem',right:'0.75rem'}}>
                <DownloadBtn url={chartSrc(chart.path3d)} filename={`${ticker}_3d.jpg`} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
