-- 1. Departments Table (Bảng Khoa)
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(255) NOT NULL
);

-- 2. Classes Table (Bảng Lớp học)
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(255) NOT NULL,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 3. Users Table (Bảng Tài khoản phân quyền)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher') DEFAULT 'teacher',
    department_id INT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 4. Students Table (Bảng Sinh viên - Chứa Feature cho AI)
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_code VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    
    -- AI Features (Các đặc trưng đầu vào cho mô hình)
    gender TINYINT DEFAULT 1 COMMENT '1: Male, 0: Female',
    gpa FLOAT DEFAULT 0.0,
    absences INT DEFAULT 0,
    tuition_debt TINYINT DEFAULT 0 COMMENT '1: Has debt, 0: No debt',
    scholarship TINYINT DEFAULT 0 COMMENT '1: Yes, 0: No',
    
    -- AI Predictions (Kết quả AI trả về)
    risk_percentage FLOAT NULL,
    risk_level ENUM('Safe', 'Warning', 'Danger') DEFAULT 'Safe',
    
    -- MLOps Ground Truth (Dữ liệu thực tế để Retrain Model cuối kỳ)
    actual_status ENUM('Enrolled', 'Dropout', 'Graduated') DEFAULT 'Enrolled',
    
    class_id INT,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Insert Dummy Departments
INSERT INTO departments (department_name) VALUES 
('Information Technology'), 
('Foreign Languages');

-- Insert Dummy Classes
INSERT INTO classes (class_name, department_id) VALUES 
('SE19-01', 1), 
('SE19-02', 1), 
('ENG19-01', 2);

-- Insert Dummy Users (Admin & Teacher)
INSERT INTO users (username, password_hash, role, department_id) VALUES 
('admin_it', '123456', 'admin', NULL),
('teacher_john', '123456', 'teacher', 1);

-- Insert Dummy Students (Mix of Safe and Danger cases)
INSERT INTO students (student_code, full_name, gender, gpa, absences, tuition_debt, scholarship, risk_percentage, risk_level, class_id) 
VALUES 
('IT001', 'Nguyễn Văn Tuấn', 1, 3.5, 2, 0, 1, 15.5, 'Safe', 1),
('IT002', 'Trần Thu Hà', 0, 1.2, 18, 1, 0, 85.0, 'Danger', 2),
('ENG001', 'Lê Hải Đăng', 1, 2.1, 8, 1, 0, 45.0, 'Warning', 3);