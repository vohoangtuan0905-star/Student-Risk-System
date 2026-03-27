import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">Student Risk System</div>

        <nav className="sidebar__nav">
          <Link className={`sidebar__link ${isActive('/') ? 'active' : ''}`} to="/">
            Dashboard
          </Link>

          <Link
            className={`sidebar__link ${location.pathname.startsWith('/students') ? 'active' : ''}`}
            to="/students"
          >
            Sinh viên
          </Link>

          <Link
            className={`sidebar__link ${location.pathname.startsWith('/semesters') ? 'active' : ''}`}
            to="/semesters"
          >
            Học kỳ
          </Link>

          <Link
            className={`sidebar__link ${location.pathname.startsWith('/ai') ? 'active' : ''}`}
            to="/ai"
          >
            AI & Retrain
          </Link>
        </nav>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div>
            <strong>{user.full_name || 'Người dùng'}</strong>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Vai trò: {user.role || 'admin'}
            </div>
          </div>

          <button className="btn btn-danger" onClick={handleLogout}>
            Đăng xuất
          </button>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}