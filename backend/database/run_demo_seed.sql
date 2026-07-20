USE student_risk_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP PROCEDURE IF EXISTS seed_hk_demo_2526;
DELIMITER $$

CREATE PROCEDURE seed_hk_demo_2526()
BEGIN
    DROP TEMPORARY TABLE IF EXISTS tmp_sv_d22;
    
    CREATE TEMPORARY TABLE tmp_sv_d22
    SELECT s.id AS student_id, s.gpa AS base_gpa, s.actual_status AS base_status
    FROM students s
    JOIN classes c ON c.id = s.class_id
    WHERE c.class_code LIKE 'D22\_%';

    -- Seed HK2 2025-2026 (id=4)
    INSERT INTO student_academic_records (
        student_id, semester_id, gpa, absences, tuition_debt, scholarship,
        failed_subjects, credits_enrolled, credits_passed, warning_level,
        risk_percentage, risk_level, actual_dropout_status, notes
    )
    SELECT
        t.student_id, 4,
        ROUND(GREATEST(1.00, LEAST(4.00, t.base_gpa + RAND()*0.50 - 0.20)), 2),
        FLOOR(RAND()*18),
        IF(RAND()<0.15,1,0), IF(RAND()<0.22,1,0),
        GREATEST(0, FLOOR(RAND()*4)),
        16+FLOOR(RAND()*9), 13+FLOOR(RAND()*12), FLOOR(RAND()*3),
        ROUND(CASE WHEN t.base_gpa>=3.0 THEN RAND()*38 WHEN t.base_gpa>=2.0 THEN 18+RAND()*48 ELSE 48+RAND()*50 END, 2),
        CASE WHEN t.base_gpa>=3.0 AND RAND()<0.72 THEN 'Safe' WHEN t.base_gpa<2.0 AND RAND()<0.62 THEN 'Danger' WHEN RAND()<0.42 THEN 'Safe' WHEN RAND()<0.72 THEN 'Warning' ELSE 'Danger' END,
        CASE WHEN t.base_gpa<1.5 AND RAND()<0.07 THEN 'Dropout' ELSE t.base_status END,
        'Seed HK2 2025-2026 demo thang 7/2026'
    FROM tmp_sv_d22 t
    WHERE NOT EXISTS (
        SELECT 1 FROM student_academic_records sar2
        WHERE sar2.student_id = t.student_id AND sar2.semester_id = 4
    );

    -- Seed HKHe 2025-2026 (id=24) - hoc ky hien tai dang mo
    INSERT INTO student_academic_records (
        student_id, semester_id, gpa, absences, tuition_debt, scholarship,
        failed_subjects, credits_enrolled, credits_passed, warning_level,
        risk_percentage, risk_level, actual_dropout_status, notes
    )
    SELECT
        t.student_id, 24,
        ROUND(GREATEST(1.00, LEAST(4.00, t.base_gpa + RAND()*0.40 - 0.15)), 2),
        FLOOR(RAND()*15),
        IF(RAND()<0.14,1,0), IF(RAND()<0.23,1,0),
        GREATEST(0, FLOOR(RAND()*3)),
        6+FLOOR(RAND()*9), 4+FLOOR(RAND()*8), FLOOR(RAND()*3),
        ROUND(CASE WHEN t.base_gpa>=3.0 THEN RAND()*35 WHEN t.base_gpa>=2.0 THEN 15+RAND()*45 ELSE 45+RAND()*52 END, 2),
        CASE WHEN t.base_gpa>=3.0 AND RAND()<0.74 THEN 'Safe' WHEN t.base_gpa<2.0 AND RAND()<0.64 THEN 'Danger' WHEN RAND()<0.44 THEN 'Safe' WHEN RAND()<0.74 THEN 'Warning' ELSE 'Danger' END,
        CASE WHEN t.base_gpa<1.5 AND RAND()<0.06 THEN 'Dropout' ELSE t.base_status END,
        'Seed HKHe 2025-2026 - hoc ky hien tai thang 7/2026'
    FROM tmp_sv_d22 t
    WHERE NOT EXISTS (
        SELECT 1 FROM student_academic_records sar2
        WHERE sar2.student_id = t.student_id AND sar2.semester_id = 24
    );

    DROP TEMPORARY TABLE IF EXISTS tmp_sv_d22;
END$$

DELIMITER ;

CALL seed_hk_demo_2526();
DROP PROCEDURE IF EXISTS seed_hk_demo_2526;

SET FOREIGN_KEY_CHECKS = 1;

-- Ket qua kiem tra
SELECT sem.id, sem.academic_year, sem.semester_no, sem.semester_name, 
       CASE WHEN sem.is_closed=1 THEN 'Da dong' ELSE '>>> DANG MO <<<' END AS trang_thai,
       COUNT(sar.id) AS so_ban_ghi_d22
FROM semesters sem
LEFT JOIN student_academic_records sar ON sar.semester_id = sem.id
LEFT JOIN students s ON s.id = sar.student_id
LEFT JOIN classes c ON c.id = s.class_id AND c.class_code LIKE 'D22_%'
GROUP BY sem.id
ORDER BY sem.academic_year, sem.semester_no;
