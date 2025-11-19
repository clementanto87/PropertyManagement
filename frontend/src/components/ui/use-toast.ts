import * as React from 'react';

type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastOptions = Omit<Toast, 'id'>;

type ToastContextType = {
  toasts: Toast[];
  toast: (options: ToastOptions) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback(({ title, description, variant = 'default', duration = 5000 }: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts((currentToasts) => [
      ...currentToasts,
      { id, title, description, variant },
    ]);

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismissToast }}>
      {children}
      <div className="fixed bottom-0 right-0 p-4 space-y-2 w-full max-w-xs z-50">
        {toasts.map(({ id, title, description, variant = 'default' }) => (
          <div
            key={id}
            className={`p-4 rounded-md shadow-lg ${
              variant === 'destructive'
                ? 'bg-red-500 text-white'
                : variant === 'success'
                ? 'bg-green-500 text-white'
                : variant === 'warning'
                ? 'bg-yellow-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{title}</h3>
                {description && (
                  <p className="text-sm opacity-90">{description}</p>
                )}
              </div>
              <button
                onClick={() => dismissToast(id)}
                className="opacity-70 hover:opacity-100"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
