import React, { useState, useEffect } from "react";
import { Head, router, Link } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Card from "@/Components/Atoms/Common/Card";
import Badge from "@/Components/Atoms/Common/Badge";
import Button from "@/Components/Atoms/Common/Button";
import Input from "@/Components/Atoms/Common/Input";
import {
    Clock,
    CheckCircle2,
    XCircle,
    FileText,
    Eye,
    Check,
    X,
    Search,
    Filter,
    UserCheck,
    GraduationCap,
    School,
    ChevronRight,
    Loader2,
    Layers,
    ZoomIn,
    ZoomOut,
    RotateCw,
    Maximize2,
    Minimize2,
    ExternalLink,
    RefreshCw,
    Hand,
    Move,
    AlertCircle,
    AlertTriangle,
    Edit3,
} from "lucide-react";

export default function Enrollments({
    enrollments,
    sections = [],
    gradeLevels = [],
    filters = {},
    counts = {},
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [selectedStatus, setSelectedStatus] = useState(
        filters.status || "PENDING_COMPLETE",
    );

    useEffect(() => {
        if (filters.status) {
            setSelectedStatus(filters.status);
        }
    }, [filters.status]);

    // Modal state for reviewing an applicant
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [selectedSectionId, setSelectedSectionId] = useState("");
    const [approvalRemarks, setApprovalRemarks] = useState("");
    const [rejectRemarks, setRejectRemarks] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 🏠 Onsite Household Credentials Encoding (DepEd BEEF Compliance)
    const [onsiteGuardianName, setOnsiteGuardianName] = useState("");
    const [onsiteGuardianContact, setOnsiteGuardianContact] = useState("");
    const [onsiteAddress, setOnsiteAddress] = useState("");
    const [showOnsiteEncoder, setShowOnsiteEncoder] = useState(false);

    // 🔍 Interactive Document Viewer State (with Pan & Drag support)
    const [previewDoc, setPreviewDoc] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // 🔄 Auto-refresh (Polling every 30s) when idle and not reviewing a modal
    useEffect(() => {
        const interval = setInterval(() => {
            // Huwag mag-refresh kung kasalukuyang may binubuksan o sinusuring modal ang Registrar
            if (!selectedEnrollment && !previewDoc && !isSubmitting) {
                router.reload({
                    only: ["enrollments", "counts"],
                    preserveScroll: true,
                    preserveState: true,
                });
            }
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [selectedEnrollment, previewDoc, isSubmitting]);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = { search: searchTerm, status: selectedStatus };
        if (filters.academic_year_id) {
            params.academic_year_id = filters.academic_year_id;
        }
        if (filters.grade_level_id) {
            params.grade_level_id = filters.grade_level_id;
        }
        router.get(
            "/registrar/enrollments",
            params,
            { preserveState: true },
        );
    };

    const handleStatusFilter = (status) => {
        setSelectedStatus(status);
        const params = { search: searchTerm, status };
        if (filters.academic_year_id) {
            params.academic_year_id = filters.academic_year_id;
        }
        if (filters.grade_level_id) {
            params.grade_level_id = filters.grade_level_id;
        }
        router.get(
            "/registrar/enrollments",
            params,
            { preserveState: true },
        );
    };

    const openReviewModal = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setSelectedSectionId(enrollment.section_id || "");
        setApprovalRemarks(enrollment.remarks || "");
        setOnsiteGuardianName(enrollment.guardian_name || "");
        setOnsiteGuardianContact(enrollment.guardian_contact || "");
        setOnsiteAddress(enrollment.address || "");
        setShowOnsiteEncoder(false);
        setRejectRemarks("");
        setIsRejecting(false);
    };

    const openDocViewer = (doc) => {
        setPreviewDoc(doc);
        setZoomLevel(1);
        setRotation(0);
        setPan({ x: 0, y: 0 });
        setIsFullscreen(false);
    };

    const handleZoomIn = () =>
        setZoomLevel((prev) => Math.min(+(prev + 0.25).toFixed(2), 3.5));
    const handleZoomOut = () =>
        setZoomLevel((prev) => Math.max(+(prev - 0.25).toFixed(2), 0.5));
    const handleResetZoom = () => {
        setZoomLevel(1);
        setRotation(0);
        setPan({ x: 0, y: 0 });
    };
    const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

    // Pan & Drag Handlers for moving around when zoomed
    const handleMouseDown = (e) => {
        if (e.button !== 0) return; // Left click only
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleApprove = (e) => {
        e.preventDefault();

        const effectiveGuardian = (
            onsiteGuardianName ||
            selectedEnrollment?.guardian_name ||
            ""
        ).trim();
        const effectiveAddress = (
            onsiteAddress ||
            selectedEnrollment?.address ||
            ""
        ).trim();

        if (!effectiveGuardian || !effectiveAddress) {
            alert(
                "Bawal i-approve ang application: Kinakailangang may Parent/Guardian name at Permanent Address alinsunod sa DepEd Basic Education Enrollment Form (BEEF).",
            );
            return;
        }

        setIsSubmitting(true);

        router.post(
            `/registrar/enrollments/${selectedEnrollment.id}/approve`,
            {
                section_id: selectedSectionId || null,
                remarks: approvalRemarks,
                guardian_name: effectiveGuardian,
                guardian_contact: (
                    onsiteGuardianContact ||
                    selectedEnrollment?.guardian_contact ||
                    ""
                ).trim(),
                address: effectiveAddress,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    setSelectedEnrollment(null);
                },
                onError: () => setIsSubmitting(false),
            },
        );
    };

    const handleReject = (e) => {
        e.preventDefault();
        if (!rejectRemarks.trim()) {
            alert(
                "Please provide remarks for returning / rejecting this application.",
            );
            return;
        }

        setIsSubmitting(true);
        router.post(
            `/registrar/enrollments/${selectedEnrollment.id}/reject`,
            {
                remarks: rejectRemarks,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    setSelectedEnrollment(null);
                },
                onError: () => setIsSubmitting(false),
            },
        );
    };

    // Defensive array conversions
    const sectionList = Array.isArray(sections)
        ? sections
        : sections?.data ||
          (typeof sections === "object" && sections !== null
              ? Object.values(sections)
              : []);

    const enrollmentList = Array.isArray(enrollments?.data)
        ? enrollments.data
        : Array.isArray(enrollments)
          ? enrollments
          : [];

    return (
        <PortalLayout title="Pre-Admission & Evaluation">
            <Head title="Admission Queue - Registrar Portal" />

            <div className="space-y-6">
                {/* 🌟 Top Header */}
                <div className="bg-gradient-to-r from-[#0f4c3a] via-[#107050] to-[#0d5c43] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-2">
                                📋 DepEd SSU Pre-Admission Custodian
                            </span>
                            <h2 className="text-2xl font-black">
                                Pre-Admission Review &amp; Evaluation
                            </h2>
                            <p className="text-emerald-100 text-xs mt-1 font-medium">
                                Inspect submitted BEEF documents with
                                high-resolution zoom and drag, evaluate
                                credentials, and approve student applications.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 📊 Status Filter Tabs (Diskarte A: Separated Queues for 100% Indexed Performance) */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() =>
                                handleStatusFilter("PENDING_COMPLETE")
                            }
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                selectedStatus === "PENDING_COMPLETE"
                                    ? "bg-emerald-700 text-white shadow-xs"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                                Ready for Review ({counts.pending_complete || 0}
                                )
                            </span>
                            <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                    selectedStatus === "PENDING_COMPLETE"
                                        ? "bg-emerald-800 text-white"
                                        : "bg-emerald-100 text-emerald-800"
                                }`}
                            >
                                Complete
                            </span>
                        </button>

                        <button
                            onClick={() =>
                                handleStatusFilter("PENDING_INCOMPLETE")
                            }
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                selectedStatus === "PENDING_INCOMPLETE"
                                    ? "bg-amber-600 text-white shadow-xs"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>
                                Incomplete Form (
                                {counts.pending_incomplete || 0})
                            </span>
                            <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                    selectedStatus === "PENDING_INCOMPLETE"
                                        ? "bg-amber-700 text-white"
                                        : "bg-amber-100 text-amber-900"
                                }`}
                            >
                                Action Needed
                            </span>
                        </button>

                        <button
                            onClick={() => handleStatusFilter("APPROVED")}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                selectedStatus === "APPROVED"
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approved ({counts.approved || 0})</span>
                        </button>

                        <button
                            onClick={() => handleStatusFilter("REJECTED")}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                selectedStatus === "REJECTED"
                                    ? "bg-rose-600 text-white shadow-xs"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Returned ({counts.rejected || 0})</span>
                        </button>

                        <button
                            onClick={() => handleStatusFilter("ALL")}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                selectedStatus === "ALL"
                                    ? "bg-slate-900 text-white shadow-xs"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span>All Records ({counts.total || 0})</span>
                        </button>
                    </div>

                    <form
                        onSubmit={handleSearch}
                        className="flex items-center gap-2 w-full sm:w-auto"
                    >
                        <div className="relative flex-1 sm:w-64">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search student, ticket, LRN..."
                                className="pl-9 h-10 text-xs"
                            />
                        </div>
                        <Button
                            type="submit"
                            variant="outline"
                            className="h-10 text-xs font-bold"
                        >
                            Search
                        </Button>
                    </form>
                </div>

                {/* 📋 Application Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-4">
                                        Queue / Ticket
                                    </th>
                                    <th className="py-3.5 px-4">
                                        Learner Name &amp; LRN
                                    </th>
                                    <th className="py-3.5 px-4">
                                        Applying For
                                    </th>
                                    <th className="py-3.5 px-4">
                                        Student Details &amp; GWA
                                    </th>
                                    <th className="py-3.5 px-4">
                                        Status &amp; Readiness
                                    </th>
                                    <th className="py-3.5 px-4 text-right">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {enrollmentList.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-12 text-center text-slate-400"
                                        >
                                            No admission applications found for
                                            this filter.
                                        </td>
                                    </tr>
                                ) : (
                                    enrollmentList.map((item) => {
                                        const hasHousehold = Boolean(
                                            item.is_complete ??
                                            (item.guardian_name &&
                                                item.address),
                                        );

                                        return (
                                            <tr
                                                key={item.id}
                                                className={`hover:bg-slate-50/80 transition ${
                                                    item.status ===
                                                        "PENDING_REVIEW" &&
                                                    !hasHousehold
                                                        ? "bg-slate-50/40"
                                                        : ""
                                                }`}
                                            >
                                                <td className="py-3.5 px-4">
                                                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                                                        {item.tracking_number}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div>
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <p className="font-bold text-slate-900 text-sm">
                                                                {
                                                                    item.student
                                                                        ?.name
                                                                }
                                                            </p>
                                                            {item.student_type && (
                                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                                                                    {
                                                                        item.student_type
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                                            LRN:{" "}
                                                            {item.student
                                                                ?.lrn ||
                                                                "Pending LIS Assignment"}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="font-semibold text-slate-900">
                                                        {item.grade_level
                                                            ?.name || "Grade 7"}
                                                    </span>
                                                    {item.strand && (
                                                        <span className="block text-[10px] text-emerald-700 font-bold">
                                                            {item.strand.code}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="space-y-0.5">
                                                        <p className="text-xs font-bold text-slate-800">
                                                            GWA:{" "}
                                                            <span className="font-mono text-emerald-700">
                                                                {item.general_average ||
                                                                    "N/A"}
                                                            </span>
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                                                            {item.previous_school ||
                                                                "Elementary Graduate"}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {item.status ===
                                                        "PENDING_REVIEW" &&
                                                        (item.remarks?.includes(
                                                            "Resubmitted",
                                                        ) ? (
                                                            <Badge
                                                                variant="warning"
                                                                className="bg-amber-100 text-amber-900 border-amber-300 font-bold flex items-center gap-1"
                                                            >
                                                                <RefreshCw className="w-3 h-3 text-amber-600" />
                                                                Resubmitted
                                                                (Updated)
                                                            </Badge>
                                                        ) : hasHousehold ? (
                                                            <Badge
                                                                variant="success"
                                                                className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold flex items-center gap-1"
                                                            >
                                                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                                Ready for Review
                                                            </Badge>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                                                <AlertCircle className="w-3 h-3 text-slate-400" />
                                                                Form Incomplete
                                                            </span>
                                                        ))}
                                                    {item.status ===
                                                        "APPROVED" && (
                                                        <Badge variant="success">
                                                            Approved
                                                        </Badge>
                                                    )}
                                                    {item.status ===
                                                        "REJECTED" && (
                                                        <Badge variant="danger">
                                                            Returned
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <Button
                                                        size="sm"
                                                        variant={
                                                            item.status ===
                                                                "PENDING_REVIEW" &&
                                                            hasHousehold
                                                                ? "primary"
                                                                : "outline"
                                                        }
                                                        onClick={() =>
                                                            openReviewModal(
                                                                item,
                                                            )
                                                        }
                                                        className={`font-bold text-xs ${
                                                            item.status ===
                                                                "PENDING_REVIEW" &&
                                                            hasHousehold
                                                                ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                                                                : ""
                                                        }`}
                                                    >
                                                        <Eye className="w-3.5 h-3.5 mr-1" />
                                                        {item.status ===
                                                            "PENDING_REVIEW" &&
                                                        hasHousehold
                                                            ? "Review & Evaluate"
                                                            : "Inspect"}
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Links (Supports standard links and cursor pagination next/prev) */}
                    {(enrollments?.links?.length > 3 ||
                        enrollments?.next_page_url ||
                        enrollments?.prev_page_url) && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
                            <span className="text-slate-500">
                                Showing {enrollmentList.length}{" "}
                                {enrollments.total
                                    ? `of ${enrollments.total}`
                                    : ""}{" "}
                                applications
                            </span>
                            <div className="flex items-center gap-1.5">
                                {enrollments?.prev_page_url &&
                                    !enrollments?.links && (
                                        <Link
                                            href={enrollments.prev_page_url}
                                            preserveState
                                            className="px-3 py-1.5 rounded-lg font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                                        >
                                            &larr; Previous
                                        </Link>
                                    )}

                                {enrollments?.links &&
                                    enrollments.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || "#"}
                                            preserveState
                                            className={`px-3 py-1.5 rounded-lg font-bold ${
                                                link.active
                                                    ? "bg-emerald-600 text-white"
                                                    : link.url
                                                      ? "text-slate-700 hover:bg-slate-100"
                                                      : "text-slate-300 cursor-not-allowed"
                                            }`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}

                                {enrollments?.next_page_url &&
                                    !enrollments?.links && (
                                        <Link
                                            href={enrollments.next_page_url}
                                            preserveState
                                            className="px-3 py-1.5 rounded-lg font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                                        >
                                            Next &rarr;
                                        </Link>
                                    )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 📝 Review Application Modal */}
                {selectedEnrollment && (
                    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
                        <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                                        Application Evaluation
                                    </span>
                                    <h3 className="text-lg font-black text-slate-900 mt-1">
                                        {selectedEnrollment.student?.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-mono">
                                        Tracking Number:{" "}
                                        {selectedEnrollment.tracking_number}{" "}
                                        &bull; Applying for:{" "}
                                        <strong className="text-slate-800">
                                            {
                                                selectedEnrollment.grade_level
                                                    ?.name
                                            }
                                        </strong>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedEnrollment(null)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Student Information with BEEF Household Validation */}
                            {(() => {
                                const effectiveGuardianName = (
                                    onsiteGuardianName ||
                                    selectedEnrollment.guardian_name ||
                                    ""
                                ).trim();
                                const effectiveGuardianContact = (
                                    onsiteGuardianContact ||
                                    selectedEnrollment.guardian_contact ||
                                    ""
                                ).trim();
                                const effectiveAddress = (
                                    onsiteAddress ||
                                    selectedEnrollment.address ||
                                    ""
                                ).trim();
                                const hasGuardian = Boolean(
                                    effectiveGuardianName,
                                );
                                const hasAddress = Boolean(effectiveAddress);
                                const hasHousehold = hasGuardian && hasAddress;

                                return (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                                            <div>
                                                <p className="text-slate-400 font-bold uppercase text-[10px]">
                                                    DepEd LRN
                                                </p>
                                                <p className="font-mono font-bold text-slate-900 text-sm">
                                                    {selectedEnrollment.student
                                                        ?.lrn ||
                                                        "Pending LIS Assignment"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 font-bold uppercase text-[10px]">
                                                    Email &amp; Mobile
                                                </p>
                                                <p className="font-semibold text-slate-900">
                                                    {
                                                        selectedEnrollment
                                                            .student?.email
                                                    }{" "}
                                                    &bull;{" "}
                                                    {selectedEnrollment.student
                                                        ?.phone_number || "N/A"}
                                                </p>
                                            </div>
                                            <div
                                                className={`p-2.5 rounded-xl border transition ${
                                                    !hasGuardian
                                                        ? "bg-rose-50/80 border-rose-300 shadow-2xs"
                                                        : "bg-white border-slate-200/80"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <p className="text-slate-400 font-bold uppercase text-[10px]">
                                                        Parent / Guardian
                                                    </p>
                                                    {!hasGuardian ? (
                                                        <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200">
                                                            Required for
                                                            Approval
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                                            Complete
                                                        </span>
                                                    )}
                                                </div>
                                                <p
                                                    className={`font-semibold ${!hasGuardian ? "text-rose-700 font-bold" : "text-slate-900"}`}
                                                >
                                                    {effectiveGuardianName ||
                                                        "Not yet submitted (N/A)"}{" "}
                                                    {effectiveGuardianContact
                                                        ? `(${effectiveGuardianContact})`
                                                        : ""}
                                                </p>
                                            </div>
                                            <div
                                                className={`p-2.5 rounded-xl border transition ${
                                                    !hasAddress
                                                        ? "bg-rose-50/80 border-rose-300 shadow-2xs"
                                                        : "bg-white border-slate-200/80"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <p className="text-slate-400 font-bold uppercase text-[10px]">
                                                        Permanent Address
                                                    </p>
                                                    {!hasAddress ? (
                                                        <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200">
                                                            Required for
                                                            Approval
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                                            Complete
                                                        </span>
                                                    )}
                                                </div>
                                                <p
                                                    className={`font-semibold ${!hasAddress ? "text-rose-700 font-bold" : "text-slate-900"}`}
                                                >
                                                    {effectiveAddress ||
                                                        "Not yet submitted"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* ⚠️ Blocked Approval Warning & Onsite Encoder Toggle */}
                                        {!hasHousehold && (
                                            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2.5">
                                                <div className="flex items-start gap-2.5">
                                                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                                    <div className="flex-1">
                                                        <h5 className="font-bold text-rose-900">
                                                            Approval Blocked:
                                                            Incomplete Household
                                                            Information
                                                        </h5>
                                                        <p className="text-[11px] text-rose-800 leading-relaxed mt-0.5">
                                                            Bawal ma-approve ang
                                                            application na ito
                                                            hangga't walang
                                                            Parent / Guardian
                                                            name at Permanent
                                                            Address alinsunod sa
                                                            DepEd Basic
                                                            Education Enrollment
                                                            Form (BEEF). Maaari
                                                            itong i-return sa
                                                            estudyante o
                                                            i-encode nang
                                                            direkta kung
                                                            naririto ang
                                                            magulang onsite sa
                                                            paaralan.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-200/60">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowOnsiteEncoder(
                                                                (prev) => !prev,
                                                            )
                                                        }
                                                        className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                        {showOnsiteEncoder
                                                            ? "Hide Onsite Form"
                                                            : "Encode Onsite (If Parent is in School)"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsRejecting(
                                                                true,
                                                            );
                                                            setRejectRemarks(
                                                                "Incomplete DepEd Enrollment Form: Please update your student profile and provide your Parent/Guardian full name and complete Permanent Address.",
                                                            );
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 hover:bg-rose-100 text-rose-800 font-bold text-[11px] transition cursor-pointer"
                                                    >
                                                        Return for Correction /
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Optional Onsite Encoder Form */}
                                        {showOnsiteEncoder && (
                                            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 text-xs space-y-3 animate-fadeIn">
                                                <div className="flex items-center justify-between">
                                                    <h5 className="font-bold text-amber-900 flex items-center gap-1.5">
                                                        <Edit3 className="w-4 h-4 text-amber-700" />
                                                        Onsite Hard Copy
                                                        Credential Encoding
                                                    </h5>
                                                    <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-semibold border border-amber-300">
                                                        Direct Input
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                            Parent / Guardian
                                                            Full Name{" "}
                                                            <span className="text-rose-600">
                                                                *
                                                            </span>
                                                        </label>
                                                        <Input
                                                            value={
                                                                onsiteGuardianName
                                                            }
                                                            onChange={(e) =>
                                                                setOnsiteGuardianName(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="e.g. Maria Santos Gloria"
                                                            className="h-9 text-xs bg-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                            Guardian Contact
                                                            Number
                                                        </label>
                                                        <Input
                                                            value={
                                                                onsiteGuardianContact
                                                            }
                                                            onChange={(e) =>
                                                                setOnsiteGuardianContact(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="e.g. 09123456789"
                                                            className="h-9 text-xs bg-white"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                            Complete Permanent
                                                            Address{" "}
                                                            <span className="text-rose-600">
                                                                *
                                                            </span>
                                                        </label>
                                                        <Input
                                                            value={
                                                                onsiteAddress
                                                            }
                                                            onChange={(e) =>
                                                                setOnsiteAddress(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="e.g. Purok 3, Brgy. Central, Bulusan, Sorsogon"
                                                            className="h-9 text-xs bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}

                            {/* 🗂️ Onsite Physical Credentials Verification Checklist */}
                            <div className="space-y-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <FileText className="w-4 h-4 text-emerald-600" />
                                        Onsite Hard Copy Documents Verification
                                    </span>
                                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                        Physical Inspection
                                    </span>
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                    {[
                                        {
                                            title: "Original Form 138 / SF9",
                                            desc: "Grade 6 or Transfer Report Card",
                                        },
                                        {
                                            title: "PSA Birth Certificate",
                                            desc: "Photocopy with verified original",
                                        },
                                        {
                                            title: "Good Moral Certificate",
                                            desc: "Elementary / Guidance counselor",
                                        },
                                        {
                                            title: "2x2 Recent ID Picture",
                                            desc: "2 copies with learner name tag",
                                        },
                                    ].map((doc, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start gap-2.5"
                                        >
                                            <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-slate-900 text-xs">
                                                    {doc.title}
                                                </p>
                                                <p className="text-[10px] text-slate-500">
                                                    {doc.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Evaluation & Approval Form */}
                            {!isRejecting ? (
                                <form
                                    onSubmit={handleApprove}
                                    className="space-y-4 pt-3 border-t border-slate-100"
                                >
                                    {/* 📝 Ready-Made Remarks Dropdown & Custom Note */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-700">
                                            Registrar Remarks / Notes
                                            (Quick-Select o Custom)
                                        </label>

                                        {/* Quick-Select Dropdown */}
                                        <select
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (!val) return;
                                                if (val === "CUSTOM") {
                                                    setApprovalRemarks("");
                                                } else {
                                                    setApprovalRemarks(val);
                                                }
                                            }}
                                            className="w-full h-10 rounded-xl border border-slate-300 text-xs px-3 focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-800"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>
                                                -- Pumili ng Ready-Made Remark
                                                (o mag-type sa ibaba) --
                                            </option>
                                            <option value="All original documents verified and complete. Eligible for enrollment.">
                                                Complete: All original documents
                                                verified and complete.
                                            </option>
                                            <option value="Conditionally Approved: Form 137 / SF10 to follow.">
                                                Pending: Form 137 / SF10 to
                                                follow
                                            </option>
                                            <option value="Conditionally Approved: PSA Birth Certificate to follow.">
                                                Pending: PSA Birth Certificate
                                                to follow
                                            </option>
                                            <option value="Conditionally Approved: Good Moral Certificate to follow.">
                                                Pending: Good Moral Certificate
                                                to follow
                                            </option>
                                            <option value="Conditionally Approved: 2x2 ID Pictures to follow.">
                                                Pending: 2x2 ID Pictures to
                                                follow
                                            </option>
                                            <option value="Transferee with valid certificate of eligibility. Transfer credentials pending.">
                                                Transferee: Transfer credentials
                                                to follow
                                            </option>
                                            <option value="CUSTOM">
                                                Custom: Maglagay ng sariling
                                                note
                                            </option>
                                        </select>

                                        {/* Input / Custom Note */}
                                        <Input
                                            value={approvalRemarks}
                                            onChange={(e) =>
                                                setApprovalRemarks(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Ilagay o i-edit ang remarks (hal. PSA to follow bago mag 1st Quarter)..."
                                            className="h-10 text-xs"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsRejecting(true);
                                                const effectiveGuardian = (
                                                    onsiteGuardianName ||
                                                    selectedEnrollment.guardian_name ||
                                                    ""
                                                ).trim();
                                                const effectiveAddr = (
                                                    onsiteAddress ||
                                                    selectedEnrollment.address ||
                                                    ""
                                                ).trim();
                                                if (
                                                    !effectiveGuardian ||
                                                    !effectiveAddr
                                                ) {
                                                    setRejectRemarks(
                                                        "Incomplete DepEd Enrollment Form: Please update your student profile and provide your complete Parent/Guardian name, contact number, and Permanent Address.",
                                                    );
                                                }
                                            }}
                                            className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                                        >
                                            Return for Correction / Reject
                                        </button>

                                        {(() => {
                                            const effectiveGuardian = (
                                                onsiteGuardianName ||
                                                selectedEnrollment.guardian_name ||
                                                ""
                                            ).trim();
                                            const effectiveAddr = (
                                                onsiteAddress ||
                                                selectedEnrollment.address ||
                                                ""
                                            ).trim();
                                            const canApprove = Boolean(
                                                effectiveGuardian &&
                                                effectiveAddr,
                                            );

                                            return (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setSelectedEnrollment(
                                                                null,
                                                            )
                                                        }
                                                    >
                                                        Close
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        variant="primary"
                                                        disabled={
                                                            !canApprove ||
                                                            isSubmitting
                                                        }
                                                        className={`font-bold transition ${
                                                            !canApprove
                                                                ? "opacity-50 cursor-not-allowed bg-slate-300 text-slate-500 hover:bg-slate-300 shadow-none"
                                                                : "bg-emerald-700 hover:bg-emerald-800 text-white"
                                                        }`}
                                                        title={
                                                            !canApprove
                                                                ? "Bawal i-approve: Kulang ang Parent/Guardian o Permanent Address"
                                                                : ""
                                                        }
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                Approving...
                                                            </>
                                                        ) : (
                                                            "Approve Application"
                                                        )}
                                                    </Button>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* ⚠️ Visual Warning when Approval is Blocked */}
                                    {!Boolean(
                                        (
                                            onsiteGuardianName ||
                                            selectedEnrollment.guardian_name ||
                                            ""
                                        ).trim() &&
                                        (
                                            onsiteAddress ||
                                            selectedEnrollment.address ||
                                            ""
                                        ).trim(),
                                    ) && (
                                        <div className="flex items-center justify-end gap-1.5 pt-1 text-rose-600 text-[11px] font-bold">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            <span>
                                                Bawal i-approve: Kinakailangang
                                                may Parent/Guardian at Permanent
                                                Address.
                                            </span>
                                        </div>
                                    )}
                                </form>
                            ) : (
                                <form
                                    onSubmit={handleReject}
                                    className="space-y-4 pt-3 border-t border-slate-100"
                                >
                                    <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-900 font-medium">
                                        Return this application to the student
                                        for corrections (e.g. incomplete
                                        Parent/Guardian details, address, or
                                        physical document issues).
                                    </div>

                                    {/* Quick Selection for Return Reason */}
                                    <div className="flex flex-wrap gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setRejectRemarks(
                                                    "Incomplete DepEd Enrollment Form: Please update your student profile and provide your complete Parent/Guardian name, contact number, and Permanent Address.",
                                                )
                                            }
                                            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                                        >
                                            Kulang ang Parent/Guardian / Address
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setRejectRemarks(
                                                    "Document Verification Notice: PSA Birth Certificate copy is missing or incomplete. Pakidala ang opisyal na kopya sa Registrar Office.",
                                                )
                                            }
                                            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                                        >
                                            Kulang ang PSA Birth Certificate
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setRejectRemarks(
                                                    "Document Verification Notice: Form 138 / SF9 Report Card is missing or incomplete. Pakidala ang opisyal na kopya sa Registrar Office.",
                                                )
                                            }
                                            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                                        >
                                            Kulang ang Form 138 / SF9
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            * Reason / Remarks for Returning
                                        </label>
                                        <textarea
                                            value={rejectRemarks}
                                            onChange={(e) =>
                                                setRejectRemarks(e.target.value)
                                            }
                                            required
                                            rows={3}
                                            placeholder="Specify the missing or unclear requirements..."
                                            className="w-full rounded-xl border border-rose-300 p-3 text-xs sm:text-sm focus:border-rose-600 focus:ring-1 focus:ring-rose-600 bg-white"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsRejecting(false)
                                            }
                                            className="text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                                        >
                                            Cancel Return
                                        </button>

                                        <Button
                                            type="submit"
                                            variant="danger"
                                            disabled={
                                                isSubmitting ||
                                                !rejectRemarks.trim()
                                            }
                                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                                        >
                                            {isSubmitting
                                                ? "Processing..."
                                                : "Confirm Return"}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {/* 🔍 Interactive High-Resolution Document Viewer Modal with Pan & Drag */}
                {previewDoc && (
                    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
                        <div
                            className={`bg-slate-900 text-white rounded-3xl shadow-2xl flex flex-col transition-all duration-200 ${
                                isFullscreen
                                    ? "w-full h-full rounded-none"
                                    : "w-full max-w-6xl max-h-[92vh] h-[88vh]"
                            }`}
                        >
                            {/* Toolbar Header */}
                            <div className="p-3.5 sm:p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 rounded-t-3xl z-20">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="truncate">
                                        <h3 className="text-xs sm:text-sm font-black text-white truncate">
                                            {previewDoc.name}
                                        </h3>
                                        <p className="text-[10px] text-slate-400 font-mono truncate">
                                            {previewDoc.file_name} &bull;{" "}
                                            {previewDoc.file_size}
                                        </p>
                                    </div>
                                </div>

                                {/* Zoom & Control Tools */}
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    {/* Zoom Controls */}
                                    <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
                                        <button
                                            type="button"
                                            onClick={handleZoomOut}
                                            title="Zoom Out (-)"
                                            className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                                        >
                                            <ZoomOut className="w-4 h-4" />
                                        </button>
                                        <span className="px-2 text-[11px] font-mono font-bold text-emerald-400 select-none min-w-12 text-center">
                                            {Math.round(zoomLevel * 100)}%
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleZoomIn}
                                            title="Zoom In (+)"
                                            className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                                        >
                                            <ZoomIn className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Reset Zoom & Pan */}
                                    <button
                                        type="button"
                                        onClick={handleResetZoom}
                                        title="Reset Zoom, Pan & Rotation"
                                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition cursor-pointer"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>

                                    {/* Rotate */}
                                    <button
                                        type="button"
                                        onClick={handleRotate}
                                        title="Rotate 90°"
                                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition cursor-pointer"
                                    >
                                        <RotateCw className="w-4 h-4" />
                                    </button>

                                    {/* Fullscreen Toggle */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsFullscreen(!isFullscreen)
                                        }
                                        title={
                                            isFullscreen
                                                ? "Exit Fullscreen"
                                                : "Fullscreen"
                                        }
                                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition cursor-pointer"
                                    >
                                        {isFullscreen ? (
                                            <Minimize2 className="w-4 h-4" />
                                        ) : (
                                            <Maximize2 className="w-4 h-4" />
                                        )}
                                    </button>

                                    {/* Open Raw in New Tab */}
                                    <a
                                        href={
                                            selectedEnrollment &&
                                            previewDoc.type
                                                ? `/documents/${selectedEnrollment.id}/${previewDoc.type}?v=${previewDoc.uploaded_at ? new Date(previewDoc.uploaded_at).getTime() : Date.now()}`
                                                : previewDoc.file_path ||
                                                  previewDoc.url
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Open in New Window (Authenticated)"
                                        className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition cursor-pointer"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>

                                    {/* Close Button */}
                                    <button
                                        type="button"
                                        onClick={() => setPreviewDoc(null)}
                                        title="Close"
                                        className="p-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl transition ml-1 cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Viewer Stage Area with Pan & Drag Container */}
                            <div
                                className={`flex-1 overflow-hidden bg-slate-950 flex items-center justify-center relative select-none ${
                                    isDragging
                                        ? "cursor-grabbing"
                                        : zoomLevel > 1
                                          ? "cursor-grab"
                                          : "cursor-default"
                                }`}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >
                                {previewDoc.resource_type === "raw" ||
                                (previewDoc.format || "").toLowerCase() ===
                                    "pdf" ||
                                (
                                    previewDoc.file_name ||
                                    previewDoc.file_path ||
                                    ""
                                )
                                    .toLowerCase()
                                    .endsWith(".pdf") ? (
                                    <iframe
                                        src={
                                            selectedEnrollment &&
                                            previewDoc.type
                                                ? `/documents/${selectedEnrollment.id}/${previewDoc.type}?v=${previewDoc.uploaded_at ? new Date(previewDoc.uploaded_at).getTime() : Date.now()}`
                                                : previewDoc.file_path ||
                                                  previewDoc.url
                                        }
                                        className="w-full h-full rounded-xl border border-slate-800 bg-white"
                                        title={previewDoc.name}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
                                            transformOrigin: "center center",
                                            transition: isDragging
                                                ? "none"
                                                : "transform 0.12s ease-out",
                                        }}
                                        className="flex items-center justify-center pointer-events-none"
                                    >
                                        <img
                                            src={
                                                selectedEnrollment &&
                                                previewDoc.type
                                                    ? `/documents/${selectedEnrollment.id}/${previewDoc.type}?v=${previewDoc.uploaded_at ? new Date(previewDoc.uploaded_at).getTime() : Date.now()}`
                                                    : previewDoc.file_path ||
                                                      previewDoc.url
                                            }
                                            alt={previewDoc.name}
                                            className="max-h-[70vh] max-w-[80vw] object-contain rounded-xl shadow-2xl ring-1 ring-slate-800"
                                            draggable={false}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Footer Hint */}
                            <div className="py-2.5 px-4 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between z-20">
                                <span className="flex items-center gap-1.5">
                                    <Hand className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>
                                        {zoomLevel > 1
                                            ? "I-click at i-drag (pan) ang mouse para mag-navigate sa itaas, ibaba, o gilid ng dokumento."
                                            : "DepEd Document Verification View &bull; Form 137 / PSA Inspector"}
                                    </span>
                                </span>
                                <span className="font-mono text-[10px] text-slate-400">
                                    Zoom:{" "}
                                    <strong>
                                        {Math.round(zoomLevel * 100)}%
                                    </strong>{" "}
                                    &bull; Rotation:{" "}
                                    <strong>{rotation}&deg;</strong>
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PortalLayout>
    );
}
