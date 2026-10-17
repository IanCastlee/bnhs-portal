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
       Schema::create('section_subjects', function (Blueprint $table) {
    $table->id();

    // 1. Foreign Keys
    $table->foreignId('academic_year_id')->constrained()->cascadeOnDelete();
    $table->foreignId('section_id')->constrained()->cascadeOnDelete();
    $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
    $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete();

    // 2. Schedule Details (Opsyonal para sa Student Schedule)
    $table->string('schedule_days', 50)->nullable(); // hal. "Monday - Friday" o "Mon, Wed, Fri"
    $table->time('time_start')->nullable();           // hal. "07:30:00"
    $table->time('time_end')->nullable();             // hal. "08:30:00"
    $table->string('room', 50)->nullable();           // hal. "Room 102", "Science Lab"

    $table->timestamps();

    // 3. Composite Unique Index:
    // Bawal magkaroon ng dobleng parehong Subject sa iisang Section sa parehong School Year!
    $table->unique(['academic_year_id', 'section_id', 'subject_id'], 'unique_section_subject_per_sy');

    // 4. Performance Index para sa mabilis na paghahanap ng Teacher Load
    $table->index(['teacher_id', 'academic_year_id']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
      Schema::dropIfExists('section_subjects');
    }
};
