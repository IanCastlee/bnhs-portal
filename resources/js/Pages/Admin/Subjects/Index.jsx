import React, { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Card from "@/Components/Atoms/Card";
import Button from "@/Components/Atoms/Button";
import Badge from "@/Components/Atoms/Badge";
import Input from "@/Components/Atoms/Input";
import {
    BookOpen,
    Plus,
    Search,
    Edit3,
    Trash2,
    X,
    Layers,
    GraduationCap,
    CheckCircle2,
    AlertCircle,
    Filter,
    Database,
    Zap,
} from "lucide-react";

export default function SubjectsIndex({
    subjects = [],
    gradeLevels = [],
    strands = [],
    stats = {},
    filters = {},
}) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);

    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const [selectedGradeId, setSelectedGradeId] = useState(filters.grade_level_id || "");
    const [selectedStrandId, setSelectedStrandId] = useState(filters.strand_id || "");

    // Create form state
    const createForm = useForm({
        grade_level_id: gradeLevels[0]?.id || "",
        strand_id: "",
        code: "",
        name: "",
        semester: "Full Year",
    });

    // Edit form state
    const editForm = useForm({
        grade_level_id: "",
        strand_id: "",
        code: "",
        name: "",
        semester: "Full Year",
    });

    // Filter submit
    const handleFilterChange = (newGradeId, newStrandId, search) => {
        router.get(
            "/admin/subjects",
            {
                grade_level_id: newGradeId || undefined,
                strand_id: newStrandId || undefined,
                search: search || undefined,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilterChange(selectedGradeId, selectedStrandId, searchQuery);
    };

    const handleResetFilters = () => {
        setSearchQuery("");
        setSelectedGradeId("");
        setSelectedStrandId("");
        router.get("/admin/subjects", {}, { preserveState: true });
    };

    // Open Edit modal
    const openEditModal = (subject) => {
        setSelectedSubject(subject);
        editForm.setData({
            grade_level_id: subject.grade_level_id,
            strand_id: subject.strand_id || "",
            code: subject.code,
            name: subject.name,
            semester: subject.semester || "Full Year",
        });
        editForm.clearErrors();
        setEditModalOpen(true);
    };

    // Open Delete confirmation
    const openDeleteModal = (subject) => {
        setSelectedSubject(subject);
        setDeleteModalOpen(true);
    };

    // Submit Create
    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post("/admin/subjects", {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    // Submit Edit
    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!selectedSubject) return;

        editForm.put(`/admin/subjects/${selectedSubject.id}`, {
            onSuccess: () => {
                setEditModalOpen(false);
                setSelectedSubject(null);
            },
        });
    };

    // Confirm Delete
    const handleDeleteConfirm = () => {
        if (!selectedSubject) return;

        router.delete(`/admin/subjects/${selectedSubject.id}`, {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedSubject(null);
            },
        });
    };

    // Helper to check if selected grade level in form is Senior High School
    const isSHSGrade = (gradeId) => {
        const found = gradeLevels.find((g) => String(g.id) === String(gradeId));
        return found?.category === "SHS" || (found?.level && found.level >= 11);
    };

    return (
        <PortalLayout title="Curriculum & Subjects Management">
            <Head title="Curriculum & Subjects - Admin Portal" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="font-semibold text-slate-500">
                                    DepEd Learning Areas & Curriculum
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    <Zap className="w-3 h-3 mr-1 text-emerald-600" />
                                    Redis Fast-Cached
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Curriculum Subjects Masterlist
                            </h1>
                            <p className="text-xs text-slate-500">
                                Pamahalaan ang mga learning areas para sa bawat Grade Level at Senior High Strand. Awtomatikong nagre-reflect sa Registrar sectioning.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                    createForm.clearErrors();
                                    createForm.reset({
                                        grade_level_id: selectedGradeId || gradeLevels[0]?.id || "",
                                        strand_id: "",
                                        code: "",
                                        name: "",
                                        semester: "Full Year",
                                    });
                                    setCreateModalOpen(true);
                                }}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs"
                            >
                                <Plus className="w-4 h-4 mr-1.5" />
                                <span>Add New Subject</span>
                            </Button>
                        </div>
                    </div>

                    {/* Integrated Key Stats Strip */}
                    <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 mt-5 pt-4 text-xs">
                        <div className="px-3 py-1 first:pl-0">
                            <span className="text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                                Total Subjects
                            </span>
                            <div className="flex items-baseline gap-2 mt-0.5">
                                <span className="text-2xl font-bold text-slate-900 font-mono">
                                    {stats.totalSubjects || 0}
                                </span>
                                <span className="text-[11px] text-slate-400">learning areas</span>
                            </div>
                        </div>

                        <div className="px-3 py-1">
                            <span className="text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                                Junior High School
                            </span>
                            <div className="flex items-baseline gap-2 mt-0.5">
                                <span className="text-2xl font-bold text-slate-900 font-mono">
                                    {stats.jhsSubjects || 0}
                                </span>
                                <span className="text-[11px] text-slate-400">Grade 7 to 10</span>
                            </div>
                        </div>

                        <div className="px-3 py-1">
                            <span className="text-slate-500 font-medium block text-[11px] uppercase tracking-wider">
                                Senior High School
                            </span>
                            <div className="flex items-baseline gap-2 mt-0.5">
                                <span className="text-2xl font-bold text-slate-900 font-mono">
                                    {stats.shsSubjects || 0}
                                </span>
                                <span className="text-[11px] text-slate-400">Grade 11 & 12 Strands</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search Bar */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
                    <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                        <div className="md:col-span-4 space-y-1">
                            <label className="block text-xs font-semibold text-slate-700">
                                Grade Level
                            </label>
                            <select
                                value={selectedGradeId}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedGradeId(val);
                                    handleFilterChange(val, selectedStrandId, searchQuery);
                                }}
                                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                            >
                                <option value="">All Grade Levels (7 - 12)</option>
                                {gradeLevels.map((lvl) => (
                                    <option key={lvl.id} value={lvl.id}>
                                        {lvl.name} ({lvl.category})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-3 space-y-1">
                            <label className="block text-xs font-semibold text-slate-700">
                                Strand (SHS Only)
                            </label>
                            <select
                                value={selectedStrandId}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedStrandId(val);
                                    handleFilterChange(selectedGradeId, val, searchQuery);
                                }}
                                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                            >
                                <option value="">All Strands / General</option>
                                {strands.map((st) => (
                                    <option key={st.id} value={st.id}>
                                        {st.code} - {st.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-3 space-y-1">
                            <label className="block text-xs font-semibold text-slate-700">
                                Search Code o Title
                            </label>
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="e.g. MATH-7, Science..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 text-xs rounded-lg border border-slate-300 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 flex items-center gap-2">
                            <Button
                                type="submit"
                                variant="outline"
                                size="sm"
                                className="w-full justify-center text-xs font-semibold h-[38px] border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                                Filter
                            </Button>
                            {(selectedGradeId || selectedStrandId || searchQuery) && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetFilters}
                                    className="px-2.5 h-[38px] text-xs text-slate-500 hover:text-slate-800"
                                    title="Reset Filters"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Subjects Masterlist Table */}
                <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-emerald-700" />
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                                Subjects List ({subjects.length})
                            </h2>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">
                            DepEd K to 12 Basic Education Curriculum
                        </span>
                    </div>

                    {subjects.length === 0 ? (
                        <div className="py-16 text-center text-slate-500 space-y-2">
                            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                            <p className="text-sm font-semibold text-slate-700">
                                Walang nahanap na subject
                            </p>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                Subukang baguhin ang mga filter o mag-click sa "Add New Subject" upang magdagdag ng bagong learning area.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-700">
                                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4">Subject Code</th>
                                        <th className="py-3 px-4">Subject Name</th>
                                        <th className="py-3 px-4">Grade Level</th>
                                        <th className="py-3 px-4">Strand</th>
                                        <th className="py-3 px-4">Semester</th>
                                        <th className="py-3 px-4 text-center">Sections Using</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {subjects.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-emerald-950">
                                                <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200/70">
                                                    {sub.code}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-medium text-slate-900">
                                                {sub.name}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-block px-2 py-0.5 font-semibold text-slate-700 bg-slate-100 rounded">
                                                    {sub.grade_level?.name || `Grade ${sub.grade_level_id}`}
                                                </span>
                                                <span className="ml-1 text-[10px] text-slate-400 font-mono">
                                                    ({sub.grade_level?.category || "JHS"})
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {sub.strand ? (
                                                    <span className="inline-block px-2 py-0.5 text-xs font-semibold text-blue-800 bg-blue-50 rounded border border-blue-200">
                                                        {sub.strand.code}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">General / Core</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600 font-medium">
                                                {sub.semester || "Full Year"}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="font-mono font-semibold text-slate-800">
                                                    {sub.section_subjects_count || 0}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditModal(sub)}
                                                        className="px-2 py-1 text-slate-600 hover:text-emerald-700 hover:border-emerald-300"
                                                        title="Edit Subject"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5 mr-1" />
                                                        <span>Edit</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openDeleteModal(sub)}
                                                        className="px-2 py-1 text-slate-500 hover:text-rose-700 hover:border-rose-300"
                                                        title="Delete Subject"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* CREATE MODAL */}
                {createModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                        <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-emerald-700" />
                                    <span>Add New Curriculum Subject</span>
                                </h3>
                                <button
                                    onClick={() => setCreateModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Grade Level *
                                        </label>
                                        <select
                                            value={createForm.data.grade_level_id}
                                            onChange={(e) => {
                                                createForm.setData("grade_level_id", e.target.value);
                                                if (!isSHSGrade(e.target.value)) {
                                                    createForm.setData("strand_id", "");
                                                }
                                            }}
                                            className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800"
                                            required
                                        >
                                            {gradeLevels.map((lvl) => (
                                                <option key={lvl.id} value={lvl.id}>
                                                    {lvl.name} ({lvl.category})
                                                </option>
                                            ))}
                                        </select>
                                        {createForm.errors.grade_level_id && (
                                            <p className="text-[11px] text-rose-600 mt-1">{createForm.errors.grade_level_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Strand (SHS)
                                        </label>
                                        <select
                                            value={createForm.data.strand_id}
                                            onChange={(e) => createForm.setData("strand_id", e.target.value)}
                                            disabled={!isSHSGrade(createForm.data.grade_level_id)}
                                            className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
                                        >
                                            <option value="">General / Core Subject</option>
                                            {strands.map((st) => (
                                                <option key={st.id} value={st.id}>
                                                    {st.code} ({st.name})
                                                </option>
                                            ))}
                                        </select>
                                        {createForm.errors.strand_id && (
                                            <p className="text-[11px] text-rose-600 mt-1">{createForm.errors.strand_id}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-1">
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Subject Code *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. MATH-7"
                                            value={createForm.data.code}
                                            onChange={(e) => createForm.setData("code", e.target.value.toUpperCase())}
                                            className="w-full text-xs font-mono uppercase rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800"
                                            required
                                        />
                                        {createForm.errors.code && (
                                            <p className="text-[11px] text-rose-600 mt-1">{createForm.errors.code}</p>
                                        )}
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Subject Name *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Mathematics 7"
                                            value={createForm.data.name}
                                            onChange={(e) => createForm.setData("name", e.target.value)}
                                            className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800"
                                            required
                                        />
                                        {createForm.errors.name && (
                                            <p className="text-[11px] text-rose-600 mt-1">{createForm.errors.name}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Semester Offering
                                    </label>
                                    <select
                                        value={createForm.data.semester}
                                        onChange={(e) => createForm.setData("semester", e.target.value)}
                                        className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800"
                                    >
                                        <option value="Full Year">Full Year (Standard JHS / Year-round)</option>
                                        <option value="1st Semester">1st Semester (SHS Semestral)</option>
                                        <option value="2nd Semester">2nd Semester (SHS Semestral)</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCreateModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="sm"
                                        disabled={createForm.processing}
                                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                                    >
                                        {createForm.processing ? "Saving..." : "Save Subject"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* EDIT MODAL */}
                {editModalOpen && selectedSubject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                        <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                    <Edit3 className="w-4 h-4 text-emerald-700" />
                                    <span>Edit Subject: {selectedSubject.code}</span>
                                </h3>
                                <button
                                    onClick={() => setEditModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Grade Level *
                                        </label>
                                        <select
                                            value={editForm.data.grade_level_id}
                                            onChange={(e) => {
                                                editForm.setData("grade_level_id", e.target.value);
                                                if (!isSHSGrade(e.target.value)) {
                                                    editForm.setData("strand_id", "");
                                                }
                                            }}
                                            className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800"
                                            required
                                        >
                                            {gradeLevels.map((lvl) => (
                                                <option key={lvl.id} value={lvl.id}>
                                                    {lvl.name} ({lvl.category})
                                                </option>
                                            ))}
                                        </select>
                                        {editForm.errors.grade_level_id && (
                                            <p className="text-[11px] text-rose-600 mt-1">{editForm.errors.grade_level_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Strand (SHS)
                                        </label>
                                        <select
                                            value={editForm.data.strand_id}
                                            onChange={(e) => editForm.setData("strand_id", e.target.value)}
                                            disabled={!isSHSGrade(editForm.data.grade_level_id)}
                                            className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
                                        >
                                            <option value="">General / Core Subject</option>
                                            {strands.map((st) => (
                                                <option key={st.id} value={st.id}>
                                                    {st.code} ({st.name})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-1">
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Subject Code *
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.data.code}
                                            onChange={(e) => editForm.setData("code", e.target.value.toUpperCase())}
                                            className="w-full text-xs font-mono uppercase rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800"
                                            required
                                        />
                                        {editForm.errors.code && (
                                            <p className="text-[11px] text-rose-600 mt-1">{editForm.errors.code}</p>
                                        )}
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Subject Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.data.name}
                                            onChange={(e) => editForm.setData("name", e.target.value)}
                                            className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800"
                                            required
                                        />
                                        {editForm.errors.name && (
                                            <p className="text-[11px] text-rose-600 mt-1">{editForm.errors.name}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Semester Offering
                                    </label>
                                    <select
                                        value={editForm.data.semester}
                                        onChange={(e) => editForm.setData("semester", e.target.value)}
                                        className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800"
                                    >
                                        <option value="Full Year">Full Year (Standard JHS / Year-round)</option>
                                        <option value="1st Semester">1st Semester (SHS Semestral)</option>
                                        <option value="2nd Semester">2nd Semester (SHS Semestral)</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="sm"
                                        disabled={editForm.processing}
                                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                                    >
                                        {editForm.processing ? "Updating..." : "Update Subject"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* DELETE CONFIRMATION MODAL */}
                {deleteModalOpen && selectedSubject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                        <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-full bg-rose-100 text-rose-600 shrink-0">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Burahin ang Subject?
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Sigurado ka bang nais mong alisin ang subject na{" "}
                                        <strong className="text-slate-800">
                                            {selectedSubject.code} ({selectedSubject.name})
                                        </strong>
                                        ?
                                    </p>
                                </div>
                            </div>

                            {selectedSubject.section_subjects_count > 0 && (
                                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                                    Babala: Ang subject na ito ay kasalukuyang nakatalaga sa{" "}
                                    <strong>{selectedSubject.section_subjects_count}</strong> klase. Hindi ito maaaring burahin upang maprotektahan ang mga records at grades.
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteModalOpen(false)}
                                >
                                    Kanselahin
                                </Button>
                                <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    disabled={selectedSubject.section_subjects_count > 0}
                                    onClick={handleDeleteConfirm}
                                    className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                                >
                                    Oo, Burahin
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PortalLayout>
    );
}
