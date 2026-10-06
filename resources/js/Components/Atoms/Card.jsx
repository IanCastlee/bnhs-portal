import React from "react";

export default function Card({ children, className = "", ...props }) {
    const hasCustomPadding = /\bp(?:-[xytrblse])?-\d+/.test(className);
    return (
        <div
            className={`bg-white rounded-xl border border-slate-200 shadow-xs ${hasCustomPadding ? "" : "p-6"} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
