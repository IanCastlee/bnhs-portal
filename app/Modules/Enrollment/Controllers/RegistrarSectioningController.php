<?php

namespace App\Modules\Enrollment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Academic\Models\AcademicYear;
use App\Modules\Academic\Models\GradeLevel;
use App\Modules\Academic\Models\Section;
use App\Modules\Enrollment\Enums\EnrollmentStatus;
use App\Modules\Enrollment\Models\Enrollment;
use App\Modules\Enrollment\Traits\AuthorizesGradeLevel;
use App\Modules\Identity\Enums\UserRole;
use App\Modules\Identity\Models\AuditLog;
use App\Modules\Identity\Models\User;
use App\Notifications\TeacherAdviserAssignedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Registrar Sectioning Controller
 * Manages the Sectioning Dashboard and Section CRUD operations.
 */
class RegistrarSectioningController extends Controller
{
    use AuthorizesGradeLevel;

    /**
     * Display the Sectioning Dashboard for the Registrar's assigned Grade Levels.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $activeYear = AcademicYear::getCachedActive();

        if ($request->has('academic_year_id')) {
            $academicYearId = $request->query('academic_year_id');
            session(['registrar_academic_year_id' => $academicYearId]);
        } else {
            $academicYearId = session('registrar_academic_year_id', $activeYear?->id);
        }

        $selectedYear = $academicYearId ? (AcademicYear::find($academicYearId) ?? $activeYear) : $activeYear;

        // Get assigned grade levels (single query execution)
        $assignedGradeLevels = ($user->isRegistrar() && $user->assignedGradeLevels()->exists())
            ? $user->assignedGradeLevels()->orderBy('level')->get()
            : GradeLevel::orderBy('level')->get();

        $selectedGradeLevelId = $request->query('grade_level_id', $assignedGradeLevels->first()?->id);
        if ($selectedGradeLevelId) {
            $this->authorizeGradeLevel((int) $selectedGradeLevelId);
        }

        $selectedGradeLevel = $assignedGradeLevels->firstWhere('id', (int) $selectedGradeLevelId)
            ?? $assignedGradeLevels->first();

        $sections = [];
        $unsectionedStudents = [];

        if ($selectedGradeLevel && $selectedYear) {
            $sections = Section::with(['adviser:id,name,email'])
                ->where('grade_level_id', $selectedGradeLevel->id)
                ->where('academic_year_id', $selectedYear->id)
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
                ->where('academic_year_id', $selectedYear->id)
                ->where('grade_level_id', $selectedGradeLevel->id)
                ->where('status', EnrollmentStatus::APPROVED)
                ->whereNull('section_id')
                ->orderByDesc('general_average')
                ->get();
        }

        // Fetch all active faculty teachers with their current advisory section
        $teachers = User::where('role', UserRole::TEACHER)
            ->where('is_active', true)
            ->with(['advisedSections' => function ($q) use ($selectedYear) {
                if ($selectedYear) {
                    $q->where('academic_year_id', $selectedYear->id);
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
            'activeSchoolYear' => $selectedYear ?? $activeYear,
            'officialActiveSchoolYear' => $activeYear,
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
            'capacity'       => ['required', 'integer', 'min:1', 'max:150'],
            'adviser_id'     => ['nullable', 'exists:users,id'],
        ]);

        $this->authorizeGradeLevel((int) $validated['grade_level_id']);

        $selectedYearId = session('registrar_academic_year_id');
        $academicYear = ($selectedYearId ? AcademicYear::find($selectedYearId) : null)
            ?? AcademicYear::getCachedActive()
            ?? AcademicYear::where('is_active', true)->firstOrFail();

        // Check duplicate section name in grade & academic year
        $exists = Section::where('academic_year_id', $academicYear->id)
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
        }

        $section = DB::transaction(function () use ($validated, $academicYear, $adviserId) {
            if ($adviserId) {
                // Unassign teacher from any other section in the target year
                Section::where('academic_year_id', $academicYear->id)
                    ->where('adviser_id', $adviserId)
                    ->update(['adviser_id' => null]);
            }

            $created = Section::create([
                'academic_year_id' => $academicYear->id,
                'grade_level_id'   => $validated['grade_level_id'],
                'name'             => trim($validated['name']),
                'capacity'         => $validated['capacity'],
                'adviser_id'       => $adviserId,
            ]);

            AuditLog::record(
                'SECTION_CREATED',
                "Created new section '{$created->name}' (Capacity: {$created->capacity}) for Grade Level ID {$created->grade_level_id}" . ($adviserId ? " with Adviser ID {$adviserId}" : ""),
                $created,
                ['section_name' => $created->name, 'capacity' => $created->capacity, 'adviser_id' => $adviserId],
                'SECTION'
            );

            return $created;
        });

        if ($adviserId) {
            $assignedTeacher = User::find($adviserId);
            if ($assignedTeacher) {
                $assignedTeacher->notify(new TeacherAdviserAssignedNotification(
                    $section->load(['gradeLevel', 'academicYear']),
                    $assignedTeacher,
                    $academicYear
                ));
            }
        }

        return back()->with('success', "Matagumpay na nagawa ang Section {$section->name}!");
    }

    /**
     * Update an existing Section's details (Name, Capacity, Adviser).
     */
    public function updateSection(Request $request, Section $section): RedirectResponse
    {
        $this->authorizeGradeLevel((int) $section->grade_level_id);

        $validated = $request->validate([
            'name'       => ['required', 'string', 'max:100'],
            'capacity'   => ['required', 'integer', 'min:1', 'max:150'],
            'adviser_id' => ['nullable', 'exists:users,id'],
        ]);

        $newName = trim($validated['name']);
        $newCapacity = (int) $validated['capacity'];
        $newAdviserId = $validated['adviser_id'] ?? null;

        // Check if name changed and if new name already exists in same grade and school year
        if (strcasecmp($section->name, $newName) !== 0) {
            $exists = Section::where('academic_year_id', $section->academic_year_id)
                ->where('grade_level_id', $section->grade_level_id)
                ->where('id', '!=', $section->id)
                ->where('name', $newName)
                ->exists();

            if ($exists) {
                return back()->withErrors(['name' => "Mayroon nang Section na nagngangalang '{$newName}' sa Grade Level na ito."]);
            }
        }

        // Validate adviser if selected
        if ($newAdviserId) {
            $isTeacher = User::where('id', $newAdviserId)
                ->where('role', UserRole::TEACHER)
                ->where('is_active', true)
                ->exists();

            if (!$isTeacher) {
                return back()->withErrors(['adviser_id' => 'Ang napiling adviser ay dapat isang aktibong faculty teacher.']);
            }
        }

        // Safety check on capacity: cannot be lower than current enrolled count
        $currentEnrollees = $section->enrollments()->where('status', EnrollmentStatus::APPROVED)->count();
        if ($newCapacity < $currentEnrollees) {
            return back()->withErrors([
                'capacity' => "Hindi maaaring gawing {$newCapacity} ang capacity dahil mayroon nang {$currentEnrollees} estudyanteng kasalukuyang naka-enroll sa Section na ito."
            ]);
        }

        $oldName = $section->name;
        $oldAdviserId = $section->adviser_id;

        DB::transaction(function () use ($section, $oldName, $newName, $newCapacity, $newAdviserId, $oldAdviserId) {
            if ($newAdviserId && $newAdviserId !== $oldAdviserId) {
                // If this teacher is currently adviser of another section in the same academic year, unassign them first
                Section::where('academic_year_id', $section->academic_year_id)
                    ->where('id', '!=', $section->id)
                    ->where('adviser_id', $newAdviserId)
                    ->update(['adviser_id' => null]);
            }

            $section->update([
                'name'       => $newName,
                'capacity'   => $newCapacity,
                'adviser_id' => $newAdviserId,
            ]);

            AuditLog::record(
                'SECTION_UPDATED',
                "Updated section '{$oldName}' to '{$newName}' (Capacity: {$newCapacity})" . ($newAdviserId ? " with Adviser ID {$newAdviserId}" : ""),
                $section,
                [
                    'old_name'   => $oldName,
                    'new_name'   => $newName,
                    'capacity'   => $newCapacity,
                    'adviser_id' => $newAdviserId,
                ],
                'SECTION'
            );
        });

        // Notify teacher if a new adviser was assigned
        if ($newAdviserId && $newAdviserId !== $oldAdviserId) {
            $assignedTeacher = User::find($newAdviserId);
            if ($assignedTeacher) {
                $assignedTeacher->notify(new TeacherAdviserAssignedNotification(
                    $section->fresh(['gradeLevel', 'academicYear']),
                    $assignedTeacher,
                    $section->academicYear
                ));
            }
        }

        return back()->with('success', "Matagumpay na na-update ang mga detalye ng Section {$section->name}!");
    }

    /**
     * Delete an empty section or return students to pool and delete the section.
     */
    public function deleteSection(Section $section): RedirectResponse
    {
        $this->authorizeGradeLevel((int) $section->grade_level_id);

        // Safety Guard: Check if section has assigned subjects or recorded grades
        if ($section->sectionSubjects()->exists()) {
            return back()->with('error', "Hindi maaaring burahin ang Section {$section->name} dahil mayroon na itong mga nakatalagang subject at teaching loads. Alisin muna ang mga subject bago burahin.");
        }

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
