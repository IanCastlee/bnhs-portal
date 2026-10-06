<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 📋 REGISTRAR PORTAL
Route::middleware(['auth', 'role:REGISTRAR'])->prefix('registrar')->name('registrar.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Registrar/Dashboard');
    })->name('dashboard');
});
