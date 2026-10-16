import React, { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Card from "@/Components/Atoms/Card";
import Button from "@/Components/Atoms/Button";
import Badge from "@/Components/Atoms/Badge";
import Input from "@/Components/Atoms/Input";
import {
    Users,
    UserPlus,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    KeyRound,
    Mail,
    Phone,
    IdCard,
    Edit3,
    Trash2,
    Eye,
    EyeOff,
    Sparkles,
    Lock,
    Unlock,
    RefreshCw,
    GraduationCap,
    Check,
    X,
} from "lucide-react";

export default function RegistrarsIndex({ registrars = [], gradeLevels = [], stats = {} }) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [resetPwModalOpen, setResetPwModalOpen] = useState(false);
    const [selectedRegistrar, setSelectedRegistrar] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Form for creating a new registrar
    const createForm = useForm({
        name: "",
        email: "",
        employee_id: "",
        phone_number: "",
        password: "Registrar@" + new Date().getFullYear(),
        grade_level_ids: [],
    });

    // Form for editing
    const editForm = useForm({
        name: "",
        email: "",
        employee_id: "",
        phone_number: "",
        grade_level_ids: [],
    });

    // Form for resetting password
    const resetPwForm = useForm({
        password: "",
    });

    // Auto-generate employee ID helper
    const suggestEmployeeId = () => {
        const year = new Date().getFullYear();
        const nextNum = registrars.length + 1;
        return `REG-${year}-${String(nextNum).padStart(3, "0")}`;
    };

    const handleOpenCreateModal = () => {
        createForm.setData({
            name: "",
            email: "",
            employee_id: suggestEmployeeId(),
            phone_number: "",
            password: "Registrar@" + new Date().getFullYear(),
            grade_level_ids: [],
        });
        setShowPassword(false);
        setCreateModalOpen(true);
    };

    const generateRandomPassword = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
        let result = "BNHS@";
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        createForm.setData("password", result);
    };

    const toggleCreateGrade = (gradeId) => {
        const current = [...createForm.data.grade_level_ids];
        const index = current.indexOf(gradeId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(gradeId);
        }
        createForm.setData("grade_level_ids", current);
    };

    const toggleEditGrade = (gradeId) => {
        const current = [...editForm.data.grade_level_ids];
        const index = current.indexOf(gradeId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(gradeId);
        }
        editForm.setData("grade_level_ids", current);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post("/admin/registrars", {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleOpenEditModal = (registrar) => {
        setSelectedRegistrar(registrar);
        const assignedIds = registrar.assigned_grade_levels?.map((g) => g.id) || [];
        editForm.setData({
            name: registrar.name,
            email: registrar.email,
            employee_id: registrar.employee_id || "",
            phone_number: registrar.phone_number || "",
            grade_level_ids: assignedIds,
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!selectedRegistrar) return;
        editForm.put(`/admin/registrars/${selectedRegistrar.id}`, {
            onSuccess: () => {
                setEditModalOpen(false);
                setSelectedRegistrar(null);
            },
        });
    };

    const handleOpenResetPwModal = (registrar) => {
        setSelectedRegistrar(registrar);
        resetPwForm.setData({
            password: "Registrar@" + new Date().getFullYear(),
        });
        setResetPwModalOpen(true);
    };

    const handleResetPwSubmit = (e) => {
        e.preventDefault();
        if (!selectedRegistrar) return;
        resetPwForm.patch(`/admin/registrars/${selectedRegistrar.id}/reset-password`, {
            onSuccess: () => {
                setResetPwModalOpen(false);
                setSelectedRegistrar(null);
                resetPwForm.reset();
            },
        });
    };

    const handleToggleActive = (registrar) => {
        const action = registrar.is_active ? "suspend / deactivate" : "activate";
        if (confirm(`Are you sure you want to ${action} the registrar account of ${registrar.name}?`)) {
            router.patch(`/admin/registrars/${registrar.id}/toggle-active`);
        }
    };

    const handleDeleteRegistrar = (registrar) => {
        if (confirm(`Are you sure you want to permanently delete the registrar account of ${registrar.name}? This action cannot be undone.`)) {
            router.delete(`/admin/registrars/${registrar.id}`);
        }
    };

    return (
        <PortalLayout title="Registrar Officers Management">
            <Head title="Registrar Staff - BNHS Admin" />

            <div className="space-y-6">
                {/* 🌟 Header & Action */}
                <div className="bg-gradient-to-r from-[#0f4c3a] via-[#107050] to-[#0d5c43] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold backdrop-blur-xs flex items-center gap-1">
                                <Users className="w-3 h-3" /> Registrar Staff Directorate
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-bold border border-emerald-400/30 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Grade-Level Partitioning
                            </span>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">Registrar Staff & Grade Assignments</h2>
                        <p className="text-emerald-100 text-xs mt-1 font-medium">
                            Assign dedicated grade levels to each registrar to prevent admission conflicts (e.g. Registrar 7 for Grade 7, Registrar 8 for Grade 8).
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenCreateModal}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs shadow-md transition shrink-0 cursor-pointer self-start md:self-auto"
                    >
                        <UserPlus className="w-4 h-4 text-emerald-700" />
                        <span>Register New Registrar</span>
                    </button>
                </div>

                {/* KPI Summary Stats (Compact) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Card className="px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Registrars</p>
                                <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">{stats.totalRegistrars ?? 0} Staff</p>
                            </div>
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/10 shrink-0">
                                <Users className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <p className="text-[9.5px] text-slate-400 mt-1 font-medium truncate">Registered admissions officers</p>
                    </Card>

                    <Card className="px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Staff</p>
                                <p className="text-base sm:text-lg font-black text-emerald-600 mt-0.5">{stats.activeRegistrars ?? 0} Active</p>
                            </div>
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/10 shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <p className="text-[9.5px] text-slate-400 mt-1 font-medium truncate">Authorized to approve enrollments</p>
                    </Card>

                    <Card className="px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suspended / Inactive</p>
                                <p className="text-base sm:text-lg font-black text-slate-500 mt-0.5">{stats.suspendedRegistrars ?? 0} Inactive</p>
                            </div>
                            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center ring-1 ring-slate-900/10 shrink-0">
                                <Lock className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <p className="text-[9.5px] text-slate-400 mt-1 font-medium truncate">Access temporarily locked</p>
                    </Card>
                </div>

                {/* 📋 Registrars Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Registrar Directory & Assigned Batches</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Manage employee access, grade-level allocations, and security credentials.</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200/80">
                                <tr>
                                    <th className="py-3.5 px-4">Registrar Officer</th>
                                    <th className="py-3.5 px-4">Employee ID</th>
                                    <th className="py-3.5 px-4">Assigned Grade Level</th>
                                    <th className="py-3.5 px-4">Contact Details</th>
                                    <th className="py-3.5 px-4 text-center">Status</th>
                                    <th className="py-3.5 px-4 text-center">Date Added</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {registrars.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-slate-50/60 transition">
                                        {/* Name & Email */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs ring-2 ring-emerald-100">
                                                    {reg.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-sm text-slate-900 block">{reg.name}</span>
                                                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                                        <Mail className="w-3 h-3 text-slate-400" />
                                                        {reg.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Employee ID */}
                                        <td className="py-4 px-4">
                                            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                                {reg.employee_id || "Not Set"}
                                            </span>
                                        </td>

                                        {/* Assigned Grade Levels */}
                                        <td className="py-4 px-4">
                                            {reg.assigned_grade_levels && reg.assigned_grade_levels.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {reg.assigned_grade_levels.map((gl) => (
                                                        <span
                                                            key={gl.id}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-black text-[11px] border border-emerald-200"
                                                        >
                                                            <GraduationCap className="w-3 h-3 text-emerald-600" />
                                                            {gl.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic text-[11px] font-medium">All / General Admissions</span>
                                            )}
                                        </td>

                                        {/* Contact */}
                                        <td className="py-4 px-4">
                                            <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                                                <Phone className="w-3 h-3 text-slate-400" />
                                                {reg.phone_number || "None"}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="py-4 px-4 text-center">
                                            {reg.is_active ? (
                                                <Badge variant="success" className="bg-emerald-100 text-emerald-800 text-[10px] font-black">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="danger" className="bg-rose-100 text-rose-800 text-[10px] font-black">
                                                    <XCircle className="w-3 h-3 mr-1" /> Suspended
                                                </Badge>
                                            )}
                                        </td>

                                        {/* Date Added */}
                                        <td className="py-4 px-4 text-center text-[11px] text-slate-500">
                                            {new Date(reg.created_at).toLocaleDateString()}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Toggle Active Button */}
                                                <button
                                                    onClick={() => handleToggleActive(reg)}
                                                    className={`p-1.5 rounded-lg transition ${
                                                        reg.is_active
                                                            ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                                            : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                                    }`}
                                                    title={reg.is_active ? "Suspend Account" : "Activate Account"}
                                                >
                                                    {reg.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                </button>

                                                {/* Reset Password */}
                                                <button
                                                    onClick={() => handleOpenResetPwModal(reg)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                                    title="Reset Password"
                                                >
                                                    <KeyRound className="w-4 h-4" />
                                                </button>

                                                {/* Edit */}
                                                <button
                                                    onClick={() => handleOpenEditModal(reg)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                                                    title="Edit Details & Grade Assignment"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    onClick={() => handleDeleteRegistrar(reg)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                                    title="Delete Account"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ℹ️ DepEd Security Tip */}
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/60 flex items-start gap-3 text-xs text-emerald-900">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">Exclusive Grade-Level Assignment Policy</p>
                        <p className="text-emerald-800/90 text-[11px] mt-0.5">
                            Each grade level is reserved exclusively for one designated Registrar Officer (e.g. Grade 7 handled by Registrar 7). Once a grade level is assigned to an officer, it is automatically locked and prevented from being selected by other accounts to prevent duplicate processing of student records.
                        </p>
                    </div>
                </div>
            </div>

            {/* ➕ REGISTER REGISTRAR MODAL */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative my-8">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                    <UserPlus className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-base">Register New Registrar</h3>
                                    <p className="text-xs text-slate-500 font-medium">Create staff account and assign exclusive grade partition</p>
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
                                    Full Name <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData("name", e.target.value)}
                                    placeholder="e.g. Registrar Grade 8 Officer"
                                    required
                                    className="text-xs font-bold"
                                />
                                {createForm.errors.name && (
                                    <p className="text-[11px] text-rose-600 font-medium mt-1">{createForm.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Official Email Address <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    type="email"
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData("email", e.target.value)}
                                    placeholder="e.g. registrar8@bnhs.edu.ph"
                                    required
                                    className="text-xs font-bold"
                                />
                                {createForm.errors.email && (
                                    <p className="text-[11px] text-rose-600 font-medium mt-1">{createForm.errors.email}</p>
                                )}
                            </div>

                            {/* 🎓 EXCLUSIVE GRADE LEVEL ASSIGNMENT */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Assigned Grade Level <span className="text-emerald-700 font-normal">(Exclusive)</span>
                                    </label>
                                    <span className="text-[10px] text-slate-400">Select grade for this officer</span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {gradeLevels.map((gl) => {
                                        const isTaken = gl.is_assigned;
                                        const isSelected = createForm.data.grade_level_ids.includes(gl.id);

                                        return (
                                            <button
                                                key={gl.id}
                                                type="button"
                                                disabled={isTaken}
                                                onClick={() => toggleCreateGrade(gl.id)}
                                                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition relative ${
                                                    isTaken
                                                        ? "bg-slate-100/80 border-slate-200 opacity-60 cursor-not-allowed text-slate-400"
                                                        : isSelected
                                                        ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 cursor-pointer shadow-xs"
                                                        : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50 cursor-pointer text-slate-700"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="font-black text-xs">{gl.name}</span>
                                                    {isTaken ? (
                                                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                                                    ) : isSelected ? (
                                                        <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 font-bold">{gl.category}</span>
                                                    )}
                                                </div>

                                                <div className="mt-2 text-[10px]">
                                                    {isTaken ? (
                                                        <span className="text-rose-600 font-medium line-clamp-1">
                                                            🔒 Assigned: {gl.assigned_to_name}
                                                        </span>
                                                    ) : isSelected ? (
                                                        <span className="text-emerald-700 font-bold">Assigned</span>
                                                    ) : (
                                                        <span className="text-slate-400">Available</span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                {createForm.errors.grade_level_ids && (
                                    <p className="text-[11px] text-rose-600 font-medium mt-1.5">{createForm.errors.grade_level_ids}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Employee ID
                                    </label>
                                    <Input
                                        value={createForm.data.employee_id}
                                        onChange={(e) => createForm.setData("employee_id", e.target.value)}
                                        placeholder="REG-2027-002"
                                        className="font-mono text-xs font-bold"
                                    />
                                    {createForm.errors.employee_id && (
                                        <p className="text-[11px] text-rose-600 font-medium mt-1">{createForm.errors.employee_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Phone Number
                                    </label>
                                    <Input
                                        type="tel"
                                        value={createForm.data.phone_number}
                                        onChange={(e) => createForm.setData("phone_number", e.target.value.replace(/[^0-9+]/g, ""))}
                                        placeholder="09123456789"
                                        maxLength={13}
                                        className="text-xs font-mono font-medium"
                                    />
                                    {createForm.errors.phone_number && (
                                        <p className="text-[11px] text-rose-600 font-medium mt-1">{createForm.errors.phone_number}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Temporary Password <span className="text-rose-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={generateRandomPassword}
                                        className="text-[11px] text-emerald-600 font-bold hover:underline flex items-center gap-1"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Auto-generate
                                    </button>
                                </div>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={createForm.data.password}
                                        onChange={(e) => createForm.setData("password", e.target.value)}
                                        required
                                        className="font-mono text-xs font-bold pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">Minimum 8 characters. Share credentials with the assigned officer.</p>
                                {createForm.errors.password && (
                                    <p className="text-[11px] text-rose-600 font-medium mt-1">{createForm.errors.password}</p>
                                )}
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
                                    {createForm.processing ? "Registering..." : "Create Registrar Account"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ✏️ EDIT REGISTRAR MODAL */}
            {editModalOpen && selectedRegistrar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative my-8">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="font-black text-slate-900 text-base">Edit Registrar & Grade Level</h3>
                                <p className="text-xs text-slate-500 font-medium">Update contact info and grade allocation</p>
                            </div>
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
                                    Full Name
                                </label>
                                <Input
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData("name", e.target.value)}
                                    required
                                    className="text-xs font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Email Address
                                </label>
                                <Input
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData("email", e.target.value)}
                                    required
                                    className="text-xs font-bold"
                                />
                            </div>

                            {/* 🎓 EXCLUSIVE GRADE LEVEL ASSIGNMENT EDIT */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Assigned Grade Level <span className="text-emerald-700 font-normal">(Exclusive)</span>
                                    </label>
                                    <span className="text-[10px] text-slate-400">Manage grade partition</span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {gradeLevels.map((gl) => {
                                        // Taken by another registrar (not this one)
                                        const isTakenByOther = gl.is_assigned && gl.assigned_to_user_id !== selectedRegistrar.id;
                                        const isSelected = editForm.data.grade_level_ids.includes(gl.id);

                                        return (
                                            <button
                                                key={gl.id}
                                                type="button"
                                                disabled={isTakenByOther}
                                                onClick={() => toggleEditGrade(gl.id)}
                                                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition relative ${
                                                    isTakenByOther
                                                        ? "bg-slate-100/80 border-slate-200 opacity-60 cursor-not-allowed text-slate-400"
                                                        : isSelected
                                                        ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 cursor-pointer shadow-xs"
                                                        : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50 cursor-pointer text-slate-700"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="font-black text-xs">{gl.name}</span>
                                                    {isTakenByOther ? (
                                                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                                                    ) : isSelected ? (
                                                        <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 font-bold">{gl.category}</span>
                                                    )}
                                                </div>

                                                <div className="mt-2 text-[10px]">
                                                    {isTakenByOther ? (
                                                        <span className="text-rose-600 font-medium line-clamp-1">
                                                            🔒 {gl.assigned_to_name}
                                                        </span>
                                                    ) : isSelected ? (
                                                        <span className="text-emerald-700 font-bold">Assigned</span>
                                                    ) : (
                                                        <span className="text-slate-400">Available</span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                {editForm.errors.grade_level_ids && (
                                    <p className="text-[11px] text-rose-600 font-medium mt-1.5">{editForm.errors.grade_level_ids}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Employee ID
                                    </label>
                                    <Input
                                        value={editForm.data.employee_id}
                                        onChange={(e) => editForm.setData("employee_id", e.target.value)}
                                        className="font-mono text-xs font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Phone Number
                                    </label>
                                    <Input
                                        type="tel"
                                        value={editForm.data.phone_number}
                                        onChange={(e) => editForm.setData("phone_number", e.target.value.replace(/[^0-9+]/g, ""))}
                                        placeholder="09123456789"
                                        maxLength={13}
                                        className="text-xs font-mono font-medium"
                                    />
                                    {editForm.errors.phone_number && (
                                        <p className="text-[11px] text-rose-600 font-medium mt-1">{editForm.errors.phone_number}</p>
                                    )}
                                </div>
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
                                    {editForm.processing ? "Saving..." : "Update Profile"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🔑 RESET PASSWORD MODAL */}
            {resetPwModalOpen && selectedRegistrar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <KeyRound className="w-5 h-5 text-blue-600" />
                                <h3 className="font-black text-slate-900 text-base">Reset Registrar Password</h3>
                            </div>
                            <button
                                onClick={() => setResetPwModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleResetPwSubmit} className="space-y-4 mt-4">
                            <p className="text-xs text-slate-600">
                                Resetting password for <span className="font-bold text-slate-900">{selectedRegistrar.name}</span> ({selectedRegistrar.email}).
                            </p>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    New Password <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    value={resetPwForm.data.password}
                                    onChange={(e) => resetPwForm.setData("password", e.target.value)}
                                    required
                                    placeholder="Enter new password"
                                    className="font-mono text-xs font-bold"
                                />
                                {resetPwForm.errors.password && (
                                    <p className="text-[11px] text-rose-600 font-medium mt-1">{resetPwForm.errors.password}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setResetPwModalOpen(false)}
                                    className="text-xs font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={resetPwForm.processing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md"
                                >
                                    {resetPwForm.processing ? "Resetting..." : "Save New Password"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PortalLayout>
    );
}
