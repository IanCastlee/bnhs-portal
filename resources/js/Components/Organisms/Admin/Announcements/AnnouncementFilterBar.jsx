import React from "react";
import Button from "@/Components/Atoms/Button";
import { Search } from "lucide-react";

export default function AnnouncementFilterBar({
    tags = ["All", "General", "Academics", "Events", "Urgent"],
    selectedTag,
    onTagChange,
    search,
    onSearchChange,
    onSearchSubmit,
}) {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Tag Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
                {tags.map((tag) => (
                    <button
                        key={tag}
                        type="button"
                        onClick={() => onTagChange(tag)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            selectedTag === tag
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Search Input */}
            <form onSubmit={onSearchSubmit} className="w-full md:w-72 flex gap-2">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                        type="text"
                        placeholder="Search announcements..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                    />
                </div>
                <Button type="submit" variant="secondary" size="sm">
                    Search
                </Button>
            </form>
        </div>
    );
}
