import React, { useState, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import Card from "@/Components/Atoms/Common/Card";
import Badge from "@/Components/Atoms/Common/Badge";
import { useAuth } from "@/Hooks/useAuth";
import { useSchoolSettings } from "@/Hooks/useSchoolSettings";
import { formatLRN } from "@/Utils/formatters";
import { compressIdPhoto } from "@/Utils/compressImage";
import { toast } from "@/Context/ToastContext";
import {
    UserCircle,
    Fingerprint,
    QrCode,
    Phone,
    Mail,
    MapPin,
    Shield,
    KeyRound,
    Calendar,
    Award,
    School,
    Camera,
    Loader2,
} from "lucide-react";

export default function Profile({ enrollment }) {
    const { user } = useAuth();
    const school = useSchoolSettings();
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewAvatar, setPreviewAvatar] = useState(user?.avatar_path || null);
    const [uploadError, setUploadError] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError(null);
        setIsUploading(true);

        try {
            // ⚡ 1. Compress & convert directly to WebP (600x600, ~40-80KB)
            const webpFile = await compressIdPhoto(file);

            // ⚡ 2. Instant Local Preview
            const localUrl = URL.createObjectURL(webpFile);
            setPreviewAvatar(localUrl);

            // ⚡ 3. Send to Server to save to Cloudinary
            const formData = new FormData();
            formData.append("avatar", webpFile);

            router.post("/student/profile/avatar", formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsUploading(false);
                },
                onError: (errs) => {
                    setIsUploading(false);
                    setUploadError(Object.values(errs)[0] || "Hindi ma-upload ang larawan.");
                },
            });
        } catch (err) {
            setIsUploading(false);
            const errMsg = "Nabigo ang pag-proseso ng larawan.";
            setUploadError(errMsg);
            toast.error(errMsg);
        }
    };

    return (
        <StudentLayout title="My Profile & LRN">
            <Head title={`My Profile - ${school.short_name}`} />

            <div className="sm:space-y-6">
                {/* 🌟 LAYER 1 (z-10): BNHS Green Maximized Header Banner Backdrop */}
                <div className="relative z-10 -mx-2.5 -mt-3.5 sm:mx-0 sm:mt-0 bg-gradient-to-br from-[#042219] via-[#0b4635] to-[#062d21] sm:rounded-2xl px-5 pt-4 pb-12 sm:p-6 text-white shadow-xl overflow-hidden sm:border border-emerald-400/20">
                    <div className="hidden sm:block absolute -top-12 -right-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-teal-400/15 rounded-full blur-2xl pointer-events-none" />

                    {/* Half-Visible Blurred Watermark Logo on Right Edge */}
                    {school.logo_url ? (
                        <img
                            src={school.logo_url}
                            alt=""
                            aria-hidden="true"
                            className="pointer-events-none select-none absolute -right-14 -bottom-6 w-48 h-48 sm:w-52 sm:h-52 object-contain opacity-20 blur-[2px]"
                        />
                    ) : (
                        <School
                            aria-hidden="true"
                            className="pointer-events-none select-none absolute -right-12 -bottom-6 w-44 h-44 sm:w-48 sm:h-48 text-emerald-300 opacity-15 blur-[2px]"
                        />
                    )}

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {/* 📸 Interactive Avatar with Camera Upload Button */}
                            <div className="relative group shrink-0">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/png,image/jpeg,image/webp,image/jpg"
                                    className="hidden"
                                />

                                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl ring-4 ring-white/20 overflow-hidden relative">
                                    {previewAvatar || user?.avatar_path ? (
                                        <img
                                            src={previewAvatar || user?.avatar_path}
                                            alt={user?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>{user?.name?.charAt(0) || "J"}</span>
                                    )}

                                    {isUploading && (
                                        <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center text-white">
                                            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg ring-2 ring-white transition cursor-pointer active:scale-90"
                                    title="Mag-palit ng Profile Picture (WebP Compressed)"
                                >
                                    <Camera className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                    <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-md backdrop-blur-xs">
                                        {enrollment?.grade_level?.name || "Grade 7"} • {enrollment?.section?.name || "Pending Section"}
                                    </span>
                                    <Badge variant="success" className="bg-emerald-400 text-slate-950 font-black border-none text-xs">
                                        ACTIVE STUDENT
                                    </Badge>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black text-white">
                                    {user?.name || "Juan Dela Cruz"}
                                </h2>
                                <p className="text-emerald-200 text-xs mt-0.5 font-mono">
                                    LRN: {formatLRN(user?.lrn || "102938475612")}
                                </p>
                                {uploadError && (
                                    <p className="text-rose-300 text-[11px] font-bold mt-1 bg-rose-950/50 px-2 py-0.5 rounded inline-block">
                                        {uploadError}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 📱 LAYER 2 (z-20): Overlapping Rounded Content Sheet on Mobile */}
                <div className="relative z-20 -mt-6 sm:mt-0 -mx-2.5 sm:mx-0 px-3.5 pt-5 pb-2 sm:p-0 bg-[#f4f7fa] sm:bg-transparent rounded-t-3xl sm:rounded-none shadow-[0_-6px_20px_rgba(0,0,0,0.08)] sm:shadow-none">
                    {/* Profile Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left 2 Cols: Detailed Demographic Information */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                                <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                    <UserCircle className="w-4 h-4 text-emerald-600" />
                                    Official Learner Identification
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Full Legal Name</p>
                                        <p className="font-bold text-slate-900 mt-1">{user?.name || "Juan Dimagiba Dela Cruz"}</p>
                                    </div>

                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">DepEd LRN (12 Digits)</p>
                                        <p className="font-mono font-bold text-emerald-700 mt-1">{formatLRN(user?.lrn || "102938475612")}</p>
                                    </div>

                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Date of Birth / Age</p>
                                        <p className="font-bold text-slate-900 mt-1">October 14, 2013 (13 y/o)</p>
                                    </div>

                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Sex / Gender</p>
                                        <p className="font-bold text-slate-900 mt-1">Male</p>
                                    </div>

                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Email Address</p>
                                        <p className="font-bold text-slate-900 mt-1">{user?.email || "student@bnhs.edu.ph"}</p>
                                    </div>

                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Residential Address</p>
                                        <p className="font-bold text-slate-900 mt-1">Brgy. Central, Bulusan, Sorsogon</p>
                                    </div>
                                </div>
                            </div>

                            {/* Guardian Information */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                                <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-emerald-600" />
                                    Parent / Guardian &amp; Emergency Contact
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Father's Name</p>
                                        <p className="font-bold text-slate-900 mt-1">Eduardo Dela Cruz</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">📞 0917-849-2011</p>
                                    </div>

                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Mother's Maiden Name</p>
                                        <p className="font-bold text-slate-900 mt-1">Lourdes Dimagiba</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">📞 0920-394-1823</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Col: Digital Student ID & Security Card */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-[#1b2a47] to-[#121c30] text-white p-6 rounded-2xl shadow-lg border border-[#2a3c61] text-center space-y-4">
                                <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                    <School className="w-4 h-4" />
                                    <span>Digital Student ID Badge</span>
                                </div>

                                <div className="w-24 h-24 mx-auto rounded-2xl bg-white p-2 shadow-inner flex items-center justify-center">
                                    <QrCode className="w-full h-full text-slate-900" />
                                </div>

                                <div>
                                    <h4 className="font-black text-base text-white">{user?.name || "Juan Dela Cruz"}</h4>
                                    <p className="text-xs text-emerald-300 font-mono mt-0.5">{formatLRN(user?.lrn || "102938475612")}</p>
                                    <p className="text-[11px] text-slate-400 mt-1">Valid for S.Y. 2026-2027</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <KeyRound className="w-4 h-4 text-emerald-600" />
                                    Account Security
                                </h4>
                                <p className="text-xs text-slate-500">
                                    You are signed in via DepEd Single Sign-On (SSO). Password changes must be coordinated with the school registrar.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
