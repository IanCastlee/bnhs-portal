<?php

namespace App\Modules\Academic\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Academic\Models\SchoolSetting;
use App\Modules\Identity\Models\AuditLog;
use App\Services\CloudinaryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminSchoolSettingController extends Controller
{
    /**
     * Display the School Branding & Identity Settings page.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Settings/Index', [
            'schoolSettings' => SchoolSetting::getCached(),
        ]);
    }

    /**
     * Update the School Name, Logo, and Institutional Information & refresh global cache.
     */
    public function update(Request $request, CloudinaryService $cloudinary): RedirectResponse
    {
        $validated = $request->validate([
            'school_name'   => ['required', 'string', 'max:150'],
            'short_name'    => ['required', 'string', 'max:60'],
            'portal_title'  => ['required', 'string', 'max:60'],
            'school_id'     => ['required', 'string', 'max:30'],
            'region'        => ['required', 'string', 'max:100'],
            'tagline'       => ['nullable', 'string', 'max:150'],
            'address'       => ['nullable', 'string', 'max:255'],
            'contact_email' => ['nullable', 'email', 'max:150'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'logo'          => ['nullable', 'file', 'image', 'max:5120'],
            'remove_logo'   => ['nullable', 'boolean'],
        ]);

        $setting = SchoolSetting::query()->first() ?? new SchoolSetting();
        $logoUrl = $setting->logo_url;

        if ($request->boolean('remove_logo')) {
            $logoUrl = null;
        }

        if ($request->hasFile('logo') && $request->file('logo')->isValid()) {
            $file = $request->file('logo');
            try {
                $logoUrl = $cloudinary->uploadPublicImage($file->getRealPath(), 'bnhs_branding');
            } catch (\Throwable $e) {
                // Fallback to inline data URI if offline or Cloudinary is unavailable
                $mime = $file->getMimeType() ?: 'image/png';
                $base64 = base64_encode(file_get_contents($file->getRealPath()));
                $logoUrl = "data:{$mime};base64,{$base64}";
            }
        }

        $setting->fill([
            'school_name'   => $validated['school_name'],
            'short_name'    => $validated['short_name'],
            'portal_title'  => $validated['portal_title'],
            'school_id'     => $validated['school_id'],
            'region'        => $validated['region'],
            'tagline'       => $validated['tagline'] ?? 'DepEd SSU OPAS & BEEF Portal',
            'address'       => $validated['address'] ?? '',
            'contact_email' => $validated['contact_email'] ?? '',
            'contact_phone' => $validated['contact_phone'] ?? '',
            'logo_url'      => $logoUrl,
        ]);
        $setting->save();

        // Clear and immediately warm the global cache
        SchoolSetting::clearCache();
        SchoolSetting::getCached();

        AuditLog::record(
            'UPDATED_SCHOOL_SETTINGS',
            "Updated school branding and identity ({$setting->school_name})",
            $setting,
            [
                'school_name'  => $setting->school_name,
                'short_name'   => $setting->short_name,
                'portal_title' => $setting->portal_title,
                'school_id'    => $setting->school_id,
                'has_logo'     => !empty($setting->logo_url),
            ],
            'SYSTEM'
        );

        return back()->with('success', 'Matagumpay na na-save at na-cache ang School Profile at Logo!');
    }
}
