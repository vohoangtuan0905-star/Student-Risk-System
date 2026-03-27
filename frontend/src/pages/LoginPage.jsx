import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@studentrisk.local');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axiosClient.post('/auth/login', {
        email,
        password
      });

      console.log('LOGIN RESPONSE:', res.data);

      if (!res.data || !res.data.token) {
        setError('Backend không trả về token');
        return;
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user || {}));

      console.log('TOKEN SAU KHI LƯU:', localStorage.getItem('token'));
      console.log('USER SAU KHI LƯU:', localStorage.getItem('user'));

      navigate('/');
    } catch (err) {
      console.log('LOGIN ERROR FULL:', err);
      console.log('LOGIN ERROR RESPONSE:', err?.response);
      console.log('LOGIN ERROR DATA:', err?.response?.data);

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Đăng nhập thất bại'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f1f5f9'
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: '380px',
          background: '#fff',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
        }}
      >
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>
          Đăng nhập hệ thống
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', marginTop: '6px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', marginTop: '6px' }}
          />
        </div>

        {error && (
          <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}