const db = require('../config/db');

// 1. Lấy danh sách Lớp (Kèm theo Tên Khoa nhờ lệnh JOIN)
const getAllClasses = async (req, res) => {
    try {
        const sql = `
            SELECT classes.id, classes.class_name, departments.department_name, classes.department_id 
            FROM classes 
            LEFT JOIN departments ON classes.department_id = departments.id
            ORDER BY classes.id DESC
        `;
        const [rows] = await db.query(sql);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách Lớp' });
    }
};

// 2. Thêm Lớp mới
const createClass = async (req, res) => {
    try {
        const { class_name, department_id } = req.body;
        if (!class_name || !department_id) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập tên lớp và chọn Khoa' });
        }

        const [result] = await db.query('INSERT INTO classes (class_name, department_id) VALUES (?, ?)', [class_name, department_id]);
        res.status(201).json({ success: true, message: 'Thêm Lớp thành công!', id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi thêm Lớp' });
    }
};

// 3. Cập nhật Lớp
const updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { class_name, department_id } = req.body;

        await db.query('UPDATE classes SET class_name = ?, department_id = ? WHERE id = ?', [class_name, department_id, id]);
        res.status(200).json({ success: true, message: 'Cập nhật Lớp thành công!' });
    } catch (error) {
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

module.exports = { getAllClasses, createClass, updateClass, deleteClass };