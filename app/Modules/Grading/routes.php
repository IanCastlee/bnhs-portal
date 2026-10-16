<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Grading\Controllers\TeacherGradingController;

// 👨‍🏫 TEACHER / ADVISER PORTAL ROUTES
Route::middleware(['auth', 'role:TEACHER'])->prefix('teacher')->name('teacher.')->group(function () {
    // 📊 Dashboard & Section Selector
    Route::get('/dashboard', [TeacherGradingController::class, 'dashboard'])->name('dashboard');

    // 📋 Section Class Roster (Cursor / Fast Paginated)
    Route::get('/sections/{section}/roster', [TeacherGradingController::class, 'sectionRoster'])->name('sections.roster');

    // 📝 DepEd DO 8 Grade Sheet (Section + Subject)
    Route::get('/sections/{section}/subjects/{subject}/grades', [TeacherGradingController::class, 'gradeSheet'])->name('grades.sheet');

    // 💾 Batch Save Grades (Draft)
    Route::post('/sections/{section}/subjects/{subject}/grades/save', [TeacherGradingController::class, 'saveGrades'])->name('grades.save');

    // 🚀 Submit Grades (Advance Workflow Status)
    Route::post('/sections/{section}/subjects/{subject}/grades/submit', [TeacherGradingController::class, 'submitGrades'])->name('grades.submit');
});
