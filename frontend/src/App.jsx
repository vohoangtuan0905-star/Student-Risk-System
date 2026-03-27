import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import StudentsPage from './pages/StudentsPage';
import StudentDetailPage from './pages/StudentDetailPage';

function PlaceholderPage({ title }) {
  return (
    <div>
      <h1>{title}</h1>
      <p>Trang này sẽ được hoàn thiện ở các ngày tiếp theo.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="students/:id" element={<StudentDetailPage />} />
          <Route path="students" element={<PlaceholderPage title="Quản lý sinh viên" />} />
          <Route path="semesters" element={<PlaceholderPage title="Quản lý học kỳ" />} />
          <Route path="ai" element={<PlaceholderPage title="AI & Retrain" />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;