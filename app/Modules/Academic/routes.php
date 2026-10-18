<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Academic\Controllers\AnnouncementController;
use App\Modules\Academic\Controllers\StudentAcademicController;
use App\Modules\Academic\Models\Announcement;
use App\Modules\Enrollment\Models\Enrollment;
use App\Modules\Enrollment\Enums\EnrollmentStatus;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// 🎓 STUDENT PORTAL ROUTES (Protected by auth, role:STUDENT, verified)
Route::middleware(['auth', 'role:STUDENT', 'verified'])->prefix('student')->name('student.')->group(function () {
    // 🏠 Main Academic Dashboard
    Route::get('/dashboard', [StudentAcademicController::class, 'dashboard'])->name('dashboard');

    // 📅 Class Schedule & Timetable
    Route::get('/classes', [StudentAcademicController::class, 'classes'])->name('classes');

    // 📊 DepEd SF9 / Form 137 Quarterly Grades
    Route::get('/grades', [StudentAcademicController::class, 'grades'])->name('grades');

    // 🎓 DepEd BEEF Online Admission Stepper
    Route::get('/admission', [\App\Modules\Enrollment\Controllers\AdmissionController::class, 'show'])->name('admission');

    // 👤 Student Profile & LRN
    Route::get('/profile', function () {
        $user = Auth::user();
        $enrollment = Enrollment::with(['section.adviser', 'gradeLevel'])
            ->where('student_id', $user->id)
            ->latest('id')
            ->first();

        return Inertia::render('Student/Profile', [
            'enrollment' => $enrollment,
        ]);
    })->name('profile');
    Route::post('/profile/avatar', [\App\Modules\Academic\Controllers\StudentProfileController::class, 'updateAvatar'])->name('profile.avatar');
});

// 👑 ADMIN DASHBOARD & ANNOUNCEMENTS (Cursor Pagination CRUD)
Route::middleware(['auth', 'role:ADMIN'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', function () {
        $recentAnnouncements = Announcement::latest()->take(3)->get();
        $activeYear = \App\Modules\Academic\Models\AcademicYear::where('is_active', true)->first();
        $totalRegistrars = \App\Modules\Identity\Models\User::where('role', \App\Modules\Identity\Enums\UserRole::REGISTRAR)->count();
        $totalEnrollments = \App\Modules\Enrollment\Models\Enrollment::where('academic_year_id', $activeYear?->id)->count();

        return Inertia::render('Admin/Dashboard', [
            'recentAnnouncements' => $recentAnnouncements,
            'totalAnnouncements'  => Announcement::count(),
            'activeYear'          => $activeYear,
            'totalRegistrars'     => $totalRegistrars,
            'totalEnrollments'    => $totalEnrollments,
        ]);
    })->name('dashboard');

    // 📢 School Announcements CRUD
    Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
    Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
    Route::post('/announcements/{announcement}', [AnnouncementController::class, 'update'])->name('announcements.update');
    Route::patch('/announcements/{announcement}/pin', [AnnouncementController::class, 'togglePin'])->name('announcements.pin');
    Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');

    // 📅 Academic Years / School Years CRUD & Enrollment/Grading Window Toggles
    Route::get('/academic-years', [\App\Modules\Academic\Controllers\AdminAcademicYearController::class, 'index'])->name('academic-years.index');
    Route::post('/academic-years', [\App\Modules\Academic\Controllers\AdminAcademicYearController::class, 'store'])->name('academic-years.store');
    Route::put('/academic-years/{academicYear}', [\App\Modules\Academic\Controllers\AdminAcademicYearController::class, 'update'])->name('academic-years.update');
    Route::patch('/academic-years/{academicYear}/active', [\App\Modules\Academic\Controllers\AdminAcademicYearController::class, 'toggleActive'])->name('academic-years.toggle-active');
    Route::patch('/academic-years/{academicYear}/enrollment', [\App\Modules\Academic\Controllers\AdminAcademicYearController::class, 'toggleEnrollment'])->name('academic-years.toggle-enrollment');
    Route::patch('/academic-years/{academicYear}/grading', [\App\Modules\Academic\Controllers\AdminAcademicYearController::class, 'toggleGrading'])->name('academic-years.toggle-grading');
    Route::delete('/academic-years/{academicYear}', [\App\Modules\Academic\Controllers\AdminAcademicYearController::class, 'destroy'])->name('academic-years.destroy');

    // School Branding, Name & Logo Settings (Global Cached)
    Route::get('/settings', [\App\Modules\Academic\Controllers\AdminSchoolSettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [\App\Modules\Academic\Controllers\AdminSchoolSettingController::class, 'update'])->name('settings.update');
});
