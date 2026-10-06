import React from "react";

export default function Input({
    type = "text",
    className = "",
    error = false,
    icon: Icon = null,
    ...props
}) {
    return (
        <div className="relative flex items-center w-full">
            {Icon && (
                <div className="absolute left-4.5 pointer-events-none text-slate-400">
                    <Icon className="w-5 h-5 stroke-[1.75]" />
                </div>
            )}
            <input
                type={type}
                className={`w-full rounded-2xl border text-sm transition-all duration-200 py-3.5 bg-slate-50/70 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-3 ${
                    Icon ? "pl-12 pr-4" : "px-4"
                } ${
                    error
                        ? "border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-500/15"
                        : "border-slate-200 focus:border-red-900/40 focus:ring-red-900/10 hover:border-slate-300"
                } ${className}`}
                {...props}
            />
        </div>
    );
}
