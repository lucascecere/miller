import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

const LINKS = [
  { label: 'Dashboard', path: '/' },
  { label: 'Engage',    path: '/engage' },
  { label: 'Results',   path: '/results' },
  { label: 'History',   path: '/history' },
  { label: 'Settings',  path: '/settings' },
];

export default function NavBar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  function isActive(path) {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,12,21,0.97)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 1.25rem',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link
          to="/"
          onClick={() => setOpen(false)}
          style={{
            fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem',
            letterSpacing: '0.05em', textDecoration: 'none', color: 'white',
          }}
        >
          Bayes<span style={{ color: '#7DF9FF' }}>AIn</span>
        </Link>

        {isMobile ? (
          /* Hamburger */
          <button
            onClick={() => setOpen(o => !o)}
            aria-label="Menu"
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '8px', display: 'flex', flexDirection: 'column',
              gap: '5px', alignItems: 'center', color: open ? '#7DF9FF' : '#c8cad8',
            }}
          >
            <span style={{ display: 'block', width: '20px', height: '2px', background: 'currentColor', borderRadius: '1px', transition: 'transform 0.2s', transform: open ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <span style={{ display: 'block', width: '20px', height: '2px', background: 'currentColor', borderRadius: '1px', transition: 'opacity 0.2s', opacity: open ? 0 : 1 }} />
            <span style={{ display: 'block', width: '20px', height: '2px', background: 'currentColor', borderRadius: '1px', transition: 'transform 0.2s', transform: open ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {LINKS.map(({ label, path }) => (
              <NavLink key={path} to={path} active={isActive(path)} label={label} />
            ))}
          </div>
        )}
      </nav>

      {/* Mobile dropdown menu */}
      {isMobile && open && (
        <div style={{
          position: 'fixed', top: '52px', left: 0, right: 0, zIndex: 49,
          background: 'rgba(10,12,21,0.98)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '0.5rem',
        }}>
          {LINKS.map(({ label, path }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block', padding: '0.875rem 1.5rem',
                  fontFamily: 'monospace', fontSize: '0.9rem',
                  textDecoration: 'none',
                  color: active ? '#7DF9FF' : '#c8cad8',
                  borderLeft: active ? '3px solid #7DF9FF' : '3px solid transparent',
                  background: active ? 'rgba(125,249,255,0.05)' : 'transparent',
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

function NavLink({ to, active, label }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      style={{
        fontFamily: 'monospace', fontSize: '0.8rem',
        textDecoration: 'none',
        color: active ? '#7DF9FF' : hovered ? '#c8cad8' : '#6b6e85',
        borderBottom: active ? '2px solid #7DF9FF' : 'none',
        paddingBottom: active ? '2px' : '0',
        transition: 'color 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </Link>
  );
}
