<?php

namespace App\Modules\Identity\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Identity\Mail\ResetPasswordMail;
use App\Modules\Identity\Models\AuditLog;
use App\Modules\Identity\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetController extends Controller
{
    /**
     * Show the forgot password form.
     */
    public function showForgotPassword(Request $request): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle forgot password request and send reset link email.
     */
    public function sendResetLink(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $email = Str::lower($validated['email']);
        $user = User::where('email', $email)->first();

        // 🛡️ Senior Anti-Enumeration Principle:
        // Always provide a consistent response regardless of whether the email exists in our database.
        $genericMessage = 'If your email address is registered in our portal, you will receive a secure password reset link shortly.';

        if (!$user || !$user->is_active) {
            return back()->with('status', $genericMessage);
        }

        // Generate cryptographic token
        $token = Password::broker()->createToken($user);

        // Build reset URL
        $resetUrl = url(route('password.reset', [
            'token' => $token,
            'email' => $user->email,
        ], false));

        // Dispatch queued mailable
        try {
            Mail::to($user->email)->queue(new ResetPasswordMail(
                user: $user,
                resetUrl: $resetUrl,
                expiresInMinutes: 60
            ));
        } catch (\Throwable $e) {
            Log::error("Failed to queue password reset mail for user {$user->id}: " . $e->getMessage());
        }

        AuditLog::record(
            action: 'PASSWORD_RESET_REQUESTED',
            description: "Password reset link requested for {$user->email}.",
            target: $user,
            properties: ['ip' => $request->ip()],
            module: 'AUTH',
            userId: $user->id
        );

        return back()->with('status', $genericMessage);
    }

    /**
     * Show the reset password form.
     */
    public function showResetPassword(Request $request, string $token): Response
    {
        // Kung may kasalukuyang naka-login na session sa browser, i-logout ito
        // upang hindi mag-conflict at makapag-set ng bagong password nang malinis
        if (Auth::check()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $request->query('email', ''),
        ]);
    }

    /**
     * Handle password reset submission.
     */
    public function resetPassword(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));

                AuditLog::record(
                    action: 'PASSWORD_RESET',
                    description: "User {$user->name} ({$user->email}) successfully reset their account password.",
                    target: $user,
                    properties: ['ip' => $request->ip()],
                    module: 'AUTH',
                    userId: $user->id
                );
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            // Siguruhing malinis ang session at idirekta sa login gamit ang bagong password
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->with('success', 'Your password has been successfully reset! You can now sign in with your new password.');
        }

        return back()->withErrors([
            'email' => __($status),
        ]);
    }
}
