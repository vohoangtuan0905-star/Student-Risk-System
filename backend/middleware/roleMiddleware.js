/**
 * Role Middleware - Checks user authorization based on role
 * Used to protect admin-only routes and enforce access control
 */

/**
 * Create role middleware factory function
 * @param {string[]} allowedRoles - Array of roles that are allowed to access the route (e.g., ['admin', 'teacher'])
 * @returns {Function} Express middleware function
 */
const requireRole = (allowedRoles = ['admin']) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated (from authMiddleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Không được xác thực. Vui lòng đăng nhập.',
          code: 'UNAUTHENTICATED'
        });
      }

      // Get user role from JWT payload
      const userRole = req.user.role;

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Không có quyền truy cập. Yêu cầu quyền: ${allowedRoles.join(', ')}`,
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredRoles: allowedRoles,
          userRole: userRole
        });
      }

      // User has permission, proceed to next handler
      next();
    } catch (error) {
      console.error('❌ Role middleware error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi xác thực quyền',
        error: error.message
      });
    }
  };
};

/**
 * Admin-only middleware - Shorthand for requireRole(['admin'])
 */
const requireAdmin = requireRole(['admin']);

/**
 * Teacher-accessible middleware - Allows both admin and teacher
 */
const requireTeacherOrAdmin = requireRole(['admin', 'teacher']);

module.exports = {
  requireRole,
  requireAdmin,
  requireTeacherOrAdmin
};
