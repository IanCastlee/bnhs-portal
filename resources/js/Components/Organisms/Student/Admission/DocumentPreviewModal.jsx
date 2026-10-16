import React, { useState } from "react";
import Button from "@/Components/Atoms/Button";
import {
    X,
    ZoomIn,
    ZoomOut,
    RotateCw,
    RefreshCw,
    ExternalLink,
    FileText,
    CheckCircle2,
    Shield,
} from "lucide-react";

export default function DocumentPreviewModal({ previewDoc, enrollmentId, onClose }) {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);

    if (!previewDoc) return null;

    const cacheBuster = previewDoc.uploaded_at ? new Date(previewDoc.uploaded_at).getTime() : Date.now();
    const docUrl = previewDoc.url || (enrollmentId && previewDoc.type ? `/documents/${enrollmentId}/${previewDoc.type}?v=${cacheBuster}` : previewDoc.file_path);
    const isPdf = previewDoc.resource_type === "raw" || (previewDoc.format || "").toLowerCase() === "pdf" || (previewDoc.file_name || previewDoc.file_path || "").toLowerCase().endsWith(".pdf");

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
    const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
    const handleReset = () => {
        setZoom(1);
        setRotation(0);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                    <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                                <Shield className="w-3 h-3 text-emerald-700" />
                                <span>Private &amp; Verified</span>
                            </span>
                            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                                {previewDoc.file_size}
                            </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 truncate mt-0.5">
                            {previewDoc.name || previewDoc.file_name || "Document Preview"}
                        </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        {docUrl && (
                            <a
                                href={docUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                                title="Open in new window (Authenticated)"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Toolbar for image controls */}
                {!isPdf && (
                    <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs shrink-0">
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handleZoomOut}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                                title="Zoom Out"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="text-[11px] font-mono font-bold text-slate-700 px-1.5 min-w-12 text-center">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button
                                type="button"
                                onClick={handleZoomIn}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                                title="Zoom In"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
                            <div className="h-4 w-px bg-slate-300 mx-1" />
                            <button
                                type="button"
                                onClick={handleRotate}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                                title="Rotate 90°"
                            >
                                <RotateCw className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                                title="Reset Zoom & Rotation"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                            Tingnan kung malinaw at nababasa ang kopya
                        </span>
                    </div>
                )}

                {/* Document Display Area */}
                <div className="flex-1 min-h-[300px] max-h-[60vh] overflow-auto flex items-center justify-center bg-slate-950/5 rounded-2xl p-3 border border-slate-200/60">
                    {isPdf ? (
                        <iframe
                            src={docUrl}
                            className="w-full h-full min-h-[450px] rounded-xl border-0 shadow-xs"
                            title={previewDoc.name || "PDF Preview"}
                        />
                    ) : (
                        <div className="overflow-auto max-w-full max-h-full flex items-center justify-center p-2">
                            <img
                                src={docUrl}
                                alt={previewDoc.name || "Preview"}
                                style={{
                                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                    transition: "transform 0.15s ease-out",
                                }}
                                className="max-h-[55vh] object-contain rounded-xl shadow-md select-none"
                            />
                        </div>
                    )}
                </div>

                {/* Footer confirmation */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Dokumento ay protektado sa ilalim ng Data Privacy</span>
                    </div>
                    <Button
                        type="button"
                        variant="emerald"
                        size="sm"
                        onClick={onClose}
                        className="font-bold text-xs"
                    >
                        Naintindihan / Isara
                    </Button>
                </div>
            </div>
        </div>
    );
}
