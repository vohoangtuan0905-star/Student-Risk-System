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

      const [historyRes, recordsRes] = await Promise.all([
        axiosClient.get(`/students/${id}/history`),
        axiosClient.get(`/academic-records/student/${id}`)
      ]);

      console.log('HISTORY RESPONSE:', historyRes.data);
      console.log('RECORDS RESPONSE:', recordsRes.data);

      const studentData = historyRes.data?.student || null;
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
      console.log('FETCH STUDENT DETAIL ERROR:', err);
      console.log('FETCH STUDENT DETAIL RESPONSE:', err?.response?.data);

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

  const handlePredictAgain = async () => {
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

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading">Đang tải chi tiết sinh viên...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="card">
          <p style={{ color: 'red' }}>{error}</p>
          <div style={{ marginTop: '16px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/students')}>
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="page-wrapper">
        <div className="empty-state">Không tìm thấy thông tin sinh viên</div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Chi tiết sinh viên</h1>
          <p className="page-subtitle">
            Theo dõi hồ sơ, lịch sử học tập và kết quả AI theo học kỳ
          </p>
        </div>
      </div>

      <div className="card detail-grid">
        <div>
          <h3 className="section-title">Thông tin cơ bản</h3>
          <div className="detail-info-grid">
            <div><strong>Mã SV:</strong> {student.student_code || '-'}</div>
            <div><strong>Họ tên:</strong> {student.full_name || '-'}</div>
            <div><strong>Giới tính:</strong> {student.gender || '-'}</div>
            <div><strong>Khoa:</strong> {student.department_name || '-'}</div>
            <div><strong>Lớp:</strong> {student.class_name || '-'}</div>
            <div><strong>Email:</strong> {student.email || '-'}</div>
            <div><strong>Năm nhập học:</strong> {student.enrollment_year || '-'}</div>
            <div><strong>Tuổi nhập học:</strong> {student.age_at_enrollment || '-'}</div>
            <div><strong>Trạng thái:</strong> {student.actual_status || '-'}</div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__label">GPA hiện tại</div>
          <div className="stat-card__value">{latestRecord?.gpa ?? student.gpa ?? '-'}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__label">Rủi ro (%)</div>
          <div className="stat-card__value">
            {student.risk_percentage != null
              ? Number(student.risk_percentage).toFixed(2)
              : '-'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__label">Mức rủi ro</div>
          <div className="stat-card__value">
            <span className={getRiskClass(student.risk_level || 'Safe')}>
              {student.risk_level || 'Safe'}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__label">Warning level</div>
          <div className="stat-card__value">
            {latestRecord?.warning_level ?? '-'}
          </div>
        </div>
      </div>

      <div className="card action-bar">
        <button
          className="btn btn-primary"
          onClick={handlePredictAgain}
          disabled={predicting}
        >
          {predicting ? 'Đang dự đoán...' : 'Dự đoán lại AI'}
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => navigate('/students')}
        >
          Quay lại danh sách
        </button>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h3 className="section-title">Biểu đồ GPA theo học kỳ</h3>
          <div style={{ width: '100%', height: 320 }}>
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
          <h3 className="section-title">Biểu đồ Risk % theo học kỳ</h3>
          <div style={{ width: '100%', height: 320 }}>
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
        <h3 className="section-title">Lịch sử học tập theo học kỳ</h3>

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
                        {item.risk_level || 'Safe'}
                      </span>
                    </td>
                    <td>{item.actual_dropout_status || item.actual_status || '-'}</td>
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