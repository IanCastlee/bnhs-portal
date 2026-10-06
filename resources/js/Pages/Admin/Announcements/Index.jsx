import React, { useState } from "react";
import { Head, useForm, router, Link } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Card from "@/Components/Atoms/Card";
import Button from "@/Components/Atoms/Button";
import FormField from "@/Components/Molecules/FormField";
import Badge from "@/Components/Atoms/Badge";
import { useOnlineStatus } from "@/Hooks/useOnlineStatus";
import { useToast } from "@/Context/ToastContext";
import {
    Megaphone,
    Plus,
    Search,
    Edit3,
    Trash2,
    Pin,
    UploadCloud,
    X,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
    WifiOff,
} from "lucide-react";

export default function AnnouncementsIndex({ announcements, filters }) {
    const isOnline = useOnlineStatus();
    const { showToast } = useToast();

    const [search, setSearch] = useState(filters?.search || "");
    const [selectedTag, setSelectedTag] = useState(filters?.tag || "All");
    
    // Modal States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Form Hook for Create
    const createForm = useForm({
        title: "",
        caption: "",
        tag: "General",
        image: null,
        is_pinned: false,
    });

    // Form Hook for Edit
    const editForm = useForm({
        title: "",
        caption: "",
        tag: "General",
        image: null,
        is_pinned: false,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get("/admin/announcements", { search, tag: selectedTag }, { preserveState: true });
    };

    const handleTagChange = (tag) => {
        setSelectedTag(tag);
        router.get("/admin/announcements", { search, tag }, { preserveState: true });
    };

    // 🛑 Offline-Guarded Create Submission
    const submitCreate = (e) => {
        e.preventDefault();

        if (!isOnline) {
            showToast("Hindi maipapadala ang announcement. Walang internet connection!", "error");
            return;
        }

        createForm.post("/admin/announcements", {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
                setImagePreview(null);
                showToast("Nai-post nang matagumpay ang announcement!", "success");
            },
            onError: () => {
                showToast("May error sa pag-upload. Pakisuri ang form at internet connection.", "error");
            },
        });
    };

    const openEditModal = (post) => {
        setEditingPost(post);
        editForm.setData({
            title: post.title,
            caption: post.caption,
            tag: post.tag,
            image: null,
            is_pinned: post.is_pinned,
        });
        setImagePreview(post.image_url);
    };

    // 🛑 Offline-Guarded Edit Submission
    const submitEdit = (e) => {
        e.preventDefault();

        if (!isOnline) {
            showToast("Hindi mai-save ang pagbabago. Walang internet connection!", "error");
            return;
        }

        editForm.post(`/admin/announcements/${editingPost.id}`, {
            forceFormData: true,
            onSuccess: () => {
                setEditingPost(null);
                editForm.reset();
                setImagePreview(null);
                showToast("Na-update nang matagumpay ang announcement!", "success");
            },
            onError: () => {
                showToast("May error sa pag-update. Pakisuri ang form at internet connection.", "error");
            },
        });
    };

    const handleTogglePin = (id) => {
        if (!isOnline) {
            showToast("Walang internet connection.", "error");
            return;
        }
        router.patch(`/admin/announcements/${id}/pin`, {}, { preserveScroll: true });
    };

    const handleDelete = (id) => {
        if (!isOnline) {
            showToast("Walang internet connection.", "error");
            return;
        }
        if (confirm("Are you sure you want to delete this announcement?")) {
            router.delete(`/admin/announcements/${id}`, { preserveScroll: true });
        }
    };

    const tags = ["All", "General", "Academics", "Events", "Urgent"];

    return (
        <PortalLayout title="School Announcements Management">
            <Head title="Announcements CRUD - Admin Console" />

            <div className="space-y-6">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Megaphone className="w-5 h-5 text-emerald-600" />
                            School Feed Announcements
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Manage live photo feeds with ultra-fast Cursor Pagination & WebP Cloudinary Storage.
                        </p>
                    </div>

                    <Button
                        variant="primary"
                        onClick={() => {
                            if (!isOnline) {
                                showToast("Walang internet connection. Hindi makakapag-post.", "error");
                                return;
                            }
                            createForm.reset();
                            setImagePreview(null);
                            setIsCreateOpen(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-bold shrink-0"
                    >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Create New Announcement
                    </Button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
                        {tags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => handleTagChange(tag)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                    selectedTag === tag
                                        ? "bg-emerald-600 text-white shadow-xs"
                                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSearch} className="w-full md:w-72 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                placeholder="Search announcements..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                            />
                        </div>
                        <Button type="submit" variant="secondary" size="sm">Search</Button>
                    </form>
                </div>

                {/* Announcements Table / List */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    {announcements.data.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <Megaphone className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                            <h3 className="text-sm font-bold text-slate-700">No Announcements Found</h3>
                            <p className="text-xs text-slate-500 mt-1">Try changing your search query or create a new announcement.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {announcements.data.map((post) => (
                                <div key={post.id} className="p-5 flex flex-col md:flex-row gap-5 items-start justify-between hover:bg-slate-50/70 transition">
                                    <div className="w-full md:w-44 h-28 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative border border-slate-200">
                                        {post.image_url ? (
                                            <img
                                                src={post.image_url}
                                                alt={post.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                                                <ImageIcon className="w-6 h-6 text-slate-300" />
                                                <span>No Photo</span>
                                            </div>
                                        )}
                                        {post.is_pinned && (
                                            <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                                                <Pin className="w-3 h-3 fill-slate-950" /> PINNED
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                                {post.tag}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900 leading-snug">{post.title}</h3>
                                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{post.caption}</p>
                                        <p className="text-[11px] text-slate-400 pt-1">
                                            Author: <strong className="text-slate-700">{post.author?.name || "Administrator"}</strong>
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                                        <button
                                            onClick={() => handleTogglePin(post.id)}
                                            className={`p-2 rounded-xl border transition cursor-pointer ${
                                                post.is_pinned
                                                    ? "bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100"
                                                    : "bg-white border-slate-200 text-slate-400 hover:text-amber-600 hover:bg-slate-50"
                                            }`}
                                            title={post.is_pinned ? "Unpin Announcement" : "Pin to Top"}
                                        >
                                            <Pin className={`w-4 h-4 ${post.is_pinned ? "fill-amber-500" : ""}`} />
                                        </button>

                                        <button
                                            onClick={() => openEditModal(post)}
                                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition cursor-pointer"
                                            title="Edit Announcement"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition cursor-pointer"
                                            title="Delete Announcement"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CURSOR PAGINATION NAVIGATION */}
                    <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                        <div>
                            {announcements.prev_page_url ? (
                                <Link
                                    href={announcements.prev_page_url}
                                    preserveScroll
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous Page
                                </Link>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-400 cursor-not-allowed">
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous Page
                                </span>
                            )}
                        </div>

                        <span className="text-xs text-slate-400 font-mono">
                            Cursor-Indexed Page
                        </span>

                        <div>
                            {announcements.next_page_url ? (
                                <Link
                                    href={announcements.next_page_url}
                                    preserveScroll
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                                >
                                    Next Page
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-400 cursor-not-allowed">
                                    Next Page
                                    <ChevronRight className="w-4 h-4" />
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CREATE MODAL */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Megaphone className="w-5 h-5 text-red-600" />
                                Publish New School Announcement
                            </h3>
                            <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Offline Alert Inside Modal */}
                        {!isOnline && (
                            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs font-bold">
                                <WifiOff className="w-4 h-4 text-rose-500 shrink-0" />
                                <span>Offline ka ngayon. Ikonekta muna ang iyong internet bago mag-publish.</span>
                            </div>
                        )}

                        <form onSubmit={submitCreate} className="space-y-4">
                            <FormField
                                label="Announcement Title"
                                id="create-title"
                                placeholder="e.g. S.Y. 2026-2027 Intramurals Opening"
                                value={createForm.data.title}
                                onChange={(e) => createForm.setData("title", e.target.value)}
                                error={createForm.errors.title}
                                required
                            />

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Category Tag <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={createForm.data.tag}
                                    onChange={(e) => createForm.setData("tag", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 text-sm px-3 py-2 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
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
                                    value={createForm.data.caption}
                                    onChange={(e) => createForm.setData("caption", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 text-sm p-3 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                    required
                                />
                                {createForm.errors.caption && <p className="text-xs text-rose-600 mt-1">{createForm.errors.caption}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Attachment Photo (Auto-Converted to WebP & Compressed)
                                </label>
                                <div className="mt-1 flex justify-center px-4 pt-4 pb-4 border-2 border-slate-300 border-dashed rounded-xl hover:border-red-400 transition bg-slate-50">
                                    <div className="space-y-2 text-center">
                                        {imagePreview ? (
                                            <div className="relative inline-block">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="h-32 w-full object-cover rounded-lg shadow-xs"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImagePreview(null);
                                                        createForm.setData("image", null);
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
                                                        className="relative cursor-pointer bg-white rounded-md font-bold text-red-600 hover:text-red-500 px-2 py-1 border border-slate-200"
                                                    >
                                                        <span>Upload a photo</span>
                                                        <input
                                                            id="create-file-upload"
                                                            type="file"
                                                            accept="image/*"
                                                            className="sr-only"
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    createForm.setData("image", file);
                                                                    setImagePreview(URL.createObjectURL(file));
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                                <p className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 5MB</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {createForm.errors.image && <p className="text-xs text-rose-600 mt-1">{createForm.errors.image}</p>}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="create-pin"
                                    checked={createForm.data.is_pinned}
                                    onChange={(e) => createForm.setData("is_pinned", e.target.checked)}
                                    className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                                />
                                <label htmlFor="create-pin" className="text-xs font-semibold text-slate-700 cursor-pointer">
                                    Pin this announcement to the top of Student Feed
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </Button>
                                
                                {isOnline ? (
                                    <Button type="submit" variant="danger" loading={createForm.processing}>
                                        Publish Announcement
                                    </Button>
                                ) : (
                                    <Button type="button" variant="secondary" disabled className="bg-slate-200 text-slate-400 cursor-not-allowed">
                                        <WifiOff className="w-4 h-4 mr-1.5 text-rose-400" />
                                        Offline (No Connection)
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {editingPost && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Edit3 className="w-5 h-5 text-indigo-600" />
                                Edit Announcement
                            </h3>
                            <button onClick={() => setEditingPost(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {!isOnline && (
                            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs font-bold">
                                <WifiOff className="w-4 h-4 text-rose-500 shrink-0" />
                                <span>Offline ka ngayon. Ikonekta muna ang iyong internet bago mag-save.</span>
                            </div>
                        )}

                        <form onSubmit={submitEdit} className="space-y-4">
                            <FormField
                                label="Announcement Title"
                                id="edit-title"
                                value={editForm.data.title}
                                onChange={(e) => editForm.setData("title", e.target.value)}
                                error={editForm.errors.title}
                                required
                            />

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Category Tag <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={editForm.data.tag}
                                    onChange={(e) => editForm.setData("tag", e.target.value)}
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
                                    value={editForm.data.caption}
                                    onChange={(e) => editForm.setData("caption", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 text-sm p-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    required
                                />
                                {editForm.errors.caption && <p className="text-xs text-rose-600 mt-1">{editForm.errors.caption}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Change or Update Photo
                                </label>
                                <div className="mt-1 flex justify-center px-4 pt-4 pb-4 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50">
                                    <div className="space-y-2 text-center">
                                        {imagePreview ? (
                                            <div className="relative inline-block">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="h-32 w-full object-cover rounded-lg shadow-xs"
                                                />
                                            </div>
                                        ) : null}
                                        <div className="flex text-xs text-slate-600 justify-center">
                                            <label
                                                htmlFor="edit-file-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-bold text-indigo-600 hover:text-indigo-500 px-2 py-1 border border-slate-200"
                                            >
                                                <span>Choose new photo</span>
                                                <input
                                                    id="edit-file-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="sr-only"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            editForm.setData("image", file);
                                                            setImagePreview(URL.createObjectURL(file));
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="edit-pin"
                                    checked={editForm.data.is_pinned}
                                    onChange={(e) => editForm.setData("is_pinned", e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="edit-pin" className="text-xs font-semibold text-slate-700 cursor-pointer">
                                    Pin this announcement to the top
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <Button type="button" variant="secondary" onClick={() => setEditingPost(null)}>
                                    Cancel
                                </Button>
                                {isOnline ? (
                                    <Button type="submit" variant="primary" loading={editForm.processing}>
                                        Save Changes
                                    </Button>
                                ) : (
                                    <Button type="button" variant="secondary" disabled className="bg-slate-200 text-slate-400 cursor-not-allowed">
                                        <WifiOff className="w-4 h-4 mr-1.5 text-rose-400" />
                                        Offline (No Connection)
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PortalLayout>
    );
}
