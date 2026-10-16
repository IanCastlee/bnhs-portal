import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Card from "@/Components/Atoms/Card";
import Button from "@/Components/Atoms/Button";
import Input from "@/Components/Atoms/Input";
import {
    Server,
    Clock,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    RotateCcw,
    Trash2,
    Eye,
    Search,
    ChevronLeft,
    ChevronRight,
    X,
    Copy,
    Check,
    Layers,
    ShieldAlert,
    Cpu,
    Inbox,
} from "lucide-react";

export default function QueueJobsIndex({
    tab = "failed",
    search = "",
    pendingCount = 0,
    failedCount = 0,
    failedLast24h = 0,
    queueConnection = "database",
    failedJobs = { data: [], links: [] },
    pendingJobs = { data: [], links: [] },
}) {
    const [activeTab, setActiveTab] = useState(tab);
    const [searchTerm, setSearchTerm] = useState(search);
    const [selectedJob, setSelectedJob] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            "/admin/queue-jobs",
            { tab: activeTab, search: searchTerm },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleTabSwitch = (newTab) => {
        setActiveTab(newTab);
        router.get(
            "/admin/queue-jobs",
            { tab: newTab, search: searchTerm },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleRefresh = () => {
        router.reload({ preserveScroll: true });
    };

    const handleRetrySingle = (id) => {
        if (!confirm(`Are you sure you want to requeue failed job #${id}?`)) return;
        setIsProcessing(true);
        router.post(
            `/admin/queue-jobs/${id}/retry`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsProcessing(false),
            }
        );
    };

    const handleRetryAll = () => {
        if (!confirm("Are you sure you want to requeue ALL failed background jobs?")) return;
        setIsProcessing(true);
        router.post(
            "/admin/queue-jobs/retry-all",
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsProcessing(false),
            }
        );
    };

    const handleDeleteSingle = (id) => {
        if (!confirm(`Are you sure you want to permanently delete failed job #${id}?`)) return;
        setIsProcessing(true);
        router.delete(`/admin/queue-jobs/${id}`, {
            preserveScroll: true,
            onFinish: () => setIsProcessing(false),
        });
    };

    const handleFlushAll = () => {
        if (
            !confirm(
                "Warning: This will permanently delete ALL failed jobs from the quarantine. Continue?"
            )
        )
            return;
        setIsProcessing(true);
        router.delete("/admin/queue-jobs/flush-all", {
            preserveScroll: true,
            onFinish: () => setIsProcessing(false),
        });
    };

    const handleCancelPending = (id) => {
        if (!confirm(`Cancel pending job #${id}?`)) return;
        setIsProcessing(true);
        router.delete(`/admin/queue-jobs/pending/${id}`, {
            preserveScroll: true,
            onFinish: () => setIsProcessing(false),
        });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <PortalLayout title="Queue & Background Jobs">
            <Head title="Queue Monitor - Admin Portal" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-[#0f4c3a] via-[#107050] to-[#0d5c43] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-2">
                                DepEd SSU System Infrastructure &amp; Queue Custodian
                            </span>
                            <h2 className="text-2xl font-black">Queue &amp; Background Jobs Monitor</h2>
                            <p className="text-emerald-100 text-xs mt-1 font-medium">
                                Supervise asynchronous mail notifications, post-approval workflows, and automated retries across background workers.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleRefresh}
                                variant="outline"
                                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold flex items-center gap-2 cursor-pointer"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Refresh Status
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4 border-slate-200/80 shadow-xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Queue Connection
                                </p>
                                <h3 className="text-xl font-black text-slate-900 mt-1 capitalize">
                                    {queueConnection}
                                </h3>
                                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                                    Active Database Driver
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Cpu className="w-5 h-5" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 border-slate-200/80 shadow-xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Pending in Queue
                                </p>
                                <h3 className="text-xl font-black text-slate-900 mt-1">
                                    {pendingCount}
                                </h3>
                                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                    Tasks awaiting execution
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                    </Card>

                    <Card className={`p-4 border-slate-200/80 shadow-xs ${failedCount > 0 ? "bg-rose-50/40" : ""}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Quarantined Failures
                                </p>
                                <h3 className={`text-xl font-black mt-1 ${failedCount > 0 ? "text-rose-600" : "text-slate-900"}`}>
                                    {failedCount}
                                </h3>
                                <p className="text-[11px] font-medium mt-0.5 text-slate-500">
                                    {failedCount > 0 ? "Requires admin review" : "Zero errors reported"}
                                </p>
                            </div>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${failedCount > 0 ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-600"}`}>
                                <AlertCircle className="w-5 h-5" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 border-slate-200/80 shadow-xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Failures (Last 24h)
                                </p>
                                <h3 className="text-xl font-black text-slate-900 mt-1">
                                    {failedLast24h}
                                </h3>
                                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                    Recent job exceptions
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Tabs & Search Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleTabSwitch("failed")}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                activeTab === "failed"
                                    ? "bg-rose-600 text-white shadow-xs"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Quarantined Failures ({failedCount})</span>
                        </button>

                        <button
                            onClick={() => handleTabSwitch("pending")}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                activeTab === "pending"
                                    ? "bg-emerald-700 text-white shadow-xs"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending Queue ({pendingCount})</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by task or error..."
                                className="pl-8 h-9 text-xs"
                            />
                        </form>

                        {activeTab === "failed" && failedCount > 0 && (
                            <div className="flex items-center gap-1.5">
                                <Button
                                    onClick={handleRetryAll}
                                    disabled={isProcessing}
                                    variant="outline"
                                    className="h-9 px-3 text-xs font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50 flex items-center gap-1 cursor-pointer"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Retry All
                                </Button>
                                <Button
                                    onClick={handleFlushAll}
                                    disabled={isProcessing}
                                    variant="outline"
                                    className="h-9 px-3 text-xs font-bold text-rose-700 border-rose-300 hover:bg-rose-50 flex items-center gap-1 cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Clear All
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tab 1: Failed Jobs Quarantine */}
                {activeTab === "failed" && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4">Job ID</th>
                                        <th className="py-3 px-4">Background Task</th>
                                        <th className="py-3 px-4">Error Summary</th>
                                        <th className="py-3 px-4">Failed At</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                    {failedJobs.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                        <CheckCircle2 className="w-6 h-6" />
                                                    </div>
                                                    <p className="font-bold text-slate-700">
                                                        Quarantine is clean and healthy.
                                                    </p>
                                                    <p className="text-xs text-slate-400 max-w-sm">
                                                        All queued tasks, post-approval ledger provisions, and email notifications have executed without failure.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        failedJobs.data.map((job) => (
                                            <tr key={job.id} className="hover:bg-slate-50/80 transition">
                                                <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                                    #{job.id}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="font-bold text-slate-900">
                                                        {job.display_name}
                                                    </p>
                                                    {job.summary && (
                                                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-semibold mt-0.5">
                                                            {job.summary}
                                                        </span>
                                                    )}
                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                        Queue: {job.queue}
                                                    </p>
                                                </td>
                                                <td className="py-3 px-4 max-w-md">
                                                    <p className="text-rose-700 font-mono text-[11px] truncate">
                                                        {job.exception_short}
                                                    </p>
                                                </td>
                                                <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                                                    {job.failed_at}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            onClick={() => setSelectedJob(job)}
                                                            variant="outline"
                                                            className="h-8 px-2.5 text-[11px] font-bold text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer"
                                                        >
                                                            <Eye className="w-3 h-3 mr-1 text-slate-500" />
                                                            Inspect
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleRetrySingle(job.id)}
                                                            disabled={isProcessing}
                                                            variant="outline"
                                                            className="h-8 px-2.5 text-[11px] font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                                                        >
                                                            <RotateCcw className="w-3 h-3 mr-1" />
                                                            Retry
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDeleteSingle(job.id)}
                                                            disabled={isProcessing}
                                                            variant="outline"
                                                            className="h-8 px-2 text-[11px] font-bold text-rose-700 border-rose-300 hover:bg-rose-50 cursor-pointer"
                                                            title="Delete from quarantine"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {failedJobs.links && failedJobs.links.length > 3 && (
                            <div className="p-3 border-t border-slate-200/80 flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-medium">
                                    Showing {failedJobs.from || 0} to {failedJobs.to || 0} of {failedJobs.total} entries
                                </span>
                                <div className="flex items-center gap-1">
                                    {failedJobs.links.map((link, i) => (
                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() => router.get(link.url, {}, { preserveScroll: true, preserveState: true })}
                                            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition cursor-pointer ${
                                                link.active
                                                    ? "bg-slate-900 text-white"
                                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                            } ${!link.url ? "opacity-40 cursor-not-allowed" : ""}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 2: Pending Queue */}
                {activeTab === "pending" && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4">Queue ID</th>
                                        <th className="py-3 px-4">Target Task</th>
                                        <th className="py-3 px-4">Attempts</th>
                                        <th className="py-3 px-4">Enqueued At</th>
                                        <th className="py-3 px-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                    {pendingJobs.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                                                        <Inbox className="w-6 h-6" />
                                                    </div>
                                                    <p className="font-bold text-slate-700">
                                                        Queue is currently idle.
                                                    </p>
                                                    <p className="text-xs text-slate-400 max-w-sm">
                                                        No background tasks are pending execution. All submitted actions have completed.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        pendingJobs.data.map((job) => (
                                            <tr key={job.id} className="hover:bg-slate-50/80 transition">
                                                <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                                    #{job.id}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="font-bold text-slate-900">
                                                        {job.display_name}
                                                    </p>
                                                    {job.summary && (
                                                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-semibold mt-0.5">
                                                            {job.summary}
                                                        </span>
                                                    )}
                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                        Queue: {job.queue}
                                                    </p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                                                        {job.attempts} of 3
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                                                    {job.created_at}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <Button
                                                        onClick={() => handleCancelPending(job.id)}
                                                        disabled={isProcessing}
                                                        variant="outline"
                                                        className="h-8 px-2.5 text-[11px] font-bold text-rose-700 border-rose-300 hover:bg-rose-50 cursor-pointer"
                                                    >
                                                        Cancel Task
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pendingJobs.links && pendingJobs.links.length > 3 && (
                            <div className="p-3 border-t border-slate-200/80 flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-medium">
                                    Showing {pendingJobs.from || 0} to {pendingJobs.to || 0} of {pendingJobs.total} entries
                                </span>
                                <div className="flex items-center gap-1">
                                    {pendingJobs.links.map((link, i) => (
                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() => router.get(link.url, {}, { preserveScroll: true, preserveState: true })}
                                            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition cursor-pointer ${
                                                link.active
                                                    ? "bg-slate-900 text-white"
                                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                            } ${!link.url ? "opacity-40 cursor-not-allowed" : ""}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Inspect Error Modal */}
            {selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">
                                    Failed Job Diagnostic Inspection: #{selectedJob.id}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {selectedJob.display_name} • Failed at {selectedJob.failed_at}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedJob(null)}
                                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto space-y-4">
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                    Exception Message &amp; Root Cause
                                </label>
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 font-mono text-xs">
                                    {selectedJob.exception_short}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        Full Exception Stack Trace
                                    </label>
                                    <button
                                        onClick={() => copyToClipboard(selectedJob.exception_full)}
                                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copied ? "Copied to Clipboard" : "Copy Stack Trace"}
                                    </button>
                                </div>
                                <pre className="p-3.5 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto max-h-72 leading-relaxed">
                                    {selectedJob.exception_full}
                                </pre>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                UUID: <code className="font-mono text-[10px]">{selectedJob.uuid}</code>
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => setSelectedJob(null)}
                                    variant="outline"
                                    className="h-8 text-xs font-bold text-slate-600 cursor-pointer"
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={() => {
                                        const id = selectedJob.id;
                                        setSelectedJob(null);
                                        handleRetrySingle(id);
                                    }}
                                    className="h-8 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
                                >
                                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                                    Retry Job Now
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PortalLayout>
    );
}
