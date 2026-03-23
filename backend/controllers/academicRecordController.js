const db = require('../config/db');

// Lấy tất cả record học tập theo student
exports.getAcademicRecordsByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    const [rows] = await db.query(`
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
    `, [studentId]);

    res.json(rows);
  } catch (error) {
    console.error('getAcademicRecordsByStudentId error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy academic records' });
  }
};

// Thêm record học tập theo học kỳ
exports.createAcademicRecord = async (req, res) => {
  try {
    const {
      student_id,
      semester_id,
      gpa,
      absences,
      tuition_debt,
      scholarship,
      failed_subjects,
      credits_enrolled,
      credits_passed,
      warning_level,
      risk_percentage,
      risk_level,
      actual_dropout_status,
      notes
    } = req.body;

    if (!student_id || !semester_id) {
      return res.status(400).json({
        message: 'Thiếu student_id hoặc semester_id'
      });
    }

    const [studentExist] = await db.query(`SELECT id FROM students WHERE id = ?`, [student_id]);
    if (studentExist.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }

    const [semesterExist] = await db.query(`SELECT id FROM semesters WHERE id = ?`, [semester_id]);
    if (semesterExist.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy học kỳ' });
    }

    const [dup] = await db.query(`
      SELECT id FROM student_academic_records
      WHERE student_id = ? AND semester_id = ?
    `, [student_id, semester_id]);

    if (dup.length > 0) {
      return res.status(409).json({
        message: 'Sinh viên đã có record ở học kỳ này'
      });
    }

    const [result] = await db.query(`
      INSERT INTO student_academic_records (
        student_id, semester_id, gpa, absences, tuition_debt, scholarship,
        failed_subjects, credits_enrolled, credits_passed, warning_level,
        risk_percentage, risk_level, actual_dropout_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      student_id,
      semester_id,
      gpa ?? 0,
      absences ?? 0,
      tuition_debt ?? 0,
      scholarship ?? 0,
      failed_subjects ?? 0,
      credits_enrolled ?? 0,
      credits_passed ?? 0,
      warning_level ?? 0,
      risk_percentage ?? 0,
      risk_level ?? 'Safe',
      actual_dropout_status ?? 'Enrolled',
      notes ?? null
    ]);

    res.status(201).json({
      message: 'Thêm academic record thành công',
      academicRecordId: result.insertId
    });
  } catch (error) {
    console.error('createAcademicRecord error:', error);
    res.status(500).json({ message: 'Lỗi server khi thêm academic record' });
  }
};

// Cập nhật record học tập
exports.updateAcademicRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      gpa,
      absences,
      tuition_debt,
      scholarship,
      failed_subjects,
      credits_enrolled,
      credits_passed,
      warning_level,
      risk_percentage,
      risk_level,
      actual_dropout_status,
      notes
    } = req.body;

    const [exist] = await db.query(`
      SELECT id FROM student_academic_records WHERE id = ?
    `, [id]);

    if (exist.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy academic record' });
    }

    await db.query(`
      UPDATE student_academic_records
      SET
        gpa = ?,
        absences = ?,
        tuition_debt = ?,
        scholarship = ?,
        failed_subjects = ?,
        credits_enrolled = ?,
        credits_passed = ?,
        warning_level = ?,
        risk_percentage = ?,
        risk_level = ?,
        actual_dropout_status = ?,
        notes = ?
      WHERE id = ?
    `, [
      gpa ?? 0,
      absences ?? 0,
      tuition_debt ?? 0,
      scholarship ?? 0,
      failed_subjects ?? 0,
      credits_enrolled ?? 0,
      credits_passed ?? 0,
      warning_level ?? 0,
      risk_percentage ?? 0,
      risk_level ?? 'Safe',
      actual_dropout_status ?? 'Enrolled',
      notes ?? null,
      id
    ]);

    res.json({ message: 'Cập nhật academic record thành công' });
  } catch (error) {
    console.error('updateAcademicRecord error:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật academic record' });
  }
};

// Xóa record học tập
exports.deleteAcademicRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const [exist] = await db.query(`
      SELECT id FROM student_academic_records WHERE id = ?
    `, [id]);

    if (exist.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy academic record để xóa' });
    }

    await db.query(`DELETE FROM student_academic_records WHERE id = ?`, [id]);

    res.json({ message: 'Xóa academic record thành công' });
  } catch (error) {
    console.error('deleteAcademicRecord error:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa academic record' });
  }
};