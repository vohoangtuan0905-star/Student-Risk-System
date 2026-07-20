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

const IconUpload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

function ImportModal({ isOpen, onClose }) {
  const [importFile, setImportFile] = useState(null);
  const [importStep, setImportStep] = useState(1);
  const [importColumns, setImportColumns] = useState([]);
  const [importDataPreview, setImportDataPreview] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [importMapping, setImportMapping] = useState({
    department_code: '',
    department_name: '',
    description: ''
  });

  if (!isOpen) return null;

  const closeImportModal = () => {
    setImportFile(null);
    setImportStep(1);
    setImportColumns([]);
    setImportDataPreview([]);
    setImportError('');
    setImportResult(null);
    setImportMapping({ department_code: '', department_name: '', description: '' });
    onClose();
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{
      'M� Khoa': 'CNTT',
      'T�n Khoa': 'C�ng ngh? th�ng tin',
      'M� t?': 'Khoa C�ng ngh? th�ng tin'
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'mau_import_khoa.xlsx');
  };

  const handlePreviewImport = async () => {
    if (!importFile) return setImportError('Vui l�ng ch?n file Excel');
    setImportLoading(true);
    setImportError('');
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      const res = await axiosClient.post('/departments/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportColumns(res.data.headers || []);
      setImportDataPreview(res.data.dataPreview || []);
      setImportStep(2);
      
      const headers = res.data.headers || [];
      const codeCol = headers.find(h => h.toLowerCase().includes('m�'));
      const nameCol = headers.find(h => h.toLowerCase().includes('t�n'));
      const descCol = headers.find(h => h.toLowerCase().includes('m� t?'));
      setImportMapping({
        department_code: codeCol || headers[0] || '',
        department_name: nameCol || headers[1] || '',
        description: descCol || headers[2] || ''
      });
    } catch (err) {
      setImportError(err.response?.data?.message || 'L?i khi d?c file Excel');
    } finally {
      setImportLoading(false);
    }
  };

  const handleSubmitImport = async () => {
    if (!importMapping.department_code || !importMapping.department_name) {
      return setImportError('Vui l�ng map d?y d? M� khoa v� T�n khoa');
    }
    setImportLoading(true);
    setImportError('');
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('mapping', JSON.stringify(importMapping));
      const res = await axiosClient.post('/departments/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportResult(res.data);
      setImportStep(3);
    } catch (err) {
      setImportError(err.response?.data?.message || 'L?i khi import d? li?u');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeImportModal}>
      <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Import Khoa t? Excel</h2>
          <button className="modal-close" onClick={closeImportModal} disabled={importLoading}><IconX /></button>
        </div>
        <div className="modal-body">
          {importStep === 1 && (
            <>
              <div className="form-group">
                <label className="label">Ch?n file Excel *</label>
                <input type="file" accept=".xlsx,.xls" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
                <div style={{ marginTop: 12 }}>
                  <button className="btn btn-secondary btn-sm" onClick={handleDownloadTemplate} type="button">
                    T?i file m?u
                  </button>
                </div>
              </div>
              {importError && <div className="form-error">{importError}</div>}
            </>
          )}
          {importStep === 2 && (
            <>
              <div className="card__subtitle">Gh�p c?t d? li?u</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label className="label">C?t M� khoa *</label>
                  <select className="input" value={importMapping.department_code} onChange={(e) => setImportMapping(p => ({ ...p, department_code: e.target.value }))}>
                    <option value="">-- Ch?n c?t --</option>
                    {importColumns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">C?t T�n khoa *</label>
                  <select className="input" value={importMapping.department_name} onChange={(e) => setImportMapping(p => ({ ...p, department_name: e.target.value }))}>
                    <option value="">-- Ch?n c?t --</option>
                    {importColumns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">C?t M� t?</label>
                  <select className="input" value={importMapping.description} onChange={(e) => setImportMapping(p => ({ ...p, description: e.target.value }))}>
                    <option value="">-- Ch?n c?t (T�y ch?n) --</option>
                    {importColumns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {importError && <div className="form-error">{importError}</div>}
            </>
          )}
          {importStep === 3 && importResult && (
            <>
              <div className="card__subtitle">K?t qu? import</div>
              <div>Th�m m?i: {importResult.createdCount || 0}</div>
              <div>C?p nh?t: {importResult.updatedCount || 0}</div>
              <div>L?i: {importResult.failedCount || 0}</div>
              {importResult.errors?.length > 0 && (
                <div style={{ marginTop: 12, maxHeight: 150, overflowY: 'auto', background: '#fee2e2', padding: 8, borderRadius: 4 }}>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {importResult.errors.slice(0,10).map((err, i) => (
                      <li key={i} style={{ color: '#991b1b' }}>D�ng {err.row}: {err.message}</li>
                    ))}
                    {importResult.errors.length > 10 && <li style={{ color: '#991b1b', fontStyle: 'italic' }}>...v� {importResult.errors.length - 10} l?i kh�c</li>}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
        <div className="modal-footer">
          {importStep > 1 && importStep < 3 && (
            <button type="button" className="btn btn-secondary" onClick={() => setImportStep(1)} disabled={importLoading}>Quay l?i</button>
          )}
          <button type="button" className="btn btn-secondary" onClick={closeImportModal} disabled={importLoading}>��ng</button>
          {importStep === 1 ? (
            <button type="button" className="btn btn-primary" onClick={handlePreviewImport} disabled={importLoading}>
              {importLoading ? '�ang t?i...' : 'Ti?p t?c'}
            </button>
          ) : importStep === 2 ? (
            <button type="button" className="btn btn-primary" onClick={handleSubmitImport} disabled={importLoading}>
              {importLoading ? '�ang import...' : 'Import'}
            </button>
          ) : null}
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
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

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
            <button className="btn btn-secondary" onClick={() => setImportModalOpen(true)} disabled={loading}>
              <IconUpload />
              Import Khoa
            </button><button
              className="btn btn-secondary"
              onClick={fetchDepartments}
              disabled={loading}
            >
              <IconRefresh />
              Làm mới
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAddDept}
            >
              <IconPlus />
              Thêm khoa
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
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => {
          setImportModalOpen(false);
          fetchDepartments();
        }}
      />
      <DepartmentModal
        isOpen={modalOpen}
        department={editingDept}
        onClose={() => {
          setModalOpen(false);
          setEditingDept(null);
        }}
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
    </div>
  );
}


