import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get, post, put } from '../api';
import ChartViewer from '../components/ChartViewer';
import TweetEditor from '../components/TweetEditor';
import StatusBadge from '../components/StatusBadge';

export default function PostView() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [tweetText, setTweetText] = useState('');
  const [settings, setSettings] = useState({ team_members: ['Luke','Lucas'] });
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
      const members = settingsData.team_members || ['Luke','Lucas'];
      const arr = Array.isArray(members) ? members : ['Luke','Lucas'];
      setSelectedMember(arr[0] || 'Luke');
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
      // fallback for non-HTTPS
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
    <div style={{minHeight:'100vh',background:'#07090f',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <span style={{color:'#6b6e85',fontFamily:'monospace'}}>{error || `Loading ${ticker}…`}</span>
    </div>
  );

  const members = Array.isArray(settings.team_members) ? settings.team_members : ['Luke','Lucas'];

  const sectionStyle = {
    background:'#0c0e17', border:'1px solid rgba(255,255,255,0.08)',
    borderRadius:'0.75rem', padding:'1rem'
  };

  const labelStyle = {
    fontSize:'0.6rem', fontFamily:'monospace', textTransform:'uppercase',
    letterSpacing:'0.1em', color:'#6b6e85', marginBottom:'0.5rem'
  };

  return (
    <div style={{minHeight:'100vh',background:'#07090f'}}>
      <header style={{position:'sticky',top:0,zIndex:10,background:'rgba(10,12,21,0.95)',backdropFilter:'blur(8px)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'1rem 1.5rem'}}>
        <div style={{maxWidth:'900px',margin:'0 auto',display:'flex',alignItems:'center',gap:'1rem'}}>
          <button
            onClick={() => navigate('/')}
            style={{color:'#6b6e85',fontFamily:'monospace',fontSize:'0.875rem',background:'transparent',border:'none',cursor:'pointer',transition:'color 0.15s'}}
            onMouseOver={e=>e.target.style.color='white'}
            onMouseOut={e=>e.target.style.color='#6b6e85'}
          >
            ← Dashboard
          </button>
          <div style={{fontFamily:'monospace',fontWeight:700,fontSize:'1.25rem',color:'#7DF9FF'}}>${ticker}</div>
          <StatusBadge status={data.status} />
        </div>
      </header>

      <main style={{maxWidth:'900px',margin:'0 auto',padding:'1.5rem'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem'}}>

          {/* Left: chart + PPL */}
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <ChartViewer ticker={ticker} tickerData={data} />

            {data.pplLow && (
              <div style={sectionStyle}>
                <div style={labelStyle}>PPL Levels</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.5rem',textAlign:'center'}}>
                  <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'0.5rem',padding:'0.75rem'}}>
                    <div style={{fontSize:'0.6rem',fontFamily:'monospace',color:'#f87171',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'4px'}}>Support</div>
                    <div style={{fontFamily:'monospace',fontWeight:700,color:'white'}}>${data.pplLow.toFixed(2)}</div>
                  </div>
                  <div style={{background:'rgba(217,119,6,0.1)',border:'1px solid rgba(217,119,6,0.2)',borderRadius:'0.5rem',padding:'0.75rem'}}>
                    <div style={{fontSize:'0.6rem',fontFamily:'monospace',color:'#fbbf24',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'4px'}}>Mode</div>
                    <div style={{fontFamily:'monospace',fontWeight:700,color:'white'}}>${data.pplMode.toFixed(2)}</div>
                  </div>
                  <div style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:'0.5rem',padding:'0.75rem'}}>
                    <div style={{fontSize:'0.6rem',fontFamily:'monospace',color:'#4ade80',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'4px'}}>Resistance</div>
                    <div style={{fontFamily:'monospace',fontWeight:700,color:'white'}}>${data.pplHigh.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: tweet editor + actions */}
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>

            {/* Tweet editor */}
            <div style={sectionStyle}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.5rem'}}>
                <div style={{...labelStyle,marginBottom:0}}>Tweet Text</div>
                <button
                  onClick={handleCopy}
                  title="Copy tweet"
                  style={{background:'transparent',border:'none',cursor:'pointer',padding:'4px',color: copied ? '#86efac' : '#6b6e85',transition:'color 0.15s',display:'flex',alignItems:'center'}}
                  onMouseOver={e=>{if(!copied)e.currentTarget.style.color='#7DF9FF';}}
                  onMouseOut={e=>{if(!copied)e.currentTarget.style.color='#6b6e85';}}
                >
                  {copied
                    ? <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg>
                  }
                </button>
              </div>
              <TweetEditor value={tweetText} onChange={setTweetText} />

              {/* Templates */}
              <div style={{marginTop:'0.75rem'}}>
                <div style={{...labelStyle,marginBottom:'0.5rem'}}>Templates</div>
                <div style={{display:'flex',gap:'0.5rem'}}>
                  {['A','B','C','D'].map((label, idx) => (
                    <button
                      key={label}
                      onClick={() => applyTemplate(idx)}
                      style={{fontSize:'0.75rem',fontFamily:'monospace',border:'1px solid rgba(255,255,255,0.15)',color:'#c8cad8',background:'transparent',padding:'6px 12px',borderRadius:'6px',cursor:'pointer',transition:'border-color 0.15s,color 0.15s'}}
                      onMouseOver={e=>{e.target.style.borderColor='rgba(125,249,255,0.5)';e.target.style.color='#7DF9FF';}}
                      onMouseOut={e=>{e.target.style.borderColor='rgba(255,255,255,0.15)';e.target.style.color='#c8cad8';}}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Copy button */}
              <button
                onClick={handleCopy}
                style={{
                  width:'100%', marginTop:'0.75rem',
                  fontFamily:'monospace', fontWeight:700, fontSize:'0.875rem',
                  padding:'0.75rem', borderRadius:'0.5rem',
                  border: copied ? '1px solid #22c55e' : '1px solid rgba(125,249,255,0.6)',
                  color: copied ? '#86efac' : '#7DF9FF',
                  background: copied ? 'rgba(34,197,94,0.1)' : 'transparent',
                  cursor:'pointer', transition:'all 0.15s'
                }}
                onMouseOver={e=>{if(!copied)e.target.style.background='rgba(125,249,255,0.1)';}}
                onMouseOut={e=>{if(!copied)e.target.style.background='transparent';}}
              >
                {copied ? '✓ Copied!' : 'Copy Tweet'}
              </button>
            </div>

            {/* Mark as posted */}
            <div style={sectionStyle}>
              <div style={labelStyle}>Mark as Posted</div>
              <select
                value={selectedMember}
                onChange={e => setSelectedMember(e.target.value)}
                style={{width:'100%',background:'#0f1120',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'0.5rem',padding:'0.5rem 0.75rem',color:'white',fontFamily:'monospace',fontSize:'0.875rem',outline:'none',marginBottom:'0.75rem',boxSizing:'border-box'}}
              >
                {members.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <button
                onClick={handleMarkPosted}
                disabled={posting || data.status === 'posted'}
                style={{
                  width:'100%', fontFamily:'monospace', fontWeight:700, fontSize:'0.875rem',
                  padding:'0.75rem', borderRadius:'0.5rem',
                  border:'1px solid rgba(34,197,94,0.6)', color:'#86efac',
                  background:'transparent', cursor:(posting||data.status==='posted')?'not-allowed':'pointer',
                  opacity:(posting||data.status==='posted')?0.5:1, transition:'background 0.15s'
                }}
                onMouseOver={e=>{if(!(posting||data.status==='posted'))e.target.style.background='rgba(34,197,94,0.1)';}}
                onMouseOut={e=>e.target.style.background='transparent'}
              >
                {posting ? 'Marking…' : data.status === 'posted' ? '✓ Already Posted' : 'Mark as Posted'}
              </button>
            </div>

            {/* Post history */}
            {data.postHistory && data.postHistory.length > 0 && (
              <div style={sectionStyle}>
                <div style={labelStyle}>Post History</div>
                <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                  {data.postHistory.map((h, i) => (
                    <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:'0.75rem',fontFamily:'monospace'}}>
                      <span style={{color:'#c8cad8'}}>{h.postedBy || 'Unknown'}</span>
                      <span style={{color:'#6b6e85'}}>{h.postedAt ? new Date(h.postedAt).toLocaleDateString() : h.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <p style={{color:'#f87171',fontSize:'0.75rem',fontFamily:'monospace'}}>{error}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
