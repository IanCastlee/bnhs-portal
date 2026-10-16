import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Card from "@/Components/Atoms/Common/Card";
import Badge from "@/Components/Atoms/Common/Badge";
import Button from "@/Components/Atoms/Common/Button";
import {
    Users,
    ArrowLeft,
    Search,
    Printer,
    Mail,
    Phone,
    UserCheck,
    GraduationCap,
    Clock,
} from "lucide-react";

export default function SectionRoster({
    section,
    students,
    filters = {},
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            `/teacher/sections/${section.id}/roster`,
            { search: searchTerm, cursor: filters.cursor },
            { preserveState: true }
        );
    };

    const studentList = students?.data || [];

    return (
        <PortalLayout title={`Class Advisory Roster: ${section.name}`}>
            <Head title={`Roster - ${section.name} | Bulusan NHS`} />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Link href="/teacher/dashboard">
                                <Button variant="ghost" size="sm" className="p-1.5 h-auto text-slate-500">
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                            </Link>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                                {section.grade_level?.name} - {section.name}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">
                                S.Y. {section.academic_year?.name || "2026-2027"}
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                            Class Masterlist Roster
                        </h2>
                        <p className="text-xs text-slate-500">
                            Adviser: <strong>{section.adviser?.name}</strong> &bull; Total Enrolled: <strong>{students.total || studentList.length}</strong> / Max {section.capacity}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="md"
                            onClick={() => window.print()}
                            className="text-xs"
                        >
                            <Printer className="w-4 h-4 mr-1.5" />
                            <span>Print SF1 Class Register</span>
                        </Button>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <Card className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search student by Name or 12-digit LRN..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <Button type="submit" variant="teal" size="md" className="font-bold text-xs">
                            Filter Roster
                        </Button>
                    </form>
                </Card>

                {/* Students Master Table */}
                <Card className="rounded-2xl border border-slate-200/80 p-0 overflow-hidden bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
                                    <th className="py-3.5 px-4">#</th>
                                    <th className="py-3.5 px-4">Student Name</th>
                                    <th className="py-3.5 px-4">LRN</th>
                                    <th className="py-3.5 px-4">Gender</th>
                                    <th className="py-3.5 px-4">Contact / Guardian</th>
                                    <th className="py-3.5 px-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-800">
                                {studentList.length > 0 ? (
                                    studentList.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3.5 px-4 font-mono text-slate-400 font-bold">
                                                {idx + 1}
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-slate-900">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-black text-xs shrink-0">
                                                        {item.student?.name?.charAt(0) || "S"}
                                                    </div>
                                                    <div>
                                                        <span>{item.student?.name}</span>
                                                        <span className="block text-[10px] text-slate-400 font-normal">
                                                            {item.student?.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                                                {item.student?.lrn || "N/A"}
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold text-slate-600">
                                                {item.student?.gender || item.gender || "MALE"}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600">
                                                <div className="space-y-0.5">
                                                    <p className="font-medium text-[11px] text-slate-800">{item.guardian_name || "N/A"}</p>
                                                    <p className="text-[10px] text-slate-400">{item.guardian_contact || item.student?.phone_number || "No contact"}</p>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                                    <UserCheck className="w-3 h-3" />
                                                    Enrolled
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-400">
                                            <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                            <p className="font-bold text-sm">No students found matching the search criteria.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    {students?.links && students.links.length > 3 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-500">
                                Showing {studentList.length} of {students.total || studentList.length} students
                            </span>
                            <div className="flex items-center gap-1">
                                {students.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || "#"}
                                        preserveState
                                        className={`px-3 py-1.5 rounded-lg font-bold ${
                                            link.active
                                                ? "bg-teal-600 text-white"
                                                : link.url
                                                ? "text-slate-700 hover:bg-slate-100"
                                                : "text-slate-300 cursor-not-allowed"
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </PortalLayout>
    );
}
