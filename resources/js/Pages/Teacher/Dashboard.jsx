import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Card from "@/Components/Atoms/Common/Card";
import Button from "@/Components/Atoms/Common/Button";
import { useAuth } from "@/Hooks/useAuth";
import {
    FileSpreadsheet,
    Users,
    Clock,
    BookOpen,
    GraduationCap,
    ArrowRight,
    MapPin,
    Calendar,
    ChevronRight,
    ClipboardCheck,
    CheckCircle2,
    AlertCircle,
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
            alert("Pumili ng section at subject.");
            return;
        }
        router.visit(`/teacher/sections/${selectedSectionId}/subjects/${selectedSubjectId}/grades`);
    };

    const totalLoads = stats.totalTeachingLoads || teachingLoads.length;
    const totalAdvisory = stats.totalAdvisorySections || advisorySections.length;
    const totalStudents = stats.totalStudents || 0;
    const pendingGrading = stats.pendingGradingCount || 0;

    return (
        <PortalLayout title="Faculty & Adviser Portal">
            <Head title="Teacher Dashboard - Bulusan NHS" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Institutional Faculty Header */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                    {user?.employee_id || "FACULTY"}
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="font-semibold text-slate-500">
                                    Bulusan National High School Faculty
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                                    S.Y. {activeYear?.name || "2026-2027"} ({activeYear?.semester || "Full Year"})
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                {user?.name}
                            </h1>
                            <p className="text-xs text-slate-500">
                                Electronic Class Record (DO 8, s. 2015) & Section Advisory Management
                            </p>
                        </div>

                        {/* Top Direct Action Bar */}
                        <div className="flex flex-wrap items-center gap-2">
                            {advisorySections.length > 0 && (
                                <Link href="/teacher/advisory">
                                    <Button variant="outline" size="sm" className="text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-50">
                                        <ClipboardCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-700" />
                                        <span>Consolidate Grades</span>
                                    </Button>
                                </Link>
                            )}
                            {advisorySections[0]?.id && (
                                <Link href={`/teacher/sections/${advisorySections[0].id}/roster`}>
                                    <Button variant="outline" size="sm" className="text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-50">
                                        <Users className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                                        <span>SF1 Class Register</span>
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Integrated Key Metric Strip */}
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100 border-t border-slate-100 mt-5 pt-4 text-xs">
                        <div className="px-3 py-1 first:pl-0">
                            <span className="text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                                Assigned Subjects
                            </span>
                            <div className="flex items-baseline gap-2 mt-0.5">
                                <span className="text-2xl font-bold text-slate-900 font-mono">
                                    {totalLoads}
                                </span>
                                <span className="text-[11px] text-slate-400">teaching loads</span>
                            </div>
                        </div>

                        <div className="px-3 py-1">
                            <span className="text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                                Advisory Class
                            </span>
                            <div className="flex items-baseline gap-2 mt-0.5">
                                <span className="text-2xl font-bold text-slate-900 font-mono">
                                    {totalAdvisory}
                                </span>
                                <span className="text-[11px] text-slate-400">assigned section</span>
                            </div>
                        </div>

                        <div className="px-3 py-1">
                            <span className="text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                                Advisory Enrollees
                            </span>
                            <div className="flex items-baseline gap-2 mt-0.5">
                                <span className="text-2xl font-bold text-slate-900 font-mono">
                                    {totalStudents}
                                </span>
                                <span className="text-[11px] text-slate-400">official students</span>
                            </div>
                        </div>

                        <div className="px-3 py-1">
                            <span className="text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                                Draft Grade Sheets
                            </span>
                            <div className="flex items-baseline gap-2 mt-0.5">
                                <span className={`text-2xl font-bold font-mono ${pendingGrading > 0 ? "text-amber-700" : "text-slate-900"}`}>
                                    {pendingGrading}
                                </span>
                                <span className="text-[11px] text-slate-400">pending submit</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Advisory Card (If Teacher is a Class Adviser) */}
                {advisorySections.length > 0 && (
                    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                                    Official Class Advisory Assignment
                                </h2>
                            </div>
                            <span className="text-xs text-slate-500">
                                DepEd SF9 Report Card Endorsement & Masterlist
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
                            {advisorySections.map((sec) => (
                                <div
                                    key={sec.id}
                                    className="p-4 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between gap-3"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                                {sec.grade_level?.name}
                                            </span>
                                            {sec.strand?.code && (
                                                <span className="text-xs font-mono font-medium text-slate-600 bg-slate-200/60 px-1.5 py-0.5 rounded">
                                                    {sec.strand.code}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900">
                                            Section {sec.name}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Enrolled: <strong className="text-slate-800">{sec.enrollments_count || 0}</strong> students officially sectioned
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                                        <Link href="/teacher/advisory" className="flex-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-center text-xs font-semibold border-slate-300 text-emerald-800 hover:bg-emerald-50 hover:border-emerald-300"
                                            >
                                                <ClipboardCheck className="w-3.5 h-3.5 mr-1" />
                                                <span>Review Grades</span>
                                            </Button>
                                        </Link>
                                        <Link href={`/teacher/sections/${sec.id}/roster`} className="flex-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-center text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-100"
                                            >
                                                <Users className="w-3.5 h-3.5 mr-1" />
                                                <span>Masterlist (SF1)</span>
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Primary Workstation: Assigned Teaching Loads */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-emerald-700" />
                                <span>My Subject Teaching Loads ({teachingLoads.length})</span>
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Select a class to open the Electronic Grade Sheet (Excel import, draft save, and adviser submit).
                            </p>
                        </div>
                    </div>

                    {teachingLoads.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 space-y-2">
                            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="text-sm font-semibold text-slate-700">
                                No assigned teaching loads for this school year
                            </p>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                Teaching assignments are configured by the Registrar Office. Please coordinate with the Registrar if your class load is missing.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
                            {teachingLoads.map((load) => (
                                <div
                                    key={load.id}
                                    className="border border-slate-200 rounded-lg p-4 bg-white hover:border-slate-300 transition-all flex flex-col justify-between gap-3"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-1 text-[11px]">
                                            <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                {load.subject_code}
                                            </span>
                                            <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                                {load.grade_level} &bull; {load.section_name}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 leading-snug">
                                                {load.subject_name}
                                            </h3>
                                        </div>

                                        <div className="space-y-1 text-xs text-slate-500 pt-1 border-t border-slate-100">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>{load.schedule_days || "Monday - Friday"}</span>
                                            </div>
                                            {load.time_start && load.time_end && (
                                                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>{load.time_start} - {load.time_end}</span>
                                                </div>
                                            )}
                                            {load.room && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>Room: <strong className="text-slate-700">{load.room}</strong></span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Link
                                        href={`/teacher/sections/${load.section_id}/subjects/${load.subject_id}/grades`}
                                        className="w-full pt-1"
                                    >
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="w-full justify-center text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white"
                                        >
                                            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                                            <span>Open Grade Sheet</span>
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Direct Section & Subject Quick Selector */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                                Direct Grade Sheet Selector
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Quickly navigate to any section and learning area in Bulusan NHS.
                            </p>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                            DepEd Order No. 8, s. 2015
                        </span>
                    </div>

                    <form onSubmit={handleOpenGradeSheet} className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-4 items-end">
                        <div className="sm:col-span-5 space-y-1">
                            <label className="block text-xs font-semibold text-slate-700">
                                Section
                            </label>
                            <select
                                value={selectedSectionId}
                                onChange={(e) => setSelectedSectionId(e.target.value)}
                                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                            >
                                {allSections.map((sec) => (
                                    <option key={sec.id} value={sec.id}>
                                        {sec.grade_level?.name} - {sec.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-5 space-y-1">
                            <label className="block text-xs font-semibold text-slate-700">
                                Subject / Learning Area
                            </label>
                            <select
                                value={selectedSubjectId}
                                onChange={(e) => setSelectedSubjectId(e.target.value)}
                                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                            >
                                {subjects.map((sub) => (
                                    <option key={sub.id} value={sub.id}>
                                        [{sub.code}] {sub.name} ({sub.grade_level?.name || "General"})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <Button
                                type="submit"
                                variant="outline"
                                size="md"
                                className="w-full justify-center text-xs font-semibold h-[38px] border-slate-300 text-slate-800 hover:bg-slate-50"
                            >
                                <span>Go to Sheet</span>
                                <ArrowRight className="w-3.5 h-3.5 ml-1 text-slate-500" />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </PortalLayout>
    );
}

