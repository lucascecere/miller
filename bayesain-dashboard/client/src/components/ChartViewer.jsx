import { useEffect, useState } from 'react';
import { get, post } from '../api';

export default function ChartViewer({ ticker }) {
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [show3d, setShow3d] = useState(false);
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
    setRegenerating(true);
    setError('');
    try {
      const result = await post(`/api/charts/generate/${ticker}`);
      setChart(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setRegenerating(false);
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
      <div style={containerStyle}>
        {chart ? (
          <img src={`/${chart.path2d}`} alt={`${ticker} PPL chart`} style={{width:'100%',display:'block'}} />
        ) : (
          <div style={{height:'200px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'0.5rem'}}>
            <span style={{color:'#6b6e85',fontFamily:'monospace',fontSize:'0.875rem'}}>No chart yet for today</span>
            <span style={{color:'#6b6e85',fontFamily:'monospace',fontSize:'0.75rem'}}>Click Regenerate to create one (~10 seconds)</span>
          </div>
        )}
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          style={{position:'absolute',top:'0.75rem',right:'0.75rem',fontSize:'0.75rem',fontFamily:'monospace',border:'1px solid rgba(255,255,255,0.2)',background:'rgba(0,0,0,0.7)',color:'#c8cad8',padding:'6px 10px',borderRadius:'6px',cursor:regenerating?'not-allowed':'pointer',opacity:regenerating?0.6:1,transition:'border-color 0.15s'}}
          onMouseOver={e=>{if(!regenerating){e.target.style.borderColor='#7DF9FF';e.target.style.color='#7DF9FF';}}}
          onMouseOut={e=>{e.target.style.borderColor='rgba(255,255,255,0.2)';e.target.style.color='#c8cad8';}}
        >
          {regenerating ? 'Generating (~10s)…' : 'Regenerate'}
        </button>
      </div>

      {error && <p style={{color:'#f87171',fontSize:'0.75rem',fontFamily:'monospace'}}>{error}</p>}
      {regenerating && <p style={{color:'#7DF9FF',fontSize:'0.75rem',fontFamily:'monospace'}}>Generating chart... (~10 seconds)</p>}

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
            <div style={{...containerStyle,marginTop:'0.5rem'}}>
              <img src={`/${chart.path3d}`} alt={`${ticker} 3D chart`} style={{width:'100%',display:'block'}} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
