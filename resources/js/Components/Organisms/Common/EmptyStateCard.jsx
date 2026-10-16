import React from "react";
import Button from "@/Components/Atoms/Button";
import { FolderX } from "lucide-react";

export default function EmptyStateCard({
    icon: Icon = FolderX,
    title = "No Records Found",
    description = "There are no items to display right now.",
    actionLabel,
    onAction,
    className = "",
}) {
    return (
        <div
            className={`bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-12 sm:p-16 text-center text-slate-400 ${className}`}
        >
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Icon className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">{title}</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                {description}
            </p>
            {actionLabel && onAction && (
                <div className="mt-4">
                    <Button variant="primary" size="sm" onClick={onAction}>
                        {actionLabel}
                    </Button>
                </div>
            )}
        </div>
    );
}
