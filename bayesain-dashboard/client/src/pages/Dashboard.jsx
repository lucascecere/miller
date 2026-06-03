import { useEffect, useState } from 'react';
import { get, post } from '../api';
import TickerCard from '../components/TickerCard';

export default function Dashboard() {
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');

  async function loadTickers() {
    try {
      const data = await get('/api/tickers');
      setTickers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTickers(); }, []);

  async function handleRefresh() {
    setRefreshing(true);
    setStatusMsg('Refreshing prices…');
    setError('');
    try {
      const result = await post('/api/tickers/refresh');
      setStatusMsg(`Refreshed ${result.refreshed} tickers`);
      await loadTickers();
    } catch (err) {
      setError(err.message);
      setStatusMsg('');
    } finally {
      setRefreshing(false);
    }
  }

  async function handleGenerateAll() {
    setGenerating(true);
    setStatusMsg('Generating top 10 charts (~2 min)…');
    setError('');
    try {
      const result = await post('/api/charts/generate-all', { limit: 10 });
      const success = (result.results || []).filter(r => r.success).length;
      const fail = (result.results || []).filter(r => !r.success).length;
      setStatusMsg(`Generated ${success} charts${fail ? `, ${fail} failed` : ''}`);
      await loadTickers();
    } catch (err) {
      setError(err.message);
      setStatusMsg('');
    } finally {
      setGenerating(false);
    }
  }

  const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });

  const headerStyle = {
    position:'sticky', top:0, zIndex:10,
    background:'rgba(10,12,21,0.95)', backdropFilter:'blur(8px)',
    borderBottom:'1px solid rgba(255,255,255,0.08)',
    padding:'1rem 1.5rem'
  };

  return (
    <div style={{minHeight:'100vh',background:'#07090f'}}>
      <header style={headerStyle}>
        <div style={{maxWidth:'900px',margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem',flexWrap:'wrap'}}>
          <div>
            <h1 style={{fontFamily:'monospace',fontWeight:700,color:'white',letterSpacing:'0.1em',textTransform:'uppercase',margin:0}}>
              BAYES<span style={{color:'#7DF9FF'}}>AIn</span> Dashboard
            </h1>
            <p style={{color:'#6b6e85',fontSize:'0.75rem',fontFamily:'monospace',margin:'2px 0 0'}}>{today}</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'0.75rem',flexWrap:'wrap'}}>
            {statusMsg && <span style={{fontSize:'0.75rem',fontFamily:'monospace',color:'#7DF9FF'}}>{statusMsg}</span>}
            {error && <span style={{fontSize:'0.75rem',fontFamily:'monospace',color:'#f87171'}}>{error}</span>}
            <button
              onClick={handleRefresh}
              disabled={refreshing || generating}
              style={{fontSize:'0.875rem',fontFamily:'monospace',border:'1px solid rgba(255,255,255,0.2)',color:'#c8cad8',background:'transparent',padding:'0.5rem 1rem',borderRadius:'0.5rem',cursor:(refreshing||generating)?'not-allowed':'pointer',opacity:(refreshing||generating)?0.5:1,transition:'border-color 0.15s'}}
              onMouseOver={e=>{if(!(refreshing||generating))e.target.style.borderColor='rgba(255,255,255,0.5)';}}
              onMouseOut={e=>e.target.style.borderColor='rgba(255,255,255,0.2)'}
            >
              {refreshing ? 'Refreshing…' : 'Refresh Prices'}
            </button>
            <button
              onClick={handleGenerateAll}
              disabled={generating || refreshing}
              style={{fontSize:'0.875rem',fontFamily:'monospace',border:'1px solid rgba(125,249,255,0.6)',color:'#7DF9FF',background:'transparent',padding:'0.5rem 1rem',borderRadius:'0.5rem',cursor:(generating||refreshing)?'not-allowed':'pointer',opacity:(generating||refreshing)?0.5:1,transition:'background 0.15s'}}
              onMouseOver={e=>{if(!(generating||refreshing))e.target.style.background='rgba(125,249,255,0.1)';}}
              onMouseOut={e=>e.target.style.background='transparent'}
            >
              {generating ? 'Generating…' : 'Generate All Charts'}
            </button>
          </div>
        </div>
      </header>

      <main style={{maxWidth:'900px',margin:'0 auto',padding:'1.5rem'}}>
        {loading ? (
          <div style={{textAlign:'center',color:'#6b6e85',fontFamily:'monospace',marginTop:'5rem'}}>Loading tickers…</div>
        ) : tickers.length === 0 ? (
          <div style={{textAlign:'center',marginTop:'5rem'}}>
            <p style={{color:'#6b6e85',fontFamily:'monospace',marginBottom:'1rem'}}>No price data yet.</p>
            <button
              onClick={handleRefresh}
              style={{fontFamily:'monospace',border:'1px solid rgba(125,249,255,0.6)',color:'#7DF9FF',background:'transparent',padding:'0.75rem 1.5rem',borderRadius:'0.5rem',cursor:'pointer'}}
            >
              Refresh Prices Now
            </button>
          </div>
        ) : (
          <>
            <div style={{fontSize:'0.7rem',fontFamily:'monospace',color:'#6b6e85',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'1rem'}}>
              {tickers.length} tickers — sorted by priority
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              {tickers.map(t => (
                <TickerCard key={t.symbol} ticker={t} onChartGenerated={loadTickers} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
