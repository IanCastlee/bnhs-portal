import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useRef,
} from "react";
import { router } from "@inertiajs/react";
import {
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Info,
    X,
} from "lucide-react";

const ToastContext = createContext(null);

// Standalone module-level dispatcher for programmatic use outside React components
let activeToastHandler = null;

export const toast = {
    success: (message, options) =>
        activeToastHandler ? activeToastHandler(message, "success", options) : null,
    error: (message, options) =>
        activeToastHandler ? activeToastHandler(message, "error", options) : null,
    warning: (message, options) =>
        activeToastHandler ? activeToastHandler(message, "warning", options) : null,
    info: (message, options) =>
        activeToastHandler ? activeToastHandler(message, "info", options) : null,
    dismiss: (id) =>
        activeToastHandler && activeToastHandler.dismiss
            ? activeToastHandler.dismiss(id)
            : null,
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const lastFlashFingerprintRef = useRef(null);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        (message, type = "success", options = {}) => {
            if (!message) return null;

            let msg = message;
            let title = null;
            let duration =
                typeof options === "number"
                    ? options
                    : options?.duration ?? 4500;

            if (typeof message === "object" && message !== null) {
                title = message.title || null;
                msg =
                    message.message ||
                    message.description ||
                    JSON.stringify(message);
            } else if (typeof options === "object" && options?.title) {
                title = options.title;
            }

            const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            const newToast = {
                id,
                message: String(msg),
                title,
                type,
                duration,
            };

            setToasts((prev) => {
                // Keep only the latest 3 toasts to prevent viewport clutter
                const existing = prev.slice(-3);
                return [...existing, newToast];
            });

            if (duration > 0) {
                setTimeout(() => {
                    removeToast(id);
                }, duration);
            }

            return id;
        },
        [removeToast],
    );

    // Sync external toast helper singleton
    useEffect(() => {
        const handler = (msg, type, opts) => showToast(msg, type, opts);
        handler.dismiss = (id) => removeToast(id);
        activeToastHandler = handler;

        return () => {
            activeToastHandler = null;
        };
    }, [showToast, removeToast]);

    // Reusable Flash Message Processor
    const processFlash = useCallback(
        (flash) => {
            if (!flash || typeof flash !== "object") return;

            // Generate fingerprint to prevent duplicate toast on same visit or interval reloads
            const fingerprint = JSON.stringify(flash);
            if (
                fingerprint === lastFlashFingerprintRef.current ||
                fingerprint === "{}"
            ) {
                return;
            }
            lastFlashFingerprintRef.current = fingerprint;

            if (flash.success) {
                showToast(flash.success, "success");
            }
            if (flash.error) {
                showToast(flash.error, "error");
            }
            if (flash.warning) {
                showToast(flash.warning, "warning");
            }
            if (flash.info) {
                showToast(flash.info, "info");
            }
            if (flash.status) {
                showToast(flash.status, "info");
            }
        },
        [showToast],
    );

    // 1. Initial Page Load Flash Detection (e.g., standard redirects from login/logout)
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const pageDataEl = document.getElementById("app");
            if (pageDataEl?.dataset?.page) {
                const initialData = JSON.parse(pageDataEl.dataset.page);
                const flash = initialData?.props?.flash;
                if (flash) {
                    processFlash(flash);
                }
            }
        } catch {
            // Silently ignore dataset parsing errors
        }
    }, [processFlash]);

    // 2. Global Inertia Event Listeners (Triggers on all POST, PUT, DELETE, and GET action responses)
    useEffect(() => {
        const unregisterSuccess = router.on("success", (event) => {
            const flash = event.detail?.page?.props?.flash;
            if (flash) {
                processFlash(flash);
            }
        });

        const unregisterError = router.on("error", (event) => {
            // If the server provided an explicit error flash
            const flash = event.detail?.page?.props?.flash;
            if (flash?.error) {
                processFlash(flash);
                return;
            }

            // If form validation errors occurred (e.g. 422 Unprocessable Entity)
            const errors = event.detail?.errors;
            if (errors && typeof errors === "object") {
                const errorValues = Object.values(errors);
                if (errorValues.length > 0 && typeof errorValues[0] === "string") {
                    showToast(errorValues[0], "error", 5000);
                }
            }
        });

        // 3. Global Non-Inertia Response Interceptor (500, 403, 404, 429, 503)
        // Prevents raw HTML crash modals from appearing and displays a clean Toast instead.
        const unregisterInvalid = router.on("invalid", (event) => {
            const response = event.detail?.response;
            const status = response?.status;

            if (status === 419 || status === 401) {
                event.preventDefault();
                window.location.href = "/login?expired=1";
                return;
            }

            if (status >= 400) {
                event.preventDefault();
                const serverMessage =
                    typeof response?.data === "object" && response?.data?.message
                        ? response.data.message
                        : null;

                const statusMessages = {
                    403: "Wala kang sapat na pahintulot para sa aksyong ito.",
                    404: "Hindi mahanap ang hinihinging record o pahina (404).",
                    429: "Masyadong maraming request. Maghintay ng ilang segundo bago ulitin.",
                    500: "Server Error (500): Nagkaroon ng problema sa server. Naitala na ito sa system logs.",
                    502: "Bad Gateway (502): Pansamantalang hindi maabot ang server.",
                    503: "Kasalukuyang sumasailalim sa maintenance ang system (503).",
                };

                const messageToDisplay =
                    serverMessage ||
                    statusMessages[status] ||
                    `Hindi matapos ang aksyon (HTTP ${status}). Pakisubukan muli.`;

                showToast(
                    messageToDisplay,
                    status === 429 ? "warning" : "error",
                    6000,
                );
            }
        });

        // 4. Global Network / Connection Exception Interceptor
        const unregisterException = router.on("exception", (event) => {
            event.preventDefault();
            showToast(
                "Network Error: Hindi makakonekta sa server. Pakisuri ang iyong internet connection.",
                "error",
                6000,
            );
        });

        return () => {
            unregisterSuccess();
            unregisterError();
            unregisterInvalid();
            unregisterException();
        };
    }, [processFlash, showToast]);

    return (
        <ToastContext.Provider value={{ toast, showToast, removeToast, toasts }}>
            {children}

            {/* Global Toaster Container - Fixed at Bottom Right above all modals */}
            <div
                aria-live="polite"
                aria-atomic="true"
                className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
            >
                {toasts.map((item) => {
                    const isSuccess = item.type === "success";
                    const isError = item.type === "error";
                    const isWarning = item.type === "warning";

                    const defaultTitle = isSuccess
                        ? "Action Successful"
                        : isError
                        ? "Action Failed"
                        : isWarning
                        ? "Notice"
                        : "System Notification";

                    return (
                        <div
                            key={item.id}
                            role="alert"
                            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-200 ${
                                isSuccess
                                    ? "bg-emerald-950/95 text-white border-emerald-500/50 shadow-emerald-950/40"
                                    : isError
                                    ? "bg-rose-950/95 text-white border-rose-500/50 shadow-rose-950/40"
                                    : isWarning
                                    ? "bg-amber-950/95 text-white border-amber-500/50 shadow-amber-950/40"
                                    : "bg-slate-900/95 text-white border-slate-700 shadow-slate-950/40"
                            }`}
                        >
                            {/* Type Icon */}
                            <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                    isSuccess
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : isError
                                        ? "bg-rose-500/20 text-rose-400"
                                        : isWarning
                                        ? "bg-amber-500/20 text-amber-400"
                                        : "bg-sky-500/20 text-sky-400"
                                }`}
                            >
                                {isSuccess && <CheckCircle2 className="w-4 h-4" />}
                                {isError && <AlertCircle className="w-4 h-4" />}
                                {isWarning && <AlertTriangle className="w-4 h-4" />}
                                {!isSuccess && !isError && !isWarning && (
                                    <Info className="w-4 h-4" />
                                )}
                            </div>

                            {/* Message Details */}
                            <div className="flex-1 min-w-0 pr-1">
                                <p className="text-xs font-bold tracking-tight">
                                    {item.title || defaultTitle}
                                </p>
                                <p
                                    className={`text-xs mt-0.5 leading-relaxed break-words font-medium ${
                                        isSuccess
                                            ? "text-emerald-200/90"
                                            : isError
                                            ? "text-rose-200/90"
                                            : isWarning
                                            ? "text-amber-200/90"
                                            : "text-slate-300"
                                    }`}
                                >
                                    {item.message}
                                </p>
                            </div>

                            {/* Dismiss Close Button */}
                            <button
                                type="button"
                                onClick={() => removeToast(item.id)}
                                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                                aria-label="Close notification"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        return {
            toast,
            showToast: toast.info,
            removeToast: () => {},
            toasts: [],
        };
    }
    return context;
}
