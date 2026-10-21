<?php

namespace App\Modules\Enrollment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Academic\Models\Section;
use App\Modules\Academic\Models\SectionSubject;
use App\Modules\Academic\Models\Subject;
use App\Modules\Enrollment\Traits\AuthorizesGradeLevel;
use App\Modules\Identity\Enums\UserRole;
use App\Modules\Identity\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SectionSubjectController extends Controller
{
    use AuthorizesGradeLevel;

    /**
     * Get curriculum subjects for a section along with their currently assigned teachers and schedules.
     */
    public function getSectionSubjects(Section $section): JsonResponse
    {
        $this->authorizeGradeLevel((int) $section->grade_level_id);

        // 1. Kuhanin ang curriculum subjects gamit ang Model-level Redis Cache
        $rawSubjects = Subject::getCachedForSection($section);

        // 2. Kuhanin ang mga kasalukuyang naka-assign sa section_subjects table
        $existingAssignments = SectionSubject::with('teacher:id,name,email')
            ->where('section_id', $section->id)
            ->where('academic_year_id', $section->academic_year_id)
            ->get()
            ->keyBy('subject_id');

        // 3. I-map ang bawat subject kasama ang kanyang teacher at oras
        $payload = collect($rawSubjects)->map(function ($subject) use ($existingAssignments) {
            $subId = is_array($subject) ? $subject['id'] : $subject->id;
            $subCode = is_array($subject) ? $subject['code'] : $subject->code;
            $subName = is_array($subject) ? $subject['name'] : $subject->name;
            $subSemester = is_array($subject) ? ($subject['semester'] ?? 'Full Year') : ($subject->semester ?? 'Full Year');

            $assignment = $existingAssignments->get($subId);

            return [
                'subject_id' => $subId,
                'code' => $subCode,
                'name' => $subName,
                'semester' => $subSemester,
                'teacher_id' => $assignment?->teacher_id,
                'teacher' => $assignment?->teacher ? [
                    'id' => $assignment->teacher->id,
                    'name' => $assignment->teacher->name,
                    'email' => $assignment->teacher->email,
                ] : null,
                'schedule_days' => $assignment?->schedule_days ?? 'Monday - Friday',
                'time_start' => $assignment?->time_start ? substr($assignment->time_start, 0, 5) : '',
                'time_end' => $assignment?->time_end ? substr($assignment->time_end, 0, 5) : '',
                'room' => $assignment?->room ?? '',
            ];
        });

        return response()->json([
            'section' => [
                'id' => $section->id,
                'name' => $section->name,
                'grade_level_id' => $section->grade_level_id,
                'academic_year_id' => $section->academic_year_id,
            ],
            'subjects' => $payload,
        ]);
    }

    /**
     * Batch save / update subject teacher assignments and class schedule for a section.
     */
    public function assignSubjects(Request $request, Section $section): RedirectResponse|JsonResponse
    {
        $this->authorizeGradeLevel((int) $section->grade_level_id);

        $teacherRoleValue = UserRole::TEACHER->value ?? 'TEACHER';

        $validated = $request->validate([
            'assignments' => ['required', 'array'],
            'assignments.*.subject_id' => ['required', 'exists:subjects,id'],
            'assignments.*.teacher_id' => [
                'nullable',
                Rule::exists('users', 'id')->where(function ($q) use ($teacherRoleValue) {
                    $q->where('role', $teacherRoleValue)
                      ->where('is_active', true);
                }),
            ],
            'assignments.*.schedule_days' => ['nullable', 'string', 'max:50'],
            'assignments.*.time_start' => ['nullable', 'string', 'max:10'],
            'assignments.*.time_end' => ['nullable', 'string', 'max:10'],
            'assignments.*.room' => ['nullable', 'string', 'max:50'],
        ]);

        DB::transaction(function () use ($validated, $section) {
            foreach ($validated['assignments'] as $item) {
                SectionSubject::updateOrCreate(
                    [
                        'academic_year_id' => $section->academic_year_id,
                        'section_id' => $section->id,
                        'subject_id' => $item['subject_id'],
                    ],
                    [
                        'teacher_id' => $item['teacher_id'] ?: null,
                        'schedule_days' => $item['schedule_days'] ?? 'Monday - Friday',
                        'time_start' => !empty($item['time_start']) ? $item['time_start'] : null,
                        'time_end' => !empty($item['time_end']) ? $item['time_end'] : null,
                        'room' => $item['room'] ?? null,
                    ]
                );
            }

            AuditLog::record(
                'SECTION_SUBJECTS_UPDATED',
                "Updated subject teacher assignments and class schedule for Section {$section->name}.",
                $section,
                ['section_id' => $section->id, 'assignments_count' => count($validated['assignments'])],
                'ACADEMIC'
            );
        });

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Subject teacher assignments saved successfully!']);
        }

        return back()->with('success', "Subjects and teacher schedule for Section {$section->name} have been updated successfully!");
    }
}
