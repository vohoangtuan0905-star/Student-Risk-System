USE student_risk_db;

-- Dong bo GPA/risk sinh vien D22 tu HK2 2025-2026 (ky chinh moi nhat)
DROP PROCEDURE IF EXISTS sync_d22_from_hk2;

DELIMITER $$

CREATE PROCEDURE sync_d22_from_hk2()
BEGIN
    DROP TEMPORARY TABLE IF EXISTS tmp_hk2_latest;

    CREATE TEMPORARY TABLE tmp_hk2_latest
    SELECT sar.student_id, sar.gpa, sar.risk_percentage, sar.risk_level,
           sar.actual_dropout_status, sar.absences, sar.tuition_debt,
           sar.scholarship, sar.failed_subjects, sar.credits_enrolled,
           sar.credits_passed, sar.warning_level
    FROM student_academic_records sar
    WHERE sar.semester_id = 4;

    UPDATE students s
    JOIN tmp_hk2_latest t ON t.student_id = s.id
    JOIN classes c ON c.id = s.class_id
    SET
        s.gpa              = t.gpa,
        s.risk_percentage  = t.risk_percentage,
        s.risk_level       = t.risk_level,
        s.actual_status    = t.actual_dropout_status,
        s.absences         = t.absences,
        s.tuition_debt     = t.tuition_debt,
        s.scholarship      = t.scholarship,
        s.failed_subjects  = t.failed_subjects,
        s.credits_enrolled = t.credits_enrolled,
        s.credits_passed   = t.credits_passed,
        s.warning_level    = t.warning_level
    WHERE c.class_code LIKE 'D22\_%';

    DROP TEMPORARY TABLE IF EXISTS tmp_hk2_latest;
END$$

DELIMITER ;

CALL sync_d22_from_hk2();
DROP PROCEDURE IF EXISTS sync_d22_from_hk2;

-- Kiem tra phan bo sinh vien hien tai (sau HK2 2025-2026)
SELECT
    risk_level,
    COUNT(*) AS so_sv,
    ROUND(AVG(gpa),2) AS gpa_tb,
    ROUND(AVG(risk_percentage),1) AS risk_tb
FROM students s
JOIN classes c ON c.id=s.class_id
WHERE c.class_code LIKE 'D22_%'
GROUP BY risk_level;

-- Lich su GPA 1 so sinh vien
SELECT
    sar.student_id,
    MAX(CASE WHEN sar.semester_id=5 THEN sar.gpa END) AS hk1_2324,
    MAX(CASE WHEN sar.semester_id=6 THEN sar.gpa END) AS hk2_2324,
    MAX(CASE WHEN sar.semester_id=1 THEN sar.gpa END) AS hk1_2425,
    MAX(CASE WHEN sar.semester_id=2 THEN sar.gpa END) AS hk2_2425,
    MAX(CASE WHEN sar.semester_id=3 THEN sar.gpa END) AS hk1_2526,
    MAX(CASE WHEN sar.semester_id=4 THEN sar.gpa END) AS hk2_2526_MOINHAT
FROM student_academic_records sar
JOIN students s ON s.id=sar.student_id
JOIN classes c ON c.id=s.class_id
WHERE c.class_code LIKE 'D22_%'
GROUP BY sar.student_id
LIMIT 8;
