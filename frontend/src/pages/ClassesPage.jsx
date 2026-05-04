import Pagination from "../components/Pagination";
import { useMemo, useEffect, useState } from 'react';
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

// Modal for Add/Edit Class
function ClassModal({ isOpen, classItem, departments, teachers, onClose, onSave, loading }) {
  const [formData, setFormData] = useState({
    class_code: '',
    class_name: '',
    department_id: '',
    homeroom_teacher_id: '',
    school_year: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (classItem) {
      setFormData({
        class_code: classItem.class_code || '',
        class_name: classItem.class_name || '',
        department_id: classItem.department_id || '',
        homeroom_teacher_id: classItem.homeroom_teacher_id || '',
        school_year: classItem.school_year || ''
      });
    } else {
      setFormData({
        class_code: '',
        class_name: '',
        department_id: '',
        homeroom_teacher_id: '',
        school_year: ''
      });
    }
    setErrors({});
  }, [classItem, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.class_code.trim()) newErrors.class_code = 'Mã lớp không được bỏ trống';
    if (!formData.class_name.trim()) newErrors.class_name = 'Tên lớp không được bỏ trống';
    if (!formData.department_id) newErrors.department_id = 'Vui lòng chọn khoa';
    if (!formData.school_year.trim()) newErrors.school_year = 'Năm học không được bỏ trống';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {classItem ? `Chỉnh sửa lớp: ${classItem.class_name}` : 'Thêm lớp mới'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="label">Mã lớp</label>
            <input
              type="text"
              className={`input ${errors.class_code ? 'input--error' : ''}`}
              value={formData.class_code}
              onChange={(e) => setFormData({ ...formData, class_code: e.target.value })}
              disabled={!!classItem}
              placeholder="e.g., CNTT2021A"
            />
            {errors.class_code && <div className="form-error">{errors.class_code}</div>}
          </div>

          <div className="form-group">
            <label className="label">Tên lớp</label>
            <input
              type="text"
              className={`input ${errors.class_name ? 'input--error' : ''}`}
              value={formData.class_name}
              onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
              placeholder="e.g., CNTT 2021 - A"
            />
            {errors.class_name && <div className="form-error">{errors.class_name}</div>}
          </div>

          <div className="form-group">
            <label className="label">Khoa</label>
            <select
              className={`input ${errors.department_id ? 'input--error' : ''}`}
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
            >
              <option value="">-- Chọn khoa --</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.department_name} ({dept.department_code})
                </option>
              ))}
            </select>
            {errors.department_id && <div className="form-error">{errors.department_id}</div>}
          </div>

          <div className="form-group">
            <label className="label">Năm học</label>
            <input
              type="text"
              className={`input ${errors.school_year ? 'input--error' : ''}`}
              value={formData.school_year}
              onChange={(e) => setFormData({ ...formData, school_year: e.target.value })}
              placeholder="e.g., 2021-2025"
            />
            {errors.school_year && <div className="form-error">{errors.school_year}</div>}
          </div>

          <div className="form-group">
            <label className="label">GV chủ nhiệm (tùy chọn)</label>
            <select
              className="input"
              value={formData.homeroom_teacher_id || ''}
              onChange={(e) => setFormData({ ...formData, homeroom_teacher_id: e.target.value ? Number(e.target.value) : '' })}
            >
              <option value="">-- Không gán chủ nhiệm --</option>
              {teachers.map((teacher) => {
                const classCount = Number(teacher.homeroom_class_count || 0);
                const isCurrentHomeroom = Number(classItem?.homeroom_teacher_id) === Number(teacher.id);
                const reachedLimit = classCount >= 2 && !isCurrentHomeroom;

                return (
                  <option key={teacher.id} value={teacher.id} disabled={reachedLimit}>
                    {teacher.full_name} ({teacher.email}) - {classCount}/2 lớp{reachedLimit ? ' - Đã đủ' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Confirmation Modal
function ConfirmDeleteModal({ isOpen, className, onConfirm, onCancel, loading }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Xác nhận xóa</h2>
          <button className="modal-close" onClick={onCancel}>
            <IconX />
          </button>
        </div>

        <div className="modal-body">
          <div className="empty-state empty-state--compact">
            <div className="empty-state__icon" style={{ color: 'var(--red-500)' }}>
              <IconAlert />
            </div>
            <div className="empty-state__title">Xóa lớp: {className}?</div>
            <div className="empty-state__desc">
              Hành động này không thể hoàn tác. Tất cả sinh viên và bản ghi học tập cũng sẽ bị xóa.
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Hủy
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [classesRes, deptRes, usersRes] = await Promise.all([
        axiosClient.get('/classes'),
        axiosClient.get('/departments'),
        axiosClient.get('/users')
      ]);

      setClasses(Array.isArray(classesRes.data) ? classesRes.data : classesRes.data?.data || []);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : deptRes.data?.data || []);
      const usersData = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.data || [];
      const teacherOptions = usersData
        .filter((user) => user.role === 'teacher' && Number(user.is_active) === 1)
        .sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '', 'vi'));
      setTeachers(teacherOptions);
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể tải dữ liệu');
      setClasses([]);
      setDepartments([]);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClass = () => {
    setEditingClass(null);
    setModalOpen(true);
  };

  const handleEditClass = (cls) => {
    setEditingClass(cls);
    setModalOpen(true);
  };

  const handleSaveClass = async (formData) => {
    try {
      setActionLoading(true);
      if (editingClass) {
        await axiosClient.put(`/classes/${editingClass.id}`, formData);
        alert('Cập nhật lớp thành công');
      } else {
        await axiosClient.post('/classes', formData);
        alert('Thêm lớp thành công');
      }
      setModalOpen(false);
      setEditingClass(null);
      await fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Lỗi khi lưu lớp');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = (cls) => {
    setConfirmDelete(cls);
  };

  const handleDeleteClass = async () => {
    try {
      setActionLoading(true);
      await axiosClient.delete(`/classes/${confirmDelete.id}`);
      alert('Xóa lớp thành công');
      setConfirmDelete(null);
      await fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Lỗi khi xóa lớp');
      setConfirmDelete(null);
    } finally {
      setActionLoading(false);
    }
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find((d) => d.id === deptId);
    return dept ? `${dept.department_name} (${dept.department_code})` : '-';
  };
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(classes.length / pageSize)),
    [classes.length, pageSize]
  );

  const paginatedClasses = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return classes.slice(startIndex, startIndex + pageSize);
  }, [classes, currentPage, pageSize]);

  const pageStart = classes.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, classes.length);

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
        title="Quản lý lớp học"
        subtitle="Thêm, chỉnh sửa, xóa lớp học"
        actions={
          <>
            <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
              <IconRefresh />
              Làm mới
            </button>
            <button className="btn btn-primary" onClick={handleAddClass}>
              <IconPlus />
              Thêm lớp
            </button>
          </>
        }
      />

      <div className="card">
        <div className="section-toolbar">
          <div>
            <div className="card__title">Danh sách lớp học</div>
            <div className="card__subtitle">Tất cả các lớp đang quản lý trong hệ thống</div>
          </div>
          <div className="section-toolbar__meta">
            {loading ? '...' : `${classes.length} lớp`}
          </div>
        </div>

        {loading ? (
          <div className="loading loading--flex">
            <div className="loading__spinner" />
            Đang tải danh sách lớp học...
          </div>
        ) : error ? (
          <EmptyPanel
            icon={<IconAlert />}
            title="Không thể tải dữ liệu"
            description={error}
            actions={
              <button className="btn btn-primary" onClick={fetchData}>
                Thử lại
              </button>
            }
          />
        ) : classes.length === 0 ? (
          <EmptyPanel
            icon={<IconUsers />}
            title="Chưa có lớp nào"
            description="Hãy thêm lớp mới để bắt đầu quản lý."
            actions={
              <button className="btn btn-primary" onClick={handleAddClass}>
                <IconPlus />
                Thêm lớp
              </button>
            }
          />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã lớp</th>
                  <th>Tên lớp</th>
                  <th>Khoa</th>
                  <th>Năm học</th>
                  <th>GV chủ nhiệm</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedClasses.map((cls) => (
                  <tr key={cls.id}>
                    <td className="mono" style={{ fontWeight: 600 }}>
                      {cls.class_code || '-'}
                    </td>
                    <td style={{ fontWeight: 500 }}>{cls.class_name || '-'}</td>
                    <td>{getDepartmentName(cls.department_id)}</td>
                    <td className="mono">{cls.school_year || '-'}</td>
                    <td>{cls.homeroom_teacher_name || cls.homeroom_teacher_id || '-'}</td>
                    <td className="mono">
                      {cls.created_at
                        ? new Date(cls.created_at).toLocaleDateString('vi-VN')
                        : '-'}
                    </td>
                    <td>
                      <div className="action-cell">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEditClass(cls)}
                          title="Chỉnh sửa"
                        >
                          <IconEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleConfirmDelete(cls)}
                          title="Xóa"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {classes.length > 0 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={classes.length}
                pageStart={pageStart}
                pageEnd={pageEnd}
                itemName="lớp"
              />
            ) : null}
          </div>
        )}
      </div>

      {/* Modals */}
      <ClassModal
        isOpen={modalOpen}
        classItem={editingClass}
        departments={departments}
        teachers={teachers}
        onClose={() => {
          setModalOpen(false);
          setEditingClass(null);
        }}
        onSave={handleSaveClass}
        loading={actionLoading}
      />

      <ConfirmDeleteModal
        isOpen={!!confirmDelete}
        className={confirmDelete?.class_name}
        onConfirm={handleDeleteClass}
        onCancel={() => setConfirmDelete(null)}
        loading={actionLoading}
      />
    </div>
  );
}
