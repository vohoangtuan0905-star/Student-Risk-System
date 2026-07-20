USE student_risk_db;

-- ============================================================
-- RE-SEED DU LIEU CO XU HUONG CO Y NGHIA
-- Demo ngay 20/8/2026 - HKHe 2025-2026 dang mo
-- Nguyen tac: import du lieu khi ket thuc hoc ky
-- Muc tieu: moi sinh vien co GPA/risk KHAC NHAU qua tung ky
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Xoa toan bo lich su cu cua D22
DELETE sar
FROM student_academic_records sar
JOIN students s ON s.id = sar.student_id
JOIN classes c ON c.id = s.class_id
WHERE c.class_code LIKE 'D22\_%';

DROP PROCEDURE IF EXISTS reseed_d22_trends;

DELIMITER $$

CREATE PROCEDURE reseed_d22_trends()
BEGIN
    DROP TEMPORARY TABLE IF EXISTS tmp_base;
    DROP TEMPORARY TABLE IF EXISTS tmp_sem;

    -- Snapshot sinh vien D22 (tranh loi trigger #1442)
    CREATE TEMPORARY TABLE tmp_base (
        student_id INT PRIMARY KEY,
        base_gpa   DECIMAL(4,2),
        base_status VARCHAR(20),
        -- Moi sinh vien co xu huong rieng: tang/giam/on dinh
        trend_factor DECIMAL(4,3),  -- -0.15 den +0.15
        -- Bien dong ngau nhien moi sinh vien
        volatility DECIMAL(4,3)     -- 0.05 den 0.25
    );

    -- Cac hoc ky da dong (du lieu import sau ky ket thuc)
    CREATE TEMPORARY TABLE tmp_sem (
        sem_id INT,
        sem_order INT,  -- thu tu chronological: 1,2,3...
        academic_year VARCHAR(20),
        sem_no TINYINT,
        is_open TINYINT(1)
    );

    -- Thu tu hoc ky: 1=HK1 2023-24, 2=HK2 2023-24, ..., 6=HK2 2025-26
    -- HKHe (semester_no=3) la hoc ky he, skip vi D22 chi hoc chinh khoa
    INSERT INTO tmp_sem VALUES
        (5, 1, '2023-2024', 1, 0),
        (6, 2, '2023-2024', 2, 0),
        (1, 3, '2024-2025', 1, 0),
        (2, 4, '2024-2025', 2, 0),
        (3, 5, '2025-2026', 1, 0),
        (4, 6, '2025-2026', 2, 0),
        (24,7, '2025-2026', 3, 1);  -- HKHe 2025-2026 dang mo

    -- Sinh base data cho tung sinh vien D22
    INSERT INTO tmp_base (student_id, base_gpa, base_status, trend_factor, volatility)
    SELECT
        s.id,
        s.gpa,
        s.actual_status,
        -- Xu huong: GPA cao -> co xu huong on dinh/tang nhe
        --            GPA thap -> co xu huong bo hoc / may man cai thien
        CASE
            WHEN s.gpa >= 3.0 THEN  0.02 + RAND() * 0.06   -- tang nhe
            WHEN s.gpa >= 2.5 THEN -0.02 + RAND() * 0.08   -- on dinh hoac tang
            WHEN s.gpa >= 2.0 THEN -0.05 + RAND() * 0.10   -- bien dong
            ELSE                   -0.08 + RAND() * 0.12   -- xu huong xau
        END AS trend_factor,
        -- Do bien dong: GPA thap thi bien dong nhieu hon
        CASE
            WHEN s.gpa >= 3.0 THEN 0.05 + RAND() * 0.08
            WHEN s.gpa >= 2.0 THEN 0.08 + RAND() * 0.12
            ELSE                   0.12 + RAND() * 0.15
        END AS volatility
    FROM students s
    JOIN classes c ON c.id = s.class_id
    WHERE c.class_code LIKE 'D22\_%';

    -- Seed tung hoc ky, dung ky_order de tinh GPA co xu huong
    INSERT INTO student_academic_records (
        student_id, semester_id, gpa, absences, tuition_debt, scholarship,
        failed_subjects, credits_enrolled, credits_passed, warning_level,
        risk_percentage, risk_level, actual_dropout_status, notes
    )
    SELECT
        b.student_id,
        ts.sem_id,

        -- GPA co xu huong theo ky + bien dong ngau nhien
        ROUND(GREATEST(1.00, LEAST(4.00,
            b.base_gpa
            + (b.trend_factor * ts.sem_order)          -- xu huong tich luy
            + (b.volatility * (RAND() * 2.0 - 1.0))   -- bien dong ngau nhien
        )), 2) AS gpa,

        -- Vang mat: GPA thap thi vang nhieu hon
        FLOOR(
            CASE
                WHEN b.base_gpa >= 3.0 THEN RAND() * 12
                WHEN b.base_gpa >= 2.0 THEN 3 + RAND() * 15
                ELSE                        8 + RAND() * 20
            END
        ) AS absences,

        -- Hoc phi: GPA thap co xu huong no hoc phi cao hon
        IF(RAND() < CASE WHEN b.base_gpa < 2.0 THEN 0.25 WHEN b.base_gpa < 2.5 THEN 0.18 ELSE 0.10 END, 1, 0) AS tuition_debt,

        -- Hoc bong: GPA cao co xu huong duoc hoc bong nhieu hon
        IF(RAND() < CASE WHEN b.base_gpa >= 3.5 THEN 0.45 WHEN b.base_gpa >= 3.0 THEN 0.28 WHEN b.base_gpa >= 2.5 THEN 0.12 ELSE 0.05 END, 1, 0) AS scholarship,

        -- Mon thi truot: GPA thap thi truot nhieu hon, giam theo ky
        GREATEST(0, FLOOR(
            CASE
                WHEN b.base_gpa >= 3.0 THEN RAND() * 1.5 - (ts.sem_order * 0.05)
                WHEN b.base_gpa >= 2.0 THEN RAND() * 3.0 - (ts.sem_order * 0.10)
                ELSE                        1 + RAND() * 4.0 - (ts.sem_order * 0.08)
            END
        )) AS failed_subjects,

        -- Tin chi dang ky
        16 + FLOOR(RAND() * 9) AS credits_enrolled,

        -- Tin chi qua: ty le pass theo GPA
        FLOOR((16 + FLOOR(RAND() * 9)) * CASE
            WHEN b.base_gpa >= 3.5 THEN 0.90 + RAND() * 0.10
            WHEN b.base_gpa >= 3.0 THEN 0.82 + RAND() * 0.12
            WHEN b.base_gpa >= 2.5 THEN 0.72 + RAND() * 0.15
            WHEN b.base_gpa >= 2.0 THEN 0.60 + RAND() * 0.20
            ELSE                        0.45 + RAND() * 0.25
        END) AS credits_passed,

        -- Muc canh bao: tang khi GPA thap hoac la ky cuoi
        FLOOR(
            CASE
                WHEN b.base_gpa >= 3.0 THEN RAND() * 0.8
                WHEN b.base_gpa >= 2.0 THEN RAND() * 1.8
                ELSE                        RAND() * 3.0
            END
        ) AS warning_level,

        -- Risk percentage: tuong quan nghich voi GPA, bien dong theo ky
        ROUND(GREATEST(0, LEAST(99.99,
            -- Base risk tu GPA
            CASE
                WHEN b.base_gpa >= 3.5 THEN  5 + RAND() * 30
                WHEN b.base_gpa >= 3.0 THEN 15 + RAND() * 35
                WHEN b.base_gpa >= 2.5 THEN 30 + RAND() * 40
                WHEN b.base_gpa >= 2.0 THEN 45 + RAND() * 35
                WHEN b.base_gpa >= 1.5 THEN 60 + RAND() * 30
                ELSE                         70 + RAND() * 29
            END
            -- Bien dong theo xu huong: xu huong tot thi risk giam
            - (b.trend_factor * ts.sem_order * 20)
            -- Nhieu ngau nhien
            + (b.volatility * (RAND() * 30 - 15))
        )), 2) AS risk_percentage,

        -- Risk level: tinh sau
        'Safe' AS risk_level,  -- se update sau

        -- Trang thai thuc te
        CASE
            WHEN b.base_gpa < 1.5 AND RAND() < 0.10 AND ts.sem_order >= 3 THEN 'Dropout'
            WHEN b.base_gpa < 1.8 AND RAND() < 0.05 AND ts.sem_order >= 2 THEN 'Dropout'
            WHEN b.base_gpa >= 3.8 AND ts.sem_order = 7 AND RAND() < 0.15 THEN 'Graduated'
            ELSE b.base_status
        END AS actual_dropout_status,

        CONCAT('Import ket thuc ', ts.academic_year, ' HK', ts.sem_no) AS notes

    FROM tmp_base b
    CROSS JOIN tmp_sem ts;

    -- Cap nhat risk_level dua tren risk_percentage thuc te
    UPDATE student_academic_records sar
    JOIN students s ON s.id = sar.student_id
    JOIN classes c ON c.id = s.class_id
    SET sar.risk_level = CASE
        WHEN sar.risk_percentage >= 70 THEN 'Danger'
        WHEN sar.risk_percentage >= 40 THEN 'Warning'
        ELSE 'Safe'
    END
    WHERE c.class_code LIKE 'D22\_%';

    DROP TEMPORARY TABLE IF EXISTS tmp_base;
    DROP TEMPORARY TABLE IF EXISTS tmp_sem;
END$$

DELIMITER ;

CALL reseed_d22_trends();
DROP PROCEDURE IF EXISTS reseed_d22_trends;

SET FOREIGN_KEY_CHECKS = 1;

-- Kiem tra: GPA bien dong thuc su qua cac ky
SELECT
    sar.student_id,
    MAX(CASE WHEN ts.sem_id=5 THEN sar.gpa END) AS gpa_hk1_2324,
    MAX(CASE WHEN ts.sem_id=6 THEN sar.gpa END) AS gpa_hk2_2324,
    MAX(CASE WHEN ts.sem_id=1 THEN sar.gpa END) AS gpa_hk1_2425,
    MAX(CASE WHEN ts.sem_id=2 THEN sar.gpa END) AS gpa_hk2_2425,
    MAX(CASE WHEN ts.sem_id=3 THEN sar.gpa END) AS gpa_hk1_2526,
    MAX(CASE WHEN ts.sem_id=4 THEN sar.gpa END) AS gpa_hk2_2526,
    MAX(CASE WHEN ts.sem_id=24 THEN sar.gpa END) AS gpa_hkhe_2526
FROM student_academic_records sar
JOIN students s ON s.id=sar.student_id
JOIN classes c ON c.id=s.class_id
-- Use inline values instead of tmp table
JOIN (
    SELECT 5 as sem_id UNION SELECT 6 UNION SELECT 1 UNION
    SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 24
) ts ON ts.sem_id = sar.semester_id
WHERE c.class_code LIKE 'D22_%'
GROUP BY sar.student_id
LIMIT 8;
