import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ type, message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    info: <AlertCircle className="w-5 h-5 text-blue-600" />
  };

  const styles = {
    success: 'bg-green-50 border-green-100 text-green-900',
    error: 'bg-red-50 border-red-100 text-red-900',
    info: 'bg-blue-50 border-blue-100 text-blue-900'
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-toast-slide-in">
      <div 
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl
          shadow-lg border backdrop-blur-sm
          transform transition-all duration-300
          hover:translate-y-0.5 hover:shadow-md
          ${styles[type]}
        `}
      >
        {icons[type]}
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 p-1 rounded-lg transition-colors duration-200 hover:bg-black/5"
          aria-label="Fermer la notification"
        >
          <X className="w-4 h-4 opacity-60" />
        </button>
      </div>
    </div>
  );
}