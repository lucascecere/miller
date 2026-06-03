import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../api';
import StatusBadge from './StatusBadge';

export default function TickerCard({ ticker, onChartGenerated }) {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  const changePos = (ticker.daily_change_pct || 0) >= 0;
  const changeColor = changePos ? '#4ade80' : '#f87171';
  const changeSign = changePos ? '+' : '';
  const score = ticker.priority_score || 0;
  const scoreColor = score >= 70 ? '#7DF9FF' : score >= 40 ? '#fbbf24' : '#6b6e85';

  async function handleGenerate(e) {
    e.stopPropagation();
    setGenerating(true);
    setGenError('');
    try {
      await post(`/api/charts/generate/${ticker.symbol}`);
      if (onChartGenerated) onChartGenerated();
    } catch (err) {
      setGenError(err.message.slice(0, 120));
    } finally {
      setGenerating(false);
    }
  }

  const cardStyle = {
    background: '#0c0e17',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.75rem',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  };

  return (
    <div
      style={cardStyle}
      onMouseOver={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'}
      onMouseOut={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}
    >
      <div style={{display:'flex',alignItems:'flex-start',gap:'1rem',flexWrap:'wrap'}}>

        {/* Ticker + company */}
        <div style={{minWidth:'90px'}}>
          <div style={{fontFamily:'monospace',fontWeight:700,fontSize:'1.25rem',color:'#7DF9FF'}}>{ticker.symbol}</div>
          <div style={{color:'#6b6e85',fontSize:'0.7rem',marginTop:'2px',lineHeight:1.3,maxWidth:'90px'}}>{ticker.company_name}</div>
          {ticker.is_core ? (
            <span style={{display:'inline-block',marginTop:'4px',fontSize:'0.55rem',fontFamily:'monospace',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'#6b6e85',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'3px',padding:'1px 4px'}}>Core</span>
          ) : null}
        </div>

        {/* Price */}
        <div style={{minWidth:'100px'}}>
          <div style={{fontFamily:'monospace',fontWeight:700,fontSize:'1.125rem',color:'white'}}>
            {ticker.price ? `$${ticker.price.toFixed(2)}` : '—'}
          </div>
          <div style={{fontFamily:'monospace',fontSize:'0.875rem',color:changeColor}}>
            {ticker.daily_change_pct != null ? `${changeSign}${ticker.daily_change_pct.toFixed(2)}%` : '—'}
          </div>
        </div>

        {/* PPL */}
        <div style={{flex:1,minWidth:'120px'}}>
          <div style={{fontSize:'0.6rem',fontFamily:'monospace',textTransform:'uppercase',letterSpacing:'0.1em',color:'#6b6e85',marginBottom:'4px'}}>PPL Levels</div>
          <div style={{display:'flex',gap:'0.75rem',fontFamily:'monospace',fontSize:'0.75rem'}}>
            <span><span style={{color:'#f87171'}}>L</span> <span style={{color:'white'}}>{ticker.ppl_low ? `$${ticker.ppl_low.toFixed(0)}` : '—'}</span></span>
            <span><span style={{color:'#fbbf24'}}>M</span> <span style={{color:'white'}}>{ticker.ppl_mode ? `$${ticker.ppl_mode.toFixed(0)}` : '—'}</span></span>
            <span><span style={{color:'#4ade80'}}>H</span> <span style={{color:'white'}}>{ticker.ppl_high ? `$${ticker.ppl_high.toFixed(0)}` : '—'}</span></span>
          </div>
        </div>

        {/* Priority score */}
        <div style={{textAlign:'center',minWidth:'60px'}}>
          <div style={{fontFamily:'monospace',fontWeight:700,fontSize:'1.5rem',color:scoreColor}}>{score}</div>
          <div style={{fontSize:'0.6rem',fontFamily:'monospace',textTransform:'uppercase',letterSpacing:'0.08em',color:'#6b6e85'}}>Priority</div>
          <div style={{marginTop:'4px',height:'4px',background:'rgba(255,255,255,0.1)',borderRadius:'2px',width:'48px',margin:'4px auto 0'}}>
            <div style={{height:'100%',background:'#7DF9FF',borderRadius:'2px',width:`${score}%`}} />
          </div>
        </div>

        {/* Status + actions */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'8px',minWidth:'140px'}}>
          <StatusBadge status={ticker.status} />
          <div style={{display:'flex',gap:'8px'}}>
            <button
              onClick={handleGenerate}
              disabled={generating}
              style={{fontSize:'0.75rem',fontFamily:'monospace',border:'1px solid rgba(255,255,255,0.2)',color:'#c8cad8',background:'transparent',padding:'6px 10px',borderRadius:'6px',cursor:generating?'not-allowed':'pointer',opacity:generating?0.5:1,transition:'border-color 0.15s,color 0.15s',whiteSpace:'nowrap'}}
              onMouseOver={e=>{if(!generating){e.target.style.borderColor='#7DF9FF';e.target.style.color='#7DF9FF';}}}
              onMouseOut={e=>{e.target.style.borderColor='rgba(255,255,255,0.2)';e.target.style.color='#c8cad8';}}
            >
              {generating ? 'Opening…' : 'Open Chart'}
            </button>
            <button
              onClick={() => navigate(`/post/${ticker.symbol}`)}
              style={{fontSize:'0.75rem',fontFamily:'monospace',border:'1px solid rgba(125,249,255,0.5)',color:'#7DF9FF',background:'transparent',padding:'6px 10px',borderRadius:'6px',cursor:'pointer',transition:'background 0.15s'}}
              onMouseOver={e=>e.target.style.background='rgba(125,249,255,0.1)'}
              onMouseOut={e=>e.target.style.background='transparent'}
            >
              View
            </button>
          </div>
          {genError && (
            <p style={{
              color: genError.startsWith('Chart tool') ? '#7DF9FF' : '#f87171',
              fontSize:'0.65rem', fontFamily:'monospace', maxWidth:'140px', textAlign:'right'
            }}>{genError}</p>
          )}
        </div>

      </div>

      {/* Chart thumbnail */}
      {ticker.chart_2d_path && (
        <div style={{marginTop:'0.75rem',borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:'0.75rem'}}>
          <img
            src={`/${ticker.chart_2d_path}`}
            alt={`${ticker.symbol} chart`}
            style={{width:'100%',maxHeight:'120px',objectFit:'contain',borderRadius:'4px',opacity:0.9}}
          />
        </div>
      )}
    </div>
  );
}
