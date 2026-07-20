// LoginPage.jsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function LoginPage() {
  const savedEmail = localStorage.getItem('rememberEmail') || '';
  const [email, setEmail] = useState(savedEmail || 'admin@studentrisk.local');
  const [password, setPassword] = useState(savedEmail ? '' : '123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!savedEmail);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState({ type: '', text: '' });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const reason = new URLSearchParams(location.search).get('reason');
    const fromExpiredSession = reason === 'session_expired' || sessionStorage.getItem('authExpired') === '1';

    if (fromExpiredSession) {
      setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      sessionStorage.removeItem('authExpired');
    }
  }, [location.search]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axiosClient.post('/auth/login', { email, password });
      if (!res.data?.token) {
        setError('Đăng nhập thất bại');
        return;
      }
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user || {}));
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberEmail');
      }
      navigate('/');
    } catch (err) {
      if (err?.code === 'ERR_NETWORK') {
        setError('Không kết nối được tới server backend (http://localhost:5000).');
      } else {
        setError(err?.response?.data?.message || 'Sai email hoặc mật khẩu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <h1 className="login-welcome">Welcome</h1>
          <p className="login-desc">Hệ thống quản lý rủi ro sinh viên thông minh.</p>
        </div>

        <div className="login-right">
          <h2 className="login-signin">Đăng nhập</h2>
          
          {error && (
            <div className="login-error">{error}</div>
          )}

          <form onSubmit={handleLogin}>
            <div className="login-field">
              <label>Email</label>
              <div className="login-input-wrapper">
                <IconMail />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@studentrisk.local"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label>Mật khẩu</label>
              <div className="login-input-wrapper">
                <IconLock />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="login-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <button type="button" className="login-forgot" onClick={() => setShowForgot(true)}>Quên mật khẩu?</button>
            </div>

            <button type="submit" disabled={loading} className="login-button">
              {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
            </button>
          </form>
        </div>
      </div>

      {/* Modal Quên mật khẩu */}
      {showForgot ? (
        <div className="modal-overlay" onClick={() => setShowForgot(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Quên mật khẩu</h2>
              <button type="button" className="modal-close" onClick={() => setShowForgot(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 16, color: 'var(--gray-600)' }}>
                Nhập email tài khoản của bạn. Hệ thống sẽ tạo mật khẩu tạm và gửi qua email.
              </p>
              <div className="form-group">
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  disabled={forgotLoading}
                />
              </div>
              {forgotMsg.text ? (
                <div style={{
                  marginTop: 12, padding: '10px 14px', borderRadius: 8,
                  background: forgotMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  color: forgotMsg.type === 'success' ? '#15803d' : '#dc2626',
                  border: `1px solid ${forgotMsg.type === 'success' ? '#86efac' : '#fca5a5'}`,
                  fontSize: 13
                }}>
                  <div>{forgotMsg.text}</div>
                  {forgotMsg.tempPassword ? (
                    <div style={{ marginTop: 8, padding: '8px 12px', background: '#e0f2fe', border: '2px dashed #3b82f6', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>Mật khẩu tạm:</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#1e40af', letterSpacing: 2 }}>{forgotMsg.tempPassword}</div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForgot(false); setForgotMsg({ type: '', text: '' }); }}>Đóng</button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={forgotLoading}
                onClick={async () => {
                  if (!forgotEmail) {
                    setForgotMsg({ type: 'error', text: 'Vui lòng nhập email' });
                    return;
                  }
                  try {
                    setForgotLoading(true);
                    setForgotMsg({ type: '', text: '' });
                    const res = await axiosClient.post('/auth/forgot-password', { email: forgotEmail });
                    setForgotMsg({
                      type: 'success',
                      text: res.data?.message || 'Mật khẩu tạm đã được tạo!',
                      tempPassword: res.data?.tempPassword || null
                    });
                    setForgotEmail('');
                  } catch (err) {
                    setForgotMsg({
                      type: 'error',
                      text: err?.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.'
                    });
                  } finally {
                    setForgotLoading(false);
                  }
                }}
              >
                {forgotLoading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}