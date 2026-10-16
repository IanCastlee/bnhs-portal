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

class TestStudentSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Update User 8 (Ryan Hilda Co)
        $user = User::find(8);
        if ($user) {
            $user->update([
                'lrn'          => '109283746501',
                'phone_number' => '09898765456',
                'is_active'    => true,
            ]);
        }

        $g8 = GradeLevel::where('level', 8)->first();
        $sy = AcademicYear::where('is_active', true)->first();
        $teacher = User::where('role', 'TEACHER')->first();

        // 2. Create Grade 8 Section
        $sec8 = Section::firstOrCreate(
            [
                'academic_year_id' => $sy->id,
                'grade_level_id'   => $g8->id,
                'name'             => 'Bonifacio',
            ],
            [
                'adviser_id' => $teacher?->id ?? 3,
                'capacity'   => 45,
            ]
        );

        // 3. Create Grade 8 Subjects
        $g8Subjects = [
            ['code' => 'ENG-8', 'name' => 'English 8'],
            ['code' => 'MATH-8', 'name' => 'Mathematics 8'],
            ['code' => 'SCI-8', 'name' => 'Science 8'],
            ['code' => 'FIL-8', 'name' => 'Filipino 8'],
            ['code' => 'AP-8', 'name' => 'Araling Panlipunan 8'],
            ['code' => 'ESP-8', 'name' => 'Edukasyon sa Pagpapakatao 8'],
            ['code' => 'TLE-8', 'name' => 'Technology & Livelihood Education 8'],
            ['code' => 'MAPEH-8', 'name' => 'MAPEH 8'],
        ];

        foreach ($g8Subjects as $sub) {
            Subject::firstOrCreate(
                [
                    'grade_level_id' => $g8->id,
                    'code'           => $sub['code'],
                ],
                [
                    'name'     => $sub['name'],
                    'semester' => 'Full Year',
                ]
            );
        }

        // 4. Update Ryan's Enrollment as Incoming Grade 8 (Old Student Promoted)
        $enrollment = Enrollment::where('student_id', 8)->first();
        if ($enrollment) {
            $enrollment->update([
                'student_type'    => 'OLD',
                'grade_level_id'  => $g8->id,
                'section_id'      => $sec8->id,
                'birthdate'       => '2012-05-14',
                'gender'          => 'MALE',
                'address'         => 'Braganza St., Central, Bulusan, Sorsogon',
                'guardian_name'   => 'Elena Hilda Co',
                'guardian_contact' => '09187654321',
                'previous_school' => 'Bulusan National High School (Grade 7 - Rizal)',
                'general_average' => 88.75,
                'status'          => EnrollmentStatus::APPROVED,
                'remarks'         => 'Promoted from Grade 7 (GWA: 88.75). Enrolled in Grade 8 - Bonifacio.',
                'reviewed_by'     => 2,
                'reviewed_at'     => now(),
            ]);
        }

        // 5. Create Grade Records for Ryan in Grade 8
        foreach (Subject::where('grade_level_id', $g8->id)->get() as $subj) {
            Grade::updateOrCreate(
                [
                    'academic_year_id' => $sy->id,
                    'section_id'       => $sec8->id,
                    'subject_id'       => $subj->id,
                    'student_id'       => 8,
                ],
                [
                    'teacher_id'  => $teacher?->id ?? 3,
                    'q1'          => 89.00,
                    'q2'          => 91.00,
                    'q3'          => null,
                    'q4'          => null,
                    'final_grade' => null,
                    'remarks'     => 'PENDING',
                    'status'      => GradeSubmissionStatus::DRAFT,
                ]
            );
        }

        Cache::flush();
    }
}
