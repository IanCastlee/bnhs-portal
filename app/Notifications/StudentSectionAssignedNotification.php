<?php

namespace App\Notifications;

use App\Modules\Academic\Models\Section;
use App\Modules\Enrollment\Models\Enrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StudentSectionAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $timeout = 60;

    public function __construct(
        public Enrollment $enrollment,
        public Section $section
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
        $lrn = $notifiable->lrn ?? $this->enrollment->student?->lrn ?? 'N/A';
        $schoolYear = $this->section->academicYear?->name 
            ?? $this->enrollment->academicYear?->name 
            ?? 'Active School Year';
        $gradeLevel = $this->section->gradeLevel?->name 
            ?? $this->enrollment->gradeLevel?->name 
            ?? 'Grade Level';
        $sectionName = $this->section->name;
        $adviserName = $this->section->adviser?->name ?? 'To Be Assigned Soon';
        $portalUrl = route('student.admission');

        return (new MailMessage)
            ->subject("Official Notice: Section Assignment ({$gradeLevel} - {$sectionName}) - Bulusan NHS")
            ->view('emails.section_assigned', [
                'studentName'    => $studentName,
                'lrn'            => $lrn,
                'schoolYear'     => $schoolYear,
                'gradeLevel'     => $gradeLevel,
                'sectionName'    => $sectionName,
                'adviserName'    => $adviserName,
                'portalUrl'      => $portalUrl,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $grade = $this->section->gradeLevel?->name ?? $this->enrollment->gradeLevel?->name ?? 'Grade';
        $section = $this->section->name;
        $adviser = $this->section->adviser?->name ?? 'To Be Assigned Soon';

        return [
            'title'           => 'Section Assignment Confirmed',
            'message'         => "Naitalaga ka na sa Section {$section} para sa {$grade}. Class Adviser: {$adviser}.",
            'type'            => 'SECTION_ASSIGNED',
            'enrollment_id'   => $this->enrollment->id,
            'section_id'      => $this->section->id,
            'grade_level'     => $grade,
            'section'         => $section,
            'adviser'         => $adviser,
            'action_url'      => route('student.admission'),
            'created_at'      => now()->toIso8601String(),
        ];
    }
}
