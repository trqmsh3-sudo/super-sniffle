import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const ToastContext = createContext();

/**
 * Custom hook to use toast notifications
 * @returns {object} Toast functions: success, error, info, warning
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

/**
 * Toast Provider Component
 * Wrap your app with this to enable toast notifications
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random(); // Unique ID
    setToasts(prev => [...prev, { id, message, type }]);
    
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Toast container - fixed to top-right */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map(({ id, message, type }) => (
          <Toast 
            key={id} 
            message={message} 
            type={type} 
            onClose={() => removeToast(id)} 
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/**
 * Individual Toast Component
 */
const Toast = ({ message, type, onClose }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-600" />,
    error: <XCircle className="h-5 w-5 text-red-600" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
    info: <Info className="h-5 w-5 text-blue-600" />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const textColors = {
    success: 'text-green-900',
    error: 'text-red-900',
    warning: 'text-yellow-900',
    info: 'text-blue-900'
  };

  return (
    <div 
      className={`
        flex items-center gap-3 p-4 rounded-xl border-2 shadow-lg
        ${bgColors[type]} 
        animate-[slideInRight_0.3s_ease-out] 
        pointer-events-auto
        max-w-sm
      `}
      role="alert"
    >
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      
      <p className={`flex-1 text-sm font-medium ${textColors[type]}`}>
        {message}
      </p>
      
      <button 
        onClick={onClose}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1 hover:bg-white/50"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// Add animation to index.css or tailwind config
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
