import React from "react";
import Button from "@/Components/Atoms/Button";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed with this action?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger", // "danger" | "primary" | "warning"
    loading = false,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                variant === "danger"
                                    ? "bg-rose-100 text-rose-600"
                                    : variant === "warning"
                                    ? "bg-amber-100 text-amber-600"
                                    : "bg-emerald-100 text-emerald-600"
                            }`}
                        >
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">{title}</h3>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Message Body */}
                <div className="py-4">
                    <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        variant={variant === "danger" ? "danger" : "primary"}
                        onClick={onConfirm}
                        loading={loading}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
