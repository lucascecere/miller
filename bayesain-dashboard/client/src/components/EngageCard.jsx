import { useState } from 'react';

const PRIORITY_STYLES = {
  HIGH:   { bg: 'rgba(125,249,255,0.12)', color: '#7DF9FF' },
  MEDIUM: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
  LOW:    { bg: 'rgba(107,110,133,0.2)', color: '#6b6e85' },
};

export default function EngageCard({ card, onSkip }) {
  const [reply, setReply] = useState(card.suggested_reply || '');
  const [copied, setCopied] = useState(false);
  const [skipping, setSkipping] = useState(false);

  const priority = (card.priority || 'LOW').toUpperCase();
  const pStyle = PRIORITY_STYLES[priority] || PRIORITY_STYLES.LOW;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(reply);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = reply;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSkip() {
    setSkipping(true);
    try {
      await fetch('/api/engage/skip', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweet_id: card.id }),
      });
      onSkip(card.id);
    } catch {
      setSkipping(false);
    }
  }

  const labelStyle = {
    fontSize: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase',
    letterSpacing: '0.1em', color: '#6b6e85', marginBottom: '0.4rem',
  };

  return (
    <div style={{
      background: '#0c0e17', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '0.75rem', padding: '1rem', marginBottom: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'white', fontSize: '0.875rem' }}>
          @{card.author_handle}
        </span>
        {card.follower_count != null && (
          <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#6b6e85' }}>
            {card.follower_count.toLocaleString()} followers
          </span>
        )}
        <span style={{
          display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
          fontSize: '0.6rem', fontFamily: 'monospace', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          background: pStyle.bg, color: pStyle.color,
        }}>
          {priority}
        </span>
      </div>

      <p style={{ color: '#c8cad8', fontSize: '0.875rem', fontFamily: 'monospace', margin: '0.5rem 0', lineHeight: 1.5 }}>
        {card.text}
      </p>

      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={labelStyle}>DRAFTED REPLY</div>
        <textarea
          value={reply}
          onChange={e => setReply(e.target.value)}
          rows={4}
          style={{
            width: '100%', background: '#0f1120',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.5rem', padding: '0.75rem 1rem',
            color: 'white', fontFamily: 'monospace', fontSize: '0.875rem',
            outline: 'none', resize: 'none', boxSizing: 'border-box',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = '#7DF9FF'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleCopy}
          style={{
            fontSize: '0.75rem', fontFamily: 'monospace',
            border: copied ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(125,249,255,0.5)',
            color: copied ? '#86efac' : '#7DF9FF',
            background: 'transparent', padding: '6px 12px', borderRadius: '6px',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseOver={e => { if (!copied) e.target.style.background = 'rgba(125,249,255,0.08)'; }}
          onMouseOut={e => e.target.style.background = 'transparent'}
        >
          {copied ? 'Copied!' : 'Copy Reply'}
        </button>
        <button
          onClick={handleSkip}
          disabled={skipping}
          style={{
            fontSize: '0.75rem', fontFamily: 'monospace',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#6b6e85', background: 'transparent',
            padding: '6px 12px', borderRadius: '6px',
            cursor: skipping ? 'not-allowed' : 'pointer',
            opacity: skipping ? 0.5 : 1, transition: 'all 0.15s',
          }}
          onMouseOver={e => { if (!skipping) e.target.style.color = '#c8cad8'; }}
          onMouseOut={e => e.target.style.color = '#6b6e85'}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
