import { Link, Outlet, useNavigate } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <aside style={{
        width: '240px',
        background: '#1e293b',
        color: '#fff',
        padding: '20px'
      }}>
        <h2 style={{ marginBottom: '24px' }}>Student Risk System</h2>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
          <Link to="/students" style={{ color: '#fff', textDecoration: 'none' }}>Sinh viên</Link>
          <Link to="/semesters" style={{ color: '#fff', textDecoration: 'none' }}>Học kỳ</Link>
          <Link to="/ai" style={{ color: '#fff', textDecoration: 'none' }}>AI & Retrain</Link>
        </nav>

        <button
          onClick={handleLogout}
          style={{
            marginTop: '30px',
            padding: '10px 14px',
            border: 'none',
            background: '#ef4444',
            color: '#fff',
            cursor: 'pointer',
            borderRadius: '6px'
          }}
        >
          Đăng xuất
        </button>
      </aside>

      <main style={{ flex: 1, background: '#f8fafc', padding: '24px' }}>
        <Outlet />
      </main>
    </div>
  );
}