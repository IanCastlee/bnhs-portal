import React from "react";
import Badge from "@/Components/Atoms/Common/Badge";
import Button from "@/Components/Atoms/Common/Button";
import { useSchoolSettings } from "@/Hooks/useSchoolSettings";
import { GraduationCap, Download, Clock, AlertTriangle, School } from "lucide-react";

export default function AdmissionBanner({
    enrollment,
    queuePosition,
    trackingNo,
    isPending,
    isApproved,
    onPrint,
}) {
    const school = useSchoolSettings();
    const isRejected = enrollment?.status === "REJECTED";

    return (
        <div className={`relative z-10 -mx-2.5 -mt-3.5 sm:mx-0 sm:mt-0 sm:rounded-2xl px-5 pt-4 pb-12 sm:p-6 text-white shadow-xl overflow-hidden sm:border ${
            isRejected
                ? "bg-gradient-to-br from-[#3b0d0d] via-[#5c1d1d] to-[#451010] border-rose-500/30"
                : "bg-gradient-to-br from-[#042219] via-[#0b4635] to-[#062d21] border-emerald-400/20"
        }`}>
            <div className="hidden sm:block absolute -top-12 -right-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-teal-400/15 rounded-full blur-2xl pointer-events-none" />

            {/* Half-Visible Blurred Watermark Logo on Right Edge */}
            {school.logo_url ? (
                <img
                    src={school.logo_url}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none select-none absolute -right-14 -bottom-6 w-48 h-48 sm:w-52 sm:h-52 object-contain opacity-20 blur-[2px]"
                />
            ) : (
                <School
                    aria-hidden="true"
                    className="pointer-events-none select-none absolute -right-12 -bottom-6 w-44 h-44 sm:w-48 sm:h-48 text-emerald-300 opacity-15 blur-[2px]"
                />
            )}

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-xs">
                            DepEd BEEF (Annex A)
                        </span>

                        {isRejected ? (
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500 text-white shadow-2xs flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                ACTION REQUIRED • RETURNED
                            </span>
                        ) : isPending ? (
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 shadow-2xs flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                PENDING REVIEW
                            </span>
                        ) : isApproved ? (
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-400 text-slate-950 shadow-2xs">
                                OFFICIALLY ENROLLED
                            </span>
                        ) : (
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 shadow-2xs">
                                APPLICATION IN PROGRESS
                            </span>
                        )}

                        <span className="text-[10px] sm:text-xs font-semibold text-emerald-200 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            Ticket: {trackingNo}
                        </span>
                    </div>

                    <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300 shrink-0" />
                        Basic Education Enrollment Record
                    </h2>
                    <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>{school.short_name}</span>
                        <span className="text-emerald-300/40 hidden sm:inline">•</span>
                        <span>{(enrollment?.grade_level?.name || enrollment?.gradeLevel?.name || "Grade 7")} ({enrollment?.student_type || "NEW"} Student)</span>
                    </p>
                </div>

                {/* 📄 Download Button: Lalabas LAMANG kapag APPROVED / Officially Enrolled na */}
                {isApproved ? (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onPrint}
                        className="bg-white hover:bg-emerald-50 text-emerald-950 border-white/80 self-start md:self-auto shrink-0 shadow-sm"
                    >
                        <Download className="w-3.5 h-3.5 text-emerald-700 mr-1.5" />
                        <span>Download Official BEEF Slip</span>
                    </Button>
                ) : isRejected ? (
                    <div className="self-start md:self-auto shrink-0 px-3 py-1.5 rounded-xl bg-rose-950/50 border border-rose-400/30 text-rose-200 text-xs flex items-center gap-2 backdrop-blur-xs">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span className="font-semibold text-[11px]">
                            Returned by Registrar
                        </span>
                    </div>
                ) : (
                    <div className="self-start md:self-auto shrink-0 px-3 py-1.5 rounded-xl bg-black/25 border border-white/10 text-emerald-200 text-xs flex items-center gap-2 backdrop-blur-xs">
                        <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
                        <span className="font-semibold text-[11px]">
                            Under Registrar Review
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
