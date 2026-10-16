import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Card from "@/Components/Atoms/Card";
import Button from "@/Components/Atoms/Button";
import Badge from "@/Components/Atoms/Badge";
import { useAuth } from "@/Hooks/useAuth";
import {
    Megaphone,
    Calendar,
    Users,
    ShieldCheck,
    Plus,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    Lock,
    Unlock,
    UserPlus,
    School,
} from "lucide-react";

export default function AdminDashboard({
    recentAnnouncements = [],
    totalAnnouncements = 0,
    activeYear = null,
    totalRegistrars = 0,
    totalEnrollments = 0,
}) {
    const { user } = useAuth();

    return (
        <PortalLayout title="Administrator Control Console">
            <Head title="Admin Dashboard - Bulusan NHS" />

            <div className="space-y-6">
                {/* 🌟 BNHS Green Admin Welcome Banner */}
                <div className="bg-gradient-to-r from-[#0f4c3a] via-[#107050] to-[#0d5c43] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold backdrop-blur-xs">
                                👑 System Administration
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-bold border border-emerald-400/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> DepEd SSU OPAS Compliant
                            </span>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">Admin Operations Console</h2>
                        <p className="text-emerald-100 text-xs mt-1 font-medium">
                            {activeYear ? `S.Y. ${activeYear.name} Active (${activeYear.semester})` : "No Active Academic Year"} • Bulusan National High School
                        </p>
                    </div>
                </div>

                {/* 📊 Core Operational Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* School Year Card */}
                    <Card className="rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 p-5 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active School Year</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">
                                    {activeYear ? `S.Y. ${activeYear.name}` : "None"}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/10">
                                <Calendar className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <Link href="/admin/academic-years" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group">
                                <span>Manage School Years</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                                {activeYear?.is_enrollment_open ? "Admission Open" : "Admission Closed"}
                            </span>
                        </div>
                    </Card>

                    {/* Registrars Card */}
                    <Card className="rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 p-5 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registrar Officers</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">{totalRegistrars} Staff</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center ring-1 ring-teal-500/10">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <Link href="/admin/registrars" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group">
                                <span>Manage Registrars</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <span className="text-[10px] text-slate-400 font-medium">RBAC Security</span>
                        </div>
                    </Card>

                    {/* Announcements Card */}
                    <Card className="rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 p-5 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Feed Announcements</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">{totalAnnouncements}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-blue-500/10">
                                <Megaphone className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <Link href="/admin/announcements" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group">
                                <span>Manage feed posts</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <span className="text-[10px] text-slate-400 font-medium">Public Feed</span>
                        </div>
                    </Card>
                </div>



                {/* 🚀 Quick Operations Hub */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Academic Year Quick Link Box */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-black text-sm text-slate-900">Academic Year & Admission</h4>
                                <p className="text-[11px] text-slate-500 line-clamp-1">Create school years and toggle enrollment window</p>
                            </div>
                        </div>
                        <Link href="/admin/academic-years" className="w-full">
                            <Button variant="outline" size="sm" className="w-full font-bold text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                                Manage S.Y. &rarr;
                            </Button>
                        </Link>
                    </div>

                    {/* Registrars Quick Link Box */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold shrink-0">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-black text-sm text-slate-900">Registrar Accounts & ID</h4>
                                <p className="text-[11px] text-slate-500 line-clamp-1">Register officers & assign grade levels</p>
                            </div>
                        </div>
                        <Link href="/admin/registrars" className="w-full">
                            <Button variant="outline" size="sm" className="w-full font-bold text-xs border-teal-600 text-teal-700 hover:bg-teal-50">
                                Manage Staff &rarr;
                            </Button>
                        </Link>
                    </div>

                    {/* Audit Logs Quick Link Box */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-black text-sm text-slate-900">Activity Audit Trail</h4>
                                <p className="text-[11px] text-slate-500 line-clamp-1">Track registrar approvals, rejections & updates</p>
                            </div>
                        </div>
                        <Link href="/admin/audit-logs" className="w-full">
                            <Button variant="outline" size="sm" className="w-full font-bold text-xs border-blue-600 text-blue-700 hover:bg-blue-50">
                                View Audit Logs &rarr;
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* 📢 Recent Announcements Preview */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                <Megaphone className="w-4 h-4 text-emerald-600" />
                                Recent School Feed Announcements
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">Live feed shown to students & parents</p>
                        </div>

                        <Link href="/admin/announcements">
                            <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs">
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Create Announcement
                            </Button>
                        </Link>
                    </div>

                    {recentAnnouncements.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <p className="text-xs">No announcements created yet.</p>
                            <Link href="/admin/announcements" className="mt-2 inline-block text-xs font-bold text-emerald-600 hover:underline">
                                Go to Announcements CRUD Page &rarr;
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {recentAnnouncements.map((item) => (
                                <div key={item.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col justify-between hover:border-emerald-200 transition">
                                    {item.image_url && (
                                        <img src={item.image_url} alt={item.title} className="w-full h-28 object-cover rounded-lg mb-3" />
                                    )}
                                    <div>
                                        <Badge variant="primary" className="text-[10px] mb-1.5 bg-emerald-100 text-emerald-700 border-none">{item.tag}</Badge>
                                        <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{item.title}</h4>
                                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{item.caption}</p>
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PortalLayout>
    );
}
