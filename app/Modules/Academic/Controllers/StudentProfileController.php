<?php

namespace App\Modules\Academic\Controllers;

use App\Http\Controllers\Controller;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;

class StudentProfileController extends Controller
{
    /**
     * 📸 Upload & Update Student Profile Avatar to Cloudinary (WebP Auto-Compressed)
     */
    public function updateAvatar(Request $request, CloudinaryService $cloudinary): RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', 'file', 'image', 'max:5120'], // Max 5MB raw before client compress
        ]);

        $user = Auth::user();
        $file = $request->file('avatar');

        try {
            // Upload to Cloudinary with WebP auto-conversion
            $uploadResult = $cloudinary->uploadFile(
                $file->getRealPath(),
                "bnhs_avatars/student_{$user->id}",
                600 // max width 600px for avatar
            );

            $publicId = $uploadResult['public_id'] ?? null;
            $format = $uploadResult['format'] ?? 'webp';

            if ($publicId) {
                // Generate secure URL
                $avatarUrl = $cloudinary->signedUrl($publicId, $format, 'image', 86400 * 365); // 1-year delivery URL or direct cloudinary link
                
                // Fallback to standard cloud url if needed
                if (empty($avatarUrl)) {
                    $cloudName = env('CLOUDINARY_CLOUD_NAME', 'r7nlopd3');
                    $avatarUrl = "https://res.cloudinary.com/{$cloudName}/image/upload/f_auto,q_auto,w_600/{$publicId}.{$format}";
                }

                $user->update([
                    'avatar_path' => $avatarUrl,
                ]);

                return back()->with('success', 'Matagumpay na na-update ang iyong Profile Picture!');
            }

            return back()->withErrors(['avatar' => 'Hindi na-save ang litrato sa Cloudinary.']);
        } catch (\Throwable $e) {
            return back()->withErrors(['avatar' => 'Nabigo ang pag-upload: ' . $e->getMessage()]);
        }
    }
}
