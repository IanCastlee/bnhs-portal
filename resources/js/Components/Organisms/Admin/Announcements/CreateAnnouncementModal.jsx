import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import Button from "@/Components/Atoms/Button";
import FormField from "@/Components/Molecules/FormField";
import { useOnlineStatus } from "@/Hooks/useOnlineStatus";
import { useToast } from "@/Context/ToastContext";
import { compressImage } from "@/Utils/compressImage";
import {
    Megaphone,
    UploadCloud,
    X,
    WifiOff,
    Loader2,
} from "lucide-react";

export default function CreateAnnouncementModal({ isOpen, onClose }) {
    const isOnline = useOnlineStatus();
    const { showToast } = useToast();

    const [imagePreview, setImagePreview] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        caption: "",
        tag: "General",
        image: null,
        is_pinned: false,
    });

    if (!isOpen) return null;

    const handleFileSelect = async (file) => {
        if (!file) return;

        setIsCompressing(true);
        try {
            const compressed = await compressImage(file, { maxWidth: 1600, quality: 0.85 });
            setData("image", compressed);
            setImagePreview(URL.createObjectURL(compressed));
        } catch (err) {
            setData("image", file);
            setImagePreview(URL.createObjectURL(file));
        } finally {
            setIsCompressing(false);
        }
    };

    const handleClose = () => {
        reset();
        setImagePreview(null);
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isOnline) {
            showToast("Hindi maipapadala ang announcement. Walang internet connection!", "error");
            return;
        }

        post("/admin/announcements", {
            forceFormData: true,
            onSuccess: () => {
                handleClose();
                showToast("Nai-post nang matagumpay ang announcement!", "success");
            },
            onError: () => {
                showToast("May error sa pag-upload. Pakisuri ang form at internet connection.", "error");
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden">
                {/* Modal Header */}
                <div className="shrink-0 p-5 bg-gradient-to-r from-[#07241c] via-[#0f4c3a] to-[#0d5c43] text-white flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
                            <Megaphone className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white leading-tight">
                                Publish New School Announcement
                            </h3>
                            <p className="text-xs text-emerald-100/80 mt-0.5">Broadcast updates to faculty, staff, and students</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {/* Offline Alert */}
                    {!isOnline && (
                        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs font-bold">
                            <WifiOff className="w-4 h-4 text-rose-500 shrink-0" />
                            <span>Offline ka ngayon. Ikonekta muna ang iyong internet bago mag-publish.</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField
                        label="Announcement Title"
                        id="create-title"
                        placeholder="e.g. S.Y. 2026-2027 Intramurals Opening"
                        value={data.title}
                        onChange={(e) => setData("title", e.target.value)}
                        error={errors.title}
                        required
                    />

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Category Tag <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={data.tag}
                            onChange={(e) => setData("tag", e.target.value)}
                            className="w-full rounded-lg border border-slate-300 text-sm px-3 py-2 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        >
                            <option value="General">General Announcement</option>
                            <option value="Academics">Academics & Exams</option>
                            <option value="Events">School Events & Sports</option>
                            <option value="Urgent">Urgent / Holiday Notice</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Caption / Announcement Details <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            rows="4"
                            placeholder="Write full details for students and parents..."
                            value={data.caption}
                            onChange={(e) => setData("caption", e.target.value)}
                            className="w-full rounded-lg border border-slate-300 text-sm p-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            required
                        />
                        {errors.caption && (
                            <p className="text-xs text-rose-600 mt-1">{errors.caption}</p>
                        )}
                    </div>

                    {/* Image Upload Box */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Attachment Photo (Auto-Optimized & Compressed)
                        </label>
                        <div className="mt-1 flex justify-center px-4 pt-4 pb-4 border-2 border-slate-300 border-dashed rounded-xl hover:border-emerald-400 transition bg-slate-50">
                            <div className="space-y-2 text-center w-full">
                                {isCompressing ? (
                                    <div className="py-4 flex flex-col items-center justify-center text-xs text-emerald-700 font-bold gap-2">
                                        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                                        <span>Optimizing photo size...</span>
                                    </div>
                                ) : imagePreview ? (
                                    <div className="relative inline-block">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-36 w-full max-w-sm mx-auto object-cover rounded-lg shadow-xs"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImagePreview(null);
                                                setData("image", null);
                                            }}
                                            className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 text-xs cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <UploadCloud className="mx-auto h-8 w-8 text-slate-400" />
                                        <div className="flex text-xs text-slate-600 justify-center">
                                            <label
                                                htmlFor="create-file-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-bold text-emerald-600 hover:text-emerald-500 px-2.5 py-1 border border-slate-200 shadow-2xs"
                                            >
                                                <span>Upload a photo</span>
                                                <input
                                                    id="create-file-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="sr-only"
                                                    onChange={(e) => handleFileSelect(e.target.files[0])}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-[10px] text-slate-400">
                                            PNG, JPG, WEBP up to 10MB (Instant Auto-Compress)
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                        {errors.image && (
                            <p className="text-xs text-rose-600 mt-1">{errors.image}</p>
                        )}
                    </div>

                    {/* Pin Checkbox */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="create-pin"
                            checked={data.is_pinned}
                            onChange={(e) => setData("is_pinned", e.target.checked)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <label htmlFor="create-pin" className="text-xs font-semibold text-slate-700 cursor-pointer">
                            Pin this announcement to the top of Student Feed
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                        <Button type="button" variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        
                        {isOnline ? (
                            <Button
                                type="submit"
                                variant="primary"
                                loading={processing || isCompressing}
                                disabled={isCompressing}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            >
                                {processing ? "Publishing to Feed..." : "Publish Announcement"}
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                variant="secondary"
                                disabled
                                className="bg-slate-200 text-slate-400 cursor-not-allowed"
                            >
                                <WifiOff className="w-4 h-4 mr-1.5 text-rose-400" />
                                Offline (No Connection)
                            </Button>
                        )}
                    </div>
                </form>
                </div>
            </div>
        </div>
    );
}
