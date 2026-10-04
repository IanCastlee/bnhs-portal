<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AcademicSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. 📅 Active School Year
        $syId = DB::table('academic_years')->insertGetId([
            'name' => '2026-2027',
            'semester' => 'Full Year',
            'is_active' => true,
            'is_enrollment_open' => true,
            'is_grading_open' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. 📚 Grade Levels (Grade 7 to 12)
        $levels = [
            ['level' => 7,  'name' => 'Grade 7',  'category' => 'JHS'],
            ['level' => 8,  'name' => 'Grade 8',  'category' => 'JHS'],
            ['level' => 9,  'name' => 'Grade 9',  'category' => 'JHS'],
            ['level' => 10, 'name' => 'Grade 10', 'category' => 'JHS'],
            ['level' => 11, 'name' => 'Grade 11', 'category' => 'SHS'],
            ['level' => 12, 'name' => 'Grade 12', 'category' => 'SHS'],
        ];
        foreach ($levels as $lvl) {
            DB::table('grade_levels')->insert(array_merge($lvl, ['created_at' => now(), 'updated_at' => now()]));
        }

        // 3. 🎓 Bulusan NHS Strands (Senior High)
        $strands = [
            ['code' => 'STEM', 'name' => 'Science, Technology, Engineering, and Mathematics', 'track' => 'Academic Track'],
            ['code' => 'ABM', 'name' => 'Accountancy, Business, and Management', 'track' => 'Academic Track'],
            ['code' => 'HUMSS', 'name' => 'Humanities and Social Sciences', 'track' => 'Academic Track'],
            ['code' => 'GAS', 'name' => 'General Academic Strand', 'track' => 'Academic Track'],
            ['code' => 'TVL-ICT', 'name' => 'Information and Communications Technology', 'track' => 'TVL Track'],
            ['code' => 'TVL-HE', 'name' => 'Home Economics', 'track' => 'TVL Track'],
        ];
        foreach ($strands as $str) {
            DB::table('strands')->insert(array_merge($str, ['is_active' => true, 'created_at' => now(), 'updated_at' => now()]));
        }

        // 4. 👥 4 Demo Users (1 per Role)
        $defaultPassword = Hash::make('password123');

        // Admin
        User::create([
            'name' => 'System Administrator',
            'email' => 'admin@bnhs.edu.ph',
            'role' => 'ADMIN',
            'password' => $defaultPassword,
            'is_active' => true,
        ]);

        // Registrar
        User::create([
            'name' => 'Bulosan Registrar Office',
            'email' => 'registrar@bnhs.edu.ph',
            'role' => 'REGISTRAR',
            'password' => $defaultPassword,
            'employee_id' => 'REG-2026-001',
            'is_active' => true,
        ]);

        // Teacher
        $teacher = User::create([
            'name' => 'Maria Santos (Faculty/Adviser)',
            'email' => 'teacher@bnhs.edu.ph',
            'role' => 'TEACHER',
            'password' => $defaultPassword,
            'employee_id' => 'TCH-2026-042',
            'is_active' => true,
        ]);

        // Student
        $student = User::create([
            'name' => 'Juan Dela Cruz (Student)',
            'email' => 'student@bnhs.edu.ph',
            'role' => 'STUDENT',
            'password' => $defaultPassword,
            'lrn' => '102938475612',
            'is_active' => true,
        ]);

        // 5. 👥 Sample Section (Grade 7 - Rizal with Teacher Maria as Adviser)
        $g7Id = DB::table('grade_levels')->where('level', 7)->value('id');
        $sectionId = DB::table('sections')->insertGetId([
            'academic_year_id' => $syId,
            'grade_level_id' => $g7Id,
            'adviser_id' => $teacher->id,
            'name' => 'Rizal',
            'capacity' => 45,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 6. 📖 Sample Subjects for Grade 7
        $subjects = [
            ['code' => 'ENG-7', 'name' => 'English 7'],
            ['code' => 'MATH-7', 'name' => 'Mathematics 7'],
            ['code' => 'SCI-7', 'name' => 'Science 7'],
            ['code' => 'FIL-7', 'name' => 'Filipino 7'],
            ['code' => 'AP-7', 'name' => 'Araling Panlipunan 7'],
        ];
        foreach ($subjects as $sub) {
            DB::table('subjects')->insert([
                'grade_level_id' => $g7Id,
                'code' => $sub['code'],
                'name' => $sub['name'],
                'semester' => 'Full Year',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}