import React from "react";
import {
    Folder,
    FolderOpen,
    Megaphone,
    BookOpen,
    Trophy,
    AlertCircle,
    GraduationCap,
    Users,
    Layers,
    FileSpreadsheet,
} from "lucide-react";

export default function AnnouncementFolderNav({
    selectedTag = "All",
    onTagChange,
    totalCount = 0,
}) {
    const folders = [
        {
            id: "All",
            name: "All Announcements",
            description: "Complete school stream",
            icon: Layers,
        },
        {
            id: "General",
            name: "General Notices",
            description: "Campus-wide updates",
            icon: Megaphone,
        },
        {
            id: "Academics",
            name: "Academics & Exams",
            description: "Schedules, grading, tests",
            icon: BookOpen,
        },
        {
            id: "Events",
            name: "Events & Sports",
            description: "Intramurals, ceremonies",
            icon: Trophy,
        },
        {
            id: "Urgent",
            name: "Urgent & Holidays",
            description: "Weather, suspensions, alerts",
            icon: AlertCircle,
        },
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 lg:p-5 space-y-4 lg:sticky lg:top-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Categories & Folders
                    </h3>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    {folders.length} Folders
                </span>
            </div>

            {/* Vertical Folder Navigation List */}
            <nav className="space-y-1.5" aria-label="Announcement Category Folders">
                {folders.map((folder) => {
                    const isActive = selectedTag === folder.id;
                    const Icon = folder.icon;

                    return (
                        <button
                            key={folder.id}
                            type="button"
                            onClick={() => onTagChange(folder.id)}
                            className={`w-full text-left p-2.5 rounded-xl transition-all duration-150 flex items-center justify-between group cursor-pointer ${
                                isActive
                                    ? "bg-emerald-600 text-white font-bold shadow-xs ring-2 ring-emerald-500/20"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200/60"
                            }`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                        isActive
                                            ? "bg-white/20 text-white"
                                            : "bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-700"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-xs truncate ${isActive ? "text-white font-bold" : "text-slate-800 font-semibold"}`}>
                                        {folder.name}
                                    </p>
                                    <p className={`text-[10px] truncate ${isActive ? "text-emerald-100" : "text-slate-400"}`}>
                                        {folder.description}
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </nav>

            {/* Information Notice Footer */}
            <div className="pt-3 border-t border-slate-100">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed space-y-1">
                    <p className="font-bold text-slate-700 flex items-center gap-1">
                        📌 Quick Tip
                    </p>
                    <p className="text-[10px]">
                        Maaaring mag-filter ng anunsyo batay sa folder category bago mag-search o mag-edit.
                    </p>
                </div>
            </div>
        </div>
    );
}
