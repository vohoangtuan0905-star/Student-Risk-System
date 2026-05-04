const db = require('../config/db');
const bcryptjs = require('bcryptjs');

/**
 * GET /users - Get all users (admin only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.role,
        u.department_id,
        d.department_name,
        u.is_active,
        u.created_at,
        u.updated_at,
        COUNT(c.id) AS homeroom_class_count,
        COALESCE(GROUP_CONCAT(c.class_code ORDER BY c.class_code SEPARATOR ', '), '') AS homeroom_class_codes
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN classes c ON c.homeroom_teacher_id = u.id
      GROUP BY
        u.id,
        u.full_name,
        u.email,
        u.role,
        u.department_id,
        d.department_name,
        u.is_active,
        u.created_at,
        u.updated_at
      ORDER BY u.created_at DESC
    `);

    return res.json({
      success: true,
      message: 'Lấy danh sách người dùng thành công',
      data: users || []
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách người dùng',
      error: error.message
    });
  }
};

/**
 * GET /users/:id - Get user by ID
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.query(`
      SELECT
        id,
        full_name,
        email,
        role,
        department_id,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    return res.json({
      success: true,
      message: 'Lấy thông tin người dùng thành công',
      data: users[0]
    });
  } catch (error) {
    console.error('getUserById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin người dùng',
      error: error.message
    });
  }
};

/**
 * POST /users - Create new user (admin only)
 */
exports.createUser = async (req, res) => {
  try {
    const { full_name, email, password, role, department_id, is_active } = req.body;

    // Validation
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: full_name, email, password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải ít nhất 6 ký tự'
      });
    }

    // Check email exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const [result] = await db.query(`
      INSERT INTO users (full_name, email, password_hash, role, department_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      full_name,
      email,
      hashedPassword,
      role || 'teacher',
      department_id || null,
      is_active !== undefined ? is_active : 1
    ]);

    const userId = result.insertId;

    return res.status(201).json({
      success: true,
      message: 'Tạo người dùng thành công',
      data: {
        id: userId,
        full_name,
        email,
        role: role || 'teacher',
        department_id: department_id || null,
        is_active: is_active !== undefined ? is_active : 1
      }
    });
  } catch (error) {
    console.error('createUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo người dùng',
      error: error.message
    });
  }
};

/**
 * PUT /users/:id - Update user (admin only)
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, password, role, department_id, is_active } = req.body;

    // Check user exists
    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Check email uniqueness if changed
    if (email) {
      const [emailCheck] = await db.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );
      if (emailCheck.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email đã được sử dụng'
        });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (full_name !== undefined) {
      updateFields.push('full_name = ?');
      updateValues.push(full_name);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu phải ít nhất 6 ký tự'
        });
      }
      const hashedPassword = await bcryptjs.hash(password, 10);
      updateFields.push('password_hash = ?');
      updateValues.push(hashedPassword);
    }
    if (role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    if (department_id !== undefined) {
      updateFields.push('department_id = ?');
      updateValues.push(department_id || null);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    if (updateFields.length === 1) { // Only updated_at
      return res.json({
        success: true,
        message: 'Không có dữ liệu để cập nhật'
      });
    }

    updateValues.push(id);

    await db.query(`
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

    return res.json({
      success: true,
      message: 'Cập nhật người dùng thành công'
    });
  } catch (error) {
    console.error('updateUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật người dùng',
      error: error.message
    });
  }
};

/**
 * DELETE /users/:id - Delete user (admin only)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check user exists
    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Delete user
    await db.query('DELETE FROM users WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    console.error('deleteUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa người dùng',
      error: error.message
    });
  }
};
