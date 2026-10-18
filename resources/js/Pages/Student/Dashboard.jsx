import React from "react";
import { Head, Link } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import Card from "@/Components/Atoms/Card";
import Badge from "@/Components/Atoms/Badge";
import AnnouncementCard from "@/Components/Organisms/Student/Announcements/AnnouncementCard";
import AdmissionQueueBanner from "@/Components/Organisms/Student/AdmissionQueueBanner";
import { useAuth } from "@/Hooks/useAuth";
import { useSchoolSettings } from "@/Hooks/useSchoolSettings";
import { formatLRN } from "@/Utils/formatters";
import {
    Megaphone,
    Calendar,
    UserCheck,
    Sparkles,
    BookOpen,
    Clock,
    Ticket,
    School,
} from "lucide-react";

export default function StudentDashboard({ announcements = [], enrollment = null, queuePosition = null }) {
    const { user } = useAuth();
    const school = useSchoolSettings();
    const feedList = Array.isArray(announcements) ? announcements : (announcements?.data || []);

    const isPending = enrollment ? enrollment.status === "PENDING_REVIEW" : false;
    const isEnrolled = enrollment ? enrollment.status === "APPROVED" && enrollment.section_id : true;

    const sectionName = isPending
        ? "Grade 7 • For Sectioning"
        : (enrollment?.section?.name
            ? `Grade ${enrollment?.grade_level?.level || 7} • Section ${enrollment.section.name}`
            : "Grade 7 • Section Rizal");

    const adviserName = isPending
        ? "Pending Registrar Evaluation"
        : (enrollment?.section?.adviser?.name || "Mrs. Maria Santos");

    const todayClasses = [
        { subject: "General Mathematics", teacher: "Mrs. Maria Santos", time: "8:00 AM - 9:00 AM", room: "Room 102" },
        { subject: "English 7", teacher: "Mr. Juan Ramos", time: "9:00 AM - 10:00 AM", room: "Room 102" },
        { subject: "Science & Technology", teacher: "Ms. Elena Cruz", time: "10:15 AM - 11:15 AM", room: "Science Lab" },
        { subject: "Araling Panlipunan 7", teacher: "Mr. Roberto Diaz", time: "1:00 PM - 2:00 PM", room: "Room 102" },
    ];

    return (
        <StudentLayout title="Student Feed & Dashboard">
            <Head title={`Student Portal - ${school.short_name}`} />

            <div className="sm:space-y-6">
                {/* 🌟 LAYER 1 (z-10): BNHS Green Student Welcome Banner Backdrop */}
                <div className="relative z-10 -mx-2.5 -mt-3.5 sm:mx-0 sm:mt-0 bg-gradient-to-br from-[#042219] via-[#0b4635] to-[#062d21] sm:rounded-2xl px-5 pt-4 pb-12 sm:p-6 text-white shadow-lg overflow-hidden sm:border border-emerald-400/15">
                    {/* Ambient Glows */}
                    <div className="hidden sm:block absolute -top-12 -right-12 w-48 h-48 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

                    {/* Half-Visible Blurred Watermark Logo on Right Edge */}
                    {school.logo_url ? (
                        <img
                            src={school.logo_url}
                            alt=""
                            aria-hidden="true"
                            className="pointer-events-none select-none absolute -right-14 -bottom-6 w-48 h-48 sm:w-52 sm:h-52 object-contain opacity-20 blur-[2px]"
                        />
                    ) : (
                        <School
                            aria-hidden="true"
                            className="pointer-events-none select-none absolute -right-12 -bottom-6 w-44 h-44 sm:w-48 sm:h-48 text-emerald-300 opacity-15 blur-[2px]"
                        />
                    )}

                    <div className="relative z-10">
                        {/* Top Status & S.Y. Row */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-100 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                                <span className={`w-1.5 h-1.5 rounded-full ${isPending ? "bg-amber-400" : "bg-emerald-400"}`} />
                                {sectionName}
                            </span>

                            <div className="flex items-center gap-1.5">
                                {isPending ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30">
                                        <Clock className="w-3 h-3" />
                                        {enrollment?.tracking_number || "BNHS-Q001"}
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/25">
                                        Enrolled
                                    </span>
                                )}
                                <span className="text-[11px] text-emerald-200/75 font-normal hidden xs:inline">
                                    • S.Y. {enrollment?.academic_year?.name || "2026-2027"}
                                </span>
                            </div>
                        </div>

                        {/* Student Greeting */}
                        <h2 className="text-base sm:text-xl font-semibold tracking-tight text-white">
                            Kamusta, {user?.name || "Juan Dela Cruz"}
                        </h2>

                        {/* Clean Metadata Footer */}
                        <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-emerald-100/80">
                            <div className="flex items-center gap-1.5">
                                <span className="text-emerald-200/70">Adviser:</span>
                                <span className="font-medium text-white">{adviserName}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-emerald-200/70">LRN:</span>
                                <span className="font-mono text-emerald-200 font-medium">
                                    {formatLRN(user?.lrn || "102938475612")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 📱 LAYER 2 (z-20): Overlapping Rounded Content Sheet on Mobile */}
                <div className="relative z-20 -mt-6 sm:mt-0 -mx-2.5 sm:mx-0 px-3.5 pt-5 pb-2 sm:p-0 bg-[#f4f7fa] sm:bg-transparent rounded-t-3xl sm:rounded-none shadow-[0_-6px_20px_rgba(0,0,0,0.08)] sm:shadow-none space-y-4 sm:space-y-6">
                    {/* 🎟️ Real-Time Admission Queue Notification Banner (Kapag bago/pending pa lang) */}
                    {isPending && (
                        <AdmissionQueueBanner
                            enrollment={enrollment}
                            queuePosition={queuePosition}
                        />
                    )}

                    {/* 💻 Responsive 2-Column Grid for Laptop Screens */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        {/* LEFT COLUMN: School Feed with Organism Cards */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                                    <Megaphone className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>School Announcements</span>
                                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                        {feedList.length}
                                    </span>
                                </h3>
                            </div>

                        {feedList.length === 0 ? (
                            <Card className="text-center py-12 text-slate-400">
                                <Megaphone className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                <h4 className="text-sm font-bold text-slate-700">Walang Bagong Announcements</h4>
                                <p className="text-xs text-slate-500 mt-1">Lalabas dito ang mga post at litrato kapag nag-publish ang Admin.</p>
                            </Card>
                        ) : (
                            feedList.map((post) => (
                                <AnnouncementCard key={post.id} post={post} />
                            ))
                        )}
                    </div>

                    {/* RIGHT COLUMN: Timetable & Quick Actions (Sticky on Desktop Scroll) */}
                    <div className="space-y-6 lg:sticky lg:top-4">
                        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                                    <Calendar className="w-4 h-4 text-emerald-600" />
                                    Today's Class Schedule
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {todayClasses.map((item, idx) => (
                                    <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-emerald-200 transition">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-0.5">
                                                <h4 className="text-xs font-bold text-slate-800">{item.subject}</h4>
                                                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                                    <UserCheck className="w-3 h-3 text-slate-400" />
                                                    {item.teacher}
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md shrink-0">
                                                {item.time}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                                            📍 {item.room}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#1b2a47] rounded-xl p-5 text-white shadow-md">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-emerald-400" />
                                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Academic Notice</h4>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                First Quarter grades are currently being encoded by subject teachers. Make sure to consult your adviser for missing outputs.
                            </p>
                            <Link
                                href="/student/grades"
                                className="mt-4 inline-flex items-center justify-center w-full py-2.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition shadow-md shadow-emerald-500/20 cursor-pointer"
                            >
                                <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                                Check My Grades
                            </Link>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </StudentLayout>
    );
}
