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

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class);
    }
}