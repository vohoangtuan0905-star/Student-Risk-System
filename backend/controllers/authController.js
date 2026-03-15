const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Hàm Đăng ký (Dùng để tạo tài khoản Admin ban đầu)
const register = async (req, res) => {
    try {
        const { username, password, role, department_id } = req.body;

        // Kiểm tra xem đã nhập đủ thông tin chưa
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập tài khoản và mật khẩu' });
        }

        // Mã hóa mật khẩu (Băm 10 vòng)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Lưu vào Database (nhớ cột trong DB tên là password_hash)
        const [result] = await db.query(
            'INSERT INTO users (username, password_hash, role, department_id) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, role || 'teacher', department_id || null]
        );

        res.status(201).json({ success: true, message: 'Tạo tài khoản thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi tạo tài khoản. Có thể Username đã tồn tại.' });
    }
};

// 2. Hàm Đăng nhập
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Tìm User trong Database
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        
        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'Tài khoản không tồn tại!' });
        }

        const user = users[0];

        // So sánh mật khẩu người dùng nhập với mật khẩu đã băm trong Database
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Mật khẩu không chính xác!' });
        }

        // Nếu đúng, tạo JWT Token
        const token = jwt.sign(
            { id: user.id, role: user.role, department_id: user.department_id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token có hạn trong 1 ngày
        );

        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công!',
            token: token,
            user: {
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi Server khi đăng nhập' });
    }
};

module.exports = { register, login };