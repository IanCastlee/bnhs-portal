<?php

namespace App\Modules\Academic\Models;

use App\Modules\Identity\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

class Announcement extends Model
{
    protected $fillable = [
        'author_id',
        'title',
        'caption',
        'image_url',
        'tag',
        'is_pinned',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
    ];

    /**
     * ⚡ BULLETPROOF AUTO-CACHE INVALIDATOR:
     * Awtomatikong iki-clear ang feed cache kapag may nag-create, nag-edit, o nag-delete ng post!
     */
    protected static function booted(): void
    {
        static::saved(function () {
            Cache::forget('school_announcements_first_20');
        });

        static::deleted(function () {
            Cache::forget('school_announcements_first_20');
        });
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id', 'id');
    }
}
