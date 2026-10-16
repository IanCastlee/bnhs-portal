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
use Illuminate\Support\Facades\DB;

class AcademicYearRolloverSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Past School Year (2025-2026) - Inactive / Archived
        $pastSy = AcademicYear::find(1);
        if ($pastSy) {
            $pastSy->update([
                'name'               => '2025-2026',
                'semester'           => 'Full Year',
                'is_active'          => false,
                'is_enrollment_open' => false,
                'is_grading_open'    => false,
            ]);
        } else {
            $pastSy = AcademicYear::create([
                'name'               => '2025-2026',
                'semester'           => 'Full Year',
                'is_active'          => false,
                'is_enrollment_open' => false,
                'is_grading_open'    => false,
            ]);
        }

        // 2. New Active School Year (2026-2027) - Active & Enrollment Open
        $newSy = AcademicYear::firstOrCreate(
            ['name' => '2026-2027'],
            [
                'semester'           => 'Full Year',
                'is_active'          => true,
                'is_enrollment_open' => true,
                'is_grading_open'    => true,
            ]
        );
        $newSy->update([
            'is_active'          => true,
            'is_enrollment_open' => true,
            'is_grading_open'    => true,
        ]);

        $g7 = GradeLevel::where('level', 7)->first();
        $g8 = GradeLevel::where('level', 8)->first();
        $teacher = User::where('role', 'TEACHER')->first();

        // 3. Create Sections for New School Year 2026-2027
        $sec7_new = Section::firstOrCreate(
            ['academic_year_id' => $newSy->id, 'grade_level_id' => $g7->id, 'name' => 'Rizal'],
            ['adviser_id' => $teacher?->id ?? 3, 'capacity' => 45]
        );

        $sec8_new = Section::firstOrCreate(
            ['academic_year_id' => $newSy->id, 'grade_level_id' => $g8->id, 'name' => 'Bonifacio'],
            ['adviser_id' => $teacher?->id ?? 3, 'capacity' => 45]
        );

        // 4. Set Ryan's Completed Past Record (S.Y. 2025-2026 as Grade 7 Student)
        $pastG7Section = Section::firstOrCreate(
            ['academic_year_id' => $pastSy->id, 'grade_level_id' => $g7->id, 'name' => 'Rizal (Past)'],
            ['adviser_id' => $teacher?->id ?? 3, 'capacity' => 45]
        );

        $ryanEnrollment = Enrollment::where('student_id', 8)->first();
        if ($ryanEnrollment) {
            $ryanEnrollment->update([
                'academic_year_id' => $pastSy->id,
                'grade_level_id'   => $g7->id,
                'section_id'       => $pastG7Section->id,
                'student_type'     => 'OLD',
                'general_average'  => 88.75,
                'status'           => EnrollmentStatus::APPROVED,
                'remarks'          => 'Completed Grade 7 with GWA 88.75. Promoted to Grade 8.',
            ]);
        }

        // 5. Create Past Grade Records for Ryan in S.Y. 2025-2026 (Published Form 137)
        foreach (Subject::where('grade_level_id', $g7->id)->get() as $subj) {
            Grade::updateOrCreate(
                [
                    'academic_year_id' => $pastSy->id,
                    'section_id'       => $pastG7Section->id,
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

        // Flush Cache
        Cache::flush();
    }
}
