import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import Button from "@/Components/Atoms/Button";
import AnnouncementFolderNav from "@/Components/Organisms/Admin/Announcements/AnnouncementFolderNav";
import AnnouncementSearchBar from "@/Components/Organisms/Admin/Announcements/AnnouncementSearchBar";
import AnnouncementTable from "@/Components/Organisms/Admin/Announcements/AnnouncementTable";
import CreateAnnouncementModal from "@/Components/Organisms/Admin/Announcements/CreateAnnouncementModal";
import EditAnnouncementModal from "@/Components/Organisms/Admin/Announcements/EditAnnouncementModal";
import { useOnlineStatus } from "@/Hooks/useOnlineStatus";
import { useToast } from "@/Context/ToastContext";
import { Megaphone, Plus } from "lucide-react";

export default function AnnouncementsIndex({ announcements, filters }) {
    const isOnline = useOnlineStatus();
    const { showToast } = useToast();

    const [search, setSearch] = useState(filters?.search || "");
    const [selectedTag, setSelectedTag] = useState(filters?.tag || "All");

    // Modal Visibility States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);

    // Filter & Search Handlers
    const handleSearchSubmit = (e) => {
        e?.preventDefault();
        router.get(
            "/admin/announcements",
            { search, tag: selectedTag },
            { preserveState: true }
        );
    };

    const handleTagChange = (tag) => {
        setSelectedTag(tag);
        router.get(
            "/admin/announcements",
            { search, tag },
            { preserveState: true }
        );
    };

    // Item Action Handlers
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

    return (
        <PortalLayout title="School Announcements Management">
            <Head title="Announcements CRUD - Admin Console" />

            <div className="space-y-6">
                {/* 1. Top Header Action Bar */}
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
                            setIsCreateOpen(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-bold shrink-0"
                    >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Create New Announcement
                    </Button>
                </div>

                {/* 2. Responsive 2-Column Layout (Vertical Folders on Left, Table on Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    {/* LEFT: Vertical Folder / Category Navigation Sidebar */}
                    <aside className="lg:col-span-1">
                        <AnnouncementFolderNav
                            selectedTag={selectedTag}
                            onTagChange={handleTagChange}
                            totalCount={announcements?.data?.length || 0}
                        />
                    </aside>

                    {/* RIGHT: Main Content Stream (Search + Table) */}
                    <main className="lg:col-span-3 space-y-4">
                        <AnnouncementSearchBar
                            search={search}
                            onSearchChange={setSearch}
                            onSearchSubmit={handleSearchSubmit}
                            selectedTag={selectedTag}
                            totalCount={announcements?.data?.length || 0}
                        />

                        <AnnouncementTable
                            announcements={announcements}
                            onTogglePin={handleTogglePin}
                            onEdit={(post) => setEditingPost(post)}
                            onDelete={handleDelete}
                        />
                    </main>
                </div>
            </div>

            {/* 3. Self-Contained Create Modal */}
            <CreateAnnouncementModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />

            {/* 4. Self-Contained Edit Modal */}
            <EditAnnouncementModal
                post={editingPost}
                isOpen={Boolean(editingPost)}
                onClose={() => setEditingPost(null)}
            />
        </PortalLayout>
    );
}
