import React, { useState, useRef, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import {
    Bell,
    CheckCircle2,
    AlertTriangle,
    Info,
    CheckCheck,
    X,
    ArrowRight,
    Loader2,
    RefreshCw,
} from "lucide-react";

export default function NotificationBell({ isDark = false }) {
    const { auth } = usePage().props;
    const initialNotifications = auth?.notifications || [];
    const unreadCount = auth?.unread_notifications_count || 0;

    const [isOpen, setIsOpen] = useState(false);
    const [notificationList, setNotificationList] = useState(initialNotifications);
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const dropdownRef = useRef(null);

    // Sync when auth notifications update from server
    useEffect(() => {
        if (auth?.notifications) {
            setNotificationList(auth.notifications);
        }
    }, [auth?.notifications]);

    // Prevent body scroll on mobile when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add("overflow-hidden");
        } else {
            document.body.classList.remove("overflow-hidden");
        }
        return () => {
            document.body.classList.remove("overflow-hidden");
        };
    }, [isOpen]);

    // Close on click outside (for desktop dropdown)
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                window.innerWidth >= 640 // Only for desktop
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ⚡ Cursor Pagination: Load more historical notifications
    const loadMoreNotifications = async () => {
        if (isLoadingMore) return;
        setIsLoadingMore(true);

        try {
            const url = nextCursor
                ? `/notifications/feed?cursor=${encodeURIComponent(nextCursor)}`
                : `/notifications/feed`;

            const res = await fetch(url, {
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            if (res.ok) {
                const data = await res.json();
                const fetchedItems = data.data || [];
                const newCursor = data.next_cursor || null;

                setNotificationList((prev) => {
                    const existingIds = new Set(prev.map((item) => item.id));
                    const newItems = fetchedItems.filter((item) => !existingIds.has(item.id));
                    return [...prev, ...newItems];
                });

                setNextCursor(newCursor);
                setHasMore(Boolean(newCursor));
            }
        } catch (err) {
            console.error("Failed to load cursor paginated notifications:", err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const markAllAsRead = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        router.post("/notifications/mark-as-read", {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsOpen(false);
            },
        });
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return "Kani-kanina lamang";
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return "Kani-kanina lamang";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ang nakalipas`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ang nakalipas`;
        return `${Math.floor(diffInSeconds / 86400)}d ang nakalipas`;
    };

    const renderNotificationItems = (isMobile = false) => {
        if (notificationList.length === 0) {
            return (
                <div className={`text-center text-slate-400 ${isMobile ? "py-16 px-4" : "p-6 text-xs"}`}>
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <Bell className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <p className="font-bold text-slate-700 text-sm">Walang bagong notipikasyon</p>
                    <p className="text-xs text-slate-400 mt-1">
                        Awtomatikong lalabas dito ang mga updates mula sa Registrar at paaralan.
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-2.5">
                {notificationList.map((n) => {
                    const data = n.data || {};
                    const isApproval = data.type === "ENROLLMENT_APPROVED";
                    const isRejection = data.type === "ENROLLMENT_REJECTED";

                    return (
                        <Link
                            key={n.id}
                            href={data.action_url || "/student/admission"}
                            onClick={() => setIsOpen(false)}
                            className={`block rounded-2xl p-4 transition border ${
                                !n.read_at
                                    ? isApproval
                                        ? "bg-emerald-50/80 border-emerald-200/90 shadow-xs"
                                        : isRejection
                                        ? "bg-rose-50/80 border-rose-200/90 shadow-xs"
                                        : "bg-teal-50/80 border-teal-200/90 shadow-xs"
                                    : "bg-white border-slate-200/80 hover:bg-slate-50"
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                                        isApproval
                                            ? "bg-emerald-600 text-white"
                                            : isRejection
                                            ? "bg-rose-600 text-white"
                                            : "bg-teal-600 text-white"
                                    }`}
                                >
                                    {isApproval ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : isRejection ? (
                                        <AlertTriangle className="w-5 h-5" />
                                    ) : (
                                        <Info className="w-5 h-5" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-1">
                                        <h5 className={`text-xs sm:text-sm font-black leading-tight ${
                                            isApproval
                                                ? "text-emerald-950"
                                                : isRejection
                                                ? "text-rose-950"
                                                : "text-slate-900"
                                        }`}>
                                            {data.title || "DepEd Admission Update"}
                                        </h5>
                                        <span className="text-[10px] text-slate-400 shrink-0 font-medium ml-2">
                                            {formatTimeAgo(n.created_at || data.created_at)}
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                        {data.message || data.remarks || "May update sa iyong admission application."}
                                    </p>

                                    {data.remarks && isRejection && (
                                        <div className="mt-2 p-2.5 rounded-xl bg-rose-100/70 border border-rose-200 text-xs text-rose-950 font-bold">
                                            <span className="text-[10px] uppercase tracking-wider text-rose-700 block font-black mb-0.5">
                                                Remarks mula sa Registrar:
                                            </span>
                                            &ldquo;{data.remarks}&rdquo;
                                        </div>
                                    )}

                                    <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                                        {data.tracking_number && (
                                            <span className="text-[10px] font-mono font-bold text-slate-600 bg-white/90 px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                                                Ticket: {data.tracking_number}
                                            </span>
                                        )}

                                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 ml-auto">
                                            <span>Tingnan detalye</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}

                {/* ⚡ Cursor Pagination Load More Button */}
                {hasMore && (
                    <div className="pt-2 text-center">
                        <button
                            type="button"
                            onClick={loadMoreNotifications}
                            disabled={isLoadingMore}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition cursor-pointer disabled:opacity-60"
                        >
                            {isLoadingMore ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                                    <span>Naglo-load via Cursor...</span>
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Mag-load pa ng mga lumang notipikasyon</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
                    isDark
                        ? "text-emerald-200 hover:text-white hover:bg-emerald-900/60 bg-emerald-950/40 border border-emerald-700/40"
                        : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 bg-slate-100/80 border border-slate-200/80"
                }`}
                title="Notifications"
                aria-label="Notifications"
            >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />

                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-sm ring-2 ring-white animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* 📱 MOBILE FULLSCREEN NOTIFICATION MODAL */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-[#f4f7fa] flex flex-col sm:hidden animate-fadeIn">
                    {/* Top Green App Bar */}
                    <div className="bg-gradient-to-r from-[#07241c] via-[#0f4c3a] to-[#0d5c43] text-white px-4 py-3.5 shadow-md flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                                <Bell className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black tracking-wide uppercase">
                                    Mga Notipikasyon
                                </h3>
                                <p className="text-[10px] text-emerald-200 font-medium">
                                    Bulusan NHS • DepEd Portal
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={markAllAsRead}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 text-xs font-bold border border-emerald-600/40 flex items-center gap-1 transition"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    <span>Basahin</span>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                                title="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Notification Count Subheader */}
                    <div className="px-4 py-2 bg-emerald-950/10 border-b border-slate-200/80 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">
                            Lahat ng Mensahe ({notificationList.length})
                        </span>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-2xs">
                                {unreadCount} Hindi pa nababasa
                            </span>
                        )}
                    </div>

                    {/* Scrollable Notification List */}
                    <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
                        {renderNotificationItems(true)}
                    </div>

                    {/* Mobile Bottom Bar */}
                    <div className="p-3.5 bg-white border-t border-slate-200 shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition text-center cursor-pointer"
                        >
                            Isara ang Notipikasyon
                        </button>
                    </div>
                </div>
            )}

            {/* 💻 DESKTOP FLOATING DROPDOWN PANEL (>= sm) */}
            {isOpen && (
                <div className="hidden sm:block absolute right-0 mt-2 w-96 rounded-2xl bg-white text-slate-800 shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* Header */}
                    <div className="px-4 pb-2.5 flex items-center justify-between border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                Mga Notipikasyon
                            </h4>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold">
                                    {unreadCount} bago
                                </span>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllAsRead}
                                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition cursor-pointer"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>Basahin lahat</span>
                            </button>
                        )}
                    </div>

                    {/* Desktop Notification Items List */}
                    <div className="max-h-80 overflow-y-auto p-3 space-y-2.5">
                        {renderNotificationItems(false)}
                    </div>

                    {/* Footer */}
                    <div className="px-4 pt-2 border-t border-slate-100 text-center">
                        <span className="text-[10px] text-slate-400 font-semibold">
                            Bulusan National High School • DepEd SSU OPAS
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
