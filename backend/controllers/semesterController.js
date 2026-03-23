const db = require('../config/db');

const getAllSemesters = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, academic_year, semester_no, semester_name, start_date, end_date, is_closed, created_at, updated_at
      FROM semesters
      ORDER BY academic_year DESC, semester_no DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('getAllSemesters error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách học kỳ' });
  }
};

const getSemesterById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT id, academic_year, semester_no, semester_name, start_date, end_date, is_closed, created_at, updated_at
      FROM semesters
      WHERE id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy học kỳ' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('getSemesterById error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiết học kỳ' });
  }
};

const createSemester = async (req, res) => {
  try {
    const { academic_year, semester_no, semester_name, start_date, end_date, is_closed } = req.body;

    if (!academic_year || !semester_no || !semester_name) {
      return res.status(400).json({
        message: 'Vui lòng nhập academic_year, semester_no và semester_name'
      });
    }

    const [exist] = await db.query(`
      SELECT id FROM semesters
      WHERE academic_year = ? AND semester_no = ?
    `, [academic_year, semester_no]);

    if (exist.length > 0) {
      return res.status(409).json({ message: 'Học kỳ này đã tồn tại' });
    }

    const [result] = await db.query(`
      INSERT INTO semesters (
        academic_year, semester_no, semester_name, start_date, end_date, is_closed
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      academic_year,
      semester_no,
      semester_name,
      start_date || null,
      end_date || null,
      is_closed ?? 0
    ]);

    res.status(201).json({
      message: 'Thêm học kỳ thành công',
      semesterId: result.insertId
    });
  } catch (error) {
    console.error('createSemester error:', error);
    res.status(500).json({ message: 'Lỗi server khi thêm học kỳ' });
  }
};

const updateSemester = async (req, res) => {
  try {
    const { id } = req.params;
    const { academic_year, semester_no, semester_name, start_date, end_date, is_closed } = req.body;

    const [exist] = await db.query(`SELECT id FROM semesters WHERE id = ?`, [id]);
    if (exist.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy học kỳ để cập nhật' });
    }

    await db.query(`
      UPDATE semesters
      SET academic_year = ?, semester_no = ?, semester_name = ?, start_date = ?, end_date = ?, is_closed = ?
      WHERE id = ?
    `, [
      academic_year,
      semester_no,
      semester_name,
      start_date || null,
      end_date || null,
      is_closed ?? 0,
      id
    ]);

    res.json({ message: 'Cập nhật học kỳ thành công' });
  } catch (error) {
    console.error('updateSemester error:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật học kỳ' });
  }
};

const deleteSemester = async (req, res) => {
  try {
    const { id } = req.params;

    const [exist] = await db.query(`SELECT id FROM semesters WHERE id = ?`, [id]);
    if (exist.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy học kỳ để xóa' });
    }

    await db.query(`DELETE FROM semesters WHERE id = ?`, [id]);

    res.json({ message: 'Xóa học kỳ thành công' });
  } catch (error) {
    console.error('deleteSemester error:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa học kỳ' });
  }
};

module.exports = {
  getAllSemesters,
  getSemesterById,
  createSemester,
  updateSemester,
  deleteSemester
};