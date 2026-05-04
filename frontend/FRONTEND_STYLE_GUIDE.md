# Frontend Style Guide - Student Risk System

**Status**: Complete Reference Guide  
**Date**: March 30, 2026  
**Purpose**: Unified design system + patterns for all pages

---

## 📐 Design System Overview

### Color Palette

```css
/* Status Colors (Main) */
--green-600:  #16a34a;   /* Safe */
--yellow-600: #ca8a04;   /* Warning */
--red-600:    #dc2626;   /* Danger */

/* Status Colors (Light Backgrounds) */
--green-50:   #f0fdf4;
--yellow-50:  #fefce8;
--red-50:     #fef2f2;

/* Primary Brand */
--blue-600:   #2563eb;   /* Main actions, links */
--blue-500:   #3b82f6;
--blue-50:    #eff6ff;

/* Neutral Palette */
--gray-900:   #0f172a;   /* Text, dark backgrounds */
--gray-800:   #1e293b;   /* Secondary text */
--gray-700:   #334155;
--gray-600:   #475569;
--gray-500:   #64748b;
--gray-400:   #94a3b8;
--gray-300:   #cbd5e1;   /* Borders, dividers */
--gray-200:   #e2e8f0;   /* Light backgrounds */
--gray-100:   #f1f5f9;   /* Very light backgrounds */
--gray-50:    #f8fafc;
--white:      #ffffff;
```

### Typography

```css
/* Font Family */
--font-sans: 'Be Vietnam Pro', sans-serif;      /* Body, UI */
--font-mono: 'JetBrains Mono', monospace;       /* Code, IDs */

/* Font Sizes */
--text-xs:   12px;
--text-sm:   14px;
--text-base: 16px;
--text-lg:   18px;
--text-xl:   20px;
--text-2xl:  24px;
--text-3xl:  32px;

/* Font Weights */
--font-light:  300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold:   700;
--font-extrabold: 800;
```

### Spacing System

```css
/* Spacing (4px base) */
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
```

### Border Radius

```css
--radius-sm: 4px;    /* Buttons, small elements */
--radius-md: 8px;    /* Cards, inputs, modals */
--radius-lg: 12px;   /* Large sections */
--radius-xl: 16px;   /* Very large containers */
```

### Shadows

```css
--shadow-sm:     0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md:     0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg:     0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl:     0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-card:   0 2px 8px rgba(0, 0, 0, 0.08);
```

---

## 🎯 Component Patterns

### 1. Page Container

**Purpose**: Main wrapper for all pages

```jsx
<div className="page-container">
  <PageHeader title="..." subtitle="..." actions={...} />
  {/* Page content */}
</div>
```

**CSS**:
```css
.page-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);    /* 32px between sections */
  padding: 0;
}
```

---

### 2. PageHeader Component

**Purpose**: Consistent header at top of each page

**Usage**:
```jsx
<PageHeader 
  title="Dashboard"
  subtitle="Overview of system"
  actions={
    <>
      <button className="button button--secondary">Refresh</button>
      <button className="button button--primary">+ Add</button>
    </>
  }
/>
```

**Styling Guidelines**:
- Title: `--text-3xl`, `--font-bold`, `--gray-900`
- Subtitle: `--text-sm`, `--font-normal`, `--gray-600`
- Actions: Right-aligned flex row, gap `--space-2`

---

### 3. Stat Cards Grid

**Purpose**: Display key metrics at top of page

**HTML Template**:
```jsx
<div className="stats-grid">
  <StatCard 
    icon={IconUsers} 
    label="Total Students" 
    value={150} 
    color="blue"
  />
  <StatCard 
    icon={IconShield} 
    label="Safe" 
    value={95} 
    color="green"
  />
  <StatCard 
    icon={IconAlert} 
    label="Warning" 
    value={40} 
    color="yellow"
  />
  <StatCard 
    icon={IconXCircle} 
    label="Danger" 
    value={15} 
    color="red"
  />
</div>
```

**CSS**:
```css
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-4);    /* 16px between cards */
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--gray-300);
}

.stat-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  color: var(--white);
  font-size: 24px;
}

.stat-card__icon--blue {
  background: var(--blue-50);
  color: var(--blue-600);
}

.stat-card__icon--green {
  background: var(--green-50);
  color: var(--green-600);
}

.stat-card__icon--yellow {
  background: var(--yellow-50);
  color: var(--yellow-600);
}

.stat-card__icon--red {
  background: var(--red-50);
  color: var(--red-600);
}

.stat-card__body {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.stat-card__value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  line-height: 1;
}

.stat-card__label {
  font-size: var(--text-sm);
  color: var(--gray-600);
  margin-top: var(--space-1);
}
```

---

### 4. Filter Bar

**Purpose**: Search + Filter controls

**HTML Template**:
```jsx
<div className="filter-bar">
  <div className="filter-bar__search">
    <IconSearch />
    <input 
      type="text"
      className="filter-input"
      placeholder="Tìm mã sinh viên, họ tên..."
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
    />
  </div>
  
  <select 
    className="filter-select"
    value={riskFilter}
    onChange={e => setRiskFilter(e.target.value)}
  >
    <option value="">Tất cả</option>
    <option value="Safe">Safe</option>
    <option value="Warning">Warning</option>
    <option value="Danger">Danger</option>
  </select>

  {hasFilters && (
    <button 
      className="button button--ghost"
      onClick={resetFilters}
    >
      Clear Filters
    </button>
  )}
</div>
```

**CSS**:
```css
.filter-bar {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  flex-wrap: wrap;
}

.filter-bar__search {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
  min-width: 200px;
  padding: var(--space-2) var(--space-3);
  background: var(--gray-50);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-sm);
}

.filter-bar__search svg {
  width: 18px;
  height: 18px;
  color: var(--gray-500);
  flex-shrink: 0;
}

.filter-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: var(--text-base);
  color: var(--gray-900);
  outline: none;
}

.filter-input::placeholder {
  color: var(--gray-500);
}

.filter-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  background: var(--white);
  color: var(--gray-900);
  cursor: pointer;
}

.filter-select:hover {
  border-color: var(--gray-400);
}

.filter-select:focus {
  outline: none;
  border-color: var(--blue-500);
  box-shadow: 0 0 0 3px var(--blue-100);
}
```

---

### 5. Data Table

**Purpose**: Display structured data with consistent styling

**HTML Template**:
```jsx
<div className="table-wrapper">
  <table className="data-table">
    <thead>
      <tr>
        <th>Student Code</th>
        <th>Full Name</th>
        <th>GPA</th>
        <th>Risk Level</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {students.map(student => (
        <tr key={student.id} className="data-table__row">
          <td className="data-table__cell">
            <code className="mono">{student.student_code}</code>
          </td>
          <td className="data-table__cell">{student.full_name}</td>
          <td className="data-table__cell">{student.gpa.toFixed(2)}</td>
          <td className="data-table__cell">
            <RiskBadge level={student.risk_level} />
          </td>
          <td className="data-table__cell">
            <StatusBadge status={student.actual_status} />
          </td>
          <td className="data-table__cell data-table__cell--actions">
            <button 
              className="button button--small button--secondary"
              onClick={() => navigate(`/students/${student.id}`)}
            >
              View
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

**CSS**:
```css
.table-wrapper {
  width: 100%;
  overflow-x: auto;
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

.data-table thead {
  background: var(--gray-50);
  border-bottom: 2px solid var(--gray-300);
}

.data-table th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-weight: var(--font-semibold);
  color: var(--gray-700);
  white-space: nowrap;
}

.data-table tbody tr {
  border-bottom: 1px solid var(--gray-200);
  transition: background-color 0.2s ease;
}

.data-table tbody tr:hover {
  background-color: var(--blue-50);
}

.data-table__cell {
  padding: var(--space-3) var(--space-4);
  color: var(--gray-900);
  vertical-align: middle;
}

.data-table__cell--actions {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.mono {
  font-family: var(--font-mono);
  background: var(--gray-100);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  color: var(--gray-700);
  font-size: 12px;
}
```

---

### 6. Badge Components

**Purpose**: Display status, labels with consistent styling

**HTML Template**:
```jsx
<span className="badge badge--safe">Safe</span>
<span className="badge badge--warning">Warning</span>
<span className="badge badge--danger">Danger</span>
<span className="badge badge--gray">Neutral</span>
```

**CSS**:
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  white-space: nowrap;
}

.badge--safe {
  background: var(--green-50);
  color: var(--green-700);
  border: 1px solid var(--green-200);
}

.badge--warning {
  background: var(--yellow-50);
  color: var(--yellow-700);
  border: 1px solid var(--yellow-200);
}

.badge--danger {
  background: var(--red-50);
  color: var(--red-700);
  border: 1px solid var(--red-200);
}

.badge--gray {
  background: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
}

.badge__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.7;
}
```

---

### 7. Button Variations

**Purpose**: Consistent button styling across all pages

**HTML Templates**:
```jsx
<!-- Primary Button (Main actions) -->
<button className="button button--primary">
  Save Changes
</button>

<!-- Secondary Button (Alternative actions) -->
<button className="button button--secondary">
  Cancel
</button>

<!-- Ghost Button (Low-priority actions) -->
<button className="button button--ghost">
  Dismiss
</button>

<!-- Danger Button (Destructive actions) -->
<button className="button button--danger">
  Delete
</button>

<!-- Small/Compact -->
<button className="button button--small button--primary">
  Edit
</button>

<!-- Loading State -->
<button className="button button--primary" disabled>
  <span className="button__spinner"></span>
  Processing...
</button>
```

**CSS**:
```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

/* Primary */
.button--primary {
  background: var(--blue-600);
  color: var(--white);
}

.button--primary:hover {
  background: var(--blue-700);
  box-shadow: var(--shadow-md);
}

.button--primary:active {
  transform: translateY(1px);
}

.button--primary:disabled {
  background: var(--gray-300);
  cursor: not-allowed;
  box-shadow: none;
}

/* Secondary */
.button--secondary {
  background: var(--gray-200);
  color: var(--gray-900);
  border: 1px solid var(--gray-300);
}

.button--secondary:hover {
  background: var(--gray-300);
  border-color: var(--gray-400);
}

/* Ghost */
.button--ghost {
  background: transparent;
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
}

.button--ghost:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
}

/* Danger */
.button--danger {
  background: var(--red-600);
  color: var(--white);
}

.button--danger:hover {
  background: var(--red-700);
}

/* Small */
.button--small {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-xs);
}

/* Loading Spinner */
.button__spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: var(--white);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

### 8. Card Components

**Purpose**: Container for grouped content

**HTML Template**:
```jsx
<div className="card">
  <div className="card__header">
    <h3 className="card__title">Section Title</h3>
    <p className="card__subtitle">Optional subtitle</p>
  </div>
  
  <div className="card__content">
    {/* Main content */}
  </div>
  
  <div className="card__footer">
    <button className="button button--primary">Action</button>
  </div>
</div>
```

**CSS**:
```css
.card {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--gray-300);
}

.card__header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--gray-200);
}

.card__title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin: 0;
}

.card__subtitle {
  font-size: var(--text-sm);
  color: var(--gray-600);
  margin: var(--space-1) 0 0 0;
}

.card__content {
  padding: var(--space-6);
}

.card__footer {
  padding: var(--space-4) var(--space-6);
  background: var(--gray-50);
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}
```

---

### 9. Empty State

**Purpose**: Display when no data exists

**HTML Template**:
```jsx
<div className="empty-state">
  <div className="empty-state__icon">
    <IconFolder />
  </div>
  <h3 className="empty-state__title">No data found</h3>
  <p className="empty-state__description">
    Try adjusting your filters or create a new record to get started.
  </p>
  <div className="empty-state__actions">
    <button className="button button--primary">+ Create New</button>
    <button className="button button--secondary">Reset Filters</button>
  </div>
</div>
```

**CSS**:
```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-6);
  background: var(--white);
  border: 2px dashed var(--gray-300);
  border-radius: var(--radius-lg);
  text-align: center;
}

.empty-state__icon {
  width: 64px;
  height: 64px;
  margin-bottom: var(--space-4);
  color: var(--gray-400);
  opacity: 0.6;
}

.empty-state__icon svg {
  width: 100%;
  height: 100%;
}

.empty-state__title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin: 0 0 var(--space-2) 0;
}

.empty-state__description {
  font-size: var(--text-sm);
  color: var(--gray-600);
  max-width: 400px;
  margin: 0 0 var(--space-6) 0;
}

.empty-state__actions {
  display: flex;
  gap: var(--space-3);
}
```

---

### 10. Loading State

**Purpose**: Show loading indicators

**HTML Template**:
```jsx
<div className="loading-state">
  <div className="spinner"></div>
  <p className="loading-state__text">Loading...</p>
</div>
```

**CSS**:
```css
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  gap: var(--space-4);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--gray-200);
  border-top-color: var(--blue-600);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-state__text {
  font-size: var(--text-sm);
  color: var(--gray-600);
  margin: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## ✅ Best Practices

### DO ✅

- ✅ Use CSS variables for colors, spacing, sizes
- ✅ Follow BEM naming: `.block`, `.block__element`, `.block--modifier`
- ✅ Group related components with clear comments
- ✅ Use flexbox for layouts (more flexible than grid)
- ✅ Add hover/active states to interactive elements
- ✅ Include transitions for smooth interactions
- ✅ Test on multiple screen sizes (1024px, 768px, 480px)
- ✅ Use semantic HTML (`<button>`, `<label>`, `<table>`)
- ✅ Include proper spacing between sections
- ✅ Use badges + badges for status indicators

### DON'T ❌

- ❌ Don't hard-code colors (use CSS variables)
- ❌ Don't use inline `style={}` attributes
- ❌ Don't mix px, rem, em units inconsistently
- ❌ Don't create one-off CSS classes (reuse patterns)
- ❌ Don't forget hover/focus states on clickable elements
- ❌ Don't use non-semantic elements (avoid `<div>` when `<button>` fits)
- ❌ Don't nest CSS selectors too deeply (max 3 levels)
- ❌ Don't add margins to first/last children without clearfix

---

## 📄 Page Template

Here's a template to follow when creating new pages:

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { PageHeader, EmptyPanel, StatCard } from '../components/PageKit';

// Icons (SVG components)
const IconPlus = () => (/* SVG */);
const IconRefresh = () => (/* SVG */);
const IconTrash = () => (/* SVG */);

// Sub-components
function BadgeComponent({ value }) {
  return <span className="badge badge--{type}">{value}</span>;
}

// Main Page Component
export default function MyPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get('/endpoint');
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(/* filter logic */);
  }, [data, filter]);

  return (
    <div className="page-container">
      {/* Header */}
      <PageHeader 
        title="Page Title"
        subtitle="Page description"
        actions={
          <button className="button button--primary" onClick={/* action */}>
            + Add
          </button>
        }
      />

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Total" value={data.length} color="blue" />
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-bar__search">
          {/* Search input */}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert--error">
          {error}
          <button onClick={fetchData}>Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && <div className="loading-state"><div className="spinner"></div></div>}

      {/* Empty */}
      {!loading && filteredData.length === 0 && (
        <EmptyPanel 
          title="No records found"
          description="Create a new record to get started"
        />
      )}

      {/* Data Table */}
      {!loading && filteredData.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Column 1</th>
                <th>Column 2</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => (
                <tr key={item.id} className="data-table__row">
                  <td className="data-table__cell">{item.field1}</td>
                  <td className="data-table__cell">{item.field2}</td>
                  <td className="data-table__cell data-table__cell--actions">
                    <button className="button button--small button--secondary">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 Usage Examples

### Example 1: Adding a New Stat Card

```jsx
<div className="stats-grid">
  <StatCard 
    icon={IconUsers} 
    label="Active Students" 
    value={125} 
    color="green"
  />
</div>
```

### Example 2: Creating a Badge

```jsx
<td>
  <span className="badge badge--danger">
    <span className="badge__dot"></span>
    High Risk
  </span>
</td>
```

### Example 3: Button Group

```jsx
<div className="empty-state__actions">
  <button className="button button--primary">Save</button>
  <button className="button button--secondary">Cancel</button>
</div>
```

### Example 4: Form Input

```jsx
<div className="form-group">
  <label className="form-label">Name</label>
  <input 
    type="text" 
    className="form-input"
    placeholder="Enter name"
  />
</div>
```

---

## 📏 Responsive Breakpoints

When you add responsive design, use these breakpoints:

```css
/* Desktop (current default) */
/* 1200px+ */

/* Tablet (landscape) */
@media (max-width: 1024px) {
  /* Reduce sizing, adjust margins */
}

/* Tablet (portrait) */
@media (max-width: 768px) {
  /* Stack vertically, hide non-essential */
}

/* Mobile */
@media (max-width: 480px) {
  /* Single column, full width, larger touch targets */
}
```

---

**Version**: 1.0  
**Last Updated**: March 30, 2026  
**Maintained by**: Frontend Team
