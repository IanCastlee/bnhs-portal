import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Card from "@/Components/Atoms/Card";
import Button from "@/Components/Atoms/Button";
import Badge from "@/Components/Atoms/Badge";
import Input from "@/Components/Atoms/Input";
import {
    ShieldCheck,
    Search,
    Filter,
    Clock,
    UserCheck,
    UserX,
    UserPlus,
    FileSpreadsheet,
    Activity,
    Layers,
    Calendar,
    Globe,
    CheckCircle2,
    XCircle,
    Info,
    ChevronLeft,
    ChevronRight,
    Eye,
    X,
} from "lucide-react";

export default function AuditLogsIndex({
    logs = { data: [], links: [] },
    staffMembers = [],
    stats = {},
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || "");
    const [actionFilter, setActionFilter] = useState(filters.action || "ALL");
    const [moduleFilter, setModuleFilter] = useState(filters.module || "ALL");
    const [userFilter, setUserFilter] = useState(filters.user_id || "");
    const [selectedLog, setSelectedLog] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const applyFilters = (overrides = {}) => {
        router.get(
            "/admin/audit-logs",
            {
                search: overrides.search !== undefined ? overrides.search : search,
                action: overrides.action !== undefined ? overrides.action : actionFilter,
                module: overrides.module !== undefined ? overrides.module : moduleFilter,
                user_id: overrides.user_id !== undefined ? overrides.user_id : userFilter,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleReset = () => {
        setSearch("");
        setActionFilter("ALL");
        setModuleFilter("ALL");
        setUserFilter("");
        router.get("/admin/audit-logs");
    };

    // Action Badge Color & Icon Resolver
    const getActionBadge = (action) => {
        switch (action) {
            case "ENROLLMENT_APPROVED":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-wide border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Approved Admission
                    </span>
                );
            case "ENROLLMENT_REJECTED":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black tracking-wide border border-rose-300">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        Returned Application
                    </span>
                );
            case "REGISTRAR_CREATED":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black tracking-wide border border-blue-300">
                        <UserPlus className="w-3 h-3 text-blue-600" />
                        Staff Created
                    </span>
                );
            case "REGISTRAR_STATUS_CHANGED":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black tracking-wide border border-amber-300">
                        <Activity className="w-3 h-3 text-amber-600" />
                        Status Changed
                    </span>
                );
            case "REGISTRAR_PASSWORD_RESET":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black tracking-wide border border-purple-300">
                        <ShieldCheck className="w-3 h-3 text-purple-600" />
                        Password Reset
                    </span>
                );
            case "ACADEMIC_YEAR_ACTIVATED":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 text-[10px] font-black tracking-wide border border-teal-300">
                        <Calendar className="w-3 h-3 text-teal-600" />
                        SY Activated
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-[10px] font-black tracking-wide border border-slate-300">
                        <Info className="w-3 h-3 text-slate-500" />
                        {action}
                    </span>
                );
        }
    };

    return (
        <PortalLayout title="Registrar Audit & Activity Trail">
            <Head title="Audit Logs - BNHS Admin" />

            <div className="space-y-6">
                {/* 🌟 Header Banner */}
                <div className="bg-gradient-to-r from-[#0f4c3a] via-[#107050] to-[#0d5c43] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold backdrop-blur-xs flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> DepEd Compliance Audit
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-bold border border-emerald-400/30 flex items-center gap-1">
                                <Activity className="w-3 h-3" /> Immutable Audit Trail
                            </span>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">Registrar Operations Audit Log</h2>
                        <p className="text-emerald-100 text-xs mt-1 font-medium">
                            Comprehensive, timestamped record of all admissions, document validations, section assignments, and credential modifications.
                        </p>
                    </div>
                </div>

                {/* 📊 KPI Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4 rounded-2xl border border-slate-200/80 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Actions Logged</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalLogs ?? 0}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/10">
                                <Layers className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Complete system history</p>
                    </Card>

                    <Card className="p-4 rounded-2xl border border-slate-200/80 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Activities Today</p>
                                <p className="text-2xl font-black text-emerald-600 mt-1">{stats.todayLogs ?? 0}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center ring-1 ring-teal-500/10">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Staff actions past 24 hours</p>
                    </Card>

                    <Card className="p-4 rounded-2xl border border-slate-200/80 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Enrollments Approved</p>
                                <p className="text-2xl font-black text-blue-600 mt-1">{stats.enrollmentApprovals ?? 0}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-blue-500/10">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Verified by Registrar team</p>
                    </Card>

                    <Card className="p-4 rounded-2xl border border-slate-200/80 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Returned Applications</p>
                                <p className="text-2xl font-black text-rose-600 mt-1">{stats.enrollmentRejections ?? 0}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center ring-1 ring-rose-500/10">
                                <XCircle className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">For documentary correction</p>
                    </Card>
                </div>

                {/* 🔍 Search & Filters Bar */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by student name, ticket, registrar, remarks, or IP..."
                                className="pl-9 text-xs font-medium"
                            />
                        </div>

                        {/* Action Filter */}
                        <select
                            value={actionFilter}
                            onChange={(e) => {
                                setActionFilter(e.target.value);
                                applyFilters({ action: e.target.value });
                            }}
                            className="text-xs font-bold rounded-xl border border-slate-300 py-2 px-3 bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                        >
                            <option value="ALL">All Actions</option>
                            <option value="ENROLLMENT_APPROVED">Approved Admission</option>
                            <option value="ENROLLMENT_REJECTED">Returned Application</option>
                            <option value="REGISTRAR_CREATED">Staff Account Created</option>
                            <option value="REGISTRAR_STATUS_CHANGED">Account Status Changed</option>
                            <option value="REGISTRAR_PASSWORD_RESET">Password Reset</option>
                            <option value="ACADEMIC_YEAR_ACTIVATED">School Year Activated</option>
                        </select>

                        {/* Staff Filter */}
                        <select
                            value={userFilter}
                            onChange={(e) => {
                                setUserFilter(e.target.value);
                                applyFilters({ user_id: e.target.value });
                            }}
                            className="text-xs font-bold rounded-xl border border-slate-300 py-2 px-3 bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                        >
                            <option value="">All Staff Members</option>
                            {staffMembers.map((staff) => (
                                <option key={staff.id} value={staff.id}>
                                    {staff.name} ({staff.role})
                                </option>
                            ))}
                        </select>

                        <Button type="submit" variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                            Search
                        </Button>

                        {(search || actionFilter !== "ALL" || moduleFilter !== "ALL" || userFilter) && (
                            <Button type="button" variant="secondary" size="sm" onClick={handleReset} className="text-xs font-bold">
                                Clear
                            </Button>
                        )}
                    </form>
                </div>

                {/* 📋 Audit Logs Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200/80">
                                <tr>
                                    <th className="py-3.5 px-4">Date & Time</th>
                                    <th className="py-3.5 px-4">Staff / Officer</th>
                                    <th className="py-3.5 px-4">Action</th>
                                    <th className="py-3.5 px-4">Activity Narrative</th>
                                    <th className="py-3.5 px-4 text-center">IP Address</th>
                                    <th className="py-3.5 px-4 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-400">
                                            <p className="text-xs font-medium">No audit log records found for this filter.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/60 transition">
                                            {/* Timestamp */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <div className="font-bold text-slate-900">
                                                    {new Date(log.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>

                                            {/* Staff / Officer */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                {log.user ? (
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-[10px]">
                                                            {log.user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-slate-900 block leading-tight">{log.user.name}</span>
                                                            <span className="text-[10px] text-slate-400 font-mono">
                                                                {log.user.employee_id || log.user.role}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic text-[11px]">System Automated</span>
                                                )}
                                            </td>

                                            {/* Action Badge */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                {getActionBadge(log.action)}
                                            </td>

                                            {/* Description Narrative */}
                                            <td className="py-4 px-4">
                                                <p className="text-slate-800 font-medium line-clamp-2 max-w-md">
                                                    {log.description}
                                                </p>
                                                {log.properties?.remarks && (
                                                    <p className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">
                                                        Remarks: "{log.properties.remarks}"
                                                    </p>
                                                )}
                                            </td>

                                            {/* IP Address */}
                                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                                <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                                    {log.ip_address || "127.0.0.1"}
                                                </span>
                                            </td>

                                            {/* Action Modal Trigger */}
                                            <td className="py-4 px-4 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => setSelectedLog(log)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                                                    title="View Full Audit Payload"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logs.links && logs.links.length > 3 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-500">
                                Showing {logs.data.length} records
                            </span>
                            <div className="flex items-center gap-1">
                                {logs.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url || link.active}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                                            link.active
                                                ? "bg-emerald-600 text-white shadow-xs"
                                                : link.url
                                                ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                                : "text-slate-300 cursor-not-allowed"
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 🔍 LOG DETAILS MODAL */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-base">Audit Trail Entry #{selectedLog.id}</h3>
                                    <p className="text-xs text-slate-500 font-medium">Logged on {new Date(selectedLog.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 mt-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Staff Officer</span>
                                    <span className="font-bold text-slate-900 block mt-0.5">{selectedLog.user?.name || "System"}</span>
                                    <span className="text-[10px] text-slate-500 font-mono">{selectedLog.user?.email || "N/A"}</span>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Action Type</span>
                                    <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Action Narrative</span>
                                <p className="font-medium text-slate-800 mt-1">{selectedLog.description}</p>
                            </div>

                            {selectedLog.properties && (
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Action Metadata / Payload</span>
                                    <pre className="p-3 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-48 custom-scrollbar">
                                        {JSON.stringify(selectedLog.properties, null, 2)}
                                    </pre>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                                <div>
                                    <span className="font-bold">IP Address:</span> {selectedLog.ip_address || "127.0.0.1"}
                                </div>
                                <div className="text-right font-mono text-[10px] truncate" title={selectedLog.user_agent}>
                                    {selectedLog.user_agent?.substring(0, 40)}...
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
                            <Button variant="secondary" size="sm" onClick={() => setSelectedLog(null)} className="text-xs font-bold">
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </PortalLayout>
    );
}
