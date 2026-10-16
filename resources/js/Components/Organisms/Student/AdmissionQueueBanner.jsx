import React from "react";
import { Link } from "@inertiajs/react";
import {
    Ticket,
    Clock,
    AlertCircle,
    ArrowRight,
    ShieldCheck,
    FileCheck2,
    Users,
} from "lucide-react";

export default function AdmissionQueueBanner({ enrollment, queuePosition = 1 }) {
    if (!enrollment || enrollment.status === "APPROVED") {
        return null;
    }

    const trackingNumber = enrollment.tracking_number || "BNHS-2026-Q0001";
    const gradeLevel = enrollment.grade_level?.name || "Grade 7";

    return (
        <div className="rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-emerald-500/10 border-2 border-amber-400/40 p-4 sm:p-5 shadow-md relative overflow-hidden backdrop-blur-xs animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Background Ambient Glow */}
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow-2xs">
                            <Ticket className="w-3.5 h-3.5" />
                            Admission Queue Ticket: {trackingNumber}
                        </span>

                        {queuePosition && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <Users className="w-3 h-3 text-emerald-600" />
                                Queue Position #{queuePosition} in Line
                            </span>
                        )}

                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                            Under Registrar Evaluation
                        </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                        Aplikasyon para sa {gradeLevel} ay Kasalukuyang Nakapila sa Registrar
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                        Naitago nang ligtas ang iyong initial registration sa BNHS portal. Kasalukuyang sinusuri ng Registrar's Office ang iyong DepEd BEEF credentials bago ma-assign ang iyong Section at Class Adviser.
                    </p>
                </div>

                <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2">
                    <Link
                        href="/student/admission"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition cursor-pointer shrink-0"
                    >
                        <span>Tingnan ang BEEF Tracker</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
