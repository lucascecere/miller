import { useEffect, useState } from 'react';
import { get, put } from '../api';
import Layout from '../components/Layout';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editRow, setEditRow] = useState(null);
  const [editLikes, setEditLikes] = useState('');
  const [editReplies, setEditReplies] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadHistory() {
    try {
      const data = await get('/api/posts/history');
      setHistory(data || []);
    } catch {}
    finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadHistory(); }, []);

  async function handleSaveEngagement(symbol) {
    setSaving(true);
    try {
      await put(`/api/posts/${symbol}`, {
        likesCount: parseInt(editLikes, 10) || 0,
        repliesCount: parseInt(editReplies, 10) || 0,
        engagementLoggedAt: new Date(),
      });
      await loadHistory();
      setEditRow(null);
    } catch {}
    finally {
      setSaving(false);
    }
  }

  const thStyle = {
    fontFamily: 'monospace', fontSize: '0.6rem', textTransform: 'uppercase',
    letterSpacing: '0.1em', color: '#6b6e85', padding: '0.5rem 0.75rem',
    textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 400,
  };

  const tdStyle = {
    fontFamily: 'monospace', fontSize: '0.8rem', color: '#c8cad8',
    padding: '0.6rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)',
    verticalAlign: 'top',
  };

  const inputStyle = {
    width: '70px', background: '#0f1120',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px', padding: '4px 8px',
    color: 'white', fontFamily: 'monospace', fontSize: '0.8rem',
    outline: 'none',
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem 1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6e85' }}>
            POST HISTORY
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#6b6e85', fontFamily: 'monospace', marginTop: '5rem' }}>
            Loading…
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b6e85', fontFamily: 'monospace', marginTop: '5rem' }}>
            No posts yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Ticker</th>
                  <th style={thStyle}>Tweet</th>
                  <th style={thStyle}>Posted By</th>
                  <th style={thStyle}>Template</th>
                  <th style={thStyle}>Likes</th>
                  <th style={thStyle}>Replies</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => {
                  const isEditing = editRow === (h.symbol || h.ticker);
                  const tweetPreview = (h.tweet_text || h.tweetText || '').slice(0, 80) + ((h.tweet_text || h.tweetText || '').length > 80 ? '…' : '');
                  const sym = h.symbol || h.ticker;
                  return (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                      <td style={tdStyle}>
                        {h.posted_at || h.postedAt
                          ? new Date(h.posted_at || h.postedAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td style={{ ...tdStyle, color: '#7DF9FF', fontWeight: 700 }}>{sym}</td>
                      <td style={{ ...tdStyle, maxWidth: '260px', wordBreak: 'break-word' }}>{tweetPreview || '—'}</td>
                      <td style={tdStyle}>{h.posted_by || h.postedBy || '—'}</td>
                      <td style={tdStyle}>{h.template || '—'}</td>
                      <td style={tdStyle}>{h.likes_count != null ? h.likes_count : '—'}</td>
                      <td style={tdStyle}>{h.replies_count != null ? h.replies_count : '—'}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <input
                                type="number"
                                placeholder="Likes"
                                value={editLikes}
                                onChange={e => setEditLikes(e.target.value)}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = '#7DF9FF'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                              />
                              <input
                                type="number"
                                placeholder="Replies"
                                value={editReplies}
                                onChange={e => setEditReplies(e.target.value)}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = '#7DF9FF'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => handleSaveEngagement(sym)}
                                disabled={saving}
                                style={{ fontSize: '0.7rem', fontFamily: 'monospace', border: '1px solid rgba(34,197,94,0.5)', color: '#4ade80', background: 'transparent', padding: '4px 10px', borderRadius: '4px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}
                              >
                                {saving ? 'Saving…' : 'Save'}
                              </button>
                              <button
                                onClick={() => setEditRow(null)}
                                style={{ fontSize: '0.7rem', fontFamily: 'monospace', border: '1px solid rgba(255,255,255,0.15)', color: '#6b6e85', background: 'transparent', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditRow(sym);
                              setEditLikes(h.likes_count != null ? String(h.likes_count) : '');
                              setEditReplies(h.replies_count != null ? String(h.replies_count) : '');
                            }}
                            style={{ fontSize: '0.7rem', fontFamily: 'monospace', border: '1px solid rgba(255,255,255,0.15)', color: '#6b6e85', background: 'transparent', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                            onMouseOver={e => { e.target.style.borderColor = 'rgba(125,249,255,0.4)'; e.target.style.color = '#7DF9FF'; }}
                            onMouseOut={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.color = '#6b6e85'; }}
                          >
                            Log Engagement
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
