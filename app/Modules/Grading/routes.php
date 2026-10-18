<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Grading\Controllers\TeacherGradingController;
use App\Modules\Grading\Controllers\RegistrarGradingController;

// 👨‍🏫 TEACHER / ADVISER PORTAL ROUTES
Route::middleware(['auth', 'role:TEACHER'])->prefix('teacher')->name('teacher.')->group(function () {
    // 📊 Dashboard & Section Selector
    Route::get('/dashboard', [TeacherGradingController::class, 'dashboard'])->name('dashboard');
    Route::get('/grades', [TeacherGradingController::class, 'dashboard'])->name('grades.index');

    // 📋 Class Adviser Grade Consolidation & Review
    Route::get('/advisory', [TeacherGradingController::class, 'advisoryIndex'])->name('advisory.index');
    Route::post('/advisory/{section}/forward-registrar', [TeacherGradingController::class, 'forwardSectionToRegistrar'])->name('advisory.forward');

    // 📋 Section Class Roster (Cursor / Fast Paginated)
    Route::get('/sections/{section}/roster', [TeacherGradingController::class, 'sectionRoster'])->name('sections.roster');

    // 📝 DepEd DO 8 Grade Sheet (Section + Subject)
    Route::get('/sections/{section}/subjects/{subject}/grades', [TeacherGradingController::class, 'gradeSheet'])->name('grades.sheet');

    // 📥 Parse Excel (.xlsx / .csv) into Grade Sheet Numbers
    Route::post('/sections/{section}/subjects/{subject}/grades/parse-excel', [TeacherGradingController::class, 'parseExcelGrades'])->name('grades.parse_excel');

    // 💾 Batch Save Grades (Draft)
    Route::post('/sections/{section}/subjects/{subject}/grades/save', [TeacherGradingController::class, 'saveGrades'])->name('grades.save');

    // 🚀 Submit Grades (Advance Workflow Status: Teacher -> Adviser -> Registrar)
    Route::post('/sections/{section}/subjects/{subject}/grades/submit', [TeacherGradingController::class, 'submitGrades'])->name('grades.submit');
});

// 🏛️ REGISTRAR GRADE APPROVAL & SF10/SF9 PUBLICATION ROUTES
Route::middleware(['auth', 'role:REGISTRAR,ADMIN'])->prefix('registrar')->name('registrar.')->group(function () {
    Route::get('/grades', [RegistrarGradingController::class, 'index'])->name('grades.index');
    Route::post('/grades/{section}/{subject}/status', [RegistrarGradingController::class, 'updateStatus'])->name('grades.status');
    Route::post('/grades/section/{section}/publish-all', [RegistrarGradingController::class, 'publishSection'])->name('grades.publish_section');
});

