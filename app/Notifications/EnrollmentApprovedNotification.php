<?php

namespace App\Notifications;

use App\Modules\Enrollment\Models\Enrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EnrollmentApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $timeout = 60;

    public function __construct(
        public Enrollment $enrollment
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
        $schoolYear = $this->enrollment->academicYear?->name ?? '2027-2028';
        $trackingNumber = $this->enrollment->tracking_number;
        $lrn = $notifiable->lrn ?? $this->enrollment->student?->lrn ?? '';
        $gradeLevel = $this->enrollment->gradeLevel?->name ?? 'Grade Level';
        $strand = $this->enrollment->strand?->name ?? $this->enrollment->strand?->code ?? '';
        $sectionName = $this->enrollment->section?->name ?? '';
        $adviserName = $this->enrollment->section?->adviser?->name ?? '';
        $portalUrl = route('student.dashboard');

        return (new MailMessage)
            ->subject("Official Notice: Admission Approved & Enrolled (Ticket: {$trackingNumber}) - Bulusan NHS")
            ->view('emails.enrollment_approved', [
                'studentName'    => $studentName,
                'schoolYear'     => $schoolYear,
                'trackingNumber' => $trackingNumber,
                'lrn'            => $lrn,
                'gradeLevel'     => $gradeLevel,
                'strand'         => $strand,
                'sectionName'    => $sectionName,
                'adviserName'    => $adviserName,
                'portalUrl'      => $portalUrl,
            ]);
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
