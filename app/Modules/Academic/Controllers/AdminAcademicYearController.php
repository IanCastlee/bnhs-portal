<?php

namespace App\Modules\Academic\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Academic\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminAcademicYearController extends Controller
{
    /**
     * Display a listing of academic years.
     */
    public function index(): Response
    {
        $academicYears = AcademicYear::withCount(['enrollments', 'sections'])
            ->orderBy('is_active', 'desc')
            ->orderBy('name', 'desc')
            ->get();

        $activeYear = $academicYears->firstWhere('is_active', true);

        return Inertia::render('Admin/AcademicYears/Index', [
            'academicYears' => $academicYears,
            'activeYear' => $activeYear,
            'stats' => [
                'totalYears' => $academicYears->count(),
                'activeYearName' => $activeYear?->name ?? 'None Active',
                'isEnrollmentOpen' => (bool) ($activeYear?->is_enrollment_open ?? false),
                'isGradingOpen' => (bool) ($activeYear?->is_grading_open ?? false),
                'totalStudentsInActiveYear' => $activeYear?->enrollments_count ?? 0,
            ],
        ]);
    }

    /**
     * Store a newly created academic year.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'regex:/^\d{4}-\d{4}$/',
                'unique:academic_years,name',
            ],
            'semester' => ['required', 'string', 'in:Full Year,1st Semester,2nd Semester,Summer'],
            'is_active' => ['boolean'],
            'is_enrollment_open' => ['boolean'],
            'is_grading_open' => ['boolean'],
        ], [
            'name.regex' => 'The academic year name must follow the standard YYYY-YYYY format (e.g. 2028-2029).',
            'name.unique' => 'This academic year already exists in the system.',
        ]);

        DB::transaction(function () use ($validated) {
            $makeActive = $validated['is_active'] ?? false;

            if ($makeActive) {
                // Deactivate all other school years
                AcademicYear::query()->update(['is_active' => false]);
            }

            AcademicYear::create([
                'name' => $validated['name'],
                'semester' => $validated['semester'],
                'is_active' => $makeActive,
                'is_enrollment_open' => $validated['is_enrollment_open'] ?? false,
                'is_grading_open' => $validated['is_grading_open'] ?? false,
            ]);

            // Flush cache
            Cache::forget('active_academic_year');
            Cache::forget('active_school_year');
            Cache::forget('active_academic_year_global');
            Cache::forget('all_academic_years_global');
        });

        return redirect()->back()->with('success', "Academic Year {$validated['name']} created successfully.");
    }

    /**
     * Set a specific academic year as active (and archive all others).
     */
    public function toggleActive(AcademicYear $academicYear)
    {
        $currentUserId = \Illuminate\Support\Facades\Auth::id();

        DB::transaction(function () use ($academicYear, $currentUserId) {
            // Deactivate all other school years
            AcademicYear::where('id', '!=', $academicYear->id)->update(['is_active' => false]);

            // Activate target school year
            $academicYear->update(['is_active' => true]);

            // Flush application cache globally so no stale school year data lingers
            Cache::flush();
            Cache::forget('active_academic_year');
            Cache::forget('active_school_year');
            Cache::forget('active_academic_year_global');
            Cache::forget('all_academic_years_global');

            // Log Audit Trail
            \App\Modules\Identity\Models\AuditLog::record(
                action: 'ACADEMIC_YEAR_ACTIVATED',
                description: "Academic Year {$academicYear->name} was set to ACTIVE. Global caches were refreshed.",
                target: $academicYear,
                module: 'ACADEMIC'
            );
        });

        return redirect()->back()->with('success', "S.Y. {$academicYear->name} is now the active School Year.");
    }

    /**
     * Toggle online enrollment open/closed for a specific academic year.
     */
    public function toggleEnrollment(AcademicYear $academicYear)
    {
        $academicYear->update([
            'is_enrollment_open' => !$academicYear->is_enrollment_open,
        ]);

        Cache::forget('active_academic_year');
        Cache::forget('active_school_year');
        Cache::forget('active_academic_year_global');
        Cache::forget('all_academic_years_global');

        $status = $academicYear->is_enrollment_open ? 'OPENED' : 'CLOSED';
        return redirect()->back()->with('success', "Online Admission & Enrollment is now {$status} for S.Y. {$academicYear->name}.");
    }

    /**
     * Toggle grade encoding window open/closed for teachers.
     */
    public function toggleGrading(AcademicYear $academicYear)
    {
        $academicYear->update([
            'is_grading_open' => !$academicYear->is_grading_open,
        ]);

        Cache::forget('active_academic_year');
        Cache::forget('active_school_year');
        Cache::forget('active_academic_year_global');
        Cache::forget('all_academic_years_global');

        $status = $academicYear->is_grading_open ? 'OPENED' : 'CLOSED';
        return redirect()->back()->with('success', "Teacher Grade Encoding is now {$status} for S.Y. {$academicYear->name}.");
    }

    /**
     * Update an academic year.
     */
    public function update(Request $request, AcademicYear $academicYear)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'regex:/^\d{4}-\d{4}$/',
                'unique:academic_years,name,' . $academicYear->id,
            ],
            'semester' => ['required', 'string', 'in:Full Year,1st Semester,2nd Semester,Summer'],
        ]);

        $academicYear->update($validated);
        Cache::forget('active_academic_year');
        Cache::forget('active_academic_year_global');
        Cache::forget('all_academic_years_global');

        return redirect()->back()->with('success', "Academic Year updated successfully.");
    }

    /**
     * Safely delete an academic year if it has no associated student records.
     */
    public function destroy(AcademicYear $academicYear)
    {
        if ($academicYear->is_active) {
            return redirect()->back()->with('error', 'Cannot delete the currently active Academic Year. Please activate another year first.');
        }

        if ($academicYear->enrollments()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete this Academic Year because it contains student enrollment records.');
        }

        $academicYear->delete();
        Cache::forget('active_academic_year');
        Cache::forget('active_academic_year_global');
        Cache::forget('all_academic_years_global');

        return redirect()->back()->with('success', 'Academic Year removed successfully.');
    }
}
