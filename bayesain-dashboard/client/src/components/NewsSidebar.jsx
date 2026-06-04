import { useEffect, useState } from 'react';
import { get } from '../api';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NewsSidebar({ onSelectNews, activeNewsContext }) {
  const [items, setItems] = useState([]);
  const [lastFetched, setLastFetched] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function loadNews() {
    setLoading(true);
    setError(false);
    try {
      const data = await get('/api/engage/news');
      setItems(data.items || []);
      setLastFetched(data.lastFetched || new Date().toISOString());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadNews(); }, []);

  const labelStyle = {
    fontSize: '0.6rem',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#6b6e85',
  };

  return (
    <div style={{
      background: '#0c0e17',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '0.75rem',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      minWidth: '260px',
      maxWidth: '320px',
      flexShrink: 0,
      alignSelf: 'flex-start',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={labelStyle}>TODAY'S NEWS</span>
        <button
          onClick={loadNews}
          disabled={loading}
          style={{
            fontSize: '0.7rem',
            fontFamily: 'monospace',
            border: '1px solid rgba(125,249,255,0.4)',
            color: '#7DF9FF',
            background: 'transparent',
            padding: '3px 8px',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
            transition: 'background 0.15s',
          }}
          onMouseOver={e => { if (!loading) e.target.style.background = 'rgba(125,249,255,0.08)'; }}
          onMouseOut={e => e.target.style.background = 'transparent'}
        >
          {loading ? '…' : 'Refresh'}
        </button>
      </div>

      {/* Timestamp */}
      {lastFetched && (
        <span style={{ ...labelStyle, fontSize: '0.55rem' }}>
          Updated {timeAgo(lastFetched)}
        </span>
      )}

      {/* Content */}
      {error ? (
        <div style={{ color: '#6b6e85', fontFamily: 'monospace', fontSize: '0.8rem' }}>
          News unavailable
        </div>
      ) : loading && items.length === 0 ? (
        <div style={{ color: '#6b6e85', fontFamily: 'monospace', fontSize: '0.8rem' }}>
          Loading…
        </div>
      ) : items.length === 0 ? (
        <div style={{ color: '#6b6e85', fontFamily: 'monospace', fontSize: '0.8rem' }}>
          No news items.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {items.map((item, idx) => {
            const isActive = activeNewsContext === item.title;
            return (
              <div
                key={idx}
                onClick={() => onSelectNews(item.title)}
                style={{
                  padding: '0.6rem 0.75rem',
                  borderRadius: '0.5rem',
                  borderLeft: isActive
                    ? '3px solid #7DF9FF'
                    : '3px solid transparent',
                  background: isActive
                    ? 'rgba(125,249,255,0.05)'
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseOver={e => {
                  if (!isActive) {
                    e.currentTarget.style.borderLeft = '3px solid rgba(125,249,255,0.35)';
                    e.currentTarget.style.background = 'rgba(125,249,255,0.03)';
                  }
                }}
                onMouseOut={e => {
                  if (!isActive) {
                    e.currentTarget.style.borderLeft = '3px solid transparent';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{
                  color: '#c8cad8',
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  marginBottom: '0.3rem',
                }}>
                  {item.title}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {item.source && (
                    <span style={{ ...labelStyle, fontSize: '0.55rem' }}>{item.source}</span>
                  )}
                  {item.pubDate && (
                    <span style={{ ...labelStyle, fontSize: '0.55rem' }}>{timeAgo(item.pubDate)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
