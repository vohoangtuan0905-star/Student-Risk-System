#  Hệ thống Quản lý và Dự báo Nguy cơ Bỏ học của Sinh viên (Student Dropout Prediction System)

##  Giới thiệu (Introduction)
Dự án cung cấp giải pháp chuyển đổi số cho phòng đào tạo, biến dữ liệu điểm số, điểm danh và học phí thành công cụ cảnh báo rủi ro học vụ. Bằng việc kết hợp hệ thống Web Fullstack và các thuật toán Học máy (Machine Learning), hệ thống giúp nhà trường nhận diện sớm sinh viên có nguy cơ bỏ học để kịp thời can thiệp.

##  Tính năng nổi bật (Key Features)
- **Quản lý phân cấp:** Quản lý cấu trúc dữ liệu theo Khoa -> Lớp -> Sinh viên.
- **Phân quyền (RBAC):** Admin (Phòng đào tạo) toàn quyền quản lý; Teacher (Cố vấn học tập) chỉ xem được dữ liệu lớp mình phụ trách.
- **Tích hợp AI dự báo:** Tự động phân tích file Excel hàng ngàn sinh viên, trả về tỷ lệ rủi ro bỏ học (%) trong vài giây.
- **Dashboard trực quan:** Thống kê mức độ rủi ro toàn trường và theo từng Khoa thông qua biểu đồ.
- **Retrain Model (MLOps):** Tính năng cho phép Admin chủ động cập nhật và huấn luyện lại mô hình AI bằng dữ liệu của học kỳ mới.

##  Phương pháp Trí tuệ nhân tạo (AI Methodology)
Hệ thống KHÔNG sử dụng API bên ngoài mà tự huấn luyện mô hình (Local Training).
1. **Model Benchmarking:** So sánh 4 thuật toán (Logistic Regression, SVM, Random Forest, XGBoost) bằng K-Fold Cross Validation.
2. **Evaluation:** Đánh giá tối ưu hóa tỷ lệ False Negative (Bỏ sót sinh viên nguy cơ) bằng Confusion Matrix.
3. **Core Model:** Thuật toán **XGBoost** được lựa chọn làm nòng cốt nhờ tốc độ xử lý nhanh và độ chính xác cao nhất.

##  Công nghệ sử dụng (Tech Stack)
- **Frontend:** ReactJS, Tailwind CSS, Recharts (Vẽ biểu đồ), Axios.
- **Backend:** Node.js, Express.js, JWT (Authentication), Multer (Upload Excel).
- **Database:** MySQL.
- **AI Core:** Python, Pandas, Scikit-learn, XGBoost, Joblib.

##  Hướng dẫn cài đặt (Setup Instructions)
*(Sẽ cập nhật chi tiết các lệnh `npm install` và `pip install` trong quá trình phát triển)*