import React, { forwardRef, useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

const Input = forwardRef(function Input(
    {
        type = "text",
        label,
        required = false,
        optional = false,
        error = false,
        errorMessage = null,
        helperText = null,
        icon: Icon = null,
        rightElement = null,
        className = "",
        containerClassName = "",
        id,
        disabled = false,
        ...props
    },
    ref,
) {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === "password";
    const actualType = isPasswordType
        ? showPassword
            ? "text"
            : "password"
        : type;
    const hasError = Boolean(error || errorMessage);

    return (
        <div className={`w-full ${containerClassName}`}>
            {label && (
                <div className="flex items-center justify-between mb-1.5">
                    <label
                        htmlFor={id}
                        className="block text-xs font-bold text-slate-700"
                    >
                        {label}{" "}
                        {required && <span className="text-rose-500">*</span>}
                        {optional && (
                            <span className="text-[11px] text-slate-400 font-normal ml-1">
                                (Optional)
                            </span>
                        )}
                    </label>
                </div>
            )}

            <div className="relative flex items-center w-full">
                {Icon && (
                    <div className="absolute left-3.5 pointer-events-none text-slate-400 flex items-center justify-center">
                        <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </div>
                )}

                <input
                    ref={ref}
                    id={id}
                    type={actualType}
                    disabled={disabled}
                    className={`w-full rounded-xl border text-xs sm:text-sm font-medium transition-all duration-150 h-11 sm:h-12 bg-slate-50/60 text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 ${
                        Icon ? "pl-11" : "pl-3.5"
                    } ${isPasswordType || rightElement ? "pr-11" : "pr-3.5"} ${
                        hasError
                            ? "border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20"
                            : "border-slate-200 focus:border-emerald-600 focus:ring-emerald-500/20 hover:border-slate-300"
                    } ${disabled ? "opacity-60 bg-slate-100 cursor-not-allowed" : ""} ${className}`}
                    {...props}
                />

                {isPasswordType ? (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-lg transition"
                        title={showPassword ? "Hide password" : "Show password"}
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                    </button>
                ) : rightElement ? (
                    <div className="absolute right-3 flex items-center">
                        {rightElement}
                    </div>
                ) : null}
            </div>

            {hasError && errorMessage && (
                <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errorMessage}</span>
                </p>
            )}

            {helperText && !hasError && (
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {helperText}
                </p>
            )}
        </div>
    );
});

export default Input;
