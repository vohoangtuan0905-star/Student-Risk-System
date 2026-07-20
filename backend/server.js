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
const emailRoutes = require('./routes/emailRoutes');
const lecturerController = require('./controllers/lecturerController');
const verifyToken = require('./middleware/authMiddleware');
const { requireAdmin } = require('./middleware/roleMiddleware');

const app = express();
const net = require('net');

app.get('/debug-db', (req, res) => {
  const socket = new net.Socket();
  const start = Date.now();

  socket.setTimeout(8000);

  socket.on('connect', () => {
    res.json({ status: 'OK', message: 'Kết nối TCP tới DB thành công', ms: Date.now() - start });
    socket.destroy();
  });

  socket.on('timeout', () => {
    res.json({ status: 'TIMEOUT', message: 'Không kết nối được trong 8s (bị chặn mạng)', ms: Date.now() - start });
    socket.destroy();
  });

  socket.on('error', (err) => {
    res.json({ status: 'ERROR', code: err.code, message: err.message, ms: Date.now() - start });
  });

  socket.connect(Number(process.env.DB_PORT), process.env.DB_HOST);
});
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL, // URL Vercel của bạn sau khi deploy
];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
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
app.use('/api/email', emailRoutes);

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