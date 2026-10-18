import React from "react";
import { Link } from "@inertiajs/react";
import { useSchoolSettings } from "@/Hooks/useSchoolSettings";
import {
    School,
    ShieldCheck,
    FileText,
    GraduationCap,
    Sparkles,
    ArrowRight,
} from "lucide-react";

export default function AuthShowcasePanel({ mode = "login" }) {
    const isLogin = mode === "login";
    const school = useSchoolSettings();

    return (
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#031d16] via-[#093d2e] to-[#042017] text-white p-8 lg:p-12 flex-col justify-between relative overflow-hidden border-r border-emerald-800/40 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto no-scrollbar">
            {/* Ambient Lighting Orbs */}
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 -right-24 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 left-1/4 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Half-Visible Blurred Watermark Logo on Right Edge */}
            {school.logo_url ? (
                <img
                    src={school.logo_url}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none select-none absolute -right-32 top-1/4 w-96 h-96 object-contain opacity-10 blur-[3px]"
                />
            ) : (
                <School
                    aria-hidden="true"
                    className="pointer-events-none select-none absolute -right-28 top-1/4 w-88 h-88 text-emerald-300 opacity-10 blur-[3px]"
                />
            )}

            {/* Top Branding Section */}
            <div className="relative z-10">
                <div className="flex items-center gap-3.5 mb-6">
                    {school.logo_url ? (
                        <img
                            src={school.logo_url}
                            alt={school.short_name}
                            className="w-13 h-13 object-contain shrink-0 drop-shadow-md"
                        />
                    ) : (
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-950/60 ring-2 ring-emerald-400/30 p-2.5 shrink-0">
                            <School className="w-full h-full stroke-[2.2]" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <h1 className="text-lg sm:text-xl font-black tracking-tight leading-tight text-white drop-shadow-sm uppercase">
                            {school.school_name}
                        </h1>
                        <p className="text-[11px] font-semibold text-emerald-300 tracking-wider uppercase truncate">
                            {school.tagline}
                        </p>
                    </div>
                </div>

                {/* Hero Headers */}
                <div className="mt-8 lg:mt-10 space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold backdrop-blur-md">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Official School Academic Portal</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                        {isLogin ? (
                            <>
                                Welcome Back to <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-200 to-amber-200">
                                    {school.short_name}!
                                </span>
                            </>
                        ) : (
                            <>
                                Begin Your Journey at <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-200 to-amber-200">
                                    {school.short_name}
                                </span>
                            </>
                        )}
                    </h2>

                    <p className="text-sm text-emerald-100/80 leading-relaxed max-w-md">
                        {isLogin
                            ? "Access your academic records, real-time quarter grades (SF9/SF10), official campus announcements, and enrollment status in one secure platform."
                            : "Register your 12-digit DepEd Learner Reference Number (LRN) to start your pre-admission application and track admission requirements instantly."}
                    </p>
                </div>

                {/* Feature Highlights Cards */}
                <div className="mt-8 space-y-3.5 max-w-md">
                    <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md transition hover:bg-white/10">
                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-emerald-100">
                                Automated DepEd Grading &amp; SF9 / SF10
                            </h3>
                            <p className="text-[11px] text-emerald-200/70">
                                Instant quarter grade computation,
                                transmutation, and printable report cards.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md transition hover:bg-white/10">
                        <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300 shrink-0">
                            <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-emerald-100">
                                BEEF Online Pre-Admission
                            </h3>
                            <p className="text-[11px] text-emerald-200/70">
                                Hassle-free digital application for Junior &amp;
                                Senior High School learners.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md transition hover:bg-white/10">
                        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-emerald-100">
                                Campus Bulletins &amp; Feed
                            </h3>
                            <p className="text-[11px] text-emerald-200/70">
                                Real-time verified announcements, emergency
                                suspension notices, and posters.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Switcher Card */}
            <div className="mt-8 pt-6 border-t border-emerald-800/60 relative z-10">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900/80 to-[#062c20]/90 border border-emerald-500/30 backdrop-blur-md flex items-center justify-between gap-4 shadow-xl">
                    <div>
                        <p className="text-xs font-bold text-white">
                            {isLogin
                                ? "New student or transferee?"
                                : "Already registered student/faculty?"}
                        </p>
                        <p className="text-[11px] text-emerald-200/70">
                            {isLogin
                                ? "Create your account & apply for admission"
                                : "Sign in with your verified email"}
                        </p>
                    </div>
                    <Link
                        href={isLogin ? "/register" : "/login"}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition duration-150 flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 cursor-pointer shrink-0"
                    >
                        <span>{isLogin ? "Apply / Register" : "Sign In"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Security Tag */}
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-emerald-300/60 text-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                        Protected by 256-bit SSL &amp; DepEd Data Privacy Act
                        (RA 10173)
                    </span>
                </div>
            </div>
        </div>
    );
}
