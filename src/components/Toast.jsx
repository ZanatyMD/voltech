import { useState, useEffect, useCallback } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

const toastListeners = new Set();

export function showToast(message, type = 'info', duration = 3500) {
  const id = Date.now() + Math.random();
  toastListeners.forEach(listener => listener({ id, message, type, duration }));
}

function Toast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    setToasts(prev => [...prev, { ...toast, exiting: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === toast.id ? { ...t, exiting: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 300);
    }, toast.duration);
  }, []);

  useEffect(() => {
    toastListeners.add(addToast);
    return () => toastListeners.delete(addToast);
  }, [addToast]);

  const dismissToast = (id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  };

  const icons = {
    error: <AlertCircle size={20} />,
    success: <CheckCircle size={20} />,
    info: <Info size={20} />,
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type} ${toast.exiting ? 'toast-exit' : ''}`}>
          <span className="toast-icon">{icons[toast.type]}</span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => dismissToast(toast.id)}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toast;
