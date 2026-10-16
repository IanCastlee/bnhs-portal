<?php

namespace App\Console\Commands;

use App\Modules\Enrollment\Models\Enrollment;
use App\Services\CloudinaryService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class MigratePublicDocumentsToAuthenticated extends Command
{
    protected $signature = 'documents:migrate-authenticated';
    protected $description = 'Migrate existing public admission documents to authenticated Cloudinary storage and private local disk';

    public function handle(CloudinaryService $cloudinary): int
    {
        $this->info("🔒 Starting Data Privacy Act migration for student admission documents...");

        $enrollments = Enrollment::whereNotNull('documents')->get();
        $totalDocs = 0;
        $migratedCount = 0;

        foreach ($enrollments as $enrollment) {
            $docs = $enrollment->documents ?? [];
            $updated = false;

            foreach ($docs as $index => $doc) {
                $totalDocs++;
                $publicId = $doc['public_id'] ?? '';
                $resourceType = $doc['resource_type'] ?? (str_ends_with(strtolower($doc['file_name'] ?? ''), '.pdf') ? 'raw' : 'image');
                $format = $doc['format'] ?? (str_ends_with(strtolower($doc['file_name'] ?? ''), '.pdf') ? 'pdf' : 'webp');

                // 1. If Local File: Move from public disk to private local disk
                if (str_starts_with($publicId, 'local_')) {
                    $localRelPath = str_replace('local_', '', $publicId);
                    if (Storage::disk('public')->exists($localRelPath)) {
                        $content = Storage::disk('public')->get($localRelPath);
                        Storage::disk('local')->put($localRelPath, $content);
                        Storage::disk('public')->delete($localRelPath);
                        $this->line("  ✓ Moved local doc to private disk: {$localRelPath}");
                    }
                }
                // 2. If Cloudinary File: Rename type from upload -> authenticated
                elseif (!empty($publicId)) {
                    try {
                        \Cloudinary\Uploader::rename($publicId, $publicId, [
                            'type'          => 'upload',
                            'to_type'       => 'authenticated',
                            'resource_type' => $resourceType,
                            'invalidate'    => true,
                        ]);
                        $this->line("  ✓ Converted Cloudinary doc to authenticated: {$publicId}");
                    } catch (\Throwable $e) {
                        // If already authenticated or not found, proceed
                        $this->warn("  ℹ Cloudinary note for {$publicId}: " . $e->getMessage());
                    }
                }

                // 3. Remove raw file_path from JSON schema and store resource_type & format
                unset($docs[$index]['file_path']);
                $docs[$index]['resource_type'] = $resourceType;
                $docs[$index]['format'] = $format;
                $updated = true;
                $migratedCount++;
            }

            if ($updated) {
                $enrollment->update(['documents' => array_values($docs)]);
            }
        }

        $this->info("✅ Successfully processed {$totalDocs} document records across {$enrollments->count()} enrollments.");
        return Command::SUCCESS;
    }
}
