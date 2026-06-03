import { useEffect } from 'react';

export default function ChartLightbox({ src, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'zoom-out',
        backdropFilter: 'blur(4px)',
      }}
    >
      <img
        src={src}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '92vw', maxHeight: '88vh',
          borderRadius: '8px',
          boxShadow: '0 0 60px rgba(0,0,0,0.8)',
          cursor: 'default',
        }}
      />
      <button
        onClick={onClose}
        style={{
          position: 'fixed', top: '1.25rem', right: '1.5rem',
          background: 'transparent', border: '1px solid rgba(255,255,255,0.25)',
          color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', fontSize: '0.875rem',
          padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
        }}
      >
        ✕ Close
      </button>
    </div>
  );
}
