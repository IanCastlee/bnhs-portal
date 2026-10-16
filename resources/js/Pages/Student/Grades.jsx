import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import Card from "@/Components/Atoms/Common/Card";
import Badge from "@/Components/Atoms/Common/Badge";
import Button from "@/Components/Atoms/Common/Button";
import {
    FileSpreadsheet,
    Award,
    Sparkles,
    Download,
    CheckCircle2,
    TrendingUp,
    ShieldCheck,
    HelpCircle,
    Printer,
} from "lucide-react";

export default function Grades({
    enrollment,
    reportCard = [],
    generalAverage = null,
    honorAward = null,
}) {
    const [selectedQuarter, setSelectedQuarter] = useState("all");

    // Fallback sample subjects if no grades recorded yet
    const displayGrades = reportCard.length > 0 ? reportCard : [
        { subject_code: "ENG-7", subject_name: "English 7", teacher_name: "Faculty", q1: 89, q2: 91, q3: null, q4: null, final_grade: 90, remarks: "PASSED", descriptor: "Outstanding (O)" },
        { subject_code: "MATH-7", subject_name: "Mathematics 7", teacher_name: "Faculty", q1: 92, q2: 94, q3: null, q4: null, final_grade: 93, remarks: "PASSED", descriptor: "Outstanding (O)" },
        { subject_code: "SCI-7", subject_name: "Science 7", teacher_name: "Faculty", q1: 88, q2: 90, q3: null, q4: null, final_grade: 89, remarks: "PASSED", descriptor: "Very Satisfactory (VS)" },
        { subject_code: "FIL-7", subject_name: "Filipino 7", teacher_name: "Faculty", q1: 90, q2: 92, q3: null, q4: null, final_grade: 91, remarks: "PASSED", descriptor: "Outstanding (O)" },
        { subject_code: "AP-7", subject_name: "Araling Panlipunan 7", teacher_name: "Faculty", q1: 91, q2: 93, q3: null, q4: null, final_grade: 92, remarks: "PASSED", descriptor: "Outstanding (O)" },
    ];

    const currentGwa = generalAverage || 91.00;

    const coreValues = [
        { coreValue: "1. Maka-Diyos", statements: ["Expresses one's personal spiritual beliefs while respecting others", "Shows adherence to ethical and moral values"], q1: "AO", q2: "AO", q3: "-", q4: "-" },
        { coreValue: "2. Makatao", statements: ["Is sensitive to individual, social, and cultural differences", "Demonstrates contributions to teamwork and group goals"], q1: "AO", q2: "AO", q3: "-", q4: "-" },
        { coreValue: "3. Makakalikasan", statements: ["Cares for the environment and utilizes resources wisely"], q1: "SO", q2: "AO", q3: "-", q4: "-" },
        { coreValue: "4. Makabansa", statements: ["Demonstrates pride in being a Filipino and respects national symbols"], q1: "AO", q2: "AO", q3: "-", q4: "-" },
    ];

    return (
        <StudentLayout title="Quarterly Grades & DepEd SF9">
            <Head title="Quarterly Grades - Bulusan NHS" />

            <div className="space-y-4 sm:space-y-6">
                {/* 🌟 BNHS Green Maximized Header Banner */}
                <div className="-mx-2.5 -mt-3.5 sm:mx-0 sm:mt-0 bg-gradient-to-r from-[#07241c] via-[#0f4c3a] to-[#0d5c43] rounded-b-3xl sm:rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden border-b sm:border border-emerald-400/20">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-teal-400/15 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-xs">
                                    Grade {enrollment?.grade_level?.level || 7} • Section {enrollment?.section?.name || "Rizal"}
                                </span>
                                {honorAward && (
                                    <span className="bg-emerald-400 text-slate-950 font-black text-[10px] sm:text-xs px-2 py-0.5 rounded-md">
                                        {honorAward.toUpperCase()}
                                    </span>
                                )}
                                <span className="text-[10px] sm:text-xs font-semibold text-emerald-200 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                    DepEd SF9 (Form 138)
                                </span>
                            </div>
                            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300 shrink-0" />
                                Official Academic Progress Report
                            </h2>
                            <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span>S.Y. {enrollment?.academic_year?.name || "2026-2027"}</span>
                                <span className="text-emerald-300/40 hidden sm:inline">•</span>
                                <span>Adviser: <strong className="font-bold text-white">{enrollment?.section?.adviser?.name || "Mrs. Maria Santos"}</strong></span>
                            </p>
                        </div>

                        {/* GWA Badge Summary */}
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 sm:px-4 sm:py-3 rounded-2xl border border-white/20 shrink-0 self-start sm:self-auto">
                            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-400 text-slate-950 shrink-0">
                                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <p className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-200 tracking-wider">
                                    General Weighted Average
                                </p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl sm:text-2xl font-black text-white">
                                        {currentGwa ? currentGwa.toFixed(2) : "--"}
                                    </span>
                                    <span className="text-[11px] sm:text-xs font-bold text-emerald-300">
                                        {currentGwa >= 90 ? "(Outstanding)" : currentGwa >= 85 ? "(Very Satisfactory)" : "(Passing)"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quarter Filter & SF9 Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        {["all", "Q1", "Q2", "Q3", "Q4"].map((q) => (
                            <button
                                key={q}
                                onClick={() => setSelectedQuarter(q)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                    selectedQuarter === q
                                        ? "bg-emerald-600 text-white shadow-xs"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {q === "all" ? "All Quarters" : `${q} Grading`}
                            </button>
                        ))}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.print()}
                        className="text-xs"
                    >
                        <Printer className="w-4 h-4 mr-1.5" />
                        <span>Print Official DepEd SF9</span>
                    </Button>
                </div>

                {/* 📋 Official DepEd Form 138 / SF9 Grade Table */}
                <Card className="rounded-2xl border border-slate-200/80 p-0 overflow-hidden bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
                                    <th className="py-3.5 px-4">Learning Areas / Subjects</th>
                                    {(selectedQuarter === "all" || selectedQuarter === "Q1") && (
                                        <th className="py-3.5 px-3 text-center w-20">1</th>
                                    )}
                                    {(selectedQuarter === "all" || selectedQuarter === "Q2") && (
                                        <th className="py-3.5 px-3 text-center w-20">2</th>
                                    )}
                                    {(selectedQuarter === "all" || selectedQuarter === "Q3") && (
                                        <th className="py-3.5 px-3 text-center w-20">3</th>
                                    )}
                                    {(selectedQuarter === "all" || selectedQuarter === "Q4") && (
                                        <th className="py-3.5 px-3 text-center w-20">4</th>
                                    )}
                                    {selectedQuarter === "all" && (
                                        <th className="py-3.5 px-3 text-center w-28 bg-slate-100/60 font-black text-slate-900">
                                            Final Grade
                                        </th>
                                    )}
                                    <th className="py-3.5 px-4 text-center">Remarks</th>
                                    <th className="py-3.5 px-4">Descriptor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-800">
                                {displayGrades.map((g, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-3 px-4 font-bold text-slate-900">
                                            <span>{g.subject_name}</span>
                                            <span className="block text-[10px] font-mono text-slate-400 font-normal">
                                                {g.subject_code} &bull; {g.teacher_name}
                                            </span>
                                        </td>
                                        {(selectedQuarter === "all" || selectedQuarter === "Q1") && (
                                            <td className="py-3 px-3 text-center font-mono font-semibold">
                                                {g.q1 !== null ? Number(g.q1).toFixed(0) : "--"}
                                            </td>
                                        )}
                                        {(selectedQuarter === "all" || selectedQuarter === "Q2") && (
                                            <td className="py-3 px-3 text-center font-mono font-semibold">
                                                {g.q2 !== null ? Number(g.q2).toFixed(0) : "--"}
                                            </td>
                                        )}
                                        {(selectedQuarter === "all" || selectedQuarter === "Q3") && (
                                            <td className="py-3 px-3 text-center font-mono font-semibold">
                                                {g.q3 !== null ? Number(g.q3).toFixed(0) : "--"}
                                            </td>
                                        )}
                                        {(selectedQuarter === "all" || selectedQuarter === "Q4") && (
                                            <td className="py-3 px-3 text-center font-mono font-semibold">
                                                {g.q4 !== null ? Number(g.q4).toFixed(0) : "--"}
                                            </td>
                                        )}
                                        {selectedQuarter === "all" && (
                                            <td className="py-3 px-3 text-center bg-slate-100/60 font-mono font-black text-slate-900">
                                                {g.final_grade !== null ? Number(g.final_grade).toFixed(2) : "--"}
                                            </td>
                                        )}
                                        <td className="py-3 px-4 text-center">
                                            {g.remarks === "PASSED" ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    PASSED
                                                </span>
                                            ) : g.remarks === "FAILED" ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                                                    FAILED
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-[11px]">Ongoing</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 text-[11px]">
                                            {g.descriptor || "In Progress"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* 🌟 DepEd Observed Values (SF9 Core Values) */}
                <Card className="rounded-2xl border border-slate-200/80 p-5 bg-white shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            Report on Learner's Observed Values (Core Values)
                        </h3>
                        <span className="text-[10px] text-slate-400 font-medium">
                            AO = Always Observed &bull; SO = Sometimes Observed &bull; NO = Not Observed
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {coreValues.map((cv, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                                <span className="font-black text-slate-900">{cv.coreValue}</span>
                                {cv.statements.map((stmt, sIdx) => (
                                    <div key={sIdx} className="flex items-center justify-between text-slate-600 text-[11px]">
                                        <span className="leading-snug pr-2">&bull; {stmt}</span>
                                        <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                                            {cv.q1}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </StudentLayout>
    );
}
