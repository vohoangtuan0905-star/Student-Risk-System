const db = require('../config/db');

// 1. Lấy danh sách Khoa
const getAllDepartments = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM departments ORDER BY id DESC');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách Khoa' });
    }
};

// 2. Thêm Khoa mới
const createDepartment = async (req, res) => {
    try {
        const { department_name } = req.body;
        if (!department_name) return res.status(400).json({ success: false, message: 'Vui lòng nhập tên khoa' });

        const [result] = await db.query('INSERT INTO departments (department_name) VALUES (?)', [department_name]);
        res.status(201).json({ success: true, message: 'Thêm Khoa thành công!', id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi thêm Khoa' });
    }
};

// 3. Cập nhật (Sửa) Tên Khoa
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params; // Lấy id từ URL
        const { department_name } = req.body;

        await db.query('UPDATE departments SET department_name = ? WHERE id = ?', [department_name, id]);
        res.status(200).json({ success: true, message: 'Cập nhật Khoa thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật Khoa' });
    }
};

// 4. Xóa Khoa
const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM departments WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: 'Xóa Khoa thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi xóa Khoa. Có thể Khoa này đang chứa dữ liệu Lớp.' });
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

const previewImportDepartments = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn file Excel' });
    const rows = parseExcelBuffer(req.file.buffer);
    if (!rows.length) return res.status(400).json({ message: 'File Excel rỗng' });

    const headers = rows[0].map(normalizeHeader);
    const dataPreview = rows.slice(1, 6);
    res.json({ headers, dataPreview, totalRows: Math.max(0, rows.length - 1) });
  } catch (error) {
    console.error('previewImportDepartments error:', error);
    res.status(500).json({ message: 'Lỗi server khi xem trước import Excel' });
  }
};

const importDepartments = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn file Excel' });
    const mapping = req.body.mapping ? JSON.parse(req.body.mapping) : {};
    
    if (!mapping.department_code || !mapping.department_name) {
      return res.status(400).json({ message: 'Thiếu mapping cho department_code và department_name' });
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

    const [existingRows] = await db.query(`SELECT id, department_code FROM departments`);
    const existingMap = new Map();
    existingRows.forEach(row => existingMap.set(row.department_code, row.id));

    for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const code = String(getValueByHeader(row, mapping.department_code)).trim();
      const name = String(getValueByHeader(row, mapping.department_name)).trim();
      const desc = mapping.description ? String(getValueByHeader(row, mapping.description)).trim() : null;

      if (!code && !name) continue;
      if (!code || !name) {
        errors.push({ row: rowIndex + 1, message: 'Thiếu mã khoa hoặc tên khoa' });
        continue;
      }

      if (existingMap.has(code)) {
        await db.query(`UPDATE departments SET department_name = ?, description = ? WHERE department_code = ?`, [name, desc, code]);
        updatedCount++;
      } else {
        const [result] = await db.query(`INSERT INTO departments (department_code, department_name, description) VALUES (?, ?, ?)`, [code, name, desc]);
        existingMap.set(code, result.insertId);
        createdCount++;
      }
    }

    res.json({ message: 'Import Khoa hoàn tất', createdCount, updatedCount, failedCount: errors.length, errors });
  } catch (error) {
    console.error('importDepartments error:', error);
    res.status(500).json({ message: 'Lỗi server khi import Khoa' });
  }
};

module.exports = { getAllDepartments, createDepartment, updateDepartment, deleteDepartment, previewImportDepartments, importDepartments };