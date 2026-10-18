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
        Schema::table('notifications', function (Blueprint $table) {
            $table->index(
                ['notifiable_type', 'notifiable_id', 'read_at', 'created_at'],
                'idx_notifications_unread_lookup'
            );
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->index(
                ['academic_year_id', 'status', 'is_complete', 'updated_at'],
                'idx_enrollments_sy_status_complete_updated'
            );
            $table->index(
                ['academic_year_id', 'grade_level_id', 'status', 'reviewed_at'],
                'idx_enrollments_sy_gl_status_reviewed'
            );
        });

        Schema::table('grades', function (Blueprint $table) {
            $table->index(
                ['teacher_id', 'status', 'academic_year_id'],
                'idx_grades_teacher_status_sy'
            );
        });

        Schema::table('sections', function (Blueprint $table) {
            $table->index(
                ['adviser_id', 'academic_year_id'],
                'idx_sections_adviser_sy'
            );
        });

        Schema::table('subjects', function (Blueprint $table) {
            $table->index(
                ['grade_level_id', 'strand_id'],
                'idx_subjects_gl_strand'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->dropIndex('idx_subjects_gl_strand');
        });

        Schema::table('sections', function (Blueprint $table) {
            $table->dropIndex('idx_sections_adviser_sy');
        });

        Schema::table('grades', function (Blueprint $table) {
            $table->dropIndex('idx_grades_teacher_status_sy');
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropIndex('idx_enrollments_sy_gl_status_reviewed');
            $table->dropIndex('idx_enrollments_sy_status_complete_updated');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('idx_notifications_unread_lookup');
        });
    }
};
