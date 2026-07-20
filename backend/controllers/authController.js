const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Đăng ký tài khoản
const register = async (req, res) => {
  try {
    const { full_name, email, password, role, department_id } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ full_name, email và password'
      });
    }

    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email đã tồn tại'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role, department_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        full_name,
        email,
        hashedPassword,
        role || 'teacher',
        department_id || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      userId: result.insertId
    });
  } catch (error) {
    console.error('register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký'
    });
  }
};

// Đăng nhập
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và password'
      });
    }

    const [users] = await db.query(
      `SELECT id, full_name, email, password_hash, role, department_id, is_active
       FROM users
       WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa'
      });
    }

    console.log('🔍 DEBUG LOGIN:');
    console.log('   Email:', email);
    console.log('   Password nhập:', password);
    console.log('   User ID:', user.id);
    console.log('   Hash trong DB:', user.password_hash);

    const isMatch = await bcrypt.compare(password, user.password_hash);

    console.log('   Kết quả so sánh password:', isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        department_id: user.department_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        department_id: user.department_id
      }
    });
  } catch (error) {
    console.error('login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi Server khi đăng nhập'
    });
  }
};

// Get current authenticated user info
const getCurrentUser = async (req, res) => {
  try {
    // User info is already in req.user from authMiddleware (JWT decoded)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Không được xác thực'
      });
    }

    // Fetch full user details from database
    const [users] = await db.query(
      `SELECT id, full_name, email, role, department_id, is_active, created_at
       FROM users
       WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    const user = users[0];

    return res.json({
      success: true,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        department_id: user.department_id,
        is_active: user.is_active,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi Server khi lấy thông tin người dùng'
    });
  }
};

// Đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
    }

    const [users] = await db.query(
      'SELECT id, password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const isMatch = await bcrypt.compare(current_password, users[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);

    return res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('changePassword error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi đổi mật khẩu' });
  }
};

// Quên mật khẩu — tạo mật khẩu tạm và gửi qua email
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email' });
    }

    // Kiểm tra SMTP đã cấu hình chưa
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS
      || process.env.SMTP_USER === 'your_email@gmail.com') {
      return res.status(500).json({
        success: false,
        message: 'Chức năng gửi email chưa được cấu hình. Vui lòng liên hệ quản trị viên để đặt lại mật khẩu.'
      });
    }

    // Tìm user theo email
    const [users] = await db.query('SELECT id, full_name, email FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản với email này' });
    }

    const user = users[0];

    // Tạo mật khẩu tạm ngẫu nhiên 8 ký tự
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let tempPassword = '';
    for (let i = 0; i < 8; i++) {
      tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Hash và lưu mật khẩu tạm
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, user.id]);

    // Gửi email
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

    await transporter.sendMail({
      from: `"Hệ thống Quản lý Rủi ro SV" <${fromAddress}>`,
      to: user.email,
      subject: '[Student Risk System] Đặt lại mật khẩu',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1e293b, #334155); padding: 24px; text-align: center;">
            <h2 style="color: #fff; margin: 0; font-size: 16px;">🔐 Đặt Lại Mật Khẩu</h2>
            <p style="color: #94a3b8; margin: 6px 0 0; font-size: 12px;">Hệ thống Quản lý Rủi ro Sinh viên</p>
          </div>
          <div style="padding: 24px;">
            <p style="color: #334155; font-size: 14px;">Xin chào <strong>${user.full_name}</strong>,</p>
            <p style="color: #475569; font-size: 14px;">Bạn đã yêu cầu đặt lại mật khẩu. Mật khẩu tạm thời của bạn là:</p>
            <div style="background: #f1f5f9; border: 2px dashed #3b82f6; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0;">
              <span style="font-size: 24px; font-weight: 700; color: #1e40af; letter-spacing: 2px;">${tempPassword}</span>
            </div>
            <p style="color: #475569; font-size: 13px; line-height: 1.6;">
              ⚠️ Vui lòng đăng nhập với mật khẩu tạm ở trên và <strong>đổi mật khẩu mới</strong> ngay trong phần "Xem hồ sơ" để đảm bảo an toàn tài khoản.
            </p>
          </div>
          <div style="background: #f1f5f9; padding: 12px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">Email này được gửi tự động. Vui lòng không trả lời.</p>
            <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0;">© ${new Date().getFullYear()} Student Risk System</p>
          </div>
        </div>
      `
    });

    console.log(`✅ Đã gửi email đặt lại mật khẩu cho ${user.email}`);

    return res.json({
      success: true,
      message: `Mật khẩu tạm đã được gửi đến ${user.email}. Vui lòng kiểm tra hộp thư (và thư mục Spam).`
    });
  } catch (error) {
    console.error('forgotPassword error:', error);

    // Phân biệt lỗi SMTP vs lỗi khác
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi xác thực SMTP. Vui lòng kiểm tra lại cấu hình email trong file .env'
      });
    }
    if (error.code === 'ESOCKET' || error.code === 'ECONNREFUSED') {
      return res.status(500).json({
        success: false,
        message: 'Không kết nối được tới máy chủ email. Vui lòng kiểm tra SMTP_HOST và SMTP_PORT.'
      });
    }

    return res.status(500).json({ success: false, message: 'Lỗi server khi đặt lại mật khẩu: ' + error.message });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  changePassword,
  forgotPassword
};