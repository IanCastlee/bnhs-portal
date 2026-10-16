<?php

namespace App\Modules\Enrollment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Enrollment\Models\Enrollment;
use App\Modules\Enrollment\Enums\EnrollmentStatus;
use App\Modules\Academic\Models\GradeLevel;
use App\Modules\Academic\Models\AcademicYear;
use App\Modules\Academic\Models\Strand;
use App\Modules\Academic\Models\Section;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class AdmissionController extends Controller
{
    /**
     * 🎓 Render the Student BEEF Admission Hub
     */
    public function show(): Response
    {
        $user = Auth::user();
        $activeYear = AcademicYear::where('is_active', true)->first();

        // 1. Fetch enrollment for the ACTIVE school year
        $enrollment = Enrollment::with(['section.adviser', 'gradeLevel', 'academicYear', 'strand'])
            ->where('student_id', $user->id)
            ->when($activeYear, function ($q) use ($activeYear) {
                $q->where('academic_year_id', $activeYear->id);
            })
            ->first();

        // 2. Fetch past approved enrollment (if any) to pre-fill and detect Old Student status
        $previousEnrollment = Enrollment::with(['gradeLevel', 'academicYear', 'section'])
            ->where('student_id', $user->id)
            ->where('status', EnrollmentStatus::APPROVED)
            ->when($activeYear, function ($q) use ($activeYear) {
                $q->where('academic_year_id', '!=', $activeYear->id);
            })
            ->latest('id')
            ->first();

        $isOldStudent = $previousEnrollment !== null || ($enrollment && $enrollment->student_type === 'OLD');
        $promotedGradeLevel = null;

        if ($previousEnrollment && $previousEnrollment->gradeLevel) {
            $promotedGradeLevel = GradeLevel::where('level', $previousEnrollment->gradeLevel->level + 1)->first()
                ?? $previousEnrollment->gradeLevel;
        }

        // 3. Pre-fill household info from current or past enrollment record
        $sourceRecord = $enrollment ?? $previousEnrollment;
        $prefilledHousehold = [
            'guardian_name'    => $sourceRecord?->guardian_name ?? '',
            'guardian_contact' => $sourceRecord?->guardian_contact ?? $user->phone_number ?? '',
            'address'          => $sourceRecord?->address ?? '',
            'previous_school'  => $previousEnrollment
                ? "Bulusan National High School ({$previousEnrollment->gradeLevel?->name} - {$previousEnrollment->section?->name})"
                : ($sourceRecord?->previous_school ?? ''),
            'general_average'  => $previousEnrollment?->general_average ?? $sourceRecord?->general_average ?? '',
            'four_ps_number'   => $sourceRecord?->four_ps_number ?? '',
        ];

        $queuePosition = null;
        if ($enrollment && $enrollment->status === EnrollmentStatus::PENDING_REVIEW) {
            $queuePosition = Enrollment::where('status', EnrollmentStatus::PENDING_REVIEW)
                ->where('id', '<=', $enrollment->id)
                ->count();
        }

        return Inertia::render('Student/Admission', [
            'enrollment'          => $enrollment,
            'previousEnrollment'  => $previousEnrollment,
            'promotedGradeLevel'  => $promotedGradeLevel,
            'isOldStudent'        => $isOldStudent,
            'prefilledHousehold'  => $prefilledHousehold,
            'activeSchoolYear'    => $activeYear,
            'queuePosition'       => $queuePosition,
        ]);
    }

    /**
     * ⚡ Confirm Re-Enrollment for Promoted Old Students (1-Click)
     */
    public function confirmReEnroll(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $activeYear = AcademicYear::where('is_active', true)->firstOrFail();

        // Prevent duplicate
        $existing = Enrollment::where('student_id', $user->id)
            ->where('academic_year_id', $activeYear->id)
            ->first();

        if ($existing) {
            return back()->with('info', "Already enrolled in S.Y. {$activeYear->name}");
        }

        $previousEnrollment = Enrollment::with('gradeLevel')
            ->where('student_id', $user->id)
            ->where('status', EnrollmentStatus::APPROVED)
            ->latest('id')
            ->firstOrFail();

        $promotedLevel = GradeLevel::where('level', $previousEnrollment->gradeLevel->level + 1)->first()
            ?? $previousEnrollment->gradeLevel;

        $newTrackingNo = 'BNHS-' . explode('-', $activeYear->name)[0] . '-Q' . str_pad($user->id, 4, '0', STR_PAD_LEFT);

        Enrollment::create([
            'tracking_number'  => $newTrackingNo,
            'student_id'       => $user->id,
            'academic_year_id' => $activeYear->id,
            'grade_level_id'   => $promotedLevel->id,
            'strand_id'        => $previousEnrollment->strand_id,
            'section_id'       => null,
            'student_type'     => 'OLD',
            'birthdate'        => $previousEnrollment->birthdate,
            'gender'           => $previousEnrollment->gender,
            'address'          => $previousEnrollment->address,
            'guardian_name'    => $previousEnrollment->guardian_name,
            'guardian_contact' => $previousEnrollment->guardian_contact,
            'previous_school'  => "Bulusan National High School ({$previousEnrollment->gradeLevel?->name})",
            'general_average'  => $previousEnrollment->general_average,
            'documents'        => $previousEnrollment->documents,
            'status'           => EnrollmentStatus::PENDING_REVIEW,
        ]);

        return redirect()->route('student.admission')->with('success', "Congratulations! Re-enrollment submitted for S.Y. {$activeYear->name} ({$promotedLevel->name}).");
    }

    /**
     * 📝 Update Student Household & Guardian Information (Step 2)
     */
    public function updateHousehold(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $enrollment = Enrollment::where('student_id', $user->id)->latest()->firstOrFail();

        if ($enrollment->status === 'APPROVED') {
            return back()->withErrors(['guardian_name' => 'Naka-lock na ang iyong rekord. Bawal nang baguhin ang impormasyon dahil opisyal nang APPROVED ang iyong enrollment para sa School Year na ito.']);
        }

        $validated = $request->validate([
            'guardian_name'    => ['required', 'string', 'max:150'],
            'guardian_contact' => ['required', 'string', 'max:30'],
            'address'          => ['required', 'string', 'max:500'],
            'previous_school'  => ['nullable', 'string', 'max:200'],
            'general_average'  => ['nullable', 'numeric', 'between:70,100'],
            'is_4ps'           => ['nullable', 'boolean'],
            'four_ps_number'   => ['nullable', 'string', 'max:50'],
        ]);

        $enrollment->update([
            'guardian_name'    => $validated['guardian_name'],
            'guardian_contact' => $validated['guardian_contact'],
            'address'          => $validated['address'],
            'previous_school'  => $validated['previous_school'] ?? $enrollment->previous_school,
            'general_average'  => $validated['general_average'] ?? $enrollment->general_average,
        ]);

        return back()->with('success', 'Household information successfully saved.');
    }

    /**
     * ☁️ Get Cloudinary Direct Upload Signature (Authenticated / Data Privacy Act Compliant)
     */
    public function getCloudinarySignature(Request $request)
    {
        $user = Auth::user();
        $timestamp = time();
        $folder = "bnhs_admissions/student_{$user->id}";

        $cloudinaryUrl = config('services.cloudinary.url') ?? env('CLOUDINARY_URL');
        $parsed = parse_url($cloudinaryUrl);
        $apiSecret = $parsed['pass'] ?? '';
        $apiKey = $parsed['user'] ?? '';
        $cloudName = $parsed['host'] ?? '';

        $paramsToSign = [
            'folder'    => $folder,
            'timestamp' => $timestamp,
            'type'      => 'authenticated',
        ];
        ksort($paramsToSign);

        $queryString = '';
        foreach ($paramsToSign as $key => $val) {
            $queryString .= "{$key}={$val}&";
        }
        $queryString = rtrim($queryString, '&') . $apiSecret;
        $signature = sha1($queryString);

        return response()->json([
            'signature'     => $signature,
            'timestamp'     => $timestamp,
            'api_key'       => $apiKey,
            'cloud_name'    => $cloudName,
            'folder'        => $folder,
            'type'          => 'authenticated',
        ]);
    }

    /**
     * 💾 Save Cloudinary Document Reference (Public ID & Resource Type only - No Public Raw URLs)
     */
    public function saveDocRecord(Request $request, CloudinaryService $cloudinary): RedirectResponse
    {
        $user = Auth::user();
        $enrollment = Enrollment::where('student_id', $user->id)->latest()->firstOrFail();

        if ($enrollment->status === 'APPROVED') {
            return back()->withErrors(['type' => 'Naka-lock na ang iyong mga dokumento dahil opisyal nang APPROVED ang iyong enrollment.']);
        }

        $validated = $request->validate([
            'type'          => ['required', 'string', 'in:psa,form137,good_moral,id_photo'],
            'name'          => ['required', 'string', 'max:150'],
            'file_name'     => ['required', 'string', 'max:255'],
            'file_size'     => ['required', 'string', 'max:50'],
            'public_id'     => ['required', 'string', 'starts_with:bnhs_admissions/student_' . $user->id . '/'],
            'resource_type' => ['required', 'string', 'in:image,raw,auto'],
            'format'        => ['nullable', 'string', 'max:20'],
            'uploaded_at'   => ['required', 'string'],
        ]);

        $docs = $enrollment->documents ?? [];

        // 🧹 Clean up old file if replacing
        foreach ($docs as $oldDoc) {
            if (($oldDoc['type'] ?? '') === $validated['type']) {
                $oldPublicId = $oldDoc['public_id'] ?? '';
                if (!empty($oldPublicId)) {
                    if (str_starts_with($oldPublicId, 'local_')) {
                        $oldLocalPath = str_replace('local_', '', $oldPublicId);
                        Storage::disk('local')->delete($oldLocalPath);
                        Storage::disk('public')->delete($oldLocalPath);
                    } else {
                        $cloudinary->deleteFile($oldPublicId, $oldDoc['resource_type'] ?? 'image');
                    }
                }
            }
        }

        $docs = array_filter($docs, fn ($d) => ($d['type'] ?? '') !== $validated['type']);
        $docs[] = array_merge($validated, ['status' => 'Uploaded / In Queue']);

        $updateData = ['documents' => array_values($docs)];
        $wasRejected = $enrollment->status === EnrollmentStatus::REJECTED;

        if ($wasRejected) {
            $updateData['status'] = EnrollmentStatus::PENDING_REVIEW;
            $prevRemarks = $enrollment->remarks ? " (Previous note: {$enrollment->remarks})" : '';
            $updateData['remarks'] = "Resubmitted by applicant after correction.{$prevRemarks}";
        }

        $enrollment->update($updateData);

        if ($wasRejected) {
            \App\Modules\Identity\Models\AuditLog::record(
                'ENROLLMENT_RESUBMITTED',
                "Applicant {$user->name} resubmitted {$validated['name']} after rejection/return. Ticket {$enrollment->tracking_number} moved back to PENDING_REVIEW.",
                $enrollment,
                ['resubmitted_doc' => $validated['name'], 'tracking_number' => $enrollment->tracking_number],
                'ENROLLMENT',
                $user->id
            );
        }

        return back()->with('success', "{$validated['name']} successfully uploaded!" . ($wasRejected ? ' Application is now back in Registrar queue for re-evaluation.' : ''));
    }

    /**
     * 📤 Handle Document Upload for Step 3 Admission Credentials
     */
    public function upload(Request $request, CloudinaryService $cloudinary): RedirectResponse
    {
        $user = Auth::user();
        $enrollment = Enrollment::where('student_id', $user->id)->latest()->firstOrFail();

        if ($enrollment->status === 'APPROVED') {
            return back()->withErrors(['file' => 'Naka-lock na ang iyong mga dokumento. Bawal nang mag-reupload dahil opisyal nang APPROVED ang iyong enrollment para sa School Year na ito.']);
        }

        $docType = $request->input('doc_type');
        $fileRules = $docType === 'id_photo'
            ? ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:10240']
            : ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'];

        $request->validate([
            'doc_type' => ['required', 'string', 'in:psa,form137,good_moral,id_photo'],
            'file'     => $fileRules,
        ], [
            'file.mimes' => $docType === 'id_photo'
                ? 'Bawal ang file na ito. Larawan lamang (JPG, PNG, WEBP) ang tinatanggap para sa 2x2 ID Photo.'
                : 'Bawal ang file na ito. PDF o Larawan (JPG, PNG, WEBP) lamang ang tinatanggap.',
            'file.max'   => 'Masyadong malaki ang file. Hanggang 10MB lamang ang pinapayagan.',
            'file.file'  => 'Maling file format o corrupted file.',
        ]);

        $file = $request->file('file');
        $docType = $request->input('doc_type');

        $docTitles = [
            'psa'        => 'PSA Birth Certificate',
            'form137'    => 'DepEd Form 137 / SF10',
            'good_moral' => 'Certificate of Good Moral',
            'id_photo'   => '2x2 Formal ID Photo',
        ];

        $docTitle = $docTitles[$docType] ?? ucfirst(str_replace('_', ' ', $docType));
        $publicId = '';
        $resourceType = 'image';
        $format = 'webp';
        $fileSizeFormatted = round($file->getSize() / 1024, 1) . ' KB';

        $isCloudinaryConfigured = !empty(config('services.cloudinary.url') ?? env('CLOUDINARY_URL'));

        if ($isCloudinaryConfigured) {
            try {
                $uploadRes = $cloudinary->uploadFile(
                    $file->getRealPath(),
                    "bnhs_admissions/student_{$user->id}"
                );
                $publicId = $uploadRes['public_id'] ?? '';
                $resourceType = $uploadRes['resource_type'] ?? 'image';
                $format = $uploadRes['format'] ?? ($resourceType === 'raw' ? 'pdf' : 'webp');
            } catch (\Throwable $e) {
                Log::warning("Cloudinary upload failed: " . $e->getMessage());
            }
        }

        // Fail explicitly if Cloudinary upload failed (No saving to local storage)
        if (empty($publicId)) {
            return back()->withErrors([
                'file' => 'Failed to upload: Low internet connection. Please try again.',
            ]);
        }

        $newDoc = [
            'type'          => $docType,
            'name'          => $docTitle,
            'file_name'     => $file->getClientOriginalName(),
            'file_size'     => $fileSizeFormatted,
            'public_id'     => $publicId,
            'resource_type' => $resourceType,
            'format'        => $format,
            'status'        => 'Uploaded / In Queue',
            'uploaded_at'   => now()->toDateTimeString(),
        ];

        $docs = $enrollment->documents ?? [];

        // 🧹 Clean up old file (Local Disk or Cloudinary Cloud) if replacing a previous upload
        foreach ($docs as $oldDoc) {
            if (($oldDoc['type'] ?? '') === $docType) {
                $oldPublicId = $oldDoc['public_id'] ?? '';
                if (str_starts_with($oldPublicId, 'local_')) {
                    $oldLocalPath = str_replace('local_', '', $oldPublicId);
                    Storage::disk('local')->delete($oldLocalPath);
                    Storage::disk('public')->delete($oldLocalPath);
                } elseif (!empty($oldPublicId) && $isCloudinaryConfigured) {
                    $cloudinary->deleteFile($oldPublicId, $oldDoc['resource_type'] ?? 'image');
                }
            }
        }

        $docs = array_filter($docs, fn ($d) => ($d['type'] ?? '') !== $docType);
        $docs[] = $newDoc;

        $updateData = ['documents' => array_values($docs)];
        $wasRejected = $enrollment->status === EnrollmentStatus::REJECTED;

        if ($wasRejected) {
            $updateData['status'] = EnrollmentStatus::PENDING_REVIEW;
            $prevRemarks = $enrollment->remarks ? " (Previous note: {$enrollment->remarks})" : '';
            $updateData['remarks'] = "Resubmitted by applicant after correction.{$prevRemarks}";
        }

        $enrollment->update($updateData);

        if ($wasRejected) {
            \App\Modules\Identity\Models\AuditLog::record(
                'ENROLLMENT_RESUBMITTED',
                "Applicant {$user->name} resubmitted {$docTitle} after rejection/return. Ticket {$enrollment->tracking_number} moved back to PENDING_REVIEW.",
                $enrollment,
                ['resubmitted_doc' => $docTitle, 'tracking_number' => $enrollment->tracking_number],
                'ENROLLMENT',
                $user->id
            );
        }

        return back()->with('success', "{$docTitle} successfully uploaded!" . ($wasRejected ? ' Application is now back in Registrar queue for re-evaluation.' : ''));
    }
}
