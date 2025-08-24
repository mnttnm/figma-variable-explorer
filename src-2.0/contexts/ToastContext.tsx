import { createContext, h, ComponentChildren } from "preact";
import { useCallback, useContext, useState } from "preact/hooks";
import { Toast } from "../components/Toast";

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

export interface ToastContextState {
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextState | null>(null);

interface ToastProviderProps {
  children: ComponentChildren;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((
    message: string, 
    type: ToastMessage['type'] = 'info',
    duration: number = 3000
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 11);
    const toast: ToastMessage = { id, message, type, duration };
    
    setToasts((prev) => [...prev, toast]);

    // Auto-remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 'var(--sds-size-space-100)',
        pointerEvents: 'none'
      }}>
        {toasts.map((toast) => (
          <Toast 
            key={toast.id} 
            toast={toast} 
            onRemove={() => removeToast(toast.id)} 
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextState => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};