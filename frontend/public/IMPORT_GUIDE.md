# Hướng dẫn Import Sinh Viên

## Cấu trúc File Excel/CSV

File import phải có các cột sau (bắt buộc và tùy chọn):

### Cột Bắt Buộc:
- **semester_no** (1/2/3): Học kỳ import (1=HK1, 2=HK2, 3=HKHè)
  - Chỉ nhập dữ liệu cho học kỳ đã **kết thúc** mới có kết quả các thuộc tính để tổng hợp
  - Hệ thống sẽ tự tìm học kỳ tương ứng trong cơ sở dữ liệu
- **student_code**: Mã sinh viên (duy nhất)
- **full_name**: Họ tên đầy đủ
- **class_code** hoặc **class_name**: Mã hoặc tên lớp

### Cột Tùy Chọn (để trống nếu không có):
- gender: Giới tính (0=Nữ, 1=Nam)
- date_of_birth: Ngày sinh (YYYY-MM-DD)
- email: Email
- phone: Điện thoại
- address: Địa chỉ
- gpa: Điểm trung bình
- absences: Số buổi vắng
- tuition_debt: Nợ học phí (0/1)
- scholarship: Học bổng (0/1)
- failed_subjects: Số môn trượt
- credits_enrolled: Số tín chỉ đăng ký
- credits_passed: Số tín chỉ đạt
- warning_level: Mức cảnh báo
- risk_percentage: Tỷ lệ rủi ro (%)
- risk_level: Mức rủi ro (Safe/Warning/Danger)
- actual_status: Trạng thái (Enrolled/Dropout/Graduated)
- enrollment_year: Năm nhập học
- note: Ghi chú

## Lưu ý Quan Trọng:

### Về Học Kỳ:
- Chỉ khi học kỳ **kết thúc** mới có kết quả các thuộc tính (GPA, vắng, môn trượt, v.v.)
- Nếu nhập dữ liệu cho học kỳ chưa kết thúc, sử dụng giá trị dự đoán từ lần trước
- Học kỳ phải tồn tại trong bảng `semesters` của hệ thống

### Về Lớp:
- Nếu có cột `class_code`, sẽ ưu tiên tìm theo mã lớp
- Nếu không tìm được `class_code`, sẽ tìm theo `class_name`
- Nếu cả hai đều có, cũng chỉ cần một cái thôi

### Về Dữ Liệu:
- Nếu sinh viên đã tồn tại (cùng `student_code`), sẽ cập nhật thông tin
- Nếu sinh viên chưa tồn tại, sẽ tạo mới
- Các trường số sẽ tự động chuyển đổi (0/1 cho boolean, số thập phân cho GPA)

## File Mẫu:
- CSV: `sample_students_import_template.csv`
- Bạn có thể tải về, chỉnh sửa, rồi upload lại để import

## Ví Dụ Import 2 Học Kỳ:

Trong cùng 1 file, bạn có thể import cả HK1 và HK2:
```
semester_no,student_code,full_name,class_code,...
1,SV001,Nguyễn Văn A,CNTT001,...
1,SV002,Trần Thị B,CNTT001,...
2,SV001,Nguyễn Văn A,CNTT001,...  <- Dữ liệu HK2 của sinh viên SV001
2,SV002,Trần Thị B,CNTT001,...
```

Hệ thống sẽ tự động xử lý từng dòng theo học kỳ tương ứng.
