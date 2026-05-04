import { Navigate, useLocation } from 'react-router-dom';
import { isAdminOnlyRoute } from '../utils/roleUtils';

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload?.exp) {
      return false;
    }
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Kiểm tra authentication
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login?reason=session_expired" replace />;
  }

  // Kiểm tra authorization - Nếu là admin-only route, phải là admin
  if (isAdminOnlyRoute(location.pathname)) {
    if (user.role !== 'admin') {
      return <Navigate to="/access-denied" replace />;
    }
  }

  return children;
}