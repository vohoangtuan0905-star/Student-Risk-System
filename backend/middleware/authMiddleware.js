const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    // Lấy token từ header của người gửi
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Tách chữ "Bearer " ra khỏi token

    if (!token) {
        return res.status(401).json({ success: false, message: 'Truy cập bị từ chối! Không tìm thấy Token.' });
    }

    try {
        // Giải mã token bằng Chìa khóa bí mật trong file .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Lưu thông tin user vào req để dùng cho các hàm sau
        next(); // Token hợp lệ, cho phép đi tiếp!
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
};

module.exports = { verifyToken };