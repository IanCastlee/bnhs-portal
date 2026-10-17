<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Modules\Identity\Controllers\AuthController;
use App\Modules\Identity\Controllers\EmailVerificationController;
use App\Modules\Identity\Controllers\PasswordResetController;

//  Smart Root Redirect
Route::get('/', function () {
    if (Auth::check()) {
        $role = Auth::user()->role->value ?? (string) Auth::user()->role;

        return match ($role) {
            'ADMIN' => redirect()->route('admin.dashboard'),
            'REGISTRAR' => redirect()->route('registrar.dashboard'),
            'TEACHER' => redirect()->route('teacher.dashboard'),
            'STUDENT' => redirect()->route('student.dashboard'),
            default => redirect()->route('login'),
        };
    }

    return redirect()->route('login');
});

//  Authentication Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
    
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:register');

    //  FORGOT PASSWORD REQUEST
    Route::get('/forgot-password', [PasswordResetController::class, 'showForgotPassword'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink'])->middleware('throttle:6,1')->name('password.email');
});

//  RESET PASSWORD (Accessible with valid reset link/token even if a session is present)
Route::get('/reset-password/{token}', [PasswordResetController::class, 'showResetPassword'])->name('password.reset');
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])->middleware('throttle:6,1')->name('password.update');

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

// EMAIL VERIFICATION ROUTES (Dual OTP + Signed Magic Link)
Route::middleware('auth')->group(function () {
    Route::get('/verify-email', [EmailVerificationController::class, 'show'])->name('verification.notice');
    Route::post('/verify-email/otp', [EmailVerificationController::class, 'verifyOtp'])->middleware('throttle:10,1')->name('verification.otp');
    Route::get('/verify-email/{id}/{hash}', [EmailVerificationController::class, 'verifyLink'])->middleware(['signed', 'throttle:10,1'])->name('verification.verify');
    Route::post('/verify-email/resend', [EmailVerificationController::class, 'resend'])->middleware('throttle:6,1')->name('verification.resend');

    //  IN-APP NOTIFICATIONS & CURSOR PAGINATED FEED
    Route::get('/notifications/feed', function (\Illuminate\Http\Request $request) {
        $notifications = Auth::user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->cursorPaginate(10);

        return response()->json($notifications);
    })->name('notifications.feed');

    Route::post('/notifications/mark-as-read', function () {
        Auth::user()->unreadNotifications->markAsRead();
        return back();
    })->name('notifications.mark-as-read');
});

// ADMIN STAFF & USER MANAGEMENT
Route::middleware(['auth', 'role:ADMIN'])->prefix('admin')->name('admin.')->group(function () {
    // Registrar Officers Management
    Route::get('/registrars', [\App\Modules\Identity\Controllers\AdminRegistrarController::class, 'index'])->name('registrars.index');
    Route::post('/registrars', [\App\Modules\Identity\Controllers\AdminRegistrarController::class, 'store'])->name('registrars.store');
    Route::put('/registrars/{user}', [\App\Modules\Identity\Controllers\AdminRegistrarController::class, 'update'])->name('registrars.update');
    Route::patch('/registrars/{user}/toggle-active', [\App\Modules\Identity\Controllers\AdminRegistrarController::class, 'toggleActive'])->name('registrars.toggle-active');
    Route::patch('/registrars/{user}/reset-password', [\App\Modules\Identity\Controllers\AdminRegistrarController::class, 'resetPassword'])->name('registrars.reset-password');
    Route::delete('/registrars/{user}', [\App\Modules\Identity\Controllers\AdminRegistrarController::class, 'destroy'])->name('registrars.destroy');

    // Faculty Teachers Management
    Route::get('/teachers', [\App\Modules\Identity\Controllers\AdminTeacherController::class, 'index'])->name('teachers.index');
    Route::post('/teachers', [\App\Modules\Identity\Controllers\AdminTeacherController::class, 'store'])->name('teachers.store');
    Route::put('/teachers/{user}', [\App\Modules\Identity\Controllers\AdminTeacherController::class, 'update'])->name('teachers.update');
    Route::patch('/teachers/{user}/toggle-active', [\App\Modules\Identity\Controllers\AdminTeacherController::class, 'toggleActive'])->name('teachers.toggle-active');
    Route::patch('/teachers/{user}/reset-password', [\App\Modules\Identity\Controllers\AdminTeacherController::class, 'resetPassword'])->name('teachers.reset-password');
    Route::delete('/teachers/{user}', [\App\Modules\Identity\Controllers\AdminTeacherController::class, 'destroy'])->name('teachers.destroy');

    // System & Activity Audit Logs
    Route::get('/audit-logs', [\App\Modules\Identity\Controllers\AdminAuditLogController::class, 'index'])->name('audit-logs.index');

    // Queue & Background Jobs Monitor
    Route::get('/queue-jobs', [\App\Modules\Identity\Controllers\AdminQueueMonitorController::class, 'index'])->name('queue-jobs.index');
    Route::post('/queue-jobs/retry-all', [\App\Modules\Identity\Controllers\AdminQueueMonitorController::class, 'retryAll'])->name('queue-jobs.retry-all');
    Route::post('/queue-jobs/{id}/retry', [\App\Modules\Identity\Controllers\AdminQueueMonitorController::class, 'retry'])->name('queue-jobs.retry');
    Route::delete('/queue-jobs/flush-all', [\App\Modules\Identity\Controllers\AdminQueueMonitorController::class, 'flush'])->name('queue-jobs.flush');
    Route::delete('/queue-jobs/{id}', [\App\Modules\Identity\Controllers\AdminQueueMonitorController::class, 'destroy'])->name('queue-jobs.destroy');
    Route::delete('/queue-jobs/pending/{id}', [\App\Modules\Identity\Controllers\AdminQueueMonitorController::class, 'deletePending'])->name('queue-jobs.delete-pending');
});
