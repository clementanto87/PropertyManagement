import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <>
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
    </>
  );
}
