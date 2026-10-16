<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    public function __construct()
    {
        $cloudinaryUrl = config('services.cloudinary.url') ?? env('CLOUDINARY_URL');
        if ($cloudinaryUrl) {
            \Cloudinary::config_from_url($cloudinaryUrl);
        }
    }

    /**
     * ⚡ Private Authenticated Upload with WebP Auto-Compression
     * Uploads file as 'authenticated' type to prevent public URL exposure (Data Privacy Act compliance).
     */
    public function uploadFile(string $filePath, string $folder = 'bnhs_admissions', int $maxWidth = 1600): array
    {
        if (function_exists('set_time_limit')) {
            @set_time_limit(180);
        }

        $prevErrorReporting = error_reporting(E_ALL & ~E_DEPRECATED);

        try {
            $isImage = @getimagesize($filePath) !== false;
            $resourceType = $isImage ? 'image' : 'raw';

            $options = [
                'folder'        => $folder,
                'type'          => 'authenticated', // 🔒 Private authenticated storage
                'timeout'       => 20,
                'resource_type' => $resourceType,
            ];

            if ($isImage) {
                $options['format'] = 'webp';
            }

            $result = \Cloudinary\Uploader::upload($filePath, $options);

            return [
                'public_id'     => $result['public_id'] ?? null,
                'resource_type' => $result['resource_type'] ?? $resourceType,
                'format'        => $result['format'] ?? ($isImage ? 'webp' : 'pdf'),
                'bytes'         => $result['bytes'] ?? null,
            ];
        } catch (\Throwable $e) {
            Log::error("Cloudinary upload error: " . $e->getMessage(), [
                'filePath' => $filePath,
                'folder'   => $folder,
            ]);
            throw $e;
        } finally {
            error_reporting($prevErrorReporting);
        }
    }

    /**
     * 🔑 Generate a Secure Signed Inline Delivery URL for Authenticated Assets
     */
    public function signedUrl(string $publicId, ?string $format = null, string $resourceType = 'image', int $ttl = 300): string
    {
        $prevErrorReporting = error_reporting(E_ALL & ~E_DEPRECATED);

        try {
            $options = [
                'type'          => 'authenticated',
                'resource_type' => $resourceType,
                'sign_url'      => true,
                'secure'        => true,
            ];

            if (!empty($format)) {
                $options['format'] = $format;
            }

            return \Cloudinary::cloudinary_url($publicId, $options);
        } catch (\Throwable $e) {
            Log::warning("Cloudinary signedUrl error: " . $e->getMessage());
            return '';
        } finally {
            error_reporting($prevErrorReporting);
        }
    }

    /**
     * 🗑️ Delete/Destroy file on Cloudinary
     */
    public function deleteFile(string $publicId, string $resourceType = 'image'): bool
    {
        if (empty($publicId) || str_starts_with($publicId, 'local_')) {
            return false;
        }

        $prevErrorReporting = error_reporting(E_ALL & ~E_DEPRECATED);

        try {
            \Cloudinary\Uploader::destroy($publicId, [
                'type'          => 'authenticated',
                'resource_type' => $resourceType,
                'invalidate'    => true,
            ]);
            // Fallback for raw resource type or legacy upload type
            \Cloudinary\Uploader::destroy($publicId, [
                'type'          => 'upload',
                'resource_type' => $resourceType,
                'invalidate'    => true,
            ]);
            return true;
        } catch (\Throwable $e) {
            Log::warning("Cloudinary deleteFile error for {$publicId}: " . $e->getMessage());
            return false;
        } finally {
            error_reporting($prevErrorReporting);
        }
    }
}
