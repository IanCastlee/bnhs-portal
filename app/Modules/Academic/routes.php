<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Modules\Academic\Controllers\AnnouncementController;
use App\Modules\Academic\Models\Announcement;

// 🎓 STUDENT FEED (Cached First 20 Posts)
Route::middleware(['auth', 'role:STUDENT'])->prefix('student')->name('student.')->group(function () {
    Route::get('/dashboard', function (Request $request) {
        $announcements = Cache::remember('school_announcements_first_20', 600, function () {
            return Announcement::with('author:id,name,role')
                ->orderByDesc('is_pinned')
                ->orderByDesc('id')
                ->take(20)
                ->get()
                ->toArray();
        });

        return Inertia::render('Student/Dashboard', [
            'announcements' => $announcements,
        ]);
    })->name('dashboard');
});

// 👑 ADMIN DASHBOARD & ANNOUNCEMENTS (Cursor Pagination CRUD)
Route::middleware(['auth', 'role:ADMIN'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', function () {
        $recentAnnouncements = Announcement::latest()->take(3)->get();
        return Inertia::render('Admin/Dashboard', [
            'recentAnnouncements' => $recentAnnouncements,
            'totalAnnouncements' => Announcement::count(),
        ]);
    })->name('dashboard');

    // 📢 School Announcements CRUD
    Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
    Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
    Route::post('/announcements/{announcement}', [AnnouncementController::class, 'update'])->name('announcements.update');
    Route::patch('/announcements/{announcement}/pin', [AnnouncementController::class, 'togglePin'])->name('announcements.pin');
    Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');
});
