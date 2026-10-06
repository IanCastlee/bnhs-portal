import React from "react";
import { Head, Link } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Card from "@/Components/Atoms/Card";
import Badge from "@/Components/Atoms/Badge";
import Button from "@/Components/Atoms/Button";
import { useAuth } from "@/Hooks/useAuth";
import { FileSpreadsheet, Users, Clock, Send, Sparkles, CheckCircle2 } from "lucide-react";

export default function TeacherDashboard() {
    const { user } = useAuth();

    return (
        <PortalLayout title="Faculty & Adviser Portal">
            <Head title="Teacher Dashboard - Bulusan NHS" />

            <div className="space-y-6">
                {/* 🌟 Welcome Card (BNHS Green) */}
                <div className="bg-gradient-to-r from-[#0f4c3a] via-[#107050] to-[#0d5c43] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-2">
                            👨‍🏫 Faculty Grade Submission & Section Advisory
                        </span>
                        <h2 className="text-2xl font-black">
                            Good day, {user?.name}! 👋
                        </h2>
                        <p className="text-emerald-100 text-xs mt-1 font-medium">
                            Employee ID:{" "}
                            <span className="font-mono font-bold">
                                {user?.employee_id || "TCH-2026-042"}
                            </span>{" "}
                            • Advisory Class:{" "}
                            <span className="font-bold underline">Grade 7 - Rizal</span>
                        </p>
                    </div>
                </div>

                {/* 3-Step DepEd Approval Notice */}
                <Card className="bg-[#1b2a47] text-white border-none shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                        <h3 className="font-bold text-sm text-emerald-400 uppercase tracking-wider">
                            DepEd 3-Step Quarterly Grade Approval Workflow
                        </h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        Step 1: Direct Quarterly Grade Encoding (Subject Teacher) ➔ Step 2: Forward to Class Adviser ➔ Step 3: Adviser submits to Registrar for final publishing.
                    </p>
                </Card>

                {/* Modern Action Cards (No cliché top borders) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 p-6 bg-white flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md">
                                    Grading Console
                                </span>
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/10">
                                    <FileSpreadsheet className="w-5 h-5" />
                                </div>
                            </div>
                            <h3 className="text-base font-bold text-slate-900">
                                Encode Quarterly Grades
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                                Input Q1 to Q4 student marks for your assigned subjects (General Mathematics, Science & Tech, AP).
                            </p>
                        </div>
                        <Link href="/teacher/grades" className="block">
                            <Button
                                variant="primary"
                                size="sm"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 shadow-xs"
                            >
                                Open Grading Sheet &rarr;
                            </Button>
                        </Link>
                    </Card>

                    <Card className="rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 p-6 bg-white flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-md">
                                    Advisory Roster
                                </span>
                                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center ring-1 ring-teal-500/10">
                                    <Users className="w-5 h-5" />
                                </div>
                            </div>
                            <h3 className="text-base font-bold text-slate-900">
                                Class Advisory (Section Rizal)
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                                Review masterlist attendance, quarterly rankings, and forward class grades to the Registrar.
                            </p>
                        </div>
                        <Link href="/teacher/advisory" className="block">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="w-full font-bold border-slate-200 text-slate-700 hover:bg-slate-50 py-2.5"
                            >
                                View Advisory Class &rarr;
                            </Button>
                        </Link>
                    </Card>
                </div>
            </div>
        </PortalLayout>
    );
}
