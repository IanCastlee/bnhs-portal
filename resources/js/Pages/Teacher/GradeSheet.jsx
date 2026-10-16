import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Card from "@/Components/Atoms/Common/Card";
import Badge from "@/Components/Atoms/Common/Badge";
import Button from "@/Components/Atoms/Common/Button";
import {
    FileSpreadsheet,
    ArrowLeft,
    Save,
    Send,
    CheckCircle2,
    AlertCircle,
    Info,
    HelpCircle,
    Calculator,
    Sparkles,
} from "lucide-react";

export default function GradeSheet({
    section,
    subject,
    activeYear,
    gradeSheetRows = [],
}) {
    // Local editable state for grade inputs
    const [rows, setRows] = useState(gradeSheetRows);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTransmutationModal, setShowTransmutationModal] = useState(false);

    // Compute row final grade in real-time
    const handleGradeChange = (studentId, quarter, value) => {
        const numValue = value === "" ? "" : parseFloat(value);
        if (numValue !== "" && (isNaN(numValue) || numValue < 0 || numValue > 100)) {
            return; // Reject invalid range
        }

        setRows((prev) =>
            prev.map((r) => {
                if (r.student_id !== studentId) return r;

                const updated = { ...r, [quarter]: numValue };
                const quarters = [updated.q1, updated.q2, updated.q3, updated.q4].filter(
                    (q) => q !== "" && q !== null && !isNaN(q)
                );

                if (quarters.length > 0) {
                    const avg = quarters.reduce((a, b) => a + b, 0) / quarters.length;
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

    // Save grades as DRAFT
    const handleSaveDraft = (e) => {
        e.preventDefault();
        setIsSaving(true);

        const payload = rows.map((r) => ({
            student_id: r.student_id,
            q1: r.q1 === "" ? null : r.q1,
            q2: r.q2 === "" ? null : r.q2,
            q3: r.q3 === "" ? null : r.q3,
            q4: r.q4 === "" ? null : r.q4,
        }));

        router.post(
            `/teacher/sections/${section.id}/subjects/${subject.id}/grades/save`,
            { grades: payload },
            {
                preserveScroll: true,
                onSuccess: () => setIsSaving(false),
                onError: () => setIsSaving(false),
            }
        );
    };

    // Submit grades to Adviser / Registrar
    const handleSubmitGrades = (targetStatus) => {
        if (!confirm(`Are you sure you want to submit this grade sheet as ${targetStatus}?`)) {
            return;
        }

        setIsSubmitting(true);
        router.post(
            `/teacher/sections/${section.id}/subjects/${subject.id}/grades/submit`,
            { target_status: targetStatus },
            {
                preserveScroll: true,
                onSuccess: () => setIsSubmitting(false),
                onError: () => setIsSubmitting(false),
            }
        );
    };

    return (
        <PortalLayout title="Electronic Grade Sheet (DO 8, s. 2015)">
            <Head title={`Grades: ${subject.name} - ${section.name}`} />

            <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Link href="/teacher/dashboard">
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

                    <div className="flex flex-wrap items-center gap-2.5">
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
                    </div>
                </div>

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

                                            {/* Q1 Input */}
                                            <td className="py-2.5 px-2 text-center">
                                                <input
                                                    type="number"
                                                    min="50"
                                                    max="100"
                                                    step="0.01"
                                                    placeholder="--"
                                                    value={row.q1 ?? ""}
                                                    onChange={(e) => handleGradeChange(row.student_id, "q1", e.target.value)}
                                                    className="w-18 text-center text-xs font-mono font-bold rounded-lg border border-slate-300 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                                />
                                            </td>

                                            {/* Q2 Input */}
                                            <td className="py-2.5 px-2 text-center">
                                                <input
                                                    type="number"
                                                    min="50"
                                                    max="100"
                                                    step="0.01"
                                                    placeholder="--"
                                                    value={row.q2 ?? ""}
                                                    onChange={(e) => handleGradeChange(row.student_id, "q2", e.target.value)}
                                                    className="w-18 text-center text-xs font-mono font-bold rounded-lg border border-slate-300 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                                />
                                            </td>

                                            {/* Q3 Input */}
                                            <td className="py-2.5 px-2 text-center">
                                                <input
                                                    type="number"
                                                    min="50"
                                                    max="100"
                                                    step="0.01"
                                                    placeholder="--"
                                                    value={row.q3 ?? ""}
                                                    onChange={(e) => handleGradeChange(row.student_id, "q3", e.target.value)}
                                                    className="w-18 text-center text-xs font-mono font-bold rounded-lg border border-slate-300 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                                />
                                            </td>

                                            {/* Q4 Input */}
                                            <td className="py-2.5 px-2 text-center">
                                                <input
                                                    type="number"
                                                    min="50"
                                                    max="100"
                                                    step="0.01"
                                                    placeholder="--"
                                                    value={row.q4 ?? ""}
                                                    onChange={(e) => handleGradeChange(row.student_id, "q4", e.target.value)}
                                                    className="w-18 text-center text-xs font-mono font-bold rounded-lg border border-slate-300 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                                />
                                            </td>

                                            {/* Computed Final Grade */}
                                            <td className="py-3 px-3 text-center bg-slate-100/60 font-mono font-black text-sm text-slate-900">
                                                {row.final_grade !== null ? row.final_grade.toFixed(2) : "--"}
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
                                                    {row.status}
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
