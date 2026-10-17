<?php

namespace App\Modules\Academic\Models;

use App\Modules\Enrollment\Models\Enrollment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicYear extends Model
{
    protected $fillable = [
        'name',
        'semester',
        'is_active',
        'is_enrollment_open',
        'is_grading_open',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_enrollment_open' => 'boolean',
        'is_grading_open' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::saved(function () {
            \Illuminate\Support\Facades\Cache::forget('active_academic_year_global');
            \Illuminate\Support\Facades\Cache::forget('all_academic_years_global');
        });

        static::deleted(function () {
            \Illuminate\Support\Facades\Cache::forget('active_academic_year_global');
            \Illuminate\Support\Facades\Cache::forget('all_academic_years_global');
        });
    }

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }
}