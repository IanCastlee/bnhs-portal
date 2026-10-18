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
        $activeYear = AcademicYear::getCachedActive();

        // 1. Fetch advisory sections assigned to this teacher for active school year
        $advisorySections = Section::with(['gradeLevel:id,level,name,category', 'strand:id,code,name'])
            ->withCount(['enrollments' => function ($q) {
                $q->where('status', EnrollmentStatus::APPROVED);
            }])
            ->where('adviser_id', $teacher->id)
            ->when($activeYear, fn ($q) => $q->where('academic_year_id', $activeYear->id))
            ->get();

        // 2. Fetch active school year sections for subject selection
        $allSections = Section::with(['gradeLevel:id,level,name'])
            ->when($activeYear, fn ($q) => $q->where('academic_year_id', $activeYear->id))
            ->orderBy('name')
            ->get();

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

        // 5. Summary metrics (reuse enrollments_count already loaded on advisorySections)
        $totalStudents = (int) $advisorySections->sum('enrollments_count');

        $pendingGradingCount = Grade::where('teacher_id', $teacher->id)
            ->where('status', GradeSubmissionStatus::DRAFT)
            ->when($activeYear, fn ($q) => $q->where('academic_year_id', $activeYear->id))
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
        $gradeSheetRows = $enrolledStudents->map(function ($enrollment) use ($existingGrades) {
            $grade = $existingGrades->get($enrollment->student_id);
            $statusVal = $grade?->status instanceof GradeSubmissionStatus
                ? $grade->status->value
                : ($grade?->status ?? GradeSubmissionStatus::DRAFT->value);

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
                'status'       => $statusVal,
            ];
        });

        // Determine overall sheet status
        $firstStatus = $gradeSheetRows->pluck('status')->filter()->first() ?? GradeSubmissionStatus::DRAFT->value;

        return Inertia::render('Teacher/GradeSheet', [
            'section'        => $section->load(['gradeLevel', 'adviser']),
            'subject'        => $subject,
            'activeYear'     => $activeYear,
            'gradeSheetRows' => $gradeSheetRows,
            'sheetStatus'    => $firstStatus,
            'isAdviser'      => (int) $section->adviser_id === (int) Auth::id(),
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

        // Prevent overwriting if already locked/submitted beyond DRAFT
        $lockedExists = Grade::where('section_id', $section->id)
            ->where('subject_id', $subject->id)
            ->where('academic_year_id', $activeYear->id)
            ->whereIn('status', [
                GradeSubmissionStatus::SUBMITTED_TO_ADVISER,
                GradeSubmissionStatus::SUBMITTED_TO_REGISTRAR,
                GradeSubmissionStatus::PUBLISHED,
            ])
            ->exists();

        if ($lockedExists) {
            return back()->with('error', 'Grade sheet is currently locked for review. Ask the Class Adviser to return it to DRAFT before editing.');
        }

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
                        'status'           => GradeSubmissionStatus::DRAFT,
                        'updated_at'       => now(),
                    ]
                );

                Cache::forget("student_grades_{$item['student_id']}");
            }
        });

        return back()->with('success', 'Grades successfully calculated and saved in draft.');
    }

    /**
     * 🚀 Submit Grades for 3-Step Workflow (Teacher -> Adviser -> Registrar -> Student)
     */
    public function submitGrades(Request $request, Section $section, Subject $subject): RedirectResponse
    {
        $validated = $request->validate([
            'target_status'       => ['required', 'in:DRAFT,SUBMITTED_TO_ADVISER,SUBMITTED_TO_REGISTRAR'],
            'grades'              => ['nullable', 'array'],
            'grades.*.student_id' => ['required_with:grades', 'exists:users,id'],
            'grades.*.q1'         => ['nullable', 'numeric', 'min:50', 'max:100'],
            'grades.*.q2'         => ['nullable', 'numeric', 'min:50', 'max:100'],
            'grades.*.q3'         => ['nullable', 'numeric', 'min:50', 'max:100'],
            'grades.*.q4'         => ['nullable', 'numeric', 'min:50', 'max:100'],
        ]);

        $activeYear = AcademicYear::where('is_active', true)->firstOrFail();
        $teacherId = Auth::id();
        $targetStatus = $validated['target_status'];

        // Only Class Adviser of this section can return to DRAFT or forward to SUBMITTED_TO_REGISTRAR
        if (in_array($targetStatus, ['DRAFT', 'SUBMITTED_TO_REGISTRAR'], true)) {
            if ((int) $section->adviser_id !== (int) $teacherId) {
                return back()->with('error', 'Only the assigned Class Adviser of this section can perform this action.');
            }
        }

        DB::transaction(function () use ($validated, $section, $subject, $activeYear, $teacherId, $targetStatus) {
            // If Subject Teacher passed current rows while submitting to Adviser, upsert them first
            if ($targetStatus === 'SUBMITTED_TO_ADVISER' && !empty($validated['grades'])) {
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
                            'teacher_id'  => $teacherId,
                            'q1'          => $q1,
                            'q2'          => $q2,
                            'q3'          => $q3,
                            'q4'          => $q4,
                            'final_grade' => $finalGrade,
                            'remarks'     => $remarks,
                            'status'      => $targetStatus,
                            'updated_at'  => now(),
                        ]
                    );
                }
            } else {
                // Ensure all enrolled students have a grade row before updating status
                $enrolledStudentIds = Enrollment::where('section_id', $section->id)
                    ->where('status', EnrollmentStatus::APPROVED)
                    ->pluck('student_id');

                foreach ($enrolledStudentIds as $studentId) {
                    Grade::firstOrCreate(
                        [
                            'academic_year_id' => $activeYear->id,
                            'section_id'       => $section->id,
                            'subject_id'       => $subject->id,
                            'student_id'       => $studentId,
                        ],
                        [
                            'teacher_id' => $teacherId,
                            'remarks'    => 'PENDING',
                            'status'     => $targetStatus,
                        ]
                    );
                }

                Grade::where('section_id', $section->id)
                    ->where('subject_id', $subject->id)
                    ->where('academic_year_id', $activeYear->id)
                    ->update([
                        'status'     => $targetStatus,
                        'updated_at' => now(),
                    ]);
            }
        });

        $statusMessages = [
            'SUBMITTED_TO_ADVISER'   => 'Grade sheet submitted to the Class Adviser for review.',
            'SUBMITTED_TO_REGISTRAR' => 'Grade sheet approved by Adviser and forwarded to the Registrar.',
            'DRAFT'                  => 'Grade sheet returned to Subject Teacher (Draft unlocked).',
        ];

        return back()->with('success', $statusMessages[$targetStatus] ?? "Grade sheet status updated to {$targetStatus}.");
    }

    /**
     * 📥 Parse Uploaded Excel (.xlsx / .csv) File and Convert into Student Grade Numbers
     */
    public function parseExcelGrades(Request $request, Section $section, Subject $subject): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:5120'],
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        $path = $file->getRealPath();

        if (!in_array($extension, ['xlsx', 'csv', 'txt', 'tsv'], true)) {
            return response()->json([
                'message' => 'Invalid file format. Please upload an Excel (.xlsx) or CSV (.csv) file.',
            ], 422);
        }

        $rawRows = $extension === 'xlsx'
            ? $this->extractXlsxRows($path)
            : $this->extractDelimitedRows($path);

        if (empty($rawRows)) {
            return response()->json([
                'message' => 'Could not read any rows from the uploaded file.',
            ], 422);
        }

        // Detect column indices from header row (or fallback to standard positions)
        $colMap = [
            'lrn'  => null,
            'name' => null,
            'q1'   => null,
            'q2'   => null,
            'q3'   => null,
            'q4'   => null,
        ];

        $dataStartRow = 0;
        foreach ($rawRows as $rowIndex => $row) {
            $normalizedCells = array_map(fn ($cell) => strtolower(trim((string) $cell)), $row);
            $hasHeaderKeyword = false;

            foreach ($normalizedCells as $colIdx => $val) {
                if (str_contains($val, 'lrn') || str_contains($val, 'learner reference')) {
                    $colMap['lrn'] = $colIdx;
                    $hasHeaderKeyword = true;
                } elseif (str_contains($val, 'name') || str_contains($val, 'student') || str_contains($val, 'learner')) {
                    if ($colMap['name'] === null) {
                        $colMap['name'] = $colIdx;
                        $hasHeaderKeyword = true;
                    }
                } elseif (in_array($val, ['q1', '1st', 'quarter 1', '1st quarter', 'q1 (1st)'], true)) {
                    $colMap['q1'] = $colIdx;
                    $hasHeaderKeyword = true;
                } elseif (in_array($val, ['q2', '2nd', 'quarter 2', '2nd quarter', 'q2 (2nd)'], true)) {
                    $colMap['q2'] = $colIdx;
                    $hasHeaderKeyword = true;
                } elseif (in_array($val, ['q3', '3rd', 'quarter 3', '3rd quarter', 'q3 (3rd)'], true)) {
                    $colMap['q3'] = $colIdx;
                    $hasHeaderKeyword = true;
                } elseif (in_array($val, ['q4', '4th', 'quarter 4', '4th quarter', 'q4 (4th)'], true)) {
                    $colMap['q4'] = $colIdx;
                    $hasHeaderKeyword = true;
                }
            }

            if ($hasHeaderKeyword) {
                $dataStartRow = $rowIndex + 1;
                break;
            }
        }

        // Fallback column mapping if no header row was found: [0 => LRN, 1 => Name, 2 => Q1, 3 => Q2, 4 => Q3, 5 => Q4]
        if ($colMap['lrn'] === null && $colMap['name'] === null) {
            $colMap = ['lrn' => 0, 'name' => 1, 'q1' => 2, 'q2' => 3, 'q3' => 4, 'q4' => 5];
        }

        // Index imported rows by normalized LRN and normalized Student Name
        $byLrn = [];
        $byName = [];

        for ($i = $dataStartRow; $i < count($rawRows); $i++) {
            $row = $rawRows[$i];
            if (empty(array_filter($row, fn ($v) => trim((string) $v) !== ''))) {
                continue;
            }

            $rawLrn = $colMap['lrn'] !== null && isset($row[$colMap['lrn']])
                ? preg_replace('/\D/', '', (string) $row[$colMap['lrn']])
                : '';

            $rawName = $colMap['name'] !== null && isset($row[$colMap['name']])
                ? $this->normalizeStudentName((string) $row[$colMap['name']])
                : '';

            $parsedQuarters = [
                'q1' => $this->parseGradeNumber($colMap['q1'] !== null ? ($row[$colMap['q1']] ?? null) : null),
                'q2' => $this->parseGradeNumber($colMap['q2'] !== null ? ($row[$colMap['q2']] ?? null) : null),
                'q3' => $this->parseGradeNumber($colMap['q3'] !== null ? ($row[$colMap['q3']] ?? null) : null),
                'q4' => $this->parseGradeNumber($colMap['q4'] !== null ? ($row[$colMap['q4']] ?? null) : null),
            ];

            if ($rawLrn !== '') {
                $byLrn[$rawLrn] = $parsedQuarters;
            }
            if ($rawName !== '') {
                $byName[$rawName] = $parsedQuarters;
            }
        }

        // Match against officially enrolled students in this section
        $enrolledStudents = Enrollment::with('student:id,name,lrn,gender')
            ->where('section_id', $section->id)
            ->where('status', EnrollmentStatus::APPROVED)
            ->get()
            ->sortBy('student.name')
            ->values();

        $matchedCount = 0;
        $parsedRows = [];

        foreach ($enrolledStudents as $enrollment) {
            $studentLrn = preg_replace('/\D/', '', (string) ($enrollment->student->lrn ?? ''));
            $studentNameKey = $this->normalizeStudentName((string) ($enrollment->student->name ?? ''));

            $match = null;
            if ($studentLrn !== '' && isset($byLrn[$studentLrn])) {
                $match = $byLrn[$studentLrn];
            } elseif ($studentNameKey !== '' && isset($byName[$studentNameKey])) {
                $match = $byName[$studentNameKey];
            }

            if ($match !== null) {
                $matchedCount++;
                $finalGrade = DepEdGradingService::computeFinalGrade($match['q1'], $match['q2'], $match['q3'], $match['q4']);
                $remarks = DepEdGradingService::getRemarks($finalGrade);

                $parsedRows[] = [
                    'student_id'  => $enrollment->student_id,
                    'q1'          => $match['q1'],
                    'q2'          => $match['q2'],
                    'q3'          => $match['q3'],
                    'q4'          => $match['q4'],
                    'final_grade' => $finalGrade,
                    'remarks'     => $remarks,
                ];
            }
        }

        return response()->json([
            'matchedCount' => $matchedCount,
            'totalEnrolled' => $enrolledStudents->count(),
            'rows'         => $parsedRows,
        ]);
    }

    /**
     * 📋 Class Adviser Portal: Overview of Advisory Sections & Grade Submissions
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

        // Build per-section subject grading progress for the Adviser
        $sectionsData = $advisorySections->map(function ($section) use ($activeYear) {
            $gradesBySubject = Grade::where('section_id', $section->id)
                ->when($activeYear, fn ($q) => $q->where('academic_year_id', $activeYear->id))
                ->get()
                ->groupBy('subject_id');

            $subjects = $section->sectionSubjects->map(function ($secSub) use ($gradesBySubject, $section) {
                $subjectGrades = $gradesBySubject->get($secSub->subject_id, collect());
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
     * 🚀 Forward all SUBMITTED_TO_ADVISER subjects in an advisory section to the Registrar
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
     * Extract rows from a modern .xlsx archive using native PHP ZipArchive + SimpleXMLElement
     */
    private function extractXlsxRows(string $filePath): array
    {
        if (!class_exists(\ZipArchive::class)) {
            return [];
        }

        $zip = new \ZipArchive();
        if ($zip->open($filePath) !== true) {
            return [];
        }

        // 1. Read shared strings table if present
        $sharedStrings = [];
        if (($stringsXml = $zip->getFromName('xl/sharedStrings.xml')) !== false) {
            $sx = @simplexml_load_string($stringsXml);
            if ($sx && isset($sx->si)) {
                foreach ($sx->si as $si) {
                    if (isset($si->t)) {
                        $sharedStrings[] = (string) $si->t;
                    } elseif (isset($si->r)) {
                        $text = '';
                        foreach ($si->r as $run) {
                            $text .= (string) $run->t;
                        }
                        $sharedStrings[] = $text;
                    } else {
                        $sharedStrings[] = '';
                    }
                }
            }
        }

        // 2. Read first worksheet
        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        $zip->close();

        if ($sheetXml === false) {
            return [];
        }

        $worksheet = @simplexml_load_string($sheetXml);
        if (!$worksheet || !isset($worksheet->sheetData->row)) {
            return [];
        }

        $rows = [];
        foreach ($worksheet->sheetData->row as $row) {
            $rowCells = [];
            foreach ($row->c as $cell) {
                $cellRef = (string) $cell['r']; // e.g. A1, B1, C1
                $colLetters = preg_replace('/\d+/', '', $cellRef);
                $colIndex = $this->columnLettersToIndex($colLetters);

                $type = (string) $cell['t'];
                $value = '';

                if ($type === 's') {
                    $idx = (int) $cell->v;
                    $value = $sharedStrings[$idx] ?? '';
                } elseif ($type === 'inlineStr') {
                    $value = (string) ($cell->is->t ?? '');
                } else {
                    $value = isset($cell->v) ? (string) $cell->v : '';
                }

                $rowCells[$colIndex] = trim($value);
            }

            if (!empty($rowCells)) {
                $maxCol = max(array_keys($rowCells));
                $normalizedRow = [];
                for ($c = 0; $c <= $maxCol; $c++) {
                    $normalizedRow[$c] = $rowCells[$c] ?? '';
                }
                $rows[] = $normalizedRow;
            }
        }

        return $rows;
    }

    /**
     * Extract rows from a CSV / TSV file
     */
    private function extractDelimitedRows(string $filePath): array
    {
        $rows = [];
        $handle = fopen($filePath, 'r');
        if ($handle === false) {
            return [];
        }

        $firstLine = fgets($handle);
        if ($firstLine === false) {
            fclose($handle);
            return [];
        }

        // Strip UTF-8 BOM if present
        $firstLine = preg_replace('/^\xEF\xBB\xBF/', '', $firstLine);
        $delimiter = substr_count($firstLine, "\t") > substr_count($firstLine, ',') ? "\t" : ',';

        rewind($handle);
        $isFirst = true;
        while (($data = fgetcsv($handle, 0, $delimiter)) !== false) {
            if ($isFirst && isset($data[0])) {
                $data[0] = preg_replace('/^\xEF\xBB\xBF/', '', (string) $data[0]);
                $isFirst = false;
            }
            $rows[] = array_map(fn ($v) => trim((string) $v), $data);
        }

        fclose($handle);
        return $rows;
    }

    /**
     * Convert Excel column letters (A, B, C ... Z, AA) to 0-based index
     */
    private function columnLettersToIndex(string $letters): int
    {
        $letters = strtoupper($letters);
        $index = 0;
        $len = strlen($letters);
        for ($i = 0; $i < $len; $i++) {
            $index = $index * 26 + (ord($letters[$i]) - ord('A') + 1);
        }
        return max(0, $index - 1);
    }

    /**
     * Normalize student name for reliable matching (strips punctuation, extra spaces, and case)
     */
    private function normalizeStudentName(string $name): string
    {
        $clean = strtolower(preg_replace('/[^a-zA-Z\s]/', ' ', $name));
        $parts = array_values(array_filter(explode(' ', $clean)));
        sort($parts);
        return implode(' ', $parts);
    }

    /**
     * Convert cell text/number to a valid DepEd quarterly grade float (50 - 100) or null
     */
    private function parseGradeNumber(mixed $val): ?float
    {
        if ($val === null || $val === '') {
            return null;
        }
        $clean = preg_replace('/[^0-9.]/', '', (string) $val);
        if ($clean === '' || !is_numeric($clean)) {
            return null;
        }
        $num = round((float) $clean, 2);
        if ($num < 50 || $num > 100) {
            return null;
        }
        return $num;
    }
}

