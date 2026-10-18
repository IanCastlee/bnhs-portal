<?php

namespace App\Modules\Enrollment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Enrollment\Models\Enrollment;
use App\Modules\Enrollment\Enums\EnrollmentStatus;
use App\Modules\Academic\Models\AcademicYear;
use App\Modules\Academic\Models\GradeLevel;
use App\Modules\Academic\Models\Section;

use App\Modules\Academic\Models\SectionSubject;
use App\Modules\Academic\Models\Subject;

use App\Jobs\ProcessEnrollmentApprovalJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

/**
 * Registrar Enrollment & Sectioning Controller
 * Handles application review, grade-level scoped queue evaluation, section assignments, and approvals.
 */
class RegistrarEnrollmentController extends Controller
{
    /**
     *📋 List all applications in the Queue with High-Performance Cursor / Fast Pagination
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status', 'PENDING_REVIEW');
        $search = trim($request->query('search', ''));
        $gradeLevelId = $request->query('grade_level_id');
        $useCursor = $request->boolean('cursor', false);

        $query = Enrollment::with([
            'student:id,name,email,lrn,phone_number,avatar_path',
            'gradeLevel:id,level,name,category',
            'strand:id,code,name,track',
            'section:id,name,capacity,adviser_id',
            'section.adviser:id,name,email',
            'academicYear:id,name,semester',
            'reviewer:id,name,role',
        ]);

        // Active Academic Year Scoping with Session Persistence
        $activeYear = AcademicYear::getCachedActive();
        if ($request->has('academic_year_id')) {
            $academicYearId = $request->query('academic_year_id');
            session(['registrar_academic_year_id' => $academicYearId]);
        } else {
            $academicYearId = session('registrar_academic_year_id', $activeYear?->id);
        }

        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        }

        // Registrar Assigned Grade Levels Scoping
        $currentUser = Auth::user();
        $assignedGradeIds = $currentUser ? $currentUser->assignedGradeLevels()->pluck('grade_levels.id')->map(fn($id) => (int) $id)->toArray() : [];

        if (!empty($assignedGradeIds)) {
            if (empty($gradeLevelId) || !in_array((int) $gradeLevelId, $assignedGradeIds, true)) {
                $gradeLevelId = (string) $assignedGradeIds[0];
            }
            $query->where('grade_level_id', $gradeLevelId);
        } elseif (!empty($gradeLevelId)) {
            $query->where('grade_level_id', $gradeLevelId);
        }

        // Full-Text / Indexed Search
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('tracking_number', 'like', "{$search}%")
                    ->orWhere('guardian_name', 'like', "%{$search}%")
                    ->orWhereHas('student', function ($sq) use ($search) {
                        $sq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "{$search}%")
                            ->orWhere('lrn', 'like', "{$search}%");
                    });
            });
        }

        // Helper condition for Approved enrollments with "to follow" / conditional / incomplete requirements
        $applyApprovedIncompleteCondition = function ($q) {
            $q->where(function ($sub) {
                $sub->where('is_complete', false)
                    ->orWhere('remarks', 'like', '%to follow%')
                    ->orWhere('remarks', 'like', '%Conditionally Approved%')
                    ->orWhere('remarks', 'like', '%pending%')
                    ->orWhere('remarks', 'like', '%incomplete%')
                    ->orWhere('remarks', 'like', '%kulang%');
            });
        };

        $applyApprovedCompleteCondition = function ($q) {
            $q->where('is_complete', true)
              ->where(function ($sub) {
                  $sub->whereNull('remarks')
                      ->orWhere(function ($r) {
                          $r->where('remarks', 'not like', '%to follow%')
                            ->where('remarks', 'not like', '%Conditionally Approved%')
                            ->where('remarks', 'not like', '%pending%')
                            ->where('remarks', 'not like', '%incomplete%')
                            ->where('remarks', 'not like', '%kulang%');
                      });
              });
        };

        //  Status Tabs Filtering & Pure Indexed Ordering (Zero CASE WHEN filesort overhead)
        if ($status === 'PENDING_COMPLETE') {
            $query->where('status', EnrollmentStatus::PENDING_REVIEW->value)
                  ->where('is_complete', true)
                  ->orderBy('updated_at', 'desc')
                  ->orderBy('id', 'desc');
        } elseif ($status === 'PENDING_INCOMPLETE') {
            $query->where('status', EnrollmentStatus::PENDING_REVIEW->value)
                  ->where('is_complete', false)
                  ->orderBy('updated_at', 'desc')
                  ->orderBy('id', 'desc');
        } elseif ($status === 'PENDING_REVIEW') {
            $query->where('status', EnrollmentStatus::PENDING_REVIEW->value)
                  ->orderBy('is_complete', 'desc')
                  ->orderBy('updated_at', 'desc')
                  ->orderBy('id', 'desc');
        } elseif ($status === 'APPROVED_COMPLETE') {
            $query->where('status', EnrollmentStatus::APPROVED->value);
            $applyApprovedCompleteCondition($query);
            $query->orderBy('reviewed_at', 'desc')
                  ->orderBy('id', 'desc');
        } elseif ($status === 'APPROVED_INCOMPLETE') {
            $query->where('status', EnrollmentStatus::APPROVED->value);
            $applyApprovedIncompleteCondition($query);
            $query->orderBy('reviewed_at', 'desc')
                  ->orderBy('id', 'desc');
        } elseif ($status === 'APPROVED') {
            $query->where('status', EnrollmentStatus::APPROVED->value)
                  ->orderBy('reviewed_at', 'desc')
                  ->orderBy('id', 'desc');
        } elseif ($status === 'REJECTED') {
            $query->where('status', EnrollmentStatus::REJECTED->value)
                  ->orderBy('reviewed_at', 'desc')
                  ->orderBy('id', 'desc');
        } else {
            // ALL RECORDS
            $query->orderBy('status', 'asc')
                  ->orderBy('is_complete', 'desc')
                  ->orderBy('id', 'desc');
        }

        // High-concurrency Cursor Pagination vs Fast Standard Pagination
        if ($useCursor) {
            $enrollments = $query->cursorPaginate(15)->withQueryString();
        } else {
            $enrollments = $query->paginate(15)->withQueryString();
        }

        // 🎯 Accurate Scoped Queue Metrics for the Registrar's partition & active School Year
        $countBaseQuery = Enrollment::query();
        if ($academicYearId) {
            $countBaseQuery->where('academic_year_id', $academicYearId);
        }
        if (!empty($assignedGradeIds)) {
            $countBaseQuery->where('grade_level_id', $gradeLevelId);
        } elseif (!empty($gradeLevelId)) {
            $countBaseQuery->where('grade_level_id', $gradeLevelId);
        }

        $metrics = (clone $countBaseQuery)->selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = ? AND is_complete = 1 THEN 1 ELSE 0 END) as pending_complete,
            SUM(CASE WHEN status = ? AND is_complete = 0 THEN 1 ELSE 0 END) as pending_incomplete,
            SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as approved,
            SUM(CASE WHEN status = ? AND (
                is_complete = 0
                OR LOWER(COALESCE(remarks, '')) LIKE '%to follow%'
                OR LOWER(COALESCE(remarks, '')) LIKE '%conditionally approved%'
                OR LOWER(COALESCE(remarks, '')) LIKE '%pending%'
                OR LOWER(COALESCE(remarks, '')) LIKE '%incomplete%'
                OR LOWER(COALESCE(remarks, '')) LIKE '%kulang%'
            ) THEN 1 ELSE 0 END) as approved_incomplete,
            SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as rejected
        ", [
            EnrollmentStatus::PENDING_REVIEW->value,
            EnrollmentStatus::PENDING_REVIEW->value,
            EnrollmentStatus::PENDING_REVIEW->value,
            EnrollmentStatus::APPROVED->value,
            EnrollmentStatus::APPROVED->value,
            EnrollmentStatus::REJECTED->value,
        ])->first();

        $approvedTotal = (int) ($metrics->approved ?? 0);
        $approvedIncomplete = (int) ($metrics->approved_incomplete ?? 0);
        $approvedComplete = max(0, $approvedTotal - $approvedIncomplete);

        $counts = [
            'pending'             => (int) ($metrics->pending ?? 0),
            'pending_complete'    => (int) ($metrics->pending_complete ?? 0),
            'pending_incomplete'  => (int) ($metrics->pending_incomplete ?? 0),
            'approved'            => $approvedTotal,
            'approved_complete'   => $approvedComplete,
            'approved_incomplete' => $approvedIncomplete,
            'rejected'            => (int) ($metrics->rejected ?? 0),
            'total'               => (int) ($metrics->total ?? 0),
        ];

        return Inertia::render('Registrar/Enrollments', [
            'enrollments' => $enrollments,
            'filters' => [
                'status' => $status,
                'search' => $search,
                'grade_level_id' => $gradeLevelId,
                'academic_year_id' => $academicYearId ? (int) $academicYearId : null,
                'cursor' => $useCursor,
            ],
            'counts' => $counts,
        ]);
    }

    /**
     * 🛡️ Verify that the authenticated registrar is authorized for this enrollment's grade level.
     */
    private function authorizeRegistrarForEnrollment(Enrollment $enrollment): void
    {
        $user = Auth::user();
        if ($user && $user->isRegistrar()) {
            $assignedIds = $user->assignedGradeLevels()->pluck('grade_levels.id')->map(fn($id) => (int) $id)->toArray();
            if (!empty($assignedIds) && !in_array((int) $enrollment->grade_level_id, $assignedIds, true)) {
                abort(403, 'Hindi ka awtorisadong mag-evaluate sa Grade Level na ito.');
            }
        }
    }

    /**
     * Approve Application (Validates Grade Authorization, Prevents Double Approval, Supports Optional Sectioning)
     */
    public function approve(Request $request, Enrollment $enrollment): RedirectResponse
    {
        $this->authorizeRegistrarForEnrollment($enrollment);

        $validated = $request->validate([
            'section_id'       => ['nullable', 'exists:sections,id'],
            'remarks'          => ['nullable', 'string', 'max:500'],
            'guardian_name'    => ['nullable', 'string', 'max:255'],
            'guardian_contact' => ['nullable', 'string', 'max:50'],
            'address'          => ['nullable', 'string', 'max:500'],
        ]);

        $sectionId = $validated['section_id'] ?? null;
        $reviewerId = Auth::id();
        $alreadyApproved = false;

        DB::transaction(function () use ($enrollment, $sectionId, $reviewerId, $validated, &$alreadyApproved) {
            // Lock row for update to prevent concurrent double-approval
            $lockedEnrollment = Enrollment::where('id', $enrollment->id)->lockForUpdate()->firstOrFail();

            if ($lockedEnrollment->status === EnrollmentStatus::APPROVED) {
                $alreadyApproved = true;
            }

            // 🛡️ DepEd Compliance Guard: Block approval if household info is missing
            $effectiveGuardian = trim($validated['guardian_name'] ?? $lockedEnrollment->guardian_name ?? '');
            $effectiveAddress  = trim($validated['address'] ?? $lockedEnrollment->address ?? '');

            if (empty($effectiveGuardian) || empty($effectiveAddress)) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'household' => 'Hindi maaaring ma-approve ang application: Kinakailangan ang Parent/Guardian name at Permanent Address alinsunod sa DepEd Basic Education Enrollment Form (BEEF).',
                ]);
            }

            $updateData = [
                'status'      => EnrollmentStatus::APPROVED,
                'reviewed_by' => $reviewerId,
                'reviewed_at' => $alreadyApproved ? ($lockedEnrollment->reviewed_at ?? now()) : now(),
                'remarks'     => $validated['remarks'] ?? 'Application approved and verified by Registrar.',
            ];

            if (!empty($validated['guardian_name'])) {
                $updateData['guardian_name'] = trim($validated['guardian_name']);
            }
            if (!empty($validated['guardian_contact'])) {
                $updateData['guardian_contact'] = trim($validated['guardian_contact']);
            }
            if (!empty($validated['address'])) {
                $updateData['address'] = trim($validated['address']);
            }

            // 🏫 Sectioning Validation (If assigning section during or after enrollment)
            $section = null;
            if ($sectionId) {
                $section = Section::where('id', $sectionId)->lockForUpdate()->first();
                if (!$section) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'section_id' => 'The selected section does not exist.',
                    ]);
                }

                if ((int) $section->grade_level_id !== (int) $lockedEnrollment->grade_level_id) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'section_id' => 'Section grade level does not match student grade level.',
                    ]);
                }

                // Verify section capacity under row lock
                if ($section->capacity > 0) {
                    $currentEnrollees = Enrollment::where('section_id', $section->id)
                        ->where('status', EnrollmentStatus::APPROVED)
                        ->where('id', '!=', $lockedEnrollment->id)
                        ->count();

                    if ($currentEnrollees >= $section->capacity) {
                        throw \Illuminate\Validation\ValidationException::withMessages([
                            'section_id' => "Section {$section->name} is already at full capacity ({$section->capacity} students).",
                        ]);
                    }
                }

                $updateData['section_id'] = $sectionId;
            }

            $lockedEnrollment->update($updateData);

            // Record in DepEd Compliance Audit Trail using the pre-fetched section
            $student = $lockedEnrollment->student;
            $sectionName = $section?->name;
            \App\Modules\Identity\Models\AuditLog::record(
                'ENROLLMENT_APPROVED',
                "Approved admission for {$student?->name} (LRN: {$student?->lrn}, {$lockedEnrollment->tracking_number})" . ($sectionName ? " and assigned Section: {$sectionName}" : ""),
                $lockedEnrollment,
                [
                    'tracking_number' => $lockedEnrollment->tracking_number,
                    'student_name' => $student?->name,
                    'student_lrn' => $student?->lrn,
                    'grade_level' => $lockedEnrollment->gradeLevel?->name,
                    'section' => $sectionName,
                    'remarks' => $validated['remarks'] ?? 'Application approved and verified by Registrar.',
                ],
                'ENROLLMENT',
                $reviewerId
            );
        });

        if ($alreadyApproved) {
            Cache::forget("student_enrollment_{$enrollment->student_id}");
            return back()->with('success', "Updated evaluation and remarks for {$enrollment->student?->name}.");
        }

        // Fetch fresh model and relations once for background job and student notification
        $freshEnrollment = $enrollment->fresh(['section.adviser', 'gradeLevel', 'strand', 'academicYear', 'student']);

        // Dispatch asynchronous ledger generation
        ProcessEnrollmentApprovalJob::dispatch($freshEnrollment, $reviewerId);

        // Dispatch Queued Email & Database Notification to Student
        $student = $freshEnrollment->student;
        if ($student) {
            $student->notify(new \App\Notifications\EnrollmentApprovedNotification($freshEnrollment));
        }

        // Immediate Cache Invalidation
        Cache::forget("student_enrollment_{$enrollment->student_id}");

        return back()->with('success', "Application for {$enrollment->student?->name} has been officially approved!");
    }

    /**
     * Reject / Return Application for Resubmission (Scoped by Grade Level)
     */
    public function reject(Request $request, Enrollment $enrollment): RedirectResponse
    {
        $this->authorizeRegistrarForEnrollment($enrollment);

        $validated = $request->validate([
            'remarks' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        $alreadyHandled = false;

        DB::transaction(function () use ($enrollment, $validated, &$alreadyHandled) {
            $locked = Enrollment::where('id', $enrollment->id)->lockForUpdate()->firstOrFail();

            // Guard against both double-approval and double-rejection concurrency
            if (in_array($locked->status, [EnrollmentStatus::APPROVED, EnrollmentStatus::REJECTED], true)) {
                $alreadyHandled = true;
                return;
            }

            $locked->update([
                'status'      => EnrollmentStatus::REJECTED,
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
                'remarks'     => $validated['remarks'],
            ]);

            // Record in DepEd Compliance Audit Trail
            $student = $locked->student;
            \App\Modules\Identity\Models\AuditLog::record(
                'ENROLLMENT_REJECTED',
                "Returned admission application for {$student?->name} (Ticket: {$locked->tracking_number}). Reason: {$validated['remarks']}",
                $locked,
                [
                    'tracking_number' => $locked->tracking_number,
                    'student_name' => $student?->name,
                    'student_lrn' => $student?->lrn,
                    'remarks' => $validated['remarks'],
                ],
                'ENROLLMENT',
                Auth::id()
            );
        });

        if ($alreadyHandled) {
            return back()->withErrors(['status' => 'Hindi na maaaring i-reject ang application na naproseso na.']);
        }

        // Dispatch Queued Email & Database Notification to Student
        $freshEnrollment = $enrollment->fresh(['gradeLevel', 'student']);
        $student = $freshEnrollment->student;
        if ($student) {
            $student->notify(new \App\Notifications\EnrollmentRejectedNotification($freshEnrollment, $validated['remarks']));
        }

        Cache::forget("student_enrollment_{$enrollment->student_id}");

        return back()->with('success', "Application {$enrollment->tracking_number} has been returned to applicant for documentary correction.");
    }
}
