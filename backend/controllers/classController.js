const db = require('../config/db');

// Không giới hạn số lớp chủ nhiệm - 1 giảng viên có thể phụ trách nhiều lớp

async function validateHomeroomTeacherAssignment(homeroomTeacherId, excludeClassId = null) {
    if (!homeroomTeacherId) {
        return { ok: true };
    }

    const [teacherRows] = await db.query(
        `SELECT id, full_name, role, is_active
         FROM users
         WHERE id = ?`,
        [homeroomTeacherId]
    );

    if (teacherRows.length === 0) {
        return { ok: false, status: 400, message: 'Không tìm thấy giảng viên chủ nhiệm' };
    }

    const teacher = teacherRows[0];

    if (teacher.role !== 'teacher') {
        return { ok: false, status: 400, message: 'Người được chọn không phải tài khoản giảng viên' };
    }

    if (!teacher.is_active) {
        return { ok: false, status: 400, message: 'Giảng viên đã bị vô hiệu hóa tài khoản' };
    }

    // Không giới hạn số lớp - 1 giảng viên có thể phụ trách nhiều lớp

    return { ok: true };
}

// 1. Lấy danh sách Lớp (Kèm theo Tên Khoa nhờ lệnh JOIN)
const getAllClasses = async (req, res) => {
    try {
        const sql = `
            SELECT
                c.id,
                c.class_code,
                c.class_name,
                c.department_id,
                d.department_name,
                c.homeroom_teacher_id,
                u.full_name AS homeroom_teacher_name,
                c.school_year,
                c.created_at
            FROM classes c
            LEFT JOIN departments d ON c.department_id = d.id
            LEFT JOIN users u ON c.homeroom_teacher_id = u.id
            ORDER BY c.id DESC
        `;
        const [rows] = await db.query(sql);
        res.status(200).json(rows);
    } catch (error) {
        console.error('getAllClasses error:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách Lớp' });
    }
};

// 2. Thêm Lớp mới
const createClass = async (req, res) => {
    try {
        const { class_code, class_name, department_id, homeroom_teacher_id, school_year } = req.body;
        if (!class_code || !class_name || !department_id || !school_year) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập mã lớp, tên lớp, khoa và năm học' });
        }

        const teacherValidation = await validateHomeroomTeacherAssignment(homeroom_teacher_id || null);
        if (!teacherValidation.ok) {
            return res.status(teacherValidation.status).json({ success: false, message: teacherValidation.message });
        }

        const [result] = await db.query(
            `INSERT INTO classes (class_code, class_name, department_id, homeroom_teacher_id, school_year)
             VALUES (?, ?, ?, ?, ?)`,
            [
                class_code,
                class_name,
                department_id,
                homeroom_teacher_id || null,
                school_year,
            ]
        );
        res.status(201).json({ success: true, message: 'Thêm Lớp thành công!', id: result.insertId });
    } catch (error) {
        console.error('createClass error:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi thêm Lớp' });
    }
};

// 3. Cập nhật Lớp
const updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { class_name, department_id, homeroom_teacher_id, school_year } = req.body;

        if (!class_name || !department_id || !school_year) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập tên lớp, khoa và năm học' });
        }

        const teacherValidation = await validateHomeroomTeacherAssignment(homeroom_teacher_id || null, id);
        if (!teacherValidation.ok) {
            return res.status(teacherValidation.status).json({ success: false, message: teacherValidation.message });
        }

        await db.query(
            `UPDATE classes
             SET class_name = ?,
                 department_id = ?,
                 homeroom_teacher_id = ?,
                 school_year = ?
             WHERE id = ?`,
            [
                class_name,
                department_id,
                homeroom_teacher_id || null,
                school_year,
                id,
            ]
        );
        res.status(200).json({ success: true, message: 'Cập nhật Lớp thành công!' });
    } catch (error) {
        console.error('updateClass error:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật Lớp' });
    }
};

// 4. Xóa Lớp
const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM classes WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: 'Xóa Lớp thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi xóa Lớp' });
    }
};

const XLSX = require('xlsx');

// Utilities
const normalizeHeader = (value) => String(value || '').trim();

const parseExcelBuffer = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('Không tìm thấy sheet trong file Excel');
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
};

const buildHeaderIndex = (headers) => {
  const map = new Map();
  headers.forEach((header, idx) => {
    const key = normalizeHeader(header);
    if (key) map.set(key, idx);
  });
  return map;
};

const previewImportClasses = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn file Excel' });
    const rows = parseExcelBuffer(req.file.buffer);
    if (!rows.length) return res.status(400).json({ message: 'File Excel rỗng' });

    const headers = rows[0].map(normalizeHeader);
    const dataPreview = rows.slice(1, 6);
    res.json({ headers, dataPreview, totalRows: Math.max(0, rows.length - 1) });
  } catch (error) {
    console.error('previewImportClasses error:', error);
    res.status(500).json({ message: 'Lỗi server khi xem trước import Excel' });
  }
};

const importClasses = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn file Excel' });
    const mapping = req.body.mapping ? JSON.parse(req.body.mapping) : {};
    
    if (!mapping.class_code || !mapping.class_name || !mapping.department_code) {
      return res.status(400).json({ message: 'Thiếu mapping cho class_code, class_name và department_code' });
    }

    const rows = parseExcelBuffer(req.file.buffer);
    if (rows.length < 2) return res.status(400).json({ message: 'File Excel rỗng' });

    const headers = rows[0];
    const headerIndex = buildHeaderIndex(headers);
    const getValueByHeader = (row, header) => {
      if (!header) return '';
      const idx = headerIndex.get(header);
      return idx === undefined ? '' : row[idx];
    };

    let createdCount = 0;
    let updatedCount = 0;
    const errors = [];

    const [deptRows] = await db.query(`SELECT id, department_code FROM departments`);
    const deptMap = new Map();
    deptRows.forEach(d => deptMap.set(d.department_code, d.id));

    const [gvRows] = await db.query(`SELECT id, lecturer_code, full_name FROM users WHERE role='teacher'`);
    const gvMap = new Map();
    gvRows.forEach(g => {
      if (g.lecturer_code) gvMap.set(g.lecturer_code.toLowerCase(), g.id);
      if (g.full_name) gvMap.set(g.full_name.toLowerCase(), g.id);
    });

    const [existingRows] = await db.query(`SELECT id, class_code FROM classes`);
    const existingMap = new Map();
    existingRows.forEach(c => existingMap.set(c.class_code, c.id));

    for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const code = String(getValueByHeader(row, mapping.class_code)).trim();
      const name = String(getValueByHeader(row, mapping.class_name)).trim();
      const deptCode = String(getValueByHeader(row, mapping.department_code)).trim();
      const lecturerCode = mapping.lecturer_code ? String(getValueByHeader(row, mapping.lecturer_code)).trim() : null;
      const schoolYear = mapping.school_year ? String(getValueByHeader(row, mapping.school_year)).trim() : '2023-2027';

      if (!code && !name) continue;
      if (!code || !name || !deptCode) {
        errors.push({ row: rowIndex + 1, message: 'Thiếu mã lớp, tên lớp hoặc mã khoa' });
        continue;
      }

      const deptId = deptMap.get(deptCode);
      if (!deptId) {
        errors.push({ row: rowIndex + 1, message: `Không tìm thấy Khoa có mã: ${deptCode}` });
        continue;
      }

      let homeroomId = null;
      if (lecturerCode) {
        const searchKey = lecturerCode.toLowerCase();
        homeroomId = gvMap.get(searchKey);
        if (!homeroomId) {
          errors.push({ row: rowIndex + 1, message: `Không tìm thấy Giảng viên: ${lecturerCode}` });
          continue;
        }
      }

      if (existingMap.has(code)) {
        await db.query(`UPDATE classes SET class_name = ?, department_id = ?, homeroom_teacher_id = ?, school_year = ? WHERE class_code = ?`, 
          [name, deptId, homeroomId, schoolYear, code]);
        updatedCount++;
      } else {
        const [result] = await db.query(`INSERT INTO classes (class_code, class_name, department_id, homeroom_teacher_id, school_year) VALUES (?, ?, ?, ?, ?)`, 
          [code, name, deptId, homeroomId, schoolYear]);
        existingMap.set(code, result.insertId);
        createdCount++;
      }
    }

    res.json({ message: 'Import Lớp học hoàn tất', createdCount, updatedCount, failedCount: errors.length, errors });
  } catch (error) {
    console.error('importClasses error:', error);
    res.status(500).json({ message: 'Lỗi server khi import Lớp học' });
  }
};

module.exports = { getAllClasses, createClass, updateClass, deleteClass, previewImportClasses, importClasses };