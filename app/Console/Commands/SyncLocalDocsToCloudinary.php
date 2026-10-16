<?php

namespace App\Console\Commands;

use App\Modules\Enrollment\Models\Enrollment;
use App\Services\CloudinaryService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class SyncLocalDocsToCloudinary extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'docs:sync-cloudinary {--force : Force sync even if errors occur}';

    /**
     * The console command description.
     */
    protected $description = 'Sync local admission documents to Cloudinary and clean up disk space';

    /**
     * Execute the console command.
     */
    public function handle(CloudinaryService $cloudinary): int
    {
        $this->info('🔍 Scanning enrollments for local documents...');

        $enrollments = Enrollment::whereNotNull('documents')->get();
        $totalSynced = 0;
        $totalFreedBytes = 0;

        foreach ($enrollments as $enrollment) {
            $docs = $enrollment->documents ?? [];
            $updated = false;

            foreach ($docs as $index => $doc) {
                $publicId = $doc['public_id'] ?? '';
                $filePath = $doc['file_path'] ?? '';

                // Check if document is stored locally
                if (str_starts_with($publicId, 'local_') || str_contains($filePath, '/storage/admission_docs/')) {
                    $relativeStoragePath = str_replace('local_', '', $publicId);
                    $fullLocalPath = Storage::disk('public')->path($relativeStoragePath);

                    if (file_exists($fullLocalPath)) {
                        $this->line("⏳ Uploading: {$doc['name']} for Student #{$enrollment->student_id}...");

                        try {
                            $fileSize = filesize($fullLocalPath);
                            $uploadRes = $cloudinary->uploadFile(
                                $fullLocalPath,
                                "bnhs_admissions/student_{$enrollment->student_id}"
                            );

                            if (!empty($uploadRes['secure_url'])) {
                                // Update doc metadata to Cloudinary
                                $docs[$index]['file_path'] = $uploadRes['secure_url'];
                                $docs[$index]['public_id'] = $uploadRes['public_id'];
                                $docs[$index]['status'] = 'Uploaded (Cloud CDN)';

                                // Clean up local file to free disk space
                                @unlink($fullLocalPath);
                                $totalFreedBytes += $fileSize;
                                $totalSynced++;
                                $updated = true;

                                // Clean up student directory if now empty
                                $studentDir = dirname($fullLocalPath);
                                if (is_dir($studentDir)) {
                                    $remainingInStudentDir = array_diff(scandir($studentDir), ['.', '..']);
                                    if (empty($remainingInStudentDir)) {
                                        @rmdir($studentDir);
                                    }
                                }

                                $this->info("   ✅ Synced to Cloudinary: {$uploadRes['secure_url']}");
                            }
                        } catch (\Throwable $e) {
                            $this->error("   ❌ Failed to sync doc: {$e->getMessage()}");
                            Log::error("Cloudinary Sync Error for enrollment #{$enrollment->id}: " . $e->getMessage());
                        }
                    }
                }
            }

            if ($updated) {
                $enrollment->update(['documents' => array_values($docs)]);
            }
        }

        $freedMb = round($totalFreedBytes / (1024 * 1024), 2);
        $this->newLine();
        $this->info("🎉 Sync Completed! Total Synced: {$totalSynced} file(s) | Disk Space Freed: {$freedMb} MB");

        return Command::SUCCESS;
    }
}
