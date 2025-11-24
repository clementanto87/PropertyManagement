import { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Landing3D from './pages/Landing3D';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import MicrosoftCallbackPage from './pages/MicrosoftCallbackPage';
import DashboardLayout from './components/layout/DashboardLayout';
import PropertiesPage from './pages/PropertiesPage';
import UnitsPage from './pages/UnitsPage';
import UnitDetailsPage from './pages/UnitDetailsPage';
import TenantsPage from './pages/TenantsPage';
import NewTenantPage from './pages/NewTenantPage';
import TenantDetailPage from './pages/TenantDetailPage';
import EditTenantPage from './pages/EditTenantPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import LeasesPage from './pages/LeasesPage';
import NewLeasePage from './pages/NewLeasePage';
import WorkOrdersPage from './pages/WorkOrdersPage';
import NewWorkOrderPage from './pages/NewWorkOrderPage';
import WorkOrderDetailPage from './pages/WorkOrderDetailPage';
import VendorsPage from './pages/VendorsPage';
import NewVendorPage from './pages/NewVendorPage';
import ExpensesPage from './pages/ExpensesPage';
import NewExpensePage from './pages/NewExpensePage';
import ReportsPage from './pages/ReportsPage';
import DashboardPage from './pages/DashboardPage';
import AddPropertyPage from './pages/AddPropertyPage';
import PaymentsPage from './pages/PaymentsPage';
import CalendarPage from './pages/CalendarPage';
import { CommunicationsPage } from './features/communications/components/CommunicationsPage';
import { CommunicationDetail } from './features/communications/components/CommunicationDetail';
import { CommunicationForm } from './features/communications/components/CommunicationForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import LeaseAgreementPage from './pages/LeaseAgreementPage';
import SignAgreementPage from './pages/SignAgreementPage';
import TenantPortalSetupPage from './pages/TenantPortalSetupPage';
import GDPRManagementPage from './pages/GDPRManagementPage';
import EmailTemplatesPage from './pages/EmailTemplatesPage';
import { Outlet } from 'react-router-dom';

import App from './App';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'landing3d', element: <Landing3D /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignUpPage /> },
      { path: 'sign-agreement/:agreementId', element: <SignAgreementPage /> },
      { path: 'tenant-setup/:token', element: <TenantPortalSetupPage /> },
      { path: 'auth/microsoft/callback', element: <MicrosoftCallbackPage /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <DashboardPage />
          },
          {
            path: 'profile',
            element: <ProfilePage />
          },
          {
            path: 'properties',
            element: <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><Outlet /></ProtectedRoute>,
            children: [
              { index: true, element: <PropertiesPage /> },
              { path: 'add', element: <AddPropertyPage /> },
              { path: ':id', element: <PropertyDetailPage /> },
              { path: ':id/edit', element: <AddPropertyPage /> }
            ]
          },
          {
            path: 'units',
            children: [
              { index: true, element: <UnitsPage /> },
              { path: ':id', element: <UnitDetailsPage /> }
            ]
          },
          {
            path: 'tenants',
            element: <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><Outlet /></ProtectedRoute>,
            children: [
              { index: true, element: <TenantsPage /> },
              { path: 'new', element: <NewTenantPage /> },
              { path: ':id', element: <TenantDetailPage /> },
              { path: ':id/edit', element: <EditTenantPage /> },
              { path: ':tenantId/communications', element: <CommunicationsPage /> },
              { path: ':tenantId/communications/new', element: <CommunicationForm /> },
              { path: ':tenantId/communications/:communicationId', element: <CommunicationDetail /> },
              { path: ':tenantId/communications/:communicationId/edit', element: <CommunicationForm /> },
            ]
          },
          {
            path: 'leases',
            element: <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><Outlet /></ProtectedRoute>,
            children: [
              { index: true, element: <LeasesPage /> },
              { path: 'new', element: <NewLeasePage /> },
              { path: ':leaseId/agreement', element: <LeaseAgreementPage /> },
              { path: ':id/edit', element: <NewLeasePage /> }
            ]
          },
          { path: 'work-orders', element: <WorkOrdersPage /> },
          { path: 'work-orders/new', element: <NewWorkOrderPage /> },
          { path: 'work-orders/:id', element: <WorkOrderDetailPage /> },
          { path: 'work-orders/:id/edit', element: <NewWorkOrderPage /> },
          {
            path: 'vendors',
            element: <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><Outlet /></ProtectedRoute>,
            children: [
              { index: true, element: <VendorsPage /> },
              { path: 'new', element: <NewVendorPage /> },
              { path: ':id/edit', element: <NewVendorPage /> }
            ]
          },
          {
            path: 'expenses',
            element: <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><Outlet /></ProtectedRoute>,
            children: [
              { index: true, element: <ExpensesPage /> },
              { path: 'new', element: <NewExpensePage /> },
              { path: ':id/edit', element: <NewExpensePage /> }
            ]
          },
          { path: 'payments', element: <PaymentsPage /> },
          { path: 'calendar', element: <CalendarPage /> },
          {
            path: 'reports',
            element: <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><ReportsPage /></ProtectedRoute>
          },
          {
            path: 'gdpr',
            element: <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><GDPRManagementPage /></ProtectedRoute>
          },
          {
            path: 'communications',
            children: [
              { index: true, element: <CommunicationsPage /> },
              { path: 'new', element: <CommunicationForm /> },
              { path: ':communicationId', element: <CommunicationDetail /> },
              { path: ':communicationId/edit', element: <CommunicationForm /> },
            ],
          },
          {
            path: 'email-templates',
            element: <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><EmailTemplatesPage /></ProtectedRoute>
          },
        ]
      },
    ],
  },
];
