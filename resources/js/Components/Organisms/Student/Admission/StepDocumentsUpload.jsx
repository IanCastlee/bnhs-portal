import React from "react";
import Button from "@/Components/Atoms/Button";
import {
    Check,
    CheckCircle2,
    FileText,
    Eye,
    Upload,
    Loader2,
    ArrowRight,
    ArrowLeft,
    AlertCircle,
    X,
    Lock,
} from "lucide-react";

export default function StepDocumentsUpload({
    enrollmentId,
    docSlots,
    uploadedDocsCount,
    isStep3Complete,
    getUploadedDoc,
    uploadingType,
    uploadProgress,
    uploadError,
    isApproved = false,
    onDismissError,
    onFileUpload,
    onPreviewDoc,
    onBack,
    onNext,
}) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5 animate-fadeIn">
            {/* Step Header */}
            <div className="pb-3 border-b border-slate-100">
                <div className="flex items-start gap-3">
                    <span
                        className={`w-8 h-8 rounded-xl text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                            isStep3Complete ? "bg-emerald-600" : "bg-amber-500"
                        }`}
                    >
                        {isStep3Complete ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                            "3"
                        )}
                    </span>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start sm:items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                            <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                                Step 3: Mandatory Admission Credentials
                            </h3>
                            <span className="text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg border border-emerald-200 shrink-0">
                                {uploadedDocsCount} of 4 Uploaded
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Paki-upload ang malinaw na kopya o litrato ng mga dokumento (JPG, PNG, WEBP, o PDF hanggang 10MB).
                        </p>
                    </div>
                </div>
            </div>

            {/* 🔒 Approved / Documents Locked Notice */}
            {isApproved && (
                <div className="p-3.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs text-slate-800 flex items-start gap-2.5 animate-fadeIn">
                    <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold text-slate-900">Mga Dokumento ay Naka-lock at Na-verify Na:</span>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                            Opisyal nang tinanggap at na-verify ng Registrar ang iyong mga dokumento para sa kasalukuyang School Year. Bawal na itong baguhin o i-reupload.
                        </p>
                    </div>
                </div>
            )}

            {/* 🛑 Upload Error Alert Notification */}
            {uploadError && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start justify-between gap-3 animate-fadeIn">
                    <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-rose-900 text-xs sm:text-sm">Bawal o Hindi Suportadong File</p>
                            <p className="text-[11px] sm:text-xs text-rose-700 mt-0.5 leading-relaxed">
                                {uploadError}
                            </p>
                        </div>
                    </div>
                    {onDismissError && (
                        <button
                            type="button"
                            onClick={onDismissError}
                            className="text-rose-400 hover:text-rose-700 cursor-pointer p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            {/* Document Upload Slots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {docSlots.map((slot) => {
                    const existingDoc = getUploadedDoc(slot.type);
                    const isCurrentlyUploading = uploadingType === slot.type;

                    return (
                        <div
                            key={slot.type}
                            className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                                existingDoc
                                    ? "border-emerald-200 bg-emerald-50/30 hover:border-emerald-300"
                                    : "border-dashed border-slate-300 bg-slate-50/50 hover:border-emerald-400 hover:bg-white"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                                    {/* Thumbnail Preview / Icon */}
                                    {existingDoc && (existingDoc.file_path || existingDoc.public_id || enrollmentId) && !existingDoc.file_name?.toLowerCase().endsWith(".pdf") && !existingDoc.file_path?.toLowerCase().endsWith(".pdf") ? (
                                        <button
                                            type="button"
                                            onClick={() => onPreviewDoc(existingDoc)}
                                            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 border-emerald-300 shadow-xs group shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                            title="Pindutin para makita ang buong preview"
                                        >
                                            <img
                                                src={enrollmentId ? `/documents/${enrollmentId}/${slot.type}?v=${existingDoc.uploaded_at ? new Date(existingDoc.uploaded_at).getTime() : Date.now()}` : (existingDoc.file_path || existingDoc.url)}
                                                alt={existingDoc.name || "Preview"}
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-200"
                                            />
                                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 flex items-center justify-center text-white opacity-90 transition">
                                                <Eye className="w-4 h-4" />
                                            </div>
                                        </button>
                                    ) : (
                                        <div
                                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                existingDoc
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-slate-200/80 text-slate-600"
                                            }`}
                                        >
                                            {existingDoc ? (
                                                <Check className="w-4 h-4 font-black" />
                                            ) : (
                                                <FileText className="w-4 h-4" />
                                            )}
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                            {slot.title}
                                        </h4>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                            {slot.desc}
                                        </p>

                                        {/* Allowed Formats Badge */}
                                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                            <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded border leading-none ${
                                                slot.type === 'id_photo'
                                                    ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                                                    : 'bg-slate-50 text-slate-500 border-slate-200'
                                            }`}>
                                                Formats: {slot.formatLabel || "PDF, JPG, PNG, WEBP"}
                                            </span>
                                        </div>

                                        {existingDoc && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded font-semibold truncate max-w-[140px]">
                                                    {existingDoc.file_name}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                    {existingDoc.file_size}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Bar */}
                            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2 flex-wrap">
                                <div className="text-[11px]">
                                    {isCurrentlyUploading ? (
                                        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            {uploadProgress || "Uploading..."}
                                        </span>
                                    ) : existingDoc ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            {isApproved ? "Verified by Registrar" : (existingDoc.status || "Uploaded")}
                                        </span>
                                    ) : (
                                        <span className="text-amber-700 font-semibold text-[11px]">
                                            Required
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {existingDoc && (existingDoc.file_path || existingDoc.public_id || enrollmentId) && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="xs"
                                            onClick={() => onPreviewDoc(existingDoc)}
                                            className="gap-1 text-xs text-emerald-800 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 font-bold"
                                            title="Pindutin para makita ang litrato/dokumentong na-upload"
                                        >
                                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>View Preview</span>
                                        </Button>
                                    )}

                                    {!isApproved && (
                                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs shadow-xs transition shrink-0">
                                            <Upload className="w-3.5 h-3.5" />
                                            <span>
                                                {existingDoc ? "Re-upload" : "Choose File"}
                                            </span>
                                            <input
                                                type="file"
                                                accept={slot.accept}
                                                className="hidden"
                                                disabled={isCurrentlyUploading}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) onFileUpload(slot.type, file);
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Navigation: Responsive Back + Next using reusable Button */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={onBack}
                    className="w-full sm:w-auto"
                >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    <span>Back: Household</span>
                </Button>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                    {!isStep3Complete && (
                        <div className="text-[11px] sm:text-xs text-amber-700 font-semibold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/80 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Kailangang mai-upload ang 4/4 na dokumento ({uploadedDocsCount}/4 pa lamang)</span>
                        </div>
                    )}

                    <Button
                        type="button"
                        variant={isStep3Complete ? "emerald" : "outline"}
                        size="md"
                        disabled={!isStep3Complete || Boolean(uploadingType)}
                        onClick={isStep3Complete ? onNext : undefined}
                        className={`w-full sm:w-auto font-bold transition ${
                            !isStep3Complete
                                ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200"
                                : "shadow-md hover:shadow-lg"
                        }`}
                        title={
                            !isStep3Complete
                                ? "Paki-upload muna ang 4 na dokumento bago mag-next."
                                : "Magpatuloy sa Sectioning Status"
                        }
                    >
                        <span>Next: Sectioning Status</span>
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
