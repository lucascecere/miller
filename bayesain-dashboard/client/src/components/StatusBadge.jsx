const STYLES = {
  draft:       { background:'#3a3d52', color:'#c8cad8' },
  chart_ready: { background:'rgba(120,60,0,0.5)', color:'#fcd34d' },
  posted:      { background:'rgba(0,60,20,0.5)', color:'#86efac' },
};
const LABELS = { draft:'Draft', chart_ready:'Chart Ready', posted:'Posted' };

export default function StatusBadge({ status }) {
  const s = status || 'draft';
  const style = STYLES[s] || STYLES.draft;
  return (
    <span style={{
      display:'inline-block', padding:'2px 8px', borderRadius:'4px',
      fontSize:'0.625rem', fontFamily:'monospace', fontWeight:700,
      textTransform:'uppercase', letterSpacing:'0.08em',
      ...style
    }}>
      {LABELS[s] || s}
    </span>
  );
}
