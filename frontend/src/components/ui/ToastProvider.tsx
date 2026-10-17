import { createContext, useState, useCallback, useContext, type ReactNode } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000); // 4 seconds
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => addToast(message, type), [addToast]);
  const success = useCallback((message: string) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message: string) => addToast(message, 'error'), [addToast]);
  const info = useCallback((message: string) => addToast(message, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, showToast, success, error, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={twMerge(
              clsx(
                "flex items-center gap-3 min-w-[300px] max-w-sm px-4 py-3 rounded-lg shadow-lg border transition-all animate-in slide-in-from-right-8 fade-in",
                {
                  "bg-green-50 border-green-200 text-green-800": toast.type === 'success',
                  "bg-red-50 border-red-200 text-red-800": toast.type === 'error',
                  "bg-primary-50 border-primary-200 text-primary-800": toast.type === 'info',
                }
              )
            )}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-primary-500" />}
            
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            
            <button
              onClick={() => setToasts(t => t.filter(x => x.id !== toast.id))}
              className="text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
