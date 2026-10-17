import React, { useState, useMemo } from "react";
import { Head, router, useForm, Link } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Card from "@/Components/Atoms/Card";
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
    Lock,
    Unlock,
    RefreshCw,
    GraduationCap,
    Search,
    BookOpen,
    Eye,
    EyeOff,
    Check,
    X,
    Layers,
} from "lucide-react";

export default function TeachersIndex({
    teachers = [],
    activeSchoolYear = null,
    stats = {},
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [resetPwModalOpen, setResetPwModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Form for creating a new teacher
    const createForm = useForm({
        name: "",
        email: "",
        employee_id: "",
        phone_number: "",
        password: "Teacher@" + new Date().getFullYear(),
    });

    // Form for editing teacher details
    const editForm = useForm({
        name: "",
        email: "",
        employee_id: "",
        phone_number: "",
    });

    // Form for resetting password
    const resetPwForm = useForm({
        password: "",
    });

    // Helper: auto-suggest Employee ID
    const suggestEmployeeId = () => {
        const year = new Date().getFullYear();
        const nextNum = teachers.length + 1;
        return `TCH-${year}-${String(nextNum).padStart(3, "0")}`;
    };

    const handleOpenCreateModal = () => {
        createForm.setData({
            name: "",
            email: "",
            employee_id: suggestEmployeeId(),
            phone_number: "",
            password: "Teacher@" + new Date().getFullYear(),
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

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post("/admin/teachers", {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleOpenEditModal = (teacher) => {
        setSelectedTeacher(teacher);
        editForm.setData({
            name: teacher.name,
            email: teacher.email,
            employee_id: teacher.employee_id || "",
            phone_number: teacher.phone_number || "",
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!selectedTeacher) return;
        editForm.put(`/admin/teachers/${selectedTeacher.id}`, {
            onSuccess: () => {
                setEditModalOpen(false);
                setSelectedTeacher(null);
            },
        });
    };

    const handleOpenResetPwModal = (teacher) => {
        setSelectedTeacher(teacher);
        resetPwForm.setData({
            password: "Teacher@" + new Date().getFullYear(),
        });
        setResetPwModalOpen(true);
    };

    const handleResetPwSubmit = (e) => {
        e.preventDefault();
        if (!selectedTeacher) return;
        resetPwForm.patch(`/admin/teachers/${selectedTeacher.id}/reset-password`, {
            onSuccess: () => {
                setResetPwModalOpen(false);
                setSelectedTeacher(null);
                resetPwForm.reset();
            },
        });
    };

    const handleToggleActive = (teacher) => {
        const action = teacher.is_active ? "deactivate / suspend" : "activate";
        if (confirm(`Are you sure you want to ${action} the account of ${teacher.name}?`)) {
            router.patch(`/admin/teachers/${teacher.id}/toggle-active`);
        }
    };

    const handleDeleteTeacher = (teacher) => {
        if (confirm(`Are you sure you want to delete the faculty account of ${teacher.name}? This action cannot be undone.`)) {
            router.delete(`/admin/teachers/${teacher.id}`);
        }
    };

    // Filter teachers list by search and status
    const filteredTeachers = useMemo(() => {
        return teachers.filter((t) => {
            const matchesSearch =
                t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.employee_id && t.employee_id.toLowerCase().includes(searchTerm.toLowerCase()));

            if (statusFilter === "ACTIVE") return matchesSearch && t.is_active;
            if (statusFilter === "SUSPENDED") return matchesSearch && !t.is_active;
            if (statusFilter === "ADVISER") return matchesSearch && t.current_advisory_sections.length > 0;
            return matchesSearch;
        });
    }, [teachers, searchTerm, statusFilter]);

    return (
        <PortalLayout title="Faculty Teachers Management">
            <Head title="Faculty Teachers - BNHS Admin" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-[#0f4c3a] via-[#107050] to-[#0d5c43] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold backdrop-blur-xs flex items-center gap-1">
                                <GraduationCap className="w-3.5 h-3.5" /> Faculty Directorate
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-bold border border-emerald-400/30 flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" /> DepEd Grading & Advisory Access
                            </span>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">Faculty Teachers & Advisory Staff</h2>
                        <p className="text-emerald-100 text-xs mt-1 font-medium max-w-2xl">
                            Register and manage faculty teacher credentials, monitor section adviserships, and maintain access permissions for quarterly grade encoding.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
                        <Link
                            href="/registrar/sectioning"
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition shrink-0 border border-emerald-600/50"
                        >
                            <Layers className="w-4 h-4 text-emerald-300" />
                            <span>Sectioning & Advisers</span>
                        </Link>
                        <button
                            type="button"
                            onClick={handleOpenCreateModal}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs shadow-md transition shrink-0 cursor-pointer"
                        >
                            <UserPlus className="w-4 h-4 text-emerald-700" />
                            <span>Register New Teacher</span>
                        </button>
                    </div>
                </div>

                {/* KPI Summary Stats (Compact) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Card className="px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Teachers</p>
                                <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">{stats.totalTeachers ?? 0} Faculty</p>
                            </div>
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/10 shrink-0">
                                <Users className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <p className="text-[9.5px] text-slate-400 mt-1 font-medium truncate">Registered academic faculty</p>
                    </Card>

                    <Card className="px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Accounts</p>
                                <p className="text-base sm:text-lg font-black text-emerald-600 mt-0.5">{stats.activeTeachers ?? 0} Active</p>
                            </div>
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/10 shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <p className="text-[9.5px] text-slate-400 mt-1 font-medium truncate">Authorized for grading login</p>
                    </Card>

                    <Card className="px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Advisers</p>
                                <p className="text-base sm:text-lg font-black text-blue-600 mt-0.5">{stats.assignedAdvisers ?? 0} Advisers</p>
                            </div>
                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-blue-500/10 shrink-0">
                                <BookOpen className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <p className="text-[9.5px] text-slate-400 mt-1 font-medium truncate">Advisers for S.Y. {activeSchoolYear?.name || "Active"}</p>
                    </Card>

                    <Card className="px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suspended / Inactive</p>
                                <p className="text-base sm:text-lg font-black text-slate-500 mt-0.5">{stats.suspendedTeachers ?? 0} Inactive</p>
                            </div>
                            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center ring-1 ring-slate-900/10 shrink-0">
                                <Lock className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <p className="text-[9.5px] text-slate-400 mt-1 font-medium truncate">Access disabled</p>
                    </Card>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or employee ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        <button
                            onClick={() => setStatusFilter("ALL")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                                statusFilter === "ALL"
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            All ({teachers.length})
                        </button>
                        <button
                            onClick={() => setStatusFilter("ACTIVE")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                                statusFilter === "ACTIVE"
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            Active ({stats.activeTeachers ?? 0})
                        </button>
                        <button
                            onClick={() => setStatusFilter("ADVISER")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                                statusFilter === "ADVISER"
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            Class Advisers ({stats.assignedAdvisers ?? 0})
                        </button>
                        <button
                            onClick={() => setStatusFilter("SUSPENDED")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                                statusFilter === "SUSPENDED"
                                    ? "bg-rose-600 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            Suspended ({stats.suspendedTeachers ?? 0})
                        </button>
                    </div>
                </div>

                {/* Teachers Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                                Faculty Teachers Directory
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Showing {filteredTeachers.length} of {teachers.length} registered faculty accounts
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200/80">
                                <tr>
                                    <th className="py-3.5 px-4">Faculty Member</th>
                                    <th className="py-3.5 px-4">Employee ID</th>
                                    <th className="py-3.5 px-4">Advisory Section</th>
                                    <th className="py-3.5 px-4">Contact Phone</th>
                                    <th className="py-3.5 px-4 text-center">Status</th>
                                    <th className="py-3.5 px-4 text-center">Registered Date</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTeachers.length > 0 ? (
                                    filteredTeachers.map((teacher) => (
                                        <tr key={teacher.id} className="hover:bg-slate-50/60 transition">
                                            {/* Name & Email */}
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs ring-2 ring-emerald-100 shrink-0">
                                                        {teacher.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-sm text-slate-900 block">
                                                            {teacher.name}
                                                        </span>
                                                        <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                                            <Mail className="w-3 h-3 text-slate-400" />
                                                            {teacher.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Employee ID */}
                                            <td className="py-4 px-4">
                                                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                                    {teacher.employee_id || "Not Set"}
                                                </span>
                                            </td>

                                            {/* Advisory Section */}
                                            <td className="py-4 px-4">
                                                {teacher.current_advisory_sections && teacher.current_advisory_sections.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {teacher.current_advisory_sections.map((sec) => (
                                                            <span
                                                                key={sec.id}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200"
                                                            >
                                                                <BookOpen className="w-3 h-3 text-emerald-600" />
                                                                {sec.grade_name} - {sec.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic text-[11px] font-medium">
                                                        Unassigned
                                                    </span>
                                                )}
                                            </td>

                                            {/* Contact */}
                                            <td className="py-4 px-4">
                                                <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-slate-400" />
                                                    {teacher.phone_number || "None"}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="py-4 px-4 text-center">
                                                {teacher.is_active ? (
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
                                                {teacher.created_at || "N/A"}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Toggle Active */}
                                                    <button
                                                        onClick={() => handleToggleActive(teacher)}
                                                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                                                            teacher.is_active
                                                                ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                                                : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                                        }`}
                                                        title={teacher.is_active ? "Suspend Account" : "Activate Account"}
                                                    >
                                                        {teacher.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                    </button>

                                                    {/* Reset Password */}
                                                    <button
                                                        onClick={() => handleOpenResetPwModal(teacher)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                                        title="Reset Password"
                                                    >
                                                        <KeyRound className="w-4 h-4" />
                                                    </button>

                                                    {/* Edit */}
                                                    <button
                                                        onClick={() => handleOpenEditModal(teacher)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                                                        title="Edit Faculty Details"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => handleDeleteTeacher(teacher)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                                        title="Delete Faculty Account"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-slate-400 text-xs">
                                            No faculty teacher accounts found matching the current criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal: Register New Teacher */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
                        <div className="shrink-0 p-5 bg-gradient-to-r from-[#07241c] via-[#0f4c3a] to-[#0d5c43] text-white flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white/10 text-emerald-300 flex items-center justify-center font-bold">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white text-base leading-tight">Register Faculty Teacher</h3>
                                    <p className="text-xs text-emerald-100/80 mt-0.5">Create a new institutional faculty account</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setCreateModalOpen(false)}
                                className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Full Name <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    placeholder="e.g. Juan D. Dela Cruz, LPT"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData("name", e.target.value)}
                                    required
                                    className="text-xs"
                                />
                                {createForm.errors.name && (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{createForm.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Institutional Email <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    type="email"
                                    placeholder="e.g. teacher@bnhs.edu.ph"
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData("email", e.target.value)}
                                    required
                                    className="text-xs"
                                />
                                {createForm.errors.email && (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{createForm.errors.email}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Employee ID
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="TCH-2026-001"
                                        value={createForm.data.employee_id}
                                        onChange={(e) => createForm.setData("employee_id", e.target.value)}
                                        className="text-xs font-mono"
                                    />
                                    {createForm.errors.employee_id && (
                                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{createForm.errors.employee_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Contact Phone
                                    </label>
                                    <Input
                                        type="tel"
                                        placeholder="09123456789"
                                        maxLength={13}
                                        value={createForm.data.phone_number}
                                        onChange={(e) => createForm.setData("phone_number", e.target.value.replace(/[^0-9+]/g, ""))}
                                        className="text-xs font-mono"
                                    />
                                    {createForm.errors.phone_number && (
                                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{createForm.errors.phone_number}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Initial Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={generateRandomPassword}
                                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Auto-generate
                                    </button>
                                </div>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={createForm.data.password}
                                        onChange={(e) => createForm.setData("password", e.target.value)}
                                        className="text-xs font-mono pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Default password: <span className="font-mono text-emerald-700 font-bold">Teacher@{new Date().getFullYear()}</span>
                                </p>
                                {createForm.errors.password && (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{createForm.errors.password}</p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                                >
                                    {createForm.processing ? "Creating..." : "Save Teacher Account"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Edit Teacher Profile */}
            {editModalOpen && selectedTeacher && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
                        <div className="shrink-0 p-5 bg-gradient-to-r from-[#07241c] via-[#0f4c3a] to-[#0d5c43] text-white flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white/10 text-emerald-300 flex items-center justify-center font-bold">
                                    <Edit3 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white text-base leading-tight">Edit Faculty Profile</h3>
                                    <p className="text-xs text-emerald-100/80 mt-0.5">Update account credentials and details</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEditModalOpen(false)}
                                className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Full Name <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData("name", e.target.value)}
                                    required
                                    className="text-xs"
                                />
                                {editForm.errors.name && (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{editForm.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Institutional Email <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData("email", e.target.value)}
                                    required
                                    className="text-xs"
                                />
                                {editForm.errors.email && (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{editForm.errors.email}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Employee ID
                                    </label>
                                    <Input
                                        type="text"
                                        value={editForm.data.employee_id}
                                        onChange={(e) => editForm.setData("employee_id", e.target.value)}
                                        className="text-xs font-mono"
                                    />
                                    {editForm.errors.employee_id && (
                                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{editForm.errors.employee_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Contact Phone
                                    </label>
                                    <Input
                                        type="tel"
                                        placeholder="09123456789"
                                        maxLength={13}
                                        value={editForm.data.phone_number}
                                        onChange={(e) => editForm.setData("phone_number", e.target.value.replace(/[^0-9+]/g, ""))}
                                        className="text-xs font-mono"
                                    />
                                    {editForm.errors.phone_number && (
                                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{editForm.errors.phone_number}</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                                >
                                    {editForm.processing ? "Saving..." : "Update Profile"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Reset Password */}
            {resetPwModalOpen && selectedTeacher && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
                        <div className="shrink-0 p-5 bg-gradient-to-r from-[#07241c] via-[#0f4c3a] to-[#0d5c43] text-white flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white/10 text-emerald-300 flex items-center justify-center font-bold">
                                    <KeyRound className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white text-base leading-tight">Reset Password</h3>
                                    <p className="text-xs text-emerald-100/80 mt-0.5">Set new credentials for {selectedTeacher.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setResetPwModalOpen(false)}
                                className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleResetPwSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    New Password <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    value={resetPwForm.data.password}
                                    onChange={(e) => resetPwForm.setData("password", e.target.value)}
                                    required
                                    className="text-xs font-mono"
                                    placeholder="Minimum 8 characters"
                                />
                                {resetPwForm.errors.password && (
                                    <p className="text-rose-500 text-[11px] mt-1 font-medium">{resetPwForm.errors.password}</p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setResetPwModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={resetPwForm.processing}
                                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md transition cursor-pointer disabled:opacity-50"
                                >
                                    {resetPwForm.processing ? "Updating..." : "Reset Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PortalLayout>
    );
}
