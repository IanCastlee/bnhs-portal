<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // 🌐 1. GLOBAL RATE LIMITER (600 req/min per IP - Accommodates 40+ Students in Computer Labs)
        RateLimiter::for('global', function (Request $request) {
            return Limit::perMinute(600)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    $retryAfter = $headers['Retry-After'] ?? 60;
                    
                    if ($request->expectsJson() || $request->header('X-Inertia')) {
                        return response()->json([
                            'message' => "Masyadong mabilis ang iyong requests. Pakiusap maghintay ng {$retryAfter} segundo.",
                            'retry_after' => $retryAfter,
                        ], Response::HTTP_TOO_MANY_REQUESTS, $headers);
                    }

                    return response()->view('errors.429', ['retryAfter' => $retryAfter], Response::HTTP_TOO_MANY_REQUESTS, $headers);
                });
        });

        // 🛑 2. STRICT LOGIN RATE LIMITER (5 attempts/min per email, 100/min per shared IP)
        RateLimiter::for('login', function (Request $request) {
            $email = Str::lower((string) $request->input('email'));

            return [
                Limit::perMinute(5)
                    ->by('login|' . $email)
                    ->response(fn (Request $request, array $headers) => 
                        back()->withErrors([
                            'email' => "Masyadong maraming beses na maling login attempt. Subukan muli pagkatapos ng 60 segundo.",
                        ])->onlyInput('email')
                    ),
                Limit::perMinute(100)->by('login_ip|' . $request->ip()),
            ];
        });

        // 📝 3. SMART MULTI-TIER REGISTRATION LIMITER (Friendly to PH CGNAT & School Labs)
        RateLimiter::for('register', function (Request $request) {
            $email = Str::lower((string) $request->input('email'));

            return [
                // Maluwag sa IP (100/min) para protektado ang School Computer Lab & Mobile CGNAT
                Limit::perMinute(100)->by('register_ip|' . $request->ip()),
                // Mahigpit sa parehong Email (5/min) para mapigilan ang bot spam at double-submit
                Limit::perMinute(5)
                    ->by('register_email|' . $email)
                    ->response(fn (Request $request, array $headers) => 
                        back()->withErrors([
                            'email' => "Masyadong mabilis ang pag-submit gamit ang email na ito. Pakiusap maghintay ng 60 segundo.",
                        ])->onlyInput('email')
                    ),
            ];
        });

        // 📁 4. ADMISSION & UPLOADS THROTTLE (30 submissions/min)
        RateLimiter::for('admission', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
        });
    }
}