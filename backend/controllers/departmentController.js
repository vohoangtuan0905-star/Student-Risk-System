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

// Xuất các hàm ra để xài ở nơi khác
module.exports = { getAllDepartments, createDepartment, updateDepartment, deleteDepartment };