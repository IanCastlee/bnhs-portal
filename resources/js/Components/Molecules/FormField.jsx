import React from "react";
import Input from "../Atoms/Input";

export default function FormField({
    label,
    error,
    id,
    required = false,
    children,
    ...props
}) {
    return (
        <div className="space-y-1.5 ">
            {label && (
                <label
                    htmlFor={id}
                    className="block text-xs font-semibold text-slate-700"
                >
                    {label}{" "}
                    {required && <span className="text-rose-500">*</span>}
                </label>
            )}
            {children ? children : <Input id={id} error={!!error} {...props} />}
            {error && (
                <p className="text-xs text-rose-600 font-medium">{error}</p>
            )}
        </div>
    );
}
