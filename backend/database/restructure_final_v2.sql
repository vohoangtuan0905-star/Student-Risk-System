USE student_risk_db;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Sua HKHe 2025-2026: 1 thang (01/07 - 31/07/2026), DA DONG
UPDATE semesters
SET start_date = '2026-07-01', end_date = '2026-07-31', is_closed = 1
WHERE id = 24;

-- 2. Them HK1 2026-2027: hoc ky chinh moi (3 thang), CHUA BAT DAU
INSERT INTO semesters (academic_year, semester_no, semester_name, start_date, end_date, is_closed)
VALUES ('2026-2027', 1, 'HK1 2026-2027', '2026-09-01', '2026-11-30', 0)
ON DUPLICATE KEY UPDATE
    semester_name='HK1 2026-2027', start_date='2026-09-01', end_date='2026-11-30', is_closed=0;

-- 3. Xoa du lieu HKHe cu cua D22 (neu co)
DELETE sar
FROM student_academic_records sar
JOIN students s ON s.id=sar.student_id
JOIN classes c ON c.id=s.class_id
WHERE c.class_code LIKE 'D22\_%' AND sar.semester_id=24;

-- 4. Seed HKHe 2025-2026 cho D22 (dung stored proc tranh loi trigger)
DROP PROCEDURE IF EXISTS sp_seed_hkhe;

DELIMITER $$

CREATE PROCEDURE sp_seed_hkhe()
BEGIN
    DROP TEMPORARY TABLE IF EXISTS tmp_hk2_snap;

    CREATE TEMPORARY TABLE tmp_hk2_snap
    SELECT sar.student_id, sar.gpa AS prev_gpa, sar.risk_percentage AS prev_risk,
           sar.actual_dropout_status AS prev_status
    FROM student_academic_records sar
    WHERE sar.semester_id = 4;

    -- Seed HKHe (khong co UPDATE students trong loop, tranh trigger)
    INSERT INTO student_academic_records (
        student_id, semester_id, gpa, absences, tuition_debt, scholarship,
        failed_subjects, credits_enrolled, credits_passed, warning_level,
        risk_percentage, risk_level, actual_dropout_status, notes
    )
    SELECT
        t.student_id, 24,
        ROUND(GREATEST(1.00, LEAST(4.00, t.prev_gpa + RAND()*0.50 - 0.20)), 2),
        FLOOR(RAND()*8),
        IF(RAND() < CASE WHEN t.prev_gpa<2.0 THEN 0.30 WHEN t.prev_gpa<2.5 THEN 0.20 ELSE 0.10 END, 1, 0),
        IF(RAND() < 0.05, 1, 0),
        GREATEST(0, FLOOR(RAND()*3)),
        4+FLOOR(RAND()*8),
        FLOOR((4+FLOOR(RAND()*8)) * CASE WHEN t.prev_gpa>=3.0 THEN 0.85+RAND()*0.15 WHEN t.prev_gpa>=2.0 THEN 0.65+RAND()*0.25 ELSE 0.45+RAND()*0.30 END),
        FLOOR(RAND()*2),
        ROUND(GREATEST(0, LEAST(99.99, t.prev_risk + RAND()*20 - 10)), 2),
        CASE WHEN t.prev_risk>=60 THEN 'Danger' WHEN t.prev_risk>=35 THEN 'Warning' ELSE 'Safe' END,
        CASE WHEN t.prev_gpa<1.3 AND RAND()<0.12 THEN 'Dropout' ELSE t.prev_status END,
        'Import HKHe 2025-2026 (01/07-31/07) - bao ve hoi dong 20/8/2026'
    FROM tmp_hk2_snap t;

    DROP TEMPORARY TABLE IF EXISTS tmp_hk2_snap;
END$$

DELIMITER ;

CALL sp_seed_hkhe();
DROP PROCEDURE IF EXISTS sp_seed_hkhe;

-- 5. Chinh risk_level cho HKHe (sau khi da insert xong, khong con conflict)
UPDATE student_academic_records sar
SET sar.risk_level = CASE
    WHEN sar.risk_percentage >= 70 THEN 'Danger'
    WHEN sar.risk_percentage >= 40 THEN 'Warning'
    ELSE 'Safe'
END
WHERE sar.semester_id = 24;

SET FOREIGN_KEY_CHECKS = 1;

-- 6. Ket qua: tat ca hoc ky tu 2025-2026 tro di
SELECT
    sem.id,
    sem.academic_year,
    sem.semester_name,
    sem.start_date,
    sem.end_date,
    DATEDIFF(sem.end_date, sem.start_date) AS so_ngay,
    CASE WHEN sem.is_closed=1 THEN 'Da dong' ELSE '>>> CHUA BAT DAU (HK moi) <<<' END AS trang_thai,
    COUNT(DISTINCT sar.student_id) AS so_sv_D22
FROM semesters sem
LEFT JOIN student_academic_records sar ON sar.semester_id=sem.id
LEFT JOIN students s ON s.id=sar.student_id
LEFT JOIN classes c ON c.id=s.class_id AND c.class_code LIKE 'D22_%'
WHERE sem.academic_year IN ('2025-2026','2026-2027')
GROUP BY sem.id
ORDER BY sem.academic_year, sem.semester_no;

-- 7. Thong ke phan bo HKHe (du lieu vua import de trinh bay hoi dong)
SELECT
    'HKHe 2025-2026 (vua import)' AS hoc_ky,
    COUNT(*) AS tong_sv,
    ROUND(AVG(gpa),2) AS gpa_tb,
    ROUND(AVG(risk_percentage),1) AS risk_tb,
    SUM(IF(risk_level='Safe',1,0)) AS an_toan,
    SUM(IF(risk_level='Warning',1,0)) AS canh_bao,
    SUM(IF(risk_level='Danger',1,0)) AS nguy_hiem,
    SUM(IF(actual_dropout_status='Dropout',1,0)) AS bo_hoc
FROM student_academic_records
WHERE semester_id=24;
