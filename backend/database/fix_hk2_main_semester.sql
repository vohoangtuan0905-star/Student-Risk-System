USE student_risk_db;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Xoa du lieu D22 cua HKHe 2025-2026 (hoc ky he, khong phai hoc ky chinh D22)
DELETE sar
FROM student_academic_records sar
JOIN students s ON s.id = sar.student_id
JOIN classes c ON c.id = s.class_id
WHERE c.class_code LIKE 'D22\_%'
  AND sar.semester_id = 24;

-- 2. HK2 2025-2026: la hoc ky chinh, ket thuc 10/08/2026 - truoc ngay bao ve 20/8
UPDATE semesters
SET end_date = '2026-08-10', is_closed = 1
WHERE id = 4;

-- 3. HKHe giu la da dong
UPDATE semesters SET is_closed = 1 WHERE id = 24;

SET FOREIGN_KEY_CHECKS = 1;

-- Ket qua lich su hoc ky D22
SELECT 
    sem.id,
    sem.academic_year,
    sem.semester_name,
    sem.start_date,
    sem.end_date,
    CASE WHEN sem.is_closed=1 THEN 'Da dong' ELSE '>>> DANG MO <<<' END AS trang_thai,
    COUNT(sar.id) AS so_ban_ghi_D22
FROM semesters sem
LEFT JOIN student_academic_records sar ON sar.semester_id = sem.id
LEFT JOIN students s ON s.id = sar.student_id
LEFT JOIN classes c ON c.id = s.class_id AND c.class_code LIKE 'D22_%'
GROUP BY sem.id
ORDER BY sem.academic_year, sem.semester_no;
