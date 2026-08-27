import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, Download, X, FileText, Check } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'download';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  fileName?: string;
  fileSize?: string;
}

export interface ToastContextType {
  showToast: (message: string, type?: ToastType, fileName?: string, fileSize?: string) => void;
  showDownloadToast: (fileName: string, fileSize?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success', fileName?: string, fileSize?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type, fileName, fileSize }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const showDownloadToast = useCallback((fileName: string, fileSize?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, {
      id,
      message: `O material "${fileName}" foi baixado com sucesso.`,
      type: 'download',
      fileName,
      fileSize
    }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, showDownloadToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => {
          if (toast.type === 'download') {
            return (
              <div
                key={toast.id}
                className="pointer-events-auto relative overflow-hidden flex items-center gap-3.5 bg-[#0d0e12]/95 backdrop-blur-2xl border border-emerald-500/30 text-white p-4 rounded-2xl shadow-2xl shadow-emerald-500/15 animate-fade-in-up min-w-[320px] max-w-[420px]"
              >
                {/* Emerald vertical bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500"></div>

                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 shadow-inner">
                  <Download className="w-5 h-5 animate-bounce" style={{ animationIterationCount: 2 }} />
                </div>

                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Download Concluído
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white truncate leading-tight" title={toast.fileName || toast.message}>
                    {toast.fileName || toast.message}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>Salvo no seu dispositivo</span>
                    {toast.fileSize && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-emerald-400/90 font-medium">{toast.fileSize}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          }

          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-center gap-3 bg-[#121318]/95 backdrop-blur-2xl border border-white/10 text-white px-5 py-4 rounded-2xl shadow-2xl animate-fade-in-up min-w-[300px]"
            >
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400 shrink-0" />}
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="text-slate-500 hover:text-white shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

