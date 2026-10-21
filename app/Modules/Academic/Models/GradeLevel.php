<?php

namespace App\Modules\Academic\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GradeLevel extends Model
{
    protected $fillable = [
        'level',
        'name',
        'category',
    ];

    protected static function booted(): void
    {
        $flush = function () {
            try {
                \Illuminate\Support\Facades\Cache::tags(['curriculum'])->flush();
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Cache::forget('curriculum_grade_levels');
            }
        };

        static::saved($flush);
        static::deleted($flush);
    }

    public static function getCached(): array
    {
        $cacheDriver = \Illuminate\Support\Facades\Cache::supportsTags()
            ? \Illuminate\Support\Facades\Cache::tags(['curriculum'])
            : \Illuminate\Support\Facades\Cache::store();

        try {
            return $cacheDriver->remember('curriculum_grade_levels', now()->addHours(24), function () {
                return static::orderBy('level')->get(['id', 'level', 'name', 'category'])->toArray();
            });
        } catch (\Throwable $e) {
            $cacheDriver->forget('curriculum_grade_levels');
            return static::orderBy('level')->get(['id', 'level', 'name', 'category'])->toArray();
        }
    }

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class);
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class);
    }

    public function assignedRegistrars(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(\App\Modules\Identity\Models\User::class, 'registrar_grade_levels', 'grade_level_id', 'user_id')
            ->withTimestamps();
    }
}