import React from "react";
import { Head, Link } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Card from "@/Components/Atoms/Card";
import Button from "@/Components/Atoms/Button";
import Badge from "@/Components/Atoms/Badge";
import { useAuth } from "@/Hooks/useAuth";
import {
    Megaphone,
    School,
    Users,
    ShieldCheck,
    Plus,
    ArrowRight,
    Pin,
    Layers,
    Sparkles,
    CheckCircle2,
} from "lucide-react";

export default function AdminDashboard({ recentAnnouncements = [], totalAnnouncements = 0 }) {
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
                                <CheckCircle2 className="w-3 h-3" /> Redis & Cloudinary Active
                            </span>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">Admin Console Overview</h2>
                        <p className="text-emerald-100 text-xs mt-1 font-medium">
                            S.Y. 2026-2027 Active • Bulusan National High School Management Console
                        </p>
                    </div>
                </div>

                {/* 📊 Modern Bespoke Stat Cards (No cliché left borders) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <Card className="rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 p-5 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Feed Announcements</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">{totalAnnouncements}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/10">
                                <Megaphone className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <Link href="/admin/announcements" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group">
                                <span>Manage announcements</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <span className="text-[10px] text-slate-400 font-medium">CRUD Active</span>
                        </div>
                    </Card>

                    <Card className="rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 p-5 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Configured Strands</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">6 Strands</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center ring-1 ring-teal-500/10">
                                <School className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span>STEM, ABM, HUMSS, TVL</span>
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">K-12</span>
                        </div>
                    </Card>

                    <Card className="rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 p-5 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">System Role Access</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">4 Roles</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center ring-1 ring-slate-900/5">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span>Admin, Registrar, Teacher, Student</span>
                            <span className="text-[10px] text-slate-400 font-medium">RBAC</span>
                        </div>
                    </Card>
                </div>

                {/* 📢 Recent Announcements Preview */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                <Megaphone className="w-4 h-4 text-emerald-600" />
                                Recent School Feed Announcements
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">Live feed shown to 960+ students & parents</p>
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
