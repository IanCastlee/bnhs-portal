import React, { useState, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { useAuth } from "@/Hooks/useAuth";
import OfflineBanner from "@/Components/Molecules/OfflineBanner";
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
} from "lucide-react";

export default function StudentLayout({ children, title = "Student Portal" }) {
    const { user } = useAuth();
    const { url } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer
    const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse/expand
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

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

    const navCategories = [
        {
            category: "Navigation",
            items: [
                { name: "School Feed", href: "/student/dashboard", icon: Newspaper },
            ],
        },
        {
            category: "Academic Records",
            items: [
                { name: "Classes & Schedule", href: "/student/classes", icon: CalendarDays },
                { name: "Quarterly Grades", href: "/student/grades", icon: FileSpreadsheet },
            ],
        },
        {
            category: "Admission & Profile",
            items: [
                { name: "BEEF Admission", href: "/student/admission", icon: GraduationCap },
                { name: "My Profile & LRN", href: "/student/profile", icon: UserCircle },
            ],
        },
    ];

    const handleLogout = () => {
        router.post("/logout");
    };

    return (
        <div className="h-screen w-screen overflow-hidden bg-[#f4f7fa] flex text-slate-800 antialiased">
            {/* ⚡ Offline Connection Banner */}
            <OfflineBanner />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* 💻 FLAT ABLE THEMED FIXED NON-SCROLLING SIDEBAR */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 h-screen bg-[#1b2a47] text-white flex flex-col justify-between transition-all duration-300 ease-in-out shadow-2xl shrink-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                } ${isCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}
            >
                {/* Scrollable Nav Area (Independent from main page) */}
                <div className="overflow-y-auto flex-1 custom-scrollbar overflow-x-hidden">
                    {/* 1. Header with Logo & Brand */}
                    <div className="h-16 px-4 flex items-center justify-between border-b border-[#243556] bg-[#16223b] sticky top-0 z-10">
                        <div className={`flex items-center gap-3 ${isCollapsed ? "lg:justify-center lg:w-full" : ""}`}>
                            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-black text-white shadow-md text-base ring-2 ring-emerald-400/30 shrink-0">
                                B
                            </div>
                            {!isCollapsed && (
                                <div className="transition-opacity duration-200">
                                    <h1 className="font-extrabold text-sm tracking-wider text-white uppercase whitespace-nowrap">BNHS PORTAL</h1>
                                    <p className="text-[10px] text-emerald-400 font-semibold tracking-wide whitespace-nowrap">Student Access</p>
                                </div>
                            )}
                        </div>

                        {/* Mobile Close Button */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* 2. User Profile Box (Flat Able Style) */}
                    <div className={`border-b border-[#243556] bg-[#1e2e4d] ${isCollapsed ? "p-3 flex justify-center" : "p-4"}`}>
                        <div
                            onClick={() => !isCollapsed && setProfileDropdownOpen(!profileDropdownOpen)}
                            className={`flex items-center gap-3 group ${isCollapsed ? "justify-center" : "cursor-pointer"}`}
                            title={isCollapsed ? `${user?.name} (Grade 7 - Rizal)` : undefined}
                        >
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white shadow-md ring-2 ring-white/10 text-sm">
                                    {user?.name?.charAt(0) || "S"}
                                </div>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#1e2e4d] rounded-full"></span>
                            </div>

                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                                        {user?.name || "Student Name"}
                                    </p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <span className="text-[11px] text-slate-300 font-medium truncate">
                                            Grade 7 • Rizal
                                        </span>
                                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* LRN pill inside profile */}
                        {!isCollapsed && (
                            <div className="mt-2.5 px-2.5 py-1.5 rounded-md bg-[#16223b] border border-[#2a3c61] flex items-center justify-between text-[10px]">
                                <span className="text-slate-400 font-medium">LRN:</span>
                                <span className="font-mono font-bold text-emerald-400">{user?.lrn || "102938475612"}</span>
                            </div>
                        )}
                    </div>

                    {/* 3. Categorized Navigation Links (Flat Able Style) */}
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
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            title={isCollapsed ? item.name : undefined}
                                            className={`flex items-center rounded-lg text-xs font-semibold transition-all group ${
                                                isCollapsed ? "justify-center p-3" : "justify-between px-3.5 py-2.5"
                                            } ${
                                                isActive
                                                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 font-bold"
                                                    : "text-slate-300 hover:bg-[#243556] hover:text-white"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-400"} transition-colors`} />
                                                {!isCollapsed && <span className="truncate">{item.name}</span>}
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

                {/* 4. Bottom Footer Log Out */}
                <div className={`border-t border-[#243556] bg-[#16223b] ${isCollapsed ? "p-2 flex justify-center" : "p-3"}`}>
                    <button
                        onClick={handleLogout}
                        title={isCollapsed ? "Log Out of Portal" : undefined}
                        className={`flex items-center justify-center gap-2 rounded-lg text-xs font-bold text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer ${
                            isCollapsed ? "p-2.5 w-full" : "w-full px-3 py-2"
                        }`}
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        {!isCollapsed && <span>Log Out</span>}
                    </button>
                </div>
            </aside>

            {/* 📱 MOBILE TOP HEADER */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#1b2a47] text-white px-4 py-3 shadow-md flex items-center justify-between border-b border-[#243556]">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-1 rounded-md hover:bg-[#243556] text-slate-300 cursor-pointer"
                        title="Open Navigation Drawer"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white shadow-xs text-xs">
                            B
                        </div>
                        <div>
                            <h1 className="text-xs font-black tracking-wider uppercase">Bulusan NHS</h1>
                            <p className="text-[10px] text-emerald-400 font-mono">LRN: {user?.lrn || "102938475612"}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={handleLogout}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-300 cursor-pointer"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* 🖥️ MAIN CONTENT AREA (Independently Scrollable Container) */}
            <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden pt-14 lg:pt-0">
                <header className="hidden lg:flex h-16 bg-white border-b border-slate-200/80 px-8 items-center justify-between shrink-0 z-30 shadow-xs">
                    <div className="flex items-center gap-4">
                        {/* Desktop Collapse / Expand Toggle Button on Topbar */}
                        <button
                            onClick={toggleDesktopSidebar}
                            className="hidden lg:flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                            title={isCollapsed ? "Expand Sidebar (Wider)" : "Compress Sidebar (Icons Only)"}
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div>
                            <h2 className="text-base font-bold text-slate-800">{title}</h2>
                            <p className="text-[11px] text-slate-400">Bulusan National High School • Student Portal</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 shadow-2xs">
                            <Shield className="w-3.5 h-3.5 text-emerald-600" />
                            <span>S.Y. 2026-2027 Active</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-2.5 py-3.5 sm:p-6 lg:p-8 bg-[#f4f7fa] pb-24 lg:pb-8">
                    <div className="max-w-7xl mx-auto w-full space-y-4">
                        {children}
                    </div>
                </main>
            </div>

            {/* 📱 MOBILE FIXED BOTTOM NAVIGATION */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 px-2 py-1.5 flex justify-around items-center shadow-lg">
                {navCategories.flatMap(c => c.items).map((item) => {
                    const isActive = url.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
                                isActive
                                    ? "text-emerald-600 font-bold scale-105"
                                    : "text-slate-400 hover:text-slate-600 font-medium"
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
                            <span className="text-[10px] mt-0.5">{item.name.split(" ")[0]}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
