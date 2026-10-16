<?php

namespace App\Notifications;

use App\Modules\Academic\Models\AcademicYear;
use App\Modules\Academic\Models\Section;
use App\Modules\Identity\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeacherAdviserAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $timeout = 60;

    public function __construct(
        public Section $section,
        public User $teacher,
        public ?AcademicYear $academicYear = null
    ) {
        $this->afterCommit = true;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $teacherName = $this->teacher->name;
        $employeeId = $this->teacher->employee_id ?? 'N/A';
        $schoolYear = $this->academicYear?->name 
            ?? $this->section->academicYear?->name 
            ?? 'Active School Year';
        $gradeLevel = $this->section->gradeLevel?->name ?? 'Grade';
        $sectionName = $this->section->name;
        $enrolledCount = $this->section->enrollments()->where('status', 'APPROVED')->count();
        $capacity = $this->section->capacity ?? 45;
        $portalUrl = url('/teacher/dashboard');

        return (new MailMessage)
            ->subject("Official Designation: Class Adviser for {$gradeLevel} - {$sectionName} (S.Y. {$schoolYear}) - Bulusan NHS")
            ->view('emails.adviser_designation', [
                'teacherName'    => $teacherName,
                'employeeId'     => $employeeId,
                'schoolYear'     => $schoolYear,
                'gradeLevel'     => $gradeLevel,
                'sectionName'    => $sectionName,
                'enrolledCount'  => $enrolledCount,
                'capacity'       => $capacity,
                'portalUrl'      => $portalUrl,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $grade = $this->section->gradeLevel?->name ?? 'Grade';
        $section = $this->section->name;
        $schoolYear = $this->academicYear?->name ?? $this->section->academicYear?->name ?? 'Active';

        return [
            'title'           => 'Class Adviser Designation',
            'message'         => "Ikaw ay opisyal nang itinalaga bilang Class Adviser ng {$grade} - {$section} para sa S.Y. {$schoolYear}.",
            'type'            => 'ADVISER_DESIGNATION',
            'section_id'      => $this->section->id,
            'grade_level'     => $grade,
            'section'         => $section,
            'action_url'      => url('/teacher/dashboard'),
            'created_at'      => now()->toIso8601String(),
        ];
    }
}
