import { createContext, useContext, useState, useCallback } from 'react';
import { FiCheck, FiX, FiInfo, FiAlertTriangle } from 'react-icons/fi';

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);
  const warning = useCallback((msg) => addToast(msg, 'warning'), [addToast]);

  const icons = {
    success: <FiCheck size={18} />,
    error: <FiX size={18} />,
    info: <FiInfo size={18} />,
    warning: <FiAlertTriangle size={18} />,
  };

  const colors = {
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  };

  return (
    <ToastContext.Provider value={{ success, error, info, warning, addToast }}>
      {children}

      <div className="toast-container">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`animate-toastIn flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg min-w-[280px] max-w-[400px] ${colors[toast.type]}`}
          >
            <span>{icons[toast.type]}</span>
            <p className="text-sm flex-1">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
