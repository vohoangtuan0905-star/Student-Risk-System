import Pagination from "../components/Pagination";
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
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

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
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

function StudentModal({
  isOpen,
  student,
  departments,
  classes,
  onClose,
  onSave,
  loading
}) {
  const [formData, setFormData] = useState({
    student_code: '',
    full_name: '',
    department_id: '',
    class_id: '',
    date_of_birth: '',
    gender: 'Other',
    email: '',
    phone: '',
    address: '',
    actual_status: 'Enrolled',
    enrollment_year: '',
    note: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (student) {
      setFormData({
        student_code: student.student_code || '',
        full_name: student.full_name || '',
        department_id: student.department_id ? String(student.department_id) : '',
        class_id: student.class_id ? String(student.class_id) : '',
        date_of_birth: student.date_of_birth ? String(student.date_of_birth).slice(0, 10) : '',
        gender: student.gender || 'Other',
        email: student.email || '',
        phone: student.phone || '',
        address: student.address || '',
        actual_status: student.actual_status || 'Enrolled',
        enrollment_year: student.enrollment_year ? String(student.enrollment_year) : '',
        note: student.note || ''
      });
    } else {
      setFormData({
        student_code: '',
        full_name: '',
        department_id: '',
        class_id: '',
        date_of_birth: '',
        gender: 'Other',
        email: '',
        phone: '',
        address: '',
        actual_status: 'Enrolled',
        enrollment_year: '',
        note: ''
      });
    }
    setErrors({});
  }, [student, isOpen]);

  const filteredClasses = useMemo(() => {
    if (!formData.department_id) return classes;
    return classes.filter((cls) => String(cls.department_id) === String(formData.department_id));
  }, [classes, formData.department_id]);

  const handleDepartmentChange = (value) => {
    setFormData((prev) => {
      const next = { ...prev, department_id: value };
      if (prev.class_id) {
        const selectedClass = classes.find((cls) => String(cls.id) === String(prev.class_id));
        if (selectedClass && String(selectedClass.department_id) !== String(value)) {
          next.class_id = '';
        }
      }
      return next;
    });
  };

  const handleClassChange = (value) => {
    setFormData((prev) => {
      const selectedClass = classes.find((cls) => String(cls.id) === String(value));
      return {
        ...prev,
        class_id: value,
        department_id: selectedClass?.department_id
          ? String(selectedClass.department_id)
          : prev.department_id
      };
    });
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.student_code.trim()) nextErrors.student_code = 'Mã sinh viên không được bỏ trống';
    if (!formData.full_name.trim()) nextErrors.full_name = 'Họ tên không được bỏ trống';
    if (!formData.department_id) nextErrors.department_id = 'Vui lòng chọn khoa';
    if (!formData.class_id) nextErrors.class_id = 'Vui lòng chọn lớp';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const payload = {
      student_code: formData.student_code.trim(),
      full_name: formData.full_name.trim(),
      department_id: Number(formData.department_id),
      class_id: Number(formData.class_id),
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || 'Other',
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      address: formData.address.trim() || null,
      gpa: 0,
      absences: 0,
      tuition_debt: 0,
      scholarship: 0,
      risk_percentage: 0,
      risk_level: 'Safe',
      actual_status: formData.actual_status || 'Enrolled',
      enrollment_year: formData.enrollment_year.trim() || null,
      note: formData.note.trim() || null
    };

    await onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {student ? `Chỉnh sửa sinh viên: ${student.full_name}` : 'Thêm sinh viên mới'}
          </h2>
          <button className="modal-close" onClick={onClose}>X</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="label">Mã sinh viên *</label>
            <input
              className={`input ${errors.student_code ? 'input--error' : ''}`}
              value={formData.student_code}
              onChange={(event) => setFormData((prev) => ({ ...prev, student_code: event.target.value }))}
            />
            {errors.student_code && <div className="form-error">{errors.student_code}</div>}
          </div>

          <div className="form-group">
            <label className="label">Họ tên *</label>
            <input
              className={`input ${errors.full_name ? 'input--error' : ''}`}
              value={formData.full_name}
              onChange={(event) => setFormData((prev) => ({ ...prev, full_name: event.target.value }))}
            />
            {errors.full_name && <div className="form-error">{errors.full_name}</div>}
          </div>

          <div className="form-group">
            <label className="label">Khoa *</label>
            <select
              className={`input ${errors.department_id ? 'input--error' : ''}`}
              value={formData.department_id}
              onChange={(event) => handleDepartmentChange(event.target.value)}
            >
              <option value="">-- Chọn khoa --</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.department_name}</option>
              ))}
            </select>
            {errors.department_id && <div className="form-error">{errors.department_id}</div>}
          </div>

          <div className="form-group">
            <label className="label">Lớp *</label>
            <select
              className={`input ${errors.class_id ? 'input--error' : ''}`}
              value={formData.class_id}
              onChange={(event) => handleClassChange(event.target.value)}
            >
              <option value="">-- Chọn lớp --</option>
              {filteredClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.class_name} ({cls.class_code})
                </option>
              ))}
            </select>
            {errors.class_id && <div className="form-error">{errors.class_id}</div>}
          </div>

          <div className="form-group">
            <label className="label">Ngày sinh</label>
            <input
              type="date"
              className="input"
              value={formData.date_of_birth}
              onChange={(event) => setFormData((prev) => ({ ...prev, date_of_birth: event.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="label">Giới tính</label>
            <select
              className="input"
              value={formData.gender}
              onChange={(event) => setFormData((prev) => ({ ...prev, gender: event.target.value }))}
            >
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
              <option value="Other">Khác</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={formData.email}
              onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="label">Số điện thoại</label>
            <input
              className="input"
              value={formData.phone}
              onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="label">Địa chỉ</label>
            <input
              className="input"
              value={formData.address}
              onChange={(event) => setFormData((prev) => ({ ...prev, address: event.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="label">Năm nhập học</label>
            <input
              className="input"
              value={formData.enrollment_year}
              onChange={(event) => setFormData((prev) => ({ ...prev, enrollment_year: event.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="label">Trạng thái</label>
            <select
              className="input"
              value={formData.actual_status}
              onChange={(event) => setFormData((prev) => ({ ...prev, actual_status: event.target.value }))}
            >
              <option value="Enrolled">Đang học</option>
              <option value="Dropout">Đã bỏ học</option>
              <option value="Graduated">Đã tốt nghiệp</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Ghi chú</label>
            <textarea
              className="input"
              rows="3"
              value={formData.note}
              onChange={(event) => setFormData((prev) => ({ ...prev, note: event.target.value }))}
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

export default function StudentsPage() {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const normalizedRole = String(currentUser.role || '').trim().toLowerCase();
  const isTeacher = normalizedRole === 'teacher';
  const isAdmin = normalizedRole === 'admin';
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [importOpen, setImportOpen] = useState(false);
  const [importType, setImportType] = useState(''); // 'info' or 'results'
  const [importStep, setImportStep] = useState(1);
  const [importFile, setImportFile] = useState(null);
  const [importColumns, setImportColumns] = useState([]);
  const [importPreview, setImportPreview] = useState([]);
  const [importMapping, setImportMapping] = useState({
    semester_no: '',
    academic_year: '',
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
    actual_status: '',
    enrollment_year: '',
    note: ''
  });
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

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

  useEffect(() => {
    if (!isAdmin) return;

    const fetchReferences = async () => {
      try {
        const [deptRes, classRes] = await Promise.all([
          axiosClient.get('/departments'),
          axiosClient.get('/classes')
        ]);

        setDepartments(Array.isArray(deptRes.data) ? deptRes.data : deptRes.data?.data || []);
        setClasses(Array.isArray(classRes.data) ? classRes.data : classRes.data?.data || []);
      } catch (err) {
        setDepartments([]);
        setClasses([]);
      }
    };

    fetchReferences();
  }, [isAdmin]);

  const filteredStudents = useMemo(() => {
    const removeDiacritics = (str) =>
      str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');

    const keywordLower = removeDiacritics(keyword.toLowerCase());

    return students.filter((student) => {
      const code = student.student_code?.toLowerCase() || '';
      const name = removeDiacritics(student.full_name?.toLowerCase() || '');
      const className = removeDiacritics(student.class_name?.toLowerCase() || '');
      const departmentName = removeDiacritics(student.department_name?.toLowerCase() || '');

      const matchKeyword = code.includes(keywordLower)
        || name.includes(keywordLower)
        || className.includes(keywordLower)
        || departmentName.includes(keywordLower);
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

  const sortedStudents = useMemo(() => {
    const arr = [...filteredStudents];
    switch (sortBy) {
      case 'name-asc':
        return arr.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '', 'vi'));
      case 'name-desc':
        return arr.sort((a, b) => (b.full_name || '').localeCompare(a.full_name || '', 'vi'));
      case 'code-asc':
        return arr.sort((a, b) => (a.student_code || '').localeCompare(b.student_code || '', 'vi'));
      case 'code-desc':
        return arr.sort((a, b) => (b.student_code || '').localeCompare(a.student_code || '', 'vi'));
      default:
        return arr;
    }
  }, [filteredStudents, sortBy]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(sortedStudents.length / pageSize)),
    [sortedStudents.length, pageSize]
  );

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedStudents.slice(startIndex, startIndex + pageSize);
  }, [sortedStudents, currentPage, pageSize]);

  const pageStart = sortedStudents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, sortedStudents.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, riskFilter, departmentFilter, classFilter, sortBy, pageSize]);

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
    setSortBy('name-asc');
  };

  const resetImport = () => {
    setImportType('');
    setImportStep(1);
    setImportFile(null);
    setImportColumns([]);
    setImportPreview([]);
    setImportMapping({
      semester_no: '',
      academic_year: '',
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
      actual_status: '',
      enrollment_year: '',
      note: ''
    });
    setImportError('');
    setImportResult(null);
    setImportLoading(false);
  };

  const openImportModal = () => {
    if (!isAdmin) return;
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
        const targetSet = targets.map((item) => item.toLowerCase().trim());
        // First try exact match (case-insensitive)
        const exact = columns.find((col) => targetSet.includes(String(col).toLowerCase().trim()));
        if (exact) return exact;
        // Then try partial match: column contains one of the targets or vice versa
        return columns.find((col) => {
          const colLower = String(col).toLowerCase().trim();
          return targetSet.some((t) => colLower.includes(t) || t.includes(colLower));
        }) || '';
      };

      setImportColumns(columns);
      setImportPreview(previewRows);
      setImportMapping({
        // Học kỳ & Năm học (cho import kết quả)
        semester_no: autoPick(['học kỳ', 'hoc ky', 'semester_no', 'semester', 'hk']),
        academic_year: autoPick(['năm học', 'nam hoc', 'academic_year', 'nam_hoc']),
        // Thông tin bắt buộc
        student_code: autoPick(['mã sv', 'ma sv', 'student_code', 'mã sinh viên', 'ma_sv', 'masv', 'mssv']),
        full_name: autoPick(['họ tên', 'ho ten', 'full_name', 'họ và tên', 'ho va ten']),
        class_code: autoPick(['mã lớp', 'ma lop', 'class_code', 'ma_lop']),
        class_name: autoPick(['tên lớp', 'ten lop', 'class_name', 'ten_lop']),
        // Thông tin cá nhân (import info)
        gender: autoPick(['giới tính', 'gioi tinh', 'gender', 'gioi_tinh']),
        date_of_birth: autoPick(['ngày sinh', 'ngay sinh', 'date_of_birth', 'ngay_sinh']),
        email: autoPick(['email', 'e-mail']),
        phone: autoPick(['điện thoại', 'dien thoai', 'phone', 'sdt', 'số điện thoại']),
        address: autoPick(['địa chỉ', 'dia chi', 'address', 'dia_chi']),
        enrollment_year: autoPick(['năm nhập học', 'nam nhap hoc', 'enrollment_year', 'nam_nhap_hoc']),
        note: autoPick(['ghi chú', 'ghi chu', 'note', 'notes']),
        // Kết quả học tập (import results)
        gpa: autoPick(['gpa', 'điểm tb', 'diem tb', 'điểm trung bình']),
        absences: autoPick(['số buổi vắng', 'so buoi vang', 'absences', 'vắng', 'vang']),
        tuition_debt: autoPick(['nợ học phí', 'no hoc phi', 'tuition_debt', 'học phí']),
        scholarship: autoPick(['học bổng', 'hoc bong', 'scholarship']),
        actual_status: autoPick(['trạng thái', 'trang thai', 'actual_status', 'status']),
      });
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

    if (importType === 'results') {
      if (!importMapping.semester_no || !importMapping.academic_year) {
        setImportError('Vui lòng map cột Học kỳ và Năm học.');
        return;
      }
    }

    if (!importMapping.student_code || !importMapping.full_name || (!importMapping.class_code && !importMapping.class_name)) {
      setImportError('Vui lòng ghép cột cho: Mã sinh viên, Họ tên và Mã lớp (hoặc Tên lớp).');
      return;
    }

    try {
      setImportLoading(true);
      setImportError('');
      setImportResult(null);

      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('mapping', JSON.stringify(importMapping));

      const endpoint = importType === 'info' ? '/students/import-info' : '/students/import';
      const res = await axiosClient.post(endpoint, formData, {
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

  const handleExportExcel = () => {
    const getRiskLabelExport = (level) => {
      if (level === 'Danger') return 'Nguy hiểm';
      if (level === 'Warning') return 'Cảnh báo';
      if (level === 'Safe') return 'An toàn';
      return level || '-';
    };
    const getGenderLabelExport = (g) => {
      if (g === 'Male') return 'Nam';
      if (g === 'Female') return 'Nữ';
      return 'Khác';
    };
    const getStatusLabelExport = (s) => {
      if (s === 'Enrolled') return 'Đang học';
      if (s === 'Dropout') return 'Đã bỏ học';
      if (s === 'Graduated') return 'Đã tốt nghiệp';
      return s || '-';
    };

    const exportData = sortedStudents.map((s) => ({
      'Mã SV': s.student_code || '',
      'Họ tên': s.full_name || '',
      'Giới tính': getGenderLabelExport(s.gender),
      'Khoa': s.department_name || '',
      'Lớp': s.class_code || s.class_name || '',
      'GPA': s.gpa ?? '',
      'Vắng': s.absences ?? '',
      'Học phí': Number(s.tuition_debt) === 1 ? 'Có nợ' : 'Đã đủ',
      'Học bổng': Number(s.scholarship) === 1 ? 'Có' : 'Không',
      'Rủi ro (%)': s.risk_percentage != null ? Number(s.risk_percentage).toFixed(2) : '',
      'Mức rủi ro': getRiskLabelExport(s.risk_level),
      'Trạng thái': getStatusLabelExport(s.actual_status),
      'Email': s.email || '',
      'Số điện thoại': s.phone || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const colWidths = [
      { wch: 14 }, { wch: 22 }, { wch: 10 }, { wch: 18 }, { wch: 14 },
      { wch: 6 }, { wch: 6 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
      { wch: 12 }, { wch: 14 }, { wch: 28 }, { wch: 14 }
    ];
    ws['!cols'] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách sinh viên');

    const filterLabel = riskFilter !== 'ALL' ? `_${riskFilter}` : '';
    const fileName = `danh_sach_sinh_vien${filterLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setModalOpen(true);
  };

  const handleSaveStudent = async (payload) => {
    try {
      setActionLoading(true);
      if (editingStudent) {
        await axiosClient.put(`/students/${editingStudent.id}`, payload);
        alert('Cập nhật sinh viên thành công');
      } else {
        await axiosClient.post('/students', payload);
        alert('Thêm sinh viên thành công');
      }
      setModalOpen(false);
      setEditingStudent(null);
      await fetchStudents();
    } catch (err) {
      alert(err?.response?.data?.message || 'Lỗi khi lưu sinh viên');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStudent = async (student) => {
    const confirmed = window.confirm(`Xóa sinh viên ${student.full_name}?`);
    if (!confirmed) return;

    try {
      setActionLoading(true);
      await axiosClient.delete(`/students/${student.id}`);
      alert('Xóa sinh viên thành công');
      await fetchStudents();
    } catch (err) {
      alert(err?.response?.data?.message || 'Lỗi khi xóa sinh viên');
    } finally {
      setActionLoading(false);
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
          <>
            <button className="btn btn-secondary" onClick={fetchStudents} disabled={loading}>
              <IconRefresh />
              Làm mới
            </button>
            {isAdmin ? (
              <button className="btn btn-primary" onClick={handleAddStudent}>
                <IconPlus />
                Thêm sinh viên
              </button>
            ) : null}
          </>
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
            <div className="card__title">Lọc danh sách</div>
            <div className="card__subtitle">
              Hiển thị {sortedStudents.length}/{students.length} sinh viên
            </div>
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

          <select
            className="select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name-asc">Họ tên A → Z</option>
            <option value="name-desc">Họ tên Z → A</option>
            <option value="code-asc">Mã SV A → Z</option>
            <option value="code-desc">Mã SV Z → A</option>
          </select>

          <button className="btn btn-secondary" onClick={clearFilters}>
            Xóa bộ lọc
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="table-wrapper__header">
          <div style={{ display: 'flex', gap: 12 }}>
            {isAdmin ? (
              <button className="btn btn-secondary" onClick={openImportModal}>
                <IconUpload />
                Import Excel
              </button>
            ) : null}
            <button className="btn btn-success" onClick={handleExportExcel} disabled={sortedStudents.length === 0}>
              <IconDownload />
              Xuất Excel ({sortedStudents.length})
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
                    <tr key={student.id} className={Number(student.consecutive_warning_count) >= 2 ? 'row-consecutive-warning' : ''}>
                      <td className="mono">{student.student_code || '-'}</td>
                      <td style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                        {student.full_name || '-'}
                        {Number(student.consecutive_warning_count) >= 2 ? (
                          <span className="consecutive-badge" style={{ marginLeft: 8 }} title={`Cảnh báo liên tục ${student.consecutive_warning_count} kỳ`}>
                            ⚠ {student.consecutive_warning_count} kỳ
                          </span>
                        ) : null}
                      </td>
                      <td>{getGenderLabel(student.gender)}</td>
                      <td>{student.department_name || '-'}</td>
                      <td>{student.class_code || student.class_name || '-'}</td>
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
                        <div className="action-cell">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/students/${student.id}`)}
                          >
                            Xem chi tiết
                          </button>
                          {isAdmin ? (
                            <>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleEditStudent(student)}
                              >
                                <IconEdit />
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteStudent(student)}
                                disabled={actionLoading}
                              >
                                <IconTrash />
                              </button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {sortedStudents.length > 0 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={sortedStudents.length}
                pageStart={pageStart}
                pageEnd={pageEnd}
                itemName="sinh viên"
              />
            ) : null}
          </>
        )}
      </div>

      {isAdmin && importOpen ? (
        <div className="modal-overlay" onClick={closeImportModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {!importType ? 'Chọn loại Import' : importType === 'info' ? 'Import thông tin sinh viên' : 'Import kết quả học tập'}
              </h2>
              <button className="modal-close" onClick={closeImportModal}>X</button>
            </div>

            <div className="modal-body">
              {/* Step 0: Chọn loại import */}
              {!importType ? (
                <div className="import-type-grid">
                  <div className="import-type-card" onClick={() => setImportType('info')}>
                    <IconUsers />
                    <div className="import-type-card__title">Thông tin Sinh viên</div>
                    <div className="import-type-card__desc">
                      Import danh sách sinh viên (Mã SV, Họ tên, Lớp, Giới tính, Email...).<br />
                    </div>
                  </div>
                  <div className="import-type-card" onClick={() => setImportType('results')}>
                    <IconChart />
                    <div className="import-type-card__title">Kết quả học tập</div>
                    <div className="import-type-card__desc">
                      Import GPA, Nợ Học phí, Học bổng, Vắng... theo từng Học kỳ.<br />
                    </div>
                  </div>
                </div>
              ) : importStep === 1 ? (
                <>
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
                    <div style={{ marginTop: 12 }}>
                      {importType === 'info' ? (
                        <a className="btn btn-secondary btn-sm" href="/mau_import_thongtin_sv.xlsx" download>
                          Tải file mẫu — Thông tin SV
                        </a>
                      ) : (
                        <a className="btn btn-secondary btn-sm" href="/mau_import_ketqua_hoctap.xlsx" download>
                          Tải file mẫu — Kết quả học tập
                        </a>
                      )}
                    </div>
                    {importType === 'results' && (
                      <div className="form-hint" style={{ marginTop: 8 }}>
                        File Excel phải có cột <strong>Học kỳ</strong> và <strong>Năm học</strong>. Học kỳ phải đã kết thúc.
                      </div>
                    )}
                    {importType === 'info' && (
                      <div className="form-hint" style={{ marginTop: 8 }}>
                        Import thông tin cá nhân sinh viên. <strong>Không cần</strong> cột Học kỳ/Năm học.
                      </div>
                    )}
                  </div>
                </>
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
                    <div className="card__subtitle">Ghép cột dữ liệu {importType === 'info' ? '(Thông tin SV)' : '(Kết quả học tập)'}</div>

                    {/* Chỉ hiện Học kỳ + Năm học cho import kết quả */}
                    {importType === 'results' && (
                      <>
                        <div className="form-group">
                          <label className="label">Học kỳ (semester_no) *</label>
                          <select className="input" value={importMapping.semester_no} onChange={(e) => setImportMapping((prev) => ({ ...prev, semester_no: e.target.value }))}>
                            <option value="">-- Chọn cột --</option>
                            {importColumns.map((col) => (<option key={col} value={col}>{col}</option>))}
                          </select>
                          <div className="form-hint" style={{ marginTop: 4 }}>Giá trị: 1, 2 hoặc 3.</div>
                        </div>
                        <div className="form-group">
                          <label className="label">Năm học (academic_year) *</label>
                          <select className="input" value={importMapping.academic_year} onChange={(e) => setImportMapping((prev) => ({ ...prev, academic_year: e.target.value }))}>
                            <option value="">-- Chọn cột --</option>
                            {importColumns.map((col) => (<option key={col} value={col}>{col}</option>))}
                          </select>
                          <div className="form-hint" style={{ marginTop: 4 }}>VD: 2024-2025</div>
                        </div>
                      </>
                    )}

                    {/* Cột chung: Mã SV, Họ tên, Mã lớp */}
                    <div className="form-group">
                      <label className="label">Mã sinh viên (student_code) *</label>
                      <select className="input" value={importMapping.student_code} onChange={(e) => setImportMapping((prev) => ({ ...prev, student_code: e.target.value }))}>
                        <option value="">-- Chọn cột --</option>
                        {importColumns.map((col) => (<option key={col} value={col}>{col}</option>))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Họ tên (full_name) *</label>
                      <select className="input" value={importMapping.full_name} onChange={(e) => setImportMapping((prev) => ({ ...prev, full_name: e.target.value }))}>
                        <option value="">-- Chọn cột --</option>
                        {importColumns.map((col) => (<option key={col} value={col}>{col}</option>))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">Mã lớp (class_code) *</label>
                      <select className="input" value={importMapping.class_code} onChange={(e) => setImportMapping((prev) => ({ ...prev, class_code: e.target.value }))}>
                        <option value="">-- Chọn cột --</option>
                        {importColumns.map((col) => (<option key={col} value={col}>{col}</option>))}
                      </select>
                    </div>

                    {/* Thông tin cá nhân — CHỈ hiện cho import info */}
                    {importType === 'info' && (
                      <>
                        <div className="form-group">
                          <label className="label">Tên lớp (class_name)</label>
                          <select className="input" value={importMapping.class_name} onChange={(e) => setImportMapping((prev) => ({ ...prev, class_name: e.target.value }))}>
                            <option value="">-- Không dùng --</option>
                            {importColumns.map((col) => (<option key={col} value={col}>{col}</option>))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="label">Giới tính</label>
                          <select className="input" value={importMapping.gender} onChange={(e) => setImportMapping((prev) => ({ ...prev, gender: e.target.value }))}>
                            <option value="">-- Không dùng --</option>
                            {importColumns.map((col) => (<option key={col} value={col}>{col}</option>))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="label">Ngày sinh</label>
                          <select className="input" value={importMapping.date_of_birth} onChange={(e) => setImportMapping((prev) => ({ ...prev, date_of_birth: e.target.value }))}>
                            <option value="">-- Không dùng --</option>
                            {importColumns.map((col) => (<option key={col} value={col}>{col}</option>))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="label">Email</label>
                          <select className="input" value={importMapping.email} onChange={(e) => setImportMapping((prev) => ({ ...prev, email: e.target.value }))}>
                            <option value="">-- Không dùng --</option>
                            {importColumns.map((col) => (<option key={col} value={col}>{col}</option>))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="label">Điện thoại</label>
                          <select className="input" value={importMapping.phone} onChange={(e) => setImportMapping((prev) => ({ ...prev, phone: e.target.value }))}>
                            <option value="">-- Không dùng --</option>
                            {importColumns.map((col) => (<option key={col} value={col}>{col}</option>))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="label">Địa chỉ</label>
                          <select className="input" value={importMapping.address} onChange={(e) => setImportMapping((prev) => ({ ...prev, address: e.target.value }))}>
                            <option value="">-- Không dùng --</option>
                            {importColumns.map((col) => (<option key={col} value={col}>{col}</option>))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="label">Năm nhập học</label>
                          <select className="input" value={importMapping.enrollment_year} onChange={(e) => setImportMapping((prev) => ({ ...prev, enrollment_year: e.target.value }))}>
                            <option value="">-- Không dùng --</option>
                            {importColumns.map((col) => (<option key={col} value={col}>{col}</option>))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="label">Ghi chú</label>
                          <select className="input" value={importMapping.note} onChange={(e) => setImportMapping((prev) => ({ ...prev, note: e.target.value }))}>
                            <option value="">-- Không dùng --</option>
                            {importColumns.map((col) => (<option key={col} value={col}>{col}</option>))}
                          </select>
                        </div>
                      </>
                    )}

                    {/* Kết quả học tập — CHỈ hiện cho import results */}
                    {importType === 'results' && (
                      <>
                        <div className="form-group">
                          <label className="label">GPA</label>
                          <select className="input" value={importMapping.gpa} onChange={(e) => setImportMapping((prev) => ({ ...prev, gpa: e.target.value }))}>
                            <option value="">-- Không dùng --</option>
                            {importColumns.map((col) => (<option key={col} value={col}>{col}</option>))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="label">Số buổi vắng</label>
                          <select className="input" value={importMapping.absences} onChange={(e) => setImportMapping((prev) => ({ ...prev, absences: e.target.value }))}>
                            <option value="">-- Không dùng --</option>
                            {importColumns.map((col) => (<option key={col} value={col}>{col}</option>))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="label">Nợ học phí (0/1)</label>
                          <select className="input" value={importMapping.tuition_debt} onChange={(e) => setImportMapping((prev) => ({ ...prev, tuition_debt: e.target.value }))}>
                            <option value="">-- Không dùng --</option>
                            {importColumns.map((col) => (<option key={col} value={col}>{col}</option>))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="label">Học bổng (0/1)</label>
                          <select className="input" value={importMapping.scholarship} onChange={(e) => setImportMapping((prev) => ({ ...prev, scholarship: e.target.value }))}>
                            <option value="">-- Không dùng --</option>
                            {importColumns.map((col) => (<option key={col} value={col}>{col}</option>))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="label">Trạng thái (Enrolled/Dropout/Graduated)</label>
                          <select className="input" value={importMapping.actual_status} onChange={(e) => setImportMapping((prev) => ({ ...prev, actual_status: e.target.value }))}>
                            <option value="">-- Không dùng --</option>
                            {importColumns.map((col) => (<option key={col} value={col}>{col}</option>))}
                          </select>
                        </div>
                      </>
                    )}
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
                  {importResult.selectedSemester ? (
                    <div>
                      Học kỳ áp dụng: {importResult.selectedSemester.semester_name || `HK${importResult.selectedSemester.semester_no} ${importResult.selectedSemester.academic_year}`}
                    </div>
                  ) : null}
                  <div>Thêm mới: {importResult.createdCount || 0}</div>
                  <div>Cập nhật: {importResult.updatedCount || 0}</div>
                  <div>Lỗi: {importResult.failedCount || 0}</div>
                  {importResult.aiMessage ? (
                    <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, color: '#15803d' }}>
                      <div style={{ fontWeight: 600 }}>🤖 {importResult.aiMessage}</div>
                      {importResult.showBatchButton ? (
                        <button
                          className="btn btn-primary"
                          style={{ marginTop: 8 }}
                          disabled={importLoading}
                          onClick={async () => {
                            try {
                              setImportLoading(true);
                              setImportError('');
                              const aiRes = await axiosClient.post('/ai/predict-all');
                              setImportResult(prev => ({
                                ...prev,
                                aiMessage: aiRes.data?.message || 'AI đã dự đoán xong!',
                                showBatchButton: false
                              }));
                              await fetchStudents();
                            } catch (aiErr) {
                              setImportError('AI Batch Prediction lỗi: ' + (aiErr?.response?.data?.error || aiErr?.message));
                            } finally {
                              setImportLoading(false);
                            }
                          }}
                        >
                          {importLoading ? '⏳ Đang chạy AI...' : '🚀 Chạy AI dự đoán tất cả'}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  {importResult.errors && importResult.errors.length > 0 ? (
                    <div style={{ marginTop: 8, padding: '8px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13 }}>
                      <div style={{ fontWeight: 600, color: '#dc2626', marginBottom: 4 }}>Chi tiết lỗi:</div>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {importResult.errors.slice(0, 10).map((err, idx) => (
                          <li key={idx} style={{ color: '#991b1b' }}>
                            Dòng {err.row}: {err.message}
                          </li>
                        ))}
                        {importResult.errors.length > 10 ? (
                          <li style={{ color: '#991b1b', fontStyle: 'italic' }}>...và {importResult.errors.length - 10} lỗi khác</li>
                        ) : null}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="modal-footer">
              {importType && importStep > 1 ? (
                <button type="button" className="btn btn-secondary" onClick={() => setImportStep(1)} disabled={importLoading}>
                  ← Quay lại
                </button>
              ) : null}
              <button type="button" className="btn btn-secondary" onClick={closeImportModal} disabled={importLoading}>
                Hủy
              </button>
              {!importType ? null : importStep === 1 ? (
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

      <StudentModal
        isOpen={modalOpen}
        student={editingStudent}
        departments={departments}
        classes={classes}
        onClose={() => {
          setModalOpen(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
        loading={actionLoading}
      />
    </div>
  );
}