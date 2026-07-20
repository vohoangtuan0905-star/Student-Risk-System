USE student_risk_db;

SET FOREIGN_KEY_CHECKS = 0;

-- Xoa toan bo lich su cu cua D22
DELETE sar
FROM student_academic_records sar
JOIN students s ON s.id = sar.student_id
JOIN classes c ON c.id = s.class_id
WHERE c.class_code LIKE 'D22\_%';

DROP PROCEDURE IF EXISTS reseed_d22_v2;

DELIMITER $$

CREATE PROCEDURE reseed_d22_v2()
BEGIN
    DECLARE v_sem_id INT;
    DECLARE v_sem_order INT;
    DECLARE v_done INT DEFAULT 0;
    DECLARE cur CURSOR FOR
        SELECT sem_id, sem_order FROM (
            SELECT 5 AS sem_id, 1 AS sem_order UNION ALL
            SELECT 6,  2 UNION ALL
            SELECT 1,  3 UNION ALL
            SELECT 2,  4 UNION ALL
            SELECT 3,  5 UNION ALL
            SELECT 4,  6 UNION ALL
            SELECT 24, 7
        ) t;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

    DROP TEMPORARY TABLE IF EXISTS tmp_base_v2;

    -- Snapshot sinh vien ra bang tam de tranh loi trigger #1442
    CREATE TEMPORARY TABLE tmp_base_v2 (
        student_id   INT PRIMARY KEY,
        base_gpa     DECIMAL(4,2),
        base_status  VARCHAR(20),
        trend_factor DECIMAL(5,3),
        volatility   DECIMAL(5,3)
    );

    INSERT INTO tmp_base_v2 (student_id, base_gpa, base_status, trend_factor, volatility)
    SELECT
        s.id,
        s.gpa,
        s.actual_status,
        CASE
            WHEN s.gpa >= 3.0 THEN  0.02 + RAND() * 0.06
            WHEN s.gpa >= 2.5 THEN -0.02 + RAND() * 0.08
            WHEN s.gpa >= 2.0 THEN -0.05 + RAND() * 0.10
            ELSE                   -0.08 + RAND() * 0.12
        END,
        CASE
            WHEN s.gpa >= 3.0 THEN 0.05 + RAND() * 0.08
            WHEN s.gpa >= 2.0 THEN 0.08 + RAND() * 0.12
            ELSE                   0.12 + RAND() * 0.15
        END
    FROM students s
    JOIN classes c ON c.id = s.class_id
    WHERE c.class_code LIKE 'D22\_%';

    -- Lap qua tung hoc ky, seed rieng de tranh trigger conflict
    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO v_sem_id, v_sem_order;
        IF v_done THEN LEAVE read_loop; END IF;

        -- Seed cho hoc ky nay (tu bang tam, khong JOIN students truc tiep)
        INSERT INTO student_academic_records (
            student_id, semester_id, gpa, absences, tuition_debt, scholarship,
            failed_subjects, credits_enrolled, credits_passed, warning_level,
            risk_percentage, risk_level, actual_dropout_status, notes
        )
        SELECT
            b.student_id,
            v_sem_id,
            -- GPA: base + xu huong tich luy + bien dong ngau nhien rieng moi ky
            ROUND(GREATEST(1.00, LEAST(4.00,
                b.base_gpa
                + (b.trend_factor * v_sem_order)
                + (b.volatility * (RAND() * 2.0 - 1.0))
            )), 2),
            -- Vang mat: tuong quan nghich GPA
            FLOOR(CASE
                WHEN b.base_gpa >= 3.0 THEN RAND() * 10
                WHEN b.base_gpa >= 2.0 THEN 2 + RAND() * 14
                ELSE                        7 + RAND() * 18
            END),
            -- Hoc phi no: GPA thap thi no nhieu hon
            IF(RAND() < CASE WHEN b.base_gpa < 2.0 THEN 0.28 WHEN b.base_gpa < 2.5 THEN 0.18 ELSE 0.10 END, 1, 0),
            -- Hoc bong: GPA cao duoc nhieu hon
            IF(RAND() < CASE WHEN b.base_gpa >= 3.5 THEN 0.45 WHEN b.base_gpa >= 3.0 THEN 0.28 WHEN b.base_gpa >= 2.5 THEN 0.12 ELSE 0.04 END, 1, 0),
            -- Mon truot: giam theo ky cho GPA cao
            GREATEST(0, FLOOR(CASE
                WHEN b.base_gpa >= 3.0 THEN RAND() * 1.5 - (v_sem_order * 0.05)
                WHEN b.base_gpa >= 2.0 THEN RAND() * 3.0 - (v_sem_order * 0.08)
                ELSE                        1 + RAND() * 3.5
            END)),
            -- Tin chi dang ky
            16 + FLOOR(RAND() * 9),
            -- Tin chi qua: ty le theo GPA
            FLOOR((16 + FLOOR(RAND() * 9)) * CASE
                WHEN b.base_gpa >= 3.5 THEN 0.90 + RAND() * 0.10
                WHEN b.base_gpa >= 3.0 THEN 0.82 + RAND() * 0.12
                WHEN b.base_gpa >= 2.5 THEN 0.70 + RAND() * 0.18
                WHEN b.base_gpa >= 2.0 THEN 0.58 + RAND() * 0.22
                ELSE                        0.40 + RAND() * 0.28
            END),
            -- Muc canh bao
            FLOOR(CASE
                WHEN b.base_gpa >= 3.0 THEN RAND() * 0.7
                WHEN b.base_gpa >= 2.0 THEN RAND() * 1.8
                ELSE                        RAND() * 2.8
            END),
            -- Risk percentage: nghich chieu voi GPA
            ROUND(GREATEST(0, LEAST(99.99,
                CASE
                    WHEN b.base_gpa >= 3.5 THEN  5 + RAND() * 28
                    WHEN b.base_gpa >= 3.0 THEN 15 + RAND() * 32
                    WHEN b.base_gpa >= 2.5 THEN 28 + RAND() * 38
                    WHEN b.base_gpa >= 2.0 THEN 42 + RAND() * 32
                    WHEN b.base_gpa >= 1.5 THEN 58 + RAND() * 28
                    ELSE                         68 + RAND() * 29
                END
                - (b.trend_factor * v_sem_order * 18)
                + (b.volatility * (RAND() * 28 - 14))
            )), 2),
            -- Risk level tam thoi
            'Safe',
            -- Trang thai: bo hoc khi GPA thap va ky muon
            CASE
                WHEN b.base_gpa < 1.5 AND RAND() < 0.10 AND v_sem_order >= 3 THEN 'Dropout'
                WHEN b.base_gpa < 1.8 AND RAND() < 0.05 AND v_sem_order >= 2 THEN 'Dropout'
                ELSE b.base_status
            END,
            CONCAT('Import sau HK', v_sem_order, ' - demo bao ve 20/8/2026')
        FROM tmp_base_v2 b;

        -- Cap nhat risk_level ngay sau khi insert xong ky nay
        UPDATE student_academic_records sar
        JOIN tmp_base_v2 b ON b.student_id = sar.student_id
        SET sar.risk_level = CASE
            WHEN sar.risk_percentage >= 70 THEN 'Danger'
            WHEN sar.risk_percentage >= 40 THEN 'Warning'
            ELSE 'Safe'
        END
        WHERE sar.semester_id = v_sem_id;

    END LOOP;
    CLOSE cur;

    DROP TEMPORARY TABLE IF EXISTS tmp_base_v2;
END$$

DELIMITER ;

CALL reseed_d22_v2();
DROP PROCEDURE IF EXISTS reseed_d22_v2;

SET FOREIGN_KEY_CHECKS = 1;

-- ==== KIEM TRA KET QUA ====

-- 1. GPA thuc su khac nhau qua cac ky
SELECT
    sar.student_id,
    MAX(CASE WHEN sar.semester_id=5  THEN sar.gpa END) AS hk1_2324,
    MAX(CASE WHEN sar.semester_id=6  THEN sar.gpa END) AS hk2_2324,
    MAX(CASE WHEN sar.semester_id=1  THEN sar.gpa END) AS hk1_2425,
    MAX(CASE WHEN sar.semester_id=2  THEN sar.gpa END) AS hk2_2425,
    MAX(CASE WHEN sar.semester_id=3  THEN sar.gpa END) AS hk1_2526,
    MAX(CASE WHEN sar.semester_id=4  THEN sar.gpa END) AS hk2_2526,
    MAX(CASE WHEN sar.semester_id=24 THEN sar.gpa END) AS hkhe_2526
FROM student_academic_records sar
JOIN students s ON s.id=sar.student_id
JOIN classes c ON c.id=s.class_id
WHERE c.class_code LIKE 'D22_%'
GROUP BY sar.student_id
LIMIT 10;

-- 2. Thong ke phan bo theo tung ky
SELECT
    sem.id, sem.academic_year, CONCAT('HK',sem.semester_no) AS ky,
    CASE WHEN sem.is_closed=1 THEN 'Da dong (import xong)' ELSE '>>> DANG MO <<<' END AS trang_thai,
    COUNT(sar.id) AS so_sv,
    ROUND(AVG(sar.gpa),2) AS gpa_tb,
    ROUND(MIN(sar.gpa),2) AS gpa_min,
    ROUND(MAX(sar.gpa),2) AS gpa_max,
    ROUND(AVG(sar.risk_percentage),1) AS risk_tb,
    SUM(IF(sar.risk_level='Safe',1,0)) AS safe,
    SUM(IF(sar.risk_level='Warning',1,0)) AS warning_ct,
    SUM(IF(sar.risk_level='Danger',1,0)) AS danger,
    SUM(IF(sar.actual_dropout_status='Dropout',1,0)) AS bo_hoc
FROM student_academic_records sar
JOIN semesters sem ON sem.id=sar.semester_id
JOIN students s ON s.id=sar.student_id
JOIN classes c ON c.id=s.class_id
WHERE c.class_code LIKE 'D22_%'
GROUP BY sem.id
ORDER BY sem.academic_year, sem.semester_no;
