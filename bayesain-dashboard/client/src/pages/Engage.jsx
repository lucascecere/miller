import { useEffect, useState } from 'react';
import { get } from '../api';
import Layout from '../components/Layout';
import EngageCard from '../components/EngageCard';

export default function Engage() {
  const [feed, setFeed] = useState({ reply_to_us: [], engage_out: [] });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState('reply');
  const [hiddenIds, setHiddenIds] = useState([]);

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

        <div style={{
          border: '1px solid rgba(251,191,36,0.3)',
          background: 'rgba(251,191,36,0.05)',
          borderRadius: '0.5rem', padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          fontFamily: 'monospace', fontSize: '0.75rem', color: '#fbbf24',
        }}>
          Live data requires Twitter API v2 ($100/mo). Showing sample data.
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
    </Layout>
  );
}
