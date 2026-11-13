import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const ToastContainer: React.FC = () => {
  const toasts = useStore((s) => s.toasts);
  const removeToast = useStore((s) => s.removeToast);

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="pointer-events-auto flex items-start gap-3 p-3.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl shadow-lg border border-slate-700/50"
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isError ? (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                ) : (
                  <Info className="w-4 h-4 text-sky-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold leading-tight">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-slate-300 mt-0.5 leading-snug line-clamp-2">
                    {toast.description}
                  </p>
                )}
              </div>

              {toast.undoAction && (
                <button
                  onClick={() => {
                    toast.undoAction!();
                    removeToast(toast.id);
                  }}
                  className="shrink-0 flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 px-2 py-1 rounded-md border border-emerald-500/30 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Undo</span>
                </button>
              )}

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-slate-400 hover:text-slate-200 p-0.5 rounded cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
