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
const aiRoutes = require('./routes/aiRoutes');
const usersRoutes = require('./routes/usersRoutes');
const lecturerRoutes = require('./routes/lecturerRoutes');
const lecturerController = require('./controllers/lecturerController');
const verifyToken = require('./middleware/authMiddleware');
const { requireAdmin } = require('./middleware/roleMiddleware');

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
app.use('/api/ai', aiRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/lecturers', lecturerRoutes);

// Explicit lecturers routes to avoid runtime route mount mismatch
app.get('/api/lecturers', verifyToken, requireAdmin, lecturerController.getAllLecturers);
app.post('/api/lecturers', verifyToken, requireAdmin, lecturerController.createLecturer);
app.put('/api/lecturers/:id', verifyToken, requireAdmin, lecturerController.updateLecturer);
app.delete('/api/lecturers/:id', verifyToken, requireAdmin, lecturerController.deleteLecturer);
app.put('/api/lecturers/:id/homeroom-classes', verifyToken, requireAdmin, lecturerController.assignHomeroomClasses);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(` Server NodeJS đang chạy tại cổng: http://localhost:${PORT}`);
});