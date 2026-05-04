import Pagination from "../components/Pagination";
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { PageHeader, EmptyPanel } from '../components/PageKit';

const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
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
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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

const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
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

function formatDate(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

const EMPTY_FORM = {
  academic_year: '',
  semester_no: 1,
  semester_name: '',
  start_date: '',
  end_date: '',
  is_closed: 0
};

export default function SemestersPage() {
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSem, setEditingSem] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axiosClient.get('/semesters');
      setSemesters(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Không thể tải danh sách học kỳ'
      );
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const open = semesters.filter((sem) => Number(sem.is_closed) !== 1).length;
    const closed = semesters.filter((sem) => Number(sem.is_closed) === 1).length;
    return { total: semesters.length, open, closed };
  }, [semesters]);

  const handleOpenModal = (semester = null) => {
    setEditingSem(semester);
    setFormData(semester ? { ...semester } : EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSem(null);
    setFormData(EMPTY_FORM);
    setFormError('');
  };

  const validateForm = () => {
    if (!formData.academic_year?.trim()) {
      setFormError('Vui lòng nhập niên khóa (ví dụ: 2024-2025)');
      return false;
    }
    if (!formData.semester_name?.trim()) {
      setFormError('Vui lòng nhập tên học kỳ');
      return false;
    }
    if (!formData.start_date) {
      setFormError('Vui lòng chọn ngày bắt đầu');
      return false;
    }
    if (!formData.end_date) {
      setFormError('Vui lòng chọn ngày kết thúc');
      return false;
    }
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      setFormError('Ngày bắt đầu phải trước ngày kết thúc');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setFormError('');

      const payload = {
        academic_year: formData.academic_year.trim(),
        semester_no: Number(formData.semester_no),
        semester_name: formData.semester_name.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_closed: Number(formData.is_closed)
      };

      if (editingSem) {
        await axiosClient.put(`/semesters/${editingSem.id}`, payload);
      } else {
        await axiosClient.post('/semesters', payload);
      }

      await fetchSemesters();
      handleCloseModal();
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Lỗi khi lưu học kỳ'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (semester) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa học kỳ "${semester.semester_name}"?`)) {
      return;
    }

    try {
      setSaving(true);
      await axiosClient.delete(`/semesters/${semester.id}`);
      await fetchSemesters();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Lỗi khi xóa học kỳ'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    fetchSemesters();
  };
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(semesters.length / pageSize)),
    [semesters.length, pageSize]
  );

  const paginatedSemesters = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return semesters.slice(startIndex, startIndex + pageSize);
  }, [semesters, currentPage, pageSize]);

  const pageStart = semesters.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, semesters.length);

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
        title="Quản lý học kỳ"
        subtitle="Tổng hợp các học kỳ đang theo dõi trong hệ thống"
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              <IconArrowLeft />
              Dashboard
            </button>
            <button className="btn btn-secondary" onClick={handleRefresh} disabled={loading}>
              <IconRefresh />
              Làm mới
            </button>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              <IconPlus />
              Thêm học kỳ
            </button>
          </>
        }
      />

      <div className="stats-grid">
        <StatCard
          label="Tổng học kỳ"
          value={stats.total}
          color="blue"
          icon={IconCalendar}
          helper="Tất cả bản ghi hiện có"
        />
        <StatCard
          label="Đang mở"
          value={stats.open}
          color="green"
          icon={IconCheck}
          helper="Học kỳ chưa khóa"
        />
        <StatCard
          label="Đã khóa"
          value={stats.closed}
          color="yellow"
          icon={IconLock}
          helper="Học kỳ đã hoàn tất"
        />
      </div>

      <div className="card">
        <div className="section-toolbar">
          <div>
            <div className="card__title">Danh sách học kỳ</div>
            <div className="card__subtitle">Sắp xếp theo niên khóa giảm dần</div>
          </div>
          <div className="section-toolbar__meta">{semesters.length} bản ghi</div>
        </div>

        {loading ? (
          <div className="loading loading--flex">
            <div className="loading__spinner" />
            Đang tải danh sách học kỳ...
          </div>
        ) : error ? (
          <EmptyPanel
            icon={<IconAlert />}
            title="Không thể tải dữ liệu"
            description={error}
            actions={<button className="btn btn-primary" onClick={handleRefresh}>Thử lại</button>}
          />
        ) : semesters.length === 0 ? (
          <EmptyPanel
            icon={<IconCalendar />}
            title="Chưa có học kỳ nào"
            description="Hãy thêm một học kỳ để bắt đầu."
            actions={
              <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                <IconPlus /> Thêm học kỳ
              </button>
            }
          />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Học kỳ</th>
                  <th>Tên học kỳ</th>
                  <th>Niên khóa</th>
                  <th>Bắt đầu</th>
                  <th>Kết thúc</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSemesters.map((semester) => {
                  const isClosed = Number(semester.is_closed) === 1;
                  return (
                    <tr key={semester.id}>
                      <td className="mono">{semester.semester_no ?? '-'}</td>
                      <td style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                        {semester.semester_name || '-'}
                      </td>
                      <td>{semester.academic_year || '-'}</td>
                      <td>{formatDate(semester.start_date)}</td>
                      <td>{formatDate(semester.end_date)}</td>
                      <td>
                        <span className={isClosed ? 'badge badge-neutral' : 'badge badge-safe'}>
                          {isClosed ? 'Đã khóa' : 'Đang mở'}
                        </span>
                      </td>
                      <td className="data-table__cell--actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenModal(semester)}
                          disabled={saving}
                        >
                          <IconEdit />
                          Sửa
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(semester)}
                          disabled={saving}
                        >
                          <IconTrash />
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {semesters.length > 0 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={semesters.length}
                pageStart={pageStart}
                pageEnd={pageEnd}
                itemName="kỳ học"
              />
            ) : null}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal" onClick={handleCloseModal}>
          <div className="modal__content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal__title">
              {editingSem ? 'Sửa học kỳ' : 'Thêm học kỳ mới'}
            </h3>

            {formError && (
              <div style={{
                backgroundColor: 'var(--red-50)',
                border: '1px solid var(--red-200)',
                color: 'var(--red-700)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                fontSize: 'var(--text-sm)'
              }}>
                {formError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Niên khóa</label>
              <input
                type="text"
                className="form-input"
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                placeholder="2024-2025"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kỳ học</label>
              <select
                className="form-select"
                value={formData.semester_no}
                onChange={(e) => setFormData({ ...formData, semester_no: e.target.value })}
              >
                <option value="1">Kỳ 1</option>
                <option value="2">Kỳ 2</option>
                <option value="3">Kỳ hè</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tên học kỳ</label>
              <input
                type="text"
                className="form-input"
                value={formData.semester_name}
                onChange={(e) => setFormData({ ...formData, semester_name: e.target.value })}
                placeholder="Học kỳ 1 năm học 2024-2025"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ngày bắt đầu</label>
              <input
                type="date"
                className="form-input"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ngày kết thúc</label>
              <input
                type="date"
                className="form-input"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  checked={Number(formData.is_closed) === 1}
                  onChange={(e) => setFormData({ ...formData, is_closed: e.target.checked ? 1 : 0 })}
                  style={{ marginRight: '8px' }}
                />
                Đã khóa học kỳ
              </label>
            </div>

            <div className="modal__actions">
              <button
                className="btn btn-secondary"
                onClick={handleCloseModal}
                disabled={saving}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
