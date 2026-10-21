<?php

namespace App\Modules\Enrollment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Academic\Models\Section;
use App\Modules\Enrollment\Enums\EnrollmentStatus;
use App\Modules\Enrollment\Models\Enrollment;
use App\Modules\Enrollment\Traits\AuthorizesGradeLevel;
use App\Modules\Identity\Enums\UserRole;
use App\Modules\Identity\Models\AuditLog;
use App\Modules\Identity\Models\User;
use App\Notifications\TeacherAdviserAssignedNotification;
use App\Notifications\SectionAdviserUpdatedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SectionAdviserController extends Controller
{
    use AuthorizesGradeLevel;

    /**
     * Assign or unassign a faculty teacher as the official Class Adviser for a section.
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
        }

        DB::transaction(function () use ($section, $adviserId, $teacher) {
            if ($adviserId) {
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
        });

        if ($teacher) {
            // Eager load once outside loops (Fixes N+1 fresh() query issue)
            $freshSection = $section->fresh(['gradeLevel', 'academicYear']);

            // 1. Dispatch queued notification to the newly designated teacher
            $teacher->notify(new TeacherAdviserAssignedNotification(
                $freshSection,
                $teacher,
                $freshSection->academicYear
            ));

            // 2. Dispatch queued update notification to all currently enrolled students in this section
            $enrolledStudents = Enrollment::with('student')
                ->where('section_id', $section->id)
                ->where('status', EnrollmentStatus::APPROVED)
                ->get();

            foreach ($enrolledStudents as $enr) {
                $enr->student?->notify(new SectionAdviserUpdatedNotification(
                    $freshSection,
                    $teacher
                ));
            }
        }

        $msg = $teacher
            ? "Matagumpay na na-assign si {$teacher->name} bilang Class Adviser ng Section {$section->name}."
            : "Naalis ang Class Adviser ng Section {$section->name}.";

        return back()->with('success', $msg);
    }
}
