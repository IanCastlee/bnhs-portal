import React from "react";
import Button from "@/Components/Atoms/Common/Button";
import {
    Check,
    CheckCircle2,
    Clock,
    Download,
    ArrowLeft,
    Sparkles,
    Info,
    AlertTriangle,
    RefreshCw,
    FileText,
} from "lucide-react";

export default function StepSectioningStatus({
    isApproved,
    queuePosition,
    trackingNo,
    enrollment,
    onBack,
    onPrint,
    onGoToHousehold,
}) {
    const isRejected = enrollment?.status === "REJECTED";
    const remarks = enrollment?.remarks;

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-5 animate-fadeIn">
            {/* Step Header */}
            <div className="pb-3 border-b border-slate-100">
                <div className="flex items-start gap-3">
                    <span
                        className={`w-8 h-8 rounded-xl text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                            isApproved
                                ? "bg-emerald-600"
                                : isRejected
                                ? "bg-rose-600"
                                : "bg-amber-500"
                        }`}
                    >
                        {isApproved ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                        ) : isRejected ? (
                            <AlertTriangle className="w-4 h-4" />
                        ) : (
                            <Clock className="w-4 h-4" />
                        )}
                    </span>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start sm:items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                            <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                                Step 4: Sectioning &amp; Final Enrollment
                            </h3>
                            {isApproved ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] sm:text-xs font-bold shrink-0">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Officially Enrolled ✓
                                </span>
                            ) : isRejected ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] sm:text-xs font-bold border border-rose-200 shrink-0">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                    Returned for Correction
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] sm:text-xs font-bold border border-amber-200 shrink-0">
                                    <Clock className="w-3.5 h-3.5 animate-pulse text-amber-700" />
                                    In Queue (#{queuePosition || 1})
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-relaxed">
                            {isApproved
                                ? "Official section placement and adviser assignment"
                                : isRejected
                                ? "Registrar feedback and action required"
                                : "Registrar verification and queue status"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Details */}
            {isApproved ? (
                /* 🌟 OFFICIALLY ENROLLED VIEW */
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-4">
                    <div className="flex items-start sm:items-center gap-3">
                        <div className="hidden sm:flex w-10 h-10 rounded-xl bg-emerald-600 text-white items-center justify-center shrink-0 shadow-sm">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-black text-emerald-950 text-sm sm:text-base leading-snug">
                                Mabuhay! Opisyal ka nang Enrolled sa Bulusan NHS!
                            </h4>
                            <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                                Na-verify na ng Registrar ang iyong Basic Education Enrollment Record at opisyal na naitalaga sa iyong seksyon.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1 text-xs">
                        <div className="p-3.5 rounded-xl bg-white border border-emerald-200/80 shadow-2xs">
                            <span className="text-emerald-700 font-bold block uppercase text-[10px] tracking-wider">
                                Assigned Section
                            </span>
                            <span className="font-black text-slate-900 text-base block mt-0.5">
                                {enrollment?.section?.name 
                                    ? `${enrollment?.grade_level?.name ? enrollment.grade_level.name + ' - ' : ''}${enrollment.section.name}`
                                    : `${enrollment?.grade_level?.name || 'Grade 8'} (To Be Announced / In Progress)`}
                            </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white border border-emerald-200/80 shadow-2xs">
                            <span className="text-emerald-700 font-bold block uppercase text-[10px] tracking-wider">
                                Section Adviser
                            </span>
                            <span className="font-bold text-slate-900 text-sm block mt-0.5">
                                {enrollment?.section?.adviser?.name || "To Be Assigned by Registrar"}
                            </span>
                        </div>
                    </div>
                </div>
            ) : isRejected ? (
                /* REJECTED / RETURNED VIEW */
                <div className="p-4 sm:p-6 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-rose-600 text-white shrink-0 shadow-xs mt-0.5">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="space-y-2 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-rose-900 bg-rose-200/80 px-2 py-0.5 rounded">
                                    Resubmission Required
                                </span>
                                <span className="text-xs font-mono font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded border border-rose-200">
                                    Ticket: {trackingNo}
                                </span>
                            </div>

                            <h4 className="text-sm sm:text-base font-black text-rose-950 pt-1 leading-snug">
                                Ibinalik ng Registrar ang Iyong Aplikasyon
                            </h4>

                            <p className="text-xs text-rose-900 leading-relaxed">
                                May nakitang kakulangan o kinakailangang pagwawasto sa iyong isinumiteng impormasyon o credentials. Pakiusap suriin ang dahilan sa ibaba:
                            </p>

                            <div className="p-3.5 rounded-xl bg-white border border-rose-200 shadow-2xs">
                                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block">
                                    Dahilan mula sa Registrar Office:
                                </span>
                                <p className="text-xs font-bold text-rose-950 mt-1 italic">
                                    &ldquo;{remarks || 'Pakisuri at kumpletuhin ang mga kulang na detalye sa iyong application.'}&rdquo;
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-rose-200/70">
                        <p className="text-xs text-rose-800">
                            I-click ang button upang iwasto o kumpletuhin ang iyong Household Information (Parent/Guardian at Address).
                        </p>
                        <Button
                            type="button"
                            variant="emerald"
                            size="sm"
                            onClick={onGoToHousehold || onBack}
                            className="w-full sm:w-auto font-bold shadow-sm shrink-0 cursor-pointer"
                        >
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                            <span>I-update ang Household Information</span>
                        </Button>
                    </div>
                </div>
            ) : (
                /* PENDING REGISTRAR REVIEW VIEW */
                <div className="p-4 sm:p-6 rounded-2xl bg-amber-50/60 border border-amber-200/90 space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 shadow-xs mt-0.5">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                                    Application Under Evaluation
                                </span>
                                <span className="text-xs font-mono font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded border border-amber-200">
                                    Queue Ticket: {trackingNo} (Posisyon #{queuePosition || 1})
                                </span>
                            </div>

                            <h4 className="text-sm sm:text-base font-black text-slate-900 pt-1 leading-snug">
                                Kasalukuyang Sinusuri ng School Registrar ang Iyong Aplikasyon
                            </h4>

                            <p className="text-xs text-slate-600 leading-relaxed">
                                Natanggap na ng system ang iyong Basic Education Enrollment Form (BEEF). Kasalukuyan itong bine-beripika ng Registrar Office para sa pagsusuri at pagtatalaga ng iyong <strong>Opisyal na Seksyon</strong> at <strong>Section Adviser</strong>.
                            </p>

                            <div className="pt-2.5 text-xs space-y-1.5 border-t border-amber-200/70 mt-2.5">
                                <p className="flex items-center gap-2 text-emerald-900 font-bold text-[11px]">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>Nai-submit na online ang iyong Basic Education Enrollment Form (Profile at Household Information).</span>
                                </p>
                                <p className="flex items-center gap-2 text-slate-700 font-medium text-[11px]">
                                    <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                                    <span>Ihanda ang physical requirements (Form 138/SF9, PSA copy, Good Moral, 2x2 ID picture) para sa pagsusuri sa Registrar Office.</span>
                                </p>
                                <p className="flex items-center gap-2 text-slate-600 text-[11px]">
                                    <Info className="w-4 h-4 text-amber-700 shrink-0" />
                                    <span>Awtomatikong mag-u-unlock ang iyong Academic Dashboard at magiging available ang <strong>Official BEEF Slip (Annex A)</strong> kapag na-aprubahan na ng Registrar.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Bar */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={onBack}
                    className="w-full sm:w-auto"
                >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    <span>Back: Requirements Guide</span>
                </Button>

                {/* Download Button: Lalabas LAMANG kapag Officially Enrolled na */}
                {isApproved ? (
                    <Button
                        type="button"
                        variant="emerald"
                        size="md"
                        onClick={onPrint}
                        className="w-full sm:w-auto"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        <span>Download Official BEEF Slip (Annex A)</span>
                    </Button>
                ) : isRejected ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 px-4 py-2.5 rounded-xl self-stretch sm:self-auto justify-center border border-rose-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Kailangang iwasto ang impormasyon bago ma-enroll</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-100 px-4 py-2.5 rounded-xl self-stretch sm:self-auto justify-center">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>BEEF Slip Download unlocks upon Registrar Approval</span>
                    </div>
                )}
            </div>
        </div>
    );
}
