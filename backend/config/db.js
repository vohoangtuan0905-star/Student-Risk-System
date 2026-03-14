const mysql = require('mysql2/promise');
require('dotenv').config(); // Load biến môi trường từ file .env

// Tạo một Pool kết nối (Giúp hệ thống chạy nhanh hơn khi có nhiều người truy cập)
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Chạy thử 1 câu lệnh để kiểm tra kết nối khi khởi động
db.getConnection()
    .then(() => console.log(' Đã kết nối thành công với MySQL Database!'))
    .catch((err) => console.error(' Lỗi kết nối Database:', err));

module.exports = db;