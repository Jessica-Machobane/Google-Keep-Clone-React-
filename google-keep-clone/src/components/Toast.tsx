import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  onUndo?: () => void;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 flex items-center justify-between gap-4 px-4 py-3 bg-[#323232] dark:bg-[#202124] text-white rounded-lg shadow-xl border border-white/10 text-xs sm:text-sm animate-in slide-in-from-bottom-3 duration-200 min-w-[260px] max-w-sm">
      <span className="truncate">{toast.message}</span>
      {toast.onUndo && (
        <button
          type="button"
          onClick={() => {
            if (toast.onUndo) toast.onUndo();
            onClose();
          }}
          className="text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider text-xs whitespace-nowrap"
        >
          Undo
        </button>
      )}
    </div>
  );
};
