import React, { useState, useRef } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Card from "@/Components/Atoms/Card";
import Button from "@/Components/Atoms/Button";
import Input from "@/Components/Atoms/Input";
import {
    Building2,
    Upload,
    Trash2,
    CheckCircle2,
    ShieldCheck,
    Globe,
    Mail,
    Phone,
    MapPin,
    Sparkles,
    Eye,
    RefreshCw,
} from "lucide-react";

export default function SchoolSettingsIndex({ schoolSettings = {} }) {
    const { props } = usePage();
    const flashSuccess = props?.flash?.success;
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        school_name: schoolSettings.school_name || "Bulusan National High School",
        short_name: schoolSettings.short_name || "Bulusan NHS",
        portal_title: schoolSettings.portal_title || "BNHS Portal",
        school_id: schoolSettings.school_id || "302196",
        region: schoolSettings.region || "DepEd Region V SDO",
        tagline: schoolSettings.tagline || "DepEd SSU OPAS & BEEF Portal",
        address: schoolSettings.address || "Bulusan, Sorsogon",
        contact_email: schoolSettings.contact_email || "302196@deped.gov.ph",
        contact_phone: schoolSettings.contact_phone || "",
    });

    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(schoolSettings.logo_url || null);
    const [removeLogo, setRemoveLogo] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handleSelectLogo = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLogoFile(file);
        setRemoveLogo(false);
        setLogoPreview(URL.createObjectURL(file));
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        setRemoveLogo(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        Object.entries(form).forEach(([key, val]) => {
            formData.append(key, val ?? "");
        });

        if (logoFile) {
            formData.append("logo", logoFile);
        }
        if (removeLogo) {
            formData.append("remove_logo", "1");
        }

        router.post("/admin/settings", formData, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setProcessing(false),
            onError: (errs) => setErrors(errs),
        });
    };

    const previewInitial = (form.short_name || form.school_name || "B").trim().charAt(0).toUpperCase();

    return (
        <PortalLayout title="School Identity & Branding Settings">
            <Head title={`School Branding - ${form.short_name}`} />

            <div className="space-y-6">
                {/* Top Hero Header */}
                <div className="bg-gradient-to-r from-[#07241c] via-[#0f4c3a] to-[#0d5c43] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden border border-emerald-400/15">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="School Logo"
                                    className="w-12 h-12 object-contain shrink-0 drop-shadow-md"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-emerald-300 shrink-0">
                                    <Building2 className="w-6 h-6" />
                                </div>
                            )}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/25">
                                        Global Cached Identity
                                    </span>
                                    <span className="text-xs text-emerald-200/80 font-mono">
                                        School ID: {form.school_id || "302196"}
                                    </span>
                                </div>
                                <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
                                    School Profile, Name & Official Logo
                                </h1>
                                <p className="text-xs text-emerald-100/80 mt-0.5">
                                    Changes here automatically update all portals, headers, sidebars, and login pages via global cache.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flash Success Notice */}
                {flashSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs font-semibold text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{flashSuccess}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* LEFT / MAIN COLUMN: Settings Form */}
                    <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                        {/* 1. Official Logo Card */}
                        <Card className="p-6 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Official School Logo / Seal
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Displayed on the Sidebar, Mobile Top Header, and Login/Registration Showcase
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
                                {logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        alt="School Logo Preview"
                                        className="w-20 h-20 object-contain shrink-0 drop-shadow-sm"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md ring-4 ring-emerald-500/20 shrink-0">
                                        <span>{previewInitial}</span>
                                    </div>
                                )}

                                <div className="flex-1 space-y-2.5 text-center sm:text-left">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                        onChange={handleSelectLogo}
                                        className="hidden"
                                    />

                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-xs font-semibold"
                                        >
                                            <Upload className="w-3.5 h-3.5 mr-1.5" />
                                            Upload New Logo
                                        </Button>

                                        {logoPreview && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveLogo}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/80 transition cursor-pointer"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Remove Logo
                                            </button>
                                        )}
                                    </div>

                                    <p className="text-[11px] text-slate-400">
                                        Recommended: Square PNG, WebP, or JPG (at least 200x200px, max 5MB). If no logo is uploaded, the initial badge ({previewInitial}) is used.
                                    </p>
                                    {errors.logo && (
                                        <p className="text-xs text-rose-600 font-medium">{errors.logo}</p>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* 2. Institutional Identity Fields */}
                        <Card className="p-6 space-y-4">
                            <div className="pb-3 border-b border-slate-100">
                                <h3 className="text-sm font-bold text-slate-900">
                                    School Name & Institutional Details
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Configure the official school name, short name, and DepEd identification
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Official Full School Name <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        value={form.school_name}
                                        onChange={(e) => handleChange("school_name", e.target.value)}
                                        placeholder="e.g. Bulusan National High School"
                                        required
                                    />
                                    {errors.school_name && (
                                        <p className="text-xs text-rose-600 mt-1">{errors.school_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Short Name (Mobile & Footer) <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        value={form.short_name}
                                        onChange={(e) => handleChange("short_name", e.target.value)}
                                        placeholder="e.g. Bulusan NHS"
                                        required
                                    />
                                    {errors.short_name && (
                                        <p className="text-xs text-rose-600 mt-1">{errors.short_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Sidebar Brand Title <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        value={form.portal_title}
                                        onChange={(e) => handleChange("portal_title", e.target.value)}
                                        placeholder="e.g. BNHS PORTAL"
                                        required
                                    />
                                    {errors.portal_title && (
                                        <p className="text-xs text-rose-600 mt-1">{errors.portal_title}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        DepEd School ID <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        value={form.school_id}
                                        onChange={(e) => handleChange("school_id", e.target.value)}
                                        placeholder="e.g. 302196"
                                        required
                                        className="font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        DepEd Region / Division <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        value={form.region}
                                        onChange={(e) => handleChange("region", e.target.value)}
                                        placeholder="e.g. DepEd Region V SDO"
                                        required
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Portal Subtitle / Tagline
                                    </label>
                                    <Input
                                        value={form.tagline}
                                        onChange={(e) => handleChange("tagline", e.target.value)}
                                        placeholder="e.g. DepEd SSU OPAS & BEEF Portal"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* 3. Contact & Address Info */}
                        <Card className="p-6 space-y-4">
                            <div className="pb-3 border-b border-slate-100">
                                <h3 className="text-sm font-bold text-slate-900">
                                    Campus Address & Contact Details
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Used on printable enrollment slips and official portal footers
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Campus Address
                                    </label>
                                    <Input
                                        value={form.address}
                                        onChange={(e) => handleChange("address", e.target.value)}
                                        placeholder="e.g. Bulusan, Sorsogon"
                                        icon={MapPin}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Official Email
                                    </label>
                                    <Input
                                        type="email"
                                        value={form.contact_email}
                                        onChange={(e) => handleChange("contact_email", e.target.value)}
                                        placeholder="e.g. 302196@deped.gov.ph"
                                        icon={Mail}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Contact Number
                                    </label>
                                    <Input
                                        value={form.contact_phone}
                                        onChange={(e) => handleChange("contact_phone", e.target.value)}
                                        placeholder="e.g. +63 912 345 6789"
                                        icon={Phone}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                <Button
                                    type="submit"
                                    variant="emerald"
                                    size="md"
                                    loading={processing}
                                    disabled={processing}
                                    className="font-semibold px-6"
                                >
                                    Save & Update Global Cache
                                </Button>
                            </div>
                        </Card>
                    </form>

                    {/* RIGHT COLUMN: Live Real-Time Preview */}
                    <div className="space-y-4 lg:sticky lg:top-6">
                        <Card className="p-5 space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                                <Eye className="w-4 h-4 text-emerald-600" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Live Component Previews
                                </h3>
                            </div>

                            {/* Preview 1: Desktop Sidebar Header */}
                            <div className="space-y-1.5">
                                <span className="text-[11px] font-medium text-slate-500">
                                    1. Sidebar Top Brand
                                </span>
                                <div className="h-14 px-4 rounded-xl bg-[#16223b] flex items-center gap-3 text-white shadow-sm">
                                    {logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            alt="Logo"
                                            className="w-9 h-9 object-contain shrink-0 drop-shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-black text-white text-sm ring-2 ring-emerald-400/30 shrink-0">
                                            <span>{previewInitial}</span>
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="font-extrabold text-xs tracking-wider uppercase truncate">
                                            {form.portal_title || "BNHS PORTAL"}
                                        </p>
                                        <p className="text-[10px] text-emerald-400 font-semibold truncate">
                                            {form.short_name || "Bulusan NHS"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Preview 2: Mobile Student Top Header */}
                            <div className="space-y-1.5">
                                <span className="text-[11px] font-medium text-slate-500">
                                    2. Mobile Header Bar
                                </span>
                                <div className="h-13 px-4 rounded-xl bg-gradient-to-r from-[#07241c] via-[#0f4c3a] to-[#0d5c43] flex items-center justify-between text-white shadow-sm">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="Logo"
                                                className="w-8 h-8 object-contain shrink-0 drop-shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-black text-white text-xs ring-2 ring-emerald-300/40 shrink-0">
                                                <span>{previewInitial}</span>
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-xs font-black tracking-wider uppercase truncate">
                                                {form.short_name || "Bulusan NHS"}
                                            </p>
                                            <p className="text-[10px] text-emerald-300 font-semibold">
                                                Student Portal
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Preview 3: Sidebar Institutional Footer */}
                            <div className="space-y-1.5">
                                <span className="text-[11px] font-medium text-slate-500">
                                    3. Sidebar Footer
                                </span>
                                <div className="px-4 py-3 rounded-xl bg-[#16223b] text-white space-y-0.5">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                                        <span className="truncate">{form.short_name || "Bulusan NHS"}</span>
                                        <span className="font-mono text-emerald-400 text-[10px] bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                                            ID: {form.school_id || "302196"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                                        <span>v2.4.0</span>
                                        <span className="truncate">{form.region || "DepEd Region V SDO"}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </PortalLayout>
    );
}
