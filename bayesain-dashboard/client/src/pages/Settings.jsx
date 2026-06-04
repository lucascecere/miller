import { useEffect, useState } from 'react';
import { get, post, put } from '../api';
import Layout from '../components/Layout';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [scheduleStart, setScheduleStart] = useState('09:00');
  const [scheduleSpacing, setScheduleSpacing] = useState(20);

  const [teamMembers, setTeamMembers] = useState([]);
  const [newMember, setNewMember] = useState('');

  const [influencers, setInfluencers] = useState([]);
  const [newInfluencer, setNewInfluencer] = useState('');

  const [adanosKey, setAdanosKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const [newTickerSymbol, setNewTickerSymbol] = useState('');
  const [newTickerName, setNewTickerName] = useState('');

  const [statusMsgs, setStatusMsgs] = useState({});

  function setMsg(section, msg) {
    setStatusMsgs(prev => ({ ...prev, [section]: msg }));
    setTimeout(() => setStatusMsgs(prev => ({ ...prev, [section]: '' })), 3000);
  }

  async function load() {
    try {
      const [s, t] = await Promise.all([get('/api/settings'), get('/api/tickers')]);
      setSettings(s || {});
      setTickers(t || []);
      setScheduleStart(s.schedule_start_time || '09:00');
      setScheduleSpacing(s.schedule_spacing_minutes || 20);
      const members = Array.isArray(s.team_members) ? s.team_members : [];
      setTeamMembers(members);
      const infl = Array.isArray(s.influencer_watch_list) ? s.influencer_watch_list : [];
      setInfluencers(infl);
      setAdanosKey(s.adanos_api_key || '');
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function saveSchedule() {
    try {
      await put('/api/settings', { schedule_start_time: scheduleStart, schedule_spacing_minutes: Number(scheduleSpacing) });
      setMsg('schedule', 'Saved');
    } catch { setMsg('schedule', 'Error saving'); }
  }

  async function saveTeamMembers() {
    try {
      await put('/api/settings', { team_members: teamMembers });
      setMsg('team', 'Saved');
    } catch { setMsg('team', 'Error saving'); }
  }

  async function saveInfluencers() {
    try {
      await put('/api/settings', { influencer_watch_list: influencers });
      setMsg('influencers', 'Saved');
    } catch { setMsg('influencers', 'Error saving'); }
  }

  async function saveAdanosKey() {
    try {
      await put('/api/settings', { adanos_api_key: adanosKey });
      setMsg('apikeys', 'Saved');
    } catch { setMsg('apikeys', 'Error saving'); }
  }

  async function handleAddTicker() {
    if (!newTickerSymbol.trim()) return;
    try {
      await post('/api/tickers', { symbol: newTickerSymbol.trim().toUpperCase(), company_name: newTickerName.trim() });
      setNewTickerSymbol('');
      setNewTickerName('');
      const t = await get('/api/tickers');
      setTickers(t || []);
      setMsg('tickers', 'Added');
    } catch { setMsg('tickers', 'Error adding'); }
  }

  async function handleDeleteTicker(symbol) {
    if (!window.confirm(`Delete ${symbol}?`)) return;
    try {
      await fetch(`/api/tickers/${symbol}`, { method: 'DELETE', credentials: 'include' });
      const t = await get('/api/tickers');
      setTickers(t || []);
    } catch {}
  }

  const sectionStyle = {
    background: '#0c0e17', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem',
  };

  const labelStyle = {
    fontSize: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase',
    letterSpacing: '0.1em', color: '#6b6e85', marginBottom: '0.5rem',
  };

  const inputStyle = {
    background: '#0f1120', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.5rem', padding: '0.5rem 0.75rem',
    color: 'white', fontFamily: 'monospace', fontSize: '0.875rem',
    outline: 'none', transition: 'border-color 0.15s',
  };

  const btnCyan = {
    fontSize: '0.8rem', fontFamily: 'monospace',
    border: '1px solid rgba(125,249,255,0.5)', color: '#7DF9FF',
    background: 'transparent', padding: '6px 14px', borderRadius: '6px',
    cursor: 'pointer', transition: 'background 0.15s',
  };

  const btnMuted = {
    fontSize: '0.8rem', fontFamily: 'monospace',
    border: '1px solid rgba(255,255,255,0.15)', color: '#6b6e85',
    background: 'transparent', padding: '6px 14px', borderRadius: '6px',
    cursor: 'pointer',
  };

  const chipStyle = (active) => ({
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '3px 10px 3px 10px', borderRadius: '20px',
    border: active ? '1px solid rgba(125,249,255,0.4)' : '1px solid rgba(255,255,255,0.12)',
    background: active ? 'rgba(125,249,255,0.08)' : 'transparent',
    fontFamily: 'monospace', fontSize: '0.75rem',
    color: active ? '#7DF9FF' : '#c8cad8',
    marginRight: '8px', marginBottom: '8px',
  });

  function Chip({ label, onRemove }) {
    return (
      <span style={chipStyle(false)}>
        {label}
        <button
          onClick={onRemove}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6e85', fontSize: '0.75rem', padding: 0, lineHeight: 1 }}
        >
          x
        </button>
      </span>
    );
  }

  if (loading) return (
    <Layout>
      <div style={{ textAlign: 'center', color: '#6b6e85', fontFamily: 'monospace', marginTop: '5rem' }}>Loading…</div>
    </Layout>
  );

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6e85', marginBottom: '1.25rem' }}>
          SETTINGS
        </div>

        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ ...labelStyle, marginBottom: 0, fontSize: '0.7rem', color: '#c8cad8' }}>TICKER WATCHLIST</div>
            {statusMsgs.tickers && <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#7DF9FF' }}>{statusMsgs.tickers}</span>}
          </div>
          {tickers.map(t => (
            <div key={t.symbol} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#7DF9FF', minWidth: '60px' }}>{t.symbol}</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#c8cad8', flex: 1 }}>{t.company_name || '—'}</span>
              <span style={chipStyle(t.is_core)}>{t.is_core ? 'Core' : 'Trending'}</span>
              <button
                onClick={() => handleDeleteTicker(t.symbol)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6e85', fontFamily: 'monospace', fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px' }}
                onMouseOver={e => e.target.style.color = '#f87171'}
                onMouseOut={e => e.target.style.color = '#6b6e85'}
              >
                x
              </button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <input
              placeholder="SYMBOL"
              value={newTickerSymbol}
              onChange={e => setNewTickerSymbol(e.target.value)}
              style={{ ...inputStyle, width: '100px' }}
              onFocus={e => e.target.style.borderColor = '#7DF9FF'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <input
              placeholder="Company name"
              value={newTickerName}
              onChange={e => setNewTickerName(e.target.value)}
              style={{ ...inputStyle, flex: 1, minWidth: '160px' }}
              onFocus={e => e.target.style.borderColor = '#7DF9FF'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <button style={btnCyan} onClick={handleAddTicker}
              onMouseOver={e => e.target.style.background = 'rgba(125,249,255,0.08)'}
              onMouseOut={e => e.target.style.background = 'transparent'}
            >
              Add Ticker
            </button>
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ ...labelStyle, marginBottom: 0, fontSize: '0.7rem', color: '#c8cad8' }}>POSTING SCHEDULE</div>
            {statusMsgs.schedule && <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#7DF9FF' }}>{statusMsgs.schedule}</span>}
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <div style={labelStyle}>Start Time</div>
              <input
                type="time"
                value={scheduleStart}
                onChange={e => setScheduleStart(e.target.value)}
                style={{ ...inputStyle, colorScheme: 'dark' }}
                onFocus={e => e.target.style.borderColor = '#7DF9FF'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <div>
              <div style={labelStyle}>Spacing (minutes)</div>
              <input
                type="number"
                value={scheduleSpacing}
                onChange={e => setScheduleSpacing(e.target.value)}
                min={5}
                style={{ ...inputStyle, width: '80px' }}
                onFocus={e => e.target.style.borderColor = '#7DF9FF'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <button style={btnCyan} onClick={saveSchedule}
              onMouseOver={e => e.target.style.background = 'rgba(125,249,255,0.08)'}
              onMouseOut={e => e.target.style.background = 'transparent'}
            >
              Save
            </button>
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ ...labelStyle, marginBottom: 0, fontSize: '0.7rem', color: '#c8cad8' }}>TEAM MEMBERS</div>
            {statusMsgs.team && <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#7DF9FF' }}>{statusMsgs.team}</span>}
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            {teamMembers.map(m => (
              <Chip key={m} label={m} onRemove={() => setTeamMembers(prev => prev.filter(x => x !== m))} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              placeholder="Name"
              value={newMember}
              onChange={e => setNewMember(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
              onFocus={e => e.target.style.borderColor = '#7DF9FF'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              onKeyDown={e => { if (e.key === 'Enter' && newMember.trim()) { setTeamMembers(prev => [...prev, newMember.trim()]); setNewMember(''); } }}
            />
            <button style={btnMuted} onClick={() => { if (newMember.trim()) { setTeamMembers(prev => [...prev, newMember.trim()]); setNewMember(''); } }}>
              Add
            </button>
            <button style={btnCyan} onClick={saveTeamMembers}
              onMouseOver={e => e.target.style.background = 'rgba(125,249,255,0.08)'}
              onMouseOut={e => e.target.style.background = 'transparent'}
            >
              Save
            </button>
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ ...labelStyle, marginBottom: 0, fontSize: '0.7rem', color: '#c8cad8' }}>INFLUENCER WATCH LIST</div>
            {statusMsgs.influencers && <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#7DF9FF' }}>{statusMsgs.influencers}</span>}
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            {influencers.map(inf => (
              <Chip key={inf} label={inf} onRemove={() => setInfluencers(prev => prev.filter(x => x !== inf))} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              placeholder="@handle"
              value={newInfluencer}
              onChange={e => setNewInfluencer(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
              onFocus={e => e.target.style.borderColor = '#7DF9FF'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              onKeyDown={e => { if (e.key === 'Enter' && newInfluencer.trim()) { setInfluencers(prev => [...prev, newInfluencer.trim()]); setNewInfluencer(''); } }}
            />
            <button style={btnMuted} onClick={() => { if (newInfluencer.trim()) { setInfluencers(prev => [...prev, newInfluencer.trim()]); setNewInfluencer(''); } }}>
              Add
            </button>
            <button style={btnCyan} onClick={saveInfluencers}
              onMouseOver={e => e.target.style.background = 'rgba(125,249,255,0.08)'}
              onMouseOut={e => e.target.style.background = 'transparent'}
            >
              Save
            </button>
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ ...labelStyle, marginBottom: 0, fontSize: '0.7rem', color: '#c8cad8' }}>API KEYS</div>
            {statusMsgs.apikeys && <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#7DF9FF' }}>{statusMsgs.apikeys}</span>}
          </div>
          <div style={labelStyle}>adanos_api_key</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={adanosKey}
              onChange={e => setAdanosKey(e.target.value)}
              style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
              onFocus={e => e.target.style.borderColor = '#7DF9FF'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              placeholder="sk-..."
            />
            <button style={btnMuted} onClick={() => setShowKey(v => !v)}>
              {showKey ? 'Hide' : 'Show'}
            </button>
            <button style={btnCyan} onClick={saveAdanosKey}
              onMouseOver={e => e.target.style.background = 'rgba(125,249,255,0.08)'}
              onMouseOut={e => e.target.style.background = 'transparent'}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
