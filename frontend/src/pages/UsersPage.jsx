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

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconRoleTeacher = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
  </svg>
);

const IconRoleAdmin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v6c0 5-3.5 8.5-7 9.5C8.5 20.5 5 17 5 12V6l7-3z" />
    <path d="M9.5 12l1.8 1.8 3.2-3.2" />
  </svg>
);

// Modal for Add User
function UserModal({ isOpen, user, departments, onClose, onSave, loading }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'teacher',
    department_id: '',
    is_active: 1
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const isAdminRole = formData.role === 'admin';

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'teacher',
        department_id: user.department_id || '',
        is_active: user.is_active || 1
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        password: '',
        role: 'teacher',
        department_id: '',
        is_active: 1
      });
    }
    setErrors({});
    setShowPassword(false);
  }, [user, isOpen]);

  useEffect(() => {
    if (isAdminRole && formData.department_id) {
      setFormData((prev) => ({ ...prev, department_id: '' }));
    }
  }, [isAdminRole, formData.department_id]);

  const validate = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Họ tên không được bỏ trống';
    if (!formData.email.trim()) newErrors.email = 'Email không được bỏ trống';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
    if (!user && !formData.password) newErrors.password = 'Mật khẩu không được bỏ trống (thêm người dùng mới)';
    if (!user && formData.password && formData.password.length < 6) newErrors.password = 'Mật khẩu phải ít nhất 6 ký tự';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const data = { ...formData };
    if (data.role === 'admin') {
      data.department_id = null;
    }
    if (!user && !data.password) {
      alert('Mật khẩu bắt buộc');
      return;
    }
    if (user && !data.password) {
      delete data.password; // don't update password if empty
    }
    
    await onSave(data);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {user ? `Chỉnh sửa người dùng: ${user.full_name}` : 'Thêm người dùng mới'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="label">Họ và tên</label>
            <input
              type="text"
              className={`input ${errors.full_name ? 'input--error' : ''}`}
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="e.g., Nguyễn Văn A"
            />
            {errors.full_name && <div className="form-error">{errors.full_name}</div>}
          </div>

          <div className="form-group">
            <label className="label">Email</label>
            <input
              type="email"
              className={`input ${errors.email ? 'input--error' : ''}`}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!!user}
              placeholder="e.g., user@example.com"
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="label">
              {user ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`input ${errors.password ? 'input--error' : ''}`}
                style={{ flex: 1 }}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="●●●●●●"
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowPassword(!showPassword)}
                style={{ padding: '8px 12px' }}
              >
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label className="label">Vai trò</label>
            <select
              className="input"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="teacher">Giảng viên</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>

          {!isAdminRole ? (
            <div className="form-group">
              <label className="label">Khoa (tùy chọn)</label>
              <select
                className="input"
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              >
                <option value="">-- Không chọn --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label className="label">Khoa</label>
              <div className="text-muted" style={{ fontSize: '13px' }}>
                Quản trị viên không gắn theo khoa.
              </div>
            </div>
          )}

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active === 1}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
            />
            <label htmlFor="is_active" style={{ margin: 0, cursor: 'pointer' }}>
              Tài khoản hoạt động
            </label>
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
function ConfirmDeleteModal({ isOpen, userName, onConfirm, onCancel, loading }) {
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
            <div className="empty-state__title">Xóa người dùng: {userName}?</div>
            <div className="empty-state__desc">
              Hành động này không thể hoàn tác. Người dùng sẽ không thể đăng nhập.
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

export default function UsersPage() {
  const MAX_HOMEROOM_CLASSES_PER_TEACHER = 2;
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersRes, deptRes] = await Promise.all([
        axiosClient.get('/users').catch(() => ({ data: [] })),
        axiosClient.get('/departments').catch(() => ({ data: [] }))
      ]);

      setUsers(Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.data || []);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : deptRes.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể tải dữ liệu');
      setUsers([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEditUser = (usr) => {
    setEditingUser(usr);
    setModalOpen(true);
  };

  const handleSaveUser = async (formData) => {
    try {
      setActionLoading(true);
      if (editingUser) {
        await axiosClient.put(`/users/${editingUser.id}`, formData);
        alert('Cập nhật người dùng thành công');
      } else {
        await axiosClient.post('/users', formData);
        alert('Thêm người dùng thành công');
      }
      setModalOpen(false);
      setEditingUser(null);
      await fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Lỗi khi lưu người dùng');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = (usr) => {
    setConfirmDelete(usr);
  };

  const handleDeleteUser = async () => {
    try {
      setActionLoading(true);
      await axiosClient.delete(`/users/${confirmDelete.id}`);
      alert('Xóa người dùng thành công');
      setConfirmDelete(null);
      await fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Lỗi khi xóa người dùng');
      setConfirmDelete(null);
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleMeta = (role) => {
    if (role === 'admin') {
      return {
        label: 'Quản trị viên',
        icon: <IconRoleAdmin />,
        color: '#b42318',
        background: '#fef3f2',
        border: '#fecdc7'
      };
    }

    return {
      label: 'Giảng viên',
      icon: <IconRoleTeacher />,
      color: '#1d4ed8',
      background: '#eff6ff',
      border: '#bfdbfe'
    };
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find((d) => d.id === deptId);
    return dept ? dept.department_name : '-';
  };

  const renderHomeroomInfo = (usr) => {
    if (usr.role !== 'teacher') {
      return <span className="text-muted">-</span>;
    }

    const classCount = Number(usr.homeroom_class_count || 0);
    const classCodes = String(usr.homeroom_class_codes || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    return (
      <div>
        <div className="mono" style={{ fontWeight: 600 }}>
          {classCount}/{MAX_HOMEROOM_CLASSES_PER_TEACHER} lớp
        </div>
        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
          {classCodes.length > 0 ? classCodes.join(', ') : 'Chưa phân công'}
        </div>
      </div>
    );
  };
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(users.length / pageSize)),
    [users.length, pageSize]
  );

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return users.slice(startIndex, startIndex + pageSize);
  }, [users, currentPage, pageSize]);

  const pageStart = users.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, users.length);

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
        title="Quản lý người dùng"
        subtitle="Thêm, chỉnh sửa, xóa tài khoản và quản lý vai trò"
        actions={
          <>
            <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
              <IconRefresh />
              Làm mới
            </button>
            <button className="btn btn-primary" onClick={handleAddUser}>
              <IconPlus />
              Thêm người dùng
            </button>
          </>
        }
      />

      <div className="card">
        <div className="section-toolbar">
          <div>
            <div className="card__title">Danh sách người dùng</div>
            <div className="card__subtitle">Quản lý tài khoản người dùng và vai trò hệ thống</div>
          </div>
          <div className="section-toolbar__meta">
            {loading ? '...' : `${users.length} người dùng`}
          </div>
        </div>

        {loading ? (
          <div className="loading loading--flex">
            <div className="loading__spinner" />
            Đang tải danh sách người dùng...
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
        ) : users.length === 0 ? (
          <EmptyPanel
            icon={<IconUsers />}
            title="Chưa có người dùng nào"
            description="Hãy thêm người dùng mới để bắt đầu."
            actions={
              <button className="btn btn-primary" onClick={handleAddUser}>
                <IconPlus />
                Thêm người dùng
              </button>
            }
          />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Khoa</th>
                  <th>Chủ nhiệm lớp</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((usr) => (
                  <tr key={usr.id}>
                    <td style={{ fontWeight: 500 }}>{usr.full_name || '-'}</td>
                    <td className="mono">{usr.email || '-'}</td>
                    <td>
                      {(() => {
                        const roleMeta = getRoleMeta(usr.role);
                        return (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '999px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: roleMeta.color,
                              backgroundColor: roleMeta.background,
                              border: `1px solid ${roleMeta.border}`
                            }}
                          >
                            <span style={{ width: '14px', height: '14px', display: 'inline-flex' }}>
                              {roleMeta.icon}
                            </span>
                            {roleMeta.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td>{usr.department_name || getDepartmentName(usr.department_id)}</td>
                    <td>{renderHomeroomInfo(usr)}</td>
                    <td>
                      <span className={`badge ${usr.is_active ? 'badge-success' : 'badge-gray'}`}>
                        {usr.is_active ? (
                          <>
                            <IconCheck style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                            Hoạt động
                          </>
                        ) : (
                          'Vô hiệu hóa'
                        )}
                      </span>
                    </td>
                    <td className="mono">
                      {usr.created_at
                        ? new Date(usr.created_at).toLocaleDateString('vi-VN')
                        : '-'}
                    </td>
                    <td>
                      <div className="action-cell">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEditUser(usr)}
                          title="Chỉnh sửa"
                        >
                          <IconEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleConfirmDelete(usr)}
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

            {users.length > 0 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={users.length}
                pageStart={pageStart}
                pageEnd={pageEnd}
                itemName="người dùng"
              />
            ) : null}
          </div>
        )}
      </div>

      {/* Modals */}
      <UserModal
        isOpen={modalOpen}
        user={editingUser}
        departments={departments}
        onClose={() => {
          setModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
        loading={actionLoading}
      />

      <ConfirmDeleteModal
        isOpen={!!confirmDelete}
        userName={confirmDelete?.full_name}
        onConfirm={handleDeleteUser}
        onCancel={() => setConfirmDelete(null)}
        loading={actionLoading}
      />
    </div>
  );
}
