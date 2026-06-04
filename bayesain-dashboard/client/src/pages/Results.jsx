import { useEffect, useState } from 'react';
import { get } from '../api';
import Layout from '../components/Layout';

const STATUS_STYLES = {
  HIT_HIGH: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', label: 'HIT HIGH' },
  HIT_LOW:  { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', label: 'HIT LOW' },
  OPEN:     { bg: 'rgba(107,110,133,0.2)', color: '#6b6e85', label: 'OPEN' },
  EXPIRED:  { bg: 'rgba(239,68,68,0.1)', color: '#f87171', label: 'EXPIRED' },
};

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.OPEN;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
      fontSize: '0.6rem', fontFamily: 'monospace', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  );
}

export default function Results() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState(null);

  useEffect(() => {
    get('/api/results/public')
      .then(data => {
        setPredictions(data?.rows || []);
        setStats(data?.stats || null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const total = predictions.length;
  const hits = predictions.filter(p => p.result_status === 'HIT_HIGH' || p.result_status === 'HIT_LOW').length;
  const hitRate = total > 0 ? ((hits / total) * 100).toFixed(1) : '0.0';
  const openCount = predictions.filter(p => p.result_status === 'OPEN' || !p.result_status).length;
  const hittedWithDays = predictions.filter(p =>
    (p.result_status === 'HIT_HIGH' || p.result_status === 'HIT_LOW') && p.days_to_hit != null
  );
  const avgDays = hittedWithDays.length > 0
    ? (hittedWithDays.reduce((sum, p) => sum + p.days_to_hit, 0) / hittedWithDays.length).toFixed(1)
    : '—';

  const statBoxStyle = {
    background: '#0c0e17', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.75rem', padding: '1rem', textAlign: 'center', flex: 1,
  };

  const thStyle = {
    fontFamily: 'monospace', fontSize: '0.6rem', textTransform: 'uppercase',
    letterSpacing: '0.1em', color: '#6b6e85', padding: '0.5rem 0.75rem',
    textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)',
    fontWeight: 400,
  };

  const tdStyle = {
    fontFamily: 'monospace', fontSize: '0.8rem', color: '#c8cad8',
    padding: '0.6rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)',
  };

  return (
    <Layout>
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6e85', marginBottom: '0.75rem' }}>
            PREDICTION RESULTS
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: '#6b6e85', fontFamily: 'monospace', marginTop: '5rem' }}>
              Loading predictions…
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: '#f87171', fontFamily: 'monospace', marginTop: '5rem' }}>
              {error}
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={statBoxStyle}>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.75rem', color: 'white' }}>{total}</div>
                  <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6e85', marginTop: '4px' }}>Total Predictions</div>
                </div>
                <div style={statBoxStyle}>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.75rem', color: 'white' }}>{hitRate}%</div>
                  <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6e85', marginTop: '4px' }}>Hit Rate</div>
                </div>
                <div style={statBoxStyle}>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.75rem', color: 'white' }}>{avgDays}</div>
                  <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6e85', marginTop: '4px' }}>Avg Days to Hit</div>
                </div>
                <div style={statBoxStyle}>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.75rem', color: 'white' }}>{openCount}</div>
                  <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6e85', marginTop: '4px' }}>Open</div>
                </div>
              </div>

              {predictions.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6b6e85', fontFamily: 'monospace', marginTop: '3rem' }}>
                  No predictions yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Date</th>
                        <th style={thStyle}>Ticker</th>
                        <th style={thStyle}>Called High</th>
                        <th style={thStyle}>Called Low</th>
                        <th style={thStyle}>Result Price</th>
                        <th style={thStyle}>Days</th>
                        <th style={thStyle}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictions.map((p, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                          <td style={tdStyle}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
                          <td style={{ ...tdStyle, color: '#7DF9FF', fontWeight: 700 }}>{p.symbol}</td>
                          <td style={tdStyle}>{p.ppl_high != null ? `$${p.ppl_high}` : '—'}</td>
                          <td style={tdStyle}>{p.ppl_low != null ? `$${p.ppl_low}` : '—'}</td>
                          <td style={tdStyle}>{p.result_price != null ? `$${p.result_price}` : '—'}</td>
                          <td style={tdStyle}>{p.days_to_hit != null ? p.days_to_hit : '—'}</td>
                          <td style={tdStyle}><StatusPill status={p.result_status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </Layout>
  );
}
