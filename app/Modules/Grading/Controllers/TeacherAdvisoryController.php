<?php

namespace App\Modules\Grading\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Academic\Models\Section;
use App\Modules\Academic\Models\AcademicYear;
use App\Modules\Enrollment\Models\Enrollment;
use App\Modules\Enrollment\Enums\EnrollmentStatus;
use App\Modules\Grading\Models\Grade;
use App\Modules\Grading\Enums\GradeSubmissionStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

/**
 * Class Adviser Controller
 * 
 * Handles advisory section monitoring, grade review/consolidation,
 * section class roster management, and forwarding grades to the Registrar.
 */
class TeacherAdvisoryController extends Controller
{
    /**
     * Class Adviser Portal: Overview of Advisory Sections & Grade Submissions
     */
    public function advisoryIndex(Request $request): Response
    {
        $teacher = Auth::user();
        $activeYear = AcademicYear::where('is_active', true)->first();

        $advisorySections = Section::with([
            'gradeLevel:id,level,name,category',
            'strand:id,code,name',
            'sectionSubjects.subject:id,code,name,semester',
            'sectionSubjects.teacher:id,name,email',
        ])
        ->withCount(['enrollments' => function ($q) {
            $q->where('status', EnrollmentStatus::APPROVED);
        }])
        ->where('adviser_id', $teacher->id)
        ->when($activeYear, fn ($q) => $q->where('academic_year_id', $activeYear->id))
        ->get();

        // Pre-fetch all grades for all teacher's advisory sections in a SINGLE batch query (Eliminate N+1)
        $sectionIds = $advisorySections->pluck('id')->all();

        $allGrades = empty($sectionIds) ? collect() : Grade::select([
                'id', 'section_id', 'subject_id', 'teacher_id', 'status',
                'q1', 'q2', 'q3', 'q4'
            ])
            ->whereIn('section_id', $sectionIds)
            ->when($activeYear, fn ($q) => $q->where('academic_year_id', $activeYear->id))
            ->get()
            ->groupBy(['section_id', 'subject_id']);

        // Build per-section subject grading progress for the Adviser
        $sectionsData = $advisorySections->map(function ($section) use ($allGrades) {
            $sectionGrades = $allGrades->get($section->id, collect());

            $subjects = $section->sectionSubjects->map(function ($secSub) use ($sectionGrades, $section) {
                $subjectGrades = $sectionGrades->get($secSub->subject_id, collect());
                $firstGrade = $subjectGrades->first();
                $statusVal = $firstGrade?->status instanceof GradeSubmissionStatus
                    ? $firstGrade->status->value
                    : ($firstGrade?->status ?? GradeSubmissionStatus::DRAFT->value);

                $encodedCount = $subjectGrades->filter(fn ($g) => $g->q1 !== null || $g->q2 !== null || $g->q3 !== null || $g->q4 !== null)->count();

                return [
                    'subject_id'    => $secSub->subject_id,
                    'subject_code'  => $secSub->subject?->code ?? 'N/A',
                    'subject_name'  => $secSub->subject?->name ?? 'Subject',
                    'teacher_name'  => $secSub->teacher?->name ?? ($firstGrade?->teacher?->name ?? 'Unassigned'),
                    'encoded_count' => $encodedCount,
                    'total_students'=> $section->enrollments_count,
                    'status'        => $statusVal,
                ];
            })->values();

            return [
                'id'                => $section->id,
                'name'              => $section->name,
                'grade_level_name'  => $section->gradeLevel?->name,
                'strand_code'       => $section->strand?->code,
                'enrollments_count' => $section->enrollments_count,
                'subjects'          => $subjects,
            ];
        });

        return Inertia::render('Teacher/AdvisoryGrades', [
            'sections'   => $sectionsData,
            'activeYear' => $activeYear,
        ]);
    }

    /**
     * Forward all SUBMITTED_TO_ADVISER subjects in an advisory section to the Registrar
     */
    public function forwardSectionToRegistrar(Request $request, Section $section): RedirectResponse
    {
        if ((int) $section->adviser_id !== (int) Auth::id()) {
            return back()->with('error', 'Only the assigned Class Adviser of this section can forward grades to the Registrar.');
        }

        $activeYear = AcademicYear::where('is_active', true)->firstOrFail();

        $updated = Grade::where('section_id', $section->id)
            ->where('academic_year_id', $activeYear->id)
            ->where('status', GradeSubmissionStatus::SUBMITTED_TO_ADVISER)
            ->update([
                'status'     => GradeSubmissionStatus::SUBMITTED_TO_REGISTRAR,
                'updated_at' => now(),
            ]);

        if ($updated === 0) {
            return back()->with('warning', 'No subjects with SUBMITTED_TO_ADVISER status found to forward.');
        }

        return back()->with('success', "All Adviser-submitted grade sheets for Section {$section->name} have been forwarded to the Registrar.");
    }

    /**
     * Section Class Roster with Fast Cursor Pagination
     */
    public function sectionRoster(Request $request, Section $section): Response
    {
        $search = trim($request->query('search', ''));
        $useCursor = $request->boolean('cursor', false);

        $query = Enrollment::with([
            'student:id,name,email,lrn,gender,phone_number',
            'gradeLevel:id,level,name',
            'strand:id,code,name',
        ])
        ->where('section_id', $section->id)
        ->where('status', EnrollmentStatus::APPROVED);

        if (!empty($search)) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('lrn', 'like', "{$search}%");
            });
        }

        $query->orderBy('id', 'asc');

        if ($useCursor) {
            $students = $query->cursorPaginate(20)->withQueryString();
        } else {
            $students = $query->paginate(20)->withQueryString();
        }

        $section->load(['gradeLevel', 'adviser', 'academicYear']);

        return Inertia::render('Teacher/SectionRoster', [
            'section'  => $section,
            'students' => $students,
            'filters'  => ['search' => $search, 'cursor' => $useCursor],
        ]);
    }
}
