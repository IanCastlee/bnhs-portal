<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RoleMiddleware;
use App\Modules\Identity\Enums\UserRole;
use App\Modules\Identity\Models\AuditLog;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Trust Proxies (Cloudflare, Nginx, Load Balancers para sa totoong Client IP)
        $middleware->trustProxies(at: '*');

        // Global Web Middleware
        $middleware->web(append: [
            'throttle:global',
            HandleInertiaRequests::class,
        ]);

        // Smart Redirection para sa mga Naka-login na:
        $middleware->redirectUsersTo(function (Request $request) {
            $user = $request->user();
            if (! $user) {
                return '/login';
            }

            $role = $user->role->value ?? (string) $user->role;

            return match ($role) {
                'ADMIN' => '/admin/dashboard',
                'REGISTRAR' => '/registrar/dashboard',
                'TEACHER' => '/teacher/dashboard',
                'STUDENT' => '/student/dashboard',
                default => '/login',
            };
        });

        $middleware->alias([
            'role' => RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->dontReportDuplicates();

        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // 1. Clean Structured Error Logging (Zero Vendor Stack Trace Noise)
        $exceptions->report(function (\Throwable $e) {
            $basePath = base_path() . DIRECTORY_SEPARATOR;
            $relativeFile = str_replace($basePath, '', $e->getFile());

            // Kunin lamang ang mga stack frames na nasa loob ng proyekto (app, routes, database)
            $appFrames = collect($e->getTrace())
                ->filter(function (array $frame) use ($basePath) {
                    $file = $frame['file'] ?? '';
                    return $file !== ''
                        && str_starts_with($file, $basePath)
                        && !str_contains($file, DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR);
                })
                ->take(8)
                ->map(function (array $frame) use ($basePath) {
                    $file = str_replace($basePath, '', $frame['file'] ?? 'unknown');
                    $line = $frame['line'] ?? 0;
                    $class = $frame['class'] ?? '';
                    $func = $frame['function'] ?? '';
                    $call = $class ? "{$class}::{$func}" : $func;
                    return "{$file}:{$line} ({$call})";
                })
                ->values()
                ->all();

            $req = request();
            $user = $req?->user();

            Log::error("[BNHS SYSTEM ERROR] {$e->getMessage()}", [
                'exception'  => get_class($e),
                'location'   => "{$relativeFile}:{$e->getLine()}",
                'method'     => $req?->method(),
                'url'        => $req?->fullUrl(),
                'user_id'    => $user?->id,
                'user_email' => $user?->email,
                'user_role'  => $user ? ($user->role->value ?? (string) $user->role) : 'GUEST',
                'ip'         => $req?->ip(),
                'app_trace'  => $appFrames,
            ]);

            // Itala rin sa AuditLog kung authenticated user ang nakaranas ng unhandled 500 error
            if ($user) {
                try {
                    AuditLog::record(
                        'SYSTEM_ERROR',
                        "System exception sa {$req->method()} {$req->path()}: {$e->getMessage()}",
                        null,
                        [
                            'exception' => get_class($e),
                            'location'  => "{$relativeFile}:{$e->getLine()}",
                            'url'       => $req->fullUrl(),
                        ],
                        'SYSTEM',
                        $user->id
                    );
                } catch (\Throwable) {
                    // Huwag hayaang mag-crash kung ang database mismo ang may problema
                }
            }

            // Return false upang pigilan ang default 60-line vendor stack trace dump ng Laravel
            return false;
        });

        // 2. Global Graceful Error Renderer para sa Inertia Toaster at JSON Requests
        $exceptions->render(function (\Throwable $e, Request $request) {
            // Hayaan ang Laravel na mag-handle ng standard form validation (422) at login redirect (401)
            if ($e instanceof ValidationException || $e instanceof AuthenticationException) {
                return null;
            }

            // Session Expired / CSRF Token Mismatch (419)
            if ($e instanceof TokenMismatchException || ($e instanceof HttpExceptionInterface && $e->getStatusCode() === 419)) {
                if ($request->expectsJson()) {
                    return response()->json(['message' => 'Nag-expire na ang iyong session. Pakisubukan muli.'], 419);
                }
                return redirect()->route('login', ['expired' => 1])
                    ->with('warning', 'Nag-expire na ang iyong session. Mangyaring mag-login muli.');
            }

            $status = $e instanceof HttpExceptionInterface
                ? $e->getStatusCode()
                : ($e instanceof AuthorizationException ? 403 : ($e instanceof ModelNotFoundException ? 404 : 500));

            $isDebug = (bool) config('app.debug');

            $friendlyMessage = match ($status) {
                403 => $e->getMessage() ?: 'Wala kang sapat na pahintulot para sa aksyong ito.',
                404 => 'Hindi mahanap ang hinihinging record o pahina.',
                429 => 'Masyadong maraming request. Maghintay ng ilang segundo bago ulitin.',
                503 => 'Kasalukuyang sumasailalim sa maintenance ang system.',
                default => $isDebug
                    ? "Server Error: {$e->getMessage()} (" . basename($e->getFile()) . ":{$e->getLine()})"
                    : 'Nagkaroon ng hindi inaasahang problema sa server. Naitala na ito sa system logs.',
            };

            // Para sa mga fetch / AJAX JSON endpoints (tulad ng Excel parser at Subject modal loader)
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'message' => $friendlyMessage,
                    'status'  => $status,
                ], $status);
            }

            // Para sa Inertia Requests o Form Submissions (POST, PUT, PATCH, DELETE)
            $isInertia = (bool) $request->header('X-Inertia');
            $isMutation = !$request->isMethod('GET');
            $referer = $request->headers->get('referer');
            $canSafelyRedirectBack = $isMutation || ($isInertia && $referer && $referer !== $request->fullUrl());

            if ($canSafelyRedirectBack) {
                $flashType = in_array($status, [429, 419], true) ? 'warning' : 'error';
                return back()->with($flashType, $friendlyMessage);
            }

            return null;
        });
    })->create();