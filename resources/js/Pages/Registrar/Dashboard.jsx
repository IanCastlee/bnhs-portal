import { Head, Link } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Card from "@/Components/Atoms/Card";
import { useAuth } from "@/Hooks/useAuth";
import { FileCheck, CheckCircle2, Clock, ArrowRight } from "lucide-react";

export default function RegistrarDashboard() {
    const { user } = useAuth();

    return (
        <PortalLayout title="Registrar Office Portal">
            <Head title="Registrar Dashboard - Bulusan NHS" />

            <div className="space-y-6">
                {/* 🌟 Welcome Card (BNHS Green) */}
                <div className="bg-gradient-to-r from-[#0f4c3a] via-[#107050] to-[#0d5c43] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-2">
                            📋 DepEd Admission, Verification & SF10 Custodian
                        </span>
                        <h2 className="text-2xl font-black">
                            Registrar Office Dashboard
                        </h2>
                        <p className="text-emerald-100 text-xs mt-1 font-medium">
                            Review BEEF student applications, assign sections &
                            advisers, and approve quarterly grades.
                        </p>
                    </div>
                </div>

                {/* 📊 Modern Bespoke Stat Cards (No cliché left borders) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <Card className="rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 p-5 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Pending BEEF Forms
                                </p>
                                <p className="text-2xl font-black text-slate-900 mt-1">
                                    12
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center ring-1 ring-amber-500/10">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <Link
                                href="/registrar/enrollments"
                                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group"
                            >
                                <span>Review applications</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                                Action Required
                            </span>
                        </div>
                    </Card>

                    <Card className="rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 p-5 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Enrolled & Sectioned
                                </p>
                                <p className="text-2xl font-black text-slate-900 mt-1">
                                    960
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/10">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span>24 Sections Assigned</span>
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                                100% Placed
                            </span>
                        </div>
                    </Card>

                    <Card className="rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 p-5 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Grade Approval Queue
                                </p>
                                <p className="text-2xl font-black text-slate-900 mt-1">
                                    8
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center ring-1 ring-teal-500/10">
                                <FileCheck className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <Link
                                href="/registrar/grades"
                                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 group"
                            >
                                <span>Open SF10 Approval</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <span className="text-[10px] text-slate-400 font-medium">
                                Q1 Masterlist
                            </span>
                        </div>
                    </Card>
                </div>
            </div>
        </PortalLayout>
    );
}
