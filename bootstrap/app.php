<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RoleMiddleware;
use App\Modules\Identity\Enums\UserRole;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // 🛡️ Global Web Middleware
        $middleware->web(append: [
            'throttle:global',
            HandleInertiaRequests::class,
        ]);

        // 🚦 Smart Redirection para sa mga Naka-login na:
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
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();