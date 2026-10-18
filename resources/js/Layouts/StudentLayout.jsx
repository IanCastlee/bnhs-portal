import React, { useState, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { useAuth } from "@/Hooks/useAuth";
import { useSchoolSettings } from "@/Hooks/useSchoolSettings";
import OfflineBanner from "@/Components/Molecules/OfflineBanner";
import NotificationBell from "@/Components/Molecules/NotificationBell";
import {
    Newspaper,
    CalendarDays,
    FileSpreadsheet,
    GraduationCap,
    UserCircle,
    Bell,
    LogOut,
    Menu,
    X,
    Shield,
    BookOpen,
    ChevronRight,
    ChevronDown,
    Lock,
} from "lucide-react";

export default function StudentLayout({ children, title = "Student Portal" }) {
    const { user } = useAuth();
    const { url, props } = usePage();
    const school = useSchoolSettings();
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer
    const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse/expand
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    // Safe Dynamic Active School Year Label
    const getActiveYearLabel = () => {
        const raw =
            props?.active_academic_year ||
            props?.activeYear ||
            props?.academic_year ||
            props?.activeSchoolYear;
        if (!raw) return "S.Y. Active";
        if (typeof raw === "string") return `S.Y. ${raw} Active`;
        if (typeof raw === "object") {
            const name = raw.name || raw.year || raw.title;
            return name ? `S.Y. ${name} Active` : "S.Y. Active";
        }
        return "S.Y. Active";
    };

    // 💾 Load and Persist Sidebar Collapsed State
    useEffect(() => {
        const saved = localStorage.getItem("bnhs_sidebar_collapsed");
        if (saved !== null) {
            setIsCollapsed(saved === "true");
        }
    }, []);

    const toggleDesktopSidebar = () => {
        const next = !isCollapsed;
        setIsCollapsed(next);
        localStorage.setItem("bnhs_sidebar_collapsed", String(next));
    };

    const isPending = user?.enrollment_status !== "APPROVED";

    const navCategories = isPending
        ? [
              {
                  category: "Pre-Admission Hub",
                  items: [
                      {
                          name: "BEEF Admission Tracker",
                          href: "/student/admission",
                          icon: GraduationCap,
                          isLocked: false,
                      },
                      {
                          name: "My Profile & LRN",
                          href: "/student/profile",
                          icon: UserCircle,
                          isLocked: false,
                      },
                  ],
              },
              {
                  category: "Academic Records (Locked)",
                  items: [
                      {
                          name: "Classes & Schedule",
                          href: "/student/classes",
                          icon: CalendarDays,
                          isLocked: true,
                          lockedReason: "Unlocked upon Registrar approval",
                      },
                      {
                          name: "Quarterly Grades",
                          href: "/student/grades",
                          icon: FileSpreadsheet,
                          isLocked: true,
                          lockedReason: "Unlocked upon Registrar approval",
                      },
                  ],
              },
          ]
        : [
              {
                  category: "Navigation",
                  items: [
                      {
                          name: "School Feed",
                          href: "/student/dashboard",
                          icon: Newspaper,
                          isLocked: false,
                      },
                  ],
              },
              {
                  category: "Academic Records",
                  items: [
                      {
                          name: "Classes & Schedule",
                          href: "/student/classes",
                          icon: CalendarDays,
                          isLocked: false,
                      },
                      {
                          name: "Quarterly Grades",
                          href: "/student/grades",
                          icon: FileSpreadsheet,
                          isLocked: false,
                      },
                  ],
              },
              {
                  category: "Admission & Profile",
                  items: [
                      {
                          name: "BEEF Admission",
                          href: "/student/admission",
                          icon: GraduationCap,
                          isLocked: false,
                      },
                      {
                          name: "My Profile & LRN",
                          href: "/student/profile",
                          icon: UserCircle,
                          isLocked: false,
                      },
                  ],
              },
          ];

    // Dynamic Mobile Bottom Tabs (Applicant vs Approved Student)
    // 🌟 Center Floating Profile Button (Instagram/TikTok style floating avatar)
    const mobileTabs = isPending
        ? [
              {
                  name: "BEEF Admission",
                  href: "/student/admission",
                  icon: GraduationCap,
              },
              {
                  name: "Profile",
                  href: "/student/profile",
                  isCenter: true,
              },
              {
                  name: "Dashboard",
                  href: "/student/dashboard",
                  icon: Newspaper,
              },
          ]
        : [
              {
                  name: "Feed",
                  href: "/student/dashboard",
                  icon: Newspaper,
              },
              {
                  name: "Classes",
                  href: "/student/classes",
                  icon: CalendarDays,
              },
              {
                  name: "Profile",
                  href: "/student/profile",
                  isCenter: true,
              },
              {
                  name: "Grades",
                  href: "/student/grades",
                  icon: FileSpreadsheet,
              },
              {
                  name: "BEEF",
                  href: "/student/admission",
                  icon: GraduationCap,
              },
          ];

    const handleLogout = () => {
        router.post("/logout");
    };

    return (
        <div className="h-screen w-screen overflow-hidden bg-[#f4f7fa] flex text-slate-800 antialiased print:h-auto print:w-auto print:overflow-visible print:bg-white">
            {/* ⚡ Offline Connection Banner */}
            <OfflineBanner />

            {/* 💻 FLAT ABLE THEMED FIXED NON-SCROLLING SIDEBAR (Desktop) */}
            <aside
                className={`hidden lg:flex inset-y-0 left-0 z-50 h-screen bg-[#1b2a47] text-white flex-col justify-between transition-all duration-300 ease-in-out shadow-2xl shrink-0 print:hidden ${
                    isCollapsed ? "lg:w-20" : "lg:w-64"
                }`}
            >
                {/* Scrollable Nav Area */}
                <div className="overflow-y-auto flex-1 custom-scrollbar overflow-x-hidden">
                    {/* 1. Header with Logo & Brand */}
                    <div className="h-16 px-4 flex items-center justify-between border-b border-[#243556] bg-[#16223b] sticky top-0 z-10">
                        <div
                            className={`flex items-center gap-3 min-w-0 ${isCollapsed ? "lg:justify-center lg:w-full" : ""}`}
                        >
                            {school.logo_url ? (
                                <img
                                    src={school.logo_url}
                                    alt={school.short_name}
                                    className="w-9 h-9 object-contain shrink-0 drop-shadow-sm"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-black text-white shadow-md text-base ring-2 ring-emerald-400/30 shrink-0">
                                    {school.initial}
                                </div>
                            )}
                            {!isCollapsed && (
                                <div className="transition-opacity duration-200 min-w-0">
                                    <h1 className="font-extrabold text-sm tracking-wider text-white uppercase truncate">
                                        {school.portal_title}
                                    </h1>
                                    <p className="text-[10px] text-emerald-400 font-semibold tracking-wide truncate">
                                        {isPending
                                            ? "Applicant Access"
                                            : "Student Access"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. User Profile Box */}
                    <div
                        className={`border-b border-[#243556] bg-[#1e2e4d] ${isCollapsed ? "p-3 flex justify-center" : "p-4"}`}
                    >
                        <div
                            onClick={() =>
                                !isCollapsed &&
                                setProfileDropdownOpen(!profileDropdownOpen)
                            }
                            className={`flex items-center gap-3 group ${isCollapsed ? "justify-center" : "cursor-pointer"}`}
                            title={
                                isCollapsed
                                    ? `${user?.name} (${isPending ? "Applicant" : "Enrolled"})`
                                    : undefined
                            }
                        >
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white shadow-md ring-2 ring-white/10 text-sm overflow-hidden">
                                    {user?.avatar_path ? (
                                        <img
                                            src={user.avatar_path}
                                            alt={user?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>
                                            {user?.name?.charAt(0) || "S"}
                                        </span>
                                    )}
                                </div>
                                <span
                                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-[#1e2e4d] rounded-full ${isPending ? "bg-amber-400" : "bg-emerald-400"}`}
                                ></span>
                            </div>

                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                                        {user?.name || "Student Name"}
                                    </p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <span
                                            className={`text-[11px] font-medium truncate ${isPending ? "text-amber-300" : "text-slate-300"}`}
                                        >
                                            {isPending
                                                ? "Applicant • Pending Review"
                                                : "Enrolled Student"}
                                        </span>
                                        <ChevronDown
                                            className={`w-3 h-3 text-slate-400 transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* LRN pill inside profile */}
                        {!isCollapsed && (
                            <div className="mt-2.5 px-2.5 py-1.5 rounded-md bg-[#16223b] border border-[#2a3c61] flex items-center justify-between text-[10px]">
                                <span className="text-slate-400 font-medium">
                                    LRN:
                                </span>
                                <span className="font-mono font-bold text-emerald-400">
                                    {user?.lrn || "None / Foreign"}
                                </span>
                            </div>
                        )}

                        {/* Quick Profile Actions Dropdown */}
                        {!isCollapsed && profileDropdownOpen && (
                            <div className="mt-3 pt-2.5 border-t border-[#2a3c61] space-y-2 text-xs animate-in fade-in duration-150">
                                <div className="px-2 text-slate-300 text-[11px]">
                                    <span className="text-slate-400">
                                        Email:{" "}
                                    </span>
                                    <span className="font-mono text-emerald-300">
                                        {user?.email}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-2 py-1.5 rounded text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 flex items-center gap-2 transition cursor-pointer font-medium"
                                >
                                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 3. Categorized Navigation Links */}
                    <nav className={`space-y-4 ${isCollapsed ? "p-2" : "p-3"}`}>
                        {navCategories.map((group, idx) => (
                            <div key={idx} className="space-y-1">
                                {!isCollapsed ? (
                                    <div className="px-3 py-1 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                                        {group.category}
                                    </div>
                                ) : (
                                    <div className="h-px bg-[#243556] my-2 mx-1" />
                                )}

                                {group.items.map((item) => {
                                    const isActive = url.startsWith(item.href);

                                    if (item.isLocked) {
                                        return (
                                            <div
                                                key={item.name}
                                                title={
                                                    isCollapsed
                                                        ? `${item.name} (Locked)`
                                                        : item.lockedReason
                                                }
                                                className={`flex items-center rounded-lg text-xs font-semibold transition-all opacity-40 cursor-not-allowed select-none ${
                                                    isCollapsed
                                                        ? "justify-center p-3"
                                                        : "justify-between px-3.5 py-2.5"
                                                } text-slate-400 bg-slate-900/20`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <item.icon className="w-4 h-4 shrink-0 text-slate-500" />
                                                    {!isCollapsed && (
                                                        <span className="truncate">
                                                            {item.name}
                                                        </span>
                                                    )}
                                                </div>
                                                {!isCollapsed && (
                                                    <Lock className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                                                )}
                                            </div>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            title={
                                                isCollapsed
                                                    ? item.name
                                                    : undefined
                                            }
                                            className={`flex items-center rounded-lg text-xs font-semibold transition-all group ${
                                                isCollapsed
                                                    ? "justify-center p-3"
                                                    : "justify-between px-3.5 py-2.5"
                                            } ${
                                                isActive
                                                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 font-bold"
                                                    : "text-slate-300 hover:bg-[#243556] hover:text-white"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <item.icon
                                                    className={`w-4 h-4 shrink-0 ${
                                                        isActive
                                                            ? "text-white"
                                                            : "text-slate-400 group-hover:text-emerald-400"
                                                    } transition-colors`}
                                                />
                                                {!isCollapsed && (
                                                    <span className="truncate">
                                                        {item.name}
                                                    </span>
                                                )}
                                            </div>
                                            {!isCollapsed && !isActive && (
                                                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* 🏛️ Official Institutional & System Footer */}
                <div
                    className={`border-t border-[#243556] bg-[#16223b] ${isCollapsed ? "p-2.5 text-center" : "px-4 py-3"}`}
                >
                    {!isCollapsed ? (
                        <div className="space-y-0.5">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 gap-2">
                                <span className="truncate">{school.short_name}</span>
                                <span className="font-mono text-emerald-400 text-[10px] bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded shrink-0">
                                    ID: {school.school_id}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 gap-2">
                                <span>v2.4.0</span>
                                <span className="truncate">
                                    {school.region}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="text-[10px] font-mono text-emerald-400 font-bold"
                            title={`${school.short_name} • ID: ${school.school_id} • v2.4.0 ${school.region}`}
                        >
                            {school.school_id}
                        </div>
                    )}
                </div>
            </aside>

            {/* 📱 MOBILE TOP HEADER (Seamless Terno with BNHS Emerald Hero Banners) */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-gradient-to-r from-[#07241c] via-[#0f4c3a] to-[#0d5c43] text-white px-4 flex items-center justify-between border-b border-white/10 print:hidden">
                {/* Brand Logo */}
                <div className="flex items-center gap-2.5 min-w-0">
                    {school.logo_url ? (
                        <img
                            src={school.logo_url}
                            alt={school.short_name}
                            className="w-8 h-8 object-contain shrink-0 drop-shadow-sm"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-black text-white shadow-xs text-xs ring-2 ring-emerald-300/40 shrink-0">
                            {school.initial}
                        </div>
                    )}
                    <div className="min-w-0">
                        <h1 className="text-xs font-black tracking-wider uppercase text-white truncate">
                            {school.short_name}
                        </h1>
                        <p className="text-[10px] text-emerald-300 font-semibold truncate">
                            {isPending
                                ? "OPAS Pre-Admission"
                                : "Student Portal"}
                        </p>
                    </div>
                </div>

                {/* Mobile Right Controls: Notification Bell + Log Out */}
                <div className="flex items-center gap-1.5">
                    <NotificationBell isDark={true} />

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="p-1.5 rounded-lg text-emerald-200 hover:text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
                        title="Log Out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* 🖥️ MAIN CONTENT AREA (Independently Scrollable Container) */}
            <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden pt-14 lg:pt-0 print:h-auto print:pt-0 print:overflow-visible">
                <header className="hidden lg:flex h-16 bg-white border-b border-slate-200/80 px-8 items-center justify-between shrink-0 z-30 shadow-xs print:hidden">
                    <div className="flex items-center gap-4">
                        {/* Desktop Collapse / Expand Toggle Button on Topbar */}
                        <button
                            onClick={toggleDesktopSidebar}
                            className="hidden lg:flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                            title={
                                isCollapsed
                                    ? "Expand Sidebar (Wider)"
                                    : "Compress Sidebar (Icons Only)"
                            }
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div>
                            <h2 className="text-base font-bold text-slate-800">
                                {title}
                            </h2>
                            <p className="text-[11px] text-slate-400">
                                {school.school_name} •{" "}
                                {isPending
                                    ? "Pre-Admission Portal"
                                    : "Student Portal"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationBell isDark={false} />

                        <div
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold shadow-2xs border ${
                                isPending
                                    ? "bg-amber-50 border-amber-200 text-amber-800"
                                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                            }`}
                        >
                            <Shield className="w-3.5 h-3.5" />
                            <span>
                                {isPending
                                    ? "Pre-Admission (Pending Review)"
                                    : getActiveYearLabel()}
                            </span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-2.5 py-3.5 sm:p-6 lg:p-8 bg-[#f4f7fa] pb-18 lg:pb-8 print:p-0 print:m-0 print:overflow-visible print:bg-white">
                    <div className="max-w-7xl mx-auto w-full space-y-4 print:max-w-none print:m-0">
                        {children}
                    </div>
                </main>
            </div>

            {/* 📱 MOBILE FIXED BOTTOM NAVIGATION (Compact Height) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-13 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-40 px-2 flex justify-around items-center shadow-[0_-2px_12px_rgba(0,0,0,0.05)] print:hidden">
                {mobileTabs.map((item) => {
                    const isActive = url.startsWith(item.href);

                    // 🌟 Floating Center Profile Avatar Button (Compact & Sleek)
                    if (item.isCenter) {
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="relative -top-2.5 flex flex-col items-center group focus:outline-none"
                                title="My Profile & LRN"
                            >
                                <div
                                    className={`w-11 h-11 rounded-full flex items-center justify-center p-0.5 shadow-md transition-all duration-200 active:scale-95 ${
                                        isActive
                                            ? "bg-gradient-to-tr from-emerald-600 to-teal-400 ring-2 ring-emerald-500/30 shadow-emerald-700/25"
                                            : "bg-white ring-2 ring-slate-100 shadow-slate-900/10 group-hover:ring-emerald-400/30"
                                    }`}
                                >
                                    <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center text-white font-black text-xs">
                                        {user?.avatar_path ? (
                                            <img
                                                src={user.avatar_path}
                                                alt={user?.name || "Student"}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="bg-gradient-to-tr from-emerald-600 to-teal-400 w-full h-full flex items-center justify-center text-white">
                                                {user?.name?.charAt(0) || "S"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span
                                    className={`text-[9px] mt-0.5 font-bold tracking-tight leading-none ${
                                        isActive
                                            ? "text-emerald-700"
                                            : "text-slate-500"
                                    }`}
                                >
                                    {item.name}
                                </span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center py-0.5 px-2.5 rounded-lg transition-all ${
                                isActive
                                    ? "text-emerald-600 font-bold scale-102"
                                    : "text-slate-400 hover:text-slate-600 font-medium"
                            }`}
                        >
                            <item.icon
                                className={`w-4.5 h-4.5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`}
                            />
                            <span className="text-[9px] mt-0.5 leading-none">
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
