<?php

namespace App\Modules\Academic\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Strand extends Model
{
    protected $fillable = [
        'code',
        'name',
        'track',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        $flush = function () {
            try {
                \Illuminate\Support\Facades\Cache::tags(['curriculum'])->flush();
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Cache::forget('curriculum_strands');
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
            return $cacheDriver->remember('curriculum_strands', now()->addHours(24), function () {
                return static::where('is_active', true)->orderBy('code')->get(['id', 'code', 'name', 'track'])->toArray();
            });
        } catch (\Throwable $e) {
            $cacheDriver->forget('curriculum_strands');
            return static::where('is_active', true)->orderBy('code')->get(['id', 'code', 'name', 'track'])->toArray();
        }
    }

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class);
    }
}