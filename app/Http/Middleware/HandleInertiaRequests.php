<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Cache;


class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * In-request memoized unread notifications summary to avoid duplicate queries.
     */
    private ?array $notificationsMemo = null;

    /**
     * Retrieve the active academic year from global cache (or DB once).
     */
    private function activeYear(): ?array
    {
        return \App\Modules\Academic\Models\AcademicYear::getCachedActiveArray();
    }

    /**
     * Retrieve unread notifications list and count in a single cached/memoized call.
     */
    private function unreadNotificationsSummary(Request $request): array
    {
        if ($this->notificationsMemo !== null) {
            return $this->notificationsMemo;
        }

        $user = $request->user();
        if (!$user) {
            return $this->notificationsMemo = ['items' => [], 'count' => 0];
        }

        return $this->notificationsMemo = Cache::remember(
            "user_unread_notifications_{$user->id}",
            30,
            function () use ($user) {
                $items = $user->unreadNotifications()
                    ->latest()
                    ->take(10)
                    ->get(['id', 'type', 'data', 'read_at', 'created_at'])
                    ->toArray();

                $count = count($items) < 10
                    ? count($items)
                    : $user->unreadNotifications()->count();

                return [
                    'items' => $items,
                    'count' => (int) $count,
                ];
            }
        );
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'school_settings' => function () {
                return \App\Modules\Academic\Models\SchoolSetting::getCached();
            },
            'active_academic_year' => function () {
                return $this->activeYear();
            },
            'all_academic_years' => function () {
                return Cache::remember('all_academic_years_global', 3600, function () {
                    return \App\Modules\Academic\Models\AcademicYear::select(['id', 'name', 'semester', 'is_active', 'is_enrollment_open', 'is_grading_open'])
                        ->orderBy('is_active', 'desc')
                        ->orderBy('name', 'desc')
                        ->get()
                        ->toArray();
                });
            },
            'selected_academic_year_id' => function () {
                return session('registrar_academic_year_id');
            },
            'auth' => [
                'user' => function () use ($request) {
                    $user = $request->user();
                    if (!$user) {
                        return null;
                    }

                    $activeYearId = $this->activeYear()['id'] ?? null;

                    $enrollmentStatus = null;
                    if ($user->role === \App\Modules\Identity\Enums\UserRole::STUDENT) {
                        $enrollmentStatus = Cache::remember(
                            "student_enrollment_status_{$user->id}",
                            300,
                            function () use ($user, $activeYearId) {
                                $activeEnrollment = \App\Modules\Enrollment\Models\Enrollment::where('student_id', $user->id)
                                    ->when($activeYearId, fn ($q) => $q->where('academic_year_id', $activeYearId))
                                    ->first(['id', 'status', 'academic_year_id']);

                                return (string) ($activeEnrollment?->status?->value ?? 'NOT_ENROLLED');
                            }
                        );
                    }

                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role->value ?? (string) $user->role,
                        'lrn' => $user->lrn,
                        'employee_id' => $user->employee_id,
                        'avatar_path' => $user->avatar_path,
                        'enrollment_status' => $enrollmentStatus,
                    ];
                },
                'notifications' => fn () => $this->unreadNotificationsSummary($request)['items'],
                'unread_notifications_count' => fn () => $this->unreadNotificationsSummary($request)['count'],
            ],
            'status' => fn () => $request->session()->get('status'),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info'    => fn () => $request->session()->get('info'),
                'status'  => fn () => $request->session()->get('status'),
            ],
        ];
    }
}