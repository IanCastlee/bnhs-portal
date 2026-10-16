import React from "react";
import Button from "@/Components/Atoms/Button";
import { Search, X } from "lucide-react";

export default function AnnouncementSearchBar({
    search,
    onSearchChange,
    onSearchSubmit,
    selectedTag,
    totalCount = 0,
}) {
    return (
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Active Tag Label */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Viewing:</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                    {selectedTag === "All" ? "All Categories" : selectedTag}
                </span>
            </div>

            {/* Search Input */}
            <form onSubmit={onSearchSubmit} className="flex items-center gap-2 w-full sm:w-80">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                        type="text"
                        placeholder="Search by title or caption..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => {
                                onSearchChange("");
                                onSearchSubmit({ preventDefault: () => {} });
                            }}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
                <Button type="submit" variant="secondary" size="sm" className="shrink-0">
                    Search
                </Button>
            </form>
        </div>
    );
}
