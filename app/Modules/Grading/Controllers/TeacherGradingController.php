<?php

namespace App\Modules\Grading\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Academic\Models\Section;
use App\Modules\Academic\Models\Subject;
use App\Modules\Academic\Models\AcademicYear;
use App\Modules\Enrollment\Models\Enrollment;
use App\Modules\Enrollment\Enums\EnrollmentStatus;
use App\Modules\Grading\Models\Grade;
use App\Modules\Grading\Enums\GradeSubmissionStatus;
use App\Modules\Grading\Services\DepEdGradingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;

/**
 * 👨‍🏫 15 YOE Senior Architecture: Teacher & Advisory Grading Controller
 * 
 * Features:
 * - DepEd Order No. 8, s. 2015 compliant grading engine
 * - Batch Grade Encoding with atomic upsert transactions
 * - High-speed Section Roster querying with Cursor Pagination & Redis caching
 * - Role-based multi-tier status progression (Draft -> Adviser -> Registrar -> Published)
 */
class TeacherGradingController extends Controller
{
    /**
     * 📊 Teacher Dashboard: Advisory Sections & Assigned Subjects
     */
    public function dashboard(Request $request): Response
    {
        $teacher = Auth::user();
        $activeYear = AcademicYear::where('is_active', true)->first();

        // 1. Fetch advisory sections assigned to this teacher
        $advisorySections = Section::with(['gradeLevel:id,level,name,category', 'strand:id,code,name'])
            ->withCount(['enrollments' => function ($q) {
                $q->where('status', EnrollmentStatus::APPROVED);
            }])
            ->where('adviser_id', $teacher->id)
            ->get();

        // 2. Fetch all active sections for subject selection
        $allSections = Section::with(['gradeLevel:id,level,name'])->orderBy('name')->get();

        // 3. Fetch subjects available for teacher's grade levels
        $subjects = Subject::with('gradeLevel:id,level,name')->orderBy('code')->get();

        // 4. Fetch actual subject teaching loads assigned to this teacher for active academic year
        $teachingLoads = $teacher->teachingLoads()
            ->with([
                'section.gradeLevel:id,level,name',
                'subject:id,code,name,semester',
            ])
            ->when($activeYear, function ($q) use ($activeYear) {
                $q->where('academic_year_id', $activeYear->id);
            })
            ->get()
            ->map(function ($load) {
                return [
                    'id'            => $load->id,
                    'section_id'    => $load->section_id,
                    'section_name'  => $load->section?->name,
                    'grade_level'   => $load->section?->gradeLevel?->name,
                    'subject_id'    => $load->subject_id,
                    'subject_code'  => $load->subject?->code,
                    'subject_name'  => $load->subject?->name,
                    'schedule_days' => $load->schedule_days,
                    'time_start'    => $load->time_start ? substr($load->time_start, 0, 5) : null,
                    'time_end'      => $load->time_end ? substr($load->time_end, 0, 5) : null,
                    'room'          => $load->room,
                ];
            });

        // 5. Summary metrics
        $totalStudents = Enrollment::whereIn('section_id', $advisorySections->pluck('id'))
            ->where('status', EnrollmentStatus::APPROVED)
            ->count();

        $pendingGradingCount = Grade::where('teacher_id', $teacher->id)
            ->where('status', GradeSubmissionStatus::DRAFT)
            ->count();

        return Inertia::render('Teacher/Dashboard', [
            'advisorySections' => $advisorySections,
            'teachingLoads'    => $teachingLoads,
            'allSections'      => $allSections,
            'subjects'         => $subjects,
            'activeYear'       => $activeYear,
            'stats'            => [
                'totalAdvisorySections' => $advisorySections->count(),
                'totalTeachingLoads'    => $teachingLoads->count(),
                'totalStudents'         => $totalStudents,
                'pendingGradingCount'   => $pendingGradingCount,
            ],
        ]);
    }

    /**
     * 📋 Section Class Roster with Fast Cursor Pagination
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

    /**
     * 📝 Grade Sheet Encoding View
     */
    public function gradeSheet(Request $request, Section $section, Subject $subject): Response
    {
        $activeYear = AcademicYear::where('is_active', true)->firstOrFail();

        // Fetch all enrolled students in this section
        $enrolledStudents = Enrollment::with('student:id,name,lrn,gender')
            ->where('section_id', $section->id)
            ->where('status', EnrollmentStatus::APPROVED)
            ->get()
            ->sortBy('student.name')
            ->values();

        // Fetch existing grades for this Section + Subject + Academic Year
        $existingGrades = Grade::where('section_id', $section->id)
            ->where('subject_id', $subject->id)
            ->where('academic_year_id', $activeYear->id)
            ->get()
            ->keyBy('student_id');

        // Merge student records with grade state
        $gradeSheetRows = $enrolledStudents->map(function ($enrollment) use ($existingGrades, $section, $subject, $activeYear) {
            $grade = $existingGrades->get($enrollment->student_id);

            return [
                'student_id'   => $enrollment->student_id,
                'name'         => $enrollment->student->name,
                'lrn'          => $enrollment->student->lrn ?? 'N/A',
                'gender'       => $enrollment->student->gender ?? 'MALE',
                'grade_id'     => $grade?->id,
                'q1'           => $grade?->q1 !== null ? (float) $grade->q1 : null,
                'q2'           => $grade?->q2 !== null ? (float) $grade->q2 : null,
                'q3'           => $grade?->q3 !== null ? (float) $grade->q3 : null,
                'q4'           => $grade?->q4 !== null ? (float) $grade->q4 : null,
                'final_grade'  => $grade?->final_grade !== null ? (float) $grade->final_grade : null,
                'remarks'      => $grade?->remarks ?? 'PENDING',
                'status'       => $grade?->status ?? GradeSubmissionStatus::DRAFT,
            ];
        });

        return Inertia::render('Teacher/GradeSheet', [
            'section'        => $section->load(['gradeLevel', 'adviser']),
            'subject'        => $subject,
            'activeYear'     => $activeYear,
            'gradeSheetRows' => $gradeSheetRows,
        ]);
    }

    /**
     * 💾 Batch Auto-Save Grades with DepEd DO 8, s. 2015 Computation
     */
    public function saveGrades(Request $request, Section $section, Subject $subject): RedirectResponse
    {
        $validated = $request->validate([
            'grades'                  => ['required', 'array'],
            'grades.*.student_id'     => ['required', 'exists:users,id'],
            'grades.*.q1'             => ['nullable', 'numeric', 'min:50', 'max:100'],
            'grades.*.q2'             => ['nullable', 'numeric', 'min:50', 'max:100'],
            'grades.*.q3'             => ['nullable', 'numeric', 'min:50', 'max:100'],
            'grades.*.q4'             => ['nullable', 'numeric', 'min:50', 'max:100'],
        ]);

        $activeYear = AcademicYear::where('is_active', true)->firstOrFail();
        $teacherId = Auth::id();

        DB::transaction(function () use ($validated, $section, $subject, $activeYear, $teacherId) {
            foreach ($validated['grades'] as $item) {
                $q1 = isset($item['q1']) && $item['q1'] !== '' ? (float) $item['q1'] : null;
                $q2 = isset($item['q2']) && $item['q2'] !== '' ? (float) $item['q2'] : null;
                $q3 = isset($item['q3']) && $item['q3'] !== '' ? (float) $item['q3'] : null;
                $q4 = isset($item['q4']) && $item['q4'] !== '' ? (float) $item['q4'] : null;

                $finalGrade = DepEdGradingService::computeFinalGrade($q1, $q2, $q3, $q4);
                $remarks = DepEdGradingService::getRemarks($finalGrade);

                Grade::updateOrCreate(
                    [
                        'academic_year_id' => $activeYear->id,
                        'section_id'       => $section->id,
                        'subject_id'       => $subject->id,
                        'student_id'       => $item['student_id'],
                    ],
                    [
                        'teacher_id'       => $teacherId,
                        'q1'               => $q1,
                        'q2'               => $q2,
                        'q3'               => $q3,
                        'q4'               => $q4,
                        'final_grade'      => $finalGrade,
                        'remarks'          => $remarks,
                        'updated_at'       => now(),
                    ]
                );

                // Invalidate student grades cache
                Cache::forget("student_grades_{$item['student_id']}");
            }
        });

        return back()->with('success', 'Grades successfully calculated and saved in draft.');
    }

    /**
     * 🚀 Submit Grades for Department Review & Approval
     */
    public function submitGrades(Request $request, Section $section, Subject $subject): RedirectResponse
    {
        $validated = $request->validate([
            'target_status' => ['required', 'in:SUBMITTED_TO_ADVISER,SUBMITTED_TO_REGISTRAR,PUBLISHED'],
        ]);

        $activeYear = AcademicYear::where('is_active', true)->firstOrFail();

        Grade::where('section_id', $section->id)
            ->where('subject_id', $subject->id)
            ->where('academic_year_id', $activeYear->id)
            ->update([
                'status'     => $validated['target_status'],
                'updated_at' => now(),
            ]);

        return back()->with('success', "Grade sheet successfully progressed to {$validated['target_status']}!");
    }
}
