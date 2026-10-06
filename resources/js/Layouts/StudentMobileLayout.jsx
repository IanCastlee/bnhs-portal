import React from "react";
import { Link, router } from "@inertiajs/react";
import { useAuth } from "@/Hooks/useAuth";
import {
    Newspaper,
    CalendarDays,
    FileSpreadsheet,
    GraduationCap,
    UserCircle,
    Bell,
    LogOut,
} from "lucide-react";

export default function StudentMobileLayout({ children, title = "Student Portal" }) {
    const { user } = useAuth();
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

    // 📱 Mobile Bottom Navigation Tabs
    const tabs = [
        { name: "Feed", href: "/student/dashboard", icon: Newspaper },
        { name: "Classes", href: "/student/classes", icon: CalendarDays },
        { name: "Grades", href: "/student/grades", icon: FileSpreadsheet },
        { name: "Admission", href: "/student/admission", icon: GraduationCap },
        { name: "Profile", href: "/student/profile", icon: UserCircle },
    ];

    const handleLogout = () => {
        router.post("/logout");
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-between max-w-md mx-auto shadow-2xl relative border-x border-slate-200">
            {/* 📱 Mobile Top Header */}
            <header className="sticky top-0 z-40 bg-slate-900 text-white px-4 py-3 shadow-md flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-900 shadow-xs">
                        B
                    </div>
                    <div>
                        <h1 className="text-xs font-black tracking-wider uppercase">Bulusan NHS</h1>
                        <p className="text-[10px] text-amber-400 font-mono">LRN: {user?.lrn || "102938475612"}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 cursor-pointer">
                        <Bell className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-1.5 rounded-full hover:bg-slate-800 text-rose-400 cursor-pointer"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* 📱 Main Scrollable Feed Content */}
            <main className="flex-1 p-4 pb-24 overflow-y-auto">
                {children}
            </main>

            {/* 📱 Fixed Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 px-2 py-1.5 flex justify-around items-center shadow-lg">
                {tabs.map((tab) => {
                    const isActive = currentPath === tab.href;
                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                                isActive
                                    ? "text-amber-600 font-bold scale-105"
                                    : "text-slate-400 hover:text-slate-600 font-medium"
                            }`}
                        >
                            <tab.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
                            <span className="text-[10px] mt-0.5">{tab.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
