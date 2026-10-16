<?php

namespace App\Notifications;

use App\Modules\Academic\Models\Section;
use App\Modules\Identity\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SectionAdviserUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $timeout = 60;

    public function __construct(
        public Section $section,
        public User $adviser
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
        $gradeLevel = $this->section->gradeLevel?->name ?? 'Grade';
        $sectionName = $this->section->name;
        $adviserName = $this->adviser->name;
        $schoolYear = $this->section->academicYear?->name ?? 'Active School Year';
        $portalUrl = route('student.admission');

        return (new MailMessage)
            ->subject("Update: Class Adviser Designated for {$gradeLevel} - {$sectionName} - Bulusan NHS")
            ->view('emails.section_adviser_updated', [
                'studentName'    => $studentName,
                'gradeLevel'     => $gradeLevel,
                'sectionName'    => $sectionName,
                'adviserName'    => $adviserName,
                'schoolYear'     => $schoolYear,
                'portalUrl'      => $portalUrl,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $grade = $this->section->gradeLevel?->name ?? 'Grade';
        $section = $this->section->name;
        $adviser = $this->adviser->name;

        return [
            'title'           => 'Class Adviser Assigned',
            'message'         => "Si {$adviser} ang opisyal na Class Adviser ng iyong klase sa {$grade} - {$section}.",
            'type'            => 'ADVISER_ASSIGNED',
            'section_id'      => $this->section->id,
            'grade_level'     => $grade,
            'section'         => $section,
            'adviser'         => $adviser,
            'action_url'      => route('student.admission'),
            'created_at'      => now()->toIso8601String(),
        ];
    }
}
