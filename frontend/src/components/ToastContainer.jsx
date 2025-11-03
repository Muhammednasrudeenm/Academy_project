import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  const getToastConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
          border: 'border-green-500/50',
          text: 'text-green-300',
          icon: CheckCircle,
          iconColor: 'text-green-400',
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500/20 to-red-600/20',
          border: 'border-red-500/50',
          text: 'text-red-300',
          icon: AlertCircle,
          iconColor: 'text-red-400',
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
          border: 'border-yellow-500/50',
          text: 'text-yellow-300',
          icon: AlertTriangle,
          iconColor: 'text-yellow-400',
        };
      case 'info':
      default:
        return {
          bg: 'bg-gradient-to-r from-sky-500/20 to-blue-500/20',
          border: 'border-sky-500/50',
          text: 'text-sky-300',
          icon: Info,
          iconColor: 'text-sky-400',
        };
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-[10000] flex flex-col gap-3 max-w-md w-full sm:w-auto pointer-events-none">
      {toasts.map((toast) => {
        const config = getToastConfig(toast.type);
        const Icon = config.icon;

        return (
          <div
            key={toast.id}
            className={`
              ${config.bg} ${config.border} ${config.text}
              border backdrop-blur-sm shadow-2xl rounded-2xl p-4
              animate-slideInRight pointer-events-auto
              flex items-start gap-3 w-full sm:min-w-[350px]
              relative overflow-hidden
            `}
          >
            {/* Decorative background glow */}
            <div className={`absolute inset-0 ${config.bg.replace('/20', '/10')} blur-xl opacity-50`}></div>
            
            {/* Icon */}
            <div className={`${config.iconColor} flex-shrink-0 mt-0.5`}>
              <Icon size={20} className="animate-scaleIn" />
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className={`${config.text} font-medium text-sm leading-relaxed break-words`}>
                {toast.message}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={() => removeToast(toast.id)}
              className={`
                ${config.text} hover:opacity-80 active:opacity-60
                flex-shrink-0 p-1 rounded-full transition-all
                hover:bg-black/10 active:scale-95
              `}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>

            {/* Progress bar animation */}
            {toast.duration > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 overflow-hidden">
                <div
                  className={`h-full ${config.bg.replace('/20', '/60')} animate-progressBar`}
                  style={{
                    animationDuration: `${toast.duration}ms`,
                  }}
                ></div>
              </div>
            )}
          </div>
        );
      })}

      {/* Custom CSS Animations */}
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes progressBar {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
        .animate-progressBar {
          animation: progressBar linear forwards;
        }
      `}</style>
    </div>
  );
};

export default ToastContainer;

