<?php

namespace App\Modules\Enrollment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Enrollment\Models\Enrollment;
use App\Modules\Identity\Models\AuditLog;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class DocumentController extends Controller
{
    /**
     * 🛡️ Secure Authorized Document Viewer (Signed On-Demand URL / Private Stream)
     * Enforces strict Data Privacy Act compliance:
     * - Admin: Can view all student credentials.
     * - Student: Can only view their OWN credentials.
     * - Registrar: Can ONLY view credentials of applicants in their assigned Grade Levels.
     * - Logs immutable audit trail with actor ID.
     */
    public function show(Request $request, Enrollment $enrollment, string $type)
    {
        $user = $request->user();

        // 1. Strict Access Control Matrix
        $allowed = match (true) {
            $user->isAdmin()     => true,
            $user->isStudent()   => $enrollment->student_id === $user->id,
            $user->isRegistrar() => $user->assignedGradeLevels()
                                        ->where('grade_levels.id', $enrollment->grade_level_id)->exists(),
            default              => false,
        };

        abort_unless($allowed, 403, 'Unauthorized. You do not have permission to view this sensitive student document.');

        // 2. Fetch document record
        $doc = collect($enrollment->documents ?? [])->firstWhere('type', $type);
        abort_if(!$doc, 404, 'Document record not found or has not been uploaded yet.');

        $publicId = $doc['public_id'] ?? '';
        $resourceType = $doc['resource_type'] ?? 'image';
        $format = $doc['format'] ?? null;

        // 3. 📜 Record in DepEd Compliance Audit Trail
        AuditLog::record(
            'DOCUMENT_VIEWED',
            "Viewed {$doc['name']} ({$type}) of applicant {$enrollment->student?->name} (LRN: {$enrollment->student?->lrn}, Ticket: {$enrollment->tracking_number})",
            $enrollment,
            [
                'document_type' => $type,
                'document_name' => $doc['name'] ?? $type,
                'tracking_no'   => $enrollment->tracking_number,
                'public_id'     => $publicId,
            ],
            'ENROLLMENT',
            $user->id
        );

        // 4. If stored on private local storage
        if (str_starts_with($publicId, 'local_')) {
            $localRelPath = str_replace('local_', '', $publicId);

            // Check private disk first, then legacy public disk
            if (Storage::disk('local')->exists($localRelPath)) {
                return response()->file(Storage::disk('local')->path($localRelPath), [
                    'Cache-Control' => 'no-cache, private, max-age=0',
                ]);
            }

            if (Storage::disk('public')->exists($localRelPath)) {
                return response()->file(Storage::disk('public')->path($localRelPath), [
                    'Cache-Control' => 'no-cache, private, max-age=0',
                ]);
            }

            abort(404, 'Local document file is missing on storage.');
        }

        // 5. If stored on Cloudinary (Authenticated with Signed On-Demand URL)
        $cloudinary = app(CloudinaryService::class);
        $signedUrl = $cloudinary->signedUrl($publicId, $format, $resourceType, 300);

        return redirect()->away($signedUrl);
    }
}
