import React from "react";
import { School } from "lucide-react";
import OfflineBanner from "@/Components/Molecules/OfflineBanner";

export default function GuestLayout({ children, title = "BNHS Portal" }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#072119] via-[#0f4c3a] to-[#0a2f24] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-800">
            {/* ⚡ Offline Connection Banner */}
            <OfflineBanner />

            {/* Background Aesthetic Green Glow Accents */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />

            {/* Header / Brand */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-xl shadow-emerald-950/50 text-white mb-4 border border-emerald-300/30 ring-4 ring-emerald-500/20">
                    <School className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                    BULUSAN NATIONAL HIGH SCHOOL
                </h2>
                <p className="mt-1 text-xs text-emerald-200 uppercase tracking-widest font-bold">
                    Online Pre-Admission, Enrollment & Grading Portal
                </p>
            </div>

            {/* Main Form Content */}
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 z-10">
                {children}
            </div>

            {/* Footer */}
            <footer className="mt-8 text-center text-xs text-slate-500 z-10">
                &copy; {new Date().getFullYear()} Bulusan National High School.
                All rights reserved.
            </footer>
        </div>
    );
}
