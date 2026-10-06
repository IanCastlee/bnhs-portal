<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
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
        // 🌐 1. GLOBAL RATE LIMITER (120 req/min)
        RateLimiter::for('global', function (Request $request) {
            return Limit::perMinute(120)
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

        // 🛑 2. STRICT LOGIN RATE LIMITER (5 attempts/min)
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->input('email') . '|' . $request->ip())
                ->response(function (Request $request, array $headers) {
                    $retryAfter = $headers['Retry-After'] ?? 60;
                    return back()->withErrors([
                        'email' => "Masyadong maraming beses na maling login. Subukan muli pagkatapos ng {$retryAfter} segundo.",
                    ])->setStatusCode(Response::HTTP_TOO_MANY_REQUESTS);
                });
        });

        // 📁 3. ADMISSION & UPLOADS (15 submissions/min)
        RateLimiter::for('admission', function (Request $request) {
            return Limit::perMinute(15)->by($request->user()?->id ?: $request->ip());
        });
    }
}