<?php

namespace App\Modules\Academic\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Enrollment\Models\Enrollment;
use App\Modules\Enrollment\Enums\EnrollmentStatus;
use App\Modules\Academic\Models\Announcement;
use App\Modules\Academic\Models\Subject;
use App\Modules\Academic\Models\AcademicYear;
use App\Modules\Academic\Models\GradeLevel;
use App\Modules\Grading\Models\Grade;
use App\Modules\Grading\Enums\GradeSubmissionStatus;
use App\Modules\Grading\Services\DepEdGradingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

/**
 * 🎓 15 YOE Senior Architecture: Student Academic & Portal Controller
 * 
 * Features:
 * - High-speed Caching (Redis) for student profile & announcements
 * - DepEd SF9 Report Card Generator with Transmutation & Honor Roll
 * - Class Schedule & Subject Curriculum matrix
 * - Multi-Year Rollover & Old Student Detection
 */
class StudentAcademicController extends Controller
{
    /**
     * 🏠 Student Main Dashboard
     */
    public function dashboard(Request $request): Response|RedirectResponse
    {
        $user = Auth::user();
        $activeYear = AcademicYear::where('is_active', true)->first();

        // 1. Fetch current active enrollment
        $enrollment = Enrollment::with([
            'section.adviser',
            'gradeLevel',
            'strand',
            'academicYear',
        ])
        ->where('student_id', $user->id)
        ->when($activeYear, function ($q) use ($activeYear) {
            $q->where('academic_year_id', $activeYear->id);
        })
        ->first();

        // 🔒 Guard: If not approved or pending review or not yet enrolled in active year, redirect to admission hub
        if (!$enrollment || $enrollment->status !== EnrollmentStatus::APPROVED) {
            return redirect()->route('student.admission');
        }

        // 2. Announcements Cache (10-minute TTL)
        $announcements = Cache::remember('school_announcements_first_20', 600, function () {
            return Announcement::with('author:id,name,role')
                ->orderByDesc('is_pinned')
                ->orderByDesc('id')
                ->take(20)
                ->get()
                ->toArray();
        });

        // 3. Quick Grade Summary
        $gradeCount = Grade::where('student_id', $user->id)
            ->where('academic_year_id', $enrollment->academic_year_id)
            ->count();

        return Inertia::render('Student/Dashboard', [
            'enrollment'    => $enrollment,
            'announcements' => $announcements,
            'activeYear'    => $activeYear,
            'stats'         => [
                'totalSubjects' => $gradeCount,
                'status'        => $enrollment->status,
                'sectionName'   => $enrollment->section?->name ?? 'Unassigned',
                'adviserName'   => $enrollment->section?->adviser?->name ?? 'Unassigned',
            ],
        ]);
    }

    /**
     * 📊 DepEd Form 137 / SF9 Quarterly Report Card
     */
    public function grades(Request $request): Response|RedirectResponse
    {
        $user = Auth::user();
        $activeYear = AcademicYear::where('is_active', true)->first();

        $enrollment = Enrollment::with([
            'section.adviser',
            'gradeLevel',
            'strand',
            'academicYear',
        ])
        ->where('student_id', $user->id)
        ->when($activeYear, function ($q) use ($activeYear) {
            $q->where('academic_year_id', $activeYear->id);
        })
        ->first();

        if (!$enrollment || $enrollment->status !== EnrollmentStatus::APPROVED) {
            // Check past records to display historical grades if available
            $pastEnrollment = Enrollment::with(['section.adviser', 'gradeLevel', 'academicYear'])
                ->where('student_id', $user->id)
                ->where('status', EnrollmentStatus::APPROVED)
                ->latest('id')
                ->first();

            if (!$pastEnrollment) {
                return redirect()->route('student.admission');
            }
            $enrollment = $pastEnrollment;
        }

        // Fetch grades for this student
        $grades = Grade::with(['subject', 'teacher:id,name'])
            ->where('student_id', $user->id)
            ->where('academic_year_id', $enrollment->academic_year_id)
            ->get();

        // DepEd Report Card Formatter
        $reportCard = $grades->map(function ($g) {
            $isPublished = $g->status === GradeSubmissionStatus::PUBLISHED;
            
            return [
                'id'           => $g->id,
                'subject_code' => $g->subject?->code ?? 'N/A',
                'subject_name' => $g->subject?->name ?? 'Subject',
                'teacher_name' => $g->teacher?->name ?? 'Faculty',
                'q1'           => $isPublished || $g->q1 !== null ? $g->q1 : null,
                'q2'           => $isPublished || $g->q2 !== null ? $g->q2 : null,
                'q3'           => $isPublished || $g->q3 !== null ? $g->q3 : null,
                'q4'           => $isPublished || $g->q4 !== null ? $g->q4 : null,
                'final_grade'  => $g->final_grade,
                'remarks'      => $g->remarks ?? 'PENDING',
                'descriptor'   => DepEdGradingService::getDescriptor($g->final_grade ? (float) $g->final_grade : null),
                'status'       => $g->status,
            ];
        });

        // Calculate General Weighted Average (GWA)
        $completedGrades = $reportCard->pluck('final_grade')->filter()->map(fn($v) => (float)$v)->values()->all();
        $generalAverage = !empty($completedGrades) ? round(array_sum($completedGrades) / count($completedGrades), 2) : null;
        $honorAward = $generalAverage ? DepEdGradingService::getHonorAward($generalAverage, $completedGrades) : null;

        return Inertia::render('Student/Grades', [
            'enrollment'     => $enrollment,
            'reportCard'     => $reportCard,
            'generalAverage' => $generalAverage,
            'honorAward'     => $honorAward,
        ]);
    }

    /**
     * 📖 Class Schedule & Subject Curriculum Matrix
     */
    public function classes(Request $request): Response|RedirectResponse
    {
        $user = Auth::user();
        $activeYear = AcademicYear::where('is_active', true)->first();

        $enrollment = Enrollment::with([
            'section.adviser',
            'gradeLevel',
            'strand',
            'academicYear',
        ])
        ->where('student_id', $user->id)
        ->when($activeYear, function ($q) use ($activeYear) {
            $q->where('academic_year_id', $activeYear->id);
        })
        ->first();

        if (!$enrollment || $enrollment->status !== EnrollmentStatus::APPROVED) {
            return redirect()->route('student.admission');
        }

        // Fetch all curriculum subjects for this student's grade & strand
        $subjects = Subject::where('grade_level_id', $enrollment->grade_level_id)
            ->when($enrollment->strand_id, function ($query) use ($enrollment) {
                $query->where(function ($q) use ($enrollment) {
                    $q->whereNull('strand_id')
                      ->orWhere('strand_id', $enrollment->strand_id);
                });
            }, function ($query) {
                $query->whereNull('strand_id');
            })
            ->orderBy('code')
            ->get();

        return Inertia::render('Student/Classes', [
            'enrollment' => $enrollment,
            'subjects'   => $subjects,
        ]);
    }
}
