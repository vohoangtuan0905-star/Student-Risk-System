import Pagination from "../components/Pagination";
import { useEffect, useMemo, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { PageHeader, EmptyPanel } from '../components/PageKit';
import * as XLSX from 'xlsx';

const IconBuilding = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
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

const IconUpload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// Modal component for Add/Edit Department
function DepartmentModal({ isOpen, department, onClose, onSave, loading }) {
  const [formData, setFormData] = useState({
    department_code: '',
    department_name: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (department) {
      setFormData({
        department_code: department.department_code || '',
        department_name: department.department_name || '',
        description: department.description || ''
      });
    } else {
      setFormData({
        department_code: '',
        department_name: '',
        description: ''
      });
    }
    setErrors({});
  }, [department, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.department_code.trim()) newErrors.department_code = 'Mã khoa không được bỏ trống';
    if (!formData.department_name.trim()) newErrors.department_name = 'Tên khoa không được bỏ trống';
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
            {department ? `Chỉnh sửa khoa: ${department.department_name}` : 'Thêm khoa mới'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="label">Mã khoa</label>
            <input
              type="text"
              className={`input ${errors.department_code ? 'input--error' : ''}`}
              value={formData.department_code}
              onChange={(e) => setFormData({ ...formData, department_code: e.target.value })}
              disabled={!!department}  // can't edit code
              placeholder="e.g., CNTT"
            />
            {errors.department_code && <div className="form-error">{errors.department_code}</div>}
          </div>

          <div className="form-group">
            <label className="label">Tên khoa</label>
            <input
              type="text"
              className={`input ${errors.department_name ? 'input--error' : ''}`}
              value={formData.department_name}
              onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
              placeholder="e.g., Công nghệ thông tin"
            />
            {errors.department_name && <div className="form-error">{errors.department_name}</div>}
          </div>

          <div className="form-group">
            <label className="label">Mô tả</label>
            <textarea
              className="input"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả chi tiết về khoa"
              rows="3"
            />
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
function ConfirmDeleteModal({ isOpen, departmentName, onConfirm, onCancel, loading }) {
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
            <div className="empty-state__title">Xóa khoa: {departmentName}?</div>
            <div className="empty-state__desc">
              Hành động này không thể hoàn tác. Tất cả lớp, sinh viên và tài liệu liên quan cũng sẽ bị xóa.
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

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Import state
  const [importOpen, setImportOpen] = useState(false);
  const [importStep, setImportStep] = useState(1);
  const [importFile, setImportFile] = useState(null);
  const [importColumns, setImportColumns] = useState([]);
  const [importPreview, setImportPreview] = useState([]);
  const [importMapping, setImportMapping] = useState({ department_code: '', department_name: '', description: '' });
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const [importResult, setImportResult] = useState(null);

  const resetImport = () => {
    setImportStep(1); setImportFile(null); setImportColumns([]); setImportPreview([]);
    setImportMapping({ department_code: '', department_name: '', description: '' });
    setImportError(''); setImportResult(null); setImportLoading(false);
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{ 'M\u00e3 Khoa': 'CNTT', 'T\u00ean Khoa': 'C\u00f4ng ngh\u1ec7 th\u00f4ng tin', 'M\u00f4 t\u1ea3': 'Khoa CNTT' }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'mau_import_khoa.xlsx');
  };

  const handlePreviewImport = async () => {
    if (!importFile) return setImportError('Vui l\u00f2ng ch\u1ecdn file Excel');
    setImportLoading(true); setImportError('');
    try {
      const fd = new FormData(); fd.append('file', importFile);
      const res = await axiosClient.post('/departments/import/preview', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const cols = res.data.headers || [];
      setImportColumns(cols); setImportPreview(res.data.dataPreview || []);
      const pick = (targets) => cols.find(c => targets.some(t => c.toLowerCase().includes(t))) || '';
      setImportMapping({ department_code: pick(['m\u00e3']), department_name: pick(['t\u00ean']), description: pick(['m\u00f4 t\u1ea3']) });
      setImportStep(2);
    } catch (err) { setImportError(err.response?.data?.message || 'L\u1ed7i khi \u0111\u1ecdc file'); }
    finally { setImportLoading(false); }
  };

  const handleSubmitImport = async () => {
    if (!importMapping.department_code || !importMapping.department_name) return setImportError('Vui l\u00f2ng map \u0111\u1ea7y \u0111\u1ee7 M\u00e3 khoa v\u00e0 T\u00ean khoa');
    setImportLoading(true); setImportError('');
    try {
      const fd = new FormData(); fd.append('file', importFile); fd.append('mapping', JSON.stringify(importMapping));
      const res = await axiosClient.post('/departments/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImportResult(res.data); await fetchDepartments();
    } catch (err) { setImportError(err.response?.data?.message || 'L\u1ed7i import'); }
    finally { setImportLoading(false); }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get('/departments');
      setDepartments(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách khoa');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAddDept = () => {
    setEditingDept(null);
    setModalOpen(true);
  };

  const handleEditDept = (dept) => {
    setEditingDept(dept);
    setModalOpen(true);
  };

  const handleSaveDept = async (formData) => {
    try {
      setActionLoading(true);
      if (editingDept) {
        await axiosClient.put(`/departments/${editingDept.id}`, formData);
        alert('Cập nhật khoa thành công');
      } else {
        await axiosClient.post('/departments', formData);
        alert('Thêm khoa thành công');
      }
      setModalOpen(false);
      setEditingDept(null);
      await fetchDepartments();
    } catch (err) {
      alert(err?.response?.data?.message || 'Lỗi khi lưu khoa');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = (dept) => {
    setConfirmDelete(dept);
  };

  const handleDeleteDept = async () => {
    try {
      setActionLoading(true);
      await axiosClient.delete(`/departments/${confirmDelete.id}`);
      alert('Xóa khoa thành công');
      setConfirmDelete(null);
      await fetchDepartments();
    } catch (err) {
      alert(err?.response?.data?.message || 'Lỗi khi xóa khoa');
      setConfirmDelete(null);
    } finally {
      setActionLoading(false);
    }
  };
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(departments.length / pageSize)),
    [departments.length, pageSize]
  );

  const paginatedDepartments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return departments.slice(startIndex, startIndex + pageSize);
  }, [departments, currentPage, pageSize]);

  const pageStart = departments.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, departments.length);

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
        title="Quản lý khoa"
        subtitle="Thêm, chỉnh sửa, xóa khoa học"
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => { resetImport(); setImportOpen(true); }}>
              <IconUpload />
              Import Excel
            </button>
            <button className="btn btn-secondary" onClick={handleDownloadTemplate}>
              <IconDownload />
              T\u1ea3i file m\u1eabu
            </button>
            <button className="btn btn-secondary" onClick={fetchDepartments} disabled={loading}>
              <IconRefresh />
              L\u00e0m m\u1edbi
            </button>
            <button className="btn btn-primary" onClick={handleAddDept}>
              <IconPlus />
              Th\u00eam khoa
            </button>
          </>
        }
      />

      <div className="card">
        <div className="section-toolbar">
          <div>
            <div className="card__title">Danh sách khoa</div>
            <div className="card__subtitle">Tất cả các khoa đang quản lý trong hệ thống</div>
          </div>
          <div className="section-toolbar__meta">
            {loading ? '...' : `${departments.length} khoa`}
          </div>
        </div>

        {loading ? (
          <div className="loading loading--flex">
            <div className="loading__spinner" />
            Đang tải danh sách khoa...
          </div>
        ) : error ? (
          <EmptyPanel
            icon={<IconAlert />}
            title="Không thể tải dữ liệu"
            description={error}
            actions={
              <button className="btn btn-primary" onClick={fetchDepartments}>
                Thử lại
              </button>
            }
          />
        ) : departments.length === 0 ? (
          <EmptyPanel
            icon={<IconBuilding />}
            title="Chưa có khoa nào"
            description="Hãy thêm khoa mới để bắt đầu quản lý."
            actions={
              <button className="btn btn-primary" onClick={handleAddDept}>
                <IconPlus />
                Thêm khoa
              </button>
            }
          />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã khoa</th>
                  <th>Tên khoa</th>
                  <th>Mô tả</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDepartments.map((dept) => (
                  <tr key={dept.id}>
                    <td className="mono" style={{ fontWeight: 600 }}>
                      {dept.department_code || '-'}
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {dept.department_name || '-'}
                    </td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dept.description || '-'}
                    </td>
                    <td className="mono">
                      {dept.created_at
                        ? new Date(dept.created_at).toLocaleDateString('vi-VN')
                        : '-'}
                    </td>
                    <td>
                      <div className="action-cell">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEditDept(dept)}
                          title="Chỉnh sửa"
                        >
                          <IconEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleConfirmDelete(dept)}
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

            {departments.length > 0 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={departments.length}
                pageStart={pageStart}
                pageEnd={pageEnd}
                itemName="khoa"
              />
            ) : null}
          </div>
        )}
      </div>

      {/* Modals */}
      <DepartmentModal
        isOpen={modalOpen}
        department={editingDept}
        onClose={() => { setModalOpen(false); setEditingDept(null); }}
        onSave={handleSaveDept}
        loading={actionLoading}
      />

      <ConfirmDeleteModal
        isOpen={!!confirmDelete}
        departmentName={confirmDelete?.department_name}
        onConfirm={handleDeleteDept}
        onCancel={() => setConfirmDelete(null)}
        loading={actionLoading}
      />

      {importOpen && (
        <div className="modal-overlay" onClick={() => setImportOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Import Khoa t\u1eeb Excel</h2>
              <button className="modal-close" onClick={() => setImportOpen(false)}>X</button>
            </div>
            <div className="modal-body">
              {importStep === 1 ? (
                <>
                  <div className="form-group">
                    <label className="label">Ch\u1ecdn file Excel *</label>
                    <input type="file" accept=".xlsx,.xls" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
                    <div className="form-hint" style={{ marginTop: 8 }}>Ch\u1ec9 ch\u1ea5p nh\u1eadn file .xlsx, .xls</div>
                    <div style={{ marginTop: 12 }}>
                      <button className="btn btn-secondary btn-sm" onClick={handleDownloadTemplate} type="button">
                        T\u1ea3i file m\u1eabu
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {importPreview.length > 0 && (
                    <div className="card" style={{ padding: 12, marginBottom: 16 }}>
                      <div className="card__subtitle">Xem tr\u01b0\u1edbc d\u1eef li\u1ec7u ({importPreview.length} d\u00f2ng)</div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="table"><thead><tr>{importColumns.map(c => <th key={c}>{c}</th>)}</tr></thead>
                          <tbody>{importPreview.map((row, i) => <tr key={i}>{importColumns.map((c, j) => <td key={j}>{row[j]}</td>)}</tr>)}</tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  <div className="card" style={{ padding: 12 }}>
                    <div className="card__subtitle">Gh\u00e9p c\u1ed9t d\u1eef li\u1ec7u</div>
                    <div className="form-group">
                      <label className="label">M\u00e3 khoa *</label>
                      <select className="input" value={importMapping.department_code} onChange={(e) => setImportMapping(p => ({ ...p, department_code: e.target.value }))}>
                        <option value="">-- Ch\u1ecdn c\u1ed9t --</option>
                        {importColumns.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="label">T\u00ean khoa *</label>
                      <select className="input" value={importMapping.department_name} onChange={(e) => setImportMapping(p => ({ ...p, department_name: e.target.value }))}>
                        <option value="">-- Ch\u1ecdn c\u1ed9t --</option>
                        {importColumns.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="label">M\u00f4 t\u1ea3</label>
                      <select className="input" value={importMapping.description} onChange={(e) => setImportMapping(p => ({ ...p, description: e.target.value }))}>
                        <option value="">-- Kh\u00f4ng d\u00f9ng --</option>
                        {importColumns.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}
              {importError && <div className="form-error" style={{ marginTop: 12 }}>{importError}</div>}
              {importResult && (
                <div className="card" style={{ marginTop: 12, padding: 12 }}>
                  <div className="card__subtitle">K\u1ebft qu\u1ea3 import</div>
                  <div>Th\u00eam m\u1edbi: {importResult.createdCount || 0}</div>
                  <div>C\u1eadp nh\u1eadt: {importResult.updatedCount || 0}</div>
                  <div>L\u1ed7i: {importResult.failedCount || 0}</div>
                  {importResult.errors?.length > 0 && (
                    <div style={{ marginTop: 8, padding: '8px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13 }}>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {importResult.errors.slice(0, 10).map((err, i) => <li key={i} style={{ color: '#991b1b' }}>D\u00f2ng {err.row}: {err.message}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              {importStep > 1 && <button className="btn btn-secondary" onClick={() => setImportStep(1)} disabled={importLoading}>\u2190 Quay l\u1ea1i</button>}
              <button className="btn btn-secondary" onClick={() => setImportOpen(false)} disabled={importLoading}>H\u1ee7y</button>
              {importStep === 1 ? (
                <button className="btn btn-primary" onClick={handlePreviewImport} disabled={importLoading}>{importLoading ? '\u0110ang x\u1eed l\u00fd...' : 'Ti\u1ebfp t\u1ee5c'}</button>
              ) : (
                <button className="btn btn-primary" onClick={handleSubmitImport} disabled={importLoading}>{importLoading ? '\u0110ang import...' : 'Import'}</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
