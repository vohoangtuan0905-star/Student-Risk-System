const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Thêm SSL cho Aiven
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : undefined
});

db.getConnection()
    .then(() => console.log('✅ Đã kết nối thành công với MySQL Database!'))
    .catch((err) => console.error('❌ Lỗi kết nối Database:', err.message));

module.exports = db;
