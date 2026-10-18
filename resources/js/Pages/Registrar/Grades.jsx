import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Card from "@/Components/Atoms/Common/Card";
import Button from "@/Components/Atoms/Common/Button";
import {
    FileSpreadsheet,
    CheckCircle2,
    RotateCcw,
    Eye,
    Search,
    ShieldCheck,
    AlertCircle,
    Send,
    X,
} from "lucide-react";

export default function RegistrarGrades({
    gradeSheets = [],
    counts = {},
    gradeLevels = [],
    selectedYear = null,
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || "");
    const [gradeLevelId, setGradeLevelId] = useState(filters.grade_level_id || "");
    const [activeTab, setActiveTab] = useState(filters.status || "SUBMITTED_TO_REGISTRAR");
    const [processingKey, setProcessingKey] = useState(null);
    const [inspectSheet, setInspectSheet] = useState(null);

    const applyFilters = (nextStatus = activeTab, nextGradeLevel = gradeLevelId, nextSearch = search) => {
        router.get(
            "/registrar/grades",
            {
                status: nextStatus,
                grade_level_id: nextGradeLevel || undefined,
                search: nextSearch || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleTabChange = (statusKey) => {
        setActiveTab(statusKey);
        applyFilters(statusKey, gradeLevelId, search);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters(activeTab, gradeLevelId, search);
    };

    const handleUpdateStatus = (sheet, targetStatus) => {
        const prompts = {
            PUBLISHED: `Publish grades for ${sheet.subject_code} (Section ${sheet.section_name})? Students will immediately see these grades on their SF9 Report Card.`,
            SUBMITTED_TO_ADVISER: `Return ${sheet.subject_code} (Section ${sheet.section_name}) to the Class Adviser?`,
            DRAFT: `Return ${sheet.subject_code} (Section ${sheet.section_name}) directly to the Subject Teacher (Draft)?`,
        };

        if (!confirm(prompts[targetStatus] || `Update status to ${targetStatus}?`)) {
            return;
        }

        const key = `${sheet.key}_${targetStatus}`;
        setProcessingKey(key);

        router.post(
            `/registrar/grades/${sheet.section_id}/${sheet.subject_id}/status`,
            { target_status: targetStatus },
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessingKey(null);
                    if (inspectSheet && inspectSheet.key === sheet.key) {
                        setInspectSheet(null);
                    }
                },
            }
        );
    };

    const tabs = [
        {
            key: "SUBMITTED_TO_REGISTRAR",
            label: "For Registrar Approval",
            count: counts.SUBMITTED_TO_REGISTRAR || 0,
        },
        {
            key: "PUBLISHED",
            label: "Published to Students",
            count: counts.PUBLISHED || 0,
        },
        {
            key: "SUBMITTED_TO_ADVISER",
            label: "With Class Adviser",
            count: counts.SUBMITTED_TO_ADVISER || 0,
        },
        {
            key: "DRAFT",
            label: "Teacher Drafts",
            count: counts.DRAFT || 0,
        },
        {
            key: "ALL",
            label: "All Grade Sheets",
            count: counts.ALL || 0,
        },
    ];

    const renderStatusBadge = (status) => {
        switch (status) {
            case "PUBLISHED":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        PUBLISHED
                    </span>
                );
            case "SUBMITTED_TO_REGISTRAR":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                        FOR REGISTRAR APPROVAL
                    </span>
                );
            case "SUBMITTED_TO_ADVISER":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                        WITH ADVISER
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        DRAFT
                    </span>
                );
        }
    };

    return (
        <PortalLayout title="Grades & SF9/SF10 Publication">
            <Head title="Registrar Grade Approval - Bulusan NHS" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                                Step 3 of 3 &bull; Official Registrar Release
                            </span>
                            <span className="text-xs font-semibold text-slate-400">
                                S.Y. {selectedYear?.name || "2026-2027"} ({selectedYear?.semester || "1st Semester"})
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                            Grades & SF9/SF10 Approval Console
                        </h2>
                        <p className="text-xs text-slate-500">
                            Verify grade sheets endorsed by Class Advisers and publish official quarterly grades to the Student Portal.
                        </p>
                    </div>
                </div>

                {/* Filter Tabs + Search Bar */}
                <Card className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => handleTabChange(tab.key)}
                                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                                            isActive
                                                ? "bg-emerald-600 text-white shadow-xs"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                                        }`}
                                    >
                                        <span>{tab.label}</span>
                                        <span
                                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                                                isActive
                                                    ? "bg-white/20 text-white"
                                                    : "bg-white text-slate-700"
                                            }`}
                                        >
                                            {tab.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
                            <select
                                value={gradeLevelId}
                                onChange={(e) => {
                                    setGradeLevelId(e.target.value);
                                    applyFilters(activeTab, e.target.value, search);
                                }}
                                className="h-9 px-3 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">All Grade Levels</option>
                                {gradeLevels.map((gl) => (
                                    <option key={gl.id} value={gl.id}>
                                        {gl.name}
                                    </option>
                                ))}
                            </select>

                            <div className="relative">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search section, subject, teacher..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-9 pl-8 pr-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 w-56"
                                />
                            </div>

                            <Button type="submit" variant="emerald" size="sm" className="h-9 text-xs font-bold">
                                Filter
                            </Button>
                        </form>
                    </div>
                </Card>

                {/* Grade Sheets Master Table */}
                <Card className="rounded-2xl border border-slate-200/80 p-0 overflow-hidden bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                                    <th className="py-3.5 px-5">Section & Class Adviser</th>
                                    <th className="py-3.5 px-4">Subject & Teacher</th>
                                    <th className="py-3.5 px-4 text-center">Encoded</th>
                                    <th className="py-3.5 px-4 text-center">Passed / Failed</th>
                                    <th className="py-3.5 px-4 text-center">Status</th>
                                    <th className="py-3.5 px-5 text-right">Registrar Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-800">
                                {gradeSheets.length > 0 ? (
                                    gradeSheets.map((sheet) => (
                                        <tr key={sheet.key} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3.5 px-5">
                                                <div className="font-black text-slate-900 text-xs">
                                                    {sheet.grade_level_name} - {sheet.section_name}
                                                </div>
                                                <div className="text-[11px] text-slate-500">
                                                    Adviser: <strong>{sheet.adviser_name}</strong>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                                        {sheet.subject_code}
                                                    </span>
                                                    <span className="font-bold text-slate-900">
                                                        {sheet.subject_name}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-slate-500 mt-0.5">
                                                    Subject Teacher: <strong>{sheet.teacher_name}</strong>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                                                {sheet.encoded_count} / {sheet.total_students}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="text-emerald-700 font-bold">
                                                    {sheet.passed_count} Passed
                                                </span>
                                                <span className="mx-1.5 text-slate-300">&bull;</span>
                                                <span className="text-rose-700 font-bold">
                                                    {sheet.failed_count} Failed
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {renderStatusBadge(sheet.status)}
                                            </td>
                                            <td className="py-3.5 px-5 text-right">
                                                <div className="inline-flex items-center justify-end gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setInspectSheet(sheet)}
                                                        className="text-xs"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 mr-1 text-slate-600" />
                                                        <span>Inspect</span>
                                                    </Button>

                                                    {sheet.status !== "PUBLISHED" && (
                                                        <Button
                                                            type="button"
                                                            variant="emerald"
                                                            size="sm"
                                                            loading={processingKey === `${sheet.key}_PUBLISHED`}
                                                            onClick={() => handleUpdateStatus(sheet, "PUBLISHED")}
                                                            className="text-xs font-black"
                                                        >
                                                            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                                                            <span>Publish to Students</span>
                                                        </Button>
                                                    )}

                                                    {(sheet.status === "SUBMITTED_TO_REGISTRAR" ||
                                                        sheet.status === "PUBLISHED") && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            loading={
                                                                processingKey ===
                                                                `${sheet.key}_SUBMITTED_TO_ADVISER`
                                                            }
                                                            onClick={() =>
                                                                handleUpdateStatus(sheet, "SUBMITTED_TO_ADVISER")
                                                            }
                                                            className="text-xs text-amber-800 border-amber-300 hover:bg-amber-50 font-bold"
                                                        >
                                                            <RotateCcw className="w-3.5 h-3.5 mr-1" />
                                                            <span>Return to Adviser</span>
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-400">
                                            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                            <p className="font-bold text-sm">
                                                No grade sheets found for the selected filter.
                                            </p>
                                            <p className="text-xs mt-0.5">
                                                Grade sheets endorsed by Class Advisers will appear here for official publication.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Inspect Student Grades Modal */}
            {inspectSheet && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[88vh] flex flex-col">
                        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                        {inspectSheet.subject_code}
                                    </span>
                                    <span className="text-xs font-bold text-slate-500">
                                        {inspectSheet.grade_level_name} - Section {inspectSheet.section_name}
                                    </span>
                                    {renderStatusBadge(inspectSheet.status)}
                                </div>
                                <h3 className="font-black text-slate-900 text-lg mt-1">
                                    {inspectSheet.subject_name}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Subject Teacher: <strong>{inspectSheet.teacher_name}</strong> &bull; Class Adviser: <strong>{inspectSheet.adviser_name}</strong>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setInspectSheet(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 border border-slate-200 rounded-xl">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                                    <tr>
                                        <th className="py-2.5 px-3">#</th>
                                        <th className="py-2.5 px-3">Student Name</th>
                                        <th className="py-2.5 px-3">LRN</th>
                                        <th className="py-2.5 px-3 text-center">Q1</th>
                                        <th className="py-2.5 px-3 text-center">Q2</th>
                                        <th className="py-2.5 px-3 text-center">Q3</th>
                                        <th className="py-2.5 px-3 text-center">Q4</th>
                                        <th className="py-2.5 px-3 text-center bg-slate-100">Final</th>
                                        <th className="py-2.5 px-3 text-center">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(inspectSheet.students || []).map((stu, idx) => (
                                        <tr key={stu.student_id}>
                                            <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                                            <td className="py-2 px-3 font-bold text-slate-900">{stu.name}</td>
                                            <td className="py-2 px-3 font-mono text-slate-600">{stu.lrn}</td>
                                            <td className="py-2 px-3 text-center font-mono">{stu.q1 ?? "--"}</td>
                                            <td className="py-2 px-3 text-center font-mono">{stu.q2 ?? "--"}</td>
                                            <td className="py-2 px-3 text-center font-mono">{stu.q3 ?? "--"}</td>
                                            <td className="py-2 px-3 text-center font-mono">{stu.q4 ?? "--"}</td>
                                            <td className="py-2 px-3 text-center font-mono font-black bg-slate-50">
                                                {stu.final_grade !== null ? Number(stu.final_grade).toFixed(2) : "--"}
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                                {stu.remarks === "PASSED" ? (
                                                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                        PASSED
                                                    </span>
                                                ) : stu.remarks === "FAILED" ? (
                                                    <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                                                        FAILED
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400">Pending</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                            {(inspectSheet.status === "SUBMITTED_TO_REGISTRAR" ||
                                inspectSheet.status === "PUBLISHED") && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="md"
                                    onClick={() =>
                                        handleUpdateStatus(inspectSheet, "SUBMITTED_TO_ADVISER")
                                    }
                                    className="text-xs text-amber-800 border-amber-300 hover:bg-amber-50 font-bold"
                                >
                                    <RotateCcw className="w-4 h-4 mr-1.5" />
                                    <span>Return to Adviser</span>
                                </Button>
                            )}

                            {inspectSheet.status !== "PUBLISHED" && (
                                <Button
                                    type="button"
                                    variant="emerald"
                                    size="md"
                                    onClick={() => handleUpdateStatus(inspectSheet, "PUBLISHED")}
                                    className="text-xs font-black"
                                >
                                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                                    <span>Publish Grades to Student Portal</span>
                                </Button>
                            )}

                            <Button
                                type="button"
                                variant="outline"
                                size="md"
                                onClick={() => setInspectSheet(null)}
                                className="text-xs"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </PortalLayout>
    );
}
