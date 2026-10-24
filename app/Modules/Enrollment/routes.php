<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Modules\Enrollment\Controllers\AdmissionController;
use App\Modules\Enrollment\Controllers\RegistrarEnrollmentController;
use App\Modules\Enrollment\Controllers\RegistrarSectioningController;
use App\Modules\Enrollment\Controllers\SectionAdviserController;
use App\Modules\Enrollment\Controllers\SectionDistributionController;
use App\Modules\Enrollment\Controllers\SectionSubjectController;

// STUDENT ADMISSION & BEEF ACTIONS (Protected by auth, role:STUDENT, verified, throttle:admission)
Route::middleware(['auth', 'role:STUDENT', 'verified', 'throttle:admission'])->prefix('student/admission')->name('student.admission.')->group(function () {
    Route::post('/household', [AdmissionController::class, 'updateHousehold'])->name('household');
    Route::post('/re-enroll', [AdmissionController::class, 'confirmReEnroll'])->name('re_enroll');
});

//  REGISTRAR & ADMIN PORTAL ACCESS
// 1. Para saan ang prefix('registrar')?

// Ang prefix ay naglalagay ng salita sa unahan ng URL sa browser para sa lahat ng routes na nasa loob ng grupo.

// Kung WALANG prefix, kailangan mong ulit-ulitin ang /registrar sa bawat linya:
Route::middleware(['auth', 'role:REGISTRAR,ADMIN'])->prefix('registrar')->name('registrar.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Registrar/Dashboard');
    })->name('dashboard');

    //  Admission Review
    Route::get('/enrollments', [RegistrarEnrollmentController::class, 'index'])->name('enrollments.index');
    Route::post('/enrollments/{enrollment}/approve', [RegistrarEnrollmentController::class, 'approve'])->name('enrollments.approve');
    Route::post('/enrollments/{enrollment}/reject', [RegistrarEnrollmentController::class, 'reject'])->name('enrollments.reject');

    //  Class Sectioning
    Route::get('/sectioning', [RegistrarSectioningController::class, 'index'])->name('sectioning.index');
    Route::post('/sectioning/create-section', [RegistrarSectioningController::class, 'createSection'])->name('sectioning.create');
    Route::put('/sectioning/{section}', [RegistrarSectioningController::class, 'updateSection'])->name('sectioning.update');
    Route::delete('/sectioning/{section}', [RegistrarSectioningController::class, 'deleteSection'])->name('sectioning.delete');

    // Section Adviser Assignment
    Route::patch('/sectioning/{section}/assign-adviser', [SectionAdviserController::class, 'assignAdviser'])->name('sectioning.assign_adviser');

    // Student Distribution & Balancing
    Route::post('/sectioning/auto-distribute', [SectionDistributionController::class, 'autoDistribute'])->name('sectioning.auto_distribute');
    Route::post('/sectioning/assign-single', [SectionDistributionController::class, 'assignSingle'])->name('sectioning.assign_single');
    Route::post('/sectioning/reset', [SectionDistributionController::class, 'reset'])->name('sectioning.reset');
    
    // Subject & Teacher Assignment para sa Section
    Route::get('/sectioning/{section}/subjects', [SectionSubjectController::class, 'getSectionSubjects'])->name('sectioning.subjects');
    Route::post('/sectioning/{section}/assign-subjects', [SectionSubjectController::class, 'assignSubjects'])->name('sectioning.assign_subjects');
});
