'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { removeToast } from '../../store/slices/uiSlice';
import { undoTaskAction } from '../../store/slices/taskSlice';
import { CheckCircle2, AlertCircle, Info, RotateCcw, X } from 'lucide-react';

export function ToastContainer() {
  const dispatch = useAppDispatch();
  const { toasts } = useAppSelector((state) => state.ui);

  useEffect(() => {
    if (toasts.length > 0) {
      const activeToast = toasts[toasts.length - 1];
      const timer = setTimeout(() => {
        dispatch(removeToast(activeToast.id));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border shadow-2xl flex items-center justify-between gap-3 text-xs animate-in slide-in-from-bottom-3 duration-200 ${
              isError
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : isSuccess
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-900/90 border-slate-700/80 text-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isError ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : isSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              )}
              <span className="font-medium truncate leading-tight">{toast.message}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {toast.showUndo && (
                <button
                  onClick={() => {
                    dispatch(undoTaskAction());
                    dispatch(removeToast(toast.id));
                  }}
                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Undo</span>
                </button>
              )}

              <button
                onClick={() => dispatch(removeToast(toast.id))}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
