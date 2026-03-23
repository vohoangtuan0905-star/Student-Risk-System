const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Nhập các Routes vừa tạo
const departmentRoutes = require('./routes/departmentRoutes');
const classRoutes = require('./routes/classRoutes'); 
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const semesterRoutes = require('./routes/semesterRoutes');
const academicRecordRoutes = require('./routes/academicRecordRoutes');

const app = express();
app.use(cors());
app.use(express.json()); 

app.get('/', (req, res) => {
    res.send('Chào mừng đến với Server Hệ thống Dự báo rủi ro sinh viên!');
});

// Gắn các đường dẫn API vào hệ thống
app.use('/api/departments', departmentRoutes);
app.use('/api/classes', classRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/academic-records', academicRecordRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(` Server NodeJS đang chạy tại cổng: http://localhost:${PORT}`);
});