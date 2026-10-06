<?php

namespace App\Services;

class CloudinaryService
{
    public function __construct()
    {
        if (env('CLOUDINARY_URL')) {
            \Cloudinary::config_from_url(env('CLOUDINARY_URL'));
        }
    }

    /**
     * ⚡ High-Performance Image Compression & WebP Auto-Converter
     * Converts any raw JPEG/PNG/HEIC to ultra-lightweight WebP (reduces 80-90% size).
     */
    public function uploadFile(string $filePath, string $folder = 'bnhs_admissions', int $maxWidth = 1600): array
    {
        $result = \Cloudinary\Uploader::upload($filePath, [
            'folder' => $folder,
            'resource_type' => 'image',
            'format' => 'webp',                 // 👈 100% WebP format
            'quality' => 'auto:good',            // 👈 AI-driven visual optimization
            'transformation' => [
                [
                    'width' => $maxWidth,
                    'crop' => 'limit',           // 👈 Auto-resizes huge phone photos
                ],
            ],
        ]);

        return [
            'public_id' => $result['public_id'] ?? null,
            'secure_url' => $result['secure_url'] ?? null,
            'format' => $result['format'] ?? 'webp',
            'bytes' => $result['bytes'] ?? null,
        ];
    }
}
