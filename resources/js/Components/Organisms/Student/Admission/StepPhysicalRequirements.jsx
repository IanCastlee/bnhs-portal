import React from "react";
import Button from "@/Components/Atoms/Common/Button";
import {
    Check,
    CheckCircle2,
    FileText,
    Printer,
    ArrowRight,
    ArrowLeft,
    Clock,
    School,
    MapPin,
    AlertCircle,
    Calendar,
    Sparkles,
} from "lucide-react";

export default function StepPhysicalRequirements({
    enrollment,
    trackingNo,
    queuePosition,
    isApproved = false,
    onPrintSlip,
    onBack,
    onNext,
}) {
    const isPending = enrollment?.status === "PENDING_REVIEW";

    const requirements = [
        {
            title: "Original Form 138 / SF9 (Report Card)",
            description:
                "Final Grade 6 Report Card (for Grade 7) or Latest Report Card with Principal's signature and eligibility for admission.",
            badge: "Mandatory Original",
            color: "emerald",
        },
        {
            title: "PSA Birth Certificate (Photocopy)",
            description:
                "Clear PSA-authenticated copy (o NSO birth certificate kung wala pa ang PSA).",
            badge: "Required",
            color: "blue",
        },
        {
            title: "Certificate of Good Moral Character",
            description:
                "Issued by the Elementary School Principal or Guidance Counselor.",
            badge: "Required",
            color: "amber",
        },
        {
            title: "2x2 Recent ID Picture (2 Copies)",
            description:
                "White background with learner name tag (DepEd standard).",
            badge: "Required",
            color: "purple",
        },
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-6 shadow-xs space-y-6 animate-fadeIn">
            {/* Step Header */}
            <div className="pb-4 border-b border-slate-100 flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    3
                </span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                        <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                            Step 3: Onsite Document Verification Guide
                        </h3>
                        <span className="text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 shrink-0">
                            Onsite Submission (Hard Copy)
                        </span>
                    </div>
                </div>
            </div>

            {/* 📋 Official Confirmation Slip Callout */}
            <div className="bg-gradient-to-r from-emerald-900 to-[#0f4c3a] text-white p-4 sm:p-5 rounded-2xl shadow-md relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative z-10 space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                            Admission Ticket #{trackingNo}
                        </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-black tracking-tight">
                        I-print o I-save ang Iyong Pre-Admission Slip
                    </h4>
                    <p className="text-emerald-100/90 text-xs max-w-xl leading-relaxed">
                        Ipakita ang slip na ito o ang iyong Ticket Number sa
                        Registrar pagdating mo sa paaralan upang mabilis na
                        mai-verify ang iyong mga dokumento.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onPrintSlip}
                    className="relative z-10 shrink-0 px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                    <Printer className="w-4 h-4 text-emerald-700" />
                    <span>Print Admission Slip</span>
                </button>
            </div>

            {/* 🗂️ Checklist of Documents to Bring */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    Mga Dokumentong Dadalhin sa Bulusan NHS:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {requirements.map((req, idx) => (
                        <div
                            key={idx}
                            className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition-all flex items-start gap-3 group"
                        >
                            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition">
                                {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center justify-between gap-1">
                                    <h5 className="text-xs font-black text-slate-900 group-hover:text-emerald-800 transition">
                                        {req.title}
                                    </h5>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 shrink-0">
                                        {req.badge}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-normal">
                                    {req.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 📍 Office Hours & Location Notice */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 text-amber-950 text-xs flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="font-bold text-amber-900">
                        Saan at Kailan Magsu-submit?
                    </p>
                    <p className="text-[11px] text-amber-800/90 leading-relaxed">
                        <strong>
                            Bulusan National High School - Office of the School
                            Registrar
                        </strong>
                        <br />
                        Lunes hanggang Biyernes:{" "}
                        <strong>8:00 AM – 5:00 PM</strong> (Maliban kung
                        pista-opisyal). Pagkatapos mai-abot ang mga papeles,
                        agad na ia-apruba ng Registrar ang iyong rekord sa
                        sistema.
                    </p>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-stretch sm:items-center gap-3 pt-4 border-t border-slate-100">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="flex items-center justify-center gap-2 text-xs font-bold py-3.5 px-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </Button>

                <Button
                    type="button"
                    onClick={onNext}
                    className="flex items-center justify-center gap-2 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs py-3.5 px-4 w-full"
                >
                    <span>Enrollment Status</span>
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
