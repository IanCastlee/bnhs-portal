import React from "react";

export default function AdmissionPrintSlip({
    user,
    enrollment,
    trackingNo,
    queuePosition,
    isApproved,
    docSlots,
    getUploadedDoc,
}) {
    return (
        <div id="admission-print-slip" className="hidden print:block bg-white text-slate-950 p-6 sm:p-8 max-w-4xl mx-auto space-y-6 text-xs font-sans">
            {/* 1. DepEd Official Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4 space-y-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                    Republic of the Philippines • Department of Education
                </p>
                <p className="text-[11px] font-bold text-slate-700">
                    Region V (Bicol) • Schools Division Office of Sorsogon
                </p>
                <h1 className="text-lg font-black tracking-tight text-slate-950 uppercase pt-0.5">
                    Bulusan National High School
                </h1>
                <p className="text-[10px] text-slate-500">
                    San Roque, Bulusan, Sorsogon • School ID: 302196
                </p>
                <div className="pt-2">
                    <span className="inline-block px-4 py-1 rounded bg-slate-900 text-white font-black text-xs tracking-wider uppercase">
                        Basic Education Enrollment &amp; Pre-Admission Slip (BEEF Annex A)
                    </span>
                    <p className="text-[10px] font-semibold text-slate-600 mt-1">
                        School Year 2026 – 2027 • Learner Information System (LIS)
                    </p>
                </div>
            </div>

            {/* 2. Queue Ticket & Status Banner */}
            <div className="border-2 border-slate-900 rounded-xl p-3 bg-slate-50 flex items-center justify-between">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Application Queue Ticket Number
                    </span>
                    <span className="text-lg font-black font-mono text-slate-950">
                        {trackingNo}
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Admission Status
                    </span>
                    <span className="text-xs font-black uppercase px-2.5 py-1 rounded bg-slate-900 text-white inline-block">
                        {isApproved
                            ? "OFFICIALLY ENROLLED"
                            : "PENDING REVIEW"}
                    </span>
                </div>
            </div>

            {/* 3. Section 1: Learner Personal Information */}
            <div className="border border-slate-300 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 font-black text-[11px] uppercase tracking-wider text-slate-800">
                    I. Learner Profile &amp; Grade Level
                </div>
                <div className="p-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">
                            Learner Full Name:
                        </span>
                        <span className="font-bold text-slate-950">
                            {user?.name}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">
                            DepEd 12-Digit LRN:
                        </span>
                        <span className="font-mono font-bold text-slate-950">
                            {user?.lrn || "Pending LIS Assignment"}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">
                            Applying Grade &amp; Track:
                        </span>
                        <span className="font-bold text-slate-950">
                            {(enrollment?.grade_level?.name || enrollment?.gradeLevel?.name || "Grade 7")} (
                            {enrollment?.student_type || "NEW"} Student)
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">
                            Registered Email &amp; Mobile:
                        </span>
                        <span className="font-medium text-slate-800">
                            {user?.email} • {user?.phone_number || "N/A"}
                        </span>
                    </div>
                </div>
            </div>

            {/* 4. Section 2: Household & Guardian Details */}
            <div className="border border-slate-300 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 font-black text-[11px] uppercase tracking-wider text-slate-800">
                    II. Household &amp; Guardian Information
                </div>
                <div className="p-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">
                            Parent / Guardian Name:
                        </span>
                        <span className="font-bold text-slate-950">
                            {enrollment?.guardian_name || "N/A"}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">
                            Guardian Contact Number:
                        </span>
                        <span className="font-mono font-bold text-slate-950">
                            {enrollment?.guardian_contact || "N/A"}
                        </span>
                    </div>
                    <div className="col-span-2">
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">
                            Permanent Home Address:
                        </span>
                        <span className="font-medium text-slate-950">
                            {enrollment?.address || "N/A"}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">
                            Previous Elementary School:
                        </span>
                        <span className="font-medium text-slate-950">
                            {enrollment?.previous_school || "N/A"}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">
                            Last GWA / 4Ps Household ID:
                        </span>
                        <span className="font-medium text-slate-950">
                            GWA: {enrollment?.general_average || "N/A"} • 4Ps: {enrollment?.four_ps_number || "None"}
                        </span>
                    </div>
                </div>
            </div>

            {/* 5. Section 3: Physical Admission Credentials Verification Stub */}
            <div className="border border-slate-300 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 font-black text-[11px] uppercase tracking-wider text-slate-800 flex items-center justify-between">
                    <span>III. Onsite Physical Credentials Verification Checklist (To be checked by Registrar)</span>
                    <span className="text-[10px] text-slate-500 font-normal">Original Hard Copies Required</span>
                </div>
                <div className="p-3 grid grid-cols-2 gap-2 text-xs">
                    {[
                        { title: "Original Form 138 / SF9 (Grade 6 / Transfer Card)", desc: "Signed with Eligibility for Admission" },
                        { title: "PSA Birth Certificate (Photocopy)", desc: "Clear authenticated PSA or NSO record" },
                        { title: "Certificate of Good Moral Character", desc: "Issued by Elementary Principal / Guidance" },
                        { title: "2x2 Recent ID Pictures (2 Copies)", desc: "Formal white background with name tag" },
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-2 p-2 rounded border border-slate-200 bg-slate-50/50"
                        >
                            <span className="w-4 h-4 rounded border-2 border-slate-500 flex items-center justify-center font-black text-[10px] text-transparent">
                                [ ]
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-slate-900 text-[11px] truncate">
                                    {item.title}
                                </p>
                                <p className="text-[9px] text-slate-500 truncate">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 6. Section 4: Registrar Verification & Sectioning Stub */}
            <div className="border-2 border-dashed border-slate-400 rounded-xl p-4 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="font-black text-xs uppercase tracking-wider text-slate-900">
                        IV. Registrar Office Sectioning &amp; Admission Action Stub
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                        Date Printed:{" "}
                        {new Date().toLocaleDateString("en-PH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2 text-xs">
                    <div className="border-b border-slate-400 pb-1">
                        <span className="text-slate-500 text-[9px] block uppercase font-bold">
                            Assigned Section:
                        </span>
                        <span className="font-black text-slate-900">
                            {enrollment?.section?.name || "____________________"}
                        </span>
                    </div>
                    <div className="border-b border-slate-400 pb-1">
                        <span className="text-slate-500 text-[9px] block uppercase font-bold">
                            Section Adviser:
                        </span>
                        <span className="font-black text-slate-900">
                            {enrollment?.section?.adviser?.name || "____________________"}
                        </span>
                    </div>
                    <div className="border-b border-slate-400 pb-1">
                        <span className="text-slate-500 text-[9px] block uppercase font-bold">
                            Verified by Registrar:
                        </span>
                        <span className="font-black text-slate-900">
                            ____________________
                        </span>
                    </div>
                </div>

                <p className="text-[9px] text-slate-500 italic text-center pt-2">
                    * Note: Please present this slip or your online Queue Ticket ({trackingNo}) to the School Registrar during physical validation.
                </p>
            </div>
        </div>
    );
}
