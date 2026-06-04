import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PostView from './pages/PostView';
import Engage from './pages/Engage';
import Results from './pages/Results';
import History from './pages/History';
import Settings from './pages/Settings';
import { get } from './api';

function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    get('/api/me')
      .then(() => setStatus('ok'))
      .catch(() => setStatus('unauth'));
  }, []);
  if (status === 'loading') return (
    <div className="flex items-center justify-center h-screen" style={{background:'#07090f',color:'#7DF9FF',fontFamily:'monospace'}}>
      Loading…
    </div>
  );
  if (status === 'unauth') return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/post/:ticker" element={<ProtectedRoute><PostView /></ProtectedRoute>} />
        <Route path="/engage" element={<ProtectedRoute><Engage /></ProtectedRoute>} />
        <Route path="/results" element={<Results />} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
