<?php

namespace App\Modules\Enrollment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Academic\Models\AcademicYear;
use App\Modules\Academic\Models\Section;
use App\Modules\Enrollment\Enums\EnrollmentStatus;
use App\Modules\Enrollment\Models\Enrollment;
use App\Modules\Enrollment\Traits\AuthorizesGradeLevel;
use App\Modules\Identity\Models\AuditLog;
use App\Notifications\StudentSectionAssignedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SectionDistributionController extends Controller
{
    use AuthorizesGradeLevel;

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

        // Academic Year: prioritize current session selection, fallback to active
        $selectedYearId = session('registrar_academic_year_id');
        $academicYear = ($selectedYearId ? AcademicYear::find($selectedYearId) : null)
            ?? AcademicYear::getCachedActive()
            ?? AcademicYear::where('is_active', true)->firstOrFail();

        $strategy = $validated['strategy'];
        $sectionIds = $validated['section_ids'];

        $notifiableStudents = [];

        DB::transaction(function () use ($validated, $academicYear, $strategy, $sectionIds, &$notifiableStudents) {
            // Lock target sections
            $sections = Section::whereIn('id', $sectionIds)
                ->where('grade_level_id', $validated['grade_level_id'])
                ->where('academic_year_id', $academicYear->id)
                ->with(['adviser', 'gradeLevel', 'academicYear'])
                ->lockForUpdate()
                ->get()
                ->values();

            if ($sections->count() < 2) {
                throw ValidationException::withMessages([
                    'section_ids' => 'Kailangang pumili ng hindi bababa sa dalawang (2) sections para sa automated distribution.',
                ]);
            }

            // Lock all unsectioned approved students in this grade level
            $students = Enrollment::with(['student', 'gradeLevel', 'academicYear'])
                ->where('academic_year_id', $academicYear->id)
                ->where('grade_level_id', $validated['grade_level_id'])
                ->where('status', EnrollmentStatus::APPROVED)
                ->whereNull('section_id')
                ->lockForUpdate()
                ->get();

            if ($students->isEmpty()) {
                throw ValidationException::withMessages([
                    'section_ids' => 'Walang unassigned na estudyante para sa Grade Level na ito.',
                ]);
            }

            $numSections = $sections->count();
            $distribution = array_fill(0, $numSections, []);

            // 1. ALGORITHM: Heterogeneous Balanced
            if ($strategy === 'heterogeneous_balanced') {
                $males = $students->filter(fn ($s) => strtoupper($s->gender ?? '') === 'MALE')->shuffle()->values();
                $females = $students->filter(fn ($s) => strtoupper($s->gender ?? '') === 'FEMALE')->shuffle()->values();
                $others = $students->filter(fn ($s) => !in_array(strtoupper($s->gender ?? ''), ['MALE', 'FEMALE']))->shuffle()->values();

                $secIdx = 0;
                foreach ($males as $st) {
                    $distribution[$secIdx][] = $st;
                    $secIdx = ($secIdx + 1) % $numSections;
                }
                foreach ($females as $st) {
                    $distribution[$secIdx][] = $st;
                    $secIdx = ($secIdx + 1) % $numSections;
                }
                foreach ($others as $st) {
                    $distribution[$secIdx][] = $st;
                    $secIdx = ($secIdx + 1) % $numSections;
                }
            }
            // 2. ALGORITHM: Academic Snake (Snake draft distribution by GWA)
            elseif ($strategy === 'academic_snake') {
                $sorted = $students->sortByDesc(fn ($s) => $s->general_average ?? 75)->values();
                $secIdx = 0;
                $direction = 1;

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
            // 3. ALGORITHM: Academic Star (Section 0 is Top / Star section)
            elseif ($strategy === 'academic_star') {
                $sorted = $students->sortByDesc(fn ($s) => $s->general_average ?? 75)->values();
                $firstSectionCap = min($sections[0]->capacity ?: 45, (int) ceil($students->count() / $numSections));

                $starStudents = $sorted->take($firstSectionCap);
                $remaining = $sorted->skip($firstSectionCap)->values();

                foreach ($starStudents as $st) {
                    $distribution[0][] = $st;
                }

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
            // 4. ALGORITHM: Alphabetical (A-Z)
            elseif ($strategy === 'alphabetical') {
                $sorted = $students->sortBy(fn ($s) => $s->student?->name ?? '')->values();
                $secIdx = 0;
                foreach ($sorted as $st) {
                    $distribution[$secIdx][] = $st;
                    $secIdx = ($secIdx + 1) % $numSections;
                }
            }

            // ⚡ BULK COMMIT ASSIGNMENTS (Eliminates N+1 loop queries)
            $totalAssigned = 0;
            for ($i = 0; $i < $numSections; $i++) {
                $targetSection = $sections[$i];
                $studentsForThisSection = $distribution[$i];

                if (empty($studentsForThisSection)) {
                    continue;
                }

                $enrollmentIds = collect($studentsForThisSection)->pluck('id')->toArray();

                // ⚡ 1 Single Bulk UPDATE query per section!
                Enrollment::whereIn('id', $enrollmentIds)->update(['section_id' => $targetSection->id]);
                $totalAssigned += count($enrollmentIds);

                foreach ($studentsForThisSection as $enrollment) {
                    $notifiableStudents[] = [
                        'student' => $enrollment->student,
                        'enrollment' => $enrollment,
                        'section' => $targetSection,
                    ];
                }
            }

            AuditLog::record(
                'STUDENTS_AUTO_SECTIONED',
                "Auto-distributed {$totalAssigned} students across {$numSections} sections in Grade Level ID {$validated['grade_level_id']} using strategy '{$strategy}'.",
                null,
                [
                    'strategy' => $strategy,
                    'total_assigned' => $totalAssigned,
                    'sections_count' => $numSections,
                ],
                'SECTION'
            );
        });

        // 🚀 Dispatch queued notifications outside the database transaction
        foreach ($notifiableStudents as $item) {
            $item['student']?->notify(new StudentSectionAssignedNotification(
                $item['enrollment'],
                $item['section']
            ));
        }

        return back()->with('success', "Matagumpay na na-distribute ang mga estudyante gamit ang '{$strategy}' strategy!");
    }

    /**
     * Manually assign an individual unassigned student to a section.
     */
    public function assignSingle(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'enrollment_id' => ['required', 'exists:enrollments,id'],
            'section_id'    => ['required', 'exists:sections,id'],
        ]);

        $enrollment = Enrollment::findOrFail($validated['enrollment_id']);
        $this->authorizeGradeLevel($enrollment->grade_level_id);

        $notificationData = null;

        DB::transaction(function () use ($enrollment, $validated, &$notificationData) {
            $lockedEnrollment = Enrollment::where('id', $enrollment->id)->lockForUpdate()->firstOrFail();
            $section = Section::where('id', $validated['section_id'])->lockForUpdate()->firstOrFail();

            if ($section->grade_level_id !== $lockedEnrollment->grade_level_id) {
                throw ValidationException::withMessages([
                    'section_id' => 'Hindi tugma ang Grade Level ng Section sa Grade Level ng estudyante.',
                ]);
            }

            if ($section->capacity > 0) {
                $currentCount = Enrollment::where('section_id', $section->id)
                    ->where('status', EnrollmentStatus::APPROVED)
                    ->where('id', '!=', $lockedEnrollment->id)
                    ->count();

                if ($currentCount >= $section->capacity) {
                    throw ValidationException::withMessages([
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

            $notificationData = [
                'student' => $lockedEnrollment->student,
                'enrollment' => $lockedEnrollment->fresh(['gradeLevel', 'academicYear']),
                'section' => $section->fresh(['adviser', 'gradeLevel', 'academicYear']),
            ];
        });

        if ($notificationData) {
            $notificationData['student']?->notify(new StudentSectionAssignedNotification(
                $notificationData['enrollment'],
                $notificationData['section']
            ));
        }

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

        $selectedYearId = session('registrar_academic_year_id');
        $academicYear = ($selectedYearId ? AcademicYear::find($selectedYearId) : null)
            ?? AcademicYear::getCachedActive()
            ?? AcademicYear::where('is_active', true)->firstOrFail();

        DB::transaction(function () use ($validated, $academicYear) {
            $query = Enrollment::where('academic_year_id', $academicYear->id)
                ->where('grade_level_id', $validated['grade_level_id'])
                ->where('status', EnrollmentStatus::APPROVED);

            if (!empty($validated['section_id'])) {
                $query->where('section_id', $validated['section_id']);
            } else {
                $query->whereNotNull('section_id');
            }

            // ⚡ Single query: update() returns the number of affected rows directly
            $count = $query->update(['section_id' => null]);

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
}
