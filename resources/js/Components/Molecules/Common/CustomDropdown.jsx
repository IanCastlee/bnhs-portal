import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check } from "lucide-react";

/**
 * 🌟 CustomDropdown Component with Smart Auto-Flip Collision Detection
 * When space below the dropdown is insufficient (< 280px), it automatically opens upwards!
 */
export default function CustomDropdown({
    label,
    required = false,
    value,
    onChange,
    groups = [], // [{ label: "Group Name", options: [{ value, label, subtext, badge, badgeColor }] }]
    options = [], // [{ value, label, subtext, badge, badgeColor }] (if not grouped)
    placeholder = "Select an option...",
    icon: Icon,
    error,
    helperText,
    className = "",
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [placement, setPlacement] = useState("bottom"); // "bottom" or "top"
    const dropdownRef = useRef(null);

    // 📐 Smart Collision & Viewport Calculation
    const calculatePlacement = useCallback(() => {
        if (!dropdownRef.current) return;
        const rect = dropdownRef.current.getBoundingClientRect();
        const viewportHeight =
            window.innerHeight || document.documentElement.clientHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownEstimatedHeight = 270; // px

        // If not enough room below, but more room above, pop upwards (top)
        if (spaceBelow < dropdownEstimatedHeight && spaceAbove > spaceBelow) {
            setPlacement("top");
        } else {
            setPlacement("bottom");
        }
    }, []);

    // Close on outside click and recalc on resize/scroll
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };

        const handleScrollOrResize = () => {
            if (isOpen) {
                calculatePlacement();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("resize", handleScrollOrResize);
        window.addEventListener("scroll", handleScrollOrResize, true);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("resize", handleScrollOrResize);
            window.removeEventListener("scroll", handleScrollOrResize, true);
        };
    }, [isOpen, calculatePlacement]);

    const handleToggle = () => {
        if (!isOpen) {
            calculatePlacement();
        }
        setIsOpen((prev) => !prev);
    };

    // Flatten all options to find selected option metadata
    const allOptions =
        groups.length > 0 ? groups.flatMap((g) => g.options || []) : options;

    const selectedOption = allOptions.find(
        (opt) => String(opt.value) === String(value),
    );

    const handleSelect = (optValue) => {
        onChange(optValue);
        setIsOpen(false);
    };

    return (
        <div className={`relative space-y-1.5 ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-bold text-slate-800">
                    {required && (
                        <span className="text-rose-500 font-bold mr-1">*</span>
                    )}
                    {label}
                </label>
            )}

            {/* Dropdown Trigger Button */}
            <button
                type="button"
                onClick={handleToggle}
                className={`w-full flex items-center justify-between text-left px-3.5 py-3 rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs focus:outline-none focus:ring-3 ${
                    isOpen
                        ? "border-emerald-500 ring-emerald-500/20 bg-white shadow-md shadow-emerald-900/5"
                        : error
                          ? "border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-rose-500/15"
                          : "border-slate-200/90 bg-slate-50 hover:bg-white hover:border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/15"
                }`}
            >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                    {Icon && (
                        <div
                            className={`p-1.5 rounded-xl shrink-0 ${isOpen ? "bg-emerald-100 text-emerald-700" : "bg-slate-200/60 text-slate-500"}`}
                        >
                            <Icon className="w-4 h-4" />
                        </div>
                    )}

                    <div className="min-w-0">
                        {selectedOption ? (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                    {selectedOption.label}
                                </span>
                                {selectedOption.badge && (
                                    <span
                                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider shrink-0 ${
                                            selectedOption.badgeColor ||
                                            "bg-emerald-100 text-emerald-800 border border-emerald-200/80"
                                        }`}
                                    >
                                        {selectedOption.badge}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span className="text-xs sm:text-sm font-medium text-slate-400">
                                {placeholder}
                            </span>
                        )}

                        {selectedOption?.subtext && (
                            <p className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
                                {selectedOption.subtext}
                            </p>
                        )}
                    </div>
                </div>

                <div
                    className={`p-1 rounded-lg text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-emerald-600" : ""}`}
                >
                    <ChevronDown className="w-4 h-4" />
                </div>
            </button>

            {/* 🚀 Smart Dropdown Options Menu (Auto Top / Bottom Placement) */}
            {isOpen && (
                <div
                    className={`absolute left-0 right-0 z-50 max-h-72 overflow-y-auto rounded-2xl bg-white p-1.5 shadow-2xl border border-slate-200/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 custom-scrollbar ${
                        placement === "top"
                            ? "bottom-full mb-2 slide-in-from-bottom-2 origin-bottom shadow-slate-900/15"
                            : "top-full mt-2 slide-in-from-top-2 origin-top shadow-slate-900/15"
                    }`}
                >
                    {groups.length > 0 ? (
                        groups.map((grp, gIdx) => (
                            <div
                                key={gIdx}
                                className={
                                    gIdx > 0
                                        ? "mt-2 pt-2 border-t border-slate-100"
                                        : ""
                                }
                            >
                                {grp.label && (
                                    <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-50 rounded-lg mb-1 flex items-center justify-between">
                                        <span>{grp.label}</span>
                                        {grp.icon && (
                                            <grp.icon className="w-3 h-3 text-slate-400" />
                                        )}
                                    </div>
                                )}
                                <div className="space-y-1">
                                    {grp.options?.map((opt) => {
                                        const isSelected =
                                            String(opt.value) === String(value);
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() =>
                                                    handleSelect(opt.value)
                                                }
                                                className={`w-full flex items-center justify-between text-left p-2.5 rounded-xl transition cursor-pointer ${
                                                    isSelected
                                                        ? "bg-emerald-50/90 text-emerald-950 border border-emerald-200 font-bold shadow-xs"
                                                        : "hover:bg-slate-50 text-slate-800 hover:text-slate-900 font-medium"
                                                }`}
                                            >
                                                <div className="min-w-0 pr-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs sm:text-sm leading-tight">
                                                            {opt.label}
                                                        </span>
                                                        {opt.badge && (
                                                            <span
                                                                className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider shrink-0 ${
                                                                    opt.badgeColor ||
                                                                    (isSelected
                                                                        ? "bg-emerald-600 text-white"
                                                                        : "bg-slate-100 text-slate-600 border border-slate-200")
                                                                }`}
                                                            >
                                                                {opt.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {opt.subtext && (
                                                        <p
                                                            className={`text-[11px] mt-0.5 leading-snug ${isSelected ? "text-emerald-700 font-medium" : "text-slate-500"}`}
                                                        >
                                                            {opt.subtext}
                                                        </p>
                                                    )}
                                                </div>

                                                {isSelected && (
                                                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="space-y-1">
                            {options.map((opt) => {
                                const isSelected =
                                    String(opt.value) === String(value);
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleSelect(opt.value)}
                                        className={`w-full flex items-center justify-between text-left p-2.5 rounded-xl transition cursor-pointer ${
                                            isSelected
                                                ? "bg-emerald-50/90 text-emerald-950 border border-emerald-200 font-bold shadow-xs"
                                                : "hover:bg-slate-50 text-slate-800 hover:text-slate-900 font-medium"
                                        }`}
                                    >
                                        <div className="min-w-0 pr-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs sm:text-sm leading-tight">
                                                    {opt.label}
                                                </span>
                                                {opt.badge && (
                                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 tracking-wider">
                                                        {opt.badge}
                                                    </span>
                                                )}
                                            </div>
                                            {opt.subtext && (
                                                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                                    {opt.subtext}
                                                </p>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {helperText && !error && (
                <p className="text-[11px] text-slate-500">{helperText}</p>
            )}

            {error && (
                <p className="text-[11px] text-rose-600 font-medium">{error}</p>
            )}
        </div>
    );
}
