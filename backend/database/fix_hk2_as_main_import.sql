USE student_risk_db;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. HK2 2025-2026: ket thuc 15/06/2026 (hoc ky chinh, truoc HK3 he)
--    Day la hoc ky co du lieu D22 vua import de trinh bay hoi dong
UPDATE semesters
SET end_date = '2026-06-15', is_closed = 1
WHERE id = 4;

-- 2. HK3 2025-2026: giu nguyen 01/07 - 31/07 nhung KHONG co du lieu D22
--    (HK3 chi danh cho SV hoc lai, khong phai khoa chinh D22)
DELETE sar
FROM student_academic_records sar
JOIN students s ON s.id = sar.student_id
JOIN classes c ON c.id = s.class_id
WHERE c.class_code LIKE 'D22\_%'
  AND sar.semester_id = 24;

-- 3. HK3 cac nam truoc cung xoa du lieu D22 (nhat quan)
DELETE sar
FROM student_academic_records sar
JOIN students s ON s.id = sar.student_id
JOIN classes c ON c.id = s.class_id
WHERE c.class_code LIKE 'D22\_%'
  AND sar.semester_id IN (22, 23);

SET FOREIGN_KEY_CHECKS = 1;

-- 4. Ket qua: cau truc hoc ky va du lieu D22
SELECT
    sem.id,
    sem.academic_year,
    sem.semester_name,
    sem.start_date,
    sem.end_date,
    CASE WHEN sem.is_closed=1 THEN 'Da dong' ELSE '>>> CHUA BAT DAU <<<' END AS trang_thai,
    COUNT(DISTINCT sar.student_id) AS so_sv_D22
FROM semesters sem
LEFT JOIN student_academic_records sar ON sar.semester_id = sem.id
LEFT JOIN students s ON s.id = sar.student_id
LEFT JOIN classes c ON c.id = s.class_id AND c.class_code LIKE 'D22_%'
GROUP BY sem.id
ORDER BY sem.academic_year, sem.semester_no;
