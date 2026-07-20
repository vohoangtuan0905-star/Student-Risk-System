import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import axiosClient from '../api/axiosClient';

// ── SVG Icons (inline, no extra deps) ──────────────────────────
const IconGrid      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconUsers     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconCalendar  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconBrain     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2Z"/></svg>;
const IconLogout    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconShield    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconChevron   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IconBuilding  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
const IconUserGroup = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { path: '/',          label: 'Dashboard',    icon: IconGrid,     exact: true, adminOnly: false },
      { path: '/students',  label: 'Sinh viên',    icon: IconUsers,    adminOnly: false },
    ],
  },
  {
    label: 'Quản lý',
    items: [
      { path: '/semesters', label: 'Học kỳ',       icon: IconCalendar, adminOnly: true },
      { path: '/departments', label: 'Khoa',       icon: IconBuilding,  adminOnly: true },
      { path: '/classes',     label: 'Lớp học',    icon: IconUsers,     adminOnly: true },
      { path: '/lecturers',   label: 'Giảng viên', icon: IconUserGroup, adminOnly: true },
      { path: '/users',       label: 'Người dùng', icon: IconUserGroup, adminOnly: true },
    ],
  },
  {
    label: 'Công cụ',
    items: [
      { path: '/ai',        label: 'AI & Retrain', icon: IconBrain, adminOnly: true },
    ],
  },
];

export default function AdminLayout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = JSON.parse(localStorage.getItem('user') || '{}');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === '1');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const userMenuRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem('sidebarCollapsed', next ? '1' : '0');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!userMenuRef.current?.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);

  const initials = (user.full_name || 'A')
    .split(' ')
    .map(w => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  const allItems = NAV_SECTIONS.flatMap(s => s.items);
  const currentPage = allItems.find(i => isActive(i))?.label ?? 'Hệ thống';

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'app-shell--sidebar-collapsed' : ''}`}>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className={`sidebar ${sidebarCollapsed ? 'sidebar--collapsed' : ''}`}>

        {/* Brand */}
        <div className="sidebar__brand">
          <div className="sidebar__brand-icon">
            <IconShield />
          </div>
          <div className="sidebar__brand-text">
            <span className="sidebar__brand-title">Student Risk</span>
            <span className="sidebar__brand-sub">Management System</span>
          </div>
        </div>

        {/* User profile — Wieldy style */}
        <div className="sidebar__profile">
          <div className="sidebar__avatar sidebar__avatar--profile">{initials}</div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{user.full_name || 'Người dùng'}</div>
            <div className="sidebar__user-role">{user.role || 'Admin'}</div>
          </div>
        </div>

        {/* Navigation by section */}
        <nav className="sidebar__nav">
          {NAV_SECTIONS.map(section => (
            (() => {
              const visibleItems = section.items.filter((item) => !(item.adminOnly && user.role !== 'admin'));

              if (visibleItems.length === 0) {
                return null;
              }

              return (
                <div key={section.label} className="sidebar__section">
                  <span className="sidebar__section-label">{section.label}</span>
                  {visibleItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`sidebar__link ${isActive(item) ? 'active' : ''}`}
                    >
                      <span className="sidebar__link-icon"><item.icon /></span>
                      <span className="sidebar__link-text">{item.label}</span>
                      {isActive(item) && <span className="sidebar__link-dot" />}
                    </Link>
                  ))}
                </div>
              );
            })()
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar__footer" />
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <div className="main-content">

        {/* Topbar — Wieldy style */}
        <header className="topbar">
          <div className="topbar__left">
            <button
              type="button"
              className={`topbar__sidebar-toggle ${sidebarCollapsed ? 'topbar__sidebar-toggle--collapsed' : ''}`}
              onClick={toggleSidebar}
              title={sidebarCollapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
              aria-label={sidebarCollapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
            >
              <IconChevron />
            </button>
          </div>

          <div className="topbar__right">
            <div className="topbar__user-wrap" ref={userMenuRef}>
              <button
                type="button"
                className="topbar__user"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                <div className="topbar__avatar">{initials}</div>
                <div className="topbar__user-info">
                  <div className="topbar__user-name">{user.full_name || 'Người dùng'}</div>
                  <div className="topbar__user-role">Vai trò: {user.role || 'Admin'}</div>
                </div>
                <span className="topbar__chevron"><IconChevron /></span>
              </button>

              {userMenuOpen ? (
                <div className="topbar__user-menu" role="menu">
                  <button type="button" className="topbar__user-menu-item" role="menuitem" onClick={() => { setProfileOpen(true); setUserMenuOpen(false); setPwMsg({ type: '', text: '' }); setPwForm({ current_password: '', new_password: '', confirm_password: '' }); }}>
                    Xem hồ sơ
                  </button>
                  <button
                    type="button"
                    className="topbar__user-menu-item topbar__user-menu-item--danger"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {/* Breadcrumb strip */}
        <div className="breadcrumb-bar">
          <span className="breadcrumb-bar__root">Hệ thống</span>
          <span className="breadcrumb-bar__sep"><IconChevron /></span>
          <span className="breadcrumb-bar__page">{currentPage}</span>
        </div>

        {/* Page content */}
        <main>
          <Outlet />
        </main>
      </div>

      {/* ── Profile Modal ──────────────────────────── */}
      {profileOpen ? (
        <div className="modal-overlay" onClick={() => setProfileOpen(false)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Hồ sơ cá nhân</h2>
              <button type="button" className="modal-close" onClick={() => setProfileOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div><strong>Họ tên:</strong><br/>{user.full_name || '-'}</div>
                <div><strong>Email:</strong><br/>{user.email || '-'}</div>
                <div><strong>Vai trò:</strong><br/>{user.role === 'admin' ? 'Quản trị viên' : 'Giảng viên'}</div>
                <div><strong>ID:</strong><br/>{user.id || '-'}</div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)', margin: '16px 0' }}/>

              <div className="card__title" style={{ marginBottom: 12 }}>Đổi mật khẩu</div>
              <div className="form-group">
                <label className="label">Mật khẩu hiện tại</label>
                <input type="password" className="input" value={pwForm.current_password} onChange={(e) => setPwForm(p => ({ ...p, current_password: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Mật khẩu mới</label>
                <input type="password" className="input" value={pwForm.new_password} onChange={(e) => setPwForm(p => ({ ...p, new_password: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Xác nhận mật khẩu mới</label>
                <input type="password" className="input" value={pwForm.confirm_password} onChange={(e) => setPwForm(p => ({ ...p, confirm_password: e.target.value }))} />
              </div>

              {pwMsg.text ? (
                <div style={{ padding: '8px 12px', borderRadius: 8, marginTop: 8, background: pwMsg.type === 'success' ? '#f0fdf4' : '#fef2f2', color: pwMsg.type === 'success' ? '#15803d' : '#dc2626', border: `1px solid ${pwMsg.type === 'success' ? '#86efac' : '#fca5a5'}` }}>
                  {pwMsg.text}
                </div>
              ) : null}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setProfileOpen(false)}>Đóng</button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={pwLoading}
                onClick={async () => {
                  if (!pwForm.current_password || !pwForm.new_password) {
                    setPwMsg({ type: 'error', text: 'Vui lòng nhập đủ mật khẩu' });
                    return;
                  }
                  if (pwForm.new_password !== pwForm.confirm_password) {
                    setPwMsg({ type: 'error', text: 'Mật khẩu mới không khớp' });
                    return;
                  }
                  if (pwForm.new_password.length < 6) {
                    setPwMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
                    return;
                  }
                  try {
                    setPwLoading(true);
                    const res = await axiosClient.put('/auth/change-password', {
                      current_password: pwForm.current_password,
                      new_password: pwForm.new_password
                    });
                    setPwMsg({ type: 'success', text: res.data?.message || 'Đổi mật khẩu thành công!' });
                    setPwForm({ current_password: '', new_password: '', confirm_password: '' });
                  } catch (err) {
                    setPwMsg({ type: 'error', text: err?.response?.data?.message || 'Đổi mật khẩu thất bại' });
                  } finally {
                    setPwLoading(false);
                  }
                }}
              >
                {pwLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}