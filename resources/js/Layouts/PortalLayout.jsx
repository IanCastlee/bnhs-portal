import React, { useState, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { useAuth } from "@/Hooks/useAuth";
import OfflineBanner from "@/Components/Molecules/OfflineBanner";
import {
    LayoutDashboard,
    GraduationCap,
    BookOpen,
    Users,
    FileSpreadsheet,
    Settings,
    LogOut,
    Menu,
    X,
    Shield,
    School,
    Megaphone,
    ChevronDown,
    ChevronRight,
    User,
    Calendar,
    Sparkles,
    Bell,
    PanelLeftClose,
    PanelLeftOpen,
    MenuIcon,
} from "lucide-react";

export default function PortalLayout({ children, title = "Dashboard" }) {
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

    // 🎯 Role-Based Categorized Navigation (Flat Able Architecture)
    const getNavCategories = () => {
        switch (user?.role) {
            case "ADMIN":
                return [
                    {
                        category: "Navigation",
                        items: [
                            { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
                        ],
                    },
                    {
                        category: "School & Feed",
                        items: [
                            { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
                            { name: "Academic & Strands", href: "/admin/academic", icon: School },
                        ],
                    },
                    {
                        category: "Users & Security",
                        items: [
                            { name: "User Accounts", href: "/admin/users", icon: Users },
                            { name: "System Settings", href: "/admin/settings", icon: Settings },
                        ],
                    },
                ];
            case "REGISTRAR":
                return [
                    {
                        category: "Navigation",
                        items: [
                            { name: "Dashboard", href: "/registrar/dashboard", icon: LayoutDashboard },
                        ],
                    },
                    {
                        category: "Admission & Students",
                        items: [
                            { name: "Admission & Sectioning", href: "/registrar/enrollments", icon: Users },
                        ],
                    },
                    {
                        category: "Grading & SF10",
                        items: [
                            { name: "Grades & SF10 Approval", href: "/registrar/grades", icon: FileSpreadsheet },
                        ],
                    },
                ];
            case "TEACHER":
                return [
                    {
                        category: "Navigation",
                        items: [
                            { name: "Faculty Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
                        ],
                    },
                    {
                        category: "Academic & Grading",
                        items: [
                            { name: "Quarterly Grading", href: "/teacher/grades", icon: FileSpreadsheet },
                            { name: "My Advisory Section", href: "/teacher/advisory", icon: Users },
                        ],
                    },
                ];
            case "STUDENT":
                return [
                    {
                        category: "Navigation",
                        items: [
                            { name: "School Feed", href: "/student/dashboard", icon: LayoutDashboard },
                        ],
                    },
                    {
                        category: "Academic Records",
                        items: [
                            { name: "Quarterly Grades", href: "/student/grades", icon: FileSpreadsheet },
                            { name: "BEEF Online Admission", href: "/student/admission", icon: GraduationCap },
                        ],
                    },
                ];
            default:
                return [];
        }
    };

    const navCategories = getNavCategories();

    const handleLogout = (e) => {
        e?.preventDefault();
        router.post("/logout");
    };

    const getRoleTitle = () => {
        switch (user?.role) {
            case "ADMIN": return "Super Administrator";
            case "REGISTRAR": return "Registrar Officer";
            case "TEACHER": return "Faculty Teacher";
            case "STUDENT": return "Enrolled Student";
            default: return "User";
        }
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
                                    <p className="text-[10px] text-emerald-400 font-semibold tracking-wide whitespace-nowrap">Bulusan National High</p>
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
                            title={isCollapsed ? `${user?.name} (${getRoleTitle()})` : undefined}
                        >
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white shadow-md ring-2 ring-white/10 text-sm">
                                    {user?.name?.charAt(0) || "U"}
                                </div>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#1e2e4d] rounded-full"></span>
                            </div>

                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                                        {user?.name || "User Account"}
                                    </p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <span className="text-[11px] text-slate-300 font-medium truncate">
                                            {getRoleTitle()}
                                        </span>
                                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Profile Actions Dropdown */}
                        {!isCollapsed && profileDropdownOpen && (
                            <div className="mt-3 pt-2 border-t border-[#2a3c61] space-y-1 text-xs">
                                <div className="px-2 py-1 text-slate-300 text-[11px]">
                                    <span className="text-slate-400">Email: </span>
                                    <span className="font-mono text-emerald-300">{user?.email}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-2 py-1.5 rounded text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 flex items-center gap-2 transition cursor-pointer"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    Sign Out
                                </button>
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
                        title={isCollapsed ? "Log Out" : undefined}
                        className={`flex items-center justify-center gap-2 rounded-lg text-xs font-bold text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer ${
                            isCollapsed ? "p-2.5 w-full" : "w-full px-3 py-2"
                        }`}
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        {!isCollapsed && <span>Log Out</span>}
                    </button>
                </div>
            </aside>

            {/* 🖥️ MAIN CONTENT AREA (Independently Scrollable Container) */}
            <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
                {/* Top Navbar */}
                <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 z-30 shadow-xs">
                    <div className="flex items-center gap-4">
                        {/* Mobile Drawer Trigger */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                            title="Open Menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

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
                            <p className="text-[11px] text-slate-400 hidden sm:block">Bulusan National High School • DepEd SSU OPAS</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 shadow-2xs">
                            <Shield className="w-3.5 h-3.5 text-emerald-600" />
                            <span>S.Y. 2026-2027 Active</span>
                        </div>
                    </div>
                </header>

                {/* Page Content (Scrolls Smoothly Without Moving Sidebar) */}
                <main className="flex-1 overflow-y-auto px-2.5 py-3.5 sm:p-6 lg:p-8 bg-[#f4f7fa]">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
