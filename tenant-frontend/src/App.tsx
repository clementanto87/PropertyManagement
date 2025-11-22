import { Navigate, Route, Routes } from 'react-router-dom';
import { TenantLayout } from './components/layout/TenantLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { CommunityPage } from './pages/CommunityPage';
import { AmenitiesPage } from './pages/AmenitiesPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';

function App() {
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<TenantLayout />}>
          <Route index element={<Navigate to="/app" replace />} />
          <Route path="/app" element={<DashboardPage />} />
          <Route path="/app/payments" element={<PaymentsPage />} />
          <Route path="/app/maintenance" element={<MaintenancePage />} />
          <Route path="/app/community" element={<CommunityPage />} />
          <Route path="/app/amenities" element={<AmenitiesPage />} />
          <Route path="/app/documents" element={<DocumentsPage />} />
          <Route path="/app/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}

export default App;
