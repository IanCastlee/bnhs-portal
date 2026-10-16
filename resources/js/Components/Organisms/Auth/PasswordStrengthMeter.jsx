import React from "react";
import { Check } from "lucide-react";

export default function PasswordStrengthMeter({ strength }) {
    if (!strength || !strength.label || strength.score === 0) return null;

    const { score, label, color, textColor, checks } = strength;

    return (
        <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">
                    Password Strength:
                </span>
                <span className={`font-bold ${textColor}`}>{label}</span>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${color}`}
                    style={{ width: `${score}%` }}
                />
            </div>

            {/* Live Criteria Checklist */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                <div
                    className={`flex items-center gap-1 font-medium ${
                        checks.minLength ? "text-emerald-600" : "text-slate-400"
                    }`}
                >
                    {checks.minLength ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-0.5" />
                    )}
                    <span>8+ Characters</span>
                </div>

                <div
                    className={`flex items-center gap-1 font-medium ${
                        checks.hasUpper && checks.hasLower
                            ? "text-emerald-600"
                            : "text-slate-400"
                    }`}
                >
                    {checks.hasUpper && checks.hasLower ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-0.5" />
                    )}
                    <span>Upper &amp; Lowercase</span>
                </div>

                <div
                    className={`flex items-center gap-1 font-medium ${
                        checks.hasNumber ? "text-emerald-600" : "text-slate-400"
                    }`}
                >
                    {checks.hasNumber ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-0.5" />
                    )}
                    <span>At least 1 Number</span>
                </div>

                <div
                    className={`flex items-center gap-1 font-medium ${
                        checks.hasSpecial
                            ? "text-emerald-600"
                            : "text-slate-400"
                    }`}
                >
                    {checks.hasSpecial ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-0.5" />
                    )}
                    <span>Special Symbol (!@#$)</span>
                </div>
            </div>
        </div>
    );
}
