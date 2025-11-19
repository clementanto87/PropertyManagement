import { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import MicrosoftCallbackPage from './pages/MicrosoftCallbackPage';
import DashboardLayout from './components/layout/DashboardLayout';
import PropertiesPage from './pages/PropertiesPage';
import UnitsPage from './pages/UnitsPage';
import TenantsPage from './pages/TenantsPage';
import NewTenantPage from './pages/NewTenantPage';
import TenantDetailPage from './pages/TenantDetailPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import LeasesPage from './pages/LeasesPage';
import WorkOrdersPage from './pages/WorkOrdersPage';
import VendorsPage from './pages/VendorsPage';
import ExpensesPage from './pages/ExpensesPage';
import ReportsPage from './pages/ReportsPage';
import DashboardPage from './pages/DashboardPage';
import AddPropertyPage from './pages/AddPropertyPage';
import FinancialsPage from './pages/FinancialsPage';
import { CommunicationsPage } from './features/communications/components/CommunicationsPage';
import { CommunicationDetail } from './features/communications/components/CommunicationDetail';

import App from './App';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignUpPage /> },
      { path: 'auth/microsoft/callback', element: <MicrosoftCallbackPage /> },
      {
        path: 'dashboard',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />
          },
          {
            path: 'properties',
            children: [
              { index: true, element: <PropertiesPage /> },
              { path: 'add', element: <AddPropertyPage /> },
              { path: ':id', element: <PropertyDetailPage /> },
              { path: ':id/edit', element: <AddPropertyPage /> }
            ]
          },
          { path: 'units', element: <UnitsPage /> },
          { path: 'tenants', element: <TenantsPage /> },
          { path: 'tenants/new', element: <NewTenantPage /> },
          { path: 'tenants/:id', element: <TenantDetailPage /> },
          { path: 'leases', element: <LeasesPage /> },
          { path: 'work-orders', element: <WorkOrdersPage /> },
          { path: 'vendors', element: <VendorsPage /> },
          { path: 'expenses', element: <ExpensesPage /> },
          { path: 'financials', element: <FinancialsPage /> },
          { path: 'reports', element: <ReportsPage /> },
          {
            path: 'communications',
            children: [
              { index: true, element: <CommunicationsPage /> },
              { path: ':communicationId', element: <CommunicationDetail /> },
            ],
          },
        ]
      },
    ],
  },
];
