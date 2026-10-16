<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Modules\Identity\Models\User;
use App\Modules\Academic\Models\GradeLevel;
use App\Modules\Academic\Models\AcademicYear;
use App\Modules\Academic\Models\Section;
use App\Modules\Academic\Models\Subject;
use App\Modules\Enrollment\Models\Enrollment;
use App\Modules\Enrollment\Enums\EnrollmentStatus;
use App\Modules\Grading\Models\Grade;
use App\Modules\Grading\Enums\GradeSubmissionStatus;
use Illuminate\Support\Facades\Cache;

class UpdateToSy20272028Seeder extends Seeder
{
    public function run(): void
    {
        // 1. Past School Year (2026-2027) - Inactive
        $sy2026 = AcademicYear::firstOrCreate(
            ['name' => '2026-2027'],
            [
                'semester'           => 'Full Year',
                'is_active'          => false,
                'is_enrollment_open' => false,
                'is_grading_open'    => false,
            ]
        );
        $sy2026->update([
            'is_active'          => false,
            'is_enrollment_open' => false,
            'is_grading_open'    => false,
        ]);

        // 2. New Active School Year (2027-2028) - Active & Enrollment Open
        $sy2027 = AcademicYear::firstOrCreate(
            ['name' => '2027-2028'],
            [
                'semester'           => 'Full Year',
                'is_active'          => true,
                'is_enrollment_open' => true,
                'is_grading_open'    => true,
            ]
        );
        $sy2027->update([
            'is_active'          => true,
            'is_enrollment_open' => true,
            'is_grading_open'    => true,
        ]);

        $g7 = GradeLevel::where('level', 7)->first();
        $g8 = GradeLevel::where('level', 8)->first();
        $teacher = User::where('role', 'TEACHER')->first();

        // 3. Create Sections for New S.Y. 2027-2028
        $sec8_2027 = Section::firstOrCreate(
            ['academic_year_id' => $sy2027->id, 'grade_level_id' => $g8->id, 'name' => 'Bonifacio'],
            ['adviser_id' => $teacher?->id ?? 3, 'capacity' => 45]
        );

        $sec7_2027 = Section::firstOrCreate(
            ['academic_year_id' => $sy2027->id, 'grade_level_id' => $g7->id, 'name' => 'Rizal'],
            ['adviser_id' => $teacher?->id ?? 3, 'capacity' => 45]
        );

        // 4. Past S.Y. 2026-2027 Section for Grade 7
        $sec7_2026 = Section::firstOrCreate(
            ['academic_year_id' => $sy2026->id, 'grade_level_id' => $g7->id, 'name' => 'Rizal'],
            ['adviser_id' => $teacher?->id ?? 3, 'capacity' => 45]
        );

        // 5. Ryan's Completed Grade 7 Record in S.Y. 2026-2027
        $ryanEnrollment = Enrollment::where('student_id', 8)->first();
        if ($ryanEnrollment) {
            $ryanEnrollment->update([
                'academic_year_id' => $sy2026->id,
                'grade_level_id'   => $g7->id,
                'section_id'       => $sec7_2026->id,
                'student_type'     => 'OLD',
                'general_average'  => 88.75,
                'status'           => EnrollmentStatus::APPROVED,
                'remarks'          => 'Completed Grade 7 in S.Y. 2026-2027 (GWA: 88.75). Promoted to Grade 8.',
            ]);
        }

        // Delete any existing enrollment for Ryan in 2027-2028 so he can test fresh re-enrollment
        Enrollment::where('student_id', 8)->where('academic_year_id', $sy2027->id)->delete();

        // 6. Grade records for Ryan in S.Y. 2026-2027 (Published SF9 / Form 137)
        foreach (Subject::where('grade_level_id', $g7->id)->get() as $subj) {
            Grade::updateOrCreate(
                [
                    'academic_year_id' => $sy2026->id,
                    'section_id'       => $sec7_2026->id,
                    'subject_id'       => $subj->id,
                    'student_id'       => 8,
                ],
                [
                    'teacher_id'  => $teacher?->id ?? 3,
                    'q1'          => 88.00,
                    'q2'          => 89.00,
                    'q3'          => 89.00,
                    'q4'          => 89.00,
                    'final_grade' => 88.75,
                    'remarks'     => 'PASSED',
                    'status'      => GradeSubmissionStatus::PUBLISHED,
                ]
            );
        }

        Cache::flush();
    }
}
