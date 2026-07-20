import Pagination from "../components/Pagination";
import { useMemo, useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { PageHeader, EmptyPanel } from '../components/PageKit';
import * as XLSX from 'xlsx';

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
    if (!formData.class_code.trim()) newErrors.class_code = 'MÃ£ lá»›p khÃ´ng Ä‘Æ°á»£c bá» trá»‘ng';
    if (!formData.class_name.trim()) newErrors.class_name = 'TÃªn lá»›p khÃ´ng Ä‘Æ°á»£c bá» trá»‘ng';
    if (!formData.department_id) newErrors.department_id = 'Vui lÃ²ng chá»n khoa';
    if (!formData.school_year.trim()) newErrors.school_year = 'NÄƒm há»c khÃ´ng Ä‘Æ°á»£c bá» trá»‘ng';
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
            {classItem ? `Chá»‰nh sá»­a lá»›p: ${classItem.class_name}` : 'ThÃªm lá»›p má»›i'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="label">MÃ£ lá»›p</label>
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
            <label className="label">TÃªn lá»›p</label>
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
              <option value="">-- Chá»n khoa --</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.department_name} ({dept.department_code})
                </option>
              ))}
            </select>
            {errors.department_id && <div className="form-error">{errors.department_id}</div>}
          </div>

          <div className="form-group">
            <label className="label">NÄƒm há»c</label>
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
            <label className="label">GV chá»§ nhiá»‡m (tÃ¹y chá»n)</label>
            <select
              className="input"
              value={formData.homeroom_teacher_id || ''}
              onChange={(e) => setFormData({ ...formData, homeroom_teacher_id: e.target.value ? Number(e.target.value) : '' })}
            >
              <option value="">-- KhÃ´ng gÃ¡n chá»§ nhiá»‡m --</option>
              {teachers.map((teacher) => {
                const classCount = Number(teacher.homeroom_class_count || 0);
                const isCurrentHomeroom = Number(classItem?.homeroom_teacher_id) === Number(teacher.id);
                const reachedLimit = classCount >= 2 && !isCurrentHomeroom;

                return (
                  <option key={teacher.id} value={teacher.id} disabled={reachedLimit}>
                    {teacher.full_name} ({teacher.email}) - {classCount}/2 lá»›p{reachedLimit ? ' - ÄÃ£ Ä‘á»§' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Há»§y
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Äang lÆ°u...' : 'LÆ°u'}
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
          <h2 className="modal-title">XÃ¡c nháº­n xÃ³a</h2>
          <button className="modal-close" onClick={onCancel}>
            <IconX />
          </button>
        </div>

        <div className="modal-body">
          <div className="empty-state empty-state--compact">
            <div className="empty-state__icon" style={{ color: 'var(--red-500)' }}>
              <IconAlert />
            </div>
            <div className="empty-state__title">XÃ³a lá»›p: {className}?</div>
            <div className="empty-state__desc">
              HÃ nh Ä‘á»™ng nÃ y khÃ´ng thá»ƒ hoÃ n tÃ¡c. Táº¥t cáº£ sinh viÃªn vÃ  báº£n ghi há»c táº­p cÅ©ng sáº½ bá»‹ xÃ³a.
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Há»§y
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Äang xÃ³a...' : 'XÃ³a'}
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
    class_code: '',
    class_name: '',
    department_code: '',
    lecturer_code: '',
    school_year: ''
  });

  if (!isOpen) return null;

  const closeImportModal = () => {
    setImportFile(null);
    setImportStep(1);
    setImportColumns([]);
    setImportDataPreview([]);
    setImportError('');
    setImportResult(null);
    setImportMapping({ class_code: '', class_name: '', department_code: '', lecturer_code: '', school_year: '' });
    onClose();
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{
      'Mã L?p': 'CNTT01',
      'Tên L?p': 'Công ngh? thông tin 01',
      'Mã Khoa': 'CNTT',
      'Mã GVCN': 'GV0001',
      'Khóa h?c': '2023-2027'
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'mau_import_lop.xlsx');
  };

  const handlePreviewImport = async () => {
    if (!importFile) return setImportError('Vui lòng ch?n file Excel');
    setImportLoading(true);
    setImportError('');
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      const res = await axiosClient.post('/classes/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportColumns(res.data.headers || []);
      setImportDataPreview(res.data.dataPreview || []);
      setImportStep(2);
      
      const headers = res.data.headers || [];
      const codeCol = headers.find(h => h.toLowerCase().includes('mã l?p'));
      const nameCol = headers.find(h => h.toLowerCase().includes('tên'));
      const deptCol = headers.find(h => h.toLowerCase().includes('khoa'));
      const gvCol = headers.find(h => h.toLowerCase().includes('gvcn') || h.toLowerCase().includes('gi?ng viên'));
      const yearCol = headers.find(h => h.toLowerCase().includes('khóa') || h.toLowerCase().includes('nam'));
      setImportMapping({
        class_code: codeCol || headers[0] || '',
        class_name: nameCol || headers[1] || '',
        department_code: deptCol || headers[2] || '',
        lecturer_code: gvCol || headers[3] || '',
        school_year: yearCol || headers[4] || ''
      });
    } catch (err) {
      setImportError(err.response?.data?.message || 'L?i khi d?c file Excel');
    } finally {
      setImportLoading(false);
    }
  };

  const handleSubmitImport = async () => {
    if (!importMapping.class_code || !importMapping.class_name || !importMapping.department_code) {
      return setImportError('Vui lòng map d?y d? Mã l?p, Tên l?p và Mã khoa');
    }
    setImportLoading(true);
    setImportError('');
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('mapping', JSON.stringify(importMapping));
      const res = await axiosClient.post('/classes/import', formData, {
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
          <h2 className="modal-title">Import L?p t? Excel</h2>
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
                  <label className="label">C?t Mã l?p *</label>
                  <select className="input" value={importMapping.class_code} onChange={(e) => setImportMapping(p => ({ ...p, class_code: e.target.value }))}>
                    <option value="">-- Ch?n c?t --</option>
                    {importColumns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">C?t Tên l?p *</label>
                  <select className="input" value={importMapping.class_name} onChange={(e) => setImportMapping(p => ({ ...p, class_name: e.target.value }))}>
                    <option value="">-- Ch?n c?t --</option>
                    {importColumns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">C?t Mã khoa *</label>
                  <select className="input" value={importMapping.department_code} onChange={(e) => setImportMapping(p => ({ ...p, department_code: e.target.value }))}>
                    <option value="">-- Ch?n c?t --</option>
                    {importColumns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">C?t Mã GVCN</label>
                  <select className="input" value={importMapping.lecturer_code} onChange={(e) => setImportMapping(p => ({ ...p, lecturer_code: e.target.value }))}>
                    <option value="">-- Ch?n c?t (Tùy ch?n) --</option>
                    {importColumns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Khóa h?c</label>
                  <select className="input" value={importMapping.school_year} onChange={(e) => setImportMapping(p => ({ ...p, school_year: e.target.value }))}>
                    <option value="">-- Ch?n c?t (Tùy ch?n) --</option>
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

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('name-asc');

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
      setError(err?.response?.data?.message || 'KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u');
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
        alert('Cáº­p nháº­t lá»›p thÃ nh cÃ´ng');
      } else {
        await axiosClient.post('/classes', formData);
        alert('ThÃªm lá»›p thÃ nh cÃ´ng');
      }
      setModalOpen(false);
      setEditingClass(null);
      await fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Lá»—i khi lÆ°u lá»›p');
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
      alert('XÃ³a lá»›p thÃ nh cÃ´ng');
      setConfirmDelete(null);
      await fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Lá»—i khi xÃ³a lá»›p');
      setConfirmDelete(null);
    } finally {
      setActionLoading(false);
    }
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find((d) => d.id === deptId);
    return dept ? `${dept.department_name} (${dept.department_code})` : '-';
  };
  const filteredClasses = useMemo(() => {
    const kw = keyword.toLowerCase();
    return classes.filter((cls) => {
      const matchKeyword = !kw
        || (cls.class_code || '').toLowerCase().includes(kw)
        || (cls.class_name || '').toLowerCase().includes(kw)
        || (cls.homeroom_teacher_name || '').toLowerCase().includes(kw)
        || (cls.school_year || '').toLowerCase().includes(kw);
      const matchDept = departmentFilter === 'ALL' || String(cls.department_id) === departmentFilter;
      return matchKeyword && matchDept;
    });
  }, [classes, keyword, departmentFilter]);

  const sortedClasses = useMemo(() => {
    const arr = [...filteredClasses];
    switch (sortBy) {
      case 'name-asc':
        return arr.sort((a, b) => (a.class_name || '').localeCompare(b.class_name || '', 'vi'));
      case 'name-desc':
        return arr.sort((a, b) => (b.class_name || '').localeCompare(a.class_name || '', 'vi'));
      case 'code-asc':
        return arr.sort((a, b) => (a.class_code || '').localeCompare(b.class_code || '', 'vi'));
      case 'code-desc':
        return arr.sort((a, b) => (b.class_code || '').localeCompare(a.class_code || '', 'vi'));
      case 'newest':
        return arr.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      case 'oldest':
        return arr.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
      default:
        return arr;
    }
  }, [filteredClasses, sortBy]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(sortedClasses.length / pageSize)),
    [sortedClasses.length, pageSize]
  );

  const paginatedClasses = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedClasses.slice(startIndex, startIndex + pageSize);
  }, [sortedClasses, currentPage, pageSize]);

  const pageStart = sortedClasses.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, sortedClasses.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, departmentFilter, sortBy, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);


  return (
    <div className="page-wrapper">
      <PageHeader
        title="Quáº£n lÃ½ lá»›p há»c"
        subtitle="ThÃªm, chá»‰nh sá»­a, xÃ³a lá»›p há»c"
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => setImportModalOpen(true)} disabled={loading}>
              <IconUpload />
              Import L?p
            </button><button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
              <IconRefresh />
              LÃ m má»›i
            </button>
            <button className="btn btn-primary" onClick={handleAddClass}>
              <IconPlus />
              ThÃªm lá»›p
            </button>
          </>
        }
      />

      <div className="card">
        <div className="section-toolbar">
          <div>
            <div className="card__title">Danh sÃ¡ch lá»›p há»c</div>
            <div className="card__subtitle">TÃ¬m theo mÃ£ lá»›p, tÃªn lá»›p, GV chá»§ nhiá»‡m</div>
          </div>
          <div className="section-toolbar__meta">
            {loading ? '...' : `Äang hiá»ƒn thá»‹ ${sortedClasses.length}/${classes.length} lá»›p`}
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
              placeholder="TÃ¬m theo mÃ£ lá»›p, tÃªn lá»›p, GV chá»§ nhiá»‡m..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <select
            className="select"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="ALL">Táº¥t cáº£ khoa</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.department_name}</option>
            ))}
          </select>

          <select
            className="select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name-asc">TÃªn lá»›p A â†’ Z</option>
            <option value="name-desc">TÃªn lá»›p Z â†’ A</option>
            <option value="code-asc">MÃ£ lá»›p A â†’ Z</option>
            <option value="code-desc">MÃ£ lá»›p Z â†’ A</option>
            <option value="newest">Má»›i nháº¥t</option>
            <option value="oldest">CÅ© nháº¥t</option>
          </select>

          <button className="btn btn-secondary" onClick={() => { setKeyword(''); setDepartmentFilter('ALL'); setSortBy('name-asc'); }}>
            XÃ³a bá»™ lá»c
          </button>
        </div>

        {loading ? (
          <div className="loading loading--flex">
            <div className="loading__spinner" />
            Äang táº£i danh sÃ¡ch lá»›p há»c...
          </div>
        ) : error ? (
          <EmptyPanel
            icon={<IconAlert />}
            title="KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u"
            description={error}
            actions={
              <button className="btn btn-primary" onClick={fetchData}>
                Thá»­ láº¡i
              </button>
            }
          />
        ) : classes.length === 0 ? (
          <EmptyPanel
            icon={<IconUsers />}
            title="ChÆ°a cÃ³ lá»›p nÃ o"
            description="HÃ£y thÃªm lá»›p má»›i Ä‘á»ƒ báº¯t Ä‘áº§u quáº£n lÃ½."
            actions={
              <button className="btn btn-primary" onClick={handleAddClass}>
                <IconPlus />
                ThÃªm lá»›p
              </button>
            }
          />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>MÃ£ lá»›p</th>
                  <th>TÃªn lá»›p</th>
                  <th>Khoa</th>
                  <th>NÄƒm há»c</th>
                  <th>GV chá»§ nhiá»‡m</th>
                  <th>NgÃ y táº¡o</th>
                  <th>HÃ nh Ä‘á»™ng</th>
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
                          title="Chá»‰nh sá»­a"
                        >
                          <IconEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleConfirmDelete(cls)}
                          title="XÃ³a"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sortedClasses.length > 0 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={sortedClasses.length}
                pageStart={pageStart}
                pageEnd={pageEnd}
                itemName="lá»›p"
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
          fetchClasses();
        }}
      />
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


