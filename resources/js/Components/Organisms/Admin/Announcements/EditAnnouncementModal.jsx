import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import Button from "@/Components/Atoms/Button";
import FormField from "@/Components/Molecules/FormField";
import { useOnlineStatus } from "@/Hooks/useOnlineStatus";
import { useToast } from "@/Context/ToastContext";
import { compressImage } from "@/Utils/compressImage";
import {
    Edit3,
    X,
    WifiOff,
    Loader2,
} from "lucide-react";

export default function EditAnnouncementModal({ post, isOpen, onClose }) {
    const isOnline = useOnlineStatus();
    const { showToast } = useToast();

    const [imagePreview, setImagePreview] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);

    const { data, setData, post: submitPost, processing, errors, reset } = useForm({
        title: "",
        caption: "",
        tag: "General",
        image: null,
        is_pinned: false,
    });

    // Sync form data when post prop changes
    useEffect(() => {
        if (post && isOpen) {
            setData({
                title: post.title || "",
                caption: post.caption || "",
                tag: post.tag || "General",
                image: null,
                is_pinned: Boolean(post.is_pinned),
            });
            setImagePreview(post.image_url || null);
        }
    }, [post, isOpen]);

    if (!isOpen || !post) return null;

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
            showToast("Hindi mai-save ang pagbabago. Walang internet connection!", "error");
            return;
        }

        submitPost(`/admin/announcements/${post.id}`, {
            forceFormData: true,
            onSuccess: () => {
                handleClose();
                showToast("Na-update nang matagumpay ang announcement!", "success");
            },
            onError: () => {
                showToast("May error sa pag-update. Pakisuri ang form at internet connection.", "error");
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-indigo-600" />
                        Edit Announcement
                    </h3>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Offline Alert */}
                {!isOnline && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs font-bold">
                        <WifiOff className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>Offline ka ngayon. Ikonekta muna ang iyong internet bago mag-save.</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField
                        label="Announcement Title"
                        id="edit-title"
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
                            className="w-full rounded-lg border border-slate-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
                            value={data.caption}
                            onChange={(e) => setData("caption", e.target.value)}
                            className="w-full rounded-lg border border-slate-300 text-sm p-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            required
                        />
                        {errors.caption && (
                            <p className="text-xs text-rose-600 mt-1">{errors.caption}</p>
                        )}
                    </div>

                    {/* Image Upload Box */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Change or Update Photo (Auto-Optimized & Compressed)
                        </label>
                        <div className="mt-1 flex justify-center px-4 pt-4 pb-4 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50">
                            <div className="space-y-2 text-center w-full">
                                {isCompressing ? (
                                    <div className="py-4 flex flex-col items-center justify-center text-xs text-indigo-700 font-bold gap-2">
                                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                                        <span>Optimizing photo size...</span>
                                    </div>
                                ) : imagePreview ? (
                                    <div className="relative inline-block">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-36 w-full max-w-sm mx-auto object-cover rounded-lg shadow-xs"
                                        />
                                    </div>
                                ) : null}

                                <div className="flex text-xs text-slate-600 justify-center">
                                    <label
                                        htmlFor="edit-file-upload"
                                        className="relative cursor-pointer bg-white rounded-md font-bold text-indigo-600 hover:text-indigo-500 px-2.5 py-1 border border-slate-200 shadow-2xs"
                                    >
                                        <span>{imagePreview ? "Change photo" : "Choose new photo"}</span>
                                        <input
                                            id="edit-file-upload"
                                            type="file"
                                            accept="image/*"
                                            className="sr-only"
                                            onChange={(e) => handleFileSelect(e.target.files[0])}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pin Checkbox */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="edit-pin"
                            checked={data.is_pinned}
                            onChange={(e) => setData("is_pinned", e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="edit-pin" className="text-xs font-semibold text-slate-700 cursor-pointer">
                            Pin this announcement to the top
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
                            >
                                {processing ? "Saving Changes..." : "Save Changes"}
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
    );
}
