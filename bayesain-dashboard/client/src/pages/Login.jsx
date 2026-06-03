import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../api';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await post('/api/login', { password });
      navigate('/');
    } catch {
      setError('Incorrect password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background:'#07090f'}}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 style={{fontFamily:'monospace',fontSize:'1.875rem',fontWeight:700,color:'white',letterSpacing:'0.1em',textTransform:'uppercase'}}>
            BAYES<span style={{color:'#7DF9FF'}}>AIn</span>
          </h1>
          <p style={{color:'#6b6e85',fontSize:'0.75rem',marginTop:'0.5rem',letterSpacing:'0.1em',textTransform:'uppercase',fontFamily:'monospace'}}>
            Team Dashboard
          </p>
        </div>
        <form onSubmit={handleSubmit} style={{background:'#0c0e17',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'0.75rem',padding:'2rem'}}>
          <div style={{marginBottom:'1rem'}}>
            <label style={{display:'block',fontSize:'0.75rem',fontFamily:'monospace',color:'#6b6e85',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.5rem'}}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{width:'100%',background:'#0f1120',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'0.5rem',padding:'0.75rem 1rem',color:'white',fontFamily:'monospace',fontSize:'0.875rem',outline:'none',boxSizing:'border-box'}}
              placeholder="Enter team password"
              autoFocus
              onFocus={e => e.target.style.borderColor='#7DF9FF'}
              onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
            />
          </div>
          {error && <p style={{color:'#f87171',fontSize:'0.875rem',fontFamily:'monospace',marginBottom:'0.75rem'}}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{width:'100%',border:'1px solid rgba(125,249,255,0.6)',color:'#7DF9FF',background:'transparent',fontFamily:'monospace',fontWeight:700,fontSize:'0.875rem',textTransform:'uppercase',letterSpacing:'0.1em',padding:'0.75rem',borderRadius:'0.5rem',cursor:loading?'not-allowed':'pointer',opacity:loading?0.5:1,transition:'background 0.15s'}}
            onMouseOver={e => { if(!loading) e.target.style.background='rgba(125,249,255,0.1)'; }}
            onMouseOut={e => { e.target.style.background='transparent'; }}
          >
            {loading ? 'Entering…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
