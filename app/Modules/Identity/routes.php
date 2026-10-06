<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Modules\Identity\Controllers\AuthController;

// 🚪 Smart Root Redirect
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

// 🔒 Authentication Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
});

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');
