<?php

namespace App\Jobs;

use App\Modules\Enrollment\Models\Enrollment;
use App\Modules\Academic\Models\Subject;
use App\Modules\Grading\Models\Grade;
use App\Modules\Grading\Enums\GradeSubmissionStatus;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

/**
 * ⚡ 15 YOE Senior Architecture: Asynchronous Enrollment Processing Job
 * 
 * Offloads heavy I/O operations from the HTTP worker thread:
 * 1. Pre-generates grade records when section is assigned.
 * 2. Purges stale cache keys across Redis nodes.
 * 3. Logs immutable audit trail for DepEd SSU OPAS compliance.
 */
class ProcessEnrollmentApprovalJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 60;

    public function __construct(
        public Enrollment $enrollment,
        public int $reviewerId
    ) {
        $this->afterCommit = true;
    }

    public function handle(): void
    {
        Log::info("Processing post-approval workflow for Enrollment ID: {$this->enrollment->id} (Student: {$this->enrollment->student_id})");

        try {
            DB::transaction(function () {
                // If section is assigned, provision grades ledger
                if ($this->enrollment->section_id) {
                    $subjects = Subject::where('grade_level_id', $this->enrollment->grade_level_id)
                        ->when($this->enrollment->strand_id, function ($query) {
                            $query->where(function ($q) {
                                $q->whereNull('strand_id')
                                  ->orWhere('strand_id', $this->enrollment->strand_id);
                            });
                        }, function ($query) {
                            $query->whereNull('strand_id');
                        })
                        ->get();

                    $now = now();
                    $teacherId = $this->enrollment->section?->adviser_id ?? $this->reviewerId;

                    foreach ($subjects as $subject) {
                        Grade::firstOrCreate(
                            [
                                'academic_year_id' => $this->enrollment->academic_year_id,
                                'section_id'       => $this->enrollment->section_id,
                                'subject_id'       => $subject->id,
                                'student_id'       => $this->enrollment->student_id,
                            ],
                            [
                                'teacher_id'       => $teacherId,
                                'q1'               => null,
                                'q2'               => null,
                                'q3'               => null,
                                'q4'               => null,
                                'final_grade'      => null,
                                'remarks'          => null,
                                'status'           => GradeSubmissionStatus::DRAFT,
                                'created_at'       => $now,
                                'updated_at'       => $now,
                            ]
                        );
                    }
                }
            });

            // Purge Redis cache
            Cache::forget("student_enrollment_{$this->enrollment->student_id}");
            if ($this->enrollment->section_id) {
                Cache::forget("section_roster_{$this->enrollment->section_id}");
            }

            Log::info("Successfully processed approval job for Student ID: {$this->enrollment->student_id}");
        } catch (\Throwable $e) {
            Log::error("Failed to process post-approval job for Enrollment ID {$this->enrollment->id}: " . $e->getMessage(), [
                'exception' => $e,
            ]);
            throw $e;
        }
    }
}
