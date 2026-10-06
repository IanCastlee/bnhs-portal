<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 👨‍🏫 TEACHER / ADVISER PORTAL
Route::middleware(['auth', 'role:TEACHER'])->prefix('teacher')->name('teacher.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Teacher/Dashboard');
    })->name('dashboard');
});
