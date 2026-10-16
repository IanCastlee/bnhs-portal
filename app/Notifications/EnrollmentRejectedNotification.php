<?php

namespace App\Notifications;

use App\Modules\Enrollment\Models\Enrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EnrollmentRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $timeout = 60;

    public function __construct(
        public Enrollment $enrollment,
        public string $remarks
    ) {
        $this->afterCommit = true;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $studentName = $notifiable->name ?? 'Student';
        $trackingNumber = $this->enrollment->tracking_number;
        $gradeLevel = $this->enrollment->gradeLevel?->name ?? 'Grade Level';
        $portalUrl = route('student.admission');

        return (new MailMessage)
            ->subject("Admission Notice: Action Required for Ticket {$trackingNumber} - Bulusan NHS")
            ->view('emails.enrollment_rejected', [
                'studentName'    => $studentName,
                'trackingNumber' => $trackingNumber,
                'gradeLevel'     => $gradeLevel,
                'remarks'        => $this->remarks,
                'portalUrl'      => $portalUrl,
            ]);
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
