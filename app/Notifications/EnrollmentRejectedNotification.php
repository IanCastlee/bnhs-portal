<?php

namespace App\Notifications;

use App\Modules\Enrollment\Models\Enrollment;
use Illuminate\Notifications\Notification;

class EnrollmentRejectedNotification extends Notification
{
    public function __construct(
        public Enrollment $enrollment,
        public string $remarks
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title'           => 'Admission Application Returned for Correction',
            'message'         => "Ibinalik ng Registrar ang iyong aplikasyon ({$this->enrollment->tracking_number}). Remarks: {$this->remarks}",
            'type'            => 'ENROLLMENT_REJECTED',
            'tracking_number' => $this->enrollment->tracking_number,
            'enrollment_id'   => $this->enrollment->id,
            'remarks'         => $this->remarks,
            'action_url'      => route('student.admission'),
            'created_at'      => now()->toIso8601String(),
        ];
    }
}
