<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->boolean('is_complete')->default(false)->after('address')->index();
            $table->index(['academic_year_id', 'status', 'is_complete'], 'idx_enrollments_sy_status_is_complete');
        });

        // Backfill existing records
        DB::table('enrollments')
            ->whereNotNull('guardian_name')
            ->where('guardian_name', '!=', '')
            ->whereNotNull('address')
            ->where('address', '!=', '')
            ->update(['is_complete' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropIndex('idx_enrollments_sy_status_is_complete');
            $table->dropColumn('is_complete');
        });
    }
};
