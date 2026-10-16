<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * High-Performance Enterprise DBA Composite Indexes for Peak Enrollment & Grading Traffic
     */
    public function up(): void
    {
        // 1. ⚡ Optimize `enrollments` table for massive registrar query scaling
        Schema::table('enrollments', function (Blueprint $table) {
            // Accelerates Registrar Queue & Sectioning queries:
            // WHERE academic_year_id = ? AND grade_level_id = ? AND status = ?
            $table->index(['academic_year_id', 'grade_level_id', 'status'], 'idx_enrollments_sy_gl_status');

            // Accelerates Section Roster queries:
            // WHERE academic_year_id = ? AND section_id = ?
            $table->index(['academic_year_id', 'section_id'], 'idx_enrollments_sy_section');
        });

        // 2. ⚡ Optimize `grades` table for teacher grade sheets & SF9 generation
        Schema::table('grades', function (Blueprint $table) {
            // Accelerates Subject Grading Sheet load:
            // WHERE academic_year_id = ? AND section_id = ? AND subject_id = ?
            $table->index(['academic_year_id', 'section_id', 'subject_id'], 'idx_grades_sy_section_subject');

            // Accelerates Student Report Card & SF9 lookups:
            // WHERE academic_year_id = ? AND student_id = ?
            $table->index(['academic_year_id', 'student_id'], 'idx_grades_sy_student');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            $table->dropIndex('idx_grades_sy_student');
            $table->dropIndex('idx_grades_sy_section_subject');
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropIndex('idx_enrollments_sy_section');
            $table->dropIndex('idx_enrollments_sy_gl_status');
        });
    }
};
