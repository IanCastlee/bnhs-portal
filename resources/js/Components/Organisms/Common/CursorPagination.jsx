import React from "react";
import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CursorPagination({
    prevPageUrl,
    nextPageUrl,
    label = "Cursor-Indexed Page",
    className = "",
}) {
    return (
        <div
            className={`p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between ${className}`}
        >
            <div>
                {prevPageUrl ? (
                    <Link
                        href={prevPageUrl}
                        preserveScroll
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                    </Link>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-400 cursor-not-allowed">
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                    </span>
                )}
            </div>

            <span className="text-[11px] sm:text-xs text-slate-400 font-mono">
                {label}
            </span>

            <div>
                {nextPageUrl ? (
                    <Link
                        href={nextPageUrl}
                        preserveScroll
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs cursor-pointer"
                    >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-400 cursor-not-allowed">
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                    </span>
                )}
            </div>
        </div>
    );
}
