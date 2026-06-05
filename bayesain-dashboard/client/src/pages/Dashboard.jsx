import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../api';
import TickerCard from '../components/TickerCard';
import Layout from '../components/Layout';
import ThreadModal from '../components/ThreadModal';
import { useIsMobile } from '../hooks/useIsMobile';

export default function Dashboard() {
  const navigate  = useNavigate();
  const isMobile  = useIsMobile();
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');
  const [showThread, setShowThread] = useState(false);
  const [settings, setSettings] = useState({});
  const [doneTickers, setDoneTickers] = useState([]);
  const [openResults, setOpenResults] = useState([]);
  const [checkingResults, setCheckingResults] = useState(false);

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

  async function loadSettings() {
    try {
      const s = await get('/api/settings');
      setSettings(s || {});
    } catch {}
  }

  async function loadOpenResults() {
    try {
      const data = await get('/api/results/open');
      const filtered = (data || []).filter(r =>
        r.is_close === true ||
        r.result_status === 'HIT_HIGH' ||
        r.result_status === 'HIT_LOW'
      );
      setOpenResults(filtered);
    } catch {}
  }

  useEffect(() => {
    loadTickers();
    loadSettings();
    loadOpenResults();
  }, []);

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

  async function handleCheckResults() {
    setCheckingResults(true);
    try {
      await post('/api/results/check');
      await loadOpenResults();
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckingResults(false);
    }
  }

  function buildSchedule() {
    const startTime = settings.schedule_start_time || '09:00';
    const spacing = parseInt(settings.schedule_spacing_minutes || 20, 10);
    const sorted = [...tickers].sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));
    const [startH, startM] = startTime.split(':').map(Number);
    return sorted.map((t, i) => {
      const totalMinutes = startH * 60 + startM + i * spacing;
      const h = Math.floor(totalMinutes / 60) % 24;
      const m = totalMinutes % 60;
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      const timeStr = `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
      return { timeStr, symbol: t.symbol, priority_score: t.priority_score || 0 };
    });
  }

  const schedule = buildSchedule();

  const labelStyle = {
    fontSize: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase',
    letterSpacing: '0.1em', color: '#6b6e85', marginBottom: '0.5rem',
  };

  const btnBase = {
    fontSize: '0.875rem', fontFamily: 'monospace', background: 'transparent',
    padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer',
    transition: 'border-color 0.15s, background 0.15s',
  };

  const resultStatusLabel = (status) => {
    if (status === 'HIT_HIGH') return { label: 'HIT', bg: 'rgba(34,197,94,0.15)', color: '#4ade80' };
    if (status === 'HIT_LOW') return { label: 'HIT', bg: 'rgba(34,197,94,0.15)', color: '#4ade80' };
    return { label: 'CLOSE', bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' };
  };

  return (
    <Layout>
      {/* Action bar */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '0.75rem 1rem 0' : '1rem 1.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {statusMsg && <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#7DF9FF' }}>{statusMsg}</span>}
            {error && <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#f87171' }}>{error}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleRefresh}
              disabled={refreshing || generating}
              style={{ ...btnBase, border: '1px solid rgba(255,255,255,0.2)', color: '#c8cad8', opacity: (refreshing || generating) ? 0.5 : 1, cursor: (refreshing || generating) ? 'not-allowed' : 'pointer' }}
              onMouseOver={e => { if (!(refreshing || generating)) e.target.style.borderColor = 'rgba(255,255,255,0.5)'; }}
              onMouseOut={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
            >
              {refreshing ? 'Refreshing…' : 'Refresh Prices'}
            </button>
            <button
              onClick={handleGenerateAll}
              disabled={generating || refreshing}
              style={{ ...btnBase, border: '1px solid rgba(125,249,255,0.6)', color: '#7DF9FF', opacity: (generating || refreshing) ? 0.5 : 1, cursor: (generating || refreshing) ? 'not-allowed' : 'pointer' }}
              onMouseOver={e => { if (!(generating || refreshing)) e.target.style.background = 'rgba(125,249,255,0.1)'; }}
              onMouseOut={e => e.target.style.background = 'transparent'}
            >
              {generating ? 'Generating…' : 'Generate All Charts'}
            </button>
            <button
              onClick={handleCheckResults}
              disabled={checkingResults}
              style={{ ...btnBase, border: '1px solid rgba(251,191,36,0.5)', color: '#fbbf24', opacity: checkingResults ? 0.5 : 1, cursor: checkingResults ? 'not-allowed' : 'pointer' }}
              onMouseOver={e => { if (!checkingResults) e.target.style.background = 'rgba(251,191,36,0.08)'; }}
              onMouseOut={e => e.target.style.background = 'transparent'}
            >
              {checkingResults ? 'Checking…' : 'Check Results'}
            </button>
            <button
              onClick={() => setShowThread(true)}
              style={{ ...btnBase, border: '1px solid rgba(125,249,255,0.4)', color: '#7DF9FF' }}
              onMouseOver={e => e.target.style.background = 'rgba(125,249,255,0.1)'}
              onMouseOut={e => e.target.style.background = 'transparent'}
            >
              Build Thread
            </button>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '1rem' : '1.5rem', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 3fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Left column — schedule + predictions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: isMobile ? 'static' : 'sticky', top: '68px' }}>

          {openResults.length > 0 && (
            <div>
              <div style={labelStyle}>PREDICTIONS TO CHECK</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {openResults.map((r, i) => {
                  const { label, bg, color } = resultStatusLabel(r.result_status);
                  return (
                    <div key={i} style={{ background: '#0c0e17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#7DF9FF', fontSize: '0.9rem' }}>{r.symbol}</span>
                          <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: '4px', fontSize: '0.55rem', fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', background: bg, color }}>{label}</span>
                        </div>
                        <button
                          onClick={() => navigate(`/post/${r.symbol}?result=true`)}
                          style={{ fontSize: '0.7rem', fontFamily: 'monospace', border: '1px solid rgba(34,197,94,0.5)', color: '#4ade80', background: 'transparent', padding: '3px 8px', borderRadius: '5px', cursor: 'pointer' }}
                          onMouseOver={e => e.target.style.background = 'rgba(34,197,94,0.08)'}
                          onMouseOut={e => e.target.style.background = 'transparent'}
                        >
                          Post Result
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#c8cad8' }}>Called ${r.ppl_high} / ${r.ppl_low}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#6b6e85' }}>Now ${r.current_price}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tickers.length > 0 && schedule.length > 0 && (
            <div>
              <div style={labelStyle}>TODAY'S SCHEDULE</div>
              <div style={{ background: '#0c0e17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '0.6rem 0.875rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '72px 56px 1fr 32px', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                  {['Time','Ticker','Priority',''].map(h => (
                    <span key={h} style={{ fontSize: '0.55rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6e85' }}>{h}</span>
                  ))}
                </div>
                {schedule.map(({ timeStr, symbol, priority_score }) => {
                  const done = doneTickers.includes(symbol);
                  return (
                    <div
                      key={symbol}
                      style={{
                        display: 'grid', gridTemplateColumns: '72px 56px 1fr 32px', gap: '6px',
                        alignItems: 'center', padding: '5px 0',
                        borderTop: '1px solid rgba(255,255,255,0.04)',
                        background: done ? 'rgba(34,197,94,0.04)' : 'transparent',
                      }}
                    >
                      <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: done ? '#6b6e85' : '#c8cad8' }}>{timeStr}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700, color: done ? '#6b6e85' : '#7DF9FF' }}>{symbol}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: done ? '#6b6e85' : '#c8cad8' }}>{priority_score}</span>
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => setDoneTickers(prev => done ? prev.filter(s => s !== symbol) : [...prev, symbol])}
                        style={{ accentColor: '#7DF9FF', cursor: 'pointer', width: '14px', height: '14px' }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right column — ticker list */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#6b6e85', fontFamily: 'monospace', marginTop: '5rem' }}>Loading tickers…</div>
          ) : tickers.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '5rem' }}>
              <p style={{ color: '#6b6e85', fontFamily: 'monospace', marginBottom: '1rem' }}>No price data yet.</p>
              <button
                onClick={handleRefresh}
                style={{ fontFamily: 'monospace', border: '1px solid rgba(125,249,255,0.6)', color: '#7DF9FF', background: 'transparent', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}
              >
                Refresh Prices Now
              </button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#6b6e85', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                {tickers.length} tickers — sorted by priority
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tickers.map(t => (
                  <TickerCard key={t.symbol} ticker={t} onChartGenerated={loadTickers} />
                ))}
              </div>
            </>
          )}
        </div>

      </main>

      {showThread && <ThreadModal onClose={() => setShowThread(false)} />}
    </Layout>
  );
}
