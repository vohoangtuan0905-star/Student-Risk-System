# Frontend Documentation - Student Risk System

**Last Updated**: March 30, 2026  
**Status**: ~70% Feature-Complete  
**Target Deployment**: Thesis Defense Ready

---

## 📋 Table of Contents

1. [Overview - Current Status](#overview---current-status)
2. [Folder Structure & Architecture](#folder-structure--architecture)
3. [Pages Inventory - Implementation Status](#pages-inventory---implementation-status)
4. [Components Library](#components-library)
5. [Styling System & Guidelines](#styling-system--guidelines)
6. [How to Add a New Page](#how-to-add-a-new-page)
7. [API Integration Checklist](#api-integration-checklist)
8. [Responsive Design Status](#responsive-design-status)
9. [Known Issues & Technical Debt](#known-issues--technical-debt)
10. [Missing Features (Priority Ranked)](#missing-features-priority-ranked)

---

## Overview - Current Status

### ✅ What's Complete (Thesis-Ready)

| Feature | Status | Page/Component |
|---------|--------|-----------------|
| Login & Authentication | ✅ 80% | `LoginPage.jsx` |
| Dashboard with Stats | ✅ 80% | `DashboardPage.jsx` |
| Student List & Search | ✅ 90% | `StudentsPage.jsx` |
| Student Detail View | ✅ 85% | `StudentDetailPage.jsx` |
| Semester Management (View) | ✅ 70% | `SemestersPage.jsx` |
| AI Predictions | ✅ 60% | `StudentDetailPage.jsx` + `AiPage.jsx` |
| Layout & Navigation | ✅ 90% | `AdminLayout.jsx` |
| 404 Page | ✅ 100% | `NotFoundPage.jsx` |
| CSS System | ✅ 100% | `index.css` (1500+ lines) |

### 🟡 What's Partially Complete

| Feature | Issue | Needed | File |
|---------|-------|--------|------|
| **Dashboard** | No visualizations/charts | Charts, export, more metrics | `DashboardPage.jsx` |
| **Student List** | No pagination or sorting | Pagination, column sort, export | `StudentsPage.jsx` |
| **Student Detail** | Limited AI detail | Full metrics, comparison, notes | `StudentDetailPage.jsx` |
| **Semester Page** | Read-only, no CRUD | Add/Edit/Delete buttons & modals | `SemestersPage.jsx` |
| **AI Page** | Hard-coded model info | Fetch metadata, version history | `AiPage.jsx` |
| **Layout** | Not responsive | Mobile menu, responsive tables | `AdminLayout.jsx` |

### ❌ What's Missing (Completely Not Implemented)

| Priority | Feature | Should Be | Estimated Gap |
|----------|---------|-----------|---|
| **MUST** | Departments Page CRUD | `src/pages/DepartmentsPage.jsx` | ~300 lines |
| **MUST** | Classes Page CRUD | `src/pages/ClassesPage.jsx` | ~300 lines |
| **MUST** | Semester CRUD (Modal + Update) | Enhance `SemestersPage.jsx` | ~200 lines |
| **SHOULD** | Improved Dashboard (Charts) | Enhance `DashboardPage.jsx` | ~150 lines |
| **SHOULD** | Student Management Forms | Create `StudentFormPage.jsx` or modal | ~400 lines |
| **SHOULD** | Users Management | `src/pages/UsersPage.jsx` | ~400 lines |
| **NICE** | Model Version History | `src/pages/ModelVersionsPage.jsx` | ~300 lines |
| **NICE** | Data Import/Upload | `src/pages/ImportDataPage.jsx` | ~250 lines |

---

## Folder Structure & Architecture

```
frontend/
├── src/
│   ├── pages/              # 📄 Full page components (route endpoints)
│   │   ├── LoginPage.jsx           ✅ Complete
│   │   ├── DashboardPage.jsx       🟡 Partial
│   │   ├── StudentsPage.jsx        🟡 Partial
│   │   ├── StudentDetailPage.jsx   🟡 Partial
│   │   ├── SemestersPage.jsx       🟡 Partial (view-only)
│   │   ├── AiPage.jsx              🟡 Partial
│   │   ├── NotFoundPage.jsx        ✅ Complete
│   │   │
│   │   ├── [MISSING] DepartmentsPage.jsx    ❌
│   │   ├── [MISSING] ClassesPage.jsx        ❌
│   │   ├── [MISSING] UsersPage.jsx          ❌
│   │   └── [MISSING] ModelVersionsPage.jsx  ❌
│   │
│   ├── components/         # 🧩 Reusable components
│   │   ├── PageKit.jsx             ✅ Contains: PageHeader, SectionCard, EmptyPanel
│   │   └── ProtectedRoute.jsx      ✅ Route guard wrapper
│   │
│   ├── layouts/            # 🏗️ App shell layouts
│   │   └── AdminLayout.jsx         ✅ Sidebar + Topbar (not responsive)
│   │
│   ├── api/                # 🔌 Backend integration
│   │   └── axiosClient.js          ✅ Configured with baseURL + interceptor
│   │
│   ├── App.jsx             # 🛣️ Router definition (7 routes)
│   ├── index.css           # 🎨 ALL styles centralized (1500+ lines)
│   ├── main.jsx            # 📍 React entry point
│   └── index.html          # 📝 HTML template
│
├── package.json            # Dependencies: React, ReactDOM, ReactRouter, Axios, Recharts
├── vite.config.js          # Vite build config
├── tailwind.config.js      # Present but UNUSED (no Tailwind classes)
└── postcss.config.js       # Present but minimal usage
```

### Key Observations

- ✅ **CSS System**: 100% centralized in `index.css` (no Tailwind, pure CSS)
- ✅ **No TypeScript**: All `.jsx` files (no prop types or type checking)
- ✅ **BEM Naming**: CSS classes follow `.block__element--modifier` pattern
- ❌ **Not Responsive**: Only login page has 1 media query
- ❌ **No Custom Hooks**: Some repeated fetch/filter logic
- ❌ **No Tests**: No `.test.js` files present

---

## Pages Inventory - Implementation Status

### 1️⃣ LoginPage.jsx

**Status**: ✅ **85% Complete**

**Location**: `src/pages/LoginPage.jsx`

**Currently Displays**:
- Left side: Hero section with features
- Right side: Email/password login form
- Demo credentials pre-filled

**Features Implemented**:
- ✅ Email & password input
- ✅ Show/hide password toggle (Eye icon)
- ✅ Error message display
- ✅ Loading state on submit
- ✅ Redirect to dashboard on success
- ✅ Pre-filled demo account

**Missing**:
- ❌ Password reset link
- ❌ Registration flow
- ❌ Form validation messages (only backend errors)
- ❌ "Remember me" checkbox
- ❌ Rate limiting UI
- ❌ Account lockout warning

**If modifying**: Edit login button text, colors, form fields → Update `src/pages/LoginPage.jsx`

---

### 2️⃣ DashboardPage.jsx

**Status**: 🟡 **80% Complete**

**Location**: `src/pages/DashboardPage.jsx`

**Currently Displays**:
```
┌─ Dashboard Header ─────────────────────────┐
├─ 4 Stat Cards: Total | Safe | Warning | Danger
├─ Top 5 At-Risk Students Table
├─ Current AI Model Card
└─ Latest Semester Info
```

**Features Implemented**:
- ✅ Real-time stats (fetches from `/students`)
- ✅ Risk level color coding (Safe=green, Warning=yellow, Danger=red)
- ✅ Click student row → navigate to detail
- ✅ Refresh button
- ✅ Quick nav buttons to Students/AI
- ✅ Loading skeleton (shows "—")
- ✅ Empty state when no at-risk students

**Missing**:
- ❌ **NO CHARTS**: Dashboard description mentions visualizations but none exist
- ❌ GPA trend chart
- ❌ Risk distribution pie chart
- ❌ Enrollment over time
- ❌ No export to PDF/CSV
- ❌ Hard-coded model info (should fetch from APIs)
- ❌ No system-wide alerts or announcements
- ❌ No recent activity timeline

**Recommended Enhancements**:
1. Add two Recharts: `<LineChart>` for GPA trends + `<PieChart>` for risk distribution
2. Fetch latest semester from `/semesters` API instead of hard-coding
3. Add export button → save stats as PDF
4. Add system announcements banner at top
5. Show time range selector (last 7 days, month, semester)

**If modifying**: 
- Add new stat cards → Update stat card grid
- Add charts → Add `<Recharts>` components
- Change API calls → Update `useEffect` fetch
- Change colors → Update `index.css` color variables

---

### 3️⃣ StudentsPage.jsx

**Status**: 🟡 **90% Complete**

**Location**: `src/pages/StudentsPage.jsx`

**Currently Displays**:
```
┌─ Page Header + Refresh ────────────────────┐
├─ 4 Stat Cards (Total/Safe/Warning/Danger)
├─ Filter Bar: Search + Risk Level Dropdown
└─ Students Table (13 columns)
   └─ Rows: All students with "Xem chi tiết" button
```

**Features Implemented**:
- ✅ Full-text search (student code OR name, fuzzy match)
- ✅ Risk level filter (All/Safe/Warning/Danger)
- ✅ Live filter count display
- ✅ 13-column comprehensive table
- ✅ Badge styling for risk levels
- ✅ Refresh button
- ✅ Loading state
- ✅ Error state with retry
- ✅ Empty state
- ✅ Click "Xem chi tiết" → StudentDetailPage

**Missing**:
- ❌ **NO PAGINATION** (will break with 1000+ students!)
- ❌ No column sorting (click header to sort)
- ❌ No bulk actions (select multiple, batch operations)
- ❌ No export to CSV/Excel
- ❌ Advanced filters: by department, class, enrollment year
- ❌ No inline editing
- ❌ No drag-to-sort columns
- ❌ Table width hard-coded to 1200px (breaks mobile!)

**Recommended Fixes** (for thesis quality):
1. Add pagination: Either `<Pagination component>` OR infinite scroll
2. Add column headers: Make clickable for sort (asc/desc)
3. Add bulk select: Checkbox in header to select all
4. Add quick stats: "Showing X of Y students"
5. Add department filter: Dropdown next to risk filter

**If modifying**:
- Add new columns → Update table `<tr>` structure + `index.css`
- Change search behavior → Update filter logic in `handleSearch()`
- Add sorting → Add `sortBy` state + update `data.sort()`
- Change colors → Update CSS classes in `index.css`

---

### 4️⃣ StudentDetailPage.jsx

**Status**: 🟡 **85% Complete**

**Location**: `src/pages/StudentDetailPage.jsx`

**Currently Displays**:
```
┌─ Page Header: Student Name + Back Button ──┐
├─ Student Info Card (9 fields)
├─ 4 Stat Cards: GPA | Risk % | Risk Level | Warning
├─ Action Buttons: "Predict Again"
├─ 2 Line Charts: GPA by semester + Risk% by semester
└─ Academic Records History Table (12 columns)
```

**Features Implemented**:
- ✅ Fetches student profile from `/students/{id}/history`
- ✅ Fetches academic history from `/academic-records/student/{id}`
- ✅ Displays basic student info (code, name, email, etc.)
- ✅ Renders 2 Recharts line charts
- ✅ "Predict Again" button → POST `/ai/predict-by-student/{id}`
- ✅ Academic records table with all fields
- ✅ Risk level badge styling
- ✅ Back button to students list
- ✅ Error handling (shows fallback data)

**Missing**:
- ❌ **NO COURSE-LEVEL DETAILS** (only semester aggregates shown)
- ❌ No intervention history or case notes
- ❌ No timeline/milestones view
- ❌ Charts have fixed height (not responsive)
- ❌ No semester comparison (side-by-side)
- ❌ No attendance calendar
- ❌ No student photo/avatar
- ❌ No edit student modal
- ❌ No predicted vs actual comparison
- ❌ Chart labels could be more descriptive

**Recommended Enhancements**:
1. Add semester selector: Highlight/compare specific semesters
2. Add intervention section: Teacher notes + actions taken
3. Make charts responsive: Use `ResponsiveContainer` with proper parent sizing
4. Add "Edit Student" button → Modal form for updating info
5. Add semester tab: Shows detailed course breakdown
6. Add comparison view: Predicted outcome vs actual outcome

**If modifying**:
- Add new charts → Use Recharts (LineChart, BarChart, etc.)
- Add sections → Add new cards below current layout
- Change API calls → Update `useEffect` + `useMemo`
- Add interactivity → Add state for selected semester, tab

---

### 5️⃣ SemestersPage.jsx

**Status**: 🟡 **70% Complete - READ-ONLY**

**Location**: `src/pages/SemestersPage.jsx`

**Currently Displays**:
```
┌─ Page Header: "Quản lý học kỳ" ────────────┐
├─ 4 Stat Cards: Total | Open | Closed | Latest
└─ Semester Table (7 columns)
   ├─ semester_no | name | academic_year | dates | status | updated_at
   └─ Rows sorted by academic_year (newest first)
```

**Features Implemented**:
- ✅ Fetches from `/semesters`
- ✅ Displays all semester data
- ✅ Open/Closed status badges
- ✅ Date formatting (Vietnamese locale)
- ✅ Loading state with spinner
- ✅ Error state with retry button
- ✅ Empty state
- ✅ Stat cards with counts

**Missing** (CRITICAL FOR THESIS):
- ❌ **NO ADD BUTTON** (can't create semesters!)
- ❌ **NO EDIT BUTTON** (can't update dates/name!)
- ❌ **NO DELETE BUTTON** (can't remove semesters!)
- ❌ **NO STATUS TOGGLE** (can't open/close semesters!)
- ❌ No confirmation modal for destructive actions
- ❌ No semester statistics (students per semester, grades, etc.)
- ❌ No inline edit capability

**IMMEDIATE ACTION NEEDED**: This page needs become fully functional CRUD page:
- Add header button: "Thêm học kỳ"
- Add table actions column: Edit + Delete icons
- Create modal: Form for add/edit semester
- Add confirmation: Before delete

**If modifying**:
- Add CRUD buttons → Add to PageHeader actions
- Create modal form → New component or inline jsx
- Add API calls → POST `/semesters`, PUT `/semesters/{id}`, DELETE `/semesters/{id}`
- Add validation → Form field rules before submit

---

### 6️⃣ AiPage.jsx (AI & Retrain Management)

**Status**: 🟡 **60% Complete**

**Location**: `src/pages/AiPage.jsx`

**Currently Displays**:
```
┌─ Page Header: "AI & Retrain" ──────────────┐
├─ Left Sidebar (50%):
│   ├─ Workflow Steps (3 steps, non-interactive)
│   └─ Retrain Results Card
├─ Right Sidebar (50%):
│   ├─ Current Model Info Card
│   └─ Tips & Deployment Info (static text)
└─ "Chạy Retrain" button (main action)
```

**Features Implemented**:
- ✅ Retrain button → POST `/ai/retrain`
- ✅ Display retrain results (metrics in key-value)
- ✅ Loading state ("Đang retrain...")
- ✅ Error handling with alert
- ✅ Result persistence (until refresh)
- ✅ 3-step workflow visualization

**Missing** (CRITICAL FOR THESIS):
- ❌ **HARD-CODED MODEL INFO** (no real metadata fetching!)
  - Model name: hard-coded to "Student Dropout Predictor"
  - Algorithm: hard-coded to "LogisticRegression"
  - Version: missing entirely
  - Metrics: should come from API, not hard-coded
- ❌ No model version history/rollback
- ❌ No form to select which model to retrain
- ❌ No real-time progress indicator (just shows "Đang retrain...")
- ❌ No retrain job status history
- ❌ No comparison between old vs new model
- ❌ No model performance dashboard (accuracy, precision, recall, F1, ROC-AUC)
- ❌ No schedule retraining option
- ❌ Workflow steps are visual-only (not interactive)

**Recommended Enhancements** (for stronger thesis):
1. Fetch model metadata from new API endpoint: `GET /ai/current-model`
2. Add model version selector: Dropdown to choose which version to run
3. Add performance metrics dashboard: Display current model's accuracy, precision, recall, F1, ROC-AUC
4. Add retraining history: Table showing past retrain jobs with timestamps
5. Add model comparison: Side-by-side metrics before/after retrain
6. Add configuration: Input to select dataset source (kaggle vs local_mysql)

**If modifying**:
- Add model metrics display → Add new cards below header
- Add version selector → Add dropdown with fetched versions
- Add retrain history → Add new section with history table
- Change API calls → Fetch model info from `/ai/current-model` or `/ml-models`

---

### 7️⃣ NotFoundPage.jsx

**Status**: ✅ **100% Complete**

**Location**: `src/pages/NotFoundPage.jsx`

**Display**: Simple 404 error page with home button

**Sufficient for thesis**: Yes, but could add recent page suggestions if time permits.

---

## Components Library

All reusable components are in `src/components/`.

### PageKit.jsx - Layout Component Library

**What it exports** (4 components):

#### `<PageHeader />`
Used by: DashboardPage, StudentsPage, SemestersPage, AiPage, StudentDetailPage

```jsx
<PageHeader 
  title="Dashboard" 
  subtitle="Quick overview" 
  actions={<button>Refresh</button>} 
/>
```

**Props**:
- `title` (string) - Main heading
- `subtitle` (string, optional) - Subheading
- `actions` (ReactNode, optional) - Right-aligned buttons/controls

**Styling**: `.page-header`, `.page-title`, `.page-subtitle` in `index.css`

#### `<SectionCard />`
Used by: AiPage (left/right sidebars)

```jsx
<SectionCard 
  title="Model Info" 
  subtitle="Production" 
  actions={<RefreshIcon />}
  flush={false}
>
  <div>Content here</div>
</SectionCard>
```

**Props**:
- `title` (string) - Card title
- `subtitle` (string, optional) - Secondary info
- `actions` (ReactNode, optional) - Top-right actions
- `children` (ReactNode) - Card content
- `flush` (bool, default false) - Remove inner padding if true

**Styling**: `.card`, `.section-toolbar`, `.card__title`, etc.

#### `<EmptyPanel />`
Used by: DashboardPage, StudentsPage, SemestersPage (when no data)

```jsx
<EmptyPanel 
  icon={<FileIcon />} 
  title="No students found" 
  description="Try adjusting your filters" 
  actions={<button>Reset Filters</button>}
  compact={true}
/>
```

**Props**:
- `icon` (ReactNode) - SVG or component for visual
- `title` (string) - Main message
- `description` (string, optional) - Details
- `actions` (ReactNode, optional) - Action buttons
- `compact` (bool, default true) - Smaller version if true

**Styling**: `.empty-state`, `.empty-state--compact`, `.empty-state__icon/title/desc`

#### `<StatCard />`
Used by: DashboardPage, StudentsPage, SemestersPage (stat boxes)

```jsx
<StatCard 
  icon={<UsersIcon />} 
  label="Total" 
  value={150} 
  subtext="vs 148 last month"
  color="blue"
/>
```

**Props**:
- `icon` (ReactNode) - SVG icon
- `label` (string) - Card label
- `value` (number or string) - Main metric
- `subtext` (string, optional) - Supporting text
- `color` (string) - 'blue', 'green', 'yellow', 'red'

**Styling**: `.stat-card`, `.stat-card--${color}`

### ProtectedRoute.jsx

**Purpose**: Route guard component

```jsx
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

**Logic**:
- Checks for `token` in localStorage
- If exists → render children
- If missing → redirect to `/login`

**Limitation**: ⚠️ **No role-based access control** - all authenticated users have same access

---

## Styling System & Guidelines

### 📐 Architecture

**Location**: `src/index.css` (~1500 lines)

**System**: Pure CSS (NO Tailwind used, despite `tailwind.config.js` existing)

**Approach**: BEM naming convention + CSS variables

### 🎨 Design Tokens

#### Colors

```css
/* Primary */
--color-blue: #3b82f6;
--color-blue-light: #dbeafe;
--color-blue-dark: #1e40af;

/* Status */
--color-green: #10b981;       /* Safe */
--color-yellow: #f59e0b;      /* Warning */
--color-red: #ef4444;         /* Danger */

/* Neutral */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-300: #d1d5db;
--color-gray-500: #6b7280;
--color-gray-700: #374151;
--color-gray-900: #111827;

/* Backgrounds */
--color-bg-primary: #ffffff;
--color-bg-secondary: #f3f4f6;
--color-bg-tertiary: #e5e7eb;
```

#### Spacing

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
```

#### Shadows

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-card: 0 2px 8px rgba(0, 0, 0, 0.08);
```

#### Typography

```css
--font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--font-size-2xl: 24px;
--font-size-3xl: 32px;

--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

#### Border Radius

```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
--radius-xl: 18px;
```

### ✍️ Naming Convention

All CSS follows **BEM (Block Element Modifier)**:

```css
/* Block: The main component */
.card { ... }

  /* Element: Part of the block */
  .card__header { ... }
  .card__title { ... }
  .card__content { ... }

    /* Modifier: Variation of element */
    .card__title--large { ... }
    .card__content--flush { ... }

.button { ... }
  .button__text { ... }
  .button--primary { ... }
  .button--small { ... }

.stat-card { ... }
  .stat-card--green { ... }
  .stat-card--red { ... }
```

### 🛠️ How to Add New Styles

**Example**: Creating a new component style

```css
/* In index.css, near the end */

/* ========== NEW COMPONENT ========== */

.my-component {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-primary);
  box-shadow: var(--shadow-card);
}

  .my-component__title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-gray-900);
    margin-bottom: var(--spacing-sm);
  }

  .my-component__content {
    color: var(--color-gray-700);
    line-height: 1.6;
  }

  .my-component__content--highlighted {
    background-color: var(--color-blue-light);
    padding: var(--spacing-sm);
    border-left: 4px solid var(--color-blue);
  }

.my-component--danger {
  border-left: 4px solid var(--color-red);
  background-color: #fef2f2;
}
```

### ⚠️ Things To AVOID

- ❌ Don't use inline `style={}` (always use CSS classes)
- ❌ Don't add new Tailwind utilities (system uses pure CSS)
- ❌ Don't hard-code colors (always use `--color-*` variables)
- ❌ Don't create fixed pixel sizes for spacing (use `--spacing-*` variables)
- ❌ Don't mix rem/em/px units inconsistently

### 📱 Responsive Design

**Current Status**: ⚠️ MINIMAL

Only **1 media query** exists (in login page):

```css
@media (max-width: 1080px) {
  /* Login page flex direction changes */
}
```

**No mobile-first approach** → Main layout NOT responsive

**What breaks on mobile**:
- ❌ Sidebar: Fixed 248px width (too wide for phones)
- ❌ Table: Min-width 1200px (forces horizontal scroll)
- ❌ Grid: Hard-coded columns (not flexible)

**If fixing responsiveness**, add:

```css
@media (max-width: 1024px) {
  /* Tablet: Reduce sidebar width, collapse grid */
}

@media (max-width: 768px) {
  /* Mobile: Hamburger menu, single column, full-width tables */
}

@media (max-width: 480px) {
  /* Small mobile: Larger touch targets, smaller font */
}
```

---

## How to Add a New Page

### Step 1: Create the Page Component

**File**: `src/pages/[PageName]Page.jsx`

**Template**:

```jsx
// Example: src/pages/DepartmentsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, EmptyPanel, StatCard } from '../components/PageKit';
import axiosClient from '../api/axiosClient';

export default function DepartmentsPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get('/departments');
      setDepartments(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await axiosClient.delete(`/departments/${id}`);
      setDepartments(departments.filter(d => d.id !== id));
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Quản lý khoa" 
        subtitle="Manage departments"
        actions={
          <button 
            className="button button--primary"
            onClick={() => navigate('/departments/new')}
          >
            + Thêm khoa
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="stat-cards-grid">
        <StatCard label="Total" value={departments.length} color="blue" />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert--error">
          {error}
          <button onClick={fetchDepartments}>Retry</button>
        </div>
      )}

      {/* Loading State */}
      {loading && <div className="spinner">Loading...</div>}

      {/* Empty State */}
      {!loading && departments.length === 0 && (
        <EmptyPanel 
          title="No departments" 
          description="Create one to get started"
          actions={<button onClick={() => navigate('/departments/new')}>Add Department</button>}
        />
      )}

      {/* Data Table */}
      {!loading && departments.length > 0 && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr key={dept.id}>
                  <td className="mono">{dept.department_code}</td>
                  <td>{dept.department_name}</td>
                  <td>{dept.description}</td>
                  <td>
                    <button onClick={() => navigate(`/departments/${dept.id}/edit`)}>Edit</button>
                    <button onClick={() => handleDelete(dept.id)}>Delete</button>
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

### Step 2: Add Route to App.jsx

**File**: `src/App.jsx`

```jsx
// Add import
import DepartmentsPage from './pages/DepartmentsPage';

// Add route inside <AdminLayout>
<Route path="/departments" element={<DepartmentsPage />} />
```

### Step 3: Add Navigation Menu Item

**File**: `src/layouts/AdminLayout.jsx`

In the `NAV_ITEMS` array:

```jsx
const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: '📊' },
  { label: 'Sinh viên', href: '/students', icon: '👨‍🎓' },
  { label: 'Học kỳ', href: '/semesters', icon: '📅' },
  { label: 'Khoa', href: '/departments', icon: '🏫' },  // Add this line
  { label: 'AI & Retrain', href: '/ai', icon: '🤖' },
];
```

### Step 4: Add Styling (if needed)

**File**: `src/index.css`

At the bottom of the file, add CSS for your new page:

```css
/* ========== DEPARTMENTS PAGE ========== */

.departments-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.department-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

/* Add more as needed */
```

### Step 5: Test

1. Start dev server: `npm run dev`
2. Navigate to new page in the app
3. Check browser console for errors
4. Test all API calls (create, read, update, delete)

---

## API Integration Checklist

### Currently Implemented Endpoints

| Endpoint | Method | Page | Status |
|----------|--------|------|--------|
| `/auth/login` | POST | LoginPage | ✅ Working |
| `/students` | GET | StudentsPage, DashboardPage | ✅ Working |
| `/students/{id}/history` | GET | StudentDetailPage | ✅ Working |
| `/academic-records/student/{id}` | GET | StudentDetailPage | ✅ Working |
| `/semesters` | GET | SemestersPage, DashboardPage | ✅ Working |
| `/ai/predict-by-student/{id}` | POST | StudentDetailPage | ✅ Working |
| `/ai/retrain` | POST | AiPage | ✅ Working |

### Missing Endpoints (Need Frontend Implementation)

| Endpoint | Method | Purpose | Should Add To |
|----------|--------|---------|---|
| `/departments` | GET | List departments | New DepartmentsPage |
| `/departments` | POST | Create department | New DepartmentsPage |
| `/departments/{id}` | PUT | Update department | New DepartmentsPage |
| `/departments/{id}` | DELETE | Delete department | New DepartmentsPage |
| `/classes` | GET | List classes | New ClassesPage |
| `/classes` | POST | Create class | New ClassesPage |
| `/classes/{id}` | PUT | Update class | New ClassesPage |
| `/classes/{id}` | DELETE | Delete class | New ClassesPage |
| `/students` | POST | Create student | Need form/modal |
| `/students/{id}` | PUT | Update student | Need form/modal |
| `/students/{id}` | DELETE | Delete student | Need form/modal |
| `/semesters` | POST | Create semester | Enhance SemestersPage |
| `/semesters/{id}` | PUT | Update semester | Enhance SemestersPage |
| `/semesters/{id}` | DELETE | Delete semester | Enhance SemestersPage |
| `/ai/current-model` | GET | Get current model info | Enhance AiPage |
| `/ml-models` | GET | Get all model versions | New ModelVersionsPage |

### How to Call an API

**Pattern**: Using `axiosClient`

```javascript
import axiosClient from '../api/axiosClient';

// GET request
const response = await axiosClient.get('/students');
const data = response.data;

// POST request
const result = await axiosClient.post('/students', {
  student_code: 'SV001',
  full_name: 'John Doe',
});

// PUT request
const updated = await axiosClient.put(`/students/${id}`, {
  full_name: 'Updated Name',
});

// DELETE request
await axiosClient.delete(`/students/${id}`);
```

**With error handling**:

```javascript
try {
  const response = await axiosClient.get('/students');
  setData(response.data);
} catch (error) {
  const message = error.response?.data?.message || error.message;
  setError(message);
}
```

---

## Responsive Design Status

### ⚠️ Current State: NOT RESPONSIVE

**Main Issues**:

1. **Sidebar**: Fixed 248px (breaks on tablets < 1200px)
2. **Tables**: Min-width 1200px (forces horizontal scroll on mobile)
3. **Grids**: Hard-coded column counts (doesn't adapt)
4. **No hamburger menu**: Mobile has no way to access nav
5. **Font sizes**: Not scaled down for mobile
6. **Forms**: No mobile-friendly input

### 🔧 Recommended Breakpoints

Add to `src/index.css`:

```css
/* Desktop (current) */
/* 1200px+ */

/* Tablet */
@media (max-width: 1024px) {
  .sidebar { width: 200px; }
  .table { min-width: 800px; }
}

/* Mobile */
@media (max-width: 768px) {
  .sidebar { 
    position: fixed;
    left: -248px;
    transition: left 0.3s;
  }
  .sidebar.open { left: 0; }
  
  .table { min-width: 100%; overflow-x: auto; }
}

/* Small Mobile */
@media (max-width: 480px) {
  .stat-cards-grid { grid-template-columns: 1fr; }
  .button { width: 100%; }
  body { font-size: 14px; }
}
```

---

## Known Issues & Technical Debt

### 🐛 Bugs

| Issue | Severity | Where | Fix |
|-------|----------|-------|-----|
| No pagination on large datasets | HIGH | StudentsPage | Add `<Pagination>` component |
| Charts have fixed heights | MEDIUM | StudentDetailPage | Use `ResponsiveContainer` |
| Hard-coded model metadata | HIGH | AiPage | Create API endpoint |
| Table breaks mobile | CRITICAL | All pages | Add responsive media queries |
| Icon duplication | LOW | All pages | Extract to component |

### ⚠️ Technical Debt

| Item | Impact | Fix |
|------|--------|-----|
| No TypeScript | Low confidence | Consider migration |
| No PropTypes validation | Errors caught late | Add PropTypes |
| No reusable custom hooks | Code duplication | Create `useStudents()`, etc. |
| No unit tests | No safety net | Add Jest + React Testing Library |
| Hard-coded strings | Hard to maintain | Create `src/constants/` file |
| Console.log statements | Unprofessional (StudentDetailPage) | Remove all logs |
| No request timeout | Hangs forever | Add axios timeout config |
| No token refresh logic | Login expires awkwardly | Implement refresh token pattern |

### 📝 Code Quality Observations

**Good**:
- ✅ Clean component separation
- ✅ Consistent file structure
- ✅ Good use of React hooks
- ✅ Centralized CSS
- ✅ SVG icons embedded (no extra package)

**Bad**:
- ❌ No types (TypeScript)
- ❌ Hard-coded strings everywhere
- ❌ Repeated icon definitions
- ❌ No custom hooks for fetch patterns
- ❌ No loading skeleton templates
- ❌ localStorage used directly (no abstraction)

---

## Missing Features (Priority Ranked)

### 🔴 CRITICAL (Must Have for Thesis)

1. **Semester CRUD** → Enhance `SemestersPage.jsx` (add modal + buttons)
   - Time: ~2-3 hours
   - Complexity: Medium
   - Impact: Very High (thesis reviewer expects FULL CRUD)

2. **Departments Page** → Create `src/pages/DepartmentsPage.jsx` (+ router)
   - Time: ~2-3 hours
   - Complexity: Medium
   - Impact: High (demonstrates admin system)

3. **Classes Page** → Create `src/pages/ClassesPage.jsx` (+ router)
   - Time: ~2-3 hours
   - Complexity: Medium
   - Impact: High

4. **Dashboard Charts** → Add to `DashboardPage.jsx` (Recharts)
   - Time: ~1-2 hours
   - Complexity: Low-Medium
   - Impact: High (visibility + polish)

### 🟡 SHOULD HAVE (Nice for Thesis)

5. **Student Forms** → Create modal or separate page for add/edit
   - Time: ~3-4 hours
   - Complexity: Medium-High

6. **Pagination** → Add to `StudentsPage.jsx`
   - Time: ~1-2 hours
   - Complexity: Medium

7. **AI Model Metrics** → Enhance `AiPage.jsx` (fetch model info, show metrics)
   - Time: ~2-3 hours
   - Complexity: Medium
   - Impact: Very High (core thesis feature!)

8. **Column Sorting** → Add to `StudentsPage.jsx` + `SemestersPage.jsx`
   - Time: ~1-2 hours
   - Complexity: Low

### 🟢 NICE TO HAVE (If Time Permits)

9. **Users Management Page** → Create `src/pages/UsersPage.jsx`
   - Time: ~3-4 hours
   - Complexity: Medium

10. **Model Version History** → Create `src/pages/ModelVersionsPage.jsx`
    - Time: ~2-3 hours
    - Complexity: Medium

11. **Responsive Design Fix** → Add media queries to `src/index.css`
    - Time: ~3-4 hours
    - Complexity: Medium

12. **Dark Mode** → Add theme toggle + CSS variables
    - Time: ~2-3 hours
    - Complexity: Low-Medium

---

## Summary: What To Do Next

### For Thesis-Ready State (Next 24 Hours)

1. ✏️ **Enhance `SemestersPage.jsx`**: Add Create/Edit/Delete modal
2. 🏫 **Create `DepartmentsPage.jsx`**: Full CRUD page (copy StudentsPage pattern)
3. 🎓 **Create `ClassesPage.jsx`**: Full CRUD page with department filter
4. 📊 **Add charts to `DashboardPage.jsx`**: GPA trend + risk distribution
5. 🤖 **Enhance `AiPage.jsx`**: Fetch model metadata, show real metrics

### For Polish (Next 48 Hours)

6. 📋 **Add pagination to `StudentsPage.jsx`**
7. 🔄 **Add sorting to tables**
8. 📱 **Fix responsive design** (media queries)
9. 👤 **Create `StudentFormPage.jsx`** if time permits

### Files Modified/Created

**You will create/modify these files**:

```
src/pages/
├── [CREATE] DepartmentsPage.jsx        (~300 lines)
├── [CREATE] ClassesPage.jsx            (~300 lines)
├── [CREATE] StudentFormPage.jsx        (~400 lines, optional)
├── [MODIFY] SemestersPage.jsx          (~200 lines added)
├── [MODIFY] DashboardPage.jsx          (~150 lines added)
├── [MODIFY] AiPage.jsx                 (~200 lines added)

src/
├── [MODIFY] App.jsx                    (+ 6 routes)

src/layouts/
├── [MODIFY] AdminLayout.jsx            (+ nav items, responsive)

src/
├── [MODIFY] index.css                  (+ responsive breakpoints, new styles)
```

---

## Contact / Where to Send New Pages

When adding a new page **follow these MUST-DO steps**:

### ✅ Checklist for New Pages

1. **Create the page component**: `src/pages/[PageName]Page.jsx`
2. **Add route**: Update `src/App.jsx` with `<Route path="/..." element={<NewPage />} />`
3. **Add navigation**: Update `NAV_ITEMS` in `src/layouts/AdminLayout.jsx`
4. **Add styling**: Add CSS to `src/index.css` (namespace with component name)
5. **Test**: Navigate to page, test all CRUD operations
6. **Commit**: Git commit with meaningful message

### 📬 Who To Send To

**For code reviews**:
- Show files: `src/pages/YourNewPage.jsx`, `src/App.jsx`, `src/layouts/AdminLayout.jsx`, `src/index.css`
- Ask: "Does this follow the system pattern?" "Are all CRUD operations working?"

---

## Examples: Using Existing Patterns

### Pattern 1: Page that Fetches & Lists Data

**See**: `src/pages/StudentsPage.jsx`

**Template**:
- `useState` for data, loading, error
- `useEffect` to fetch on mount
- `axiosClient.get()` for API call
- Conditional render: loading → spinner, error → alert, empty → EmptyPanel, data → table

### Pattern 2: Page with Filter/Search

**See**: `src/pages/StudentsPage.jsx`

**Template**:
- `useState` for search term + filter state
- `useMemo` to compute filtered list
- Filter input with onChange handler
- Display filtered count "(X/Y)"

### Pattern 3: Page with Side-by-Side Sections

**See**: `src/pages/AiPage.jsx`

**Template**:
- Flex layout with `flex-direction: row`
- Left side: `flex: 1`, Right side: `flex: 1`
- Use `<SectionCard>` for consistent styling

### Pattern 4: Page with Charts

**See**: `src/pages/StudentDetailPage.jsx`

**Template**:
- Import from Recharts: `LineChart, BarChart, PieChart, etc.`
- Prep data: transform API response into `[{x, y}, ...]` format
- Render: `<LineChart data={data}><Line dataKey="y" /></LineChart>`

### Pattern 5: Form with Modal

**See**: Pages don't have this yet (need to build)

**Template**:
- Create modal component or inline JSX with `display: none/block`
- Form fields in flexbox column
- Submit button calls `axiosClient.post()` or `.put()`
- Close modal on success
- Show error messages if API fails

---

**Last Updated**: March 30, 2026

For questions or template updates, refer back to this document or examine existing page patterns.
