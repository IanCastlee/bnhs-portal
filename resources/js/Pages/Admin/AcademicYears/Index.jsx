import React, { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Card from "@/Components/Atoms/Card";
import Button from "@/Components/Atoms/Button";
import Badge from "@/Components/Atoms/Badge";
import Input from "@/Components/Atoms/Input";
import {
    Calendar,
    Plus,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Sparkles,
    ShieldCheck,
    Users,
    Layers,
    Clock,
    Lock,
    Unlock,
    Radio,
    BookOpen,
    Edit3,
    Trash2,
    ArrowRight,
    ToggleLeft,
    ToggleRight,
    X,
} from "lucide-react";

export default function AcademicYearsIndex({ academicYears = [], activeYear = null, stats = {} }) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);

    // Form for creating new Academic Year
    const createForm = useForm({
        name: "",
        semester: "Full Year",
        is_active: false,
        is_enrollment_open: true,
        is_grading_open: true,
    });

    // Form for editing
    const editForm = useForm({
        name: "",
        semester: "Full Year",
    });

    // Auto calculate suggestion for next SY name
    const suggestNextYear = () => {
        if (academicYears.length > 0) {
            const sorted = [...academicYears].sort((a, b) => b.name.localeCompare(a.name));
            const latest = sorted[0].name;
            const parts = latest.split("-");
            if (parts.length === 2) {
                const nextStart = parseInt(parts[1], 10);
                const nextEnd = nextStart + 1;
                return `${nextStart}-${nextEnd}`;
            }
        }
        const cur = new Date().getFullYear();
        return `${cur}-${cur + 1}`;
    };

    const handleOpenCreateModal = () => {
        createForm.setData({
            name: suggestNextYear(),
            semester: "Full Year",
            is_active: false,
            is_enrollment_open: true,
            is_grading_open: true,
        });
        setCreateModalOpen(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post("/admin/academic-years", {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleOpenEditModal = (year) => {
        setSelectedYear(year);
        editForm.setData({
            name: year.name,
            semester: year.semester,
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!selectedYear) return;
        editForm.put(`/admin/academic-years/${selectedYear.id}`, {
            onSuccess: () => {
                setEditModalOpen(false);
                setSelectedYear(null);
            },
        });
    };

    const handleToggleActive = (year) => {
        if (year.is_active) return;
        if (confirm(`Are you sure you want to activate S.Y. ${year.name}? This will set all other school years as inactive.`)) {
            router.patch(`/admin/academic-years/${year.id}/active`);
        }
    };

    const handleToggleEnrollment = (year) => {
        const action = year.is_enrollment_open ? "CLOSE" : "OPEN";
        if (confirm(`Are you sure you want to ${action} online admission/enrollment for S.Y. ${year.name}?`)) {
            router.patch(`/admin/academic-years/${year.id}/enrollment`);
        }
    };

    const handleToggleGrading = (year) => {
        const action = year.is_grading_open ? "CLOSE" : "OPEN";
        if (confirm(`Are you sure you want to ${action} teacher grade encoding for S.Y. ${year.name}?`)) {
            router.patch(`/admin/academic-years/${year.id}/grading`);
        }
    };

    const handleDeleteYear = (year) => {
        if (year.is_active) {
            alert("Cannot delete the active school year.");
            return;
        }
        if (confirm(`Are you sure you want to delete S.Y. ${year.name}? This action cannot be undone.`)) {
            router.delete(`/admin/academic-years/${year.id}`);
        }
    };

    return (
        <PortalLayout title="Academic Year Management">
            <Head title="Manage School Years - BNHS Admin" />

            <div className="space-y-6">
                {/* 🌟 Header & Action */}
                <div className="bg-gradient-to-r from-[#0f4c3a] via-[#107050] to-[#0d5c43] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold backdrop-blur-xs flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> DepEd School Calendar
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-bold border border-emerald-400/30 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Single-Active Enforced
                            </span>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">School Year & Period Management</h2>
                        <p className="text-emerald-100 text-xs mt-1 font-medium">
                            Configure academic cycles, toggle public online admission windows, and control quarterly grading access.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenCreateModal}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs shadow-md transition shrink-0 cursor-pointer self-start md:self-auto"
                    >
                        <Plus className="w-4 h-4 text-emerald-700" />
                        <span>Create New School Year</span>
                    </button>
                </div>

                {/* 📊 KPI Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4 rounded-2xl border border-slate-200/80 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active School Year</p>
                                <p className="text-xl font-black text-slate-900 mt-1 flex items-center gap-1.5">
                                    {stats.activeYearName}
                                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse" />
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/10">
                                <Calendar className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Currently active portal database</p>
                    </Card>

                    <Card className="p-4 rounded-2xl border border-slate-200/80 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Admission Window</p>
                                <div className="mt-1">
                                    {stats.isEnrollmentOpen ? (
                                        <Badge variant="success" className="bg-emerald-100 text-emerald-800 text-xs font-black">
                                            <Unlock className="w-3 h-3 mr-1" /> OPEN (Accepting)
                                        </Badge>
                                    ) : (
                                        <Badge variant="danger" className="bg-rose-100 text-rose-800 text-xs font-black">
                                            <Lock className="w-3 h-3 mr-1" /> CLOSED
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ${stats.isEnrollmentOpen ? "bg-emerald-50 text-emerald-600 ring-emerald-500/10" : "bg-rose-50 text-rose-600 ring-rose-500/10"}`}>
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Online student BEEF registration</p>
                    </Card>

                    <Card className="p-4 rounded-2xl border border-slate-200/80 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Grading Window</p>
                                <div className="mt-1">
                                    {stats.isGradingOpen ? (
                                        <Badge variant="primary" className="bg-blue-100 text-blue-800 text-xs font-black">
                                            <Unlock className="w-3 h-3 mr-1" /> OPEN (Teachers)
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs font-black">
                                            <Lock className="w-3 h-3 mr-1" /> LOCKED
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ${stats.isGradingOpen ? "bg-blue-50 text-blue-600 ring-blue-500/10" : "bg-slate-100 text-slate-600 ring-slate-900/10"}`}>
                                <BookOpen className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Faculty quarterly encoding deadline</p>
                    </Card>

                    <Card className="p-4 rounded-2xl border border-slate-200/80 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total School Years</p>
                                <p className="text-xl font-black text-slate-900 mt-1">{stats.totalYears} Years</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center ring-1 ring-teal-500/10">
                                <Layers className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Recorded historical cycles</p>
                    </Card>
                </div>

                {/* 📋 Academic Years Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">School Year Directory</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Toggle active state, configure enrollment windows, and monitor student counts.</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200/80">
                                <tr>
                                    <th className="py-3.5 px-4">School Year & Semester</th>
                                    <th className="py-3.5 px-4 text-center">Active Status</th>
                                    <th className="py-3.5 px-4 text-center">Admission Portal</th>
                                    <th className="py-3.5 px-4 text-center">Faculty Grading</th>
                                    <th className="py-3.5 px-4 text-center">Enrolled / Sections</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {academicYears.map((year) => (
                                    <tr key={year.id} className={`hover:bg-slate-50/60 transition ${year.is_active ? "bg-emerald-50/30" : ""}`}>
                                        {/* School Year Info */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${year.is_active ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-600"}`}>
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-slate-900">S.Y. {year.name}</span>
                                                        {year.is_active && (
                                                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-wide border border-emerald-300">
                                                                CURRENT ACTIVE
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 font-medium">{year.semester}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Active Toggle */}
                                        <td className="py-4 px-4 text-center">
                                            {year.is_active ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleToggleActive(year)}
                                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-600 font-bold text-[11px] transition shadow-xs cursor-pointer"
                                                >
                                                    Set as Active
                                                </button>
                                            )}
                                        </td>

                                        {/* Admission Portal Toggle */}
                                        <td className="py-4 px-4 text-center">
                                            <button
                                                onClick={() => handleToggleEnrollment(year)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition shadow-xs cursor-pointer ${
                                                    year.is_enrollment_open
                                                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                }`}
                                            >
                                                {year.is_enrollment_open ? (
                                                    <>
                                                        <Unlock className="w-3 h-3 text-emerald-600" /> Open
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock className="w-3 h-3 text-slate-400" /> Closed
                                                    </>
                                                )}
                                            </button>
                                        </td>

                                        {/* Faculty Grading Toggle */}
                                        <td className="py-4 px-4 text-center">
                                            <button
                                                onClick={() => handleToggleGrading(year)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition shadow-xs cursor-pointer ${
                                                    year.is_grading_open
                                                        ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                }`}
                                            >
                                                {year.is_grading_open ? (
                                                    <>
                                                        <Unlock className="w-3 h-3 text-blue-600" /> Open
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock className="w-3 h-3 text-slate-400" /> Closed
                                                    </>
                                                )}
                                            </button>
                                        </td>

                                        {/* Enrolled Counts */}
                                        <td className="py-4 px-4 text-center">
                                            <div className="font-bold text-slate-800">{year.enrollments_count ?? 0} Students</div>
                                            <div className="text-[10px] text-slate-400 font-medium">{year.sections_count ?? 0} Sections</div>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleOpenEditModal(year)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                                                    title="Edit School Year"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>

                                                {!year.is_active && (year.enrollments_count === 0) && (
                                                    <button
                                                        onClick={() => handleDeleteYear(year)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                                        title="Delete Empty School Year"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ℹ️ DepEd Operational Policy Tip */}
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/60 flex items-start gap-3 text-xs text-emerald-900">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">DepEd School Calendar Operational Best Practice</p>
                        <p className="text-emerald-800/90 text-[11px] mt-0.5">
                            When activating a new School Year (e.g. S.Y. 2028-2029), historical student grades, SF9, and SF10 permanent records from previous years (2026-2027, 2027-2028) remain fully archived and tamper-proof. Students who completed previous years will automatically be recognized as continuing old students during re-enrollment.
                        </p>
                    </div>
                </div>
            </div>

            {/* ➕ CREATE SCHOOL YEAR MODAL */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-base">Create New School Year</h3>
                                    <p className="text-xs text-slate-500 font-medium">Add a new academic cycle to the portal</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setCreateModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    School Year Name (YYYY-YYYY) <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData("name", e.target.value)}
                                    placeholder="e.g. 2028-2029"
                                    required
                                    className="font-mono text-sm font-bold"
                                />
                                {createForm.errors.name && (
                                    <p className="text-[11px] text-rose-600 font-medium mt-1">{createForm.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Semester / Cycle <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={createForm.data.semester}
                                    onChange={(e) => createForm.setData("semester", e.target.value)}
                                    className="w-full text-xs font-bold rounded-xl border border-slate-300 py-2.5 px-3 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                                >
                                    <option value="Full Year">Full Year (Junior / Senior High Standard)</option>
                                    <option value="1st Semester">1st Semester</option>
                                    <option value="2nd Semester">2nd Semester</option>
                                    <option value="Summer">Summer Term / Remedial</option>
                                </select>
                            </div>

                            <div className="space-y-3 pt-2 border-t border-slate-100">
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={createForm.data.is_active}
                                        onChange={(e) => createForm.setData("is_active", e.target.checked)}
                                        className="rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                    />
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Set as Active School Year Immediately</p>
                                        <p className="text-[10px] text-slate-500">Deactivates the current active school year</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={createForm.data.is_enrollment_open}
                                        onChange={(e) => createForm.setData("is_enrollment_open", e.target.checked)}
                                        className="rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                    />
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Open Online Admission & Registration</p>
                                        <p className="text-[10px] text-slate-500">Allows incoming & old students to submit BEEF enrollment forms</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={createForm.data.is_grading_open}
                                        onChange={(e) => createForm.setData("is_grading_open", e.target.checked)}
                                        className="rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                    />
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Open Faculty Grade Encoding Window</p>
                                        <p className="text-[10px] text-slate-500">Allows subject teachers to encode DepEd quarterly grades</p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setCreateModalOpen(false)}
                                    className="text-xs font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={createForm.processing}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md"
                                >
                                    {createForm.processing ? "Creating S.Y..." : "Save & Create School Year"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ✏️ EDIT SCHOOL YEAR MODAL */}
            {editModalOpen && selectedYear && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h3 className="font-black text-slate-900 text-base">Edit School Year</h3>
                            <button
                                onClick={() => setEditModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    School Year Name
                                </label>
                                <Input
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData("name", e.target.value)}
                                    placeholder="e.g. 2027-2028"
                                    required
                                    className="font-mono text-sm font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Semester / Cycle
                                </label>
                                <select
                                    value={editForm.data.semester}
                                    onChange={(e) => editForm.setData("semester", e.target.value)}
                                    className="w-full text-xs font-bold rounded-xl border border-slate-300 py-2.5 px-3 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                                >
                                    <option value="Full Year">Full Year</option>
                                    <option value="1st Semester">1st Semester</option>
                                    <option value="2nd Semester">2nd Semester</option>
                                    <option value="Summer">Summer Term</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setEditModalOpen(false)}
                                    className="text-xs font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={editForm.processing}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md"
                                >
                                    {editForm.processing ? "Saving..." : "Update School Year"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PortalLayout>
    );
}
