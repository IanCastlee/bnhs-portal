<?php

namespace App\Modules\Enrollment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Enrollment\Models\Enrollment;
use App\Modules\Enrollment\Enums\EnrollmentStatus;
use App\Modules\Academic\Models\AcademicYear;
use App\Modules\Academic\Models\GradeLevel;
use App\Modules\Academic\Models\Section;
use App\Modules\Identity\Enums\UserRole;
use App\Modules\Identity\Models\AuditLog;
use App\Modules\Identity\Models\User;
use App\Notifications\StudentSectionAssignedNotification;
use App\Notifications\TeacherAdviserAssignedNotification;
use App\Notifications\SectionAdviserUpdatedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

/**
 * Registrar Sectioning Controller
 * Manages post-enrollment section creation and automated/manual student distribution.
 */
class RegistrarSectioningController extends Controller
{
    /**
     * Verify that the registrar is assigned to the requested grade level.
     */
    private function authorizeGradeLevel(int $gradeLevelId): void
    {
        $user = Auth::user();
        if ($user && $user->isRegistrar()) {
            $assignedIds = $user->assignedGradeLevels()->pluck('grade_levels.id')->toArray();
            if (!empty($assignedIds) && !in_array($gradeLevelId, $assignedIds)) {
                abort(403, 'Hindi ka awtorisadong mag-section sa Grade Level na ito.');
            }
        }
    }

    /**
     * Display the Sectioning Dashboard for the Registrar's assigned Grade Levels.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $activeYear = AcademicYear::where('is_active', true)->first();

        // Get assigned grade levels (or all if admin)
        $assignedGradeLevels = $user->isRegistrar() && $user->assignedGradeLevels()->exists()
            ? $user->assignedGradeLevels()->orderBy('level')->get()
            : GradeLevel::orderBy('level')->get();

        $selectedGradeLevelId = $request->query('grade_level_id', $assignedGradeLevels->first()?->id);
        if ($selectedGradeLevelId) {
            $this->authorizeGradeLevel((int) $selectedGradeLevelId);
        }

        $selectedGradeLevel = $assignedGradeLevels->firstWhere('id', (int) $selectedGradeLevelId)
            ?? $assignedGradeLevels->first();

        // Fetch sections for the selected grade level and active academic year
        $sections = [];
        $unsectionedStudents = [];

        if ($selectedGradeLevel && $activeYear) {
            $sections = Section::with(['adviser:id,name,email'])
                ->where('grade_level_id', $selectedGradeLevel->id)
                ->where('academic_year_id', $activeYear->id)
                ->withCount(['enrollments as enrolled_count' => function ($q) {
                    $q->where('status', EnrollmentStatus::APPROVED);
                }])
                ->with(['enrollments' => function ($q) {
                    $q->where('status', EnrollmentStatus::APPROVED)
                        ->with('student:id,name,email,lrn,avatar_path')
                        ->orderBy('gender')
                        ->orderBy('student_id');
                }])
                ->orderBy('name')
                ->get();

            // Fetch approved students without a section
            $unsectionedStudents = Enrollment::with('student:id,name,email,lrn,avatar_path')
                ->where('academic_year_id', $activeYear->id)
                ->where('grade_level_id', $selectedGradeLevel->id)
                ->where('status', EnrollmentStatus::APPROVED)
                ->whereNull('section_id')
                ->orderByDesc('general_average')
                ->get();
        }

        // Fetch all active faculty teachers with their current advisory section for the active school year
        $teachers = User::where('role', UserRole::TEACHER)
            ->where('is_active', true)
            ->with(['advisedSections' => function ($q) use ($activeYear) {
                if ($activeYear) {
                    $q->where('academic_year_id', $activeYear->id);
                }
                $q->select('id', 'name', 'grade_level_id', 'adviser_id', 'academic_year_id')
                  ->with('gradeLevel:id,level,name');
            }])
            ->select('id', 'name', 'email', 'employee_id')
            ->orderBy('name')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'email' => $t->email,
                'employee_id' => $t->employee_id,
                'current_advisory' => $t->advisedSections->first() ? [
                    'section_id' => $t->advisedSections->first()->id,
                    'section_name' => $t->advisedSections->first()->name,
                    'grade_name' => $t->advisedSections->first()->gradeLevel?->name ?? 'Grade',
                ] : null,
            ]);

        return Inertia::render('Registrar/Sectioning', [
            'assignedGradeLevels' => $assignedGradeLevels,
            'selectedGradeLevelId' => (int) ($selectedGradeLevel?->id ?? 0),
            'selectedGradeLevel' => $selectedGradeLevel,
            'activeSchoolYear' => $activeYear,
            'sections' => $sections,
            'unsectionedStudents' => $unsectionedStudents,
            'teachers' => $teachers,
        ]);
    }

    /**
     * Create a new Section for the assigned Grade Level.
     */
    public function createSection(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'grade_level_id' => ['required', 'exists:grade_levels,id'],
            'name'           => ['required', 'string', 'max:100'],
            'capacity'       => ['required', 'integer', 'min:10', 'max:70'],
            'adviser_id'     => ['nullable', 'exists:users,id'],
        ]);

        $this->authorizeGradeLevel((int) $validated['grade_level_id']);

        $activeYear = AcademicYear::where('is_active', true)->firstOrFail();

        // Check if section name already exists for this grade & academic year
        $exists = Section::where('academic_year_id', $activeYear->id)
            ->where('grade_level_id', $validated['grade_level_id'])
            ->where('name', trim($validated['name']))
            ->exists();

        if ($exists) {
            return back()->withErrors(['name' => "Mayroon nang Section na nagngangalang '{$validated['name']}' sa Grade Level na ito."]);
        }

        $adviserId = $validated['adviser_id'] ?? null;
        if ($adviserId) {
            $isTeacher = User::where('id', $adviserId)
                ->where('role', UserRole::TEACHER)
                ->where('is_active', true)
                ->exists();
            if (!$isTeacher) {
                return back()->withErrors(['adviser_id' => 'Ang napiling adviser ay dapat isang aktibong faculty teacher.']);
            }

            // Unassign this teacher from any other section in the active academic year
            Section::where('academic_year_id', $activeYear->id)
                ->where('adviser_id', $adviserId)
                ->update(['adviser_id' => null]);
        }

        $section = Section::create([
            'academic_year_id' => $activeYear->id,
            'grade_level_id'   => $validated['grade_level_id'],
            'name'             => trim($validated['name']),
            'capacity'         => $validated['capacity'],
            'adviser_id'       => $adviserId,
        ]);

        AuditLog::record(
            'SECTION_CREATED',
            "Created new section '{$section->name}' (Capacity: {$section->capacity}) for Grade Level ID {$section->grade_level_id}" . ($adviserId ? " with Adviser ID {$adviserId}" : ""),
            $section,
            ['section_name' => $section->name, 'capacity' => $section->capacity, 'adviser_id' => $adviserId],
            'SECTION'
        );

        if ($adviserId) {
            $assignedTeacher = User::find($adviserId);
            if ($assignedTeacher) {
                $assignedTeacher->notify(new TeacherAdviserAssignedNotification(
                    $section->load(['gradeLevel', 'academicYear']),
                    $assignedTeacher,
                    $activeYear
                ));
            }
        }

        return back()->with('success', "Matagumpay na nagawa ang Section {$section->name}!");
    }

    /**
     * Assign or unassign a faculty teacher as Class Adviser for a Section.
     */
    public function assignAdviser(Request $request, Section $section): RedirectResponse
    {
        $this->authorizeGradeLevel((int) $section->grade_level_id);

        $validated = $request->validate([
            'adviser_id' => ['nullable', 'exists:users,id'],
        ]);

        $adviserId = $validated['adviser_id'] ?? null;
        $teacher = null;

        if ($adviserId) {
            $teacher = User::where('id', $adviserId)
                ->where('role', UserRole::TEACHER)
                ->where('is_active', true)
                ->first();

            if (!$teacher) {
                return back()->withErrors(['adviser_id' => 'Ang napiling adviser ay dapat isang aktibong faculty teacher.']);
            }

            // Unassign this teacher from any other section in this academic year
            Section::where('academic_year_id', $section->academic_year_id)
                ->where('id', '!=', $section->id)
                ->where('adviser_id', $adviserId)
                ->update(['adviser_id' => null]);
        }

        $oldAdviserId = $section->adviser_id;
        $section->update([
            'adviser_id' => $adviserId,
        ]);

        $actionDesc = $teacher
            ? "Assigned {$teacher->name} as Class Adviser for Section {$section->name}"
            : "Removed Class Adviser from Section {$section->name}";

        AuditLog::record(
            'SECTION_ADVISER_ASSIGNED',
            $actionDesc,
            $section,
            ['section_id' => $section->id, 'adviser_id' => $adviserId, 'old_adviser_id' => $oldAdviserId],
            'SECTION'
        );

        if ($teacher) {
            // 1. Dispatch queued notification to the newly designated teacher
            $teacher->notify(new TeacherAdviserAssignedNotification(
                $section->fresh(['gradeLevel', 'academicYear']),
                $teacher,
                $section->academicYear
            ));

            // 2. Dispatch queued update notification to all currently enrolled students in this section
            $enrolledStudents = Enrollment::with('student')
                ->where('section_id', $section->id)
                ->where('status', EnrollmentStatus::APPROVED)
                ->get();

            foreach ($enrolledStudents as $enr) {
                $enr->student?->notify(new SectionAdviserUpdatedNotification(
                    $section->fresh(['gradeLevel', 'academicYear']),
                    $teacher
                ));
            }
        }

        $msg = $teacher
            ? "Matagumpay na na-assign si {$teacher->name} bilang Class Adviser ng Section {$section->name}."
            : "Naalis ang Class Adviser ng Section {$section->name}.";

        return back()->with('success', $msg);
    }

    /**
     * Auto-distribute unassigned students across selected sections using a specified strategy.
     */
    public function autoDistribute(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'grade_level_id' => ['required', 'exists:grade_levels,id'],
            'section_ids'    => ['required', 'array', 'min:2'],
            'section_ids.*'  => ['exists:sections,id'],
            'strategy'       => ['required', 'string', 'in:heterogeneous_balanced,academic_snake,academic_star,alphabetical'],
        ]);

        $this->authorizeGradeLevel((int) $validated['grade_level_id']);

        $activeYear = AcademicYear::where('is_active', true)->firstOrFail();
        $strategy = $validated['strategy'];
        $sectionIds = $validated['section_ids'];

        DB::transaction(function () use ($validated, $activeYear, $strategy, $sectionIds) {
            // Lock target sections
            $sections = Section::whereIn('id', $sectionIds)
                ->where('grade_level_id', $validated['grade_level_id'])
                ->where('academic_year_id', $activeYear->id)
                ->lockForUpdate()
                ->get()
                ->values();

            if ($sections->count() < 2) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'section_ids' => 'Kailangang pumili ng hindi bababa sa dalawang (2) sections para sa automated distribution.',
                ]);
            }

            // Lock all unsectioned approved students in this grade level
            $students = Enrollment::with('student')
                ->where('academic_year_id', $activeYear->id)
                ->where('grade_level_id', $validated['grade_level_id'])
                ->where('status', EnrollmentStatus::APPROVED)
                ->whereNull('section_id')
                ->lockForUpdate()
                ->get();

            if ($students->isEmpty()) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'section_ids' => 'Walang unassigned na estudyante para sa Grade Level na ito.',
                ]);
            }

            $numSections = $sections->count();
            $distribution = array_fill(0, $numSections, []);

            // 🧠 ALGORITHM 1: Heterogeneous Balanced (Equal Gender & Count Distribution)
            if ($strategy === 'heterogeneous_balanced') {
                $males = $students->filter(fn ($s) => strtoupper($s->gender ?? '') === 'MALE')->shuffle()->values();
                $females = $students->filter(fn ($s) => strtoupper($s->gender ?? '') === 'FEMALE')->shuffle()->values();
                $others = $students->filter(fn ($s) => !in_array(strtoupper($s->gender ?? ''), ['MALE', 'FEMALE']))->shuffle()->values();

                // Round robin distribute males
                $secIdx = 0;
                foreach ($males as $st) {
                    $distribution[$secIdx][] = $st;
                    $secIdx = ($secIdx + 1) % $numSections;
                }

                // Round robin distribute females
                foreach ($females as $st) {
                    $distribution[$secIdx][] = $st;
                    $secIdx = ($secIdx + 1) % $numSections;
                }

                // Distribute remainder
                foreach ($others as $st) {
                    $distribution[$secIdx][] = $st;
                    $secIdx = ($secIdx + 1) % $numSections;
                }
            }

            // 🧠 ALGORITHM 2: Academic Snake (Zig-zag distribution by General Average)
            // Balances high, mid, and low academic performers equally across all sections
            elseif ($strategy === 'academic_snake') {
                $sorted = $students->sortByDesc(fn ($s) => $s->general_average ?? 75)->values();

                $direction = 1; // 1 = Left to Right (0 -> N-1), -1 = Right to Left (N-1 -> 0)
                $secIdx = 0;

                foreach ($sorted as $st) {
                    $distribution[$secIdx][] = $st;
                    $nextIdx = $secIdx + $direction;

                    if ($nextIdx >= $numSections) {
                        $direction = -1;
                        $secIdx = $numSections - 1;
                    } elseif ($nextIdx < 0) {
                        $direction = 1;
                        $secIdx = 0;
                    } else {
                        $secIdx = $nextIdx;
                    }
                }
            }

            // 🧠 ALGORITHM 3: Academic Rank (Star / Top Performing Section 1, Remaining distributed equally)
            elseif ($strategy === 'academic_star') {
                $sorted = $students->sortByDesc(fn ($s) => $s->general_average ?? 75)->values();
                $firstSectionCap = min($sections[0]->capacity, (int) ceil($students->count() / $numSections));

                $starStudents = $sorted->take($firstSectionCap);
                $remaining = $sorted->skip($firstSectionCap)->values();

                // Section 0 gets Star section
                foreach ($starStudents as $st) {
                    $distribution[0][] = $st;
                }

                // Distribute remaining evenly among other sections (1 to N-1)
                $otherCount = $numSections - 1;
                if ($otherCount > 0) {
                    $secIdx = 1;
                    foreach ($remaining as $st) {
                        $distribution[$secIdx][] = $st;
                        $secIdx = 1 + (($secIdx) % $otherCount);
                    }
                } else {
                    foreach ($remaining as $st) {
                        $distribution[0][] = $st;
                    }
                }
            }

            // 🧠 ALGORITHM 4: Alphabetical Distribution (A-Z)
            elseif ($strategy === 'alphabetical') {
                $sorted = $students->sortBy(fn ($s) => $s->student?->name ?? '')->values();
                $secIdx = 0;
                foreach ($sorted as $st) {
                    $distribution[$secIdx][] = $st;
                    $secIdx = ($secIdx + 1) % $numSections;
                }
            }

            // 💾 Commit assignments to database
            $totalAssigned = 0;
            for ($i = 0; $i < $numSections; $i++) {
                $targetSection = $sections[$i]->fresh(['adviser', 'gradeLevel', 'academicYear']);
                $studentsForThisSection = $distribution[$i];

                foreach ($studentsForThisSection as $enrollment) {
                    $enrollment->update(['section_id' => $targetSection->id]);
                    $totalAssigned++;

                    // Dispatch queued notification to student
                    $enrollment->student?->notify(new StudentSectionAssignedNotification(
                        $enrollment->fresh(['gradeLevel', 'academicYear']),
                        $targetSection
                    ));
                }
            }

            AuditLog::record(
                'STUDENTS_AUTO_SECTIONED',
                "Auto-distributed {$totalAssigned} students into {$numSections} sections using '{$strategy}' strategy.",
                $sections->first(),
                [
                    'strategy' => $strategy,
                    'total_students' => $totalAssigned,
                    'sections' => $sections->pluck('name')->toArray(),
                ],
                'SECTION'
            );
        });

        return back()->with('success', "Matagumpay na nahati at nai-assign ang mga estudyante gamit ang piniling strategy!");
    }

    /**
     * Manually assign or move a student to a specific section.
     */
    public function assignSingle(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'enrollment_id' => ['required', 'exists:enrollments,id'],
            'section_id'    => ['required', 'exists:sections,id'],
        ]);

        $enrollment = Enrollment::findOrFail($validated['enrollment_id']);
        $this->authorizeGradeLevel($enrollment->grade_level_id);

        DB::transaction(function () use ($enrollment, $validated) {
            $lockedEnrollment = Enrollment::where('id', $enrollment->id)->lockForUpdate()->firstOrFail();
            $section = Section::where('id', $validated['section_id'])->lockForUpdate()->firstOrFail();

            if ($section->grade_level_id !== $lockedEnrollment->grade_level_id) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'section_id' => 'Hindi tugma ang Grade Level ng Section sa Grade Level ng estudyante.',
                ]);
            }

            if ($section->capacity > 0) {
                $currentCount = Enrollment::where('section_id', $section->id)
                    ->where('status', EnrollmentStatus::APPROVED)
                    ->where('id', '!=', $lockedEnrollment->id)
                    ->count();

                if ($currentCount >= $section->capacity) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'section_id' => "Puno na ang Section {$section->name} ({$section->capacity}/{$section->capacity} students).",
                    ]);
                }
            }

            $lockedEnrollment->update(['section_id' => $section->id]);

            AuditLog::record(
                'STUDENT_MANUAL_SECTIONED',
                "Manually assigned {$lockedEnrollment->student?->name} (LRN: {$lockedEnrollment->student?->lrn}) to Section {$section->name}",
                $lockedEnrollment,
                ['section' => $section->name, 'student' => $lockedEnrollment->student?->name],
                'SECTION'
            );

            // Dispatch queued notification to student
            $lockedEnrollment->student?->notify(new StudentSectionAssignedNotification(
                $lockedEnrollment->fresh(['gradeLevel', 'academicYear']),
                $section->fresh(['adviser', 'gradeLevel', 'academicYear'])
            ));
        });

        return back()->with('success', "Matagumpay na nai-assign ang estudyante sa Section!");
    }

    /**
     * Reset sectioning for a section or unassign all students in a grade level.
     */
    public function reset(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'grade_level_id' => ['required', 'exists:grade_levels,id'],
            'section_id'     => ['nullable', 'exists:sections,id'],
        ]);

        $this->authorizeGradeLevel((int) $validated['grade_level_id']);
        $activeYear = AcademicYear::where('is_active', true)->firstOrFail();

        DB::transaction(function () use ($validated, $activeYear) {
            $query = Enrollment::where('academic_year_id', $activeYear->id)
                ->where('grade_level_id', $validated['grade_level_id'])
                ->where('status', EnrollmentStatus::APPROVED);

            if (!empty($validated['section_id'])) {
                $query->where('section_id', $validated['section_id']);
            } else {
                $query->whereNotNull('section_id');
            }

            $count = $query->count();
            $query->update(['section_id' => null]);

            AuditLog::record(
                'SECTIONING_RESET',
                "Reset sectioning for {$count} students in Grade Level ID {$validated['grade_level_id']}",
                null,
                ['reset_count' => $count],
                'SECTION'
            );
        });

        return back()->with('success', "Matagumpay na na-reset ang section assignments.");
    }

    /**
     * Delete an empty section or return students to pool and delete the section.
     */
    public function deleteSection(Section $section): RedirectResponse
    {
        $this->authorizeGradeLevel((int) $section->grade_level_id);

        $sectionName = $section->name;
        $gradeLevelId = $section->grade_level_id;

        DB::transaction(function () use ($section, $sectionName, $gradeLevelId) {
            // 1. Unassign any enrolled students from this section back to unassigned pool
            $unassignedCount = Enrollment::where('section_id', $section->id)->update([
                'section_id' => null,
            ]);

            // 2. Delete the section
            $section->delete();

            // 3. Audit trail
            AuditLog::record(
                'SECTION_DELETED',
                "Deleted section '{$sectionName}' in Grade Level ID {$gradeLevelId}. {$unassignedCount} students returned to unassigned pool.",
                null,
                ['section_name' => $sectionName, 'returned_students' => $unassignedCount],
                'SECTION'
            );
        });

        return back()->with('success', "Matagumpay na tinanggal ang Section {$sectionName}.");
    }
}
