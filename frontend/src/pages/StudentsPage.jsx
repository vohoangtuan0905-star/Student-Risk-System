import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await axiosClient.get('/students');
      console.log('FETCH STUDENTS RESPONSE:', res.data);

      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log('FETCH STUDENTS ERROR:', err);
      console.log('FETCH STUDENTS RESPONSE ERROR:', err?.response?.data);

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Không thể tải danh sách sinh viên'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const code = student.student_code?.toLowerCase() || '';
      const name = student.full_name?.toLowerCase() || '';
      const keywordLower = keyword.toLowerCase();

      const matchKeyword =
        code.includes(keywordLower) || name.includes(keywordLower);

      const matchRisk =
        riskFilter === 'ALL' ? true : student.risk_level === riskFilter;

      return matchKeyword && matchRisk;
    });
  }, [students, keyword, riskFilter]);

  const getRiskClass = (riskLevel) => {
    if (riskLevel === 'Danger') return 'badge badge-danger';
    if (riskLevel === 'Warning') return 'badge badge-warning';
    return 'badge badge-safe';
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý sinh viên</h1>
          <p className="page-subtitle">
            Theo dõi hồ sơ học tập và mức độ rủi ro hiện tại
          </p>
        </div>
      </div>

      <div className="card filter-bar">
        <input
          className="input"
          type="text"
          placeholder="Tìm theo mã sinh viên hoặc họ tên..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <select
          className="select"
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
        >
          <option value="ALL">Tất cả mức rủi ro</option>
          <option value="Safe">Safe</option>
          <option value="Warning">Warning</option>
          <option value="Danger">Danger</option>
        </select>

        <button className="btn btn-primary" onClick={fetchStudents}>
          Làm mới
        </button>
      </div>

      <div className="card">
        {loading && <div className="loading">Đang tải danh sách sinh viên...</div>}

        {!loading && error && (
          <div className="empty-state" style={{ color: 'red' }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <strong>Tổng số sinh viên hiển thị:</strong> {filteredStudents.length}
            </div>

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã SV</th>
                    <th>Họ tên</th>
                    <th>Giới tính</th>
                    <th>Khoa</th>
                    <th>Lớp</th>
                    <th>GPA</th>
                    <th>Vắng</th>
                    <th>Học phí</th>
                    <th>Học bổng</th>
                    <th>Rủi ro (%)</th>
                    <th>Mức rủi ro</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="13" className="empty-state">
                        Không có dữ liệu phù hợp
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td>{student.student_code || '-'}</td>
                        <td>{student.full_name || '-'}</td>
                        <td>{student.gender || '-'}</td>
                        <td>{student.department_name || '-'}</td>
                        <td>{student.class_name || '-'}</td>
                        <td>{student.gpa ?? '-'}</td>
                        <td>{student.absences ?? '-'}</td>
                        <td>{Number(student.tuition_debt) === 1 ? 'Có nợ' : 'Đã đủ'}</td>
                        <td>{Number(student.scholarship) === 1 ? 'Có' : 'Không'}</td>
                        <td>
                          {student.risk_percentage != null
                            ? Number(student.risk_percentage).toFixed(2)
                            : '-'}
                        </td>
                        <td>
                          <span className={getRiskClass(student.risk_level || 'Safe')}>
                            {student.risk_level || 'Safe'}
                          </span>
                        </td>
                        <td>{student.actual_status || '-'}</td>
                        <td>
                          <button
                            className="btn btn-secondary"
                            onClick={() => navigate(`/students/${student.id}`)}
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}