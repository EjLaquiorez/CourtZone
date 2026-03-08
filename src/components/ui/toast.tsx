'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface ToastContextType {
  toast: (props: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant }]);

    // Auto remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ease-in-out',
              t.variant === 'destructive'
                ? 'bg-red-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            )}
          >
            <h3 className="font-semibold">{t.title}</h3>
            {t.description && <p className="text-sm mt-1">{t.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Helper hook for common toast patterns
export function useToastHelpers() {
  const { toast } = useToast();

  return {
    success: (title: string, description?: string) => {
      toast({ title, description, variant: 'default' });
    },
    error: (title: string, description?: string) => {
      toast({ title, description, variant: 'destructive' });
    },
    info: (title: string, description?: string) => {
      toast({ title, description, variant: 'default' });
    },
    warning: (title: string, description?: string) => {
      toast({ title, description, variant: 'destructive' });
    }
  };
}
