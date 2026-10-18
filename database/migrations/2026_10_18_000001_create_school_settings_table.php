<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_settings', function (Blueprint $table) {
            $table->id();
            $table->string('school_name')->default('Bulusan National High School');
            $table->string('short_name')->default('Bulusan NHS');
            $table->string('portal_title')->default('BNHS Portal');
            $table->string('school_id')->default('302196');
            $table->string('region')->default('DepEd Region V SDO');
            $table->string('tagline')->nullable()->default('DepEd SSU OPAS & BEEF Portal');
            $table->string('address')->nullable()->default('Bulusan, Sorsogon');
            $table->string('contact_email')->nullable()->default('302196@deped.gov.ph');
            $table->string('contact_phone')->nullable();
            $table->string('logo_url', 1024)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_settings');
    }
};
