import { RouteObject } from 'react-router-dom';
import { CommunicationsPage } from './components/CommunicationsPage';
import { CommunicationDetail } from './components/CommunicationDetail';
import { CommunicationForm } from './components/CommunicationForm';

export const communicationRoutes: RouteObject[] = [
  {
    path: 'communications',
    element: <CommunicationsPage />,
    children: [
      { index: true, element: null },
      { path: ':communicationId', element: <CommunicationDetail /> },
    ],
  },
  {
    path: 'tenants/:tenantId/communications',
    element: <CommunicationsPage />,
    children: [
      { index: true, element: null },
      { path: 'new', element: <CommunicationForm /> },
      { path: ':communicationId', element: <CommunicationDetail /> },
      { path: ':communicationId/edit', element: <CommunicationForm /> },
    ],
  },
];
