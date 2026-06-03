export default function TweetEditor({ value, onChange, maxChars = 280 }) {
  const count = value ? value.length : 0;
  const over = count > maxChars;

  return (
    <div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={7}
        style={{
          width:'100%', background:'#0f1120',
          border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:'0.5rem', padding:'0.75rem 1rem',
          color:'white', fontFamily:'monospace', fontSize:'0.875rem',
          outline:'none', resize:'none', boxSizing:'border-box',
          transition:'border-color 0.15s'
        }}
        placeholder="Tweet text will appear here after refreshing prices…"
        onFocus={e=>e.target.style.borderColor='#7DF9FF'}
        onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}
      />
      <div style={{fontSize:'0.75rem',fontFamily:'monospace',textAlign:'right',marginTop:'4px',color:over?'#f87171':'#6b6e85'}}>
        {count} / {maxChars}
      </div>
    </div>
  );
}
