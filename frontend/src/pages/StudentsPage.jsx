import Pagination from "../components/Pagination";
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { PageHeader, EmptyPanel } from '../components/PageKit';



const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const IconUpload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

function StatCard({ label, value, color, icon: Icon, loading, helper }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className={`stat-card__icon stat-card__icon--${color}`}>
        <Icon />
      </div>
      <div className="stat-card__body">
        <div className="stat-card__value">{loading ? '—' : value}</div>
        <div className="stat-card__label">{label}</div>
        {helper ? <div className="metric-note">{helper}</div> : null}
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const normalizedRole = String(currentUser.role || '').trim().toLowerCase();
  const isTeacher = normalizedRole === 'teacher';
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [importOpen, setImportOpen] = useState(false);
  const [importStep, setImportStep] = useState(1);
  const [importFile, setImportFile] = useState(null);
  const [importColumns, setImportColumns] = useState([]);
  const [importPreview, setImportPreview] = useState([]);
  const [importMapping, setImportMapping] = useState({
    student_code: '',
    full_name: '',
    class_code: '',
    class_name: '',
    gender: '',
    date_of_birth: '',
    email: '',
    phone: '',
    address: '',
    gpa: '',
    absences: '',
    tuition_debt: '',
    scholarship: '',
    risk_percentage: '',
    risk_level: '',
    actual_status: '',
    enrollment_year: '',
    note: ''
  });
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const [importResult, setImportResult] = useState(null);

  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await axiosClient.get('/students');
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
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
    const keywordLower = keyword.toLowerCase();

    return students.filter((student) => {
      const code = student.student_code?.toLowerCase() || '';
      const name = student.full_name?.toLowerCase() || '';
      const className = student.class_name?.toLowerCase() || '';
      const departmentName = student.department_name?.toLowerCase() || '';

      const matchKeyword = code.includes(keywordLower) || name.includes(keywordLower) || className.includes(keywordLower) || departmentName.includes(keywordLower);
      const matchRisk = riskFilter === 'ALL' ? true : student.risk_level === riskFilter;
      const matchDepartment = isTeacher || departmentFilter === 'ALL'
        ? true
        : String(student.department_id) === departmentFilter;
      const matchClass = isTeacher || classFilter === 'ALL'
        ? true
        : String(student.class_id) === classFilter;

      return matchKeyword && matchRisk && matchDepartment && matchClass;
    });
  }, [students, keyword, riskFilter, departmentFilter, classFilter]);

  const departmentOptions = useMemo(() => {
    const map = new Map();
    students.forEach((student) => {
      if (student.department_id && student.department_name) {
        map.set(String(student.department_id), student.department_name);
      }
    });

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [students]);

  const classOptions = useMemo(() => {
    const map = new Map();
    students.forEach((student) => {
      if (student.class_id && student.class_name) {
        if (departmentFilter !== 'ALL' && String(student.department_id) !== departmentFilter) {
          return;
        }

        map.set(String(student.class_id), {
          id: String(student.class_id),
          name: student.class_name,
          departmentId: String(student.department_id || ''),
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [students, departmentFilter]);

  useEffect(() => {
    if (classFilter === 'ALL') {
      return;
    }

    const classStillVisible = classOptions.some((opt) => opt.id === classFilter);
    if (!classStillVisible) {
      setClassFilter('ALL');
    }
  }, [classFilter, classOptions]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredStudents.length / pageSize)),
    [filteredStudents.length, pageSize]
  );

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredStudents.slice(startIndex, startIndex + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const pageStart = filteredStudents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, filteredStudents.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, riskFilter, departmentFilter, classFilter, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const stats = useMemo(() => {
    const safe = students.filter((student) => student.risk_level === 'Safe').length;
    const warning = students.filter((student) => student.risk_level === 'Warning').length;
    const danger = students.filter((student) => student.risk_level === 'Danger').length;

    return { total: students.length, safe, warning, danger };
  }, [students]);

  const homeroomInfo = useMemo(() => {
    const classSet = new Set();
    let advisorName = '';

    students.forEach((student) => {
      if (student.class_name) {
        classSet.add(student.class_name);
      }
      if (!advisorName && student.homeroom_teacher_name) {
        advisorName = student.homeroom_teacher_name;
      }
    });

    return {
      advisorName,
      classCount: classSet.size,
      classList: Array.from(classSet).slice(0, 4),
    };
  }, [students]);

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

  const getStatusLabel = (status) => {
    if (status === 'Enrolled') return 'Đang học';
    if (status === 'Dropout') return 'Đã bỏ học';
    if (status === 'Graduated') return 'Đã tốt nghiệp';
    return status || '-';
  };

  const getGenderLabel = (gender) => {
    if (gender === 'Male') return 'Nam';
    if (gender === 'Female') return 'Nữ';
    if (gender === 'Other') return 'Khác';
    return gender || '-';
  };

  const clearFilters = () => {
    setKeyword('');
    setRiskFilter('ALL');
    setDepartmentFilter('ALL');
    setClassFilter('ALL');
  };

  const resetImport = () => {
    setImportStep(1);
    setImportFile(null);
    setImportColumns([]);
    setImportPreview([]);
    setImportMapping({
      student_code: '',
      full_name: '',
      class_code: '',
      class_name: '',
      gender: '',
      date_of_birth: '',
      email: '',
      phone: '',
      address: '',
      gpa: '',
      absences: '',
      tuition_debt: '',
      scholarship: '',
      risk_percentage: '',
      risk_level: '',
      actual_status: '',
      enrollment_year: '',
      note: ''
    });
    setImportError('');
    setImportResult(null);
    setImportLoading(false);
  };

  const openImportModal = () => {
    resetImport();
    setImportOpen(true);
  };

  const closeImportModal = () => {
    setImportOpen(false);
  };

  const handlePreviewImport = async () => {
    if (!importFile) {
      setImportError('Vui lòng chọn file Excel trước khi tiếp tục.');
      return;
    }

    try {
      setImportLoading(true);
      setImportError('');
      setImportResult(null);

      const formData = new FormData();
      formData.append('file', importFile);

      const res = await axiosClient.post('/students/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const columns = Array.isArray(res.data?.columns) ? res.data.columns : [];
      const previewRows = Array.isArray(res.data?.previewRows) ? res.data.previewRows : [];

      const autoPick = (targets) => {
        const targetSet = targets.map((item) => item.toLowerCase());
        return columns.find((col) => targetSet.includes(String(col).toLowerCase())) || '';
      };

      setImportColumns(columns);
      setImportPreview(previewRows);
      setImportMapping((prev) => ({
        ...prev,
        student_code: prev.student_code || autoPick(['student_code', 'ma_sv', 'mã sv', 'mã sinh viên']),
        full_name: prev.full_name || autoPick(['full_name', 'ho ten', 'họ tên', 'ten']),
        class_code: prev.class_code || autoPick(['class_code', 'ma lop', 'mã lớp', 'lop']),
        class_name: prev.class_name || autoPick(['class_name', 'ten lop', 'tên lớp'])
      }));
      setImportStep(2);
    } catch (err) {
      setImportError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Không thể xem trước file Excel'
      );
    } finally {
      setImportLoading(false);
    }
  };

  const handleSubmitImport = async () => {
    if (!importFile) {
      setImportError('Vui lòng chọn file Excel.');
      return;
    }

    if (!importMapping.student_code || !importMapping.full_name || (!importMapping.class_code && !importMapping.class_name)) {
      setImportError('Vui lòng map đủ student_code, full_name và class_code/class_name.');
      return;
    }

    try {
      setImportLoading(true);
      setImportError('');
      setImportResult(null);

      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('mapping', JSON.stringify(importMapping));

      const res = await axiosClient.post('/students/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setImportResult(res.data || null);
      await fetchStudents();
    } catch (err) {
      setImportError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Import Excel thất bại'
      );
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <PageHeader
        title="Quản lý sinh viên"
        subtitle={
          isTeacher
            ? `Giảng viên chủ nhiệm: ${homeroomInfo.advisorName || currentUser.full_name || 'Bạn'} - đang xem ${homeroomInfo.classCount} lớp phụ trách`
            : 'Theo dõi hồ sơ học tập và mức độ rủi ro hiện tại'
        }
        actions={
          <button className="btn btn-secondary" onClick={fetchStudents} disabled={loading}>
            <IconRefresh />
            Làm mới
          </button>
        }
      />

      {isTeacher && homeroomInfo.classList.length > 0 ? (
        <div className="card" style={{ padding: '12px 16px' }}>
          <div className="card__subtitle">
            Lớp bạn đang phụ trách: {homeroomInfo.classList.join(', ')}{homeroomInfo.classCount > homeroomInfo.classList.length ? '...' : ''}
          </div>
        </div>
      ) : null}

      <div className="stats-grid">
        <StatCard label="Tổng sinh viên" value={stats.total} color="blue" icon={IconUsers} loading={loading} helper="Tất cả bản ghi đang quản lý" />
        <StatCard label="An toàn" value={stats.safe} color="green" icon={IconShield} loading={loading} helper="Rủi ro thấp" />
        <StatCard label="Cảnh báo" value={stats.warning} color="yellow" icon={IconAlert} loading={loading} helper="Cần theo dõi" />
        <StatCard label="Nguy hiểm" value={stats.danger} color="red" icon={IconXCircle} loading={loading} helper="Ưu tiên can thiệp" />
      </div>

      <div className="card">
        <div className="section-toolbar">
          <div>
            <div className="card__title">Bộ lọc danh sách</div>
            <div className="card__subtitle">Tìm theo mã sinh viên, họ tên hoặc mức rủi ro</div>
          </div>
          <div className="section-toolbar__meta">
            Đang hiển thị {filteredStudents.length}/{students.length} sinh viên
          </div>
        </div>

        <div className="filter-bar filter-bar--flex">
          <div className="filter-bar__search">
            <span className="filter-bar__search-icon">
              <IconSearch />
            </span>
            <input
              className="input"
              type="text"
              placeholder="Tìm theo mã sinh viên hoặc họ tên..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <select
            className="select"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="ALL">Tất cả mức rủi ro</option>
            <option value="Safe">An toàn</option>
            <option value="Warning">Cảnh báo</option>
            <option value="Danger">Nguy hiểm</option>
          </select>

          {!isTeacher ? (
            <>
              <select
                className="select"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="ALL">Tất cả khoa</option>
                {departmentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>

              <select
                className="select"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="ALL">Tất cả lớp</option>
                {classOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            </>
          ) : null}

          <button className="btn btn-secondary" onClick={clearFilters}>
            Xóa bộ lọc
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="table-wrapper__header">
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary" onClick={openImportModal}>
              <IconUpload />
              Import Excel
            </button>
            <button className="btn btn-primary" onClick={fetchStudents} disabled={loading}>
              <IconRefresh />
              Tải lại dữ liệu
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading loading--flex">
            <div className="loading__spinner" />
            Đang tải danh sách sinh viên...
          </div>
        ) : error ? (
          <EmptyPanel
            icon={<IconAlert />}
            title="Không thể tải dữ liệu"
            description={error}
            actions={<button className="btn btn-primary" onClick={fetchStudents}>Thử lại</button>}
          />
        ) : (
          <>
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
                    <td colSpan="13" className="empty-state empty-state--tight">
                      <div className="empty-state__title">Không có dữ liệu phù hợp</div>
                      <div className="empty-state__desc">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc rủi ro.</div>
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="mono">{student.student_code || '-'}</td>
                      <td style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{student.full_name || '-'}</td>
                      <td>{getGenderLabel(student.gender)}</td>
                      <td>{student.department_name || '-'}</td>
                      <td>{student.class_name || '-'}</td>
                      <td>{student.gpa ?? '-'}</td>
                      <td>{student.absences ?? '-'}</td>
                      <td>{Number(student.tuition_debt) === 1 ? 'Có nợ' : 'Đã đủ'}</td>
                      <td>{Number(student.scholarship) === 1 ? 'Có' : 'Không'}</td>
                      <td>
                        {student.risk_percentage != null ? Number(student.risk_percentage).toFixed(2) : '-'}
                      </td>
                      <td>
                        <span className={getRiskClass(student.risk_level || 'Safe')}>
                          {getRiskLabel(student.risk_level || 'Safe')}
                        </span>
                      </td>
                      <td>{getStatusLabel(student.actual_status)}</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
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

            {filteredStudents.length > 0 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredStudents.length}
                pageStart={pageStart}
                pageEnd={pageEnd}
                itemName="sinh viên"
              />
            ) : null}
          </>
        )}
      </div>

      {importOpen ? (
        <div className="modal-overlay" onClick={closeImportModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Import danh sách sinh viên từ Excel</h2>
              <button className="modal-close" onClick={closeImportModal}>
                X
              </button>
            </div>

            <div className="modal-body">
              {importStep === 1 ? (
                <div className="form-group">
                  <label className="label">Chọn file Excel *</label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  />
                  <div className="form-hint" style={{ marginTop: 8 }}>
                    Chỉ chấp nhận file Excel (.xlsx, .xls)
                  </div>
                  <div className="form-hint" style={{ marginTop: 8 }}>
                    Bước 1: Chọn file và bấm Tiếp tục để xem tiêu đề cột.
                  </div>
                  <div className="form-hint">
                    Bước 2: Ghép từng cột trong file với trường dữ liệu bên dưới, sau đó bấm Import.
                  </div>
                </div>
              ) : (
                <>
                  <div className="card" style={{ padding: 12, marginBottom: 16 }}>
                    <div className="card__subtitle">Xem trước dữ liệu</div>
                    {importPreview.length === 0 ? (
                      <div className="empty-state empty-state--compact">Không có dữ liệu xem trước</div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                          <thead>
                            <tr>
                              {importColumns.map((col) => (
                                <th key={col}>{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {importPreview.map((row, idx) => (
                              <tr key={`preview-${idx}`}>
                                {importColumns.map((col) => (
                                  <td key={`${col}-${idx}`}>{row[col]}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="card" style={{ padding: 12 }}>
                    <div className="card__subtitle">Ghép cột dữ liệu</div>
                    <div className="form-group">
                      <label className="label">Mã sinh viên (student_code) *</label>
                      <select
                        className="input"
                        value={importMapping.student_code}
                        onChange={(e) => setImportMapping((prev) => ({ ...prev, student_code: e.target.value }))}
                      >
                        <option value="">-- Chọn cột --</option>
                        {importColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Họ tên (full_name) *</label>
                      <select
                        className="input"
                        value={importMapping.full_name}
                        onChange={(e) => setImportMapping((prev) => ({ ...prev, full_name: e.target.value }))}
                      >
                        <option value="">-- Chọn cột --</option>
                        {importColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Mã lớp (class_code) *</label>
                      <select
                        className="input"
                        value={importMapping.class_code}
                        onChange={(e) => setImportMapping((prev) => ({ ...prev, class_code: e.target.value }))}
                      >
                        <option value="">-- Chọn cột --</option>
                        {importColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Tên lớp (class_name)</label>
                      <select
                        className="input"
                        value={importMapping.class_name}
                        onChange={(e) => setImportMapping((prev) => ({ ...prev, class_name: e.target.value }))}
                      >
                        <option value="">-- Không dùng --</option>
                        {importColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Giới tính (gender)</label>
                      <select
                        className="input"
                        value={importMapping.gender}
                        onChange={(e) => setImportMapping((prev) => ({ ...prev, gender: e.target.value }))}
                      >
                        <option value="">-- Không dùng --</option>
                        {importColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Ngày sinh (date_of_birth)</label>
                      <select
                        className="input"
                        value={importMapping.date_of_birth}
                        onChange={(e) => setImportMapping((prev) => ({ ...prev, date_of_birth: e.target.value }))}
                      >
                        <option value="">-- Không dùng --</option>
                        {importColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Email</label>
                      <select
                        className="input"
                        value={importMapping.email}
                        onChange={(e) => setImportMapping((prev) => ({ ...prev, email: e.target.value }))}
                      >
                        <option value="">-- Không dùng --</option>
                        {importColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Điện thoại</label>
                      <select
                        className="input"
                        value={importMapping.phone}
                        onChange={(e) => setImportMapping((prev) => ({ ...prev, phone: e.target.value }))}
                      >
                        <option value="">-- Không dùng --</option>
                        {importColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Địa chỉ</label>
                      <select
                        className="input"
                        value={importMapping.address}
                        onChange={(e) => setImportMapping((prev) => ({ ...prev, address: e.target.value }))}
                      >
                        <option value="">-- Không dùng --</option>
                        {importColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">GPA</label>
                      <select
                        className="input"
                        value={importMapping.gpa}
                        onChange={(e) => setImportMapping((prev) => ({ ...prev, gpa: e.target.value }))}
                      >
                        <option value="">-- Không dùng --</option>
                        {importColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Số buổi vắng</label>
                      <select
                        className="input"
                        value={importMapping.absences}
                        onChange={(e) => setImportMapping((prev) => ({ ...prev, absences: e.target.value }))}
                      >
                        <option value="">-- Không dùng --</option>
                        {importColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Học phí nợ (0/1)</label>
                      <select
                        className="input"
                        value={importMapping.tuition_debt}
                        onChange={(e) => setImportMapping((prev) => ({ ...prev, tuition_debt: e.target.value }))}
                      >
                        <option value="">-- Không dùng --</option>
                        {importColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Học bổng (0/1)</label>
                      <select
                        className="input"
                        value={importMapping.scholarship}
                        onChange={(e) => setImportMapping((prev) => ({ ...prev, scholarship: e.target.value }))}
                      >
                        <option value="">-- Không dùng --</option>
                        {importColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Tỷ lệ rủi ro (%)</label>
                      <select
                        className="input"
                        value={importMapping.risk_percentage}
                        onChange={(e) => setImportMapping((prev) => ({ ...prev, risk_percentage: e.target.value }))}
                      >
                        <option value="">-- Không dùng --</option>
                        {importColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Mức rủi ro (Safe/Warning/Danger)</label>
                      <select
                        className="input"
                        value={importMapping.risk_level}
                        onChange={(e) => setImportMapping((prev) => ({ ...prev, risk_level: e.target.value }))}
                      >
                        <option value="">-- Không dùng --</option>
                        {importColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Trạng thái (Enrolled/Dropout/Graduated)</label>
                      <select
                        className="input"
                        value={importMapping.actual_status}
                        onChange={(e) => setImportMapping((prev) => ({ ...prev, actual_status: e.target.value }))}
                      >
                        <option value="">-- Không dùng --</option>
                        {importColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Năm nhập học</label>
                      <select
                        className="input"
                        value={importMapping.enrollment_year}
                        onChange={(e) => setImportMapping((prev) => ({ ...prev, enrollment_year: e.target.value }))}
                      >
                        <option value="">-- Không dùng --</option>
                        {importColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Ghi chú</label>
                      <select
                        className="input"
                        value={importMapping.note}
                        onChange={(e) => setImportMapping((prev) => ({ ...prev, note: e.target.value }))}
                      >
                        <option value="">-- Không dùng --</option>
                        {importColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {importError ? (
                <div className="form-error" style={{ marginTop: 12 }}>
                  {importError}
                </div>
              ) : null}

              {importResult ? (
                <div className="card" style={{ marginTop: 12, padding: 12 }}>
                  <div className="card__subtitle">Kết quả import</div>
                  <div>Thêm mới: {importResult.createdCount || 0}</div>
                  <div>Cập nhật: {importResult.updatedCount || 0}</div>
                  <div>Lỗi: {importResult.failedCount || 0}</div>
                </div>
              ) : null}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeImportModal} disabled={importLoading}>
                Hủy
              </button>
              {importStep === 1 ? (
                <button type="button" className="btn btn-primary" onClick={handlePreviewImport} disabled={importLoading}>
                  {importLoading ? 'Đang xử lý...' : 'Tiếp tục'}
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={handleSubmitImport} disabled={importLoading}>
                  {importLoading ? 'Đang import...' : 'Import'}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}