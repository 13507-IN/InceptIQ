import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastInput {
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastItem extends ToastInput {
  id: string;
}

interface ToastContextValue {
  addToast: (toast: ToastInput) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4200;

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const variantConfig: Record<
  ToastVariant,
  {
    icon: React.ComponentType<{ className?: string }>;
    border: string;
    accent: string;
    badge: string;
    title: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    border: 'border-emerald-500/40',
    accent: 'from-emerald-500/30 to-emerald-500/5',
    badge: 'bg-emerald-500/15 text-emerald-200',
    title: 'text-emerald-100'
  },
  error: {
    icon: AlertCircle,
    border: 'border-rose-500/40',
    accent: 'from-rose-500/30 to-rose-500/5',
    badge: 'bg-rose-500/15 text-rose-200',
    title: 'text-rose-100'
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-amber-500/40',
    accent: 'from-amber-500/30 to-amber-500/5',
    badge: 'bg-amber-500/15 text-amber-200',
    title: 'text-amber-100'
  },
  info: {
    icon: Info,
    border: 'border-sky-500/40',
    accent: 'from-sky-500/30 to-sky-500/5',
    badge: 'bg-sky-500/15 text-sky-200',
    title: 'text-sky-100'
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeouts = useRef<Record<string, number>>({});

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    if (timeouts.current[id]) {
      clearTimeout(timeouts.current[id]);
      delete timeouts.current[id];
    }
  }, []);

  const addToast = useCallback(
    (toast: ToastInput) => {
      const id = generateId();
      const next: ToastItem = {
        id,
        title: toast.title,
        message: toast.message,
        variant: toast.variant || 'info',
        duration: toast.duration ?? DEFAULT_DURATION
      };

      setToasts(prev => [...prev, next]);

      if (next.duration && next.duration > 0) {
        timeouts.current[id] = window.setTimeout(() => {
          removeToast(id);
        }, next.duration);
      }

      return id;
    },
    [removeToast]
  );

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-[320px] max-w-[calc(100vw-3rem)] flex-col gap-3">
        <AnimatePresence>
          {toasts.map(toast => {
            const variant = toast.variant || 'info';
            const config = variantConfig[variant];
            const Icon = config.icon;

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className={`pointer-events-auto overflow-hidden rounded-2xl border ${config.border} bg-gradient-to-br ${config.accent} shadow-2xl backdrop-blur`}
              >
                <div className="flex items-start gap-3 p-4">
                  <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${config.badge}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {toast.title && (
                      <div className={`text-sm font-semibold ${config.title}`}>{toast.title}</div>
                    )}
                    <div className="text-xs text-sand-200/90 whitespace-pre-line">
                      {toast.message}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeToast(toast.id)}
                    className="text-sand-300 hover:text-sand-100 transition"
                    aria-label="Dismiss toast"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};
