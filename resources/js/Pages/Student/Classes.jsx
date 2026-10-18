import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import { useSchoolSettings } from "@/Hooks/useSchoolSettings";
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

export default function Classes({
    enrollment = null,
    subjects = [],
    scheduleList = [],
}) {
    const school = useSchoolSettings();
    const days = [
        "Lahat ng Asignatura",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
    ];
    const [selectedDay, setSelectedDay] = useState("Lahat ng Asignatura");

    const section = enrollment?.section;
    const adviserName = section?.adviser?.name || "Itatalaga Pa (TBA)";
    const gradeName = enrollment?.grade_level
        ? `Grade ${enrollment.grade_level.level} • Section ${section?.name || "TBA"}`
        : "Senior High School";
    const academicYearName = enrollment?.academic_year?.name || "2026-2027";

    // I-filter ang subjects ayon sa napiling araw
    const filteredClasses = scheduleList.filter((item) => {
        if (selectedDay === "Lahat ng Asignatura") return true;
        const daysStr = (item.schedule_days || "").toLowerCase();
        const targetDay = selectedDay.toLowerCase();

        if (
            daysStr.includes("monday - friday") ||
            daysStr.includes("mon - fri") ||
            daysStr.includes("daily") ||
            daysStr.includes("m-f")
        ) {
            return true;
        }

        if (targetDay === "monday" && (daysStr.includes("mon") || daysStr.includes("mwf"))) return true;
        if (targetDay === "tuesday" && (daysStr.includes("tue") || daysStr.includes("tth"))) return true;
        if (targetDay === "wednesday" && (daysStr.includes("wed") || daysStr.includes("mwf"))) return true;
        if (targetDay === "thursday" && (daysStr.includes("thu") || daysStr.includes("tth"))) return true;
        if (targetDay === "friday" && (daysStr.includes("fri") || daysStr.includes("mwf"))) return true;

        return daysStr.includes(targetDay);
    });

    return (
        <StudentLayout title="Classes & Weekly Schedule">
            <Head title={`Class Schedule - ${school.short_name}`} />

            <div className="sm:space-y-6">
                {/* 🌟 LAYER 1 (z-10): BNHS Green Maximized Header Banner Backdrop */}
                <div className="relative z-10 -mx-2.5 -mt-3.5 sm:mx-0 sm:mt-0 bg-gradient-to-br from-[#042219] via-[#0b4635] to-[#062d21] sm:rounded-2xl px-5 pt-4 pb-12 sm:p-6 text-white shadow-lg overflow-hidden sm:border border-emerald-400/15">
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
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-100 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                {gradeName}
                            </span>

                            <div className="flex items-center gap-1.5">
                                {enrollment?.strand && (
                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/25">
                                        {enrollment.strand.code || enrollment.strand.name}
                                    </span>
                                )}
                                <span className="text-[11px] text-emerald-200/80 font-normal">
                                    S.Y. {academicYearName}
                                </span>
                            </div>
                        </div>

                        <h2 className="text-base sm:text-xl font-semibold tracking-tight text-white flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 shrink-0" />
                            <span>Class Timetable & Learning Areas</span>
                        </h2>

                        <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-emerald-100/80">
                            <div className="flex items-center gap-1.5">
                                <span className="text-emerald-200/70">Section:</span>
                                <span className="font-medium text-white">{section?.name || "TBA"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-emerald-200/70">Adviser:</span>
                                <span className="font-medium text-white">{adviserName}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 📱 LAYER 2 (z-20): Overlapping Rounded Content Sheet on Mobile */}
                <div className="relative z-20 -mt-6 sm:mt-0 -mx-2.5 sm:mx-0 px-3.5 pt-5 pb-2 sm:p-0 bg-[#f4f7fa] sm:bg-transparent rounded-t-3xl sm:rounded-none shadow-[0_-6px_20px_rgba(0,0,0,0.08)] sm:shadow-none space-y-4 sm:space-y-6">
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
                                            {day}
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
                                <span>{selectedDay}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                                    {filteredClasses.length} Asignatura
                                </span>
                            </h3>
                        </div>

                        {filteredClasses.length === 0 ? (
                            <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
                                <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                                <h4 className="text-sm font-bold text-slate-700">
                                    Walang nakatakdang klase para sa {selectedDay}
                                </h4>
                                <p className="text-xs text-slate-400">
                                    Piliin ang "Lahat ng Asignatura" upang makita ang buong curriculum ng iyong section.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {filteredClasses.map((item) => (
                                    <div
                                        key={item.subject_id}
                                        className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-emerald-300 transition duration-150 shadow-xs flex flex-col justify-between space-y-3"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                        {item.code}
                                                    </span>
                                                    {item.semester && (
                                                        <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                                                            {item.semester === 1 ? "1st Sem" : "2nd Sem"}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="text-sm font-bold text-slate-900">
                                                    {item.name}
                                                </h4>
                                            </div>

                                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 bg-slate-100 text-slate-700 border border-slate-200">
                                                {item.schedule_days}
                                            </span>
                                        </div>

                                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                                            <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                                <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                <span>{item.teacher}</span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1 text-slate-600">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="font-semibold">
                                                        {item.time_start && item.time_end
                                                            ? `${item.time_start} - ${item.time_end}`
                                                            : "Oras: TBA"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-slate-500">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{item.room || "TBA"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
