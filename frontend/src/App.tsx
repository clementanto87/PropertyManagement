import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from './context/ThemeContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Toaster
            position="top-center"
            richColors
            closeButton
            theme="light"
            toastOptions={{
              style: {
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
              classNames: {
                toast: 'font-sans',
                title: 'font-bold text-base',
                description: 'text-sm text-gray-500',
              }
            }}
          />
          <Outlet />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
