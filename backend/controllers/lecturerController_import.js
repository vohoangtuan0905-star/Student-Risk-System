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
