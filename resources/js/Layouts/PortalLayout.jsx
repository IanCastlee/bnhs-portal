import React, { useState, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { useAuth } from "@/Hooks/useAuth";
import { useSchoolSettings } from "@/Hooks/useSchoolSettings";
import OfflineBanner from "@/Components/Molecules/OfflineBanner";
import {
    LayoutDashboard,
    GraduationCap,
    Users,
    FileSpreadsheet,
    LogOut,
    Menu,
    X,
    Shield,
    Megaphone,
    ChevronDown,
    ChevronRight,
    Calendar,
    ShieldCheck,
    Layers,
    Server,
    Building2,
    BookOpen,
} from "lucide-react";

export default function PortalLayout({ children, title = "Dashboard" }) {
    const { user } = useAuth();
    const school = useSchoolSettings();
    const { url, props } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer
    const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse/expand
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState(() => {
        const initial = {};
        if (
            url.startsWith("/admin/registrars") ||
            url.startsWith("/admin/teachers")
        ) {
            initial["Staff & Faculty"] = true;
        }
        return initial;
    });

    useEffect(() => {
        if (
            url.startsWith("/admin/registrars") ||
            url.startsWith("/admin/teachers")
        ) {
            setOpenMenus((prev) => ({ ...prev, "Staff & Faculty": true }));
        }
    }, [url]);

    const toggleMenu = (menuName) => {
        setOpenMenus((prev) => ({
            ...prev,
            [menuName]: !prev[menuName],
        }));
    };

    // Safe Dynamic Academic Year & Workspace Selection
    const allAcademicYears = props?.all_academic_years || [];
    const activeAcademicYear = props?.active_academic_year;

    // Detect currently viewed Academic Year from URL search params, filters, props, or localStorage
    const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const storedYearId = typeof window !== "undefined" ? localStorage.getItem("bnhs_registrar_academic_year_id") : null;
    const urlYearId = searchParams.get("academic_year_id") || props?.filters?.academic_year_id || props?.selected_academic_year_id || storedYearId;

    const currentViewYear = urlYearId
        ? allAcademicYears.find((y) => String(y.id) === String(urlYearId)) || activeAcademicYear
        : activeAcademicYear;

    const isCurrentActive =
        (currentViewYear && activeAcademicYear && String(currentViewYear.id) === String(activeAcademicYear.id)) ||
        Boolean(currentViewYear?.is_active);

    const handleSelectYear = (year) => {
        setYearDropdownOpen(false);
        if (typeof window !== "undefined") {
            if (year.is_active) {
                localStorage.removeItem("bnhs_registrar_academic_year_id");
            } else {
                localStorage.setItem("bnhs_registrar_academic_year_id", String(year.id));
            }
        }
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set("academic_year_id", year.id);

        if (currentUrl.searchParams.has("page")) {
            currentUrl.searchParams.delete("page");
        }
        if (currentUrl.searchParams.has("cursor")) {
            currentUrl.searchParams.delete("cursor");
        }

        router.get(
            currentUrl.pathname + currentUrl.search,
            {},
            {
                preserveState: false,
                preserveScroll: true,
            }
        );
    };

    // Helper to preserve active/archived school year across workspace navigation
    const buildNavHref = (rawHref) => {
        if (!urlYearId || isCurrentActive || typeof rawHref !== "string" || !rawHref.startsWith("/registrar/")) {
            return rawHref;
        }
        return rawHref.includes("?")
            ? `${rawHref}&academic_year_id=${urlYearId}`
            : `${rawHref}?academic_year_id=${urlYearId}`;
    };

    // Load and Persist Sidebar Collapsed State
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

    // Role-Based Categorized Navigation (Flat Able Architecture)
    const getNavCategories = () => {
        switch (user?.role) {
            case "ADMIN":
                return [
                    {
                        category: "Navigation",
                        items: [
                            {
                                name: "Dashboard",
                                href: "/admin/dashboard",
                                icon: LayoutDashboard,
                            },
                        ],
                    },
                    {
                        category: "School Operations",
                        items: [
                            {
                                name: "School Years",
                                href: "/admin/academic-years",
                                icon: Calendar,
                            },
                            {
                                name: "Subjects & Curriculum",
                                href: "/admin/subjects",
                                icon: BookOpen,
                            },
                            {
                                name: "Class Sectioning",
                                href: "/registrar/sectioning",
                                icon: Layers,
                            },
                            {
                                name: "Announcements",
                                href: "/admin/announcements",
                                icon: Megaphone,
                            },
                        ],
                    },
                    {
                        category: "Staff & Security",
                        items: [
                            {
                                name: "Staff & Faculty",
                                icon: Users,
                                children: [
                                    {
                                        name: "Registrar Officers",
                                        href: "/admin/registrars",
                                        icon: Users,
                                    },
                                    {
                                        name: "Faculty Teachers",
                                        href: "/admin/teachers",
                                        icon: GraduationCap,
                                    },
                                ],
                            },
                            {
                                name: "Activity Audit Logs",
                                href: "/admin/audit-logs",
                                icon: ShieldCheck,
                            },
                            {
                                name: "Queue & Background Jobs",
                                href: "/admin/queue-jobs",
                                icon: Server,
                            },
                            {
                                name: "School Profile & Logo",
                                href: "/admin/settings",
                                icon: Building2,
                            },
                        ],
                    },
                ];
            case "REGISTRAR":
                return [
                    {
                        category: "Navigation",
                        items: [
                            {
                                name: "Dashboard",
                                href: "/registrar/dashboard",
                                icon: LayoutDashboard,
                            },
                        ],
                    },
                    {
                        category: "Admission & Students",
                        items: [
                            {
                                name: "Admission Review",
                                href: "/registrar/enrollments",
                                icon: Users,
                            },
                            {
                                name: "Class Sectioning",
                                href: "/registrar/sectioning",
                                icon: Layers,
                            },
                        ],
                    },
                    {
                        category: "Grading & SF10",
                        items: [
                            {
                                name: "Grades & SF10 Approval",
                                href: "/registrar/grades",
                                icon: FileSpreadsheet,
                            },
                        ],
                    },
                ];
            case "TEACHER":
                return [
                    {
                        category: "Navigation",
                        items: [
                            {
                                name: "Faculty Dashboard",
                                href: "/teacher/dashboard",
                                icon: LayoutDashboard,
                            },
                        ],
                    },
                    {
                        category: "Academic & Grading",
                        items: [
                            {
                                name: "Quarterly Grading",
                                href: "/teacher/grades",
                                icon: FileSpreadsheet,
                            },
                            {
                                name: "My Advisory Section",
                                href: "/teacher/advisory",
                                icon: Users,
                            },
                        ],
                    },
                ];
            case "STUDENT":
                return [
                    {
                        category: "Navigation",
                        items: [
                            {
                                name: "School Feed",
                                href: "/student/dashboard",
                                icon: LayoutDashboard,
                            },
                        ],
                    },
                    {
                        category: "Academic Records",
                        items: [
                            {
                                name: "Quarterly Grades",
                                href: "/student/grades",
                                icon: FileSpreadsheet,
                            },
                            {
                                name: "BEEF Online Admission",
                                href: "/student/admission",
                                icon: GraduationCap,
                            },
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
            case "ADMIN":
                return "Super Administrator";
            case "REGISTRAR":
                return "Registrar Officer";
            case "TEACHER":
                return "Faculty Teacher";
            case "STUDENT":
                return "Enrolled Student";
            default:
                return "User";
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
                    sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                } ${isCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}
            >
                {/* Scrollable Nav Area (Independent from main page) */}
                <div className="overflow-y-auto flex-1 custom-scrollbar overflow-x-hidden">
                    {/* 1. Header with Logo & Brand */}
                    <div className="h-16 px-4 flex items-center justify-between border-b border-[#243556] bg-[#16223b] sticky top-0 z-10">
                        <div
                            className={`flex items-center gap-3 ${isCollapsed ? "lg:justify-center lg:w-full" : "min-w-0"}`}
                        >
                            {school.logo_url ? (
                                <img
                                    src={school.logo_url}
                                    alt={school.short_name}
                                    className="w-9 h-9 object-contain shrink-0 drop-shadow-sm"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-black text-white shadow-md text-base ring-2 ring-emerald-400/30 shrink-0">
                                    <span>{school.initial}</span>
                                </div>
                            )}
                            {!isCollapsed && (
                                <div className="transition-opacity duration-200 min-w-0">
                                    <h1 className="font-extrabold text-sm tracking-wider text-white uppercase truncate">
                                        {school.portal_title}
                                    </h1>
                                    <p className="text-[10px] text-emerald-400 font-semibold tracking-wide truncate">
                                        {school.short_name}
                                    </p>
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
                                    ? `${user?.name} (${getRoleTitle()})`
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
                                            {user?.name?.charAt(0) || "U"}
                                        </span>
                                    )}
                                </div>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#1e2e4d] rounded-full"></span>
                            </div>

                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                                        {user?.name || "User Account"}
                                    </p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <span className="text-[11px] text-emerald-400 font-semibold truncate">
                                            {getRoleTitle()}
                                        </span>
                                        <ChevronDown
                                            className={`w-3 h-3 text-slate-400 transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

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
                                    if (item.children) {
                                        const isChildActive =
                                            item.children.some((c) =>
                                                url.startsWith(c.href),
                                            );
                                        const isOpen = openMenus[item.name];

                                        return (
                                            <div
                                                key={item.name}
                                                className="space-y-1"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (isCollapsed)
                                                            setIsCollapsed(
                                                                false,
                                                            );
                                                        toggleMenu(item.name);
                                                    }}
                                                    title={
                                                        isCollapsed
                                                            ? item.name
                                                            : undefined
                                                    }
                                                    className={`w-full flex items-center rounded-lg text-xs font-semibold transition-all group cursor-pointer ${
                                                        isCollapsed
                                                            ? "justify-center p-3"
                                                            : "justify-between px-3.5 py-2.5"
                                                    } ${
                                                        isChildActive
                                                            ? "bg-[#233557] text-white"
                                                            : "text-slate-300 hover:bg-[#243556] hover:text-white"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <item.icon
                                                            className={`w-4 h-4 shrink-0 ${
                                                                isChildActive
                                                                    ? "text-emerald-400"
                                                                    : "text-slate-400 group-hover:text-emerald-400"
                                                            } transition-colors`}
                                                        />
                                                        {!isCollapsed && (
                                                            <span className="truncate">
                                                                {item.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {!isCollapsed && (
                                                        <ChevronDown
                                                            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                                                isOpen
                                                                    ? "rotate-180 text-white"
                                                                    : ""
                                                            }`}
                                                        />
                                                    )}
                                                </button>

                                                {/* Dropdown Children */}
                                                {!isCollapsed && isOpen && (
                                                    <div className="pl-3 py-1 space-y-1 border-l-2 border-[#2b3e64] ml-5 animate-in fade-in duration-150">
                                                        {item.children.map(
                                                            (child) => {
                                                                const isThisChildActive =
                                                                    url.startsWith(
                                                                        child.href,
                                                                    );
                                                                return (
                                                                    <Link
                                                                        key={
                                                                            child.name
                                                                        }
                                                                        href={buildNavHref(
                                                                            child.href
                                                                        )}
                                                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all group ${
                                                                            isThisChildActive
                                                                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 font-bold"
                                                                                : "text-slate-300 hover:bg-[#243556] hover:text-white"
                                                                        }`}
                                                                    >
                                                                        <child.icon
                                                                            className={`w-3.5 h-3.5 shrink-0 ${
                                                                                isThisChildActive
                                                                                    ? "text-white"
                                                                                    : "text-slate-400 group-hover:text-emerald-400"
                                                                            } transition-colors`}
                                                                        />
                                                                        <span className="truncate">
                                                                            {
                                                                                child.name
                                                                            }
                                                                        </span>
                                                                    </Link>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    const isActive = url.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.name}
                                            href={buildNavHref(item.href)}
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
                                                    className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-400"} transition-colors`}
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
                            <p className="text-[11px] text-slate-400 hidden sm:block">
                                {school.school_name} • {school.tagline}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Interactive Academic Year Directory Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setYearDropdownOpen((prev) => !prev)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-2xs border transition-all cursor-pointer ${
                                    isCurrentActive
                                        ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800"
                                        : "bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900"
                                }`}
                                title="Click to filter or switch School Year view"
                            >
                                <Shield className={`w-3.5 h-3.5 shrink-0 ${isCurrentActive ? "text-emerald-600" : "text-amber-600"}`} />
                                <span className="max-w-[170px] truncate sm:max-w-none">
                                    {isCurrentActive
                                        ? `S.Y. ${currentViewYear?.name || "Active"} Active`
                                        : `Archived S.Y. ${currentViewYear?.name || ""}`}
                                </span>
                                <ChevronDown
                                    className={`w-3 h-3 shrink-0 transition-transform duration-200 ${
                                        yearDropdownOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {/* Dropdown Popover */}
                            {yearDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setYearDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                        <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/80">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                School Year Directory
                                            </p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                Filter workspace records by Academic Cycle
                                            </p>
                                        </div>

                                        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                                            {allAcademicYears && allAcademicYears.length > 0 ? (
                                                allAcademicYears.map((year) => {
                                                    const isSelected = String(year.id) === String(currentViewYear?.id);
                                                    return (
                                                        <button
                                                            key={year.id}
                                                            type="button"
                                                            onClick={() => handleSelectYear(year)}
                                                            className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                                                                isSelected
                                                                    ? "bg-emerald-50/80 text-emerald-950 font-bold"
                                                                    : "hover:bg-slate-50 text-slate-700"
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className={`w-2 h-2 rounded-full shrink-0 ${
                                                                        year.is_active
                                                                            ? "bg-emerald-500"
                                                                            : "bg-slate-300"
                                                                    }`}
                                                                />
                                                                <div>
                                                                    <span className="font-semibold">{`S.Y. ${year.name}`}</span>
                                                                    {year.semester && (
                                                                        <span className="text-[10px] text-slate-400 ml-1.5 font-normal">
                                                                            ({year.semester})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                {year.is_active && (
                                                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
                                                                        ACTIVE
                                                                    </span>
                                                                )}
                                                                {isSelected && (
                                                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                                                                        Viewing
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <div className="px-4 py-3 text-xs text-slate-400 text-center">
                                                    No school years found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content (Scrolls Smoothly Without Moving Sidebar) */}
                <main className="flex-1 overflow-y-auto px-2.5 py-3.5 sm:p-6 lg:p-8 bg-[#f4f7fa]">
                    <div className="max-w-7xl mx-auto w-full">{children}</div>
                </main>
            </div>
        </div>
    );
}
