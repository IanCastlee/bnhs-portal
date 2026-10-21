<?php

namespace App\Modules\Enrollment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Enrollment\Models\Enrollment;
use App\Modules\Enrollment\Enums\EnrollmentStatus;
use App\Modules\Academic\Models\GradeLevel;
use App\Modules\Academic\Models\AcademicYear;
use App\Modules\Academic\Models\Strand;
use App\Modules\Academic\Models\Section;
use App\Modules\Identity\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class AdmissionController extends Controller
{
    /**
     * 🎓 Render the Student BEEF Admission Hub
     */
    public function show(): Response
    {
        $user = Auth::user();
        $activeYear = AcademicYear::where('is_active', true)->first();

        // 1. Fetch enrollment for the ACTIVE school year
        $enrollment = Enrollment::with(['section.adviser', 'gradeLevel', 'academicYear', 'strand'])
            ->where('student_id', $user->id)
            ->when($activeYear, function ($q) use ($activeYear) {
                $q->where('academic_year_id', $activeYear->id);
            })
            ->first();

        // 2. Fetch past approved enrollment (if any) to pre-fill and detect Old Student status
        $previousEnrollment = Enrollment::with(['gradeLevel', 'academicYear', 'section'])
            ->where('student_id', $user->id)
            ->where('status', EnrollmentStatus::APPROVED)
            ->when($activeYear, function ($q) use ($activeYear) {
                $q->where('academic_year_id', '!=', $activeYear->id);
            })
            ->latest('id')
            ->first();

        $isOldStudent = $previousEnrollment !== null || ($enrollment && $enrollment->student_type === 'OLD');
        $promotedGradeLevel = null;

        if ($previousEnrollment && $previousEnrollment->gradeLevel) {
            $promotedGradeLevel = GradeLevel::where('level', $previousEnrollment->gradeLevel->level + 1)->first()
                ?? $previousEnrollment->gradeLevel;
        }

        // 3. Pre-fill household info from current or past enrollment record
        $sourceRecord = $enrollment ?? $previousEnrollment;
        $prefilledHousehold = [
            'guardian_name'    => $sourceRecord?->guardian_name ?? '',
            'guardian_contact' => $sourceRecord?->guardian_contact ?? $user->phone_number ?? '',
            'address'          => $sourceRecord?->address ?? '',
            'previous_school'  => $previousEnrollment
                ? "Bulusan National High School ({$previousEnrollment->gradeLevel?->name} - {$previousEnrollment->section?->name})"
                : ($sourceRecord?->previous_school ?? ''),
            'general_average'  => $previousEnrollment?->general_average ?? $sourceRecord?->general_average ?? '',
            'four_ps_number'   => $sourceRecord?->four_ps_number ?? '',
        ];

        $queuePosition = null;
        if ($enrollment && $enrollment->status === EnrollmentStatus::PENDING_REVIEW) {
            $queuePosition = Enrollment::where('status', EnrollmentStatus::PENDING_REVIEW)
                ->where('id', '<=', $enrollment->id)
                ->count();
        }

        return Inertia::render('Student/Admission', [
            'enrollment'          => $enrollment,
            'previousEnrollment'  => $previousEnrollment,
            'promotedGradeLevel'  => $promotedGradeLevel,
            'isOldStudent'        => $isOldStudent,
            'prefilledHousehold'  => $prefilledHousehold,
            'activeSchoolYear'    => $activeYear,
            'queuePosition'       => $queuePosition,
        ]);
    }

    /**
     * ⚡ Confirm Re-Enrollment for Promoted Old Students (1-Click)
     */
    public function confirmReEnroll(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $activeYear = AcademicYear::where('is_active', true)->firstOrFail();

        // Prevent duplicate
        $existing = Enrollment::where('student_id', $user->id)
            ->where('academic_year_id', $activeYear->id)
            ->first();

        if ($existing) {
            return back()->with('info', "Already enrolled in S.Y. {$activeYear->name}");
        }

        $previousEnrollment = Enrollment::with('gradeLevel')
            ->where('student_id', $user->id)
            ->where('status', EnrollmentStatus::APPROVED)
            ->latest('id')
            ->firstOrFail();

        $promotedLevel = GradeLevel::where('level', $previousEnrollment->gradeLevel->level + 1)->first()
            ?? $previousEnrollment->gradeLevel;

        $newTrackingNo = 'BNHS-' . explode('-', $activeYear->name)[0] . '-Q' . str_pad($user->id, 4, '0', STR_PAD_LEFT);

        Enrollment::create([
            'tracking_number'  => $newTrackingNo,
            'student_id'       => $user->id,
            'academic_year_id' => $activeYear->id,
            'grade_level_id'   => $promotedLevel->id,
            'strand_id'        => $previousEnrollment->strand_id,
            'section_id'       => null,
            'student_type'     => 'OLD',
            'birthdate'        => $previousEnrollment->birthdate,
            'gender'           => $previousEnrollment->gender,
            'address'          => $previousEnrollment->address,
            'guardian_name'    => $previousEnrollment->guardian_name,
            'guardian_contact' => $previousEnrollment->guardian_contact,
            'previous_school'  => "Bulusan National High School ({$previousEnrollment->gradeLevel?->name})",
            'general_average'  => $previousEnrollment->general_average,
            'documents'        => $previousEnrollment->documents,
            'status'           => EnrollmentStatus::PENDING_REVIEW,
        ]);

        return redirect()->route('student.admission')->with('success', "Congratulations! Re-enrollment submitted for S.Y. {$activeYear->name} ({$promotedLevel->name}).");
    }

    /**
     * Update Student Household & Guardian Information (DepEd BEEF Step 2)
     */
    public function updateHousehold(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $enrollment = Enrollment::where('student_id', $user->id)->latest()->firstOrFail();

        if ($enrollment->status === EnrollmentStatus::APPROVED) {
            return back()->withErrors(['guardian_name' => 'Naka-lock na ang iyong rekord. Bawal nang baguhin ang impormasyon dahil opisyal nang APPROVED ang iyong enrollment para sa School Year na ito.']);
        }

        $validated = $request->validate([
            'guardian_name'    => ['required', 'string', 'max:150'],
            'guardian_contact' => ['required', 'string', 'max:30'],
            'address'          => ['required', 'string', 'max:500'],
            'previous_school'  => ['nullable', 'string', 'max:200'],
            'general_average'  => ['nullable', 'numeric', 'between:70,100'],
            'is_4ps'           => ['nullable', 'boolean'],
            'four_ps_number'   => ['nullable', 'string', 'max:50'],
        ]);

        $updateData = [
            'guardian_name'    => $validated['guardian_name'],
            'guardian_contact' => $validated['guardian_contact'],
            'address'          => $validated['address'],
            'previous_school'  => $validated['previous_school'] ?? $enrollment->previous_school,
            'general_average'  => $validated['general_average'] ?? $enrollment->general_average,
        ];

        $wasRejected = $enrollment->status === EnrollmentStatus::REJECTED;

        // Kung binalik (Returned) ng Registrar, awtomatikong ibalik sa PENDING_REVIEW para maging "Ready for Review"
        if ($wasRejected) {
            $updateData['status'] = EnrollmentStatus::PENDING_REVIEW;
            $prevRemarks = $enrollment->remarks ? " (Previous note: {$enrollment->remarks})" : '';
            $updateData['remarks'] = "Resubmitted by applicant after correction.{$prevRemarks}";
        }

        $enrollment->update($updateData);

        if ($wasRejected) {
            AuditLog::record(
                'ENROLLMENT_RESUBMITTED',
                "Applicant {$user->name} corrected and resubmitted household details after return. Ticket {$enrollment->tracking_number} moved back to PENDING_REVIEW.",
                $enrollment,
                ['tracking_number' => $enrollment->tracking_number],
                'ENROLLMENT',
                $user->id
            );
        }

        return back()->with(
            'success',
            'Household information successfully saved.' . ($wasRejected ? ' Application is now back in Registrar queue for re-evaluation.' : '')
        );
    }
}
