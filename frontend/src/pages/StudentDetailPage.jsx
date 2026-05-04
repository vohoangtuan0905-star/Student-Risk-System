import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19h16" />
    <path d="M6 16V8" />
    <path d="M12 16V4" />
    <path d="M18 16v-6" />
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconXCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

function StatCard({ label, value, color, icon: Icon, helper }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className={`stat-card__icon stat-card__icon--${color}`}>
        <Icon />
      </div>
      <div className="stat-card__body">
        <div className="stat-card__value">{value}</div>
        <div className="stat-card__label">{label}</div>
        {helper ? <div className="metric-note">{helper}</div> : null}
      </div>
    </div>
  );
}

export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState('');

  const fetchStudentDetail = async () => {
    try {
      setLoading(true);
      setError('');

      const [studentRes, historyRes, recordsRes] = await Promise.all([
        axiosClient.get(`/students/${id}`),
        axiosClient.get(`/students/${id}/history`),
        axiosClient.get(`/academic-records/student/${id}`)
      ]);

      const studentData = studentRes.data || historyRes.data?.student || null;
      const historyData = Array.isArray(historyRes.data?.history)
        ? historyRes.data.history
        : [];
      const recordsData = Array.isArray(recordsRes.data)
        ? recordsRes.data
        : [];

      setStudent(studentData);
      setHistory(historyData);
      setRecords(recordsData);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Không thể tải chi tiết sinh viên'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDetail();
  }, [id]);

  const hasAcademicData = (records.length > 0 ? records : history).length > 0;

  const handlePredictAgain = async () => {
    if (!hasAcademicData) {
      alert('Sinh viên chưa có bản ghi học tập theo học kỳ. Hãy tạo academic record trước khi dự đoán AI.');
      return;
    }

    try {
      setPredicting(true);

      const res = await axiosClient.post(`/ai/predict-by-student/${id}`, {});
      console.log('PREDICT AGAIN RESPONSE:', res.data);

      await fetchStudentDetail();
      alert('Dự đoán lại AI thành công');
    } catch (err) {
      console.log('PREDICT AGAIN ERROR:', err);
      console.log('PREDICT AGAIN RESPONSE:', err?.response?.data);

      alert(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Dự đoán lại AI thất bại'
      );
    } finally {
      setPredicting(false);
    }
  };

  const chartData = useMemo(() => {
    const source = records.length > 0 ? records : history;

    return source.map((item, index) => ({
      semester:
        item.semester_name ||
        item.semester_label ||
        `Kỳ ${index + 1}`,
      gpa: Number(item.gpa || 0),
      risk_percentage: Number(item.risk_percentage || 0)
    }));
  }, [records, history]);

  const latestRecord = useMemo(() => {
    const source = records.length > 0 ? records : history;
    if (!source.length) return null;
    return source[0];
  }, [records, history]);

  const getRiskClass = (riskLevel) => {
    if (riskLevel === 'Danger') return 'badge badge-danger';
    if (riskLevel === 'Warning') return 'badge badge-warning';
    return 'badge badge-safe';
  };

  const getRiskLabel = (riskLevel) => {
    if (riskLevel === 'Danger') return 'Nguy hiểm';
    if (riskLevel === 'Warning') return 'Cảnh báo';
    if (riskLevel === 'Safe') return 'An toàn';
    return riskLevel || '-';
  };

  const getGenderLabel = (gender) => {
    if (gender === 'Male') return 'Nam';
    if (gender === 'Female') return 'Nữ';
    return 'Khác';
  };

  const getStatusLabel = (status) => {
    if (status === 'Enrolled') return 'Đang học';
    if (status === 'Dropout') return 'Đã bỏ học';
    if (status === 'Graduated') return 'Đã tốt nghiệp';
    return status || '-';
  };

  const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return new Intl.DateTimeFormat('vi-VN').format(d);
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading loading--flex">
          <div className="loading__spinner" />
          Đang tải chi tiết sinh viên...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="card">
          <div className="empty-state empty-state--compact">
            <div className="empty-state__icon">
              <IconAlert />
            </div>
            <div className="empty-state__title">Không thể tải chi tiết sinh viên</div>
            <div className="empty-state__desc">{error}</div>
          </div>
          <div className="action-bar action-bar--center empty-state--action">
            <button className="btn btn-secondary" onClick={() => navigate('/students')}>
              <IconArrowLeft />
              Quay lại danh sách
            </button>
            <button className="btn btn-primary" onClick={fetchStudentDetail}>
              <IconRefresh />
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="page-wrapper">
        <div className="empty-state empty-state--compact">Không tìm thấy thông tin sinh viên</div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-header__content">
          <h1 className="page-title">Chi tiết sinh viên</h1>
          <p className="page-subtitle">Theo dõi hồ sơ, lịch sử học tập và kết quả AI theo học kỳ</p>
        </div>

        <div className="page-header__actions">
          <button className="btn btn-secondary" onClick={() => navigate('/students')}>
            <IconArrowLeft />
            Quay lại
          </button>
          <button className="btn btn-primary" onClick={handlePredictAgain} disabled={predicting}>
            <IconRefresh />
            {predicting ? 'Đang dự đoán...' : 'Dự đoán lại AI'}
          </button>
        </div>
      </div>

      {!hasAcademicData ? (
        <div className="card" style={{ borderColor: 'var(--yellow-300)', background: 'var(--yellow-50)' }}>
          <div className="empty-state empty-state--compact" style={{ margin: 0, padding: '14px 16px' }}>
            <div className="empty-state__icon" style={{ color: 'var(--yellow-700)' }}>
              <IconAlert />
            </div>
            <div className="empty-state__title">Thiếu dữ liệu học kỳ để dự đoán AI</div>
            <div className="empty-state__desc">
              Sinh viên này chưa có bản ghi trong bảng student_academic_records, nên hệ thống chưa thể chạy dự đoán lại.
            </div>
          </div>
        </div>
      ) : null}

      <div className="card">
        <div className="section-toolbar">
          <div>
            <div className="card__title">Thông tin cơ bản</div>
            <div className="card__subtitle">Thông tin cần thiết để giáo viên theo dõi và liên hệ sinh viên</div>
          </div>
        </div>

        <div className="detail-shell">
          <div className="detail-info-grid">
            <div><strong>Mã SV:</strong> {student.student_code || '-'}</div>
            <div><strong>Họ tên:</strong> {student.full_name || '-'}</div>
            <div><strong>Trạng thái:</strong> {getStatusLabel(student.actual_status)}</div>

            <div><strong>Khoa:</strong> {student.department_name || '-'}</div>
            <div><strong>Lớp:</strong> {student.class_name || '-'}</div>
            <div><strong>Năm nhập học:</strong> {student.enrollment_year ?? '-'}</div>

            <div><strong>Email:</strong> {student.email || '-'}</div>
            <div><strong>Số điện thoại:</strong> {student.phone || '-'}</div>
            <div><strong>Địa chỉ:</strong> {student.address || '-'}</div>

            <div><strong>Ngày sinh:</strong> {formatDate(student.date_of_birth)}</div>
            <div><strong>Giới tính:</strong> {getGenderLabel(student.gender)}</div>
            <div><strong>Nợ học phí:</strong> {Number(student.tuition_debt) === 1 ? 'Có' : 'Không'}</div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="GPA hiện tại" value={latestRecord?.gpa ?? student.gpa ?? '-'} color="blue" icon={IconChart} helper="Dữ liệu gần nhất theo học kỳ" />
        <StatCard label="Rủi ro (%)" value={student.risk_percentage != null ? Number(student.risk_percentage).toFixed(2) : '-'} color="yellow" icon={IconAlert} helper="Xác suất dự đoán từ mô hình" />
        <StatCard label="Mức rủi ro" value={<span className={getRiskClass(student.risk_level || 'Safe')}>{getRiskLabel(student.risk_level || 'Safe')}</span>} color={student.risk_level === 'Danger' ? 'red' : student.risk_level === 'Warning' ? 'yellow' : 'green'} icon={IconShield} helper="Phân loại theo ngưỡng hiện tại" />
        <StatCard label="Warning level" value={latestRecord?.warning_level ?? '-'} color="red" icon={IconXCircle} helper="Tín hiệu cảnh báo trong học kỳ gần nhất" />
      </div>

      <div className="card">
        <div className="section-toolbar">
          <div>
            <div className="card__title">Hành động</div>
            <div className="card__subtitle">Cập nhật kết quả AI và quay lại danh sách khi cần</div>
          </div>
        </div>

        <div className="action-bar">
          <button className="btn btn-primary" onClick={handlePredictAgain} disabled={predicting || !hasAcademicData}>
            <IconRefresh />
            {predicting ? 'Đang dự đoán...' : 'Dự đoán lại AI'}
          </button>

          <button className="btn btn-secondary" onClick={() => navigate('/students')}>
            <IconArrowLeft />
            Quay lại danh sách
          </button>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <div className="section-toolbar">
            <div>
              <h3 className="section-title section-title--tight">Biểu đồ GPA theo học kỳ</h3>
              <div className="section-toolbar__meta">So sánh biến động điểm trung bình qua từng kỳ</div>
            </div>
          </div>
          <div className="chart-card__body">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semester" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="gpa" name="GPA" stroke="#2563eb" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="section-toolbar">
            <div>
              <h3 className="section-title section-title--tight">Biểu đồ Risk % theo học kỳ</h3>
              <div className="section-toolbar__meta">Theo dõi xác suất rủi ro từ mô hình AI</div>
            </div>
          </div>
          <div className="chart-card__body">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semester" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="risk_percentage"
                  name="Risk %"
                  stroke="#ef4444"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-toolbar">
          <div>
            <h3 className="section-title section-title--tight">Lịch sử học tập theo học kỳ</h3>
            <div className="section-toolbar__meta">Bản ghi học tập, học phí, học bổng và nhãn rủi ro</div>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Học kỳ</th>
                <th>GPA</th>
                <th>Vắng mặt</th>
                <th>Học phí</th>
                <th>Học bổng</th>
                <th>Môn trượt</th>
                <th>Tín chỉ ĐK</th>
                <th>Tín chỉ đạt</th>
                <th>Warning level</th>
                <th>Risk %</th>
                <th>Mức rủi ro</th>
                <th>Trạng thái thực tế</th>
              </tr>
            </thead>

            <tbody>
              {(records.length > 0 ? records : history).length === 0 ? (
                <tr>
                  <td colSpan="12" className="empty-state">
                    Chưa có lịch sử học tập
                  </td>
                </tr>
              ) : (
                (records.length > 0 ? records : history).map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{item.semester_name || item.semester_label || '-'}</td>
                    <td>{item.gpa ?? '-'}</td>
                    <td>{item.absences ?? '-'}</td>
                    <td>{Number(item.tuition_debt) === 1 ? 'Có nợ' : 'Đã đủ'}</td>
                    <td>{Number(item.scholarship) === 1 ? 'Có' : 'Không'}</td>
                    <td>{item.failed_subjects ?? '-'}</td>
                    <td>{item.credits_enrolled ?? '-'}</td>
                    <td>{item.credits_passed ?? '-'}</td>
                    <td>{item.warning_level ?? '-'}</td>
                    <td>
                      {item.risk_percentage != null
                        ? Number(item.risk_percentage).toFixed(2)
                        : '-'}
                    </td>
                    <td>
                      <span className={getRiskClass(item.risk_level || 'Safe')}>
                        {getRiskLabel(item.risk_level || 'Safe')}
                      </span>
                    </td>
                    <td>{getStatusLabel(item.actual_dropout_status || item.actual_status || '-')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}