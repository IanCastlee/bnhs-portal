import React, { useState } from "react";
import { Head, router, Link } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Card from "@/Components/Atoms/Common/Card";
import Badge from "@/Components/Atoms/Common/Badge";
import Button from "@/Components/Atoms/Common/Button";
import Input from "@/Components/Atoms/Common/Input";
import {
    Layers,
    Users,
    Sparkles,
    Plus,
    RotateCcw,
    CheckCircle2,
    AlertCircle,
    UserPlus,
    ChevronRight,
    ArrowRightLeft,
    GraduationCap,
    School,
    Shield,
    X,
    Filter,
    Trash2,
    BookOpen,
    Pencil,
} from "lucide-react";
import ManageSectionSubjectsModal from "@/Components/Organisms/Registrar/ManageSectionSubjectsModal";
import { toast } from "@/Context/ToastContext";

export default function Sectioning({
    assignedGradeLevels = [],
    selectedGradeLevelId = 0,
    selectedGradeLevel = null,
    activeSchoolYear = null,
    sections = [],
    unsectionedStudents = [],
    teachers = [],
}) {
    const [selectedGrade, setSelectedGrade] = useState(selectedGradeLevelId);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDistributeModal, setShowDistributeModal] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [movingStudent, setMovingStudent] = useState(null);
    const [targetMoveSectionId, setTargetMoveSectionId] = useState("");

    // Create Section Form State
    const [newSectionName, setNewSectionName] = useState("");
    const [newSectionCapacity, setNewSectionCapacity] = useState(45);
    const [newSectionAdviserId, setNewSectionAdviserId] = useState("");
    const [isCreatingSection, setIsCreatingSection] = useState(false);

    // Edit Section Form State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [editSectionName, setEditSectionName] = useState("");
    const [editSectionCapacity, setEditSectionCapacity] = useState(45);
    const [editSectionAdviserId, setEditSectionAdviserId] = useState("");
    const [isUpdatingSection, setIsUpdatingSection] = useState(false);

    const openEditModal = (section) => {
        setEditingSection(section);
        setEditSectionName(section.name || "");
        setEditSectionCapacity(section.capacity || 45);
        setEditSectionAdviserId(
            section.adviser_id ? String(section.adviser_id) : ""
        );
        setShowEditModal(true);
    };

    const handleUpdateSection = (e) => {
        e.preventDefault();
        if (!editSectionName.trim() || !editingSection) return;

        setIsUpdatingSection(true);
        router.put(
            `/registrar/sectioning/${editingSection.id}`,
            {
                name: editSectionName.trim(),
                capacity: parseInt(editSectionCapacity, 10),
                adviser_id: editSectionAdviserId || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowEditModal(false);
                    setIsUpdatingSection(false);
                    setEditingSection(null);
                },
                onError: () => setIsUpdatingSection(false),
            }
        );
    };

    // Adviser Modal State
    const [showAdviserModal, setShowAdviserModal] = useState(false);
    const [targetSectionForAdviser, setTargetSectionForAdviser] = useState(null);
    const [selectedAdviserId, setSelectedAdviserId] = useState("");
    const [isAssigningAdviser, setIsAssigningAdviser] = useState(false);

    // Subject & Teacher Schedule Modal State
    const [showSubjectsModal, setShowSubjectsModal] = useState(false);
    const [targetSectionForSubjects, setTargetSectionForSubjects] = useState(null);

    const openSubjectsModal = (section) => {
        setTargetSectionForSubjects(section);
        setShowSubjectsModal(true);
    };

    // Auto-Distribute Form State
    const [selectedSectionIds, setSelectedSectionIds] = useState(
        sections.map((s) => s.id)
    );
    const [selectedStrategy, setSelectedStrategy] = useState("heterogeneous_balanced");
    const [isDistributing, setIsDistributing] = useState(false);

    // Filter unsectioned table
    const [searchStudent, setSearchStudent] = useState("");

    // Total counts
    const totalSectioned = sections.reduce(
        (sum, s) => sum + (s.enrolled_count || 0),
        0
    );
    const totalApproved = totalSectioned + unsectionedStudents.length;

    // Switch Grade Level
    const handleGradeLevelChange = (gradeId) => {
        setSelectedGrade(gradeId);
        router.get(
            "/registrar/sectioning",
            { grade_level_id: gradeId },
            { preserveState: true }
        );
    };

    // Create New Section
    const handleCreateSection = (e) => {
        e.preventDefault();
        if (!newSectionName.trim()) return;

        setIsCreatingSection(true);
        router.post(
            "/registrar/sectioning/create-section",
            {
                grade_level_id: selectedGrade,
                name: newSectionName,
                capacity: newSectionCapacity,
                adviser_id: newSectionAdviserId ? Number(newSectionAdviserId) : null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCreatingSection(false);
                    setShowCreateModal(false);
                    setNewSectionName("");
                    setNewSectionCapacity(45);
                    setNewSectionAdviserId("");
                },
                onError: () => setIsCreatingSection(false),
            }
        );
    };

    // Open Assign Class Adviser Modal
    const openAdviserModal = (section) => {
        setTargetSectionForAdviser(section);
        setSelectedAdviserId(section.adviser_id ? String(section.adviser_id) : "");
        setShowAdviserModal(true);
    };

    // Submit Adviser Assignment
    const handleAssignAdviser = (e) => {
        e.preventDefault();
        if (!targetSectionForAdviser) return;

        setIsAssigningAdviser(true);
        router.patch(
            `/registrar/sectioning/${targetSectionForAdviser.id}/assign-adviser`,
            {
                adviser_id: selectedAdviserId ? Number(selectedAdviserId) : null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsAssigningAdviser(false);
                    setShowAdviserModal(false);
                    setTargetSectionForAdviser(null);
                },
                onError: () => setIsAssigningAdviser(false),
            }
        );
    };

    // Run Auto-Distribution
    const handleAutoDistribute = (e) => {
        e.preventDefault();
        if (selectedSectionIds.length < 2) {
            toast.warning("Pumili ng hindi bababa sa dalawang (2) sections para sa auto-distribution.");
            return;
        }

        setIsDistributing(true);
        router.post(
            "/registrar/sectioning/auto-distribute",
            {
                grade_level_id: selectedGrade,
                section_ids: selectedSectionIds,
                strategy: selectedStrategy,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsDistributing(false);
                    setShowDistributeModal(false);
                },
                onError: () => setIsDistributing(false),
            }
        );
    };

    // Open Manual Move Modal
    const openMoveModal = (enrollment) => {
        setMovingStudent(enrollment);
        setTargetMoveSectionId(enrollment.section_id || (sections[0]?.id ? String(sections[0].id) : ""));
        setShowMoveModal(true);
    };

    // Submit Manual Move
    const handleManualAssign = (e) => {
        e.preventDefault();
        if (!movingStudent || !targetMoveSectionId) return;

        router.post(
            "/registrar/sectioning/assign-single",
            {
                enrollment_id: movingStudent.id,
                section_id: targetMoveSectionId,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowMoveModal(false);
                    setMovingStudent(null);
                },
            }
        );
    };

    // Reset Sectioning for Grade Level
    const handleResetAll = () => {
        if (
            confirm(
                `Sigurado ka bang nais mong i-reset ang lahat ng section assignments para sa Grade ${selectedGradeLevel?.level}? Lahat ng estudyante ay babalik sa unassigned pool.`
            )
        ) {
            router.post(
                "/registrar/sectioning/reset",
                { grade_level_id: selectedGrade },
                { preserveScroll: true }
            );
        }
    };

    // Delete a section
    const handleDeleteSection = (section) => {
        const count = section.enrolled_count || 0;
        const msg = count > 0
            ? `Sigurado ka bang nais mong tanggalin ang Section ${section.name}? Ang ${count} estudyanteng naka-assign dito ay babalik sa Unassigned Pool.`
            : `Sigurado ka bang nais mong tanggalin ang Section ${section.name}?`;

        if (confirm(msg)) {
            router.delete(`/registrar/sectioning/${section.id}`, {
                preserveScroll: true,
            });
        }
    };

    const filteredUnsectioned = unsectionedStudents.filter((s) => {
        const query = searchStudent.toLowerCase();
        return (
            s.student?.name?.toLowerCase().includes(query) ||
            s.student?.lrn?.toLowerCase().includes(query) ||
            s.tracking_number?.toLowerCase().includes(query)
        );
    });

    return (
        <PortalLayout title="Class Sectioning">
            <Head title={`Class Sectioning - Grade ${selectedGradeLevel?.level || ""}`} />

            <div className="space-y-6 max-w-7xl mx-auto pb-12">
                {/* 🌟 Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    Class Sectioning
                                </h1>
                                <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                                    S.Y. {activeSchoolYear?.name || "2027-2028"}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Pamamahala ng mga sections at paghahati ng mga opisyal na na-enrolled na mag-aaral.
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCreateModal(true)}
                            className="gap-1.5 font-bold"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Magdagdag ng Section</span>
                        </Button>

                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            disabled={unsectionedStudents.length === 0 || sections.length < 2}
                            onClick={() => {
                                setSelectedSectionIds(sections.map((s) => s.id));
                                setShowDistributeModal(true);
                            }}
                            className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Auto-Distribute ({unsectionedStudents.length} Pool)</span>
                        </Button>
                    </div>
                </div>

                {/* 🏷️ Grade Level Selector Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {assignedGradeLevels.map((gl) => {
                        const isSelected = gl.id === selectedGrade;
                        return (
                            <button
                                key={gl.id}
                                type="button"
                                onClick={() => handleGradeLevelChange(gl.id)}
                                className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition shrink-0 cursor-pointer flex items-center gap-2 border ${
                                    isSelected
                                        ? "bg-emerald-700 text-white border-emerald-700 shadow-md"
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                                }`}
                            >
                                <School className="w-4 h-4" />
                                <span>Grade {gl.level} ({gl.name})</span>
                            </button>
                        );
                    })}
                </div>

                {/* 📊 Summary Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Kabuuang Enrolled
                            </p>
                            <p className="text-2xl font-black text-slate-900 mt-1">
                                {totalApproved}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                            <Users className="w-5 h-5" />
                        </div>
                    </Card>

                    <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                                May Section Na
                            </p>
                            <p className="text-2xl font-black text-emerald-700 mt-1">
                                {totalSectioned}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </Card>

                    <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                                Unassigned Pool
                            </p>
                            <p className="text-2xl font-black text-amber-700 mt-1">
                                {unsectionedStudents.length}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </Card>
                </div>

                {/* 🏫 Sections Roster Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                            <span>Mga Sections sa Grade {selectedGradeLevel?.level}</span>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                {sections.length} Sections
                            </span>
                        </h2>

                        {totalSectioned > 0 && (
                            <button
                                type="button"
                                onClick={handleResetAll}
                                className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>I-reset ang Lahat ng Sections</span>
                            </button>
                        )}
                    </div>

                    {sections.length === 0 ? (
                        <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                                <Layers className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm sm:text-base font-bold text-slate-800">
                                Wala pang Section sa Grade {selectedGradeLevel?.level}
                            </h3>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                                Mag-click sa "Magdagdag ng Section" sa itaas upang simulan ang paggawa ng mga klase.
                            </p>
                            <Button
                                size="sm"
                                variant="primary"
                                onClick={() => setShowCreateModal(true)}
                                className="gap-1.5 bg-emerald-700 text-white font-bold"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Gumawa ng Unang Section</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {sections.map((section) => {
                                const enrolled = section.enrolled_count || 0;
                                const capacity = section.capacity || 45;
                                const percent = Math.min(
                                    Math.round((enrolled / capacity) * 100),
                                    100
                                );

                                const malesCount = (section.enrollments || []).filter(
                                    (e) => (e.gender || "").toUpperCase() === "MALE"
                                ).length;
                                const femalesCount = (section.enrollments || []).filter(
                                    (e) => (e.gender || "").toUpperCase() === "FEMALE"
                                ).length;

                                return (
                                    <div
                                        key={section.id}
                                        className="bg-white rounded-3xl border border-slate-200/90 shadow-xs flex flex-col overflow-hidden hover:border-emerald-300 transition-all"
                                    >
                                        {/* Card Header */}
                                        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="space-y-1">
                                                    <h3 className="font-black text-slate-900 text-base">
                                                        {section.name}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="text-[11px] text-slate-500 font-semibold">
                                                            Adviser:
                                                        </span>
                                                        {section.adviser ? (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                                                                <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                                                                <span className="truncate max-w-[130px]">{section.adviser.name}</span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                                                                Walang Adviser
                                                            </span>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => openAdviserModal(section)}
                                                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                                                        >
                                                            {section.adviser ? "Palitan" : "I-assign"}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span
                                                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                                                            enrolled >= capacity
                                                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                                                : "bg-emerald-50 text-emerald-800 border-emerald-200"
                                                        }`}
                                                    >
                                                        {enrolled} / {capacity}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(section)}
                                                        className="p-1 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                                                        title={`I-edit ang mga detalye ng Section ${section.name}`}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteSection(section)}
                                                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                                        title={`Tanggalin ang Section ${section.name}`}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Capacity Bar */}
                                            <div className="space-y-1">
                                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-300 ${
                                                            percent >= 100
                                                                ? "bg-rose-500"
                                                                : percent >= 80
                                                                ? "bg-amber-500"
                                                                : "bg-emerald-600"
                                                        }`}
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase">
                                                    <span>Males: {malesCount}</span>
                                                    <span>Females: {femalesCount}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Students List in Section */}
                                        <div className="p-4 flex-1 max-h-64 overflow-y-auto space-y-2 divide-y divide-slate-100">
                                            {(section.enrollments || []).length === 0 ? (
                                                <p className="text-xs text-slate-400 text-center py-6 italic">
                                                    Walang pang naka-assign na estudyante.
                                                </p>
                                            ) : (
                                                section.enrollments.map((enrollment, idx) => (
                                                    <div
                                                        key={enrollment.id}
                                                        className="pt-2 flex items-center justify-between gap-2 text-xs"
                                                    >
                                                        <div className="truncate min-w-0 flex items-center gap-1.5">
                                                            <span className="text-[10px] font-mono text-slate-400">
                                                                {idx + 1}.
                                                            </span>
                                                            <span className="font-bold text-slate-900 truncate">
                                                                {enrollment.student?.name}
                                                            </span>
                                                            {enrollment.general_average && (
                                                                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 rounded">
                                                                    {enrollment.general_average}%
                                                                </span>
                                                            )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => openMoveModal(enrollment)}
                                                            className="text-[11px] font-bold text-slate-500 hover:text-emerald-700 cursor-pointer p-1 rounded-md hover:bg-slate-100 transition"
                                                            title="Ilipat sa ibang Section"
                                                        >
                                                            <ArrowRightLeft className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Card Footer: Subjects & Schedule */}
                                        <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openSubjectsModal(section)}
                                                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                            >
                                                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                                                <span>I-manage ang Subjects & Schedule</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 📋 Unassigned Approved Students Table */}
                {unsectionedStudents.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                                    <span>Unassigned Students Pool</span>
                                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                                        {unsectionedStudents.length} Mag-aaral
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Mga opisyal na na-approved na estudyante na naghihintay ng sectioning.
                                </p>
                            </div>

                            {/* Search Filter */}
                            <div className="w-full sm:w-64">
                                <Input
                                    placeholder="Hanapin sa pangalan o LRN..."
                                    value={searchStudent}
                                    onChange={(e) => setSearchStudent(e.target.value)}
                                    className="text-xs h-9"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-y border-slate-200">
                                        <th className="py-2.5 px-3">Student Name</th>
                                        <th className="py-2.5 px-3">LRN</th>
                                        <th className="py-2.5 px-3">Kasarian</th>
                                        <th className="py-2.5 px-3">General Average</th>
                                        <th className="py-2.5 px-3 text-right">Aksyon</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUnsectioned.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition">
                                            <td className="py-2.5 px-3 font-bold text-slate-900">
                                                {item.student?.name}
                                            </td>
                                            <td className="py-2.5 px-3 font-mono text-slate-600">
                                                {item.student?.lrn || "N/A"}
                                            </td>
                                            <td className="py-2.5 px-3 capitalize text-slate-700">
                                                {item.gender || "Unspecified"}
                                            </td>
                                            <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">
                                                {item.general_average ? `${item.general_average}%` : "Pending"}
                                            </td>
                                            <td className="py-2.5 px-3 text-right">
                                                <Button
                                                    size="xs"
                                                    variant="outline"
                                                    disabled={sections.length === 0}
                                                    onClick={() => openMoveModal(item)}
                                                    className="gap-1 font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                                >
                                                    <UserPlus className="w-3.5 h-3.5" />
                                                    <span>I-assign sa Section</span>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ➕ Modal: Create New Section */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
                        <div className="p-5 bg-gradient-to-r from-[#07241c] via-[#0f4c3a] to-[#0d5c43] text-white flex items-center justify-between shadow-xs">
                            <h3 className="font-black text-white text-base flex items-center gap-2">
                                <Plus className="w-5 h-5 text-emerald-300" />
                                <span>Bagong Section (Grade {selectedGradeLevel?.level})</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSection} className="p-6 space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Pangalan ng Section
                                </label>
                                <Input
                                    value={newSectionName}
                                    onChange={(e) => setNewSectionName(e.target.value)}
                                    placeholder="hal. Rizal, Diamond, Bonifacio"
                                    required
                                    className="h-10 text-xs"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Maximum Capacity
                                </label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="150"
                                    value={newSectionCapacity}
                                    onChange={(e) => setNewSectionCapacity(Number(e.target.value))}
                                    required
                                    className="h-10 text-xs"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    DepEd Standard: 40-45 (Maaaring lumagpas batay sa pangangailangan ng paaralan).
                                </p>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Class Adviser (Opsyonal)
                                </label>
                                <select
                                    value={newSectionAdviserId}
                                    onChange={(e) => setNewSectionAdviserId(e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="">-- Walang Adviser Muna --</option>
                                    {teachers.map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.name}
                                            {teacher.employee_id ? ` (${teacher.employee_id})` : ""}
                                            {teacher.current_advisory
                                                ? ` [May hawak: ${teacher.current_advisory.grade_name} - ${teacher.current_advisory.section_name}]`
                                                : " [Available]"}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Maaari ring i-assign o palitan ang Class Adviser anumang oras matapos malikha ang section.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Kanselahin
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    disabled={isCreatingSection}
                                    className="bg-emerald-700 text-white font-bold"
                                >
                                    {isCreatingSection ? "Gumagawa..." : "Lumikha ng Section"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Edit Section Details */}
            {showEditModal && editingSection && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
                        <div className="p-5 bg-gradient-to-r from-[#07241c] via-[#0f4c3a] to-[#0d5c43] text-white flex items-center justify-between shadow-xs">
                            <h3 className="font-black text-white text-base flex items-center gap-2">
                                <Pencil className="w-5 h-5 text-emerald-300" />
                                <span>I-update ang Section ({editingSection.name})</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingSection(null);
                                }}
                                className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSection} className="p-6 space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Pangalan ng Section
                                </label>
                                <Input
                                    value={editSectionName}
                                    onChange={(e) => setEditSectionName(e.target.value)}
                                    placeholder="hal. Rizal, Diamond, Bonifacio"
                                    required
                                    className="h-10 text-xs"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Maximum Capacity
                                </label>
                                <Input
                                    type="number"
                                    min={editingSection.enrolled_count || 1}
                                    max="150"
                                    value={editSectionCapacity}
                                    onChange={(e) => setEditSectionCapacity(Number(e.target.value))}
                                    required
                                    className="h-10 text-xs"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Kasalukuyang may {editingSection.enrolled_count || 0} naka-enroll. Maaaring lumagpas sa 45 batay sa pangangailangan.
                                </p>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Class Adviser (Opsyonal)
                                </label>
                                <select
                                    value={editSectionAdviserId}
                                    onChange={(e) => setEditSectionAdviserId(e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="">-- Walang Adviser Muna --</option>
                                    {teachers.map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.name}
                                            {teacher.employee_id ? ` (${teacher.employee_id})` : ""}
                                            {teacher.current_advisory
                                                ? (teacher.current_advisory.section_id === editingSection.id
                                                    ? " [Kasalukuyang Adviser dito]"
                                                    : ` [May hawak: ${teacher.current_advisory.grade_name} - ${teacher.current_advisory.section_name}]`)
                                                : " [Available]"}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Maaaring baguhin ang adviser anumang oras.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingSection(null);
                                    }}
                                >
                                    Kanselahin
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    disabled={isUpdatingSection}
                                    className="gap-1.5 bg-emerald-700 text-white font-bold"
                                >
                                    {isUpdatingSection ? "Ina-update..." : "I-save ang Pagbabago"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ⚡ Modal: Auto-Distribution Strategy */}
            {showDistributeModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100">
                        <div className="p-5 bg-gradient-to-r from-[#07241c] via-[#0f4c3a] to-[#0d5c43] text-white flex items-start justify-between gap-3 shadow-xs">
                            <div>
                                <h3 className="font-black text-white text-base flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-emerald-300" />
                                    <span>Auto-Distribute ({unsectionedStudents.length} Mag-aaral)</span>
                                </h3>
                                <p className="text-xs text-emerald-100/90 mt-0.5">
                                    Pumili ng pamantayan kung paano hahatiin ang mga estudyante sa mga sections.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowDistributeModal(false)}
                                className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAutoDistribute} className="p-6 space-y-4 text-xs">
                            {/* Strategy Options */}
                            <div className="space-y-2">
                                <label className="block font-bold text-slate-800">
                                    Pumili ng Sectioning Algorithm / Strategy:
                                </label>

                                <label
                                    className={`p-3 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition ${
                                        selectedStrategy === "heterogeneous_balanced"
                                            ? "border-emerald-600 bg-emerald-50/50"
                                            : "border-slate-200 hover:bg-slate-50"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="strategy"
                                        value="heterogeneous_balanced"
                                        checked={selectedStrategy === "heterogeneous_balanced"}
                                        onChange={() => setSelectedStrategy("heterogeneous_balanced")}
                                        className="mt-1"
                                    />
                                    <div>
                                        <p className="font-bold text-slate-900">
                                            Heterogeneous Balanced (Pantay ang Bilang at Gender)
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                            Hahatiin nang pantay ang kabuuang dami ng lalaki at babae sa bawat napiling section para balanse ang bawat silid-aralan.
                                        </p>
                                    </div>
                                </label>

                                <label
                                    className={`p-3 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition ${
                                        selectedStrategy === "academic_snake"
                                            ? "border-emerald-600 bg-emerald-50/50"
                                            : "border-slate-200 hover:bg-slate-50"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="strategy"
                                        value="academic_snake"
                                        checked={selectedStrategy === "academic_snake"}
                                        onChange={() => setSelectedStrategy("academic_snake")}
                                        className="mt-1"
                                    />
                                    <div>
                                        <p className="font-bold text-slate-900">
                                            Academic Snake / Equal Ability (Pantay na Talino)
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                            Isasaayos ayon sa General Average (Mataas hanggang Mababa) at ipamamahagi sa paraang snake/zigzag upang maging pantay-pantay ang academic performance ng bawat section.
                                        </p>
                                    </div>
                                </label>

                                <label
                                    className={`p-3 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition ${
                                        selectedStrategy === "academic_star"
                                            ? "border-emerald-600 bg-emerald-50/50"
                                            : "border-slate-200 hover:bg-slate-50"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="strategy"
                                        value="academic_star"
                                        checked={selectedStrategy === "academic_star"}
                                        onChange={() => setSelectedStrategy("academic_star")}
                                        className="mt-1"
                                    />
                                    <div>
                                        <p className="font-bold text-slate-900">
                                            Academic Rank / Special Star Section
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                            Ang unang section ay pupunuin ng mga mag-aaral na may pinakamataas na General Average (Special/Pilot Class), at ang natitira ay hahatiin nang pantay sa ibang sections.
                                        </p>
                                    </div>
                                </label>

                                <label
                                    className={`p-3 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition ${
                                        selectedStrategy === "alphabetical"
                                            ? "border-emerald-600 bg-emerald-50/50"
                                            : "border-slate-200 hover:bg-slate-50"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="strategy"
                                        value="alphabetical"
                                        checked={selectedStrategy === "alphabetical"}
                                        onChange={() => setSelectedStrategy("alphabetical")}
                                        className="mt-1"
                                    />
                                    <div>
                                        <p className="font-bold text-slate-900">
                                            Alphabetical (A-Z)
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                            Isasaayos ayon sa alpabetikong pagkakasunod-sunod ng apelyido at hahatiin nang pantay.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* Section Checklist */}
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                <label className="block font-bold text-slate-800">
                                    Isama ang mga Sumusunod na Sections:
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {sections.map((sec) => (
                                        <label
                                            key={sec.id}
                                            className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedSectionIds.includes(sec.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedSectionIds([...selectedSectionIds, sec.id]);
                                                    } else {
                                                        setSelectedSectionIds(
                                                            selectedSectionIds.filter((id) => id !== sec.id)
                                                        );
                                                    }
                                                }}
                                            />
                                            <span className="font-bold text-slate-800 truncate">
                                                {sec.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowDistributeModal(false)}
                                >
                                    Kanselahin
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    disabled={isDistributing}
                                    className="bg-emerald-700 text-white font-bold"
                                >
                                    {isDistributing ? "Naghahati..." : "Simulan ang Sectioning"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🔄 Modal: Manual Move / Assign Student */}
            {showMoveModal && movingStudent && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100 text-xs">
                        <div className="p-4 bg-gradient-to-r from-[#07241c] via-[#0f4c3a] to-[#0d5c43] text-white flex items-center justify-between shadow-xs">
                            <h3 className="font-black text-white text-base flex items-center gap-2">
                                <ArrowRightLeft className="w-4 h-4 text-emerald-300" />
                                <span>Ilipat sa Section</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowMoveModal(false)}
                                className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <p className="text-slate-500 font-bold uppercase text-[10px]">Estudyante</p>
                                <p className="font-bold text-slate-900 text-sm">{movingStudent.student?.name}</p>
                                <p className="text-slate-400 font-mono text-[11px]">LRN: {movingStudent.student?.lrn}</p>
                            </div>

                            <form onSubmit={handleManualAssign} className="space-y-4">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Pumili ng Target Section:
                                </label>
                                <select
                                    value={targetMoveSectionId}
                                    onChange={(e) => setTargetMoveSectionId(e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                                    required
                                >
                                    <option value="" disabled>Pumili ng Section...</option>
                                    {sections.map((sec) => (
                                        <option key={sec.id} value={sec.id}>
                                            {sec.name} ({sec.enrolled_count || 0}/{sec.capacity || 45} students)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowMoveModal(false)}
                                >
                                    Kanselahin
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    className="bg-emerald-700 text-white font-bold"
                                >
                                    I-save ang Assignment
                                </Button>
                            </div>
                        </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Assign Class Adviser */}
            {showAdviserModal && targetSectionForAdviser && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 text-xs">
                        <div className="p-5 bg-gradient-to-r from-[#07241c] via-[#0f4c3a] to-[#0d5c43] text-white flex items-center justify-between shadow-xs">
                            <h3 className="font-black text-white text-base flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-emerald-300" />
                                <span>I-assign ang Class Adviser</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAdviserModal(false);
                                    setTargetSectionForAdviser(null);
                                }}
                                className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 uppercase">Section:</span>
                                <span className="font-black text-slate-900 text-sm">{targetSectionForAdviser.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 uppercase">Grade Level:</span>
                                <span className="font-bold text-slate-700">Grade {selectedGradeLevel?.level} ({selectedGradeLevel?.name})</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 uppercase">Kasalukuyang Adviser:</span>
                                <span className="font-bold text-emerald-800">
                                    {targetSectionForAdviser.adviser?.name || "Walang Adviser"}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleAssignAdviser} className="space-y-4">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Pumili ng Faculty Teacher / Adviser:
                                </label>
                                <select
                                    value={selectedAdviserId}
                                    onChange={(e) => setSelectedAdviserId(e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="">-- Walang Adviser / Alisin ang Kasalukuyang Adviser --</option>
                                    {teachers.map((teacher) => {
                                        const isCurrentForThisSection = teacher.current_advisory?.section_id === targetSectionForAdviser.id;
                                        const isAdvisingOther = teacher.current_advisory && !isCurrentForThisSection;

                                        let advisoryNote = " [Available]";
                                        if (isCurrentForThisSection) {
                                            advisoryNote = " [Kasalukuyang Adviser dito]";
                                        } else if (isAdvisingOther) {
                                            advisoryNote = ` [May hawak: ${teacher.current_advisory.grade_name} - ${teacher.current_advisory.section_name}]`;
                                        }

                                        return (
                                            <option key={teacher.id} value={teacher.id}>
                                                {teacher.name}
                                                {teacher.employee_id ? ` (${teacher.employee_id})` : ""}
                                                {advisoryNote}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* Warning if teacher already advises another section */}
                            {(() => {
                                const chosenTeacher = teachers.find(
                                    (t) => String(t.id) === String(selectedAdviserId)
                                );
                                if (
                                    chosenTeacher?.current_advisory &&
                                    chosenTeacher.current_advisory.section_id !== targetSectionForAdviser.id
                                ) {
                                    return (
                                        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2.5">
                                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                            <div className="text-[11px] leading-relaxed">
                                                <p className="font-bold">Paunawa sa Paglilipat:</p>
                                                <p>
                                                    Si <span className="font-bold">{chosenTeacher.name}</span> ay kasalukuyang class adviser na ng{" "}
                                                    <span className="font-bold">{chosenTeacher.current_advisory.grade_name} - {chosenTeacher.current_advisory.section_name}</span>.
                                                    Kapag ini-save ito, malilipat ang kanyang advisory assignment sa Section <span className="font-bold">{targetSectionForAdviser.name}</span>.
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setShowAdviserModal(false);
                                        setTargetSectionForAdviser(null);
                                    }}
                                >
                                    Kanselahin
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    disabled={isAssigningAdviser}
                                    className="bg-emerald-700 text-white font-bold"
                                >
                                    {isAssigningAdviser ? "Nagse-save..." : "I-save ang Adviser"}
                                </Button>
                            </div>
                        </form>
                        </div>
                    </div>
                </div>
            )}

            {/* 📖 Modal: Manage Subjects, Teacher Assignment & Schedule */}
            {showSubjectsModal && targetSectionForSubjects && (
                <ManageSectionSubjectsModal
                    isOpen={showSubjectsModal}
                    onClose={() => {
                        setShowSubjectsModal(false);
                        setTargetSectionForSubjects(null);
                    }}
                    section={targetSectionForSubjects}
                    teachers={teachers}
                />
            )}
        </PortalLayout>
    );
}
