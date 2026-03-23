const db = require('../config/db');

// Lấy danh sách sinh viên
const getAllStudents = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.id,
        s.student_code,
        s.full_name,
        s.date_of_birth,
        s.gender,
        s.email,
        s.phone,
        s.address,
        s.gpa,
        s.absences,
        s.tuition_debt,
        s.scholarship,
        s.risk_percentage,
        s.risk_level,
        s.actual_status,
        s.enrollment_year,
        s.note,
        d.department_name,
        c.class_name,
        s.created_at,
        s.updated_at
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN classes c ON s.class_id = c.id
      ORDER BY s.id ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error('getAllStudents error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách sinh viên' });
  }
};

// Lấy chi tiết 1 sinh viên
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT 
        s.id,
        s.student_code,
        s.full_name,
        s.date_of_birth,
        s.gender,
        s.email,
        s.phone,
        s.address,
        s.department_id,
        s.class_id,
        s.gpa,
        s.absences,
        s.tuition_debt,
        s.scholarship,
        s.risk_percentage,
        s.risk_level,
        s.actual_status,
        s.enrollment_year,
        s.note,
        d.department_name,
        c.class_name,
        s.created_at,
        s.updated_at
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('getStudentById error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiết sinh viên' });
  }
};

// Lấy lịch sử học tập của sinh viên
const getStudentHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const [studentRows] = await db.query(`
      SELECT 
        s.id,
        s.student_code,
        s.full_name,
        s.gender,
        s.email,
        s.phone,
        s.gpa,
        s.absences,
        s.risk_percentage,
        s.risk_level,
        s.actual_status,
        d.department_name,
        c.class_name
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
    `, [id]);

    if (studentRows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }

    const [historyRows] = await db.query(`
      SELECT
        sar.id,
        sar.student_id,
        sar.semester_id,
        sem.academic_year,
        sem.semester_no,
        sem.semester_name,
        sar.gpa,
        sar.absences,
        sar.tuition_debt,
        sar.scholarship,
        sar.failed_subjects,
        sar.credits_enrolled,
        sar.credits_passed,
        sar.warning_level,
        sar.risk_percentage,
        sar.risk_level,
        sar.actual_dropout_status,
        sar.notes,
        sar.created_at,
        sar.updated_at
      FROM student_academic_records sar
      JOIN semesters sem ON sar.semester_id = sem.id
      WHERE sar.student_id = ?
      ORDER BY sem.academic_year ASC, sem.semester_no ASC
    `, [id]);

    res.json({
      student: studentRows[0],
      history: historyRows
    });
  } catch (error) {
    console.error('getStudentHistory error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy lịch sử sinh viên' });
  }
};

// Thêm sinh viên
const createStudent = async (req, res) => {
  try {
    const {
      student_code,
      full_name,
      date_of_birth,
      gender,
      email,
      phone,
      address,
      department_id,
      class_id,
      gpa,
      absences,
      tuition_debt,
      scholarship,
      risk_percentage,
      risk_level,
      actual_status,
      enrollment_year,
      note
    } = req.body;

    if (!student_code || !full_name || !department_id || !class_id) {
      return res.status(400).json({
        message: 'Thiếu student_code, full_name, department_id hoặc class_id'
      });
    }

    const [exist] = await db.query(`
      SELECT id FROM students WHERE student_code = ?
    `, [student_code]);

    if (exist.length > 0) {
      return res.status(409).json({ message: 'Mã sinh viên đã tồn tại' });
    }

    const [result] = await db.query(`
      INSERT INTO students (
        student_code, full_name, date_of_birth, gender, email, phone, address,
        department_id, class_id, gpa, absences, tuition_debt, scholarship,
        risk_percentage, risk_level, actual_status, enrollment_year, note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      student_code,
      full_name,
      date_of_birth || null,
      gender || 'Other',
      email || null,
      phone || null,
      address || null,
      department_id,
      class_id,
      gpa ?? 0,
      absences ?? 0,
      tuition_debt ?? 0,
      scholarship ?? 0,
      risk_percentage ?? 0,
      risk_level || 'Safe',
      actual_status || 'Enrolled',
      enrollment_year || null,
      note || null
    ]);

    res.status(201).json({
      message: 'Thêm sinh viên thành công',
      studentId: result.insertId
    });
  } catch (error) {
    console.error('createStudent error:', error);
    res.status(500).json({ message: 'Lỗi server khi thêm sinh viên' });
  }
};

// Cập nhật sinh viên
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      student_code,
      full_name,
      date_of_birth,
      gender,
      email,
      phone,
      address,
      department_id,
      class_id,
      gpa,
      absences,
      tuition_debt,
      scholarship,
      risk_percentage,
      risk_level,
      actual_status,
      enrollment_year,
      note
    } = req.body;

    const [exist] = await db.query(`SELECT id FROM students WHERE id = ?`, [id]);
    if (exist.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên để cập nhật' });
    }

    await db.query(`
      UPDATE students
      SET
        student_code = ?,
        full_name = ?,
        date_of_birth = ?,
        gender = ?,
        email = ?,
        phone = ?,
        address = ?,
        department_id = ?,
        class_id = ?,
        gpa = ?,
        absences = ?,
        tuition_debt = ?,
        scholarship = ?,
        risk_percentage = ?,
        risk_level = ?,
        actual_status = ?,
        enrollment_year = ?,
        note = ?
      WHERE id = ?
    `, [
      student_code,
      full_name,
      date_of_birth || null,
      gender || 'Other',
      email || null,
      phone || null,
      address || null,
      department_id,
      class_id,
      gpa ?? 0,
      absences ?? 0,
      tuition_debt ?? 0,
      scholarship ?? 0,
      risk_percentage ?? 0,
      risk_level || 'Safe',
      actual_status || 'Enrolled',
      enrollment_year || null,
      note || null,
      id
    ]);

    res.json({ message: 'Cập nhật sinh viên thành công' });
  } catch (error) {
    console.error('updateStudent error:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật sinh viên' });
  }
};

// Xóa sinh viên
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const [exist] = await db.query(`SELECT id FROM students WHERE id = ?`, [id]);
    if (exist.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên để xóa' });
    }

    await db.query(`DELETE FROM students WHERE id = ?`, [id]);

    res.json({ message: 'Xóa sinh viên thành công' });
  } catch (error) {
    console.error('deleteStudent error:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa sinh viên' });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  getStudentHistory,
  createStudent,
  updateStudent,
  deleteStudent
};