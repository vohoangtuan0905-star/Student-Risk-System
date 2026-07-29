-- ============================================================
-- Phân công lại giảng viên phụ trách lớp: 1 GV có thể nhiều lớp
-- Logic: Mỗi khoa chọn 1 GV "chính" phụ trách 3-4 lớp,
--        các GV còn lại phụ trách 1-2 lớp
-- ============================================================

USE student_risk_db;

SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- KHOA KINH DOANH (KD - department_id=16)
-- GV: 156 (Quang), 167 (Phương), 169 (Sơn)
-- Lớp: D22_KD01-06 (6 lớp)
-- Phân công: Quang (GV0004) -> 3 lớp, Phương (GV0015) -> 2 lớp, Sơn (GV0017) -> 1 lớp
-- =============================================
UPDATE classes SET homeroom_teacher_id = 156 WHERE class_code IN ('D22_KD01', 'D22_KD02', 'D22_KD03');
UPDATE classes SET homeroom_teacher_id = 167 WHERE class_code IN ('D22_KD04', 'D22_KD05');
UPDATE classes SET homeroom_teacher_id = 169 WHERE class_code IN ('D22_KD06');

-- =============================================
-- KHOA CNTT (TH - department_id=17)
-- GV: 159 (Trang), 166 (Vy), 179 (Tuấn)
-- Lớp: D22_TH01-06 (6 lớp)
-- Phân công: Trang (GV0007) -> 3 lớp, Vy (GV0014) -> 2 lớp, Tuấn (GV0027) -> 1 lớp
-- =============================================
UPDATE classes SET homeroom_teacher_id = 159 WHERE class_code IN ('D22_TH01', 'D22_TH02', 'D22_TH03');
UPDATE classes SET homeroom_teacher_id = 166 WHERE class_code IN ('D22_TH04', 'D22_TH05');
UPDATE classes SET homeroom_teacher_id = 179 WHERE class_code IN ('D22_TH06');

-- =============================================
-- KHOA MARKETING (MK - department_id=18)
-- GV: 158 (Hồng), 164 (Kiệt), 182 (Yến)
-- Lớp: D22_MK01-06 (6 lớp)
-- Phân công: Hồng (GV0006) -> 3 lớp, Kiệt (GV0012) -> 2 lớp, Yến (GV0030) -> 1 lớp
-- =============================================
UPDATE classes SET homeroom_teacher_id = 158 WHERE class_code IN ('D22_MK01', 'D22_MK02', 'D22_MK03');
UPDATE classes SET homeroom_teacher_id = 164 WHERE class_code IN ('D22_MK04', 'D22_MK05');
UPDATE classes SET homeroom_teacher_id = 182 WHERE class_code IN ('D22_MK06');

-- =============================================
-- KHOA LOGISTICS (LG - department_id=19)
-- GV: 155 (My), 173 (Long), 178 (Mai)
-- Lớp: D22_LG01-06 (6 lớp)
-- Phân công: Long (GV0021) -> 3 lớp, My (GV0003) -> 2 lớp, Mai (GV0026) -> 1 lớp
-- =============================================
UPDATE classes SET homeroom_teacher_id = 173 WHERE class_code IN ('D22_LG01', 'D22_LG02', 'D22_LG03');
UPDATE classes SET homeroom_teacher_id = 155 WHERE class_code IN ('D22_LG04', 'D22_LG05');
UPDATE classes SET homeroom_teacher_id = 178 WHERE class_code IN ('D22_LG06');

-- =============================================
-- KHOA KẾ TOÁN (KT - department_id=20)
-- GV: 161 (Phúc), 163 (Oanh), 170 (Ngọc)
-- Lớp: D22_KT01-06 (6 lớp)
-- Phân công: Phúc (GV0009) -> 3 lớp, Oanh (GV0011) -> 2 lớp, Ngọc (GV0018) -> 1 lớp
-- =============================================
UPDATE classes SET homeroom_teacher_id = 161 WHERE class_code IN ('D22_KT01', 'D22_KT02', 'D22_KT03');
UPDATE classes SET homeroom_teacher_id = 163 WHERE class_code IN ('D22_KT04', 'D22_KT05');
UPDATE classes SET homeroom_teacher_id = 170 WHERE class_code IN ('D22_KT06');

-- =============================================
-- KHOA NGÂN HÀNG (NH - department_id=21)
-- GV: 162 (Thiên), 175 (Thảo), 177 (Tâm)
-- Lớp: D22_NH01-06 (6 lớp)
-- Phân công: Thiên (GV0010) -> 3 lớp, Thảo (GV0023) -> 2 lớp, Tâm (GV0025) -> 1 lớp
-- =============================================
UPDATE classes SET homeroom_teacher_id = 162 WHERE class_code IN ('D22_NH01', 'D22_NH02', 'D22_NH03');
UPDATE classes SET homeroom_teacher_id = 175 WHERE class_code IN ('D22_NH04', 'D22_NH05');
UPDATE classes SET homeroom_teacher_id = 177 WHERE class_code IN ('D22_NH06');

-- =============================================
-- KHOA XÂY DỰNG (XD - department_id=24)
-- GV: 165 (Hiếu), 171 (Khánh), 172 (Linh)
-- Lớp: D22_XD01-06 (6 lớp)
-- Phân công: Hiếu (GV0013) -> 3 lớp, Khánh (GV0019) -> 2 lớp, Linh (GV0020) -> 1 lớp
-- =============================================
UPDATE classes SET homeroom_teacher_id = 165 WHERE class_code IN ('D22_XD01', 'D22_XD02', 'D22_XD03');
UPDATE classes SET homeroom_teacher_id = 171 WHERE class_code IN ('D22_XD04', 'D22_XD05');
UPDATE classes SET homeroom_teacher_id = 172 WHERE class_code IN ('D22_XD06');

-- =============================================
-- KHOA CƠ KHÍ (CK - department_id=25)
-- GV: 160 (Nam), 176 (Phương), 180 (Quang)
-- Lớp: D22_CK01-06 (6 lớp)
-- Phân công: Nam (GV0008) -> 3 lớp, Phương (GV0024) -> 2 lớp, Quang (GV0028) -> 1 lớp
-- =============================================
UPDATE classes SET homeroom_teacher_id = 160 WHERE class_code IN ('D22_CK01', 'D22_CK02', 'D22_CK03');
UPDATE classes SET homeroom_teacher_id = 176 WHERE class_code IN ('D22_CK04', 'D22_CK05');
UPDATE classes SET homeroom_teacher_id = 180 WHERE class_code IN ('D22_CK06');

-- =============================================
-- KHOA DU LỊCH (DL - department_id=4)
-- GV: 153 (Bình), 168 (An), 174 (Cường)
-- Lớp: D22_DL01-06 (6 lớp)
-- Phân công: Bình (GV0001) -> 3 lớp, An (GV0016) -> 2 lớp, Cường (GV0022) -> 1 lớp
-- =============================================
UPDATE classes SET homeroom_teacher_id = 153 WHERE class_code IN ('D22_DL01', 'D22_DL02', 'D22_DL03');
UPDATE classes SET homeroom_teacher_id = 168 WHERE class_code IN ('D22_DL04', 'D22_DL05');
UPDATE classes SET homeroom_teacher_id = 174 WHERE class_code IN ('D22_DL06');

-- =============================================
-- KHOA NGOẠI NGỮ (NN - department_id=5)
-- GV: 154 (Dũng), 157 (Khánh), 181 (Hiếu)
-- Lớp: D22_NN01-06 (6 lớp)
-- Phân công: Dũng (GV0002) -> 3 lớp, Khánh (GV0005) -> 2 lớp, Hiếu (GV0029) -> 1 lớp
-- =============================================
UPDATE classes SET homeroom_teacher_id = 154 WHERE class_code IN ('D22_NN01', 'D22_NN02', 'D22_NN03');
UPDATE classes SET homeroom_teacher_id = 157 WHERE class_code IN ('D22_NN04', 'D22_NN05');
UPDATE classes SET homeroom_teacher_id = 181 WHERE class_code IN ('D22_NN06');

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- Kiểm tra kết quả phân công
-- =============================================
SELECT 
    u.lecturer_code AS 'Ma GV',
    u.full_name AS 'Ho ten',
    d.department_name AS 'Khoa',
    COUNT(c.id) AS 'So lop phu trach',
    GROUP_CONCAT(c.class_code ORDER BY c.class_code SEPARATOR ', ') AS 'Danh sach lop'
FROM users u
LEFT JOIN departments d ON d.id = u.department_id
LEFT JOIN classes c ON c.homeroom_teacher_id = u.id
WHERE u.role = 'teacher'
GROUP BY u.id
ORDER BY COUNT(c.id) DESC, d.department_name, u.lecturer_code;
