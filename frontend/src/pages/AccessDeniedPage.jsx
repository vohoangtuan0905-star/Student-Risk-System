import { useNavigate } from 'react-router-dom';

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export default function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '600px', textAlign: 'center', padding: '60px 40px' }}>
        <div style={{ fontSize: '80px', marginBottom: '20px', opacity: 0.3 }}>
          <IconLock />
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px', color: 'var(--gray-900)' }}>
          403 - Truy cập bị từ chối
        </h1>

        <p style={{ fontSize: '16px', color: 'var(--gray-600)', marginBottom: '30px' }}>
          Bạn không có quyền truy cập trang này. Chỉ có <strong>Quản trị viên (Admin)</strong> mới có thể truy cập tài nguyên này.
        </p>

        <div style={{ 
          padding: '20px', 
          backgroundColor: 'var(--yellow-50)', 
          borderLeft: '4px solid var(--yellow-500)',
          textAlign: 'left',
          marginBottom: '30px',
          borderRadius: '4px'
        }}>
          <strong style={{ color: 'var(--yellow-900)' }}>💡 Ghi chú:</strong>
          <ul style={{ marginTop: '10px', marginLeft: '20px', color: 'var(--yellow-800)' }}>
            <li>Nếu bạn là quản trị viên, hãy đăng nhập lại với tài khoản admin</li>
            <li>Nếu bạn là giáo viên, bạn chỉ có thể truy cập: Dashboard, Sinh viên, Học kỳ, AI</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            <IconHome />
            Về Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
