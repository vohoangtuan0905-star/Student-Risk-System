const XLSX = require('xlsx');

const db = require('../config/db');

const buildRecentAcademicYears = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const baseYear = now.getMonth() >= 7 ? currentYear : currentYear - 1;

  return [
    { startYear: baseYear - 1, endYear: baseYear },
    { startYear: baseYear, endYear: baseYear + 1 }
  ];
};

const buildSemesterSeed = () => {
  const years = buildRecentAcademicYears();
  const rows = [];

  years.forEach((item, index) => {
    const academicYear = `${item.startYear}-${item.endYear}`;
    rows.push({
      academicYear,
      semesterNo: 1,
      semesterName: `HK1 ${academicYear}`,
      startDate: `${item.startYear}-09-01`,
      endDate: `${item.endYear}-01-15`,
      isClosed: index === 0 ? 1 : 0
    });
    rows.push({
      academicYear,
      semesterNo: 2,
      semesterName: `HK2 ${academicYear}`,
      startDate: `${item.endYear}-02-01`,
      endDate: `${item.endYear}-06-15`,
      isClosed: 0
    });
  });

  return rows;
};

const ensureRecentSemesters = async (conn) => {
  const seedRows = buildSemesterSeed();

  await conn.query(
    `
      INSERT INTO semesters (academic_year, semester_no, semester_name, start_date, end_date, is_closed)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        semester_name = VALUES(semester_name),
        start_date = VALUES(start_date),
        end_date = VALUES(end_date),
        is_closed = VALUES(is_closed)
    `,
    [
      seedRows.map((row) => [
        row.academicYear,
        row.semesterNo,
        row.semesterName,
        row.startDate,
        row.endDate,
        row.isClosed
      ])
    ]
  );

  const academicYears = [...new Set(seedRows.map((row) => row.academicYear))];
  const placeholders = academicYears.map(() => '?').join(',');
  const [semesterRows] = await conn.query(
    `
      SELECT id, academic_year, semester_no
      FROM semesters
      WHERE academic_year IN (${placeholders})
      ORDER BY academic_year ASC, semester_no ASC
    `,
    academicYears
  );

  return semesterRows;
};

const normalizeHeader = (value) => String(value || '').trim();

const parseExcelBuffer = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('Không tìm thấy sheet trong file Excel');
  }
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
};

const buildHeaderIndex = (headers) => {
  const map = new Map();
  headers.forEach((header, idx) => {
    const key = normalizeHeader(header);
    if (key) {
      map.set(key, idx);
    }
  });
  return map;
};

const parseExcelDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    const year = String(parsed.y).padStart(4, '0');
    const month = String(parsed.m).padStart(2, '0');
    const day = String(parsed.d).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const text = String(value).trim();
  if (!text) return null;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().slice(0, 10);
};

const toNumber = (value, fallback = 0) => {
  if (value === '' || value === null || value === undefined) return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const toBooleanFlag = (value) => {
  if (value === '' || value === null || value === undefined) return 0;
  const text = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'co', 'có', 'y'].includes(text)) return 1;
  if (['0', 'false', 'no', 'khong', 'không', 'n'].includes(text)) return 0;
  return Number(value) ? 1 : 0;
};

const normalizeGender = (value) => {
  const text = String(value || '').trim().toLowerCase();
  if (['nam', 'male', 'm'].includes(text)) return 'Male';
  if (['nu', 'nữ', 'female', 'f'].includes(text)) return 'Female';
  return text ? 'Other' : null;
};

const normalizeRiskLevel = (value, riskPercentage) => {
  const text = String(value || '').trim().toLowerCase();
  if (['danger', 'nguy hiểm', 'nguy hiem', 'cao'].includes(text)) return 'Danger';
  if (['warning', 'cảnh báo', 'canh bao', 'trung bình', 'trung binh'].includes(text)) return 'Warning';
  if (['safe', 'an toàn', 'an toan', 'thap'].includes(text)) return 'Safe';
  if (Number.isFinite(riskPercentage)) {
    if (riskPercentage >= 70) return 'Danger';
    if (riskPercentage >= 40) return 'Warning';
    return 'Safe';
  }
  return 'Safe';
};

const normalizeStatus = (value) => {
  const text = String(value || '').trim().toLowerCase();
  if (['enrolled', 'dang hoc', 'đang học'].includes(text)) return 'Enrolled';
  if (['dropout', 'da bo hoc', 'đã bỏ học'].includes(text)) return 'Dropout';
  if (['graduated', 'da tot nghiep', 'đã tốt nghiệp'].includes(text)) return 'Graduated';
  return text ? value : 'Enrolled';
};

const getTeacherClassIds = async (teacherId) => {
  const [rows] = await db.query(
    `SELECT id FROM classes WHERE homeroom_teacher_id = ?`,
    [teacherId]
  );
  return rows.map((row) => row.id);
};

// Lấy danh sách sinh viên
const getAllStudents = async (req, res) => {
  try {
    let teacherClassIds = [];
    if (req.user?.role === 'teacher') {
      teacherClassIds = await getTeacherClassIds(req.user.id);
      if (teacherClassIds.length === 0) {
        return res.json([]);
      }
    }

    const whereClause =
      req.user?.role === 'teacher'
        ? `WHERE s.class_id IN (${teacherClassIds.map(() => '?').join(',')})`
        : '';

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
        COALESCE(s.department_id, c.department_id) AS department_id,
        COALESCE(s.class_id, c.id) AS class_id,
        d.department_name,
        c.class_name,
        c.homeroom_teacher_id,
        u.full_name AS homeroom_teacher_name,
        s.created_at,
        s.updated_at
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN users u ON c.homeroom_teacher_id = u.id
      ${whereClause}
      ORDER BY s.id ASC
    `, teacherClassIds);

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
        c.homeroom_teacher_id,
        u.full_name AS homeroom_teacher_name,
        s.created_at,
        s.updated_at
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN users u ON c.homeroom_teacher_id = u.id
      WHERE s.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }

    if (req.user?.role === 'teacher') {
      const student = rows[0];
      if (!student.homeroom_teacher_id || Number(student.homeroom_teacher_id) !== Number(req.user.id)) {
        return res.status(403).json({ message: 'Bạn chỉ có thể xem sinh viên thuộc lớp mình chủ nhiệm' });
      }
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
        s.date_of_birth,
        s.gender,
        s.age_at_enrollment,
        s.email,
        s.phone,
        s.address,
        s.department_id,
        s.class_id,
        s.gpa,
        s.absences,
        s.tuition_debt,
        s.scholarship,
        s.failed_subjects,
        s.credits_enrolled,
        s.credits_passed,
        s.warning_level,
        s.risk_percentage,
        s.risk_level,
        s.actual_status,
        s.enrollment_year,
        s.note,
        s.created_at,
        s.updated_at,
        d.department_name,
        c.class_name,
        c.homeroom_teacher_id,
        u.full_name AS homeroom_teacher_name
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN users u ON c.homeroom_teacher_id = u.id
      WHERE s.id = ?
    `, [id]);

    if (studentRows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }

    if (req.user?.role === 'teacher') {
      const student = studentRows[0];
      if (!student.homeroom_teacher_id || Number(student.homeroom_teacher_id) !== Number(req.user.id)) {
        return res.status(403).json({ message: 'Bạn chỉ có thể xem lịch sử sinh viên thuộc lớp mình chủ nhiệm' });
      }
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
  let conn;
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

    conn = await db.getConnection();
    await conn.beginTransaction();

    const safeGpa = Number(gpa ?? 0);
    const safeAbsences = Number(absences ?? 0);
    const safeTuitionDebt = Number(tuition_debt ?? 0);
    const safeScholarship = Number(scholarship ?? 0);
    const safeRiskPercentage = Number(risk_percentage ?? 0);
    const safeRiskLevel = risk_level || 'Safe';
    const safeActualStatus = actual_status || 'Enrolled';

    const [result] = await conn.query(`
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
      safeGpa,
      safeAbsences,
      safeTuitionDebt,
      safeScholarship,
      safeRiskPercentage,
      safeRiskLevel,
      safeActualStatus,
      enrollment_year || null,
      note || null
    ]);

    const studentId = result.insertId;
    const semesters = await ensureRecentSemesters(conn);

    if (semesters.length > 0) {
      const recordValues = semesters.map((semester, idx) => {
        const isCurrentSemester = idx === semesters.length - 1;
        const seedGpa = isCurrentSemester ? safeGpa : Math.max(1, Number((safeGpa - 0.2).toFixed(2)));
        const seedRisk = isCurrentSemester
          ? safeRiskPercentage
          : Math.min(99, Number((safeRiskPercentage + 3).toFixed(2)));

        return [
          studentId,
          semester.id,
          seedGpa,
          safeAbsences,
          safeTuitionDebt,
          safeScholarship,
          0,
          20,
          18,
          0,
          seedRisk,
          safeRiskLevel,
          safeActualStatus,
          `Auto seed when creating student - ${semester.academic_year} HK${semester.semester_no}`
        ];
      });

      await conn.query(
        `
          INSERT INTO student_academic_records (
            student_id, semester_id, gpa, absences, tuition_debt, scholarship,
            failed_subjects, credits_enrolled, credits_passed, warning_level,
            risk_percentage, risk_level, actual_dropout_status, notes
          ) VALUES ?
        `,
        [recordValues]
      );
    }

    await conn.commit();

    res.status(201).json({
      message: 'Thêm sinh viên thành công',
      studentId: result.insertId
    });
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }
    console.error('createStudent error:', error);
    res.status(500).json({ message: 'Lỗi server khi thêm sinh viên' });
  } finally {
    if (conn) {
      conn.release();
    }
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

const previewImportStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file Excel' });
    }

    const rows = parseExcelBuffer(req.file.buffer);
    if (!rows.length) {
      return res.status(400).json({ message: 'File Excel trống' });
    }

    const headers = rows[0].map(normalizeHeader);
    const previewRows = rows.slice(1, 6).map((row) => {
      const item = {};
      headers.forEach((header, idx) => {
        if (header) {
          item[header] = row[idx] ?? '';
        }
      });
      return item;
    });

    res.json({
      columns: headers.filter(Boolean),
      previewRows
    });
  } catch (error) {
    console.error('previewImportStudents error:', error);
    res.status(500).json({ message: 'Lỗi server khi xem trước import Excel' });
  }
};

const importStudents = async (req, res) => {
  let conn;
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file Excel' });
    }

    const mapping = req.body.mapping ? JSON.parse(req.body.mapping) : {};
    const requiredFields = ['student_code', 'full_name'];
    const hasClassMapping = Boolean(mapping.class_code || mapping.class_name);

    if (!requiredFields.every((field) => mapping[field]) || !hasClassMapping) {
      return res.status(400).json({
        message: 'Thiếu mapping cho student_code, full_name và class_code/class_name'
      });
    }

    const rows = parseExcelBuffer(req.file.buffer);
    if (rows.length < 2) {
      return res.status(400).json({ message: 'File Excel không có dữ liệu' });
    }

    const headers = rows[0].map(normalizeHeader);
    const headerIndex = buildHeaderIndex(headers);

    const getValueByHeader = (row, header) => {
      if (!header) return '';
      const idx = headerIndex.get(header);
      return idx === undefined ? '' : row[idx];
    };

    const [classRows] = await db.query(
      `SELECT id, class_code, class_name, department_id FROM classes`
    );
    const classByCode = new Map();
    const classByName = new Map();
    classRows.forEach((cls) => {
      if (cls.class_code) classByCode.set(String(cls.class_code).trim().toLowerCase(), cls);
      if (cls.class_name) classByName.set(String(cls.class_name).trim().toLowerCase(), cls);
    });

    const studentCodes = rows
      .slice(1)
      .map((row) => String(getValueByHeader(row, mapping.student_code || '')).trim())
      .filter(Boolean);
    const uniqueCodes = Array.from(new Set(studentCodes));
    const existingMap = new Map();

    if (uniqueCodes.length > 0) {
      const placeholders = uniqueCodes.map(() => '?').join(',');
      const [existing] = await db.query(
        `SELECT id, student_code FROM students WHERE student_code IN (${placeholders})`,
        uniqueCodes
      );
      existing.forEach((row) => existingMap.set(row.student_code, row.id));
    }

    conn = await db.getConnection();
    const semesters = await ensureRecentSemesters(conn);

    let createdCount = 0;
    let updatedCount = 0;
    const errors = [];

    for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex];
      const studentCode = String(getValueByHeader(row, mapping.student_code)).trim();
      const fullName = String(getValueByHeader(row, mapping.full_name)).trim();
      const classCodeRaw = mapping.class_code ? String(getValueByHeader(row, mapping.class_code)).trim() : '';
      const classNameRaw = mapping.class_name ? String(getValueByHeader(row, mapping.class_name)).trim() : '';

      if (!studentCode && !fullName && !classCodeRaw && !classNameRaw) {
        continue;
      }

      if (!studentCode || !fullName) {
        errors.push({ row: rowIndex + 1, message: 'Thiếu student_code hoặc full_name' });
        continue;
      }

      const classKey = classCodeRaw.toLowerCase();
      const classNameKey = classNameRaw.toLowerCase();
      const classInfo = classKey ? classByCode.get(classKey) : classByName.get(classNameKey);

      if (!classInfo) {
        errors.push({ row: rowIndex + 1, message: 'Không tìm thấy lớp theo class_code/class_name' });
        continue;
      }

      const gender = normalizeGender(getValueByHeader(row, mapping.gender));
      const riskPercentage = toNumber(getValueByHeader(row, mapping.risk_percentage), 0);
      const riskLevel = normalizeRiskLevel(getValueByHeader(row, mapping.risk_level), riskPercentage);

      const payload = {
        student_code: studentCode,
        full_name: fullName,
        date_of_birth: parseExcelDate(getValueByHeader(row, mapping.date_of_birth)),
        gender: gender || 'Other',
        email: String(getValueByHeader(row, mapping.email) || '').trim() || null,
        phone: String(getValueByHeader(row, mapping.phone) || '').trim() || null,
        address: String(getValueByHeader(row, mapping.address) || '').trim() || null,
        department_id: classInfo.department_id,
        class_id: classInfo.id,
        gpa: toNumber(getValueByHeader(row, mapping.gpa), 0),
        absences: toNumber(getValueByHeader(row, mapping.absences), 0),
        tuition_debt: toBooleanFlag(getValueByHeader(row, mapping.tuition_debt)),
        scholarship: toBooleanFlag(getValueByHeader(row, mapping.scholarship)),
        risk_percentage: riskPercentage,
        risk_level: riskLevel,
        actual_status: normalizeStatus(getValueByHeader(row, mapping.actual_status)),
        enrollment_year: toNumber(getValueByHeader(row, mapping.enrollment_year), null),
        note: String(getValueByHeader(row, mapping.note) || '').trim() || null
      };

      const existingId = existingMap.get(studentCode);

      if (existingId) {
        await conn.query(
          `
            UPDATE students
            SET
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
          `,
          [
            payload.full_name,
            payload.date_of_birth,
            payload.gender,
            payload.email,
            payload.phone,
            payload.address,
            payload.department_id,
            payload.class_id,
            payload.gpa,
            payload.absences,
            payload.tuition_debt,
            payload.scholarship,
            payload.risk_percentage,
            payload.risk_level,
            payload.actual_status,
            payload.enrollment_year,
            payload.note,
            existingId
          ]
        );
        updatedCount += 1;
      } else {
        await conn.beginTransaction();
        try {
          const [result] = await conn.query(
            `
              INSERT INTO students (
                student_code, full_name, date_of_birth, gender, email, phone, address,
                department_id, class_id, gpa, absences, tuition_debt, scholarship,
                risk_percentage, risk_level, actual_status, enrollment_year, note
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
              payload.student_code,
              payload.full_name,
              payload.date_of_birth,
              payload.gender,
              payload.email,
              payload.phone,
              payload.address,
              payload.department_id,
              payload.class_id,
              payload.gpa,
              payload.absences,
              payload.tuition_debt,
              payload.scholarship,
              payload.risk_percentage,
              payload.risk_level,
              payload.actual_status,
              payload.enrollment_year,
              payload.note
            ]
          );

          const studentId = result.insertId;
          if (semesters.length > 0) {
            const recordValues = semesters.map((semester, idx) => {
              const isCurrentSemester = idx === semesters.length - 1;
              const seedGpa = isCurrentSemester ? payload.gpa : Math.max(1, Number((payload.gpa - 0.2).toFixed(2)));
              const seedRisk = isCurrentSemester
                ? payload.risk_percentage
                : Math.min(99, Number((payload.risk_percentage + 3).toFixed(2)));

              return [
                studentId,
                semester.id,
                seedGpa,
                payload.absences,
                payload.tuition_debt,
                payload.scholarship,
                0,
                20,
                18,
                0,
                seedRisk,
                payload.risk_level,
                payload.actual_status,
                `Auto seed when importing student - ${semester.academic_year} HK${semester.semester_no}`
              ];
            });

            await conn.query(
              `
                INSERT INTO student_academic_records (
                  student_id, semester_id, gpa, absences, tuition_debt, scholarship,
                  failed_subjects, credits_enrolled, credits_passed, warning_level,
                  risk_percentage, risk_level, actual_dropout_status, notes
                ) VALUES ?
              `,
              [recordValues]
            );
          }

          await conn.commit();
          createdCount += 1;
        } catch (err) {
          await conn.rollback();
          errors.push({ row: rowIndex + 1, message: err?.message || 'Lỗi khi thêm sinh viên' });
        }
      }
    }

    res.json({
      message: 'Import Excel hoàn tất',
      createdCount,
      updatedCount,
      failedCount: errors.length,
      errors
    });
  } catch (error) {
    console.error('importStudents error:', error);
    res.status(500).json({ message: 'Lỗi server khi import Excel sinh viên' });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  getStudentHistory,
  createStudent,
  updateStudent,
  deleteStudent,
  previewImportStudents,
  importStudents
};