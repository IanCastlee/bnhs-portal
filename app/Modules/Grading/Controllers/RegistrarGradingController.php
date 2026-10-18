<?php

namespace App\Modules\Grading\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Academic\Models\AcademicYear;
use App\Modules\Academic\Models\GradeLevel;
use App\Modules\Academic\Models\Section;
use App\Modules\Academic\Models\SectionSubject;
use App\Modules\Academic\Models\Subject;
use App\Modules\Enrollment\Enums\EnrollmentStatus;
use App\Modules\Enrollment\Models\Enrollment;
use App\Modules\Grading\Enums\GradeSubmissionStatus;
use App\Modules\Grading\Models\Grade;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class RegistrarGradingController extends Controller
{
    /**
     * Registrar Grades & SF10/SF9 Publication Console
     */
    public function index(Request $request): Response
    {
        $statusFilter = $request->query('status', 'SUBMITTED_TO_REGISTRAR');
        $gradeLevelId = $request->query('grade_level_id', '');
        $search = trim($request->query('search', ''));

        $activeYear = AcademicYear::getCachedActive();
        if ($request->has('academic_year_id')) {
            $academicYearId = $request->query('academic_year_id');
            session(['registrar_academic_year_id' => $academicYearId]);
        } else {
            $academicYearId = session('registrar_academic_year_id', $activeYear?->id);
        }

        $selectedYear = $academicYearId
            ? AcademicYear::find($academicYearId) ?? $activeYear
            : $activeYear;

        // Fetch all grades for this academic year with relationships
        $gradesQuery = Grade::with([
            'student:id,name,lrn,gender',
            'teacher:id,name,email',
            'subject:id,code,name,grade_level_id',
            'section.gradeLevel:id,level,name',
            'section.adviser:id,name,email',
        ])
        ->when($selectedYear, fn ($q) => $q->where('academic_year_id', $selectedYear->id));

        $allGrades = $gradesQuery->get();

        // Group by section_id + subject_id to form Grade Sheet packages
        $groupedSheets = $allGrades->groupBy(fn ($g) => $g->section_id . '_' . $g->subject_id);

        // Counts per status for filter tabs
        $counts = [
            'ALL'                    => $groupedSheets->count(),
            'SUBMITTED_TO_REGISTRAR' => 0,
            'SUBMITTED_TO_ADVISER'   => 0,
            'PUBLISHED'              => 0,
            'DRAFT'                  => 0,
        ];

        $gradeSheets = [];

        foreach ($groupedSheets as $key => $rows) {
            $first = $rows->first();
            if (!$first || !$first->section || !$first->subject) {
                continue;
            }

            $sheetStatus = $first->status instanceof GradeSubmissionStatus
                ? $first->status->value
                : (string) ($first->status ?? 'DRAFT');

            if (isset($counts[$sheetStatus])) {
                $counts[$sheetStatus]++;
            }

            // Filter by status tab
            if ($statusFilter !== 'ALL' && $sheetStatus !== $statusFilter) {
                continue;
            }

            // Filter by grade level
            if ($gradeLevelId !== '' && (string) $first->section->grade_level_id !== (string) $gradeLevelId) {
                continue;
            }

            $sectionName = $first->section->name ?? '';
            $subjectName = $first->subject->name ?? '';
            $subjectCode = $first->subject->code ?? '';
            $teacherName = $first->teacher->name ?? 'Faculty';
            $adviserName = $first->section->adviser->name ?? 'Unassigned';

            if ($search !== '') {
                $haystack = strtolower("{$sectionName} {$subjectName} {$subjectCode} {$teacherName} {$adviserName}");
                if (!str_contains($haystack, strtolower($search))) {
                    continue;
                }
            }

            $studentRows = $rows->sortBy(fn ($g) => $g->student?->name ?? '')->values()->map(fn ($g) => [
                'student_id'  => $g->student_id,
                'name'        => $g->student?->name ?? 'Student',
                'lrn'         => $g->student?->lrn ?? 'N/A',
                'q1'          => $g->q1 !== null ? (float) $g->q1 : null,
                'q2'          => $g->q2 !== null ? (float) $g->q2 : null,
                'q3'          => $g->q3 !== null ? (float) $g->q3 : null,
                'q4'          => $g->q4 !== null ? (float) $g->q4 : null,
                'final_grade' => $g->final_grade !== null ? (float) $g->final_grade : null,
                'remarks'     => $g->remarks ?? 'PENDING',
            ]);

            $encodedCount = $studentRows->filter(fn ($r) => $r['q1'] !== null || $r['q2'] !== null || $r['q3'] !== null || $r['q4'] !== null)->count();
            $passedCount = $studentRows->where('remarks', 'PASSED')->count();
            $failedCount = $studentRows->where('remarks', 'FAILED')->count();

            $gradeSheets[] = [
                'key'              => $key,
                'section_id'       => $first->section_id,
                'section_name'     => $sectionName,
                'grade_level_id'   => $first->section->grade_level_id,
                'grade_level_name' => $first->section->gradeLevel?->name ?? 'Grade',
                'adviser_name'     => $adviserName,
                'subject_id'       => $first->subject_id,
                'subject_code'     => $subjectCode,
                'subject_name'     => $subjectName,
                'teacher_name'     => $teacherName,
                'status'           => $sheetStatus,
                'total_students'   => $studentRows->count(),
                'encoded_count'    => $encodedCount,
                'passed_count'     => $passedCount,
                'failed_count'     => $failedCount,
                'updated_at'       => $first->updated_at?->format('M d, Y h:i A'),
                'students'         => $studentRows,
            ];
        }

        $gradeLevels = GradeLevel::orderBy('level')->get(['id', 'level', 'name']);

        return Inertia::render('Registrar/Grades', [
            'gradeSheets'  => array_values($gradeSheets),
            'counts'       => $counts,
            'gradeLevels'  => $gradeLevels,
            'selectedYear' => $selectedYear,
            'filters'      => [
                'status'           => $statusFilter,
                'grade_level_id'   => $gradeLevelId,
                'search'           => $search,
                'academic_year_id' => $selectedYear?->id,
            ],
        ]);
    }

    /**
     * Update a Grade Sheet's status (Publish to Student Portal or Return to Adviser/Teacher)
     */
    public function updateStatus(Request $request, Section $section, Subject $subject): RedirectResponse
    {
        $validated = $request->validate([
            'target_status' => ['required', 'in:PUBLISHED,SUBMITTED_TO_ADVISER,DRAFT'],
        ]);

        $academicYearId = session('registrar_academic_year_id')
            ?? AcademicYear::where('is_active', true)->value('id');

        $grades = Grade::where('section_id', $section->id)
            ->where('subject_id', $subject->id)
            ->when($academicYearId, fn ($q) => $q->where('academic_year_id', $academicYearId))
            ->get();

        if ($grades->isEmpty()) {
            return back()->with('error', 'No grade records found for this section and subject.');
        }

        Grade::where('section_id', $section->id)
            ->where('subject_id', $subject->id)
            ->when($academicYearId, fn ($q) => $q->where('academic_year_id', $academicYearId))
            ->update([
                'status'     => $validated['target_status'],
                'updated_at' => now(),
            ]);

        foreach ($grades as $g) {
            Cache::forget("student_grades_{$g->student_id}");
        }

        $messages = [
            'PUBLISHED'            => "Grades for {$subject->code} ({$section->name}) are now officially PUBLISHED to the Student Portal.",
            'SUBMITTED_TO_ADVISER' => "Grade sheet for {$subject->code} ({$section->name}) was returned to the Class Adviser.",
            'DRAFT'                => "Grade sheet for {$subject->code} ({$section->name}) was returned to the Subject Teacher (Draft).",
        ];

        return back()->with('success', $messages[$validated['target_status']] ?? 'Grade status updated.');
    }

    /**
     * Publish all SUBMITTED_TO_REGISTRAR grade sheets in a Section at once
     */
    public function publishSection(Request $request, Section $section): RedirectResponse
    {
        $academicYearId = session('registrar_academic_year_id')
            ?? AcademicYear::where('is_active', true)->value('id');

        $grades = Grade::where('section_id', $section->id)
            ->when($academicYearId, fn ($q) => $q->where('academic_year_id', $academicYearId))
            ->where('status', GradeSubmissionStatus::SUBMITTED_TO_REGISTRAR)
            ->get();

        if ($grades->isEmpty()) {
            return back()->with('warning', 'No pending Registrar-submitted grade sheets found for this section.');
        }

        Grade::where('section_id', $section->id)
            ->when($academicYearId, fn ($q) => $q->where('academic_year_id', $academicYearId))
            ->where('status', GradeSubmissionStatus::SUBMITTED_TO_REGISTRAR)
            ->update([
                'status'     => GradeSubmissionStatus::PUBLISHED,
                'updated_at' => now(),
            ]);

        foreach ($grades as $g) {
            Cache::forget("student_grades_{$g->student_id}");
        }

        return back()->with('success', "All endorsed grade sheets for Section {$section->name} have been PUBLISHED to the Student Portal.");
    }
}
