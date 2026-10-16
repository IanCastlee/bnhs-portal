import React from "react";
import Card from "@/Components/Atoms/Card";
import Badge from "@/Components/Atoms/Badge";
import { formatDate, formatRelativeTime } from "@/Utils/formatDate";
import { Pin, Calendar, Clock, User } from "lucide-react";

export default function AnnouncementCard({ post }) {
    if (!post) return null;

    return (
        <article className="w-full bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden">
            {/* 🖼️ Full Image Display (Zero Cropping - Natural Aspect Ratio) */}
            {post.image_url && (
                <div className="w-full bg-slate-950/5 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                    <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-auto max-h-[650px] object-contain block"
                        loading="lazy"
                    />
                    {/* Tags overlay */}
                    <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex items-center gap-1.5 z-10">
                        <span className="text-[9px] sm:text-[10px] font-bold text-white bg-slate-950/75 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/15 shadow-sm">
                            {post.tag}
                        </span>
                        {post.is_pinned && (
                            <span className="text-[9px] sm:text-[10px] font-black text-slate-950 bg-amber-400 px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 border border-amber-300">
                                <Pin className="w-2.5 h-2.5 fill-slate-950" />{" "}
                                PINNED
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* 📝 Content Area (Clean, Aesthetic, Compact) */}
            <div className="p-3 sm:p-5">
                {!post.image_url && (
                    <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                            {post.tag}
                        </span>
                        {post.is_pinned && (
                            <span className="text-[9px] sm:text-[10px] font-black text-slate-950 bg-amber-400 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Pin className="w-2.5 h-2.5 fill-slate-950" />{" "}
                                PINNED
                            </span>
                        )}
                    </div>
                )}

                <h4 className="text-[13px] sm:text-base font-bold text-slate-900 leading-snug tracking-tight">
                    {post.title}
                </h4>

                {post.caption && (
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-1 sm:mt-1.5 whitespace-pre-line leading-relaxed">
                        {post.caption}
                    </p>
                )}

                {/* ✨ Aesthetic Compact Footer */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Author Initial + Name */}
                    <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[9px] flex items-center justify-center shrink-0 ring-1 ring-emerald-600/20 shadow-2xs">
                            {post.author?.name?.charAt(0) || "A"}
                        </div>
                        <div className="text-[10px] sm:text-xs truncate flex items-center gap-1 min-w-0">
                            <span className="text-slate-400 font-normal shrink-0">
                                By
                            </span>
                            <span className="font-semibold text-slate-700 truncate">
                                {post.author?.name || "System Admin"}
                            </span>
                        </div>
                    </div>

                    {/* Clean Pill Timestamp */}
                    <div
                        className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-400 font-medium whitespace-nowrap bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-full shrink-0"
                        title={formatDate(post.created_at, {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    >
                        <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span>{formatRelativeTime(post.created_at)}</span>
                    </div>
                </div>
            </div>
        </article>
    );
}
