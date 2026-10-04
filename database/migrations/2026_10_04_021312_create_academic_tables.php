<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. 📅 Academic Years (School Year)
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();
            $table->string('name', 20)->unique(); // e.g. "2026-2027"
            $table->string('semester', 30)->default('Full Year'); // "1st Semester", "2nd Semester", "Full Year"
            $table->boolean('is_active')->default(false)->index();
            $table->boolean('is_enrollment_open')->default(false);
            $table->boolean('is_grading_open')->default(false);
            $table->timestamps();
        });

        // 2. 📚 Grade Levels (JHS: Grade 7-10 | SHS: Grade 11-12)
        Schema::create('grade_levels', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('level')->unique(); // 7, 8, 9, 10, 11, 12
            $table->string('name', 50); // e.g. "Grade 7"
            $table->enum('category', ['JHS', 'SHS']);
            $table->timestamps();
        });

        // 3. 🎓 Senior High School Strands (Bulusan NHS Tracks)
        Schema::create('strands', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique(); // STEM, ABM, HUMSS, TVL-ICT, TVL-HE, GAS
            $table->string('name'); // e.g. "Science, Technology, Engineering, and Mathematics"
            $table->string('track')->default('Academic'); // "Academic Track", "TVL Track"
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 4. 👥 Sections
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->constrained()->cascadeOnDelete();
            $table->foreignId('grade_level_id')->constrained()->cascadeOnDelete();
            $table->foreignId('strand_id')->nullable()->constrained()->nullOnDelete(); // Nullable para sa JHS (Grade 7-10)
            $table->foreignId('adviser_id')->nullable()->constrained('users')->nullOnDelete(); // Faculty Teacher / Adviser
            $table->string('name', 50); // e.g. "Rizal", "Bonifacio", "Diamond"
            $table->unsignedSmallInteger('capacity')->default(45); // Max capacity
            $table->timestamps();

            $table->index(['academic_year_id', 'grade_level_id']);
        });

        // 5. 📖 Subjects (DepEd Curriculum)
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grade_level_id')->constrained()->cascadeOnDelete();
            $table->foreignId('strand_id')->nullable()->constrained()->nullOnDelete();
            $table->string('code', 30)->unique(); // e.g. "MATH-7", "GENMATH-11"
            $table->string('name'); // e.g. "General Mathematics"
            $table->string('semester')->default('Full Year'); // Para sa SHS Semesters
            $table->timestamps();
        });

        // 6. 📊 Grades (may 3-Step DepEd Approval Status!)
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            
            // 🎯 Quarterly Grades (70 to 100)
            $table->decimal('q1', 5, 2)->nullable(); // 1st Grading
            $table->decimal('q2', 5, 2)->nullable(); // 2nd Grading
            $table->decimal('q3', 5, 2)->nullable(); // 3rd Grading
            $table->decimal('q4', 5, 2)->nullable(); // 4th Grading
            $table->decimal('final_grade', 5, 2)->nullable(); // Average ng Q1-Q4
            $table->string('remarks', 20)->nullable(); // "PASSED" or "FAILED"
            
            // 🚦 DepEd Official Workflow Status
            $table->enum('status', [
                'DRAFT',                   // Teacher still editing
                'SUBMITTED_TO_ADVISER',     // Subject teacher forwarded to Class Adviser
                'SUBMITTED_TO_REGISTRAR',   // Class Adviser forwarded to Registrar
                'PUBLISHED'                // Registrar approved & visible to Student/Parent
            ])->default('DRAFT')->index();

            $table->timestamps();

            $table->unique(['academic_year_id', 'subject_id', 'student_id'], 'unique_student_subject_grade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grades');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('sections');
        Schema::dropIfExists('strands');
        Schema::dropIfExists('grade_levels');
        Schema::dropIfExists('academic_years');
    }
};