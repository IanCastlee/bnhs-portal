<?php

namespace App\Modules\Academic\Models;

use App\Modules\Grading\Models\Grade;
use App\Modules\Academic\Models\SectionSubject;
use App\Modules\Academic\Models\Section;
use App\Modules\Academic\Models\GradeLevel;
use App\Modules\Academic\Models\Strand;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class Subject extends Model
{
    protected $fillable = [
        'grade_level_id',
        'strand_id',
        'code',
        'name',
        'semester',
    ];

    protected static function booted(): void
    {
        static::saved(function () {
            static::clearCurriculumCache();
        });

        static::deleted(function () {
            static::clearCurriculumCache();
        });
    }

    /**
     * Atomically flush all cached subjects, grade-level matrices, and stats
     * under the 'curriculum' Redis tag without touching other system caches.
     */
    public static function clearCurriculumCache(): void
    {
        try {
            Cache::tags(['curriculum'])->flush();
        } catch (\Throwable $e) {
            // fallback
        }

    // Clean plain keys
        for ($i = 7; $i <= 12; $i++) {
            Cache::forget("curriculum_subjects_sec_g{$i}_strnone");
            Cache::forget("curriculum_subjects_sec_g{$i}_strall");
        }
        Cache::forget('curriculum_subjects_stats');
    }

    /**
     * Retrieve cached curriculum subjects for a section as a plain array.
     */
    public static function getCachedForSection(Section $section): array
    {
        $cacheKey = "curriculum_subjects_sec_g{$section->grade_level_id}_str" . ($section->strand_id ?? 'none');
        $cacheDriver = Cache::supportsTags() ? Cache::tags(['curriculum']) : Cache::store();

        try {
            return $cacheDriver->remember($cacheKey, now()->addHours(24), function () use ($section) {
                $query = static::where('grade_level_id', $section->grade_level_id);

                if ($section->strand_id) {
                    $query->where(function ($q) use ($section) {
                        $q->where('strand_id', $section->strand_id)
                          ->orWhereNull('strand_id');
                    });
                }

                return $query->orderBy('code')
                    ->get(['id', 'grade_level_id', 'strand_id', 'code', 'name', 'semester'])
                    ->toArray();
            });
        } catch (\Throwable $e) {
            $cacheDriver->forget($cacheKey);
            $query = static::where('grade_level_id', $section->grade_level_id);
            if ($section->strand_id) {
                $query->where(function ($q) use ($section) {
                    $q->where('strand_id', $section->strand_id)
                      ->orWhereNull('strand_id');
                });
            }
            return $query->orderBy('code')
                ->get(['id', 'grade_level_id', 'strand_id', 'code', 'name', 'semester'])
                ->toArray();
        }
    }

    /**
     * Retrieve cached total subject stats for Admin dashboard.
     */
    public static function getCachedStats(): array
    {
        $cacheDriver = Cache::supportsTags() ? Cache::tags(['curriculum']) : Cache::store();

        return $cacheDriver->remember('curriculum_subjects_stats', now()->addHours(12), function () {
            return [
                'totalSubjects' => static::count(),
                'jhsSubjects' => static::whereHas('gradeLevel', fn ($q) => $q->where('category', 'JHS'))->count(),
                'shsSubjects' => static::whereHas('gradeLevel', fn ($q) => $q->where('category', 'SHS'))->count(),
            ];
        });
    }

    public function gradeLevel(): BelongsTo
    {
        return $this->belongsTo(GradeLevel::class, 'grade_level_id', 'id');
    }

    public function strand(): BelongsTo
    {
        return $this->belongsTo(Strand::class, 'strand_id', 'id');
    }

    public function grades(): HasMany
    {
       return $this->hasMany(Grade::class, 'subject_id', 'id');
    }

    //ahh ang bawat section ay pwd at maaring gamitin ang subject na iyun, hnd lng sa iisa?
    public function sectionSubjects(): HasMany
    {
    return $this->hasMany(SectionSubject::class, 'subject_id', 'id');
    }
}