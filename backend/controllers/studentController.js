const db = require('../config/db');

// 1. Lấy danh sách tất cả Sinh viên (Kèm theo Tên Lớp)
const getAllStudents = async (req, res) => {
    try {
        const sql = `
            SELECT students.*, classes.class_name 
            FROM students 
            LEFT JOIN classes ON students.class_id = classes.id
            ORDER BY students.id DESC
        `;
        const [rows] = await db.query(sql);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách Sinh viên' });
    }
};

// 2. Lấy Chi tiết Sinh viên + TOÀN BỘ LỊCH SỬ HỌC TẬP (API Ăn tiền nhất)
const getStudentHistory = async (req, res) => {
    try {
        const { id } = req.params; 

        // Truy vấn 1: Lấy thông tin cơ bản (Tên, Mã SV, Lớp, Trạng thái)
        const [studentInfo] = await db.query(`
            SELECT students.*, classes.class_name 
            FROM students 
            LEFT JOIN classes ON students.class_id = classes.id
            WHERE students.id = ?
        `, [id]);

        if (studentInfo.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy Sinh viên' });
        }

        // Truy vấn 2: Lấy toàn bộ lịch sử học tập qua các Học kỳ
        const [history] = await db.query(`
            SELECT sar.*, s.semester_name 
            FROM student_academic_records sar
            JOIN semesters s ON sar.semester_id = s.id
            WHERE sar.student_id = ?
            ORDER BY s.id ASC
        `, [id]);

        // Trả về kết quả gộp cả 2 cục dữ liệu cho Frontend dễ vẽ biểu đồ
        res.status(200).json({
            success: true,
            data: {
                info: studentInfo[0],
                history: history
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy dữ liệu lịch sử' });
    }
};

module.exports = { getAllStudents, getStudentHistory };