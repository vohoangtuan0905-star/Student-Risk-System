# Frontend Pages - Improvements & Checklist

**Purpose**: Specific improvements needed for each existing page  
**Date**: March 30, 2026

---

## 📋 Pages Improvement Roadmap

### 1️⃣ DashboardPage.jsx - **PRIORITY: HIGH**

**Current Status**: 80% → Target: 95%

#### ✅ Already Good
- ✅ Page header with title/subtitle
- ✅ 4 stat cards with proper styling
- ✅ Top at-risk students table
- ✅ Loading states
- ✅ Error handling

#### 🔧 Improvements Needed

| # | Issue | Fix | Priority |
|---|-------|-----|----------|
| 1 | No refresh button in header | Add refresh icon button to PageHeader actions | HIGH |
| 2 | Stat card hover effects missing | Add transition + shadow on hover | MEDIUM |
| 3 | Table shows "—" placeholders | Replace with proper loading skeleton | MEDIUM |
| 4 | No pagination on top 5 | Already limited to 5, but add "View all" link | LOW |
| 5 | Model info is hard-coded | Fetch from API + display real data | HIGH |
| 6 | No spacing consistency | Apply var(--space-*) to all gaps | MEDIUM |
| 7 | Missing badge components | Use consistent badge styling for risk levels | HIGH |
| 8 | No empty state component | Use EmptyPanel when no data | MEDIUM |

#### 📝 Code Changes Needed

**File**: `src/pages/DashboardPage.jsx`

1. **Import PageHeader actions**:
```jsx
<PageHeader 
  title="Dashboard hệ thống"
  actions={
    <button 
      className="button button--secondary"
      onClick={fetchData}
    >
      <IconRefresh /> Refresh
    </button>
  }
/>
```

2. **Use badge components**:
```jsx
<RiskBadge level={student.risk_level} />
// Instead of custom styling
```

3. **Add EmptyPanel**:
```jsx
{highRiskStudents.length === 0 && (
  <EmptyPanel 
    title="No at-risk students"
    description="Great job! All students are performing well."
    icon={<IconCheckCircle />}
  />
)}
```

---

### 2️⃣ StudentsPage.jsx - **PRIORITY: HIGH**

**Current Status**: 90% → Target: 95%

#### ✅ Already Good
- ✅ Comprehensive table (13 columns)
- ✅ Search + filter bar
- ✅ Stat cards at top
- ✅ Loading/error states
- ✅ Click to detail view

#### 🔧 Improvements Needed

| # | Issue | Fix | Priority |
|---|-------|-----|----------|
| 1 | No "Refresh" button in header | Add refresh button to PageHeader | HIGH |
| 2 | Table has no sorting | Make headers clickable for sort (asc/desc) | MEDIUM |
| 3 | No pagination/limits | Add pagination OR show "1-100 of 500" + scroll limit | HIGH |
| 4 | Filter count display unclear | Show "X/Y sinh viên" more prominently | LOW |
| 5 | No "View all" after search | Add result counter at top | MEDIUM |
| 6 | Badge colors inconsistent | Use badge component from PageKit | MEDIUM |
| 7 | Monospace font for codes | Add `.mono` class to all IDs | LOW |
| 8 | Table min-width breaks mobile | Table already responsive, confirm 1200px min | MEDIUM |

#### 📝 Code Changes Needed

**File**: `src/pages/StudentsPage.jsx`

1. **Add refresh button**:
```jsx
<PageHeader 
  title="Danh sách sinh viên"
  subtitle={`${filteredStudents.length} / ${students.length} sinh viên`}
  actions={
    <button 
      className="button button--secondary"
      onClick={fetchStudents}
    >
      <IconRefresh /> Refresh
    </button>
  }
/>
```

2. **Add ID monospace styling**:
```jsx
<td>
  <code className="mono">{student.student_code}</code>
</td>
```

3. **Use badge component**:
```jsx
<td>
  <RiskBadge level={student.risk_level} />
</td>
```

---

### 3️⃣ StudentDetailPage.jsx - **PRIORITY: MEDIUM**

**Current Status**: 85% → Target: 92%

#### ✅ Already Good
- ✅ Page header with back button
- ✅ Student info card
- ✅ 2 charts (GPA + Risk %)
- ✅ Academic records table
- ✅ "Predict Again" button

#### 🔧 Improvements Needed

| # | Issue | Fix | Priority |
|---|-------|-----|----------|
| 1 | No page title/breadcrumb | Add breadcrumb: "Dashboard / Students / Details" | LOW |
| 2 | Stat cards layout not responsive | Stat cards in flexbox with gap vars | MEDIUM |
| 3 | Chart heights are fixed | Make responsive with ResponsiveContainer | MEDIUM |
| 4 | No section dividers | Add visual separators between sections | LOW |
| 5 | Predict button text unclear | Change to "🤖 Predict Risk Again" | LOW |
| 6 | Table has no row highlighting | Add hover state on academic records | LOW |
| 7 | Stat card styling inconsistent | Ensure all use card component | MEDIUM |
| 8 | No back link styling | Style back button clearly | LOW |

#### 📝 Code Changes Needed

**File**: `src/pages/StudentDetailPage.jsx`

1. **Add page breadcrumb** (optional):
```jsx
<div className="breadcrumb">
  <Link to="/">Dashboard</Link>
  <span className="breadcrumb__sep">/</span>
  <Link to="/students">Students</Link>
  <span className="breadcrumb__sep">/</span>
  <span>{student.full_name}</span>
</div>
```

2. **Improve chart responsiveness**:
```jsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={dataForChart}>
    <CartesianGrid strokeDasharray="3 3" />
    <Tooltip />
    <XAxis dataKey="name" />
    <YAxis />
    <Line type="monotone" dataKey="value" stroke="#3b82f6" />
  </LineChart>
</ResponsiveContainer>
```

3. **Add section spacing**:
```jsx
<div className="page-container">
  <PageHeader ... />
  <div className="space-8"></div>  <!-- var(--space-8) gap -->
  
  <h3 className="section-title">Student Information</h3>
  <StudentInfoCard ... />
  <div className="space-8"></div>
  
  <h3 className="section-title">Academic History</h3>
  {/* Table */}
</div>
```

---

### 4️⃣ SemestersPage.jsx - **PRIORITY: CRITICAL**

**Current Status**: 70% → Target: 90%

#### ✅ Already Good
- ✅ Semester table with data
- ✅ Open/Closed status badges
- ✅ Stat cards

#### ❌ CRITICAL MISSING
- ❌ NO ADD BUTTON (can't create!)
- ❌ NO EDIT BUTTON (can't update!)
- ❌ NO DELETE BUTTON (can't remove!)
- ❌ NO ACTION COLUMN in table

#### 📝 Complete Rewrite Sections

**File**: `src/pages/SemestersPage.jsx`

```jsx
import { useState } from 'react';
import { PageHeader, EmptyPanel } from '../components/PageKit';
import axiosClient from '../api/axiosClient';

const IconPlus = () => (/* SVG */);
const IconEdit = () => (/* SVG */);
const IconTrash = () => (/* SVG */);

export default function SemestersPage() {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSem, setEditingSem] = useState(null);
  const [formData, setFormData] = useState({
    academic_year: '',
    semester_no: 1,
    semester_name: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/semesters');
      setSemesters(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingSem) {
        await axiosClient.put(`/semesters/${editingSem.id}`, formData);
      } else {
        await axiosClient.post('/semesters', formData);
      }
      fetchSemesters();
      setShowModal(false);
      setFormData({ /* reset */ });
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa học kỳ này?')) return;
    try {
      await axiosClient.delete(`/semesters/${id}`);
      fetchSemesters();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Quản lý học kỳ"
        subtitle="Manage academic semesters"
        actions={
          <button 
            className="button button--primary"
            onClick={() => {
              setEditingSem(null);
              setFormData({ /* reset */ });
              setShowModal(true);
            }}
          >
            <IconPlus /> Add Semester
          </button>
        }
      />

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard label="Total" value={semesters.length} color="blue" />
        <StatCard label="Open" value={semesters.filter(s => !s.is_closed).length} color="green" />
        <StatCard label="Closed" value={semesters.filter(s => s.is_closed).length} color="gray" />
      </div>

      {/* Loading */}
      {loading && <div className="loading-state"><div className="spinner"></div></div>}

      {/* Empty */}
      {!loading && semesters.length === 0 && (
        <EmptyPanel 
          title="No semesters found"
          description="Create a new semester to get started"
          actions={<button className="button button--primary">+ Add Semester</button>}
        />
      )}

      {/* Table */}
      {!loading && semesters.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Academic Year</th>
                <th>Semester</th>
                <th>Name</th>
                <th>Start Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {semesters.map(sem => (
                <tr key={sem.id}>
                  <td className="data-table__cell">{sem.academic_year}</td>
                  <td className="data-table__cell">#{sem.semester_no}</td>
                  <td className="data-table__cell">{sem.semester_name}</td>
                  <td className="data-table__cell">{formatDate(sem.start_date)}</td>
                  <td className="data-table__cell">
                    <span className={`badge badge--${sem.is_closed ? 'gray' : 'green'}`}>
                      {sem.is_closed ? 'Closed' : 'Open'}
                    </span>
                  </td>
                  <td className="data-table__cell data-table__cell--actions">
                    <button 
                      className="button button--small button--secondary"
                      onClick={() => {
                        setEditingSem(sem);
                        setFormData(sem);
                        setShowModal(true);
                      }}
                    >
                      <IconEdit /> Edit
                    </button>
                    <button 
                      className="button button--small button--danger"
                      onClick={() => handleDelete(sem.id)}
                    >
                      <IconTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal__content">
            <h3 className="modal__title">
              {editingSem ? 'Edit' : 'Add'} Semester
            </h3>
            
            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <input 
                type="text"
                className="form-input"
                value={formData.academic_year}
                onChange={e => setFormData({...formData, academic_year: e.target.value})}
                placeholder="2024-2025"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Semester Number</label>
              <select 
                className="form-select"
                value={formData.semester_no}
                onChange={e => setFormData({...formData, semester_no: e.target.value})}
              >
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Semester Name</label>
              <input 
                type="text"
                className="form-input"
                value={formData.semester_name}
                onChange={e => setFormData({...formData, semester_name: e.target.value})}
                placeholder="Học kỳ 1 năm học 2024-2025"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input 
                type="date"
                className="form-input"
                value={formData.start_date}
                onChange={e => setFormData({...formData, start_date: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input 
                type="date"
                className="form-input"
                value={formData.end_date}
                onChange={e => setFormData({...formData, end_date: e.target.value})}
              />
            </div>

            <div className="modal__actions">
              <button 
                className="button button--secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="button button--primary"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 5️⃣ AiPage.jsx - **PRIORITY: HIGH**

**Current Status**: 60% → Target: 85%

#### ✅ Already Good
- ✅ "Chạy Retrain" button works
- ✅ Shows retrain results

#### ❌ CRITICAL MISSING
- ❌ Hard-coded model info (should fetch)
- ❌ No model metadata display
- ❌ No version selector
- ❌ No metrics dashboard
- ❌ No retrain history

#### 📝 Major Improvements

**File**: `src/pages/AiPage.jsx`

1. **Fetch model metadata**:
```jsx
useEffect(() => {
  const fetchModelInfo = async () => {
    try {
      const res = await axiosClient.get('/ai/current-model');
      setCurrentModel(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  fetchModelInfo();
}, []);
```

2. **Display real metrics**:
```jsx
{currentModel && (
  <div className="metrics-grid">
    <MetricCard label="Accuracy" value={currentModel.metrics.accuracy} />
    <MetricCard label="Precision" value={currentModel.metrics.precision} />
    <MetricCard label="Recall" value={currentModel.metrics.recall} />
    <MetricCard label="F1 Score" value={currentModel.metrics.f1_score} />
  </div>
)}
```

3. **Add model version selector**:
```jsx
<div className="form-group">
  <label className="form-label">Select Model</label>
  <select 
    className="form-select"
    value={selectedModelId}
    onChange={e => setSelectedModelId(e.target.value)}
  >
    {models.map(m => (
      <option key={m.id} value={m.id}>
        {m.model_name} - {m.version_label}
      </option>
    ))}
  </select>
</div>
```

---

### 6️⃣ NotFoundPage.jsx - **PRIORITY: LOW**

**Current Status**: 100% → Target: 100%

✅ Already complete and looks good!

---

### 7️⃣ LoginPage.jsx - **PRIORITY: LOW**

**Current Status**: 85% → Target: 90%

#### Minor Improvements
- [ ] Add "Forgot password?" link (even if not functional)
- [ ] Add demo credentials hint/toggle
- [ ] Improve form validation feedback

---

## 🎯 CSS Additions Needed

Add these CSS classes to `src/index.css`:

```css
/* Modal */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal__content {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.3s ease;
}

/* Form */
.form-group {
  margin-bottom: var(--space-6);
}

.form-label {
  display: block;
  font-weight: var(--font-semibold);
  color: var(--gray-900);
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
}

.form-input,
.form-select {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--blue-500);
  box-shadow: 0 0 0 3px var(--blue-100);
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--gray-600);
}

.breadcrumb__sep {
  color: var(--gray-400);
}

.breadcrumb a {
  color: var(--blue-600);
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

/* Section Title */
.section-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin: var(--space-6) 0 var(--space-4) 0;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-4);
}

.metric-card {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  text-align: center;
}

.metric-card__value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--blue-600);
}

.metric-card__label {
  font-size: var(--text-xs);
  color: var(--gray-600);
  margin-top: var(--space-2);
}

/* Animations */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## ✅ Implementation Checklist

### High Priority (Do First)
- [ ] DashboardPage: Add refresh button
- [ ] StudentsPage: Add monospace styling + badges
- [ ] SemestersPage: **COMPLETE REWRITE** with CRUD modal
- [ ] AiPage: Fetch real model data

### Medium Priority (Do Second)
- [ ] StudentDetailPage: Add breadcrumb + responsive charts
- [ ] All pages: Ensure consistent spacing with var(--space-*)
- [ ] All pages: Use badge components consistently

### Low Priority (Polish)
- [ ] LoginPage: Add password reset link
- [ ] NotFoundPage: Already perfect

---

**Version**: 1.0  
**Total Estimated Time**: 12-16 hours  
**Target Completion**: By end of week
