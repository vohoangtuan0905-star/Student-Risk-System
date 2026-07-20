import Pagination from "../components/Pagination";
import { useEffect, useMemo, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { PageHeader, EmptyPanel } from '../components/PageKit';
import * as XLSX from 'xlsx';

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

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
    if (!formData.full_name.trim()) newErrors.full_name = 'Há» tÃªn khÃ´ng Ä‘Æ°á»£c bá» trá»‘ng';
    if (!formData.email.trim()) newErrors.email = 'Email khÃ´ng Ä‘Æ°á»£c bá» trá»‘ng';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email khÃ´ng há»£p lá»‡';
    if (!lecturer && !formData.password) newErrors.password = 'Máº­t kháº©u khÃ´ng Ä‘Æ°á»£c bá» trá»‘ng';
    if (formData.password && formData.password.length < 6) newErrors.password = 'Máº­t kháº©u pháº£i tá»« 6 kÃ½ tá»±';
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
          <h2 className="modal-title">{lecturer ? `Chá»‰nh sá»­a giáº£ng viÃªn: ${lecturer.full_name}` : 'ThÃªm giáº£ng viÃªn má»›i'}</h2>
          <button className="modal-close" onClick={onClose}><IconX /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="label">Há» tÃªn</label>
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

            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="label">{lecturer ? 'Máº­t kháº©u má»›i (khÃ´ng báº¯t buá»™c)' : 'Máº­t kháº©u'}</label>
            <input
              type="password"
              className={`input ${errors.password ? 'input--error' : ''}`}
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label className="label">Khoa (tÃ¹y chá»n)</label>
            <select
              className="input"
              value={formData.department_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, department_id: e.target.value }))}
            >
              <option value="">-- KhÃ´ng chá»n --</option>
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
            <label htmlFor="lecturer-active" style={{ margin: 0 }}>TÃ i khoáº£n hoáº¡t Ä‘á»™ng</label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Há»§y</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Äang lÆ°u...' : 'LÆ°u'}</button>
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
          <h2 className="modal-title">PhÃ¢n cÃ´ng lá»›p chá»§ nhiá»‡m: {lecturer.full_name}</h2>
          <button className="modal-close" onClick={onClose}><IconX /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="card__subtitle" style={{ marginBottom: 10 }}>
            Chá»n tá»‘i Ä‘a {MAX_HOMEROOM_CLASSES} lá»›p. Äang chá»n {selectedClassIds.length}/{MAX_HOMEROOM_CLASSES}.
          </div>

          <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid var(--gray-200)', borderRadius: 10, padding: 10 }}>
            {classOptions.length === 0 ? (
              <div className="text-muted">KhÃ´ng cÃ³ lá»›p kháº£ dá»¥ng Ä‘á»ƒ phÃ¢n cÃ´ng.</div>
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
                  {isCurrent ? <span className="badge badge-safe">Äang phá»¥ trÃ¡ch</span> : null}
                </label>
              );
            })}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Há»§y</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Äang lÆ°u...' : 'LÆ°u phÃ¢n cÃ´ng'}</button>
          </div>
        </form>
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
    full_name: '',
    email: '',
    department_code: ''
  });

  if (!isOpen) return null;

  const closeImportModal = () => {
    setImportFile(null);
    setImportStep(1);
    setImportColumns([]);
    setImportDataPreview([]);
    setImportError('');
    setImportResult(null);
    setImportMapping({ full_name: '', email: '', department_code: '' });
    onClose();
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{
      'H? tên': 'Nguy?n Van A',
      'Email': 'nva@email.com',
      'Mã Khoa': 'CNTT'
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'mau_import_giangvien.xlsx');
  };

  const handlePreviewImport = async () => {
    if (!importFile) return setImportError('Vui lòng ch?n file Excel');
    setImportLoading(true);
    setImportError('');
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      const res = await axiosClient.post('/lecturers/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportColumns(res.data.headers || []);
      setImportDataPreview(res.data.dataPreview || []);
      setImportStep(2);
      
      const headers = res.data.headers || [];
      const nameCol = headers.find(h => h.toLowerCase().includes('tên'));
      const emailCol = headers.find(h => h.toLowerCase().includes('email'));
      const deptCol = headers.find(h => h.toLowerCase().includes('khoa'));
      setImportMapping({
        full_name: nameCol || headers[0] || '',
        email: emailCol || headers[1] || '',
        department_code: deptCol || headers[2] || ''
      });
    } catch (err) {
      setImportError(err.response?.data?.message || 'L?i khi d?c file Excel');
    } finally {
      setImportLoading(false);
    }
  };

  const handleSubmitImport = async () => {
    if (!importMapping.full_name || !importMapping.email) {
      return setImportError('Vui lòng map d?y d? H? tên và Email');
    }
    setImportLoading(true);
    setImportError('');
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('mapping', JSON.stringify(importMapping));
      const res = await axiosClient.post('/lecturers/import', formData, {
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
          <h2 className="modal-title">Import Gi?ng viên t? Excel</h2>
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
              <div className="card__subtitle">Ghép c?t d? li?u</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label className="label">C?t H? tên *</label>
                  <select className="input" value={importMapping.full_name} onChange={(e) => setImportMapping(p => ({ ...p, full_name: e.target.value }))}>
                    <option value="">-- Ch?n c?t --</option>
                    {importColumns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">C?t Email *</label>
                  <select className="input" value={importMapping.email} onChange={(e) => setImportMapping(p => ({ ...p, email: e.target.value }))}>
                    <option value="">-- Ch?n c?t --</option>
                    {importColumns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">C?t Mã khoa</label>
                  <select className="input" value={importMapping.department_code} onChange={(e) => setImportMapping(p => ({ ...p, department_code: e.target.value }))}>
                    <option value="">-- Ch?n c?t (Tùy ch?n) --</option>
                    {importColumns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-hint" style={{ marginTop: 8 }}>
                Luu ý: M?t kh?u m?c d?nh cho các Gi?ng viên m?i s? là <strong>123456</strong>. Mã Gi?ng viên (GVxxxx) s? du?c t? d?ng t?o.
              </div>
              {importError && <div className="form-error">{importError}</div>}
            </>
          )}
          {importStep === 3 && importResult && (
            <>
              <div className="card__subtitle">K?t qu? import</div>
              <div>Thêm m?i: {importResult.createdCount || 0}</div>
              <div>C?p nh?t: {importResult.updatedCount || 0}</div>
              <div>L?i: {importResult.failedCount || 0}</div>
              {importResult.errors?.length > 0 && (
                <div style={{ marginTop: 12, maxHeight: 150, overflowY: 'auto', background: '#fee2e2', padding: 8, borderRadius: 4 }}>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {importResult.errors.slice(0,10).map((err, i) => (
                      <li key={i} style={{ color: '#991b1b' }}>Dòng {err.row}: {err.message}</li>
                    ))}
                    {importResult.errors.length > 10 && <li style={{ color: '#991b1b', fontStyle: 'italic' }}>...và {importResult.errors.length - 10} l?i khác</li>}
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
          <button type="button" className="btn btn-secondary" onClick={closeImportModal} disabled={importLoading}>Ðóng</button>
          {importStep === 1 ? (
            <button type="button" className="btn btn-primary" onClick={handlePreviewImport} disabled={importLoading}>
              {importLoading ? 'Ðang t?i...' : 'Ti?p t?c'}
            </button>
          ) : importStep === 2 ? (
            <button type="button" className="btn btn-primary" onClick={handleSubmitImport} disabled={importLoading}>
              {importLoading ? 'Ðang import...' : 'Import'}
            </button>
          ) : null}
        </div>
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
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningLecturer, setAssigningLecturer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');

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
      setError(err?.response?.data?.message || 'KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u giáº£ng viÃªn');
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
        alert('Cáº­p nháº­t giáº£ng viÃªn thÃ nh cÃ´ng');
      } else {
        await axiosClient.post('/lecturers', payload);
        alert('ThÃªm giáº£ng viÃªn thÃ nh cÃ´ng');
      }
      setModalOpen(false);
      setEditingLecturer(null);
      await fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Lá»—i khi lÆ°u giáº£ng viÃªn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLecturer = async (lecturer) => {
    const confirmed = window.confirm(`XÃ³a giáº£ng viÃªn ${lecturer.full_name}?`);
    if (!confirmed) return;

    try {
      setActionLoading(true);
      await axiosClient.delete(`/lecturers/${lecturer.id}`);
      alert('XÃ³a giáº£ng viÃªn thÃ nh cÃ´ng');
      await fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Lá»—i khi xÃ³a giáº£ng viÃªn');
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
      alert('LÆ°u phÃ¢n cÃ´ng chá»§ nhiá»‡m thÃ nh cÃ´ng');
      setAssignModalOpen(false);
      setAssigningLecturer(null);
      await fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Lá»—i khi phÃ¢n cÃ´ng lá»›p chá»§ nhiá»‡m');
    } finally {
      setActionLoading(false);
    }
  };

  const renderHomeroomStatus = (lecturer) => {
    const classCount = Number(lecturer.homeroom_class_count || 0);
    let statusClass = 'badge-gray';
    let statusText = 'ChÆ°a phÃ¢n cÃ´ng';

    if (classCount === 1) {
      statusClass = 'badge-warning';
      statusText = 'Äang phá»¥ trÃ¡ch 1/2';
    }
    if (classCount >= MAX_HOMEROOM_CLASSES) {
      statusClass = 'badge-success';
      statusText = `Äá»§ ${MAX_HOMEROOM_CLASSES}/${MAX_HOMEROOM_CLASSES}`;
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
            <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>ChÆ°a cÃ³ lá»›p chá»§ nhiá»‡m</span>
          )}
        </div>
      </div>
    );
  };
  const sortedLecturers = useMemo(() => {
    const arr = [...lecturers];
    switch (sortBy) {
      case 'name-asc':
        return arr.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '', 'vi'));
      case 'name-desc':
        return arr.sort((a, b) => (b.full_name || '').localeCompare(a.full_name || '', 'vi'));
      case 'email-asc':
        return arr.sort((a, b) => (a.email || '').localeCompare(b.email || '', 'vi'));
      case 'email-desc':
        return arr.sort((a, b) => (b.email || '').localeCompare(a.email || '', 'vi'));
      default:
        return arr;
    }
  }, [lecturers, sortBy]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(sortedLecturers.length / pageSize)),
    [sortedLecturers.length, pageSize]
  );

  const paginatedLecturers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedLecturers.slice(startIndex, startIndex + pageSize);
  }, [sortedLecturers, currentPage, pageSize]);

  const pageStart = sortedLecturers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, sortedLecturers.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);


  return (
    <div className="page-wrapper">
      <PageHeader
        title="Quáº£n lÃ½ giáº£ng viÃªn"
        subtitle="CRUD giáº£ng viÃªn vÃ  phÃ¢n cÃ´ng má»—i giáº£ng viÃªn phá»¥ trÃ¡ch tá»‘i Ä‘a 2 lá»›p"
        actions={(
          <>
            <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
              <IconRefresh />
              LÃ m má»›i
            </button>
            <button className="btn btn-primary" onClick={() => { setEditingLecturer(null); setModalOpen(true); }}>
              <IconPlus />
              ThÃªm giáº£ng viÃªn
            </button>
          </>
        )}
      />

      <div className="stats-grid">
        <div className="stat-card stat-card--blue"><div className="stat-card__icon stat-card__icon--blue"><IconUsers /></div><div className="stat-card__body"><div className="stat-card__value">{stats.total}</div><div className="stat-card__label">Tá»•ng giáº£ng viÃªn</div></div></div>
        <div className="stat-card stat-card--green"><div className="stat-card__icon stat-card__icon--green"><IconUsers /></div><div className="stat-card__body"><div className="stat-card__value">{stats.active}</div><div className="stat-card__label">Äang hoáº¡t Ä‘á»™ng</div></div></div>
        <div className="stat-card stat-card--yellow"><div className="stat-card__icon stat-card__icon--yellow"><IconUsers /></div><div className="stat-card__body"><div className="stat-card__value">{stats.fullyAssigned}</div><div className="stat-card__label">Äá»§ 2 lá»›p chá»§ nhiá»‡m</div></div></div>
      </div>

      <div className="card">
        <div className="section-toolbar">
          <div>
            <div className="card__title">Danh sÃ¡ch giáº£ng viÃªn</div>
            <div className="card__subtitle">Theo dÃµi phÃ¢n cÃ´ng chá»§ nhiá»‡m theo tá»«ng giáº£ng viÃªn</div>
          </div>
          <div className="section-toolbar__meta">{loading ? '...' : `${lecturers.length} giáº£ng viÃªn`}</div>
        </div>

        <div className="filter-bar filter-bar--flex">
          <div className="filter-bar__search">
            <span className="filter-bar__search-icon">
              <IconSearch />
            </span>
            <input
              className="input"
              placeholder="TÃ¬m theo mÃ£, há» tÃªn, email, khoa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name-asc">Há» tÃªn A â†’ Z</option>
            <option value="name-desc">Há» tÃªn Z â†’ A</option>
            <option value="email-asc">Email A â†’ Z</option>
            <option value="email-desc">Email Z â†’ A</option>
          </select>

          <button className="btn btn-secondary" onClick={() => { setSearchTerm(''); setSortBy('name-asc'); }}>
            XÃ³a bá»™ lá»c
          </button>
        </div>

        {loading ? (
          <div className="loading loading--flex"><div className="loading__spinner" />Äang táº£i dá»¯ liá»‡u giáº£ng viÃªn...</div>
        ) : error ? (
          <EmptyPanel icon={<IconAlert />} title="KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u" description={error} actions={<button className="btn btn-primary" onClick={fetchData}>Thá»­ láº¡i</button>} />
        ) : lecturers.length === 0 ? (
          <EmptyPanel icon={<IconUsers />} title="ChÆ°a cÃ³ giáº£ng viÃªn" description="HÃ£y thÃªm giáº£ng viÃªn Ä‘á»ƒ báº¯t Ä‘áº§u phÃ¢n cÃ´ng chá»§ nhiá»‡m" />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>MÃ£ GV</th>
                  <th>Há» tÃªn</th>
                  <th>Email</th>
                  <th>Khoa</th>
                  <th>Tráº¡ng thÃ¡i</th>
                  <th>Chá»§ nhiá»‡m</th>
                  <th>HÃ nh Ä‘á»™ng</th>
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
                        {Number(lecturer.is_active) === 1 ? 'Hoáº¡t Ä‘á»™ng' : 'VÃ´ hiá»‡u hÃ³a'}
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
                          title="PhÃ¢n cÃ´ng chá»§ nhiá»‡m"
                        >
                          <IconAssign />
                          PhÃ¢n cÃ´ng
                        </button>
                        <button className="btn btn-sm btn-secondary" onClick={() => { setEditingLecturer(lecturer); setModalOpen(true); }} title="Chá»‰nh sá»­a">
                          <IconEdit />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteLecturer(lecturer)} disabled={actionLoading} title="XÃ³a">
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sortedLecturers.length > 0 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={sortedLecturers.length}
                pageStart={pageStart}
                pageEnd={pageEnd}
                itemName="giáº£ng viÃªn"
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

