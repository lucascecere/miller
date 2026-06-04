import { useEffect, useState } from 'react';
import { get, post } from '../api';
import Layout from '../components/Layout';
import EngageCard from '../components/EngageCard';

export default function Engage() {
  const [feed, setFeed] = useState({ reply_to_us: [], engage_out: [] });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState('reply');
  const [hiddenIds, setHiddenIds] = useState([]);

  const [pasteText, setPasteText] = useState('');
  const [pasteHandle, setPasteHandle] = useState('');
  const [pasteFollowers, setPasteFollowers] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [manualCards, setManualCards] = useState([]);

  async function loadFeed() {
    setLoading(true);
    try {
      const data = await get('/api/engage/feed');
      setFeed(data || { reply_to_us: [], engage_out: [] });
      setLastUpdated(new Date());
    } catch {}
    finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadFeed(); }, []);

  function handleSkip(id) {
    setHiddenIds(prev => [...prev, id]);
    setManualCards(prev => prev.filter(c => c.id !== id));
  }

  async function handleDraft() {
    if (!pasteText.trim()) return;
    setDrafting(true);
    try {
      const card = await post('/api/engage/draft-reply', {
        text: pasteText.trim(),
        author_handle: pasteHandle.trim() || undefined,
        follower_count: pasteFollowers ? parseInt(pasteFollowers, 10) : undefined,
      });
      setManualCards(prev => [card, ...prev]);
      setPasteText('');
      setPasteHandle('');
      setPasteFollowers('');
    } catch {}
    finally { setDrafting(false); }
  }

  const replyCards = (feed.reply_to_us || []).filter(c => !hiddenIds.includes(c.id));
  const engageCards = (feed.engage_out || []).filter(c => !hiddenIds.includes(c.id));
  const activeCards = activeTab === 'reply' ? replyCards : engageCards;

  const tabBase = {
    fontFamily: 'monospace', fontSize: '0.8rem',
    background: 'transparent', border: 'none',
    cursor: 'pointer', padding: '6px 0',
    transition: 'color 0.15s',
  };

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem 1.5rem' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6e85' }}>
            ENGAGEMENT FEED
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {lastUpdated && (
              <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#6b6e85' }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={loadFeed}
              disabled={loading}
              style={{
                fontSize: '0.8rem', fontFamily: 'monospace',
                border: '1px solid rgba(125,249,255,0.5)', color: '#7DF9FF',
                background: 'transparent', padding: '6px 14px', borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1, transition: 'background 0.15s',
              }}
              onMouseOver={e => { if (!loading) e.target.style.background = 'rgba(125,249,255,0.08)'; }}
              onMouseOut={e => e.target.style.background = 'transparent'}
            >
              {loading ? 'Loading…' : 'Refresh Feed'}
            </button>
          </div>
        </div>

        {/* Paste a tweet */}
        <div style={{ background: '#0c0e17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6e85', marginBottom: '0.75rem' }}>
            PASTE A TWEET — GET A REPLY DRAFT INSTANTLY
          </div>
          <textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            rows={3}
            placeholder="Paste any tweet text here…"
            style={{
              width: '100%', background: '#0f1120',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem',
              padding: '0.75rem 1rem', color: 'white', fontFamily: 'monospace',
              fontSize: '0.875rem', outline: 'none', resize: 'none',
              boxSizing: 'border-box', transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = '#7DF9FF'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.625rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              value={pasteHandle}
              onChange={e => setPasteHandle(e.target.value)}
              placeholder="@handle (optional)"
              style={{
                background: '#0f1120', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.5rem', padding: '6px 10px', color: '#c8cad8',
                fontFamily: 'monospace', fontSize: '0.8rem', outline: 'none',
                width: '160px', transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#7DF9FF'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <input
              value={pasteFollowers}
              onChange={e => setPasteFollowers(e.target.value)}
              placeholder="Followers (optional)"
              type="number"
              style={{
                background: '#0f1120', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.5rem', padding: '6px 10px', color: '#c8cad8',
                fontFamily: 'monospace', fontSize: '0.8rem', outline: 'none',
                width: '160px', transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#7DF9FF'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <button
              onClick={handleDraft}
              disabled={drafting || !pasteText.trim()}
              style={{
                fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 700,
                border: '1px solid rgba(125,249,255,0.6)', color: '#7DF9FF',
                background: 'transparent', padding: '6px 18px', borderRadius: '0.5rem',
                cursor: (drafting || !pasteText.trim()) ? 'not-allowed' : 'pointer',
                opacity: (drafting || !pasteText.trim()) ? 0.4 : 1,
                transition: 'background 0.15s',
              }}
              onMouseOver={e => { if (!drafting && pasteText.trim()) e.target.style.background = 'rgba(125,249,255,0.1)'; }}
              onMouseOut={e => e.target.style.background = 'transparent'}
            >
              {drafting ? 'Drafting…' : 'Draft Reply'}
            </button>
          </div>
        </div>

        {/* Manual cards */}
        {manualCards.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6e85', marginBottom: '0.5rem' }}>
              DRAFTED REPLIES
            </div>
            {manualCards.map(card => (
              <EngageCard key={card.id} card={card} onSkip={handleSkip} />
            ))}
          </div>
        )}

        {/* Sample feed tabs */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6e85', marginBottom: '0.75rem' }}>
            SAMPLE FEED — live data needs Twitter API v2 ($100/mo)
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1rem' }}>
            <button
              onClick={() => setActiveTab('reply')}
              style={{
                ...tabBase,
                color: activeTab === 'reply' ? '#7DF9FF' : '#6b6e85',
                borderBottom: activeTab === 'reply' ? '2px solid #7DF9FF' : '2px solid transparent',
                paddingBottom: '8px',
              }}
            >
              Reply to Us ({replyCards.length})
            </button>
            <button
              onClick={() => setActiveTab('engage')}
              style={{
                ...tabBase,
                color: activeTab === 'engage' ? '#7DF9FF' : '#6b6e85',
                borderBottom: activeTab === 'engage' ? '2px solid #7DF9FF' : '2px solid transparent',
                paddingBottom: '8px',
              }}
            >
              Engage Out ({engageCards.length})
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: '#6b6e85', fontFamily: 'monospace', marginTop: '3rem' }}>
              Loading feed…
            </div>
          ) : activeCards.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b6e85', fontFamily: 'monospace', marginTop: '3rem' }}>
              No cards to show.
            </div>
          ) : (
            activeCards.map(card => (
              <EngageCard key={card.id} card={card} onSkip={handleSkip} />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
