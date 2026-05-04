const db = require('../config/db');

const MAX_HOMEROOM_CLASSES_PER_TEACHER = 2;

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

    let countSql = `SELECT COUNT(*) AS total FROM classes WHERE homeroom_teacher_id = ?`;
    const countParams = [homeroomTeacherId];

    if (excludeClassId) {
        countSql += ` AND id <> ?`;
        countParams.push(excludeClassId);
    }

    const [countRows] = await db.query(countSql, countParams);
    const assignedCount = Number(countRows[0]?.total || 0);

    if (assignedCount >= MAX_HOMEROOM_CLASSES_PER_TEACHER) {
        return {
            ok: false,
            status: 400,
            message: `Mỗi giảng viên chỉ được chủ nhiệm tối đa ${MAX_HOMEROOM_CLASSES_PER_TEACHER} lớp`
        };
    }

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

module.exports = { getAllClasses, createClass, updateClass, deleteClass };