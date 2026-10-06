<?php

namespace App\Modules\Academic\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Academic\Models\Announcement;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class AnnouncementController extends Controller
{
    /**
     * Display a listing of announcements for Admin using CURSOR PAGINATION (Prev & Next).
     */
    public function index(Request $request): Response
    {
        $query = Announcement::with('author:id,name,role');

        // Search Filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('caption', 'like', "%{$search}%");
            });
        }

        // Tag Filter
        if ($request->filled('tag') && $request->input('tag') !== 'All') {
            $query->where('tag', $request->input('tag'));
        }

        // ⚡ O(1) Speed Cursor Pagination for Admin (Prev & Next)
        $announcements = $query->orderByDesc('id')
            ->cursorPaginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => $announcements,
            'filters' => $request->only(['search', 'tag']),
        ]);
    }

    /**
     * Store a newly created announcement in storage (CREATE).
     */
    public function store(Request $request, CloudinaryService $cloudinary): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'caption' => ['required', 'string'],
            'tag' => ['required', 'string', 'in:General,Academics,Events,Urgent'],
            'image' => ['nullable', 'image', 'max:5120'], // Max 5MB
            'is_pinned' => ['boolean'],
        ]);

        $imageUrl = null;

        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $uploaded = $cloudinary->uploadFile($request->file('image')->getRealPath(), 'bnhs_announcements');
            $imageUrl = $uploaded['secure_url'];
        }

        Announcement::create([
            'author_id' => Auth::id(),
            'title' => $validated['title'],
            'caption' => $validated['caption'],
            'image_url' => $imageUrl,
            'tag' => $validated['tag'],
            'is_pinned' => $validated['is_pinned'] ?? false,
        ]);

        // ⚡ Invalidate Student Feed Cache
        Cache::forget('school_announcements_first_20');

        return back()->with('success', 'Announcement published successfully to student feed!');
    }

    /**
     * Update the specified announcement (UPDATE).
     */
    public function update(Request $request, Announcement $announcement, CloudinaryService $cloudinary): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'caption' => ['required', 'string'],
            'tag' => ['required', 'string', 'in:General,Academics,Events,Urgent'],
            'image' => ['nullable', 'image', 'max:5120'],
            'is_pinned' => ['boolean'],
        ]);

        $imageUrl = $announcement->image_url;

        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $uploaded = $cloudinary->uploadFile($request->file('image')->getRealPath(), 'bnhs_announcements');
            $imageUrl = $uploaded['secure_url'];
        }

        $announcement->update([
            'title' => $validated['title'],
            'caption' => $validated['caption'],
            'image_url' => $imageUrl,
            'tag' => $validated['tag'],
            'is_pinned' => $validated['is_pinned'] ?? $announcement->is_pinned,
        ]);

        Cache::forget('school_announcements_first_20');

        return back()->with('success', 'Announcement updated successfully!');
    }

    /**
     * Toggle Pin/Unpin status.
     */
    public function togglePin(Announcement $announcement): RedirectResponse
    {
        $announcement->update([
            'is_pinned' => ! $announcement->is_pinned,
        ]);

        Cache::forget('school_announcements_first_20');

        $status = $announcement->is_pinned ? 'pinned to top of feed' : 'unpinned';
        return back()->with('success', "Announcement {$status}!");
    }

    /**
     * Remove the specified announcement from storage (DELETE).
     */
    public function destroy(Announcement $announcement): RedirectResponse
    {
        $announcement->delete();
        Cache::forget('school_announcements_first_20');

        return back()->with('success', 'Announcement deleted successfully.');
    }
}
