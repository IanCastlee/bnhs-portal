import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Card from "@/Components/Atoms/Common/Card";
import Badge from "@/Components/Atoms/Common/Badge";
import Button from "@/Components/Atoms/Common/Button";
import { useAuth } from "@/Hooks/useAuth";
import {
    FileSpreadsheet,
    Users,
    Clock,
    Sparkles,
    CheckCircle2,
    BookOpen,
    GraduationCap,
    ArrowRight,
    Search,
    ShieldAlert,
} from "lucide-react";

export default function TeacherDashboard({
    advisorySections = [],
    teachingLoads = [],
    allSections = [],
    subjects = [],
    activeYear = null,
    stats = {},
}) {
    const { user } = useAuth();
    const [selectedSectionId, setSelectedSectionId] = useState(allSections[0]?.id || "");
    const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || "");

    const handleOpenGradeSheet = (e) => {
        e.preventDefault();
        if (!selectedSectionId || !selectedSubjectId) {
            alert("Please select both a section and a subject.");
            return;
        }
        router.visit(`/teacher/sections/${selectedSectionId}/subjects/${selectedSubjectId}/grades`);
    };

    return (
        <PortalLayout title="Faculty & Adviser Portal">
            <Head title="Teacher Dashboard - Bulusan NHS" />

            <div className="space-y-6">
                {/* 🌟 Welcome Card (BNHS Green) */}
                <div className="bg-gradient-to-r from-[#0f4c3a] via-[#107050] to-[#0d5c43] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-2">
                            <GraduationCap className="w-3.5 h-3.5" />
                            Faculty Grade Encoding & Section Advisory Portal
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black">
                            Good day, {user?.name}! 👋
                        </h2>
                        <p className="text-emerald-100 text-xs mt-1 font-medium flex flex-wrap items-center gap-3">
                            <span>
                                Employee ID:{" "}
                                <strong className="font-mono font-bold text-white">
                                    {user?.employee_id || "TCH-2026-042"}
                                </strong>
                            </span>
                            <span>•</span>
                            <span>
                                Active S.Y.:{" "}
                                <strong className="text-white">
                                    {activeYear?.name || "2026-2027"} ({activeYear?.semester || "Full Year"})
                                </strong>
                            </span>
                        </p>
                    </div>
                </div>

                {/* 📊 Stat Counters */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Teaching Loads
                            </span>
                            <span className="text-2xl font-black text-slate-900">
                                {stats.totalTeachingLoads || teachingLoads.length}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Advisory Sections
                            </span>
                            <span className="text-2xl font-black text-slate-900">
                                {stats.totalAdvisorySections || advisorySections.length}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Enrolled Students
                            </span>
                            <span className="text-2xl font-black text-slate-900">
                                {stats.totalStudents || 0}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Draft Grade Sheets
                            </span>
                            <span className="text-2xl font-black text-slate-900">
                                {stats.pendingGradingCount || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 📚 My Assigned Teaching Loads & Class Schedule */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-emerald-700" />
                                <span>My Assigned Teaching Loads ({teachingLoads.length})</span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Official subjects and class schedules assigned to you by the Registrar for S.Y. {activeYear?.name || "2026-2027"}.
                            </p>
                        </div>
                    </div>

                    {teachingLoads.length === 0 ? (
                        <div className="py-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                            Wala pang naka-assign na subject classes sa kasalukuyang school year. Makipag-ugnayan sa Registrar para sa teaching load assignment.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {teachingLoads.map((load) => (
                                <div
                                    key={load.id}
                                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-1 mb-1.5">
                                            <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                {load.subject_code}
                                            </span>
                                            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                                {load.grade_level} - {load.section_name}
                                            </span>
                                        </div>
                                        <h4 className="font-black text-slate-900 text-sm leading-tight">
                                            {load.subject_name}
                                        </h4>
                                        <div className="text-[11px] text-slate-500 mt-2 space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{load.schedule_days || "Monday - Friday"}</span>
                                                {load.time_start && load.time_end && (
                                                    <span className="font-mono text-slate-700 font-semibold">
                                                        ({load.time_start} - {load.time_end})
                                                    </span>
                                                )}
                                            </div>
                                            {load.room && (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-slate-400">Room:</span>
                                                    <span className="font-semibold text-slate-700">{load.room}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Link
                                        href={`/teacher/sections/${load.section_id}/subjects/${load.subject_id}/grades`}
                                        className="w-full"
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-center font-bold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 text-xs"
                                        >
                                            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                                            <span>Encode Grades</span>
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 🎯 Main Two Action Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Grade Encoding Fast Console */}
                    <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white flex flex-col justify-between space-y-4">
                        <div>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md">
                                    DepEd DO 8, s. 2015
                                </span>
                                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mt-3">
                                Encode Quarterly Grades
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                Select a class section and subject to record quarterly marks (Q1, Q2, Q3, Q4) with automated final grade and transmutation calculation.
                            </p>

                            {/* Section & Subject Selectors */}
                            <div className="space-y-3 mt-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Select Target Section
                                    </label>
                                    <select
                                        value={selectedSectionId}
                                        onChange={(e) => setSelectedSectionId(e.target.value)}
                                        className="w-full text-xs font-semibold rounded-xl border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
                                    >
                                        {allSections.map((sec) => (
                                            <option key={sec.id} value={sec.id}>
                                                {sec.grade_level?.name} - {sec.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Select Learning Area / Subject
                                    </label>
                                    <select
                                        value={selectedSubjectId}
                                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                                        className="w-full text-xs font-semibold rounded-xl border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
                                    >
                                        {subjects.map((sub) => (
                                            <option key={sub.id} value={sub.id}>
                                                [{sub.code}] {sub.name} ({sub.grade_level?.name || "General"})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="emerald"
                            size="md"
                            onClick={handleOpenGradeSheet}
                            className="w-full justify-center font-black mt-4"
                        >
                            <span>Open Electronic Grade Sheet</span>
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Card>

                    {/* Section Advisory Class Roster */}
                    <Card className="rounded-2xl border border-slate-200/80 p-6 bg-white flex flex-col justify-between space-y-4">
                        <div>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-md">
                                    Advisory Masterlist
                                </span>
                                <Users className="w-5 h-5 text-teal-600" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mt-3">
                                Class Advisory Rosters
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                Review official student enrollments, LRN records, emergency contacts, and approve composite class cards for Registrar submission.
                            </p>

                            <div className="mt-4 space-y-2.5">
                                {advisorySections.length > 0 ? (
                                    advisorySections.map((sec) => (
                                        <div
                                            key={sec.id}
                                            className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/60 flex items-center justify-between hover:bg-slate-100/80 transition-colors"
                                        >
                                            <div>
                                                <h4 className="text-xs font-black text-slate-900">
                                                    {sec.grade_level?.name} - {sec.name}
                                                </h4>
                                                <span className="text-[11px] text-slate-500 font-medium">
                                                    Enrolled: <strong>{sec.enrollments_count || 0}</strong> students
                                                </span>
                                            </div>
                                            <Link href={`/teacher/sections/${sec.id}/roster`}>
                                                <Button variant="outline" size="sm">
                                                    <span>View Roster</span>
                                                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                                        No advisory section assigned yet. You can still encode grades for your subject classes on the left.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-600 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Adviser endorsements automatically notify the Registrar's Office.</span>
                        </div>
                    </Card>
                </div>
            </div>
        </PortalLayout>
    );
}
