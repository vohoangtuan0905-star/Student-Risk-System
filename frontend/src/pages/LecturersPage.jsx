import Pagination from "../components/Pagination";
import { useEffect, useMemo, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { PageHeader, EmptyPanel } from '../components/PageKit';

const MAX_HOMEROOM_CLASSES = 2;

const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconAssign = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7h11" />
    <path d="M3 12h8" />
    <path d="M3 17h5" />
    <circle cx="17" cy="14" r="3" />
    <path d="M22 21l-3-3" />
  </svg>
);

function LecturerModal({ isOpen, lecturer, departments, onClose, onSave, loading }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    department_id: '',
    is_active: 1,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (lecturer) {
      setFormData({
        full_name: lecturer.full_name || '',
        email: lecturer.email || '',
        password: '',
        department_id: lecturer.department_id || '',
        is_active: Number(lecturer.is_active) ? 1 : 0,
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        password: '',
        department_id: '',
        is_active: 1,
      });
    }
    setErrors({});
  }, [lecturer, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Họ tên không được bỏ trống';
    if (!formData.email.trim()) newErrors.email = 'Email không được bỏ trống';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
    if (!lecturer && !formData.password) newErrors.password = 'Mật khẩu không được bỏ trống';
    if (formData.password && formData.password.length < 6) newErrors.password = 'Mật khẩu phải từ 6 ký tự';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      full_name: formData.full_name,
      email: formData.email,
      department_id: formData.department_id || null,
      is_active: Number(formData.is_active) ? 1 : 0,
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    await onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{lecturer ? `Chỉnh sửa giảng viên: ${lecturer.full_name}` : 'Thêm giảng viên mới'}</h2>
          <button className="modal-close" onClick={onClose}><IconX /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="label">Họ tên</label>
            <input
              className={`input ${errors.full_name ? 'input--error' : ''}`}
              value={formData.full_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
            />
            {errors.full_name && <div className="form-error">{errors.full_name}</div>}
          </div>

          <div className="form-group">
            <label className="label">Email</label>
            <input
              type="email"
              className={`input ${errors.email ? 'input--error' : ''}`}
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              disabled={!!lecturer}
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="label">{lecturer ? 'Mật khẩu mới (không bắt buộc)' : 'Mật khẩu'}</label>
            <input
              type="password"
              className={`input ${errors.password ? 'input--error' : ''}`}
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label className="label">Khoa (tùy chọn)</label>
            <select
              className="input"
              value={formData.department_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, department_id: e.target.value }))}
            >
              <option value="">-- Không chọn --</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.department_name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              id="lecturer-active"
              type="checkbox"
              checked={Number(formData.is_active) === 1}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked ? 1 : 0 }))}
            />
            <label htmlFor="lecturer-active" style={{ margin: 0 }}>Tài khoản hoạt động</label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignClassesModal({ isOpen, lecturer, classes, onClose, onSave, loading }) {
  const [selectedClassIds, setSelectedClassIds] = useState([]);

  useEffect(() => {
    if (!lecturer) {
      setSelectedClassIds([]);
      return;
    }

    const initialIds = (lecturer.homeroom_classes || []).map((item) => item.id);
    setSelectedClassIds(initialIds);
  }, [lecturer, isOpen]);

  if (!isOpen || !lecturer) return null;

  const currentIds = new Set((lecturer.homeroom_classes || []).map((item) => Number(item.id)));

  const classOptions = classes
    .filter((cls) => !cls.homeroom_teacher_id || Number(cls.homeroom_teacher_id) === Number(lecturer.id))
    .sort((a, b) => (a.class_code || '').localeCompare(b.class_code || '', 'vi'));

  const toggleClass = (classId) => {
    setSelectedClassIds((prev) => {
      const exists = prev.includes(classId);
      if (exists) {
        return prev.filter((id) => id !== classId);
      }
      if (prev.length >= MAX_HOMEROOM_CLASSES) {
        return prev;
      }
      return [...prev, classId];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(selectedClassIds);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Phân công lớp chủ nhiệm: {lecturer.full_name}</h2>
          <button className="modal-close" onClick={onClose}><IconX /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="card__subtitle" style={{ marginBottom: 10 }}>
            Chọn tối đa {MAX_HOMEROOM_CLASSES} lớp. Đang chọn {selectedClassIds.length}/{MAX_HOMEROOM_CLASSES}.
          </div>

          <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid var(--gray-200)', borderRadius: 10, padding: 10 }}>
            {classOptions.length === 0 ? (
              <div className="text-muted">Không có lớp khả dụng để phân công.</div>
            ) : classOptions.map((cls) => {
              const clsId = Number(cls.id);
              const checked = selectedClassIds.includes(clsId);
              const disabled = !checked && selectedClassIds.length >= MAX_HOMEROOM_CLASSES;
              const isCurrent = currentIds.has(clsId);

              return (
                <label
                  key={cls.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 4px',
                    borderBottom: '1px dashed var(--gray-200)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.6 : 1,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleClass(clsId)}
                  />
                  <span className="mono" style={{ minWidth: 90 }}>{cls.class_code}</span>
                  <span>{cls.class_name}</span>
                  {isCurrent ? <span className="badge badge-safe">Đang phụ trách</span> : null}
                </label>
              );
            })}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu phân công'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LecturersPage() {
  const [lecturers, setLecturers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningLecturer, setAssigningLecturer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const stats = useMemo(() => {
    const active = lecturers.filter((item) => Number(item.is_active) === 1).length;
    const fullyAssigned = lecturers.filter((item) => Number(item.homeroom_class_count || 0) >= MAX_HOMEROOM_CLASSES).length;
    return {
      total: lecturers.length,
      active,
      fullyAssigned,
    };
  }, [lecturers]);

  const fetchData = async (query = '') => {
    try {
      setLoading(true);
      setError('');

      const [lecturerRes, deptRes, classRes] = await Promise.all([
        axiosClient.get('/lecturers', { params: query ? { q: query } : {} }),
        axiosClient.get('/departments'),
        axiosClient.get('/classes'),
      ]);

      setLecturers(Array.isArray(lecturerRes.data?.data) ? lecturerRes.data.data : []);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : (deptRes.data?.data || []));
      setClasses(Array.isArray(classRes.data) ? classRes.data : (classRes.data?.data || []));
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể tải dữ liệu giảng viên');
      setLecturers([]);
      setDepartments([]);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(searchTerm);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSaveLecturer = async (payload) => {
    try {
      setActionLoading(true);
      if (editingLecturer) {
        await axiosClient.put(`/lecturers/${editingLecturer.id}`, payload);
        alert('Cập nhật giảng viên thành công');
      } else {
        await axiosClient.post('/lecturers', payload);
        alert('Thêm giảng viên thành công');
      }
      setModalOpen(false);
      setEditingLecturer(null);
      await fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Lỗi khi lưu giảng viên');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLecturer = async (lecturer) => {
    const confirmed = window.confirm(`Xóa giảng viên ${lecturer.full_name}?`);
    if (!confirmed) return;

    try {
      setActionLoading(true);
      await axiosClient.delete(`/lecturers/${lecturer.id}`);
      alert('Xóa giảng viên thành công');
      await fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Lỗi khi xóa giảng viên');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveAssignment = async (classIds) => {
    try {
      setActionLoading(true);
      await axiosClient.put(`/lecturers/${assigningLecturer.id}/homeroom-classes`, {
        class_ids: classIds,
      });
      alert('Lưu phân công chủ nhiệm thành công');
      setAssignModalOpen(false);
      setAssigningLecturer(null);
      await fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Lỗi khi phân công lớp chủ nhiệm');
    } finally {
      setActionLoading(false);
    }
  };

  const renderHomeroomStatus = (lecturer) => {
    const classCount = Number(lecturer.homeroom_class_count || 0);
    let statusClass = 'badge-gray';
    let statusText = 'Chưa phân công';

    if (classCount === 1) {
      statusClass = 'badge-warning';
      statusText = 'Đang phụ trách 1/2';
    }
    if (classCount >= MAX_HOMEROOM_CLASSES) {
      statusClass = 'badge-success';
      statusText = `Đủ ${MAX_HOMEROOM_CLASSES}/${MAX_HOMEROOM_CLASSES}`;
    }

    const homeroomClasses = Array.isArray(lecturer.homeroom_classes) ? lecturer.homeroom_classes : [];

    return (
      <div>
        <span className={`badge ${statusClass}`}>{statusText}</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {homeroomClasses.length > 0 ? (
            homeroomClasses.map((item) => (
              <span
                key={item.id}
                className="badge badge-primary"
                style={{ fontSize: 11, padding: '3px 8px' }}
                title={item.class_name || item.class_code}
              >
                {item.class_code}
              </span>
            ))
          ) : (
            <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>Chưa có lớp chủ nhiệm</span>
          )}
        </div>
      </div>
    );
  };
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(lecturers.length / pageSize)),
    [lecturers.length, pageSize]
  );

  const paginatedLecturers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return lecturers.slice(startIndex, startIndex + pageSize);
  }, [lecturers, currentPage, pageSize]);

  const pageStart = lecturers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, lecturers.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);


  return (
    <div className="page-wrapper">
      <PageHeader
        title="Quản lý giảng viên"
        subtitle="CRUD giảng viên và phân công mỗi giảng viên phụ trách tối đa 2 lớp"
        actions={(
          <>
            <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
              <IconRefresh />
              Làm mới
            </button>
            <button className="btn btn-primary" onClick={() => { setEditingLecturer(null); setModalOpen(true); }}>
              <IconPlus />
              Thêm giảng viên
            </button>
          </>
        )}
      />

      <div className="stats-grid">
        <div className="stat-card stat-card--blue"><div className="stat-card__icon stat-card__icon--blue"><IconUsers /></div><div className="stat-card__body"><div className="stat-card__value">{stats.total}</div><div className="stat-card__label">Tổng giảng viên</div></div></div>
        <div className="stat-card stat-card--green"><div className="stat-card__icon stat-card__icon--green"><IconUsers /></div><div className="stat-card__body"><div className="stat-card__value">{stats.active}</div><div className="stat-card__label">Đang hoạt động</div></div></div>
        <div className="stat-card stat-card--yellow"><div className="stat-card__icon stat-card__icon--yellow"><IconUsers /></div><div className="stat-card__body"><div className="stat-card__value">{stats.fullyAssigned}</div><div className="stat-card__label">Đủ 2 lớp chủ nhiệm</div></div></div>
      </div>

      <div className="card">
        <div className="section-toolbar">
          <div>
            <div className="card__title">Danh sách giảng viên</div>
            <div className="card__subtitle">Theo dõi phân công chủ nhiệm theo từng giảng viên</div>
          </div>
          <div className="section-toolbar__meta">{loading ? '...' : `${lecturers.length} giảng viên`}</div>
        </div>

        <div className="section-toolbar" style={{ paddingTop: 0 }}>
          <div style={{ flex: 1 }}>
            <input
              className="input"
              placeholder="Tìm theo mã, họ tên, email, khoa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading loading--flex"><div className="loading__spinner" />Đang tải dữ liệu giảng viên...</div>
        ) : error ? (
          <EmptyPanel icon={<IconAlert />} title="Không thể tải dữ liệu" description={error} actions={<button className="btn btn-primary" onClick={fetchData}>Thử lại</button>} />
        ) : lecturers.length === 0 ? (
          <EmptyPanel icon={<IconUsers />} title="Chưa có giảng viên" description="Hãy thêm giảng viên để bắt đầu phân công chủ nhiệm" />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã GV</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Khoa</th>
                  <th>Trạng thái</th>
                  <th>Chủ nhiệm</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLecturers.map((lecturer) => (
                  <tr key={lecturer.id}>
                    <td className="mono">{lecturer.lecturer_code || '-'}</td>
                    <td style={{ fontWeight: 600 }}>{lecturer.full_name || '-'}</td>
                    <td className="mono">{lecturer.email || '-'}</td>
                    <td>{lecturer.department_name || '-'}</td>
                    <td>
                      <span className={`badge ${Number(lecturer.is_active) === 1 ? 'badge-success' : 'badge-gray'}`}>
                        {Number(lecturer.is_active) === 1 ? 'Hoạt động' : 'Vô hiệu hóa'}
                      </span>
                    </td>
                    <td>
                      {renderHomeroomStatus(lecturer)}
                    </td>
                    <td>
                      <div className="action-cell">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            setAssigningLecturer(lecturer);
                            setAssignModalOpen(true);
                          }}
                          title="Phân công chủ nhiệm"
                        >
                          <IconAssign />
                          Phân công
                        </button>
                        <button className="btn btn-sm btn-secondary" onClick={() => { setEditingLecturer(lecturer); setModalOpen(true); }} title="Chỉnh sửa">
                          <IconEdit />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteLecturer(lecturer)} disabled={actionLoading} title="Xóa">
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {lecturers.length > 0 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={lecturers.length}
                pageStart={pageStart}
                pageEnd={pageEnd}
                itemName="giảng viên"
              />
            ) : null}
          </div>
        )}
      </div>

      <LecturerModal
        isOpen={modalOpen}
        lecturer={editingLecturer}
        departments={departments}
        onClose={() => { setModalOpen(false); setEditingLecturer(null); }}
        onSave={handleSaveLecturer}
        loading={actionLoading}
      />

      <AssignClassesModal
        isOpen={assignModalOpen}
        lecturer={assigningLecturer}
        classes={classes}
        onClose={() => { setAssignModalOpen(false); setAssigningLecturer(null); }}
        onSave={handleSaveAssignment}
        loading={actionLoading}
      />
    </div>
  );
}