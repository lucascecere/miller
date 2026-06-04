import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const LINKS = [
  { label: 'Dashboard', path: '/' },
  { label: 'Engage', path: '/engage' },
  { label: 'Results', path: '/results' },
  { label: 'History', path: '/history' },
  { label: 'Settings', path: '/settings' },
];

export default function NavBar() {
  const location = useLocation();

  function isActive(path) {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(10,12,21,0.95)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '0 1.5rem',
      height: '52px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <Link
        to="/"
        style={{
          fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem',
          letterSpacing: '0.05em', textDecoration: 'none', color: 'white',
        }}
      >
        BAYES<span style={{ color: '#7DF9FF' }}>AIn</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {LINKS.map(({ label, path }) => {
          const active = isActive(path);
          return (
            <NavLink key={path} to={path} active={active} label={label} />
          );
        })}
      </div>
    </nav>
  );
}

function NavLink({ to, active, label }) {
  const [hovered, setHovered] = useState(false);

  const color = active ? '#7DF9FF' : hovered ? '#c8cad8' : '#6b6e85';
  const borderBottom = active ? '2px solid #7DF9FF' : 'none';
  const paddingBottom = active ? '2px' : '0';

  return (
    <Link
      to={to}
      style={{
        fontFamily: 'monospace', fontSize: '0.8rem',
        textDecoration: 'none', color, borderBottom, paddingBottom,
        transition: 'color 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </Link>
  );
}
