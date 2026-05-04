# STUDENT RISK SYSTEM - MASTER ROADMAP HOÀN THIỆN LUẬN VĂN

## 1. Mục đích của tài liệu này

Tài liệu này là bản chốt cuối cùng để tiếp tục hoàn thiện đồ án tốt nghiệp **Student Risk System - Hệ thống dự báo rủi ro sinh viên bỏ học** theo hướng **đủ mạnh cho luận văn tốt nghiệp mức 9–10 điểm**.

Tài liệu này dùng để:
- tổng hợp lại toàn bộ những gì đã làm
- xác định chính xác những gì còn thiếu
- khóa phạm vi dự án, không mở rộng lan man nữa
- đưa ra lộ trình theo ngày để bám vào làm tiếp
- làm chuẩn chung để AI hoặc người hỗ trợ khác có thể tiếp tục hướng dẫn đúng mạch

---

# 2. Mô tả ngắn gọn dự án

Student Risk System là một hệ thống quản trị giáo dục có tích hợp trí tuệ nhân tạo nhằm hỗ trợ nhà trường:
- quản lý khoa, lớp, học kỳ, tài khoản, sinh viên
- lưu trữ lịch sử học tập theo từng học kỳ
- phát hiện sớm sinh viên có nguy cơ bỏ học
- trực quan hóa mức độ rủi ro
- hỗ trợ dự đoán trên giao diện web
- hỗ trợ huấn luyện lại mô hình theo chu kỳ
- quản lý version mô hình và lịch sử retrain

Hệ thống được xây dựng theo mô hình 3 khối:
- **Frontend**: React
- **Backend**: Node.js / Express.js
- **AI Core**: Python
- **Database**: MySQL

---

# 3. Trạng thái hiện tại của dự án

## 3.1. Những phần đã hoàn thành chắc nền tảng

## Kiến trúc
- đã tách dự án thành:
  - `frontend`
  - `backend`
  - `ai_core`

## Database
- đã có các bảng lõi:
  - `departments`
  - `classes`
  - `users`
  - `students`
  - `semesters`
  - `student_academic_records`
- đã có các bảng AI:
  - `ml_model_versions`
  - `retrain_jobs`
  - `kaggle_demo_sync`
  - `kaggle_raw_students`
- đã có các view training / dataset phục vụ AI

## Backend
- đã cấu hình `.env`
- đã kết nối MySQL
- đã có JWT authentication
- đã có bcrypt
- đã có middleware bảo vệ route
- đã có CRUD nền cho khoa và lớp
- đã có API lịch sử sinh viên theo học kỳ
- đã có API predict AI
- đã có API predict theo `student_id`
- đã có API retrain mô hình

## AI Core
- đã có bộ dữ liệu train
- đã so sánh 4 mô hình:
  - Logistic Regression
  - SVM
  - Random Forest
  - XGBoost
- đã chọn mô hình triển khai
- đã có `best_model.pkl`
- đã có script predict
- đã có script retrain
- đã có version hóa mô hình
- đã có retrain jobs

## Frontend
- đã đăng nhập được
- đã có route bảo vệ
- đã có layout quản trị cơ bản
- đã có hướng triển khai các page chính:
  - Dashboard
  - Students
  - Student Detail
  - Semesters
  - AI & Retrain

---

## 3.2. Những phần đã làm nhưng chưa được coi là hoàn chỉnh

## Database runtime
- database runtime hiện đang dùng là: `student_risk_db`
- file SQL gốc lại đang đặt là: `student_risk_system`
- cần thống nhất lại trong tài liệu và file backup

## Foreign key
- file SQL gốc có thiết kế khóa ngoại
- nhưng runtime database cần kiểm tra lại và bổ sung cho chắc nếu đang thiếu

## Dashboard
- đã có code
- nhưng từng phát sinh lỗi kiểu dữ liệu khi render
- cần sửa sạch và ổn định hoàn toàn

## Các page frontend chính
Các page sau đã có hướng hoặc một phần code, nhưng chưa coi là xong:
- `DashboardPage`
- `StudentsPage`
- `StudentDetailPage`
- `SemestersPage`
- `AIManagementPage`

---

## 3.3. Những phần còn thiếu nếu muốn đủ tầm luận văn 9–10 điểm

Đây là phần bắt buộc phải bổ sung.

### Thiếu về nghiệp vụ
- quản lý tài khoản người dùng
- phân quyền rõ ràng theo vai trò
- import Excel
- export Excel
- quản lý khoa trên frontend
- quản lý lớp trên frontend

### Thiếu về giao diện
- `DepartmentsPage`
- `ClassesPage`
- `UsersPage`
- giao diện import/export
- trạng thái loading / empty / error đồng bộ hơn

### Thiếu về đóng gói luận văn
- README chuẩn
- báo cáo Word
- slide
- ảnh minh họa
- bộ câu hỏi phản biện
- phần hướng phát triển tương lai

---

# 4. Phạm vi chốt cuối cùng của hệ thống

Từ bây giờ **không sửa phạm vi nữa**.  
Phạm vi cuối cùng được chốt như sau.

---

## 4.1. Module xác thực và phân quyền
Phải có:
- đăng nhập
- lưu token
- route bảo vệ
- đăng xuất
- vai trò người dùng

### Vai trò tối thiểu phải có
- `Admin`
- `Lecturer` hoặc `GiaoVu`

### Quyền đề xuất
#### Admin
- quản lý tài khoản
- quản lý khoa, lớp, học kỳ
- quản lý sinh viên
- import / export dữ liệu
- predict AI
- retrain mô hình

#### Lecturer / Giáo vụ
- xem danh sách sinh viên
- xem chi tiết sinh viên
- xem lịch sử học tập
- predict AI
- không được quản lý tài khoản
- không được retrain nếu không có quyền

---

## 4.2. Module dữ liệu nền
Phải có giao diện và backend cho:
- khoa
- lớp
- học kỳ
- sinh viên

---

## 4.3. Module sinh viên
Phải có:
- danh sách sinh viên
- tìm kiếm
- lọc theo risk level
- xem chi tiết
- lịch sử học tập theo học kỳ
- biểu đồ GPA
- biểu đồ Risk %
- nút dự đoán lại AI

---

## 4.4. Module import / export Excel
Phải có:

### Import
- import danh sách sinh viên từ Excel
- import dữ liệu học tập theo học kỳ từ Excel

### Export
- export danh sách sinh viên
- export danh sách sinh viên rủi ro
- export lịch sử học tập của một sinh viên

---

## 4.5. Module AI
Phải có:
- card mô hình hiện tại
- predict theo `student_id`
- predict theo `student_id + semester_id`
- hiển thị xác suất bỏ học
- hiển thị mức rủi ro
- retrain từ frontend
- hiển thị metrics lần retrain gần nhất
- version hóa model trong database

---

## 4.6. Module dashboard
Phải có:
- tổng số sinh viên
- số lượng Safe / Warning / Danger
- top sinh viên rủi ro cao
- mô hình AI hiện tại
- học kỳ gần nhất
- nút điều hướng nhanh

---

# 5. Danh sách giao diện cuối cùng phải có

## 5.1. Bắt buộc
1. `LoginPage.jsx`
2. `DashboardPage.jsx`
3. `StudentsPage.jsx`
4. `StudentDetailPage.jsx`
5. `SemestersPage.jsx`
6. `DepartmentsPage.jsx`
7. `ClassesPage.jsx`
8. `UsersPage.jsx`
9. `AIManagementPage.jsx`
10. `NotFoundPage.jsx`

## 5.2. Rất nên có
11. `ImportPage.jsx` hoặc section import trong `StudentsPage`
12. `ExportCenterPage.jsx` hoặc nút export trên từng trang
13. `ModelVersionsPage.jsx` nếu còn thời gian

---

# 6. Thành phần dùng chung phải có

## Layout
- `src/layouts/AdminLayout.jsx`

## CSS dùng chung
- `src/index.css`

## Component dùng chung nên có
- `ProtectedRoute.jsx`
- `PageHeader.jsx`
- `StatCard.jsx`
- `SearchFilterBar.jsx`
- `LoadingSpinner.jsx`
- `EmptyState.jsx`
- `ConfirmModal.jsx`

---

# 7. Những việc kỹ thuật bắt buộc phải xử lý trước

## 7.1. Sửa sạch frontend crash
Phải rà toàn bộ các lỗi dạng:
- `.toFixed()` trên string
- `.toFixed()` trên null
- object undefined
- render khi API chưa có dữ liệu

Phải kiểm tra kỹ:
- `DashboardPage`
- `StudentsPage`
- `StudentDetailPage`
- `SemestersPage`
- `AIManagementPage`

---

## 7.2. Chuẩn hóa database runtime
Phải chốt:
- database runtime dùng: `student_risk_db`

Phải đồng bộ trong:
- `backend/.env`
- `ai_core/.env`
- file SQL backup
- README
- báo cáo

---

## 7.3. Bổ sung foreign key cho runtime DB
Phải bổ sung / xác nhận đầy đủ foreign key cho:
- `users -> departments`
- `classes -> departments`
- `classes -> users`
- `students -> departments`
- `students -> classes`
- `student_academic_records -> students`
- `student_academic_records -> semesters`
- `ml_model_versions -> users`
- `retrain_jobs -> users`
- `retrain_jobs -> ml_model_versions`

---

## 7.4. Chốt feature set deploy
Hiện còn lệch:
- dataset train rút gọn có `age_at_enrollment`
- database demo hiện chưa có cột này

Phải chọn một trong hai:
1. thêm `age_at_enrollment` vào database runtime
2. hoặc bỏ feature này khỏi model deploy

**Khuyến nghị để triển khai gọn và bảo vệ chắc:**  
chốt một feature set deploy đúng với những gì database runtime thực sự hỗ trợ.

---

# 8. Danh sách những gì còn thiếu tính đến hiện tại

Dựa trên những gì đã làm, hiện tại còn thiếu hoặc chưa hoàn thiện các mục sau:

## A. Còn thiếu chắc chắn
- `DepartmentsPage`
- `ClassesPage`
- `UsersPage`
- import Excel
- export Excel
- phân quyền giao diện theo role
- kiểm soát chức năng theo role

## B. Có rồi nhưng chưa chốt
- `DashboardPage`
- `StudentsPage`
- `StudentDetailPage`
- `SemestersPage`
- `AIManagementPage`

## C. Cần làm sạch và khóa lại
- database runtime
- foreign key
- `.env`
- feature set AI deploy
- dữ liệu demo

---

# 9. Lộ trình theo ngày từ bây giờ

Đây là lộ trình cuối cùng để bám vào làm tiếp.

---

## Ngày 19 - Ổn định frontend và sửa sạch lỗi render
### Mục tiêu
Toàn bộ frontend không được crash.

### Việc cần làm
- sửa DashboardPage
- fix toàn bộ chỗ `.toFixed()`
- fix render với dữ liệu null / undefined
- kiểm tra route `/students/:id`
- kiểm tra loading / empty / error state cơ bản

### Kết quả phải đạt
- login xong vào dashboard ổn
- bấm các menu không vỡ
- không còn lỗi console nghiêm trọng

