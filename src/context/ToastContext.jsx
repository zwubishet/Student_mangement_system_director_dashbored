import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-500" />,
    error: <XCircle size={18} className="text-rose-500" />,
    warning: <AlertCircle size={18} className="text-amber-500" />,
  };

  const colors = {
    success: 'border-emerald-100 bg-emerald-50',
    error: 'border-rose-100 bg-rose-50',
    warning: 'border-amber-100 bg-amber-50',
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed z-50 flex flex-col gap-3 left-4 right-4 bottom-24 max-w-sm sm:left-auto sm:right-6 sm:bottom-6 lg:bottom-6">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg ${colors[t.type]} animate-in slide-in-from-right-4 duration-300`}>
            {icons[t.type]}
            <p className="text-sm font-semibold text-slate-800 flex-1">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
