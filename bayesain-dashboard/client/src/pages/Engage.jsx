import { useState, useRef, useEffect, useCallback } from 'react';
import { post } from '../api';
import Layout from '../components/Layout';
import NewsSidebar from '../components/NewsSidebar';
import EngagementLog from '../components/EngagementLog';

// ─── Shared style tokens ─────────────────────────────────────────────────────

const colors = {
  pageBg: '#080a12',
  cardBg: '#0c0e17',
  inputBg: '#0f1120',
  accent: '#7DF9FF',
  border: 'rgba(255,255,255,0.08)',
  borderActive: 'rgba(125,249,255,0.5)',
  textPrimary: '#c8cad8',
  textSecondary: '#6b6e85',
};

const labelStyle = {
  fontSize: '0.6rem',
  fontFamily: 'monospace',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: colors.textSecondary,
  display: 'block',
  marginBottom: '0.35rem',
};

const inputStyle = {
  width: '100%',
  background: colors.inputBg,
  border: `1px solid rgba(255,255,255,0.1)`,
  borderRadius: '0.5rem',
  padding: '8px 12px',
  color: colors.textPrimary,
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
};

const textareaStyle = {
  ...inputStyle,
  resize: 'none',
};

function InputField({ label, children }) {
  return (
    <div style={{ marginBottom: '0.875rem' }}>
      {label && <label style={labelStyle}>{label}</label>}
      {children}
    </div>
  );
}

function StyledInput({ value, onChange, placeholder, onFocus, onBlur, style = {} }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ ...inputStyle, ...style }}
      onFocus={e => {
        e.target.style.borderColor = colors.accent;
        if (onFocus) onFocus(e);
      }}
      onBlur={e => {
        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
        if (onBlur) onBlur(e);
      }}
    />
  );
}

function StyledTextarea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      style={textareaStyle}
      onFocus={e => e.target.style.borderColor = colors.accent}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
    />
  );
}

function PillButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'monospace',
        fontSize: '0.75rem',
        border: active ? `1px solid ${colors.accent}` : '1px solid rgba(255,255,255,0.15)',
        color: active ? colors.accent : colors.textSecondary,
        background: active ? 'rgba(125,249,255,0.08)' : 'transparent',
        padding: '4px 12px',
        borderRadius: '2rem',
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseOver={e => {
        if (!active) {
          e.currentTarget.style.color = colors.textPrimary;
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
        }
      }}
      onMouseOut={e => {
        if (!active) {
          e.currentTarget.style.color = colors.textSecondary;
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
        }
      }}
    >
      {label}
    </button>
  );
}

function ActionButton({ label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        fontWeight: 700,
        border: '1px solid rgba(125,249,255,0.6)',
        color: colors.accent,
        background: 'transparent',
        padding: '8px 22px',
        borderRadius: '0.5rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'background 0.15s',
      }}
      onMouseOver={e => { if (!disabled) e.currentTarget.style.background = 'rgba(125,249,255,0.1)'; }}
      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
    >
      {label}
    </button>
  );
}

// ─── Output section ───────────────────────────────────────────────────────────

function OutputSection({ output, loading, error, onClear }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = output;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const charCount = output.length;
  const overLimit = charCount > 280;

  if (!loading && !output && !error) return null;

  return (
    <div style={{
      marginTop: '1.25rem',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      paddingTop: '1rem',
    }}>
      {loading ? (
        <div style={{
          color: colors.textSecondary,
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span style={{ animation: 'blink 1s step-start infinite' }}>▋</span>
          Generating…
          <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
        </div>
      ) : error ? (
        <div style={{ color: '#f87171', fontFamily: 'monospace', fontSize: '0.8rem' }}>
          {error}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label style={labelStyle}>GENERATED OUTPUT</label>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '0.7rem',
              color: overLimit ? '#f87171' : colors.textSecondary,
              fontWeight: overLimit ? 700 : 400,
            }}>
              {charCount} / 280 chars
            </span>
          </div>
          <textarea
            readOnly
            value={output}
            rows={Math.min(10, Math.max(3, output.split('\n').length + 1))}
            style={{
              ...textareaStyle,
              color: colors.textPrimary,
              border: `1px solid ${overLimit ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.1)'}`,
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.625rem' }}>
            <button
              onClick={handleCopy}
              style={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                border: copied ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(125,249,255,0.5)',
                color: copied ? '#86efac' : colors.accent,
                background: 'transparent',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseOver={e => { if (!copied) e.currentTarget.style.background = 'rgba(125,249,255,0.08)'; }}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={onClear}
              style={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                border: '1px solid rgba(255,255,255,0.15)',
                color: colors.textSecondary,
                background: 'transparent',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseOver={e => e.currentTarget.style.color = colors.textPrimary}
              onMouseOut={e => e.currentTarget.style.color = colors.textSecondary}
            >
              Clear
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Image upload zone ────────────────────────────────────────────────────────

function ImageUploadZone({ image, imagePreview, onImageLoad, onClear }) {
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function processFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const base64 = dataUrl.split(',')[1];
      onImageLoad({ base64, mediaType: file.type, previewUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  }

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        processFile(item.getAsFile());
        break;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  if (image) {
    return (
      <div style={{ position: 'relative', marginBottom: '0.875rem' }}>
        <label style={labelStyle}>SCREENSHOT</label>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={imagePreview}
            alt="Tweet screenshot"
            style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '0.5rem', border: `1px solid ${colors.borderActive}`, display: 'block' }}
          />
          <button
            onClick={onClear}
            style={{
              position: 'absolute', top: '6px', right: '6px',
              background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#c8cad8', borderRadius: '50%', width: '22px', height: '22px',
              cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.75rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
            }}
            title="Remove image"
          >×</button>
        </div>
        <div style={{ marginTop: '0.4rem', fontSize: '0.65rem', fontFamily: 'monospace', color: '#4ade80' }}>
          ✓ Screenshot loaded — Claude will read the tweet + chart directly
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <label style={labelStyle}>SCREENSHOT (optional — paste, drag, or click)</label>
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          processFile(e.dataTransfer.files[0]);
        }}
        style={{
          border: `1px dashed ${dragging ? colors.accent : 'rgba(255,255,255,0.15)'}`,
          borderRadius: '0.5rem',
          padding: '1rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'rgba(125,249,255,0.04)' : 'transparent',
          transition: 'all 0.15s',
          color: colors.textSecondary,
          fontFamily: 'monospace',
          fontSize: '0.75rem',
        }}
        onMouseOver={e => { if (!dragging) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
        onMouseOut={e => { if (!dragging) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
      >
        Drop screenshot here · Ctrl+V to paste · or click to browse
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => processFile(e.target.files[0])}
      />
    </div>
  );
}

// ─── Tab: Reply ───────────────────────────────────────────────────────────────

function ReplyTab({ newsContext, setNewsContext }) {
  const [tweetText, setTweetText] = useState('');
  const [authorHandle, setAuthorHandle] = useState('');
  const [userIntent, setUserIntent] = useState('');
  const [ticker, setTicker] = useState('');
  const [autoData, setAutoData] = useState(null);

  const [image, setImage] = useState(null);         // { base64, mediaType }
  const [imagePreview, setImagePreview] = useState('');

  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleImageLoad({ base64, mediaType, previewUrl }) {
    setImage({ base64, mediaType });
    setImagePreview(previewUrl);
  }

  function clearImage() {
    setImage(null);
    setImagePreview('');
  }

  async function handleGenerate() {
    const hasText = tweetText.trim();
    const hasImage = !!image;
    if (!hasText && !hasImage) return;

    setLoading(true);
    setError('');
    setOutput('');
    setAutoData(null);

    try {
      let data;
      if (hasImage) {
        data = await post('/api/engage/reply-from-image', {
          imageBase64: image.base64,
          mediaType: image.mediaType,
          authorHandle: authorHandle.trim() || undefined,
          userIntent: userIntent.trim() || undefined,
          newsContext: newsContext.trim() || undefined,
          ticker: ticker.trim() || undefined,
        });
      } else {
        data = await post('/api/engage/reply', {
          tweetText: tweetText.trim(),
          authorHandle: authorHandle.trim(),
          userIntent: userIntent.trim(),
          newsContext: newsContext.trim(),
          ticker: ticker.trim(),
        });
        if (data.autoTicker || data.autoPplLevels) {
          setAutoData({ ticker: data.autoTicker, ppl: data.autoPplLevels });
        }
      }
      setOutput(data.reply || '');
    } catch (err) {
      setError(err.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  }

  const canGenerate = !loading && (!!tweetText.trim() || !!image);

  return (
    <div>
      <ImageUploadZone
        image={image}
        imagePreview={imagePreview}
        onImageLoad={handleImageLoad}
        onClear={clearImage}
      />

      <InputField label={image ? 'Additional context (optional — Claude will read the screenshot)' : 'Original Tweet'}>
        <StyledTextarea
          value={tweetText}
          onChange={e => setTweetText(e.target.value)}
          placeholder={image ? 'Add any extra context here, or leave blank…' : 'Paste tweet text here…'}
          rows={image ? 2 : 4}
        />
      </InputField>

      <InputField label="Who posted it?">
        <StyledInput
          value={authorHandle}
          onChange={e => setAuthorHandle(e.target.value)}
          placeholder="@handle, follower count, context (optional)"
        />
      </InputField>

      <InputField label="What do we want to convey?">
        <StyledInput
          value={userIntent}
          onChange={e => setUserIntent(e.target.value)}
          placeholder="e.g. agree + add BayesAIn data, politely disagree (optional)"
        />
      </InputField>

      <InputField label="News context">
        <StyledInput
          value={newsContext}
          onChange={e => setNewsContext(e.target.value)}
          placeholder="Click a headline → or type here (optional)"
        />
      </InputField>

      <InputField label="Related ticker (auto-detected if blank)">
        <StyledInput
          value={ticker}
          onChange={e => setTicker(e.target.value)}
          placeholder="e.g. SPY — or leave blank to auto-detect"
          style={{ ...inputStyle, width: '260px' }}
        />
      </InputField>

      <ActionButton
        label={loading ? (image ? 'Reading screenshot + generating…' : 'Fetching data + generating…') : 'Generate Reply →'}
        onClick={handleGenerate}
        disabled={!canGenerate}
      />

      {autoData && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', fontFamily: 'monospace', color: '#4ade80', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {autoData.ticker && <span>↳ Auto-detected: ${autoData.ticker}</span>}
          {autoData.ppl && <span>PPL loaded: L${autoData.ppl.low?.toFixed(0)} / M${autoData.ppl.mode?.toFixed(0)} / H${autoData.ppl.high?.toFixed(0)}</span>}
          <span style={{ color: '#6b6e85' }}>+ live news injected</span>
        </div>
      )}

      <OutputSection
        output={output}
        loading={loading}
        error={error}
        onClear={() => { setOutput(''); setError(''); setAutoData(null); }}
      />
    </div>
  );
}

// ─── Tab: Thread ──────────────────────────────────────────────────────────────

const THREAD_TEMPLATES = [
  '5 ETFs BayesAIn is watching today',
  'How PPL levels work',
  'Why most traders fail at support/resistance',
  'We called [TICKER] — full breakdown',
];

const AUDIENCE_OPTIONS = ['Beginners', 'Casual Traders', 'Active Traders'];

function ThreadTab({ newsContext, setNewsContext }) {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('Casual Traders');
  const [tweetCount, setTweetCount] = useState(5);

  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setOutput('');
    try {
      const data = await post('/api/engage/thread', {
        topic: topic.trim(),
        audience: audience.toLowerCase().replace(' ', '_'),
        tweetCount,
        newsContext: newsContext.trim(),
      });
      setOutput(data.thread || '');
    } catch (err) {
      setError(err.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <InputField label="Thread topic">
        <StyledInput
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="e.g. How BayesAIn identifies key levels"
        />
      </InputField>

      {/* Quick templates */}
      <div style={{ marginBottom: '0.875rem' }}>
        <label style={labelStyle}>Quick templates</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {THREAD_TEMPLATES.map(t => (
            <PillButton
              key={t}
              label={t}
              active={topic === t}
              onClick={() => setTopic(t)}
            />
          ))}
        </div>
      </div>

      {/* Target audience */}
      <div style={{ marginBottom: '0.875rem' }}>
        <label style={labelStyle}>Target audience</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {AUDIENCE_OPTIONS.map(opt => (
            <PillButton
              key={opt}
              label={opt}
              active={audience === opt}
              onClick={() => setAudience(opt)}
            />
          ))}
        </div>
      </div>

      {/* Tweet count */}
      <InputField label="Number of tweets">
        <input
          type="number"
          min={3}
          max={8}
          value={tweetCount}
          onChange={e => setTweetCount(parseInt(e.target.value, 10))}
          style={{ ...inputStyle, width: '80px' }}
          onFocus={e => e.target.style.borderColor = colors.accent}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
      </InputField>

      <InputField label="News context">
        <StyledInput
          value={newsContext}
          onChange={e => setNewsContext(e.target.value)}
          placeholder="Click a headline → or type here (optional)"
        />
      </InputField>

      <ActionButton
        label={loading ? 'Generating…' : 'Generate Thread →'}
        onClick={handleGenerate}
        disabled={loading || !topic.trim()}
      />

      <OutputSection
        output={output}
        loading={loading}
        error={error}
        onClear={() => { setOutput(''); setError(''); }}
      />
    </div>
  );
}

// ─── Tab: Informational ───────────────────────────────────────────────────────

const INFO_CATEGORIES = [
  'Explain BayesAIn / PPL',
  'Trading psychology',
  'Market mechanics',
  'Elliott Wave basics',
  'Risk management',
  'Reaction to today\'s news',
];

const FORMAT_OPTIONS = ['Single Tweet', 'Short Thread', 'List Format'];
const INFO_AUDIENCE = ['Beginners', 'Intermediate'];

function InformationalTab({ newsContext, setNewsContext }) {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState(INFO_CATEGORIES[0]);
  const [format, setFormat] = useState('Single Tweet');
  const [audience, setAudience] = useState('Beginners');
  const [ticker, setTicker] = useState('');
  const [pplLow, setPplLow] = useState('');
  const [pplMode, setPplMode] = useState('');
  const [pplHigh, setPplHigh] = useState('');

  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setOutput('');
    try {
      const data = await post('/api/engage/informational', {
        topic: topic.trim(),
        category,
        format: format.toLowerCase().replace(' ', '_'),
        audience: audience.toLowerCase(),
        newsContext: newsContext.trim(),
        ticker: ticker.trim(),
        pplLevels: { low: pplLow, mode: pplMode, high: pplHigh },
      });
      setOutput(data.post || '');
    } catch (err) {
      setError(err.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  }

  const smallInputStyle = {
    ...inputStyle,
    width: '90px',
  };

  return (
    <div>
      <InputField label="Topic or concept">
        <StyledInput
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="e.g. What is Bayesian probability"
        />
      </InputField>

      <InputField label="Category">
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
          onFocus={e => e.target.style.borderColor = colors.accent}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        >
          {INFO_CATEGORIES.map(c => (
            <option key={c} value={c} style={{ background: colors.inputBg }}>{c}</option>
          ))}
        </select>
      </InputField>

      <div style={{ marginBottom: '0.875rem' }}>
        <label style={labelStyle}>Format</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {FORMAT_OPTIONS.map(f => (
            <PillButton key={f} label={f} active={format === f} onClick={() => setFormat(f)} />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '0.875rem' }}>
        <label style={labelStyle}>Audience</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {INFO_AUDIENCE.map(a => (
            <PillButton key={a} label={a} active={audience === a} onClick={() => setAudience(a)} />
          ))}
        </div>
      </div>

      <InputField label="News context">
        <StyledInput
          value={newsContext}
          onChange={e => setNewsContext(e.target.value)}
          placeholder="Click a headline → or type here (optional)"
        />
      </InputField>

      {/* Ticker + PPL */}
      <div style={{ marginBottom: '0.875rem' }}>
        <label style={labelStyle}>Ticker + PPL levels (optional)</label>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={ticker}
            onChange={e => setTicker(e.target.value)}
            placeholder="e.g. SPY"
            style={{ ...inputStyle, width: '100px' }}
            onFocus={e => e.target.style.borderColor = colors.accent}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ ...labelStyle, marginBottom: 0, fontSize: '0.6rem' }}>LOW</span>
            <input
              value={pplLow}
              onChange={e => setPplLow(e.target.value)}
              placeholder="0.00"
              type="number"
              style={smallInputStyle}
              onFocus={e => e.target.style.borderColor = colors.accent}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ ...labelStyle, marginBottom: 0, fontSize: '0.6rem' }}>MODE</span>
            <input
              value={pplMode}
              onChange={e => setPplMode(e.target.value)}
              placeholder="0.00"
              type="number"
              style={smallInputStyle}
              onFocus={e => e.target.style.borderColor = colors.accent}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ ...labelStyle, marginBottom: 0, fontSize: '0.6rem' }}>HIGH</span>
            <input
              value={pplHigh}
              onChange={e => setPplHigh(e.target.value)}
              placeholder="0.00"
              type="number"
              style={smallInputStyle}
              onFocus={e => e.target.style.borderColor = colors.accent}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
        </div>
      </div>

      <ActionButton
        label={loading ? 'Generating…' : 'Generate Post →'}
        onClick={handleGenerate}
        disabled={loading || !topic.trim()}
      />

      <OutputSection
        output={output}
        loading={loading}
        error={error}
        onClear={() => { setOutput(''); setError(''); }}
      />
    </div>
  );
}

// ─── Tab: We Called It ────────────────────────────────────────────────────────

const BOUNCE_OPTIONS = ['Hit Exactly', 'Close Call', 'Nailed It Early', 'Bounced Hard'];

function CalledItTab({ newsContext, setNewsContext }) {
  const [ticker, setTicker] = useState('');
  const [postDate, setPostDate] = useState('');
  const [calledLevel, setCalledLevel] = useState('');
  const [actualPrice, setActualPrice] = useState('');
  const [originalPostUrl, setOriginalPostUrl] = useState('');
  const [bounceStrength, setBounceStrength] = useState('Nailed It Early');

  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-calculate days elapsed
  const daysElapsed = postDate
    ? Math.max(0, Math.floor((Date.now() - new Date(postDate).getTime()) / 86400000))
    : '';

  async function handleGenerate() {
    if (!ticker.trim() || !calledLevel || !actualPrice) return;
    setLoading(true);
    setError('');
    setOutput('');
    try {
      const data = await post('/api/engage/called-it', {
        ticker: ticker.trim(),
        postDate,
        calledLevel: parseFloat(calledLevel),
        actualPrice: parseFloat(actualPrice),
        daysElapsed: daysElapsed || 0,
        originalPostUrl: originalPostUrl.trim(),
        bounceStrength,
        newsContext: newsContext.trim(),
      });
      setOutput(data.post || '');
    } catch (err) {
      setError(err.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  }

  const numInputStyle = { ...inputStyle, width: '140px' };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
        <div style={{ flex: '0 0 auto' }}>
          <label style={labelStyle}>Ticker</label>
          <input
            value={ticker}
            onChange={e => setTicker(e.target.value)}
            placeholder="e.g. GDX"
            style={{ ...inputStyle, width: '100px' }}
            onFocus={e => e.target.style.borderColor = colors.accent}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>
        <div style={{ flex: '0 0 auto' }}>
          <label style={labelStyle}>Original post date</label>
          <input
            type="date"
            value={postDate}
            onChange={e => setPostDate(e.target.value)}
            style={{
              ...inputStyle,
              width: '160px',
              colorScheme: 'dark',
            }}
            onFocus={e => e.target.style.borderColor = colors.accent}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>
        <div style={{ flex: '0 0 auto' }}>
          <label style={labelStyle}>Days elapsed</label>
          <input
            readOnly
            value={daysElapsed !== '' ? `${daysElapsed} days` : '—'}
            style={{ ...inputStyle, width: '100px', color: colors.textSecondary, cursor: 'default' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
        <div>
          <label style={labelStyle}>PPL level called</label>
          <input
            type="number"
            value={calledLevel}
            onChange={e => setCalledLevel(e.target.value)}
            placeholder="e.g. 85.00"
            style={numInputStyle}
            onFocus={e => e.target.style.borderColor = colors.accent}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>
        <div>
          <label style={labelStyle}>Actual price hit</label>
          <input
            type="number"
            value={actualPrice}
            onChange={e => setActualPrice(e.target.value)}
            placeholder="e.g. 84.80"
            style={numInputStyle}
            onFocus={e => e.target.style.borderColor = colors.accent}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>
      </div>

      <InputField label="Link to original tweet (optional)">
        <StyledInput
          value={originalPostUrl}
          onChange={e => setOriginalPostUrl(e.target.value)}
          placeholder="https://x.com/…"
        />
      </InputField>

      <div style={{ marginBottom: '0.875rem' }}>
        <label style={labelStyle}>How dramatic?</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {BOUNCE_OPTIONS.map(opt => (
            <PillButton
              key={opt}
              label={opt}
              active={bounceStrength === opt}
              onClick={() => setBounceStrength(opt)}
            />
          ))}
        </div>
      </div>

      <InputField label="News context">
        <StyledInput
          value={newsContext}
          onChange={e => setNewsContext(e.target.value)}
          placeholder="Click a headline → or type here (optional)"
        />
      </InputField>

      <ActionButton
        label={loading ? 'Generating…' : 'Generate Post →'}
        onClick={handleGenerate}
        disabled={loading || !ticker.trim() || !calledLevel || !actualPrice}
      />

      <OutputSection
        output={output}
        loading={loading}
        error={error}
        onClear={() => { setOutput(''); setError(''); }}
      />
    </div>
  );
}

// ─── Main Engage page ─────────────────────────────────────────────────────────

const TABS = [
  { id: 'reply', label: 'Reply' },
  { id: 'thread', label: 'Thread' },
  { id: 'informational', label: 'Informational' },
  { id: 'called-it', label: 'We Called It' },
];

export default function Engage() {
  const [activeTab, setActiveTab] = useState('reply');
  // Shared news context — sidebar sets it, active tab reads it
  const [newsContext, setNewsContext] = useState('');
  const [activeNewsItem, setActiveNewsItem] = useState('');

  function handleSelectNews(title) {
    setNewsContext(title);
    setActiveNewsItem(title);
  }

  const tabBase = {
    fontFamily: 'monospace',
    fontSize: '0.82rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 0',
    paddingBottom: '10px',
    transition: 'color 0.15s',
    whiteSpace: 'nowrap',
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1.5rem 3rem' }}>

        {/* Page label */}
        <div style={{ ...labelStyle, marginBottom: '1.25rem' }}>TWEET GENERATOR</div>

        {/* Two-column layout */}
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}>

          {/* Left panel — generator */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.75rem',
              padding: '1.25rem',
            }}>
              {/* Tab bar */}
              <div style={{
                display: 'flex',
                gap: '1.75rem',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                marginBottom: '1.25rem',
                overflowX: 'auto',
              }}>
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      ...tabBase,
                      color: activeTab === tab.id ? colors.accent : colors.textSecondary,
                      borderBottom: activeTab === tab.id
                        ? `2px solid ${colors.accent}`
                        : '2px solid transparent',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === 'reply' && (
                <ReplyTab newsContext={newsContext} setNewsContext={setNewsContext} />
              )}
              {activeTab === 'thread' && (
                <ThreadTab newsContext={newsContext} setNewsContext={setNewsContext} />
              )}
              {activeTab === 'informational' && (
                <InformationalTab newsContext={newsContext} setNewsContext={setNewsContext} />
              )}
              {activeTab === 'called-it' && (
                <CalledItTab newsContext={newsContext} setNewsContext={setNewsContext} />
              )}
            </div>
          </div>

          {/* Right panel — news sidebar */}
          <NewsSidebar
            onSelectNews={handleSelectNews}
            activeNewsContext={activeNewsItem}
          />
        </div>

        {/* Engagement log — full width below */}
        <EngagementLog />
      </div>
    </Layout>
  );
}
