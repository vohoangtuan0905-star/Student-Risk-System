/**
 * Role utilities - Hệ thống xác định và kiểm tra role người dùng
 */

import axiosClient from '../api/axiosClient';

// Các vai trò được hỗ trợ
export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
};

/**
 * Lấy vai trò của user hiện tại từ localStorage
 */
export const getCurrentRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role || ROLES.TEACHER; // Default = teacher nếu không có
  } catch {
    return ROLES.TEACHER;
  }
};

/**
 * Lấy user hiện tại từ localStorage
 */
export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

/**
 * Fetch user info từ backend endpoint /auth/me
 * Used for syncing user data with server after login or page refresh
 */
export const fetchCurrentUser = async () => {
  try {
    const response = await axiosClient.get('/auth/me');
    if (response.data && response.data.success && response.data.user) {
      // Update localStorage with latest user data from server
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data.user;
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching current user:', error.message);
    return null;
  }
};

/**
 * Kiểm tra user có phải Admin không
 */
export const isAdmin = () => {
  return getCurrentRole() === ROLES.ADMIN;
};

/**
 * Kiểm tra user có phải Teacher không
 */
export const isTeacher = () => {
  return getCurrentRole() === ROLES.TEACHER;
};

/**
 * Kiểm tra quyền truy cập dựa trên role
 * @param {string} requiredRole - Role yêu cầu (ADMIN hoặc TEACHER)
 * @returns {boolean}
 */
export const hasRole = (requiredRole) => {
  const currentRole = getCurrentRole();
  
  if (requiredRole === ROLES.ADMIN) {
    return currentRole === ROLES.ADMIN;
  }
  
  if (requiredRole === ROLES.TEACHER) {
    return currentRole === ROLES.TEACHER || currentRole === ROLES.ADMIN; // Admin cũng là teacher
  }
  
  return false;
};

/**
 * Kiểm tra user có quyền truy cập resource dành riêng cho Admin
 */
export const canAccessAdminOnly = () => {
  return isAdmin();
};

/**
 * Danh sách routes chỉ dành cho Admin
 */
export const ADMIN_ONLY_ROUTES = [
  '/semesters',
  '/ai',
  '/departments',
  '/classes',
  '/lecturers',
  '/users',
];

/**
 * Danh sách routes dành cho Teachers (có thể truy cập)
 */
export const TEACHER_ACCESSIBLE_ROUTES = [
  '/',
  '/students',
  '/students/:id',
];

/**
 * Kiểm tra xem route có phải admin-only không
 */
export const isAdminOnlyRoute = (pathname) => {
  return ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route));
};

/**
 * Kiểm tra xem route có được teacher truy cập không
 */
export const isTeacherAccessibleRoute = (pathname) => {
  return TEACHER_ACCESSIBLE_ROUTES.some(route => {
    if (route.includes(':')) {
      // Handle dynamic routes
      const baseRoute = route.replace(':id', '');
      return pathname.startsWith(baseRoute);
    }
    return pathname.startsWith(route);
  });
};

export default {
  ROLES,
  getCurrentRole,
  getCurrentUser,
  fetchCurrentUser,
  isAdmin,
  isTeacher,
  hasRole,
  canAccessAdminOnly,
  ADMIN_ONLY_ROUTES,
  TEACHER_ACCESSIBLE_ROUTES,
  isAdminOnlyRoute,
  isTeacherAccessibleRoute,
};
