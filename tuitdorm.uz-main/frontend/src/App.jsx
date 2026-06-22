import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Layout from './components/common/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AttendancePage from './pages/AttendancePage';
import StudentsPage from './pages/StudentsPage';
import UsersPage from './pages/UsersPage';
import FloorsPage from './pages/FloorsPage';
import ReportsPage from './pages/ReportsPage';
import AlertsPage from './pages/AlertsPage';
import HolidaysPage from './pages/HolidaysPage';
import SettingsPage from './pages/SettingsPage';
import TrashPage from './pages/TrashPage';

import LandingPage from './pages/LandingPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, token } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#e2e8f0',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '12px',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Layout><AttendancePage /></Layout></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><Layout><StudentsPage /></Layout></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute roles={['superadmin']}><Layout><UsersPage /></Layout></ProtectedRoute>} />
        <Route path="/floors" element={<ProtectedRoute roles={['superadmin']}><Layout><FloorsPage /></Layout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Layout><ReportsPage /></Layout></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Layout><AlertsPage /></Layout></ProtectedRoute>} />
        <Route path="/trash" element={<ProtectedRoute roles={['superadmin', 'sardor']}><Layout><TrashPage /></Layout></ProtectedRoute>} />
        <Route path="/holidays" element={<ProtectedRoute roles={['superadmin']}><Layout><HolidaysPage /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
