import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import Card from "@/Components/Atoms/Card";
import Badge from "@/Components/Atoms/Badge";
import {
    CalendarDays,
    Clock,
    UserCheck,
    MapPin,
    BookOpen,
    Sparkles,
    Calendar,
    ChevronRight,
    ChevronDown,
    School,
} from "lucide-react";

export default function Classes() {
    const [selectedDay, setSelectedDay] = useState("Monday");

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const scheduleData = {
        Monday: [
            { code: "MATH-7", subject: "General Mathematics", teacher: "Mrs. Maria Santos", time: "7:30 AM - 8:30 AM", room: "Bldg A - Room 102", type: "Core Subject", status: "Completed" },
            { code: "ENG-7", subject: "English 7", teacher: "Mr. Juan Ramos", time: "8:30 AM - 9:30 AM", room: "Bldg A - Room 102", type: "Core Subject", status: "Completed" },
            { code: "RECESS", subject: "Morning Recess / Break", teacher: "Campus Cafeteria", time: "9:30 AM - 9:45 AM", room: "Ground Floor", type: "Break", status: "Break" },
            { code: "SCI-7", subject: "Science & Technology", teacher: "Ms. Elena Cruz", time: "9:45 AM - 10:45 AM", room: "Science Laboratory", type: "Core Subject", status: "Ongoing" },
            { code: "FIL-7", subject: "Filipino 7", teacher: "Mrs. Carmela Reyes", time: "10:45 AM - 11:45 AM", room: "Bldg A - Room 102", type: "Core Subject", status: "Upcoming" },
            { code: "LUNCH", subject: "Lunch Break", teacher: "Cafeteria / Grounds", time: "11:45 AM - 1:00 PM", room: "Campus", type: "Break", status: "Break" },
            { code: "AP-7", subject: "Araling Panlipunan 7", teacher: "Mr. Roberto Diaz", time: "1:00 PM - 2:00 PM", room: "Bldg A - Room 102", type: "Applied Subject", status: "Upcoming" },
            { code: "MAPEH-7", subject: "MAPEH (Music & Arts)", teacher: "Coach Arthur Lim", time: "2:00 PM - 3:00 PM", room: "Gymnasium", type: "Core Subject", status: "Upcoming" },
        ],
        Tuesday: [
            { code: "ESP-7", subject: "Edukasyon sa Pagpapakatao", teacher: "Mrs. Gina Morales", time: "7:30 AM - 8:30 AM", room: "Bldg A - Room 102", type: "Core Subject", status: "Upcoming" },
            { code: "TLE-7", subject: "Technology & Livelihood (TLE)", teacher: "Engr. Patrick Tan", time: "8:30 AM - 9:30 AM", room: "TLE Workshop Lab", type: "Applied Subject", status: "Upcoming" },
            { code: "RECESS", subject: "Morning Recess / Break", teacher: "Campus Cafeteria", time: "9:30 AM - 9:45 AM", room: "Ground Floor", type: "Break", status: "Break" },
            { code: "MATH-7", subject: "General Mathematics", teacher: "Mrs. Maria Santos", time: "9:45 AM - 10:45 AM", room: "Bldg A - Room 102", type: "Core Subject", status: "Upcoming" },
            { code: "ENG-7", subject: "English 7", teacher: "Mr. Juan Ramos", time: "10:45 AM - 11:45 AM", room: "Bldg A - Room 102", type: "Core Subject", status: "Upcoming" },
            { code: "LUNCH", subject: "Lunch Break", teacher: "Cafeteria / Grounds", time: "11:45 AM - 1:00 PM", room: "Campus", type: "Break", status: "Break" },
            { code: "SCI-7", subject: "Science & Technology", teacher: "Ms. Elena Cruz", time: "1:00 PM - 2:00 PM", room: "Science Laboratory", type: "Core Subject", status: "Upcoming" },
            { code: "HOMEROOM", subject: "Homeroom Guidance Program", teacher: "Mrs. Maria Santos", time: "2:00 PM - 3:00 PM", room: "Bldg A - Room 102", type: "Special Program", status: "Upcoming" },
        ],
        Wednesday: [
            { code: "FIL-7", subject: "Filipino 7", teacher: "Mrs. Carmela Reyes", time: "7:30 AM - 8:30 AM", room: "Bldg A - Room 102", type: "Core Subject", status: "Upcoming" },
            { code: "AP-7", subject: "Araling Panlipunan 7", teacher: "Mr. Roberto Diaz", time: "8:30 AM - 9:30 AM", room: "Bldg A - Room 102", type: "Applied Subject", status: "Upcoming" },
            { code: "RECESS", subject: "Morning Recess / Break", teacher: "Campus Cafeteria", time: "9:30 AM - 9:45 AM", room: "Ground Floor", type: "Break", status: "Break" },
            { code: "MAPEH-7", subject: "MAPEH (PE & Health)", teacher: "Coach Arthur Lim", time: "9:45 AM - 10:45 AM", room: "School Oval", type: "Core Subject", status: "Upcoming" },
            { code: "TLE-7", subject: "Technology & Livelihood (TLE)", teacher: "Engr. Patrick Tan", time: "10:45 AM - 11:45 AM", room: "TLE Workshop Lab", type: "Applied Subject", status: "Upcoming" },
            { code: "LUNCH", subject: "Lunch Break", teacher: "Cafeteria / Grounds", time: "11:45 AM - 1:00 PM", room: "Campus", type: "Break", status: "Break" },
            { code: "MATH-7", subject: "General Mathematics", teacher: "Mrs. Maria Santos", time: "1:00 PM - 2:00 PM", room: "Bldg A - Room 102", type: "Core Subject", status: "Upcoming" },
            { code: "LIB", subject: "Library & Research Period", teacher: "Ms. Clarissa Gomez", time: "2:00 PM - 3:00 PM", room: "Main Library", type: "Independent", status: "Upcoming" },
        ],
        Thursday: [
            { code: "ENG-7", subject: "English 7", teacher: "Mr. Juan Ramos", time: "7:30 AM - 8:30 AM", room: "Bldg A - Room 102", type: "Core Subject", status: "Upcoming" },
            { code: "SCI-7", subject: "Science & Technology", teacher: "Ms. Elena Cruz", time: "8:30 AM - 9:30 AM", room: "Science Laboratory", type: "Core Subject", status: "Upcoming" },
            { code: "RECESS", subject: "Morning Recess / Break", teacher: "Campus Cafeteria", time: "9:30 AM - 9:45 AM", room: "Ground Floor", type: "Break", status: "Break" },
            { code: "ESP-7", subject: "Edukasyon sa Pagpapakatao", teacher: "Mrs. Gina Morales", time: "9:45 AM - 10:45 AM", room: "Bldg A - Room 102", type: "Core Subject", status: "Upcoming" },
            { code: "FIL-7", subject: "Filipino 7", teacher: "Mrs. Carmela Reyes", time: "10:45 AM - 11:45 AM", room: "Bldg A - Room 102", type: "Core Subject", status: "Upcoming" },
            { code: "LUNCH", subject: "Lunch Break", teacher: "Cafeteria / Grounds", time: "11:45 AM - 1:00 PM", room: "Campus", type: "Break", status: "Break" },
            { code: "AP-7", subject: "Araling Panlipunan 7", teacher: "Mr. Roberto Diaz", time: "1:00 PM - 2:00 PM", room: "Bldg A - Room 102", type: "Applied Subject", status: "Upcoming" },
            { code: "TLE-7", subject: "Technology & Livelihood (TLE)", teacher: "Engr. Patrick Tan", time: "2:00 PM - 3:00 PM", room: "TLE Workshop Lab", type: "Applied Subject", status: "Upcoming" },
        ],
        Friday: [
            { code: "MAPEH-7", subject: "MAPEH (Integrated Arts)", teacher: "Coach Arthur Lim", time: "7:30 AM - 8:30 AM", room: "Gymnasium", type: "Core Subject", status: "Upcoming" },
            { code: "MATH-7", subject: "Math Remediation / Quiz", teacher: "Mrs. Maria Santos", time: "8:30 AM - 9:30 AM", room: "Bldg A - Room 102", type: "Evaluation", status: "Upcoming" },
            { code: "RECESS", subject: "Morning Recess / Break", teacher: "Campus Cafeteria", time: "9:30 AM - 9:45 AM", room: "Ground Floor", type: "Break", status: "Break" },
            { code: "SCI-7", subject: "Science Laboratory Experiment", teacher: "Ms. Elena Cruz", time: "9:45 AM - 10:45 AM", room: "Science Laboratory", type: "Lab Activity", status: "Upcoming" },
            { code: "READ-7", subject: "Drop Everything and Read (DEAR)", teacher: "Mr. Juan Ramos", time: "10:45 AM - 11:45 AM", room: "Bldg A - Room 102", type: "DepEd Program", status: "Upcoming" },
            { code: "LUNCH", subject: "Lunch Break", teacher: "Cafeteria / Grounds", time: "11:45 AM - 1:00 PM", room: "Campus", type: "Break", status: "Break" },
            { code: "CLUB", subject: "Student Clubs & Organization", teacher: "Club Advisers", time: "1:00 PM - 2:30 PM", room: "Designated Rooms", type: "Co-Curricular", status: "Upcoming" },
            { code: "FLAG", subject: "Flag Retreat & Cleanliness", teacher: "Class Officers", time: "2:30 PM - 3:00 PM", room: "Quadrangle", type: "Ceremony", status: "Upcoming" },
        ],
    };

    const currentClasses = scheduleData[selectedDay] || [];

    return (
        <StudentLayout title="Classes & Weekly Schedule">
            <Head title="Class Schedule - Bulusan NHS" />

            <div className="space-y-4 sm:space-y-6">
                {/* 🌟 BNHS Green Maximized Header Banner */}
                <div className="-mx-2.5 -mt-3.5 sm:mx-0 sm:mt-0 bg-gradient-to-r from-[#07241c] via-[#0f4c3a] to-[#0d5c43] rounded-b-3xl sm:rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden border-b sm:border border-emerald-400/20">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-teal-400/15 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-xs">
                                    Grade 7 • Section Rizal
                                </span>
                                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-400 text-slate-950">
                                    REGULAR CLASS
                                </span>
                                <span className="text-[10px] sm:text-xs font-semibold text-emerald-200 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                    S.Y. 2026-2027
                                </span>
                            </div>
                            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300 shrink-0" />
                                Official Class Timetable
                            </h2>
                            <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span>Room 102, Building A</span>
                                <span className="text-emerald-300/40 hidden sm:inline">•</span>
                                <span>Adviser: <strong className="font-bold text-white">Mrs. Maria Santos</strong></span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Day Navigation: Simple Dropdown on Mobile, Pill Tabs on Desktop */}
                <div className="bg-white rounded-2xl p-2.5 sm:p-1.5 shadow-xs border border-slate-200/80">
                    {/* 📱 Mobile Simple Dropdown */}
                    <div className="sm:hidden relative">
                        <div className="relative flex items-center">
                            <div className="absolute left-3.5 pointer-events-none text-emerald-600">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <select
                                value={selectedDay}
                                onChange={(e) => setSelectedDay(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer shadow-2xs"
                            >
                                {days.map((day) => (
                                    <option key={day} value={day}>
                                        {day} Schedule ({scheduleData[day]?.length || 0} Periods)
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3.5 pointer-events-none text-slate-400">
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    {/* 💻 Desktop Pill Tabs */}
                    <div className="hidden sm:flex items-center gap-1 overflow-x-auto">
                        {days.map((day) => (
                            <button
                                key={day}
                                type="button"
                                onClick={() => setSelectedDay(day)}
                                className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-xs font-bold transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                                    selectedDay === day
                                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-700/20"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                }`}
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{day}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Classes Timetable List */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <span>{selectedDay}'s Daily Subjects</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                                {currentClasses.length} Periods
                            </span>
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentClasses.map((item, index) => {
                            const isBreak = item.type === "Break";
                            return (
                                <div
                                    key={index}
                                    className={`p-4 rounded-2xl border transition duration-150 ${
                                        isBreak
                                            ? "bg-amber-50/50 border-amber-200/70"
                                            : item.status === "Ongoing"
                                            ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm"
                                            : "bg-white border-slate-200/80 hover:border-emerald-200 shadow-xs"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${
                                                    isBreak ? "bg-amber-200 text-amber-900" : "bg-slate-100 text-slate-700"
                                                }`}>
                                                    {item.code}
                                                </span>
                                                <span className="text-[10px] font-semibold text-slate-400">
                                                    {item.type}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-900">
                                                {item.subject}
                                            </h4>
                                        </div>

                                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                                            item.status === "Ongoing"
                                                ? "bg-emerald-600 text-white animate-pulse"
                                                : item.status === "Completed"
                                                ? "bg-slate-100 text-slate-600"
                                                : isBreak
                                                ? "bg-amber-100 text-amber-800"
                                                : "bg-teal-50 text-teal-700 border border-teal-200"
                                        }`}>
                                            {item.status}
                                        </span>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                            <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                            <span>{item.teacher}</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-slate-600">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="font-semibold">{item.time}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-slate-500">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{item.room}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
