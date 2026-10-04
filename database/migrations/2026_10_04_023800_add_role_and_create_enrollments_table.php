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
        // 1. 👤 Add Role, LRN / Employee ID, and Profile Fields to `users` table
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['STUDENT', 'TEACHER', 'REGISTRAR', 'ADMIN'])
                ->default('STUDENT')
                ->after('email')
                ->index();
            $table->string('lrn', 12)->nullable()->unique()->after('role'); // 12-digit DepEd LRN for Students
            $table->string('employee_id', 30)->nullable()->unique()->after('lrn'); // ID for Teachers/Staff
            $table->string('phone_number', 20)->nullable()->after('employee_id');
            $table->string('avatar_path')->nullable()->after('phone_number');
            $table->boolean('is_active')->default(true)->after('avatar_path');
        });

        // 2. 📝 Student Pre-Admission & Enrollment Applications Table
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_number', 30)->unique(); // e.g. "BNHS-2026-0001"
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('academic_year_id')->constrained()->cascadeOnDelete();
            $table->foreignId('grade_level_id')->constrained()->cascadeOnDelete();
            $table->foreignId('strand_id')->nullable()->constrained()->nullOnDelete(); // For SHS students
            
            // 🎯 SECTIONING: Nullable! Only REGISTRAR assigns this upon approval
            $table->foreignId('section_id')->nullable()->constrained()->nullOnDelete();

            // 📋 Student Admission Details (DepEd Basic Education Enrollment Form - BEEF)
            $table->enum('student_type', ['NEW', 'OLD', 'TRANSFEREE', 'BALIK_ARAL'])->default('NEW');
            $table->date('birthdate')->nullable();
            $table->enum('gender', ['MALE', 'FEMALE'])->nullable();
            $table->text('address')->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('guardian_contact')->nullable();
            $table->string('previous_school')->nullable();
            $table->decimal('general_average', 5, 2)->nullable(); // Last SY GWA

            // 📁 Uploaded Requirements (JSON array of file paths: PSA, Form 138/Report Card, Good Moral)
            $table->json('documents')->nullable();

            // 🚦 Enrollment & Admission Status
            $table->enum('status', [
                'PENDING_REVIEW',  // Kagagawa pa lang ng student application
                'APPROVED',        // Inaprubahan ng Registrar & may assigned section na!
                'REJECTED'         // May kulang na requirements / invalid
            ])->default('PENDING_REVIEW')->index();

            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete(); // Registrar user ID
            $table->text('remarks')->nullable(); // Reason if rejected or special instructions
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();

            $table->unique(['student_id', 'academic_year_id'], 'unique_student_sy_enrollment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollments');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'lrn', 'employee_id', 'phone_number', 'avatar_path', 'is_active']);
        });
    }
};
