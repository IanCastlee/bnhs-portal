import React from "react";
import CursorPagination from "@/Components/Organisms/Common/CursorPagination";
import EmptyStateCard from "@/Components/Organisms/Common/EmptyStateCard";
import {
    Megaphone,
    Edit3,
    Trash2,
    Pin,
    Image as ImageIcon,
} from "lucide-react";

export default function AnnouncementTable({
    announcements,
    onTogglePin,
    onEdit,
    onDelete,
}) {
    const list = announcements?.data || [];

    if (list.length === 0) {
        return (
            <EmptyStateCard
                icon={Megaphone}
                title="No Announcements Found"
                description="Try changing your search query or create a new announcement."
            />
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {/* Announcements List */}
            <div className="divide-y divide-slate-100">
                {list.map((post) => (
                    <div
                        key={post.id}
                        className="p-5 flex flex-col md:flex-row gap-5 items-start justify-between hover:bg-slate-50/70 transition"
                    >
                        {/* Thumbnail / Photo */}
                        <div className="w-full md:w-44 h-28 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative border border-slate-200">
                            {post.image_url ? (
                                <img
                                    src={post.image_url}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                                    <ImageIcon className="w-6 h-6 text-slate-300" />
                                    <span>No Photo</span>
                                </div>
                            )}
                            {post.is_pinned && (
                                <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                                    <Pin className="w-3 h-3 fill-slate-950" /> PINNED
                                </span>
                            )}
                        </div>

                        {/* Text Details */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                    {post.tag}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {new Date(post.created_at).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                            <h3 className="text-base font-bold text-slate-900 leading-snug">
                                {post.title}
                            </h3>
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                {post.caption}
                            </p>
                            <p className="text-[11px] text-slate-400 pt-1">
                                Author:{" "}
                                <strong className="text-slate-700">
                                    {post.author?.name || "Administrator"}
                                </strong>
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                            <button
                                type="button"
                                onClick={() => onTogglePin(post.id)}
                                className={`p-2 rounded-xl border transition cursor-pointer ${
                                    post.is_pinned
                                        ? "bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100"
                                        : "bg-white border-slate-200 text-slate-400 hover:text-amber-600 hover:bg-slate-50"
                                }`}
                                title={post.is_pinned ? "Unpin Announcement" : "Pin to Top"}
                            >
                                <Pin className={`w-4 h-4 ${post.is_pinned ? "fill-amber-500" : ""}`} />
                            </button>

                            <button
                                type="button"
                                onClick={() => onEdit(post)}
                                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition cursor-pointer"
                                title="Edit Announcement"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                                type="button"
                                onClick={() => onDelete(post.id)}
                                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition cursor-pointer"
                                title="Delete Announcement"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* CURSOR PAGINATION NAVIGATION */}
            <CursorPagination
                prevPageUrl={announcements.prev_page_url}
                nextPageUrl={announcements.next_page_url}
                label="Cursor-Indexed Stream"
            />
        </div>
    );
}
