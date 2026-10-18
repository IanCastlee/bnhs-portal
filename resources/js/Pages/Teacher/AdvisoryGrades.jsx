import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Card from "@/Components/Atoms/Common/Card";
import Button from "@/Components/Atoms/Common/Button";
import {
    Users,
    FileSpreadsheet,
    CheckCircle2,
    Send,
    RotateCcw,
    Eye,
    AlertCircle,
    ArrowLeft,
    ShieldCheck,
} from "lucide-react";

export default function AdvisoryGrades({ sections = [], activeYear = null }) {
    const [processingKey, setProcessingKey] = useState(null);

    const handleSubjectAction = (sectionId, subjectId, targetStatus) => {
        const msg =
            targetStatus === "SUBMITTED_TO_REGISTRAR"
                ? "Approve this subject grade sheet and forward it to the Registrar?"
                : "Return this grade sheet to the Subject Teacher (unlock Draft)?";

        if (!confirm(msg)) return;

        const key = `${sectionId}_${subjectId}_${targetStatus}`;
        setProcessingKey(key);

        router.post(
            `/teacher/sections/${sectionId}/subjects/${subjectId}/grades/submit`,
            { target_status: targetStatus },
            {
                preserveScroll: true,
                onFinish: () => setProcessingKey(null),
            }
        );
    };

    const handleForwardAllToRegistrar = (sectionId, sectionName) => {
        if (
            !confirm(
                `Forward all SUBMITTED_TO_ADVISER subject grade sheets for Section ${sectionName} to the Registrar?`
            )
        ) {
            return;
        }

        const key = `forward_all_${sectionId}`;
        setProcessingKey(key);

        router.post(
            `/teacher/advisory/${sectionId}/forward-registrar`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessingKey(null),
            }
        );
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case "PUBLISHED":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        PUBLISHED TO STUDENTS
                    </span>
                );
            case "SUBMITTED_TO_REGISTRAR":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                        WITH REGISTRAR
                    </span>
                );
            case "SUBMITTED_TO_ADVISER":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                        FOR ADVISER REVIEW
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        DRAFT (TEACHER ENCODING)
                    </span>
                );
        }
    };

    return (
        <PortalLayout title="Class Adviser Grade Consolidation">
            <Head title="Advisory Section Grades Review - Bulusan NHS" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Link href="/teacher/dashboard">
                                <Button variant="ghost" size="sm" className="p-1.5 h-auto text-slate-500">
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                            </Link>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-teal-100 text-teal-800 uppercase tracking-wider">
                                Step 2 of 3 &bull; Class Adviser Review
                            </span>
                            <span className="text-xs font-semibold text-slate-400">
                                S.Y. {activeYear?.name || "2026-2027"} ({activeYear?.semester || "1st Semester"})
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                            My Advisory Section Grade Submissions
                        </h2>
                        <p className="text-xs text-slate-500">
                            Inspect subject grade sheets submitted by Subject Teachers, return incomplete sheets for correction, or forward approved grades to the Registrar.
                        </p>
                    </div>
                </div>

                {sections.length === 0 ? (
                    <Card className="p-10 text-center bg-white rounded-2xl border border-slate-200/80">
                        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-black text-slate-800">
                            No Advisory Section Assigned
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                            Wala ka pang naka-assign na Advisory Section para sa kasalukuyang School Year. Maaari ka pa ring mag-encode ng grades para sa iyong mga Subject Teaching Loads sa Dashboard.
                        </p>
                    </Card>
                ) : (
                    sections.map((sec) => {
                        const readyForAdviserCount = (sec.subjects || []).filter(
                            (s) => s.status === "SUBMITTED_TO_ADVISER"
                        ).length;

                        return (
                            <Card
                                key={sec.id}
                                className="rounded-2xl border border-slate-200/80 p-0 overflow-hidden bg-white shadow-xs"
                            >
                                {/* Section Card Header */}
                                <div className="p-5 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-md">
                                                {sec.grade_level_name}
                                            </span>
                                            {sec.strand_code && (
                                                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded">
                                                    {sec.strand_code}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 mt-1">
                                            Section {sec.name}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Officially Enrolled Students: <strong>{sec.enrollments_count}</strong> &bull; Assigned Subjects: <strong>{sec.subjects?.length || 0}</strong>
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <Link href={`/teacher/sections/${sec.id}/roster`}>
                                            <Button variant="outline" size="sm" className="text-xs font-bold">
                                                <Users className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                                                <span>Class Roster (SF1)</span>
                                            </Button>
                                        </Link>

                                        {readyForAdviserCount > 0 && (
                                            <Button
                                                type="button"
                                                variant="emerald"
                                                size="sm"
                                                loading={processingKey === `forward_all_${sec.id}`}
                                                onClick={() => handleForwardAllToRegistrar(sec.id, sec.name)}
                                                className="text-xs font-black"
                                            >
                                                <ShieldCheck className="w-4 h-4 mr-1.5" />
                                                <span>
                                                    Forward All Submitted ({readyForAdviserCount}) to Registrar
                                                </span>
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Subject Submissions Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-white border-b border-slate-200/80 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                                                <th className="py-3.5 px-5">Subject Code & Learning Area</th>
                                                <th className="py-3.5 px-4">Subject Teacher</th>
                                                <th className="py-3.5 px-4 text-center">Encoded Students</th>
                                                <th className="py-3.5 px-4 text-center">Workflow Status</th>
                                                <th className="py-3.5 px-5 text-right">Adviser Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-800">
                                            {sec.subjects && sec.subjects.length > 0 ? (
                                                sec.subjects.map((sub) => (
                                                    <tr key={sub.subject_id} className="hover:bg-slate-50/60 transition-colors">
                                                        <td className="py-3.5 px-5">
                                                            <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mr-2">
                                                                {sub.subject_code}
                                                            </span>
                                                            <span className="font-bold text-slate-900">
                                                                {sub.subject_name}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                                                            {sub.teacher_name}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                                                            {sub.encoded_count} / {sub.total_students}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center">
                                                            {renderStatusBadge(sub.status)}
                                                        </td>
                                                        <td className="py-3.5 px-5 text-right">
                                                            <div className="inline-flex items-center justify-end gap-2">
                                                                <Link
                                                                    href={`/teacher/sections/${sec.id}/subjects/${sub.subject_id}/grades`}
                                                                >
                                                                    <Button variant="outline" size="sm" className="text-xs">
                                                                        <Eye className="w-3.5 h-3.5 mr-1 text-slate-600" />
                                                                        <span>Inspect Sheet</span>
                                                                    </Button>
                                                                </Link>

                                                                {sub.status === "SUBMITTED_TO_ADVISER" && (
                                                                    <>
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            loading={
                                                                                processingKey ===
                                                                                `${sec.id}_${sub.subject_id}_DRAFT`
                                                                            }
                                                                            onClick={() =>
                                                                                handleSubjectAction(
                                                                                    sec.id,
                                                                                    sub.subject_id,
                                                                                    "DRAFT"
                                                                                )
                                                                            }
                                                                            className="text-xs text-amber-800 border-amber-300 hover:bg-amber-50 font-bold"
                                                                        >
                                                                            <RotateCcw className="w-3.5 h-3.5 mr-1" />
                                                                            <span>Return</span>
                                                                        </Button>
                                                                        <Button
                                                                            type="button"
                                                                            variant="emerald"
                                                                            size="sm"
                                                                            loading={
                                                                                processingKey ===
                                                                                `${sec.id}_${sub.subject_id}_SUBMITTED_TO_REGISTRAR`
                                                                            }
                                                                            onClick={() =>
                                                                                handleSubjectAction(
                                                                                    sec.id,
                                                                                    sub.subject_id,
                                                                                    "SUBMITTED_TO_REGISTRAR"
                                                                                )
                                                                            }
                                                                            className="text-xs font-black"
                                                                        >
                                                                            <Send className="w-3.5 h-3.5 mr-1" />
                                                                            <span>Forward to Registrar</span>
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="py-8 text-center text-slate-400">
                                                        No subjects assigned to this section yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>
        </PortalLayout>
    );
}
