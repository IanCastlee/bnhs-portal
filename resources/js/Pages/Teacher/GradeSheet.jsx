import React, { useState, useRef, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Card from "@/Components/Atoms/Common/Card";
import Button from "@/Components/Atoms/Common/Button";
import { toast } from "@/Context/ToastContext";
import {
    FileSpreadsheet,
    ArrowLeft,
    Save,
    Send,
    CheckCircle2,
    AlertCircle,
    Calculator,
    Upload,
    Download,
    Lock,
    RotateCcw,
    ShieldCheck,
} from "lucide-react";

export default function GradeSheet({
    section,
    subject,
    activeYear,
    gradeSheetRows = [],
    sheetStatus = "DRAFT",
    isAdviser = false,
}) {
    const [rows, setRows] = useState(gradeSheetRows);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importNotice, setImportNotice] = useState(null);
    const [showTransmutationModal, setShowTransmutationModal] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setRows(gradeSheetRows);
    }, [gradeSheetRows]);

    const isLocked = sheetStatus !== "DRAFT";

    // Compute row final grade in real-time
    const handleGradeChange = (studentId, quarter, value) => {
        if (isLocked) return;

        const numValue = value === "" ? "" : parseFloat(value);
        if (numValue !== "" && (isNaN(numValue) || numValue < 0 || numValue > 100)) {
            return;
        }

        setRows((prev) =>
            prev.map((r) => {
                if (r.student_id !== studentId) return r;

                const updated = { ...r, [quarter]: numValue };
                const quarters = [updated.q1, updated.q2, updated.q3, updated.q4].filter(
                    (q) => q !== "" && q !== null && !isNaN(q)
                );

                if (quarters.length > 0) {
                    const avg = quarters.reduce((a, b) => a + Number(b), 0) / quarters.length;
                    updated.final_grade = parseFloat(avg.toFixed(2));
                    updated.remarks = updated.final_grade >= 75.0 ? "PASSED" : "FAILED";
                } else {
                    updated.final_grade = null;
                    updated.remarks = "PENDING";
                }

                return updated;
            })
        );
    };

    // Download pre-filled Excel/CSV template for this section & subject
    const handleDownloadTemplate = () => {
        const headers = ["LRN", "Student Name", "Gender", "Q1", "Q2", "Q3", "Q4", "Final Grade", "Remarks"];
        const csvLines = [
            headers.join(","),
            ...rows.map((r) => {
                const safeName = `"${String(r.name || "").replace(/"/g, '""')}"`;
                const safeLrn = `"${String(r.lrn || "")}"`;
                return [
                    safeLrn,
                    safeName,
                    r.gender || "",
                    r.q1 ?? "",
                    r.q2 ?? "",
                    r.q3 ?? "",
                    r.q4 ?? "",
                    r.final_grade ?? "",
                    r.remarks || "PENDING",
                ].join(",");
            }),
        ];

        // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel opens it properly
        const blob = new Blob(["\uFEFF" + csvLines.join("\r\n")], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
            "download",
            `GradeSheet_${section.name}_${subject.code}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Upload Excel (.xlsx / .csv) file and convert text/cells into grade numbers
    const handleExcelUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setImportNotice(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch(
                `/teacher/sections/${section.id}/subjects/${subject.id}/grades/parse-excel`,
                {
                    method: "POST",
                    headers: {
                        "X-CSRF-TOKEN": csrfToken,
                        Accept: "application/json",
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                const errMsg = data.message || "Failed to parse the uploaded Excel file.";
                setImportNotice({
                    type: "error",
                    text: errMsg,
                });
                toast.error(errMsg);
                return;
            }

            const importedById = {};
            (data.rows || []).forEach((item) => {
                importedById[item.student_id] = item;
            });

            setRows((prev) =>
                prev.map((row) => {
                    const matched = importedById[row.student_id];
                    if (!matched) return row;

                    return {
                        ...row,
                        q1: matched.q1 ?? row.q1,
                        q2: matched.q2 ?? row.q2,
                        q3: matched.q3 ?? row.q3,
                        q4: matched.q4 ?? row.q4,
                        final_grade: matched.final_grade ?? row.final_grade,
                        remarks: matched.remarks ?? row.remarks,
                    };
                })
            );

            const successText = `Successfully imported and converted grades for ${data.matchedCount} out of ${data.totalEnrolled} students from "${file.name}". Review the numbers below and click Save Draft or Submit to Adviser.`;
            setImportNotice({
                type: "success",
                text: successText,
            });
            toast.success(`Na-import na ang marka ng ${data.matchedCount} mag-aaral mula sa "${file.name}"!`);
        } catch (err) {
            const fallbackErr = "An unexpected error occurred while reading the Excel file.";
            setImportNotice({
                type: "error",
                text: fallbackErr,
            });
            toast.error(fallbackErr);
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const buildGradesPayload = () =>
        rows.map((r) => ({
            student_id: r.student_id,
            q1: r.q1 === "" || r.q1 === null ? null : Number(r.q1),
            q2: r.q2 === "" || r.q2 === null ? null : Number(r.q2),
            q3: r.q3 === "" || r.q3 === null ? null : Number(r.q3),
            q4: r.q4 === "" || r.q4 === null ? null : Number(r.q4),
        }));

    // Save grades as DRAFT
    const handleSaveDraft = (e) => {
        e.preventDefault();
        if (isLocked) return;

        setIsSaving(true);
        router.post(
            `/teacher/sections/${section.id}/subjects/${subject.id}/grades/save`,
            { grades: buildGradesPayload() },
            {
                preserveScroll: true,
                onFinish: () => setIsSaving(false),
            }
        );
    };

    // Advance or return workflow status (Teacher -> Adviser -> Registrar)
    const handleSubmitGrades = (targetStatus) => {
        const labels = {
            SUBMITTED_TO_ADVISER: "Submit this grade sheet to the Class Adviser for review?",
            SUBMITTED_TO_REGISTRAR: "Approve and forward this grade sheet to the Registrar for official publication?",
            DRAFT: "Return this grade sheet to the Subject Teacher (unlock Draft)?",
        };

        if (!confirm(labels[targetStatus] || `Change status to ${targetStatus}?`)) {
            return;
        }

        setIsSubmitting(true);
        const payload = {
            target_status: targetStatus,
        };

        if (targetStatus === "SUBMITTED_TO_ADVISER") {
            payload.grades = buildGradesPayload();
        }

        router.post(
            `/teacher/sections/${section.id}/subjects/${subject.id}/grades/submit`,
            payload,
            {
                preserveScroll: true,
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const steps = [
        { key: "DRAFT", label: "1. Subject Teacher (Draft)" },
        { key: "SUBMITTED_TO_ADVISER", label: "2. Class Adviser Review" },
        { key: "SUBMITTED_TO_REGISTRAR", label: "3. Registrar Approval" },
        { key: "PUBLISHED", label: "4. Published to Students" },
    ];
    const currentStepIdx = Math.max(
        0,
        steps.findIndex((s) => s.key === sheetStatus)
    );

    return (
        <PortalLayout title="Electronic Grade Sheet (DO 8, s. 2015)">
            <Head title={`Grades: ${subject.name} - ${section.name}`} />

            <div className="space-y-5">
                {/* 3-Step Workflow Stepper Banner */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            {steps.map((step, idx) => {
                                const isActive = idx === currentStepIdx;
                                const isCompleted = idx < currentStepIdx;
                                return (
                                    <div key={step.key} className="flex items-center gap-2">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border transition-all ${
                                                isActive
                                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                                    : isCompleted
                                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                                    : "bg-slate-50 text-slate-400 border-slate-200"
                                            }`}
                                        >
                                            {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                                            {step.label}
                                        </span>
                                        {idx < steps.length - 1 && (
                                            <span className="text-slate-300 font-bold text-xs">&rarr;</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {isLocked && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                                <Lock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Inputs Locked ({sheetStatus.replaceAll("_", " ")})</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Header & Action Bar */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Link href={isAdviser ? "/teacher/advisory" : "/teacher/dashboard"}>
                                <Button variant="ghost" size="sm" className="p-1.5 h-auto text-slate-500">
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                            </Link>
                            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {subject.code}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">
                                S.Y. {activeYear.name} ({activeYear.semester})
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                            {subject.name} &bull; Section {section.name}
                        </h2>
                        <p className="text-xs text-slate-500">
                            Class Adviser: <strong>{section.adviser?.name || "Unassigned"}</strong> &bull; Total Students: <strong>{rows.length}</strong>
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Hidden File Input for Excel (.xlsx / .csv) */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.csv,.txt,.tsv"
                            onChange={handleExcelUpload}
                            className="hidden"
                        />

                        <Button
                            type="button"
                            variant="outline"
                            size="md"
                            onClick={handleDownloadTemplate}
                            disabled={rows.length === 0}
                            className="text-xs"
                        >
                            <Download className="w-4 h-4 mr-1.5 text-slate-600" />
                            <span>Download Excel Template</span>
                        </Button>

                        {!isLocked && (
                            <Button
                                type="button"
                                variant="outline"
                                size="md"
                                loading={isImporting}
                                disabled={isImporting || rows.length === 0}
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-bold"
                            >
                                <Upload className="w-4 h-4 mr-1.5 text-emerald-600" />
                                <span>Import Excel (.xlsx / .csv)</span>
                            </Button>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            size="md"
                            onClick={() => setShowTransmutationModal(true)}
                            className="text-xs"
                        >
                            <Calculator className="w-4 h-4 mr-1.5 text-emerald-600" />
                            <span>Transmutation Guide</span>
                        </Button>

                        {!isLocked && (
                            <>
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="md"
                                    loading={isSaving}
                                    disabled={isSaving || rows.length === 0}
                                    onClick={handleSaveDraft}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
                                >
                                    <Save className="w-4 h-4 mr-1.5" />
                                    <span>Save Draft</span>
                                </Button>

                                <Button
                                    type="button"
                                    variant="dark"
                                    size="md"
                                    loading={isSubmitting}
                                    disabled={isSubmitting || rows.length === 0}
                                    onClick={() => handleSubmitGrades("SUBMITTED_TO_ADVISER")}
                                    className="bg-slate-900 hover:bg-black text-white text-xs font-bold"
                                >
                                    <Send className="w-4 h-4 mr-1.5 text-emerald-400" />
                                    <span>Submit to Adviser</span>
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Class Adviser Review Action Panel (Shown when status is SUBMITTED_TO_ADVISER and logged-in teacher is the Class Adviser) */}
                {isAdviser && sheetStatus === "SUBMITTED_TO_ADVISER" && (
                    <div className="bg-teal-900 text-white rounded-2xl p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-white/15 px-2.5 py-0.5 rounded-full text-teal-200">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Class Adviser Verification Required
                            </span>
                            <h3 className="text-base font-black">
                                Review Subject Grade Sheet for Section {section.name}
                            </h3>
                            <p className="text-xs text-teal-100">
                                Check if all quarterly marks are complete and accurate. Approve to forward to the Registrar, or return to the Subject Teacher for corrections.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            <Button
                                type="button"
                                variant="outline"
                                size="md"
                                loading={isSubmitting}
                                onClick={() => handleSubmitGrades("DRAFT")}
                                className="bg-white/10 border-white/25 text-white hover:bg-white/20 text-xs font-bold"
                            >
                                <RotateCcw className="w-4 h-4 mr-1.5" />
                                <span>Return to Subject Teacher</span>
                            </Button>
                            <Button
                                type="button"
                                variant="emerald"
                                size="md"
                                loading={isSubmitting}
                                onClick={() => handleSubmitGrades("SUBMITTED_TO_REGISTRAR")}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black border-0"
                            >
                                <Send className="w-4 h-4 mr-1.5" />
                                <span>Approve & Forward to Registrar</span>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Excel Import Feedback Banner */}
                {importNotice && (
                    <div
                        className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 ${
                            importNotice.type === "success"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                : "bg-rose-50 border-rose-200 text-rose-900"
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            {importNotice.type === "success" ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                            <span>{importNotice.text}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setImportNotice(null)}
                            className="text-slate-400 hover:text-slate-700 font-bold"
                        >
                            &times;
                        </button>
                    </div>
                )}

                {/* Main Grade Sheet Table */}
                <Card className="rounded-2xl border border-slate-200/80 p-0 overflow-hidden bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
                                    <th className="py-3.5 px-4">#</th>
                                    <th className="py-3.5 px-4">Student Name</th>
                                    <th className="py-3.5 px-4">LRN</th>
                                    <th className="py-3.5 px-3 text-center w-24">Q1 (1st)</th>
                                    <th className="py-3.5 px-3 text-center w-24">Q2 (2nd)</th>
                                    <th className="py-3.5 px-3 text-center w-24">Q3 (3rd)</th>
                                    <th className="py-3.5 px-3 text-center w-24">Q4 (4th)</th>
                                    <th className="py-3.5 px-3 text-center w-28 bg-slate-100/60 font-black text-slate-800">
                                        Final Grade
                                    </th>
                                    <th className="py-3.5 px-4 text-center">Remarks</th>
                                    <th className="py-3.5 px-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-800">
                                {rows.length > 0 ? (
                                    rows.map((row, idx) => (
                                        <tr key={row.student_id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3 px-4 font-mono text-slate-400 font-bold">
                                                {idx + 1}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-slate-900">
                                                {row.name}
                                                <span className="block text-[10px] text-slate-400 font-normal">
                                                    {row.gender}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                                                {row.lrn}
                                            </td>

                                            {["q1", "q2", "q3", "q4"].map((qKey) => (
                                                <td key={qKey} className="py-2.5 px-2 text-center">
                                                    <input
                                                        type="number"
                                                        min="50"
                                                        max="100"
                                                        step="0.01"
                                                        placeholder="--"
                                                        readOnly={isLocked}
                                                        disabled={isLocked}
                                                        value={row[qKey] ?? ""}
                                                        onChange={(e) =>
                                                            handleGradeChange(row.student_id, qKey, e.target.value)
                                                        }
                                                        className={`w-18 text-center text-xs font-mono font-bold rounded-lg border py-1.5 ${
                                                            isLocked
                                                                ? "bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed"
                                                                : "bg-white border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                        }`}
                                                    />
                                                </td>
                                            ))}

                                            {/* Computed Final Grade */}
                                            <td className="py-3 px-3 text-center bg-slate-100/60 font-mono font-black text-sm text-slate-900">
                                                {row.final_grade !== null && row.final_grade !== undefined
                                                    ? Number(row.final_grade).toFixed(2)
                                                    : "--"}
                                            </td>

                                            {/* Remarks */}
                                            <td className="py-3 px-4 text-center">
                                                {row.remarks === "PASSED" ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        PASSED
                                                    </span>
                                                ) : row.remarks === "FAILED" ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                                                        FAILED
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-[11px] font-medium">Pending</span>
                                                )}
                                            </td>

                                            {/* Submission Status */}
                                            <td className="py-3 px-4 text-center">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                                    {sheetStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="py-12 text-center text-slate-400">
                                            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                            <p className="font-bold text-sm">No officially enrolled students in this section yet.</p>
                                            <p className="text-xs mt-0.5">Students will automatically appear here once approved by the Registrar.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* DepEd Transmutation Table Guide Modal */}
            {showTransmutationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="font-black text-slate-900 text-base">
                                DepEd Order No. 8, s. 2015 Transmutation Standards
                            </h3>
                            <button
                                onClick={() => setShowTransmutationModal(false)}
                                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="space-y-3 text-xs text-slate-600">
                            <p>
                                The grading system is standard- and competence-based. Minimum passing grade for any learning area is <strong>75.00</strong> (transmuted from 60.00% initial grade).
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-slate-800 font-mono text-[11px]">
                                <div className="p-2.5 rounded-lg bg-slate-50 border">90.00 - 100.00: Outstanding (O)</div>
                                <div className="p-2.5 rounded-lg bg-slate-50 border">85.00 - 89.99: Very Satisfactory (VS)</div>
                                <div className="p-2.5 rounded-lg bg-slate-50 border">80.00 - 84.99: Satisfactory (S)</div>
                                <div className="p-2.5 rounded-lg bg-slate-50 border">75.00 - 79.99: Fairly Satisfactory (FS)</div>
                                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 col-span-2">
                                    Below 75.00: Did Not Meet Expectations (DNME) - Requires Remediation
                                </div>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="md"
                            onClick={() => setShowTransmutationModal(false)}
                            className="w-full justify-center"
                        >
                            Close Guide
                        </Button>
                    </div>
                </div>
            )}
        </PortalLayout>
    );
}
