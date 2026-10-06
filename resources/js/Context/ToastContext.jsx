import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = "success", duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, removeToast }}>
            {children}
            {/* Global Toast Container */}
            <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-xl border text-xs font-semibold backdrop-blur-md transition-all animate-slide-up ${
                            toast.type === "success"
                                ? "bg-emerald-900/90 text-white border-emerald-500/40"
                                : toast.type === "error"
                                ? "bg-rose-900/90 text-white border-rose-500/40"
                                : "bg-slate-900/90 text-white border-slate-700"
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            {toast.type === "success" ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : toast.type === "error" ? (
                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            ) : (
                                <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                            )}
                            <span>{toast.message}</span>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-white/60 hover:text-white p-1"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        return { showToast: () => {} };
    }
    return context;
}
