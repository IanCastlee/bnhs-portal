<?php

namespace App\Notifications;

use App\Modules\Enrollment\Models\Enrollment;
use Illuminate\Notifications\Notification;

class EnrollmentApprovedNotification extends Notification
{
    public function __construct(
        public Enrollment $enrollment
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $grade = $this->enrollment->gradeLevel?->name ?? 'Grade Level';
        $section = $this->enrollment->section?->name ?? 'TBA';

        return [
            'title'           => 'Admission Approved & Officially Enrolled!',
            'message'         => "Malugod naming ipinababatid na aprubado na ang iyong admission para sa {$grade}. Assigned Section: {$section}.",
            'type'            => 'ENROLLMENT_APPROVED',
            'tracking_number' => $this->enrollment->tracking_number,
            'enrollment_id'   => $this->enrollment->id,
            'grade_level'     => $grade,
            'section'         => $section,
            'adviser'         => $this->enrollment->section?->adviser?->name,
            'action_url'      => route('student.dashboard'),
            'created_at'      => now()->toIso8601String(),
        ];
    }
}
