<?php

namespace App\Modules\Academic\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class SchoolSetting extends Model
{
    public const CACHE_KEY = 'school_settings_global_v2';

    protected $fillable = [
        'school_name',
        'short_name',
        'portal_title',
        'school_id',
        'region',
        'tagline',
        'address',
        'contact_email',
        'contact_phone',
        'logo_url',
    ];

    /**
     * In-memory cache per HTTP request so multiple calls in the same request
     * do not even hit Redis/File cache more than once.
     */
    protected static ?array $memoryCache = null;

    /**
     * Default school identity values when no database row exists yet.
     */
    public static function defaults(): array
    {
        return [
            'school_name'   => 'Bulusan National High School',
            'short_name'    => 'Bulusan NHS',
            'portal_title'  => 'BNHS Portal',
            'school_id'     => '302196',
            'region'        => 'DepEd Region V SDO',
            'tagline'       => 'DepEd SSU OPAS & BEEF Portal',
            'address'       => 'Bulusan, Sorsogon',
            'contact_email' => '302196@deped.gov.ph',
            'contact_phone' => '',
            'logo_url'      => null,
        ];
    }

    /**
     * Fetch settings from database and format as array.
     */
    protected static function fetchFromDatabase(): array
    {
        $setting = self::query()->first();

        if (!$setting) {
            return self::defaults();
        }

        $logoUrl = $setting->logo_url;

        // 1. Auto-fix previously uploaded logo that used Cloudinary 'authenticated' type with an unsigned '/image/upload/f_auto,q_auto,w_400/' URL
        if ($logoUrl && preg_match('#/image/upload/f_auto,q_auto,w_400/(bnhs_branding/[^.]+)\.(\w+)#', $logoUrl, $matches)) {
            try {
                $signed = app(\App\Services\CloudinaryService::class)->signedUrl($matches[1], $matches[2]);
                if (!empty($signed)) {
                    $logoUrl = $signed;
                    $setting->update(['logo_url' => $logoUrl]);
                }
            } catch (\Throwable $e) {
                // Keep existing URL if signing fails
            }
        }

        // 2. Auto-fix local storage URL if public/storage symlink does not exist
        if ($logoUrl && str_starts_with($logoUrl, '/storage/school_logos/')) {
            $relativePath = str_replace('/storage/', '', $logoUrl);
            $fullPath = storage_path('app/public/' . $relativePath);
            if (is_file($fullPath)) {
                $mime = mime_content_type($fullPath) ?: 'image/png';
                $base64 = base64_encode(file_get_contents($fullPath));
                $logoUrl = "data:{$mime};base64,{$base64}";
                $setting->update(['logo_url' => $logoUrl]);
            }
        }

        // 3. Append cache-busting timestamp (?v=...) for HTTP/HTTPS URLs without query params
        if ($logoUrl && str_starts_with($logoUrl, 'http') && !str_contains($logoUrl, '?')) {
            $ts = $setting->updated_at?->timestamp ?? time();
            $logoUrl .= "?v={$ts}";
        }

        return [
            'school_name'   => $setting->school_name ?: 'Bulusan National High School',
            'short_name'    => $setting->short_name ?: 'Bulusan NHS',
            'portal_title'  => $setting->portal_title ?: 'BNHS Portal',
            'school_id'     => $setting->school_id ?: '302196',
            'region'        => $setting->region ?: 'DepEd Region V SDO',
            'tagline'       => $setting->tagline ?: 'DepEd SSU OPAS & BEEF Portal',
            'address'       => $setting->address ?? 'Bulusan, Sorsogon',
            'contact_email' => $setting->contact_email ?? '302196@deped.gov.ph',
            'contact_phone' => $setting->contact_phone ?? '',
            'logo_url'      => $logoUrl,
        ];
    }

    /**
     * Retrieve school settings from cache (In-Memory -> Redis -> File fallback -> Database once).
     */
    public static function getCached(): array
    {
        if (self::$memoryCache !== null) {
            return self::$memoryCache;
        }

        try {
            self::$memoryCache = Cache::store('redis')->rememberForever(self::CACHE_KEY, function () {
                return self::fetchFromDatabase();
            });

            return self::$memoryCache;
        } catch (\Throwable $redisError) {
            try {
                self::$memoryCache = Cache::store('file')->rememberForever(self::CACHE_KEY, function () {
                    return self::fetchFromDatabase();
                });

                return self::$memoryCache;
            } catch (\Throwable $e) {
                return self::defaults();
            }
        }
    }

    /**
     * Clear the global school settings cache across Redis and fallback stores.
     */
    public static function clearCache(): void
    {
        self::$memoryCache = null;

        try {
            Cache::store('redis')->forget(self::CACHE_KEY);
        } catch (\Throwable $e) {
            // Ignore if Redis is unreachable
        }

        try {
            Cache::store('file')->forget(self::CACHE_KEY);
        } catch (\Throwable $e) {
            // Ignore if file cache is unreachable
        }
    }
}
