<?php

namespace App\Jobs;

use App\Modules\Enrollment\Models\Enrollment;
use App\Services\CloudinaryService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class UploadEnrollmentDocumentsJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $enrollmentId,
        public array $tempFilePaths // e.g. ['psa' => '/path/to/temp/psa.jpg', 'form138' => '...']
    ) {}

    /**
     * Execute the job in background queue.
     */
    public function handle(CloudinaryService $cloudinary): void
    {
        $enrollment = Enrollment::find($this->enrollmentId);
        if (! $enrollment) {
            return;
        }

        $uploadedDocs = $enrollment->documents ?? [];

        foreach ($this->tempFilePaths as $docType => $tempPath) {
            if (File::exists($tempPath)) {
                try {
                    $result = $cloudinary->uploadFile($tempPath, "bnhs_enrollments/{$enrollment->tracking_number}");
                    $uploadedDocs[$docType] = $result['secure_url'];

                    // Burahin ang temp file sa local disk para makatipid sa storage
                    File::delete($tempPath);
                } catch (\Exception $e) {
                    Log::error("Cloudinary Upload Failed for Enrollment {$this->enrollmentId}: " . $e->getMessage());
                }
            }
        }

        // I-update ang enrollment record gamit ang permanent Cloudinary URLs
        $enrollment->update([
            'documents' => $uploadedDocs,
        ]);
    }
}
