-- ============================================================
-- SCRIPT CAP NHAT HOC KY CHO DEMO - Thang 7/2026
-- Boi canh: Sinh vien D22 nhap hoc 2022, hien da hoc 7 ky.
-- HK1 2025-2026 dang mo (thang 9/2025 - 7/2026).
-- ============================================================

USE student_risk_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- BUOC 1: RESET VA CAP NHAT BANG semesters
-- 6 ky da dong (2022-2023 den 2024-2025) + 1 ky hien tai dang mo
-- ============================================================
DELETE FROM semesters WHERE id IN (1, 2, 3, 4, 5, 6, 7);

INSERT INTO semesters (id, academic_year, semester_no, semester_name, start_date, end_date, is_closed) VALUES
(5,  '2022-2023', 1, 'HK1 2022-2023', '2022-09-05', '2023-01-20', 1),
(6,  '2022-2023', 2, 'HK2 2022-2023', '2023-02-06', '2023-06-16', 1),
(1,  '2023-2024', 1, 'HK1 2023-2024', '2023-09-04', '2024-01-19', 1),
(2,  '2023-2024', 2, 'HK2 2023-2024', '2024-02-05', '2024-06-14', 1),
(3,  '2024-2025', 1, 'HK1 2024-2025', '2024-09-02', '2025-01-17', 1),
(4,  '2024-2025', 2, 'HK2 2024-2025', '2025-02-03', '2025-06-13', 1),
(7,  '2025-2026', 1, 'HK1 2025-2026', '2025-09-01', '2026-07-31', 0);

-- ============================================================
-- BUOC 2: XOA LICH SU D22 CU VA SEED LAI VOI HOC KY MOI
-- ============================================================

-- Xoa lich su cu cua sinh vien D22
DELETE sar
FROM student_academic_records sar
JOIN students s ON s.id = sar.student_id
JOIN classes c ON c.id = s.class_id
WHERE c.class_code LIKE 'D22\_%';

-- Seed lai lich su hoc ky voi du lieu co xu huong hop ly
INSERT INTO student_academic_records (
    student_id, semester_id, gpa, absences, tuition_debt, scholarship,
    failed_subjects, credits_enrolled, credits_passed, warning_level,
    risk_percentage, risk_level, actual_dropout_status, notes
)
SELECT
    s.id AS student_id,
    sem.id AS semester_id,
    -- GPA: tu base_gpa, co xu huong cai thien nhe theo ky
    ROUND(GREATEST(1.00, LEAST(4.00,
        s.gpa + (sem.id * 0.03) + (RAND() * 0.60 - 0.30)
    )), 2) AS gpa,
    FLOOR(RAND() * 20) AS absences,
    IF(RAND() < 0.17, 1, 0) AS tuition_debt,
    IF(RAND() < 0.20, 1, 0) AS scholarship,
    GREATEST(0, FLOOR(RAND() * 4 - (sem.semester_no * 0.2))) AS failed_subjects,
    16 + FLOOR(RAND() * 9) AS credits_enrolled,
    12 + FLOOR(RAND() * 13) AS credits_passed,
    FLOOR(RAND() * 3) AS warning_level,
    -- Risk phan bo theo GPA
    ROUND(CASE
        WHEN s.gpa >= 3.0 THEN RAND() * 40
        WHEN s.gpa >= 2.0 THEN 20 + RAND() * 50
        ELSE 50 + RAND() * 48
    END, 2) AS risk_percentage,
    CASE
        WHEN s.gpa >= 3.0 AND RAND() < 0.70 THEN 'Safe'
        WHEN s.gpa < 2.0  AND RAND() < 0.60 THEN 'Danger'
        WHEN RAND() < 0.40 THEN 'Safe'
        WHEN RAND() < 0.70 THEN 'Warning'
        ELSE 'Danger'
    END AS risk_level,
    CASE
        WHEN s.gpa < 1.5 AND RAND() < 0.08 THEN 'Dropout'
        WHEN s.gpa >= 3.5 AND sem.is_closed = 1 AND RAND() < 0.04 THEN 'Graduated'
        ELSE s.actual_status
    END AS actual_dropout_status,
    'Seed hoc ky D22 - demo thang 7/2026'
FROM students s
JOIN classes c ON c.id = s.class_id
JOIN semesters sem ON sem.id IN (1, 2, 3, 4, 5, 6, 7)
WHERE c.class_code LIKE 'D22\_%';

-- ============================================================
-- BUOC 3: CAP NHAT enrollment_year SINH VIEN D22 = 2022
-- ============================================================
UPDATE students s
JOIN classes c ON c.id = s.class_id
SET s.enrollment_year = 2022,
    s.note = 'Sinh vien D22 - nhap hoc 2022 - demo thang 7/2026'
WHERE c.class_code LIKE 'D22\_%';

-- ============================================================
-- BUOC 4: DONG BO GPA SINH VIEN TU KY HIEN TAI (HK1 2025-2026)
-- ============================================================
UPDATE students s
JOIN (
    SELECT
        sar.student_id, sar.gpa, sar.risk_percentage, sar.risk_level,
        sar.actual_dropout_status, sar.absences, sar.tuition_debt,
        sar.scholarship, sar.failed_subjects, sar.credits_enrolled,
        sar.credits_passed, sar.warning_level
    FROM student_academic_records sar
    WHERE sar.semester_id = 7
) latest ON latest.student_id = s.id
JOIN classes c ON c.id = s.class_id
WHERE c.class_code LIKE 'D22\_%'
SET
    s.gpa            = latest.gpa,
    s.risk_percentage= latest.risk_percentage,
    s.risk_level     = latest.risk_level,
    s.actual_status  = latest.actual_dropout_status,
    s.absences       = latest.absences,
    s.tuition_debt   = latest.tuition_debt,
    s.scholarship    = latest.scholarship,
    s.failed_subjects= latest.failed_subjects,
    s.credits_enrolled = latest.credits_enrolled,
    s.credits_passed   = latest.credits_passed,
    s.warning_level    = latest.warning_level;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- KIEM TRA KET QUA
-- ============================================================
SELECT
    id, academic_year, semester_no, semester_name, start_date, end_date,
    CASE WHEN is_closed = 1 THEN 'Da dong' ELSE '>>> DANG MO (Hien tai) <<<' END AS trang_thai
FROM semesters
ORDER BY academic_year, semester_no;

SELECT
    CONCAT(sem.academic_year, ' - HK', sem.semester_no) AS hoc_ky,
    COUNT(sar.id) AS so_ban_ghi,
    ROUND(AVG(sar.gpa), 2) AS gpa_tb,
    ROUND(AVG(sar.risk_percentage), 1) AS risk_tb,
    SUM(CASE WHEN sar.risk_level = 'Safe'    THEN 1 ELSE 0 END) AS an_toan,
    SUM(CASE WHEN sar.risk_level = 'Warning' THEN 1 ELSE 0 END) AS canh_bao,
    SUM(CASE WHEN sar.risk_level = 'Danger'  THEN 1 ELSE 0 END) AS nguy_hiem,
    SUM(CASE WHEN sar.actual_dropout_status = 'Dropout'   THEN 1 ELSE 0 END) AS bo_hoc,
    SUM(CASE WHEN sar.actual_dropout_status = 'Graduated' THEN 1 ELSE 0 END) AS tot_nghiep
FROM student_academic_records sar
JOIN semesters sem ON sem.id = sar.semester_id
JOIN students s ON s.id = sar.student_id
JOIN classes c ON c.id = s.class_id
WHERE c.class_code LIKE 'D22\_%'
GROUP BY sem.id, sem.academic_year, sem.semester_no
ORDER BY sem.academic_year, sem.semester_no;
