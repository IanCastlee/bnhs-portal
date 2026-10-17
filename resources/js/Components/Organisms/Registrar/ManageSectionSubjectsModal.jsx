import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import Button from "@/Components/Atoms/Common/Button";
import {
    BookOpen,
    Clock,
    UserCheck,
    MapPin,
    Calendar,
    X,
    CheckCircle2,
    AlertCircle,
    Save,
    GraduationCap,
    Layers,
} from "lucide-react";

export default function ManageSectionSubjectsModal({
    isOpen = false,
    onClose,
    section = null,
    teachers = [],
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Kuhanin ang listahan ng subjects at kasalukuyang assignments sa tuwing bubuksan ang modal
    useEffect(() => {
        if (!isOpen || !section?.id) {
            setSubjects([]);
            setErrorMsg(null);
            setSuccessMsg(null);
            return;
        }

        let isMounted = true;
        setIsLoading(true);
        setErrorMsg(null);

        fetch(`/registrar/sectioning/${section.id}/subjects`, {
            headers: {
                Accept: "application/json",
            },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Hindi ma-load ang subjects para sa section na ito.");
                }
                return res.json();
            })
            .then((data) => {
                if (isMounted) {
                    setSubjects(data.subjects || []);
                    setIsLoading(false);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setErrorMsg(err.message || "Nagkaroon ng aberya sa pag-load.");
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [isOpen, section?.id]);

    if (!isOpen || !section) return null;

    const handleFieldChange = (index, field, value) => {
        setSubjects((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [field]: value,
            };
            return updated;
        });
    };

    const handleApplyDefaultDays = (days) => {
        setSubjects((prev) =>
            prev.map((s) => ({
                ...s,
                schedule_days: days,
            }))
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        router.post(
            `/registrar/sectioning/${section.id}/assign-subjects`,
            {
                assignments: subjects.map((s) => ({
                    subject_id: s.subject_id,
                    teacher_id: s.teacher_id ? Number(s.teacher_id) : null,
                    schedule_days: s.schedule_days || "Monday - Friday",
                    time_start: s.time_start || null,
                    time_end: s.time_end || null,
                    room: s.room || null,
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaving(false);
                    setSuccessMsg("Matagumpay na nai-save ang iskedyul at teaching loads!");
                    setTimeout(() => {
                        onClose();
                    }, 700);
                },
                onError: (err) => {
                    setIsSaving(false);
                    setErrorMsg(
                        typeof err === "string"
                            ? err
                            : Object.values(err)[0] || "Nagkaroon ng aberya sa pag-save."
                    );
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
                {/* 🌟 Modal Header (BNHS Green Gradient) */}
                <div className="shrink-0 p-5 sm:p-6 bg-gradient-to-r from-[#07241c] via-[#0f4c3a] to-[#0d5c43] text-white flex items-start justify-between gap-4 relative overflow-hidden shadow-sm">
                    <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-teal-400/10 rounded-full blur-xl pointer-events-none" />

                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-950 bg-emerald-300 px-2.5 py-0.5 rounded-lg shadow-2xs">
                                <BookOpen className="w-3.5 h-3.5" />
                                Teaching Load & Schedule
                            </span>
                            <span className="text-[11px] font-bold text-white bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-lg border border-white/20">
                                Section: <strong>{section.name}</strong>
                            </span>
                        </div>
                        <h3 className="text-base sm:text-xl font-black text-white tracking-tight">
                            Subject Teacher & Class Schedule Assignment
                        </h3>
                        <p className="text-xs text-emerald-100/90 leading-relaxed max-w-2xl">
                            I-assign ang bawat guro sa kanilang asignatura at itakda ang opisyal na araw, oras, at silid-aralan para sa Section na ito.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="relative z-10 p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 🔔 Feedback Messages */}
                {errorMsg && (
                    <div className="shrink-0 mx-4 sm:mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="shrink-0 mx-4 sm:mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* Quick Presets Bar */}
                <div className="shrink-0 px-4 sm:px-6 pt-3 pb-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs">
                    <span className="font-bold text-slate-600 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span>Quick Set Araw para sa Lahat:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => handleApplyDefaultDays("Monday - Friday")}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 transition cursor-pointer"
                        >
                            Mon - Fri
                        </button>
                        <button
                            type="button"
                            onClick={() => handleApplyDefaultDays("Monday, Wednesday, Friday")}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 transition cursor-pointer"
                        >
                            MWF
                        </button>
                        <button
                            type="button"
                            onClick={() => handleApplyDefaultDays("Tuesday, Thursday")}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 transition cursor-pointer"
                        >
                            TTh
                        </button>
                    </div>
                </div>

                {/* 📋 Subjects List / Table Form */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        {isLoading ? (
                            <div className="py-16 text-center space-y-3">
                                <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                                <p className="text-xs font-bold text-slate-600">
                                    Kinakarga ang curriculum subjects at schedule...
                                </p>
                            </div>
                        ) : subjects.length === 0 ? (
                            <div className="py-16 text-center space-y-2">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto font-black">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-800">
                                    Walang Curriculum Subjects na Natagpuan
                                </h4>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                    Pakitiyak na may mga nakatalagang subjects para sa Grade Level at Strand na ito sa database.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {subjects.map((item, idx) => (
                                    <div
                                        key={item.subject_id}
                                        className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 bg-white transition-all shadow-2xs space-y-3"
                                    >
                                        {/* Subject Title and Semester Info */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-800 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded">
                                                        {item.code}
                                                    </span>
                                                    <span className="font-black text-slate-900 text-sm ml-2">
                                                        {item.name}
                                                    </span>
                                                </div>
                                            </div>

                                            {item.semester && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 shrink-0 self-start sm:self-auto">
                                                    {item.semester === 1 ? "1st Sem" : item.semester === 2 ? "2nd Sem" : "Full Year"}
                                                </span>
                                            )}
                                        </div>

                                        {/* Input Matrix: Teacher, Days, Time, Room */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                            {/* 1. Teacher Selector */}
                                            <div className="space-y-1">
                                                <label className="block font-bold text-slate-700 flex items-center gap-1">
                                                    <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                                                    <span>Guro / Faculty:</span>
                                                </label>
                                                <select
                                                    value={item.teacher_id || ""}
                                                    onChange={(e) =>
                                                        handleFieldChange(
                                                            idx,
                                                            "teacher_id",
                                                            e.target.value ? Number(e.target.value) : null
                                                        )
                                                    }
                                                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                >
                                                    <option value="">-- Walang Guro Muna --</option>
                                                    {teachers.map((t) => (
                                                        <option key={t.id} value={t.id}>
                                                            {t.name} {t.employee_id ? `(${t.employee_id})` : ""}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* 2. Schedule Days */}
                                            <div className="space-y-1">
                                                <label className="block font-bold text-slate-700 flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                                                    <span>Mga Araw (Days):</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.schedule_days || ""}
                                                    placeholder="Hal. Monday - Friday"
                                                    onChange={(e) =>
                                                        handleFieldChange(idx, "schedule_days", e.target.value)
                                                    }
                                                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                />
                                            </div>

                                            {/* 3. Time Slots */}
                                            <div className="space-y-1">
                                                <label className="block font-bold text-slate-700 flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                                                    <span>Oras (Start - End):</span>
                                                </label>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="time"
                                                        value={item.time_start || ""}
                                                        onChange={(e) =>
                                                            handleFieldChange(idx, "time_start", e.target.value)
                                                        }
                                                        className="w-1/2 h-9 px-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                                                    />
                                                    <span className="text-slate-400 font-bold">-</span>
                                                    <input
                                                        type="time"
                                                        value={item.time_end || ""}
                                                        onChange={(e) =>
                                                            handleFieldChange(idx, "time_end", e.target.value)
                                                        }
                                                        className="w-1/2 h-9 px-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                                                    />
                                                </div>
                                            </div>

                                            {/* 4. Room */}
                                            <div className="space-y-1">
                                                <label className="block font-bold text-slate-700 flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                                                    <span>Silid-Aralan (Room):</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.room || ""}
                                                    placeholder="Hal. Bldg A Rm 101"
                                                    onChange={(e) =>
                                                        handleFieldChange(idx, "room", e.target.value)
                                                    }
                                                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 🌟 Modal Footer */}
                    <div className="shrink-0 p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-slate-500">
                            {subjects.length} Asignatura sa Curriculum
                        </span>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onClose}
                                disabled={isSaving}
                            >
                                Kanselahin
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                disabled={isSaving || isLoading || subjects.length === 0}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold gap-1.5"
                            >
                                <Save className="w-4 h-4" />
                                <span>{isSaving ? "Nagse-save..." : "I-save ang Schedule & Guro"}</span>
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
