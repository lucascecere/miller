import { useEffect, useState, useCallback } from 'react';
import { get } from '../api';

export default function ThreadModal({ onClose }) {
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    get('/api/thread/build')
      .then(data => setThread(data))
      .catch(() => setThread(null))
      .finally(() => setLoading(false));
  }, []);

  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') handleClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  async function copyText(text, idx) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  async function copyAll() {
    if (!thread) return;
    const parts = [];
    if (thread.opener) parts.push(thread.opener);
    if (Array.isArray(thread.tweets)) parts.push(...thread.tweets.map(t => t.text || t));
    const joined = parts.join('\n\n---\n\n');
    try {
      await navigator.clipboard.writeText(joined);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = joined;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  const tweetBoxStyle = {
    background: '#07090f', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.5rem', padding: '0.75rem 1rem',
    fontFamily: 'monospace', fontSize: '0.8rem',
    color: '#c8cad8', whiteSpace: 'pre-wrap', lineHeight: 1.6,
    marginBottom: '0',
  };

  const cardStyle = {
    background: '#0f1120', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.75rem', padding: '1rem', marginBottom: '0.75rem',
  };

  const labelStyle = {
    fontSize: '0.55rem', fontFamily: 'monospace', textTransform: 'uppercase',
    letterSpacing: '0.1em', color: '#6b6e85', marginBottom: '0.4rem',
  };

  const btnCopy = (active) => ({
    fontSize: '0.7rem', fontFamily: 'monospace',
    border: active ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(125,249,255,0.4)',
    color: active ? '#86efac' : '#7DF9FF',
    background: 'transparent', padding: '4px 10px', borderRadius: '4px',
    cursor: 'pointer', transition: 'all 0.15s',
  });

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
        zIndex: 100, display: 'flex', alignItems: 'flex-start',
        justifyContent: 'center', paddingTop: '5vh', overflowY: 'auto',
      }}
    >
      <div style={{
        background: '#0c0e17', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '1rem', padding: '1.5rem',
        width: '100%', maxWidth: '600px', margin: '0 1rem 2rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#7DF9FF', fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            THREAD BUILDER
          </span>
          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6e85', fontSize: '1.1rem', lineHeight: 1, fontFamily: 'monospace' }}
            onMouseOver={e => e.target.style.color = 'white'}
            onMouseOut={e => e.target.style.color = '#6b6e85'}
          >
            x
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#6b6e85', fontFamily: 'monospace', padding: '3rem 0' }}>
            Building thread…
          </div>
        ) : !thread ? (
          <div style={{ textAlign: 'center', color: '#f87171', fontFamily: 'monospace', padding: '3rem 0' }}>
            Failed to load thread.
          </div>
        ) : (
          <>
            {thread.opener && (
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={labelStyle}>OPENER</div>
                  <button style={btnCopy(copiedIdx === 'opener')} onClick={() => copyText(thread.opener, 'opener')}>
                    {copiedIdx === 'opener' ? '✓' : 'Copy'}
                  </button>
                </div>
                <pre style={tweetBoxStyle}>{thread.opener}</pre>
              </div>
            )}

            {Array.isArray(thread.tweets) && thread.tweets.map((tweet, i) => {
              const text = typeof tweet === 'string' ? tweet : tweet.text || '';
              const symbol = typeof tweet === 'object' ? tweet.symbol : null;
              return (
                <div key={i} style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={labelStyle}>
                      {symbol ? symbol : `TWEET ${i + 1}`}
                    </div>
                    <button style={btnCopy(copiedIdx === i)} onClick={() => copyText(text, i)}>
                      {copiedIdx === i ? '✓' : 'Copy'}
                    </button>
                  </div>
                  <pre style={tweetBoxStyle}>{text}</pre>
                </div>
              );
            })}

            <button
              onClick={copyAll}
              style={{
                width: '100%', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem',
                padding: '0.75rem', borderRadius: '0.5rem', marginTop: '0.25rem',
                border: copiedAll ? '1px solid #22c55e' : '1px solid rgba(125,249,255,0.6)',
                color: copiedAll ? '#86efac' : '#7DF9FF',
                background: copiedAll ? 'rgba(34,197,94,0.1)' : 'transparent',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseOver={e => { if (!copiedAll) e.target.style.background = 'rgba(125,249,255,0.08)'; }}
              onMouseOut={e => { if (!copiedAll) e.target.style.background = 'transparent'; }}
            >
              {copiedAll ? '✓ Copied All!' : 'Copy All'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
