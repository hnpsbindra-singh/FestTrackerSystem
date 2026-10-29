import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (options: Omit<ToastMessage, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastMessage, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => {
      toast({ type: 'success', title, message });
    },
    [toast]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      toast({ type: 'error', title, message, duration: 6000 });
    },
    [toast]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      toast({ type: 'info', title, message });
    },
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-sm transition-all duration-150 animate-in fade-in slide-in-from-bottom-2 ${
              item.type === 'success'
                ? 'bg-white border-emerald-200 text-zinc-900'
                : item.type === 'error'
                ? 'bg-white border-rose-200 text-zinc-900'
                : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {item.type === 'success' && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              )}
              {item.type === 'error' && (
                <AlertCircle className="w-5 h-5 text-rose-600" />
              )}
              {item.type === 'info' && (
                <Info className="w-5 h-5 text-brand-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
              {item.message && (
                <p className="mt-0.5 text-xs text-zinc-600 break-words leading-relaxed">
                  {item.message}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(item.id)}
              className="shrink-0 text-zinc-400 hover:text-zinc-600 p-0.5 rounded transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
