import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { get, post, put } from '../api';
import ChartViewer from '../components/ChartViewer';
import TweetEditor from '../components/TweetEditor';
import StatusBadge from '../components/StatusBadge';
import Layout from '../components/Layout';

export default function PostView() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [tweetText, setTweetText] = useState('');
  const [settings, setSettings] = useState({ team_members: ['Luke', 'Lucas'] });
  const [selectedMember, setSelectedMember] = useState('Luke');
  const [copied, setCopied] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    try {
      const [postData, settingsData] = await Promise.all([
        get(`/api/posts/${ticker}`),
        get('/api/settings')
      ]);
      setData(postData);
      setTweetText(postData.tweetText || '');
      setSettings(settingsData);
      const members = settingsData.team_members || ['Luke', 'Lucas'];
      const arr = Array.isArray(members) ? members : ['Luke', 'Lucas'];
      setSelectedMember(arr[0] || 'Luke');

      const isResultParam = searchParams.get('result') === 'true';
      const isHit = postData.result_status === 'HIT_HIGH' || postData.result_status === 'HIT_LOW';
      if (isResultParam && isHit && postData.templates && postData.templates[4]) {
        setTweetText(postData.templates[4]);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { loadData(); }, [ticker]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(tweetText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = tweetText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleMarkPosted() {
    setPosting(true);
    try {
      await put(`/api/posts/${ticker}`, { tweetText });
      await post(`/api/posts/${ticker}/mark-posted`, { postedBy: selectedMember });
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  }

  function applyTemplate(idx) {
    if (data && data.templates && data.templates[idx]) {
      setTweetText(data.templates[idx]);
    }
  }

  if (!data) return (
    <div style={{ minHeight: '100vh', background: '#07090f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#6b6e85', fontFamily: 'monospace' }}>{error || `Loading ${ticker}…`}</span>
    </div>
  );

  const members = Array.isArray(settings.team_members) ? settings.team_members : ['Luke', 'Lucas'];
  const isHit = data.result_status === 'HIT_HIGH' || data.result_status === 'HIT_LOW';

  const sectionStyle = {
    background: '#0c0e17', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.75rem', padding: '1rem',
  };

  const labelStyle = {
    fontSize: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase',
    letterSpacing: '0.1em', color: '#6b6e85', marginBottom: '0.5rem',
  };

  const TEMPLATES = ['A', 'B', 'C', 'D', 'E'];

  return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0.75rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => navigate('/')}
          style={{ color: '#6b6e85', fontFamily: 'monospace', fontSize: '0.875rem', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
          onMouseOver={e => e.target.style.color = 'white'}
          onMouseOut={e => e.target.style.color = '#6b6e85'}
        >
          Back
        </button>
        <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.25rem', color: '#7DF9FF' }}>${ticker}</div>
        <StatusBadge status={data.status} />
      </div>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <ChartViewer ticker={ticker} tickerData={data} />

            {data.pplLow && (
              <div style={sectionStyle}>
                <div style={labelStyle}>PPL Levels</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Support</div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'white' }}>${data.pplLow.toFixed(2)}</div>
                  </div>
                  <div style={{ background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Mode</div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'white' }}>${data.pplMode.toFixed(2)}</div>
                  </div>
                  <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Resistance</div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'white' }}>${data.pplHigh.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ ...labelStyle, marginBottom: 0 }}>Tweet Text</div>
                <button
                  onClick={handleCopy}
                  title="Copy tweet"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontFamily: 'monospace', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: copied ? '#86efac' : '#6b6e85', padding: '3px 8px', borderRadius: '5px', cursor: 'pointer', transition: 'all 0.15s', borderColor: copied ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.15)' }}
                  onMouseOver={e => { if (!copied) { e.currentTarget.style.borderColor = 'rgba(125,249,255,0.5)'; e.currentTarget.style.color = '#7DF9FF'; } }}
                  onMouseOut={e => { if (!copied) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#6b6e85'; } }}
                >
                  {copied ? '✓ Copied' : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <TweetEditor value={tweetText} onChange={setTweetText} />

              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ ...labelStyle, marginBottom: '0.5rem' }}>Templates</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {TEMPLATES.map((label, idx) => {
                    const isE = label === 'E';
                    const disabled = isE && !isHit;
                    return (
                      <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <button
                          onClick={() => { if (!disabled) applyTemplate(idx); }}
                          style={{
                            fontSize: '0.75rem', fontFamily: 'monospace',
                            border: '1px solid rgba(255,255,255,0.15)', color: '#c8cad8',
                            background: 'transparent', padding: '6px 12px', borderRadius: '6px',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            opacity: disabled ? 0.4 : 1,
                            transition: 'border-color 0.15s,color 0.15s',
                          }}
                          onMouseOver={e => { if (!disabled) { e.target.style.borderColor = 'rgba(125,249,255,0.5)'; e.target.style.color = '#7DF9FF'; } }}
                          onMouseOut={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.color = '#c8cad8'; }}
                        >
                          {label}
                        </button>
                        {isE && disabled && (
                          <span style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#6b6e85', textAlign: 'center', maxWidth: '60px', lineHeight: 1.3 }}>
                            Available after a PPL level is hit
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleCopy}
                style={{
                  width: '100%', marginTop: '0.75rem',
                  fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem',
                  padding: '0.75rem', borderRadius: '0.5rem',
                  border: copied ? '1px solid #22c55e' : '1px solid rgba(125,249,255,0.6)',
                  color: copied ? '#86efac' : '#7DF9FF',
                  background: copied ? 'rgba(34,197,94,0.1)' : 'transparent',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseOver={e => { if (!copied) e.target.style.background = 'rgba(125,249,255,0.1)'; }}
                onMouseOut={e => { if (!copied) e.target.style.background = 'transparent'; }}
              >
                {copied ? '✓ Copied!' : 'Copy Tweet'}
              </button>
            </div>

            <div style={sectionStyle}>
              <div style={labelStyle}>Mark as Posted</div>
              <select
                value={selectedMember}
                onChange={e => setSelectedMember(e.target.value)}
                style={{ width: '100%', background: '#0f1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', color: 'white', fontFamily: 'monospace', fontSize: '0.875rem', outline: 'none', marginBottom: '0.75rem', boxSizing: 'border-box' }}
              >
                {members.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <button
                onClick={handleMarkPosted}
                disabled={posting || data.status === 'posted'}
                style={{
                  width: '100%', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem',
                  padding: '0.75rem', borderRadius: '0.5rem',
                  border: '1px solid rgba(34,197,94,0.6)', color: '#86efac',
                  background: 'transparent', cursor: (posting || data.status === 'posted') ? 'not-allowed' : 'pointer',
                  opacity: (posting || data.status === 'posted') ? 0.5 : 1, transition: 'background 0.15s',
                }}
                onMouseOver={e => { if (!(posting || data.status === 'posted')) e.target.style.background = 'rgba(34,197,94,0.1)'; }}
                onMouseOut={e => e.target.style.background = 'transparent'}
              >
                {posting ? 'Marking…' : data.status === 'posted' ? '✓ Already Posted' : 'Mark as Posted'}
              </button>
            </div>

            {data.postHistory && data.postHistory.length > 0 && (
              <div style={sectionStyle}>
                <div style={labelStyle}>Post History</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {data.postHistory.map((h, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      <span style={{ color: '#c8cad8' }}>{h.posted_by || h.postedBy || 'Unknown'}</span>
                      <span style={{ color: '#6b6e85' }}>
                        {h.posted_at
                          ? new Date(h.posted_at).toLocaleDateString()
                          : h.postedAt
                            ? new Date(h.postedAt).toLocaleDateString()
                            : h.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <p style={{ color: '#f87171', fontSize: '0.75rem', fontFamily: 'monospace' }}>{error}</p>}
          </div>
        </div>
      </main>
    </Layout>
  );
}
