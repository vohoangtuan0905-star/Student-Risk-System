-- =========================================================
-- STUDENT RISK SYSTEM V3 WITH KAGGLE
-- Database duy nhất cho:
-- 1) Hệ thống web vận hành
-- 2) Dữ liệu mẫu Kaggle/UCI để benchmark AI
-- =========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS student_risk_system;
CREATE DATABASE student_risk_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE student_risk_system;

-- =========================================================
-- 1) DEPARTMENTS
-- =========================================================
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_code VARCHAR(20) NOT NULL UNIQUE,
    department_name VARCHAR(150) NOT NULL,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================================
-- 2) USERS
-- password mẫu: 123456
-- hash bcrypt 10 rounds
-- =========================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher') NOT NULL DEFAULT 'teacher',
    department_id INT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- =========================================================
-- 3) CLASSES
-- =========================================================
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_code VARCHAR(30) NULL UNIQUE,
    class_name VARCHAR(150) NOT NULL,
    department_id INT NOT NULL,
    homeroom_teacher_id INT NULL,
    school_year VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_classes_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_classes_teacher
        FOREIGN KEY (homeroom_teacher_id) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- =========================================================
-- 4) STUDENTS
-- Snapshot mới nhất để frontend/backend đọc nhanh
-- =========================================================
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_code VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    date_of_birth DATE NULL,
    gender ENUM('Male', 'Female', 'Other') DEFAULT 'Other',
    email VARCHAR(150) NULL UNIQUE,
    phone VARCHAR(20) NULL,
    address VARCHAR(255) NULL,
    department_id INT NOT NULL,
    class_id INT NOT NULL,

    -- Snapshot feature mới nhất
    gpa DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    absences INT NOT NULL DEFAULT 0,
    tuition_debt TINYINT(1) NOT NULL DEFAULT 0,
    scholarship TINYINT(1) NOT NULL DEFAULT 0,

    -- Kết quả AI mới nhất
    risk_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    risk_level ENUM('Safe', 'Warning', 'Danger') NOT NULL DEFAULT 'Safe',

    -- Trạng thái thực tế mới nhất
    actual_status ENUM('Enrolled', 'Dropout', 'Graduated') NOT NULL DEFAULT 'Enrolled',

    enrollment_year INT NULL,
    note TEXT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_students_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_students_class
        FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- =========================================================
-- 5) SEMESTERS
-- =========================================================
CREATE TABLE semesters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    academic_year VARCHAR(20) NOT NULL,
    semester_no TINYINT NOT NULL,
    semester_name VARCHAR(100) NOT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    is_closed TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_semesters_year_no (academic_year, semester_no)
);

-- =========================================================
-- 6) STUDENT_ACADEMIC_RECORDS
-- Feature Store theo từng học kỳ
-- =========================================================
CREATE TABLE student_academic_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    semester_id INT NOT NULL,

    -- Core features
    gpa DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    absences INT NOT NULL DEFAULT 0,
    tuition_debt TINYINT(1) NOT NULL DEFAULT 0,
    scholarship TINYINT(1) NOT NULL DEFAULT 0,

    -- Extended local features
    failed_subjects INT NOT NULL DEFAULT 0,
    credits_enrolled INT NOT NULL DEFAULT 0,
    credits_passed INT NOT NULL DEFAULT 0,
    warning_level TINYINT NOT NULL DEFAULT 0,

    -- AI result per semester
    risk_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    risk_level ENUM('Safe', 'Warning', 'Danger') NOT NULL DEFAULT 'Safe',

    -- Ground truth cho retrain
    actual_dropout_status ENUM('Enrolled', 'Dropout', 'Graduated') NOT NULL DEFAULT 'Enrolled',

    notes VARCHAR(255) NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_sar_student
        FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_sar_semester
        FOREIGN KEY (semester_id) REFERENCES semesters(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    UNIQUE KEY uq_sar_student_semester (student_id, semester_id),
    KEY idx_sar_student (student_id),
    KEY idx_sar_semester (semester_id)
);

-- =========================================================
-- 7) ML MODEL VERSIONS
-- Lưu version model
-- =========================================================
CREATE TABLE ml_model_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    version_label VARCHAR(50) NOT NULL UNIQUE,
    algorithm VARCHAR(100) NOT NULL,
    dataset_source ENUM('kaggle', 'local_mysql') NOT NULL DEFAULT 'kaggle',
    target_type ENUM('binary', 'multiclass') NOT NULL DEFAULT 'binary',
    metrics_json JSON NULL,
    artifact_path VARCHAR(255) NULL,
    is_production TINYINT(1) NOT NULL DEFAULT 0,
    trained_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id INT NULL,
    note VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_model_versions_user
        FOREIGN KEY (created_by_user_id) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- =========================================================
-- 8) RETRAIN JOBS
-- Audit retrain
-- =========================================================
CREATE TABLE retrain_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requested_by_user_id INT NULL,
    source_dataset ENUM('kaggle', 'local_mysql') NOT NULL DEFAULT 'local_mysql',
    algorithm VARCHAR(100) NOT NULL DEFAULT 'XGBoost',
    status ENUM('pending', 'running', 'success', 'failed') NOT NULL DEFAULT 'pending',
    old_model_version_id INT NULL,
    new_model_version_id INT NULL,
    started_at DATETIME NULL,
    finished_at DATETIME NULL,
    log_text TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_retrain_requested_by
        FOREIGN KEY (requested_by_user_id) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_retrain_old_model
        FOREIGN KEY (old_model_version_id) REFERENCES ml_model_versions(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_retrain_new_model
        FOREIGN KEY (new_model_version_id) REFERENCES ml_model_versions(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- =========================================================
-- 9) KAGGLE RAW TABLE
-- Bảng raw để import nguyên dataset Kaggle/UCI
-- =========================================================
CREATE TABLE kaggle_raw_students (
    id INT AUTO_INCREMENT PRIMARY KEY,

    marital_status INT NULL,
    application_mode INT NULL,
    application_order INT NULL,
    course INT NULL,
    daytime_evening_attendance INT NULL,
    previous_qualification INT NULL,
    previous_qualification_grade DECIMAL(6,2) NULL,
    nacionality INT NULL,
    mothers_qualification INT NULL,
    fathers_qualification INT NULL,
    mothers_occupation INT NULL,
    fathers_occupation INT NULL,
    admission_grade DECIMAL(6,2) NULL,
    displaced INT NULL,
    educational_special_needs INT NULL,
    debtor INT NULL,
    tuition_fees_up_to_date INT NULL,
    gender INT NULL,
    scholarship_holder INT NULL,
    age_at_enrollment INT NULL,
    international INT NULL,

    curricular_units_1st_sem_credited INT NULL,
    curricular_units_1st_sem_enrolled INT NULL,
    curricular_units_1st_sem_evaluations INT NULL,
    curricular_units_1st_sem_approved INT NULL,
    curricular_units_1st_sem_grade DECIMAL(6,2) NULL,
    curricular_units_1st_sem_without_evaluations INT NULL,

    curricular_units_2nd_sem_credited INT NULL,
    curricular_units_2nd_sem_enrolled INT NULL,
    curricular_units_2nd_sem_evaluations INT NULL,
    curricular_units_2nd_sem_approved INT NULL,
    curricular_units_2nd_sem_grade DECIMAL(6,2) NULL,
    curricular_units_2nd_sem_without_evaluations INT NULL,

    unemployment_rate DECIMAL(6,2) NULL,
    inflation_rate DECIMAL(6,2) NULL,
    gdp DECIMAL(8,2) NULL,

    target VARCHAR(30) NOT NULL,

    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- SEED DATA
-- =========================================================

INSERT INTO departments (department_code, department_name, description) VALUES
('CNTT', 'Công nghệ thông tin', 'Khoa Công nghệ thông tin'),
('QTKD', 'Quản trị kinh doanh', 'Khoa Quản trị kinh doanh'),
('KT', 'Kế toán', 'Khoa Kế toán');

INSERT INTO users (full_name, email, password_hash, role, department_id, is_active) VALUES
('Admin Hệ Thống', 'admin@studentrisk.local', '$2b$10$7EqJtq98hPqEX7fNZaFWoOHi8JqVg4l98WqQBi9Gf4bm/FvGV8eK6', 'admin', 1, 1),
('GV Nguyễn Văn A', 'teacher1@studentrisk.local', '$2b$10$7EqJtq98hPqEX7fNZaFWoOHi8JqVg4l98WqQBi9Gf4bm/FvGV8eK6', 'teacher', 1, 1),
('GV Trần Thị B', 'teacher2@studentrisk.local', '$2b$10$7EqJtq98hPqEX7fNZaFWoOHi8JqVg4l98WqQBi9Gf4bm/FvGV8eK6', 'teacher', 2, 1);

INSERT INTO classes (class_code, class_name, department_id, homeroom_teacher_id, school_year) VALUES
('CNTT-K18A', 'CNTT K18A', 1, 2, '2024-2025'),
('CNTT-K18B', 'CNTT K18B', 1, 2, '2024-2025'),
('QTKD-K18A', 'QTKD K18A', 2, 3, '2024-2025');

INSERT INTO students (
    student_code, full_name, date_of_birth, gender, email, phone, address,
    department_id, class_id, gpa, absences, tuition_debt, scholarship,
    risk_percentage, risk_level, actual_status, enrollment_year, note
) VALUES
('SV001', 'Nguyễn Minh An', '2006-03-12', 'Male', 'sv001@example.com', '0900000001', 'TP.HCM', 1, 1, 3.50, 2, 0, 1, 8.50, 'Safe', 'Enrolled', 2024, 'Ổn định'),
('SV002', 'Trần Ngọc Bình', '2006-08-21', 'Female', 'sv002@example.com', '0900000002', 'Bình Dương', 1, 1, 1.20, 18, 1, 0, 88.00, 'Danger', 'Dropout', 2024, 'Rủi ro rất cao'),
('SV003', 'Lê Quốc Cường', '2006-11-02', 'Male', 'sv003@example.com', '0900000003', 'Đồng Nai', 2, 3, 2.10, 10, 1, 0, 55.00, 'Warning', 'Enrolled', 2024, 'Cần theo dõi');

INSERT INTO semesters (academic_year, semester_no, semester_name, start_date, end_date, is_closed) VALUES
('2023-2024', 1, 'Học kỳ 1 năm học 2023-2024', '2023-09-01', '2024-01-15', 1),
('2023-2024', 2, 'Học kỳ 2 năm học 2023-2024', '2024-02-01', '2024-06-15', 1),
('2024-2025', 1, 'Học kỳ 1 năm học 2024-2025', '2024-09-01', '2025-01-15', 1),
('2024-2025', 2, 'Học kỳ 2 năm học 2024-2025', '2025-02-01', '2025-06-15', 0);

INSERT INTO student_academic_records (
    student_id, semester_id, gpa, absences, tuition_debt, scholarship,
    failed_subjects, credits_enrolled, credits_passed, warning_level,
    risk_percentage, risk_level, actual_dropout_status, notes
) VALUES
(1, 1, 3.20, 2, 0, 1, 0, 20, 20, 0, 12.00, 'Safe', 'Enrolled', 'Học ổn định'),
(1, 2, 3.45, 1, 0, 1, 0, 21, 21, 0, 9.50, 'Safe', 'Enrolled', 'Tiến bộ tốt'),
(1, 3, 3.50, 2, 0, 1, 0, 19, 19, 0, 8.50, 'Safe', 'Enrolled', 'Ổn định'),

(2, 1, 2.10, 8, 1, 0, 2, 20, 14, 1, 45.00, 'Warning', 'Enrolled', 'Bắt đầu có rủi ro'),
(2, 2, 1.60, 14, 1, 0, 3, 20, 10, 2, 72.00, 'Danger', 'Enrolled', 'Giảm mạnh'),
(2, 3, 1.20, 18, 1, 0, 4, 18, 7, 2, 88.00, 'Danger', 'Dropout', 'Bỏ học sau HK1 2024-2025'),

(3, 1, 2.60, 5, 0, 0, 1, 19, 17, 0, 25.00, 'Safe', 'Enrolled', 'Tương đối ổn'),
(3, 2, 2.30, 8, 1, 0, 1, 20, 15, 1, 42.00, 'Warning', 'Enrolled', 'Có dấu hiệu giảm'),
(3, 3, 2.10, 10, 1, 0, 2, 18, 13, 1, 55.00, 'Warning', 'Enrolled', 'Cần theo dõi');

INSERT INTO ml_model_versions (
    model_name, version_label, algorithm, dataset_source, target_type,
    metrics_json, artifact_path, is_production, created_by_user_id, note
) VALUES
(
    'Student Dropout Predictor',
    'xgboost_v1',
    'XGBoost',
    'kaggle',
    'binary',
    JSON_OBJECT('accuracy', 0.89, 'f1_score', 0.87, 'recall', 0.85, 'precision', 0.88),
    'ai_core/artifacts/xgboost_v1.pkl',
    1,
    1,
    'Phiên bản benchmark ban đầu được chọn sau khi so sánh 4 mô hình'
);

INSERT INTO retrain_jobs (
    requested_by_user_id, source_dataset, algorithm, status,
    old_model_version_id, new_model_version_id,
    started_at, finished_at, log_text
) VALUES
(
    1, 'kaggle', 'XGBoost', 'success',
    1, 1,
    NOW(), NOW(),
    'Job khởi tạo mẫu cho luận văn'
);

-- =========================================================
-- TRIGGER: đồng bộ snapshot mới nhất từ student_academic_records -> students
-- =========================================================
DELIMITER $$

CREATE TRIGGER trg_sar_after_insert
AFTER INSERT ON student_academic_records
FOR EACH ROW
BEGIN
    UPDATE students
    SET
        gpa = NEW.gpa,
        absences = NEW.absences,
        tuition_debt = NEW.tuition_debt,
        scholarship = NEW.scholarship,
        risk_percentage = NEW.risk_percentage,
        risk_level = NEW.risk_level,
        actual_status = NEW.actual_dropout_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.student_id;
END$$

CREATE TRIGGER trg_sar_after_update
AFTER UPDATE ON student_academic_records
FOR EACH ROW
BEGIN
    UPDATE students
    SET
        gpa = NEW.gpa,
        absences = NEW.absences,
        tuition_debt = NEW.tuition_debt,
        scholarship = NEW.scholarship,
        risk_percentage = NEW.risk_percentage,
        risk_level = NEW.risk_level,
        actual_status = NEW.actual_dropout_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.student_id;
END$$

DELIMITER ;

-- =========================================================
-- VIEW: training dataset từ dữ liệu local MySQL
-- =========================================================
CREATE OR REPLACE VIEW vw_student_training_dataset AS
SELECT
    sar.id AS academic_record_id,
    s.id AS student_id,
    s.student_code,
    s.full_name,
    s.gender,
    s.department_id,
    s.class_id,
    sem.id AS semester_id,
    sem.academic_year,
    sem.semester_no,

    sar.gpa,
    sar.absences,
    sar.tuition_debt,
    sar.scholarship,
    sar.failed_subjects,
    sar.credits_enrolled,
    sar.credits_passed,
    sar.warning_level,

    COALESCE(prev.gpa, sar.gpa) AS prev_gpa,
    (sar.gpa - COALESCE(prev.gpa, sar.gpa)) AS gpa_delta,
    (sar.absences - COALESCE(prev.absences, sar.absences)) AS absences_delta,

    CASE
        WHEN sar.credits_enrolled > 0
            THEN ROUND(sar.credits_passed / sar.credits_enrolled, 4)
        ELSE 0
    END AS pass_rate,

    sar.risk_percentage,
    sar.risk_level,
    sar.actual_dropout_status,

    CASE
        WHEN sar.actual_dropout_status = 'Dropout' THEN 1
        ELSE 0
    END AS target_binary

FROM student_academic_records sar
JOIN students s ON s.id = sar.student_id
JOIN semesters sem ON sem.id = sar.semester_id

LEFT JOIN student_academic_records prev
    ON prev.student_id = sar.student_id
   AND prev.semester_id = (
        SELECT MAX(p.semester_id)
        FROM student_academic_records p
        WHERE p.student_id = sar.student_id
          AND p.semester_id < sar.semester_id
   );

-- =========================================================
-- VIEW: Kaggle -> Binary
-- Dropout = 1, còn lại = 0
-- =========================================================
CREATE OR REPLACE VIEW vw_kaggle_binary_training AS
SELECT
    id,
    marital_status,
    application_mode,
    application_order,
    course,
    daytime_evening_attendance,
    previous_qualification,
    previous_qualification_grade,
    nacionality,
    mothers_qualification,
    fathers_qualification,
    mothers_occupation,
    fathers_occupation,
    admission_grade,
    displaced,
    educational_special_needs,
    debtor,
    tuition_fees_up_to_date,
    gender,
    scholarship_holder,
    age_at_enrollment,
    international,
    curricular_units_1st_sem_credited,
    curricular_units_1st_sem_enrolled,
    curricular_units_1st_sem_evaluations,
    curricular_units_1st_sem_approved,
    curricular_units_1st_sem_grade,
    curricular_units_1st_sem_without_evaluations,
    curricular_units_2nd_sem_credited,
    curricular_units_2nd_sem_enrolled,
    curricular_units_2nd_sem_evaluations,
    curricular_units_2nd_sem_approved,
    curricular_units_2nd_sem_grade,
    curricular_units_2nd_sem_without_evaluations,
    unemployment_rate,
    inflation_rate,
    gdp,
    target,
    CASE
        WHEN LOWER(target) = 'dropout' THEN 1
        ELSE 0
    END AS target_binary
FROM kaggle_raw_students;

-- =========================================================
-- VIEW: Kaggle -> Multiclass
-- Dropout=0, Enrolled=1, Graduate=2
-- =========================================================
CREATE OR REPLACE VIEW vw_kaggle_multiclass_training AS
SELECT
    id,
    marital_status,
    application_mode,
    application_order,
    course,
    daytime_evening_attendance,
    previous_qualification,
    previous_qualification_grade,
    nacionality,
    mothers_qualification,
    fathers_qualification,
    mothers_occupation,
    fathers_occupation,
    admission_grade,
    displaced,
    educational_special_needs,
    debtor,
    tuition_fees_up_to_date,
    gender,
    scholarship_holder,
    age_at_enrollment,
    international,
    curricular_units_1st_sem_credited,
    curricular_units_1st_sem_enrolled,
    curricular_units_1st_sem_evaluations,
    curricular_units_1st_sem_approved,
    curricular_units_1st_sem_grade,
    curricular_units_1st_sem_without_evaluations,
    curricular_units_2nd_sem_credited,
    curricular_units_2nd_sem_enrolled,
    curricular_units_2nd_sem_evaluations,
    curricular_units_2nd_sem_approved,
    curricular_units_2nd_sem_grade,
    curricular_units_2nd_sem_without_evaluations,
    unemployment_rate,
    inflation_rate,
    gdp,
    target,
    CASE
        WHEN LOWER(target) = 'dropout' THEN 0
        WHEN LOWER(target) = 'enrolled' THEN 1
        WHEN LOWER(target) = 'graduate' THEN 2
        ELSE NULL
    END AS target_multiclass
FROM kaggle_raw_students;

SET FOREIGN_KEY_CHECKS = 1;