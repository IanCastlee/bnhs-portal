import React from "react";

export default function Button({
    type = "button",
    variant = "emerald",
    size = "md",
    className = "",
    disabled = false,
    loading = false,
    children,
    ...props
}) {
    const baseStyles =
        "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]";

    const variants = {
        emerald:
            "bg-emerald-700 text-white hover:bg-emerald-800 focus:ring-emerald-600 shadow-sm",
        bnhs:
            "bg-[#0f4c3a] text-white hover:bg-[#093528] focus:ring-emerald-600 shadow-sm",
        success:
            "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm",
        primary:
            "bg-emerald-700 text-white hover:bg-emerald-800 focus:ring-emerald-600 shadow-sm",
        secondary:
            "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400",
        danger:
            "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm",
        outline:
            "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:ring-emerald-500",
        ghost:
            "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400",
    };

    const sizes = {
        xs: "px-2.5 py-1 text-[11px] gap-1 rounded-lg",
        sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
        md: "px-4 py-2 text-xs sm:text-sm gap-2 rounded-xl",
        lg: "px-5 py-2.5 text-sm sm:text-base gap-2.5 rounded-xl",
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`${baseStyles} ${variants[variant] || variants.emerald} ${sizes[size] || sizes.md} ${className}`}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-current shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                    />
                </svg>
            )}
            {children}
        </button>
    );
}
