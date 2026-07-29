const db = require('../config/db');
const bcryptjs = require('bcryptjs');

// Không giới hạn số lớp chủ nhiệm - 1 giảng viên có thể phụ trách nhiều lớp
const LECTURER_CODE_PREFIX = 'GV';
const LECTURER_CODE_PAD = 4;

function parseHomeroomClasses(rawValue) {
  if (!rawValue) return [];

  return String(rawValue)
    .split('||')
    .map((item) => {
      const [id, class_code, class_name] = item.split('::');
      return {
        id: Number(id),
        class_code,
        class_name,
      };
    })
    .filter((item) => Number.isFinite(item.id));
}

function normalizeClassIds(classIds = []) {
  const normalized = [...new Set(
    classIds
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0)
  )];

  return normalized;
}

function buildLecturerCode(nextNumber) {
  return `${LECTURER_CODE_PREFIX}${String(nextNumber).padStart(LECTURER_CODE_PAD, '0')}`;
}

async function generateLecturerCode() {
  const [rows] = await db.query(
    `SELECT lecturer_code
     FROM users
     WHERE lecturer_code LIKE ?
     ORDER BY CAST(SUBSTRING(lecturer_code, ?) AS UNSIGNED) DESC
     LIMIT 1`,
    [`${LECTURER_CODE_PREFIX}%`, LECTURER_CODE_PREFIX.length + 1]
  );

  const lastCode = rows[0]?.lecturer_code || '';
  const lastNumber = Number(lastCode.replace(LECTURER_CODE_PREFIX, '')) || 0;
  return buildLecturerCode(lastNumber + 1);
}

exports.getAllLecturers = async (req, res) => {
  try {
    const searchTerm = String(req.query?.q || '').trim();
    const likeTerm = `%${searchTerm}%`;

    const [rows] = await db.query(`
      SELECT
        u.id,
        u.lecturer_code,
        u.full_name,
        u.email,
        u.department_id,
        d.department_name,
        u.is_active,
        u.created_at,
        u.updated_at,
        COUNT(c.id) AS homeroom_class_count,
        COALESCE(
          GROUP_CONCAT(CONCAT(c.id, '::', c.class_code, '::', c.class_name) ORDER BY c.class_code SEPARATOR '||'),
          ''
        ) AS homeroom_classes_raw
      FROM users u
      LEFT JOIN departments d ON d.id = u.department_id
      LEFT JOIN classes c ON c.homeroom_teacher_id = u.id
      WHERE u.role = 'teacher'
        AND (
          ? = ''
          OR u.full_name LIKE ?
          OR u.email LIKE ?
          OR u.lecturer_code LIKE ?
          OR d.department_name LIKE ?
        )
      GROUP BY
        u.id,
        u.lecturer_code,
        u.full_name,
        u.email,
        u.department_id,
        d.department_name,
        u.is_active,
        u.created_at,
        u.updated_at
      ORDER BY u.created_at DESC
    `, [
      searchTerm,
      likeTerm,
      likeTerm,
      likeTerm,
      likeTerm,
    ]);

    const data = rows.map((row) => ({
      ...row,
      homeroom_class_count: Number(row.homeroom_class_count || 0),
      homeroom_classes: parseHomeroomClasses(row.homeroom_classes_raw),
    }));

    return res.json({
      success: true,
      message: 'Lấy danh sách giảng viên thành công',
      data,
    });
  } catch (error) {
    console.error('getAllLecturers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách giảng viên',
      error: error.message,
    });
  }
};

exports.createLecturer = async (req, res) => {
  try {
    const { full_name, email, password, department_id, is_active } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: full_name, email, password',
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải ít nhất 6 ký tự',
      });
    }

    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email đã được sử dụng',
      });
    }

    const finalLecturerCode = await generateLecturerCode();
    const [existingCode] = await db.query(
      'SELECT id FROM users WHERE lecturer_code = ?',
      [finalLecturerCode]
    );
    if (existingCode.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Mã giảng viên đã tồn tại',
      });
    }

    const password_hash = await bcryptjs.hash(password, 10);

    const [result] = await db.query(`
      INSERT INTO users (lecturer_code, full_name, email, password_hash, role, department_id, is_active)
      VALUES (?, ?, ?, ?, 'teacher', ?, ?)
    `, [
      finalLecturerCode,
      full_name,
      email,
      password_hash,
      department_id || null,
      is_active !== undefined ? Number(is_active) : 1,
    ]);

    return res.status(201).json({
      success: true,
      message: 'Tạo giảng viên thành công',
      data: {
        id: result.insertId,
        lecturer_code: finalLecturerCode,
        full_name,
        email,
        role: 'teacher',
      },
    });
  } catch (error) {
    console.error('createLecturer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo giảng viên',
      error: error.message,
    });
  }
};

exports.updateLecturer = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, password, department_id, is_active } = req.body;

    const [lecturers] = await db.query(
      `SELECT id FROM users WHERE id = ? AND role = 'teacher'`,
      [id]
    );

    if (lecturers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giảng viên',
      });
    }

    if (email !== undefined) {
      const [emailCheck] = await db.query(
        `SELECT id FROM users WHERE email = ? AND id <> ?`,
        [email, id]
      );

      if (emailCheck.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email đã được sử dụng',
        });
      }
    }

    const updateFields = [];
    const updateValues = [];

    if (full_name !== undefined) {
      updateFields.push('full_name = ?');
      updateValues.push(full_name);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (department_id !== undefined) {
      updateFields.push('department_id = ?');
      updateValues.push(department_id || null);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(Number(is_active) ? 1 : 0);
    }
    if (password) {
      if (String(password).length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu phải ít nhất 6 ký tự',
        });
      }
      const password_hash = await bcryptjs.hash(password, 10);
      updateFields.push('password_hash = ?');
      updateValues.push(password_hash);
    }

    if (updateFields.length === 0) {
      return res.json({
        success: true,
        message: 'Không có dữ liệu để cập nhật',
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    await db.query(`
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = ? AND role = 'teacher'
    `, updateValues);

    return res.json({
      success: true,
      message: 'Cập nhật giảng viên thành công',
    });
  } catch (error) {
    console.error('updateLecturer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật giảng viên',
      error: error.message,
    });
  }
};

exports.deleteLecturer = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;

    await connection.beginTransaction();

    const [lecturers] = await connection.query(
      `SELECT id FROM users WHERE id = ? AND role = 'teacher'`,
      [id]
    );

    if (lecturers.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giảng viên',
      });
    }

    await connection.query(
      `UPDATE classes SET homeroom_teacher_id = NULL WHERE homeroom_teacher_id = ?`,
      [id]
    );

    await connection.query(
      `DELETE FROM users WHERE id = ? AND role = 'teacher'`,
      [id]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: 'Xóa giảng viên thành công',
    });
  } catch (error) {
    await connection.rollback();
    console.error('deleteLecturer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa giảng viên',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

exports.assignHomeroomClasses = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const classIds = normalizeClassIds(req.body?.class_ids || []);

    // Không giới hạn số lớp - 1 giảng viên có thể phụ trách nhiều lớp

    await connection.beginTransaction();

    const [lecturers] = await connection.query(
      `SELECT id FROM users WHERE id = ? AND role = 'teacher' AND is_active = 1`,
      [id]
    );

    if (lecturers.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giảng viên hoạt động',
      });
    }

    if (classIds.length > 0) {
      const placeholders = classIds.map(() => '?').join(', ');

      const [classRows] = await connection.query(
        `SELECT id, class_code, homeroom_teacher_id
         FROM classes
         WHERE id IN (${placeholders})`,
        classIds
      );

      if (classRows.length !== classIds.length) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Có lớp không tồn tại trong hệ thống',
        });
      }

      const conflictClasses = classRows.filter(
        (row) => row.homeroom_teacher_id && Number(row.homeroom_teacher_id) !== Number(id)
      );

      if (conflictClasses.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Các lớp sau đã có giảng viên chủ nhiệm: ${conflictClasses.map((c) => c.class_code).join(', ')}`,
        });
      }
    }

    if (classIds.length === 0) {
      await connection.query(
        `UPDATE classes SET homeroom_teacher_id = NULL WHERE homeroom_teacher_id = ?`,
        [id]
      );
    } else {
      const placeholders = classIds.map(() => '?').join(', ');

      await connection.query(
        `UPDATE classes
         SET homeroom_teacher_id = NULL
         WHERE homeroom_teacher_id = ? AND id NOT IN (${placeholders})`,
        [id, ...classIds]
      );

      await connection.query(
        `UPDATE classes
         SET homeroom_teacher_id = ?
         WHERE id IN (${placeholders})`,
        [id, ...classIds]
      );
    }

    await connection.commit();

    return res.json({
      success: true,
      message: 'Phân công lớp chủ nhiệm thành công',
      data: {
        lecturer_id: Number(id),
        class_ids: classIds,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('assignHomeroomClasses error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi phân công lớp chủ nhiệm',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

const XLSX = require('xlsx');

const normalizeHeader = (value) => String(value || '').trim();

const parseExcelBuffer = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('File Excel không có sheet nào');
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

exports.previewImportLecturers = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Vui long chon file Excel' });
    const rows = parseExcelBuffer(req.file.buffer);
    if (!rows.length) return res.status(400).json({ message: 'File Excel rong' });

    const headers = rows[0].map(normalizeHeader);
    const dataPreview = rows.slice(1, 6);
    res.json({ headers, dataPreview, totalRows: Math.max(0, rows.length - 1) });
  } catch (error) {
    console.error('previewImportLecturers error:', error);
    res.status(500).json({ message: 'Loi server khi xem truoc import Excel' });
  }
};

exports.importLecturers = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Vui long chon file Excel' });
    const mapping = req.body.mapping ? JSON.parse(req.body.mapping) : {};

    if (!mapping.full_name || !mapping.email) {
      return res.status(400).json({ message: 'Thieu mapping cho full_name va email' });
    }

    const rows = parseExcelBuffer(req.file.buffer);
    if (rows.length < 2) return res.status(400).json({ message: 'File Excel rong' });

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

    const [existingRows] = await db.query(`SELECT id, email FROM users WHERE role='teacher'`);
    const existingMap = new Map();
    existingRows.forEach(u => existingMap.set(u.email, u.id));

    const [codeRows] = await db.query(
      `SELECT lecturer_code FROM users
       WHERE lecturer_code LIKE 'GV%'
       ORDER BY CAST(SUBSTRING(lecturer_code, 3) AS UNSIGNED) DESC
       LIMIT 1`
    );
    let lastNumber = Number((codeRows[0]?.lecturer_code || '').replace('GV', '')) || 0;

    const defaultPasswordHash = await bcryptjs.hash('123456', 10);

    for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const fullName = String(getValueByHeader(row, mapping.full_name)).trim();
      const email = String(getValueByHeader(row, mapping.email)).trim();
      const deptCode = mapping.department_code ? String(getValueByHeader(row, mapping.department_code)).trim() : null;

      if (!fullName && !email) continue;
      if (!fullName || !email) {
        errors.push({ row: rowIndex + 1, message: 'Thieu Ho ten hoac Email' });
        continue;
      }

      let deptId = null;
      if (deptCode) {
        deptId = deptMap.get(deptCode);
        if (!deptId) {
          errors.push({ row: rowIndex + 1, message: `Khong tim thay Khoa co ma: ${deptCode}` });
          continue;
        }
      }

      if (existingMap.has(email)) {
        await db.query(`UPDATE users SET full_name = ?, department_id = ? WHERE email = ? AND role = 'teacher'`,
          [fullName, deptId, email]);
        updatedCount++;
      } else {
        lastNumber++;
        const lecturerCode = `GV${String(lastNumber).padStart(4, '0')}`;
        const [result] = await db.query(`INSERT INTO users (full_name, email, password_hash, role, department_id, is_active, lecturer_code) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [fullName, email, defaultPasswordHash, 'teacher', deptId, 1, lecturerCode]);
        existingMap.set(email, result.insertId);
        createdCount++;
      }
    }

    res.json({ message: 'Import Giang vien hoan tat', createdCount, updatedCount, failedCount: errors.length, errors });
  } catch (error) {
    console.error('importLecturers error:', error);
    res.status(500).json({ message: 'Loi server khi import Giang vien' });
  }
};
