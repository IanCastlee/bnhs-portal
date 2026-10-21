<?php

namespace App\Modules\Identity\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Identity\Mail\VerificationOtpMail;
use App\Modules\Identity\Models\AuditLog;
use App\Modules\Identity\Models\User;
use App\Modules\Enrollment\Models\Enrollment;
use App\Modules\Enrollment\Enums\EnrollmentStatus;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationController extends Controller
{
    /**
     * Display the email verification notice and OTP entry page.
     */
    public function show(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        // 1. If user is already verified, seamlessly route to their destination
        if ($user->hasVerifiedEmail()) {
            return $this->redirectVerifiedUser($user);
        }

        $otpKey = "email_verify_otp:{$user->id}";
        $attemptsKey = "email_verify_attempts:{$user->id}";
        $cooldownExpiresKey = "email_verify_cooldown_expires:{$user->id}";

        // 2. Retrieve existing valid OTP or atomically generate a new one
        $otp = Cache::get($otpKey);
        $isNewlyGenerated = false;

        if (!$otp) {
            $candidateOtp = (string) random_int(100000, 999999);
            // Cache::add is atomic (SETNX in Redis). Returns true only if key didn't exist.
            if (Cache::add($otpKey, $candidateOtp, now()->addMinutes(10))) {
                $otp = $candidateOtp;
                Cache::put($attemptsKey, 0, now()->addMinutes(10));
                $isNewlyGenerated = true;
            } else {
                $otp = Cache::get($otpKey);
            }
        }

        // 3. Generate HMAC signed temporary URL (valid for 30 minutes)
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(30),
            [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );

        // 4. Dispatch Email if freshly generated
        if ($isNewlyGenerated) {
            try {
                Mail::to($user->email)->queue(new VerificationOtpMail(
                    user: $user,
                    otp: $otp,
                    verificationUrl: $verificationUrl,
                    expiresInMinutes: 10
                ));
            } catch (\Throwable $e) {
                Log::warning("Email verification queue dispatch failed for user {$user->id}: " . $e->getMessage());
            }
        }

        // 5. Compute remaining cooldown seconds
        $cooldownExpiry = Cache::get($cooldownExpiresKey);
        $remainingCooldown = $cooldownExpiry ? max(0, $cooldownExpiry - now()->timestamp) : 0;

        // 6. Mask email for privacy (e.g., j***n@gmail.com)
        $maskedEmail = $this->maskEmail($user->email);

        return Inertia::render('Auth/VerifyEmail', [
            'email' => $user->email,
            'maskedEmail' => $maskedEmail,
            'cooldownSeconds' => $remainingCooldown,
        ]);
    }

    /**
     * Verify the 6-digit cryptographic OTP submitted by the user.
     */
    public function verifyOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'otp' => ['required', 'string', 'digits:6'],
        ]);

        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return $this->redirectVerifiedUser($user);
        }

        $otpKey = "email_verify_otp:{$user->id}";
        $attemptsKey = "email_verify_attempts:{$user->id}";

        $cachedOtp = Cache::get($otpKey);

        // 🛑 Guard 1: Check if OTP exists / expired
        if (!$cachedOtp) {
            return back()->withErrors([
                'otp' => 'The verification code has expired. Please click "Resend Code" to get a new one.',
            ]);
        }

        // 🛑 Guard 2: Atomic attempt increment & brute-force check
        $attempts = Cache::increment($attemptsKey);

        if ($attempts > 5) {
            Cache::forget($otpKey);
            Cache::forget($attemptsKey);

            return back()->withErrors([
                'otp' => 'Too many incorrect attempts. For security, your code was revoked. Please request a new one.',
            ]);
        }

        // 🔒 Guard 3: Constant-time comparison to prevent timing attacks
        if (!hash_equals((string) $cachedOtp, (string) $request->input('otp'))) {
            $remaining = max(0, 5 - $attempts);

            return back()->withErrors([
                'otp' => "Invalid verification code. You have {$remaining} attempt(s) remaining.",
            ]);
        }

        // 🎯 Success: Mark as verified & clean up cache keys
        $user->markEmailAsVerified();
        event(new Verified($user));

        Cache::forget($otpKey);
        Cache::forget($attemptsKey);
        Cache::forget("email_verify_cooldown:{$user->id}");
        Cache::forget("email_verify_cooldown_expires:{$user->id}");

        // 📜 DepEd Immutable Audit Log
        AuditLog::record(
            action: 'EMAIL_VERIFIED',
            description: "Student {$user->name} successfully verified their email address via 6-digit OTP.",
            target: $user,
            properties: ['method' => 'OTP', 'ip' => $request->ip()],
            module: 'AUTH',
            userId: $user->id
        );

        return $this->redirectVerifiedUser($user)->with('success', 'Your email address has been verified successfully!');
    }

    /**
     * Verify email via signed magic link.
     */
    public function verifyLink(Request $request, int|string $id, string $hash): RedirectResponse
    {
        $user = $request->user();

        // Check if user matches the route id
        if ((string) $user->getKey() !== (string) $id) {
            return redirect()->route('verification.notice')->withErrors([
                'otp' => 'Invalid verification link credentials.',
            ]);
        }

        // Validate hash
        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return redirect()->route('verification.notice')->withErrors([
                'otp' => 'The verification link signature is invalid.',
            ]);
        }

        if ($user->hasVerifiedEmail()) {
            return $this->redirectVerifiedUser($user);
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        Cache::forget("email_verify_otp:{$user->id}");
        Cache::forget("email_verify_attempts:{$user->id}");
        Cache::forget("email_verify_cooldown:{$user->id}");
        Cache::forget("email_verify_cooldown_expires:{$user->id}");

        AuditLog::record(
            action: 'EMAIL_VERIFIED',
            description: "Student {$user->name} verified email via Signed Magic Link.",
            target: $user,
            properties: ['method' => 'MAGIC_LINK', 'ip' => $request->ip()],
            module: 'AUTH',
            userId: $user->id
        );

        return $this->redirectVerifiedUser($user)->with('success', 'Your email has been verified via the secure magic link!');
    }

    /**
     * Resend verification code with 60-second Redis rate limit cooldown.
     */
    public function resend(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return $this->redirectVerifiedUser($user);
        }

        $cooldownKey = "email_verify_cooldown:{$user->id}";
        $cooldownExpiresKey = "email_verify_cooldown_expires:{$user->id}";

        // 🛑 Guard: Atomic 60-second cooldown per user (SETNX via Cache::add)
        $acquired = Cache::add($cooldownKey, true, now()->addSeconds(60));
        if (!$acquired) {
            $expiry = Cache::get($cooldownExpiresKey, now()->timestamp + 60);
            $secondsLeft = max(1, $expiry - now()->timestamp);

            return back()->withErrors([
                'resend' => "Please wait {$secondsLeft} second(s) before requesting another verification code.",
            ]);
        }

        Cache::put($cooldownExpiresKey, now()->addSeconds(60)->timestamp, now()->addSeconds(60));

        // Generate fresh OTP & reset attempts atomically
        $otp = (string) random_int(100000, 999999);
        Cache::put("email_verify_otp:{$user->id}", $otp, now()->addMinutes(10));
        Cache::put("email_verify_attempts:{$user->id}", 0, now()->addMinutes(10));

        // Generate signed link
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(30),
            [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );

        // Dispatch queued email
        try {
            Mail::to($user->email)->queue(new VerificationOtpMail(
                user: $user,
                otp: $otp,
                verificationUrl: $verificationUrl,
                expiresInMinutes: 10
            ));
        } catch (\Throwable $e) {
            Log::warning("Email verification queue dispatch failed on resend: " . $e->getMessage());
        }

        return back()->with('status', 'A fresh 6-digit verification code has been dispatched to your email.');
    }

    /**
     * Smart redirect helper based on student status & role.
     */
    private function redirectVerifiedUser(User $user): RedirectResponse
    {
        // 🛡️ Always clear stale url.intended to avoid routing a student into admin/registrar URLs
        session()->forget('url.intended');

        if ($user->isStudent()) {
            $enrollment = Enrollment::where('student_id', $user->id)->latest()->first();
            if (!$enrollment || $enrollment->status !== EnrollmentStatus::APPROVED) {
                return redirect('/student/admission');
            }
            return redirect('/student/dashboard');
        }

        return match ($user->role->value ?? (string) $user->role) {
            'ADMIN' => redirect('/admin/dashboard'),
            'REGISTRAR' => redirect('/registrar/dashboard'),
            'TEACHER' => redirect('/teacher/dashboard'),
            default => redirect('/login'),
        };
    }

    /**
     * Helper to mask email address for clean privacy display.
     */
    private function maskEmail(string $email): string
    {
        $parts = explode('@', $email);
        if (count($parts) !== 2) {
            return $email;
        }

        $name = $parts[0];
        $domain = $parts[1];

        $len = strlen($name);
        if ($len <= 2) {
            $maskedName = substr($name, 0, 1) . '*';
        } else {
            $maskedName = substr($name, 0, 1) . str_repeat('*', max(3, $len - 2)) . substr($name, -1);
        }

        return $maskedName . '@' . $domain;
    }
}
