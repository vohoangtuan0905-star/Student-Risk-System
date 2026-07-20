USE student_risk_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. SUA HKHe 2025-2026: chi 1 thang (01/07 - 31/07/2026), DA DONG
--    Day la hoc ky vua ket thuc truoc ngay bao ve 20/8/2026
-- ============================================================
UPDATE semesters
SET start_date = '2026-07-01',
    end_date   = '2026-07-31',
    is_closed  = 1
WHERE id = 24;

-- ============================================================
-- 2. THEM HK1 2026-2027: hoc ky chinh moi (3 thang), CHUA BAT DAU
--    Sau ngay bao ve 20/8/2026 moi bat dau
-- ============================================================
INSERT INTO semesters (academic_year, semester_no, semester_name, start_date, end_date, is_closed)
VALUES ('2026-2027', 1, 'HK1 2026-2027', '2026-09-01', '2026-11-30', 0)
ON DUPLICATE KEY UPDATE
    semester_name = 'HK1 2026-2027',
    start_date    = '2026-09-01',
    end_date      = '2026-11-30',
    is_closed     = 0;

-- ============================================================
-- 3. SEED DU LIEU D22 CHO HKHe 2025-2026 (id=24)
--    Day la du lieu vua duoc import de trinh bay hoi dong
-- ============================================================
DROP PROCEDURE IF EXISTS seed_hkhe_for_demo;

DELIMITER $$

CREATE PROCEDURE seed_hkhe_for_demo()
BEGIN
    DROP TEMPORARY TABLE IF EXISTS tmp_d22_snap;

    -- Snapshot D22 tu HK2 2025-2026 (ky chinh truoc HKHe)
    -- Trong HKHe, sinh vien chu yeu hoc lai -> so luong it hon, credits it hon
    CREATE TEMPORARY TABLE tmp_d22_snap
    SELECT
        sar.student_id,
        sar.gpa         AS prev_gpa,
        sar.risk_percentage AS prev_risk,
        sar.actual_dropout_status AS prev_status
    FROM student_academic_records sar
    WHERE sar.semester_id = 4;  -- HK2 2025-2026

    -- Xoa cu neu co
    DELETE sar2
    FROM student_academic_records sar2
    JOIN students s ON s.id = sar2.student_id
    JOIN classes c ON c.id = s.class_id
    WHERE c.class_code LIKE 'D22\_%'
      AND sar2.semester_id = 24;

    -- Seed HKHe: chi nhung sinh vien can hoc lai (co mon truot hoac GPA thap)
    -- Nhung vi day la demo, seed cho tat ca D22 de co du lieu
    INSERT INTO student_academic_records (
        student_id, semester_id, gpa, absences, tuition_debt, scholarship,
        failed_subjects, credits_enrolled, credits_passed, warning_level,
        risk_percentage, risk_level, actual_dropout_status, notes
    )
    SELECT
        t.student_id,
        24,  -- HKHe 2025-2026
        -- GPA HKHe: biet dong tu GPA ky truoc (hoc lai -> co the tang hoac giam)
        ROUND(GREATEST(1.00, LEAST(4.00,
            t.prev_gpa + (RAND() * 0.50 - 0.20)
        )), 2),
        -- Vang mat: HKHe ngan nen vang it hon
        FLOOR(RAND() * 8),
        -- No hoc phi: GPA thap thi no nhieu hon
        IF(RAND() < CASE WHEN t.prev_gpa < 2.0 THEN 0.30 WHEN t.prev_gpa < 2.5 THEN 0.20 ELSE 0.10 END, 1, 0),
        -- Hoc bong: HKHe it khi co hoc bong
        IF(RAND() < 0.05, 1, 0),
        -- Mon truot: HKHe la hoc lai, van co the truot lai
        GREATEST(0, FLOOR(RAND() * 3)),
        -- Credits: HKHe it tin chi hon (hoc lai)
        4 + FLOOR(RAND() * 8),
        -- Credits passed
        FLOOR((4 + FLOOR(RAND() * 8)) * CASE
            WHEN t.prev_gpa >= 3.0 THEN 0.85 + RAND() * 0.15
            WHEN t.prev_gpa >= 2.0 THEN 0.65 + RAND() * 0.25
            ELSE                        0.45 + RAND() * 0.30
        END),
        -- Warning level
        FLOOR(RAND() * 2),
        -- Risk: dua tren risk ky truoc, bien dong nho
        ROUND(GREATEST(0, LEAST(99.99,
            t.prev_risk + (RAND() * 20 - 10)
        )), 2),
        -- Risk level
        CASE
            WHEN (t.prev_risk + RAND()*20 - 10) >= 70 THEN 'Danger'
            WHEN (t.prev_risk + RAND()*20 - 10) >= 40 THEN 'Warning'
            ELSE 'Safe'
        END,
        -- Trang thai: GPA rat thap co the bo hoc
        CASE
            WHEN t.prev_gpa < 1.3 AND RAND() < 0.12 THEN 'Dropout'
            ELSE t.prev_status
        END,
        'Import sau HKHe 2025-2026 (01/07-31/07) - trinh bay hoi dong 20/8/2026'
    FROM tmp_d22_snap t;

    -- Chinh lai risk_level sau khi insert
    UPDATE student_academic_records sar
    JOIN students s ON s.id = sar.student_id
    JOIN classes c ON c.id = s.class_id
    SET sar.risk_level = CASE
        WHEN sar.risk_percentage >= 70 THEN 'Danger'
        WHEN sar.risk_percentage >= 40 THEN 'Warning'
        ELSE 'Safe'
    END
    WHERE sar.semester_id = 24
      AND c.class_code LIKE 'D22\_%';

    DROP TEMPORARY TABLE IF EXISTS tmp_d22_snap;
END$$

DELIMITER ;

CALL seed_hkhe_for_demo();
DROP PROCEDURE IF EXISTS seed_hkhe_for_demo;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- KIEM TRA KET QUA
-- ============================================================
SELECT
    sem.id,
    sem.academic_year,
    sem.semester_name,
    sem.start_date,
    sem.end_date,
    DATEDIFF(sem.end_date, sem.start_date) AS so_ngay,
    CASE WHEN sem.is_closed=1 THEN 'Da dong - da import' ELSE '>>> CHUA BAT DAU <<<' END AS trang_thai,
    COUNT(DISTINCT sar.student_id) AS so_sv_D22
FROM semesters sem
LEFT JOIN student_academic_records sar ON sar.semester_id = sem.id
LEFT JOIN students s ON s.id = sar.student_id
LEFT JOIN classes c ON c.id = s.class_id AND c.class_code LIKE 'D22_%'
WHERE sem.academic_year IN ('2025-2026','2026-2027')
GROUP BY sem.id
ORDER BY sem.academic_year, sem.semester_no;
