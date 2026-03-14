const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db'); // Nhập file kết nối Database

const app = express();

// Middleware
app.use(cors()); // Cho phép Frontend (React) gọi API không bị chặn
app.use(express.json()); // Giúp NodeJS đọc được dữ liệu dạng JSON

// --- API ĐẦU TIÊN: Lấy danh sách các Khoa ---
app.get('/api/departments', async (req, res) => {
    try {
        // Gõ lệnh SQL lấy toàn bộ dữ liệu từ bảng departments
        const [rows] = await db.query('SELECT * FROM departments');
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách Khoa thành công',
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi Server!' });
    }
});

// Lấy Port từ file .env, nếu không có thì chạy Port 5000
const PORT = process.env.PORT || 5000;

// Khởi động Server
app.listen(PORT, () => {
    console.log(` Server NodeJS đang chạy tại cổng: http://localhost:${PORT}`);
});