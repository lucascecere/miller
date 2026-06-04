import NavBar from './NavBar';

export default function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#07090f' }}>
      <NavBar />
      {children}
    </div>
  );
}
