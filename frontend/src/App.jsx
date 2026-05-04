import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import StudentsPage from './pages/StudentsPage';
import StudentDetailPage from './pages/StudentDetailPage';
import SemestersPage from './pages/SemestersPage';
import AiPage from './pages/AiPage';
import DepartmentsPage from './pages/DepartmentsPage';
import ClassesPage from './pages/ClassesPage';
import UsersPage from './pages/UsersPage';
import LecturersPage from './pages/LecturersPage';
import AccessDeniedPage from './pages/AccessDeniedPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="students/:id" element={<StudentDetailPage />} />
          <Route path="semesters" element={<SemestersPage />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="lecturers" element={<LecturersPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="ai" element={<AiPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;