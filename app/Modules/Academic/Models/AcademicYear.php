<?php

namespace App\Modules\Academic\Models;

use App\Modules\Enrollment\Models\Enrollment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

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

    private static ?array $activeArrayMemo = null;
    private static bool $activeArrayLoaded = false;

    protected static function booted(): void
    {
        $flush = function () {
            self::$activeArrayMemo = null;
            self::$activeArrayLoaded = false;
           Cache::forget('active_academic_year_global');
           Cache::forget('all_academic_years_global');
        };

        static::saved($flush);
        static::deleted($flush);
    }

    /**
     * Retrieve the active academic year as a plain array from Redis cache (safe for PHP 8.4 serialization).
     */
    public static function getCachedActiveArray(): ?array
    {
        if (self::$activeArrayLoaded) {
            return self::$activeArrayMemo;
        }

        self::$activeArrayMemo =Cache::remember('active_academic_year_global', 3600, function () {
            $year = static::where('is_active', true)
                ->first(['id', 'name', 'semester', 'is_active', 'is_enrollment_open', 'is_grading_open']);

            return $year ? $year->toArray() : null;
        });

        self::$activeArrayLoaded = true;

        return self::$activeArrayMemo;
    }

    /**
     * Retrieve the active academic year hydrated as a Model instance from the cached array (0 DB queries on cache hit).
     */
    public static function getCachedActive(): ?self
    {
        $data = static::getCachedActiveArray();
        if (!$data) {
            return null;
        }

        $model = (new static())->forceFill($data);
        $model->exists = true;

        return $model;
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