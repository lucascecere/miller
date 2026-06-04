import { useEffect, useState } from 'react';
import { get, post } from '../api';

const TEAM_MEMBERS = ['Kaitlin', 'Luke', 'Alex', 'Lucas', 'JJ'];

export default function EngagementLog() {
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  const [member, setMember] = useState('Luke');
  const [minutes, setMinutes] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const labelStyle = {
    fontSize: '0.6rem',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#6b6e85',
  };

  const inputStyle = {
    background: '#0f1120',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.5rem',
    padding: '6px 10px',
    color: '#c8cad8',
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  async function loadEntries() {
    setLoadingEntries(true);
    try {
      const data = await get('/api/engage/log/today');
      setEntries(data.entries || []);
    } catch {
      setEntries([]);
    } finally {
      setLoadingEntries(false);
    }
  }

  useEffect(() => { loadEntries(); }, []);

  async function handleSubmit() {
    if (!minutes || !description.trim()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await post('/api/engage/log', {
        team_member: member,
        minutes: parseInt(minutes, 10),
        description: description.trim(),
      });
      setMinutes('');
      setDescription('');
      await loadEntries();
    } catch (err) {
      setSubmitError(err.message || 'Failed to log session.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      background: '#0c0e17',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '0.75rem',
      padding: '1.25rem',
      marginTop: '1.5rem',
    }}>
      <div style={{ ...labelStyle, marginBottom: '1rem' }}>TODAY'S ENGAGEMENT LOG</div>

      {/* Log a session form */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        marginBottom: '1rem',
      }}>
        {/* Team member */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <span style={labelStyle}>Team Member</span>
          <select
            value={member}
            onChange={e => setMember(e.target.value)}
            style={{
              ...inputStyle,
              width: '120px',
              cursor: 'pointer',
            }}
            onFocus={e => e.target.style.borderColor = '#7DF9FF'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          >
            {TEAM_MEMBERS.map(m => (
              <option key={m} value={m} style={{ background: '#0f1120' }}>{m}</option>
            ))}
          </select>
        </div>

        {/* Time spent */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <span style={labelStyle}>Time Spent</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <input
              type="number"
              min="1"
              value={minutes}
              onChange={e => setMinutes(e.target.value)}
              placeholder="30"
              style={{ ...inputStyle, width: '60px' }}
              onFocus={e => e.target.style.borderColor = '#7DF9FF'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <span style={{ color: '#6b6e85', fontFamily: 'monospace', fontSize: '0.8rem' }}>minutes</span>
          </div>
        </div>

        {/* What you did */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1, minWidth: '200px' }}>
          <span style={labelStyle}>What You Did</span>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. Replied to 8 finance posts"
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#7DF9FF'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
          />
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !minutes || !description.trim()}
          style={{
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            fontWeight: 700,
            border: '1px solid rgba(125,249,255,0.6)',
            color: '#7DF9FF',
            background: 'transparent',
            padding: '6px 16px',
            borderRadius: '0.5rem',
            cursor: (submitting || !minutes || !description.trim()) ? 'not-allowed' : 'pointer',
            opacity: (submitting || !minutes || !description.trim()) ? 0.4 : 1,
            transition: 'background 0.15s',
            whiteSpace: 'nowrap',
          }}
          onMouseOver={e => {
            if (!submitting && minutes && description.trim()) {
              e.target.style.background = 'rgba(125,249,255,0.1)';
            }
          }}
          onMouseOut={e => e.target.style.background = 'transparent'}
        >
          {submitting ? 'Logging…' : 'Log Session'}
        </button>
      </div>

      {submitError && (
        <div style={{ color: '#f87171', fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
          {submitError}
        </div>
      )}

      {/* Today's entries */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
        {loadingEntries ? (
          <div style={{ color: '#6b6e85', fontFamily: 'monospace', fontSize: '0.8rem' }}>Loading…</div>
        ) : entries.length === 0 ? (
          <div style={{ color: '#6b6e85', fontFamily: 'monospace', fontSize: '0.8rem' }}>No sessions logged today.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {entries.map((entry, idx) => (
              <div key={idx} style={{
                color: '#c8cad8',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                lineHeight: 1.5,
              }}>
                <span style={{ color: '#7DF9FF' }}>{entry.team_member}</span>
                <span style={{ color: '#6b6e85' }}> — </span>
                <span>{entry.minutes} min</span>
                <span style={{ color: '#6b6e85' }}> — </span>
                <span>{entry.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
