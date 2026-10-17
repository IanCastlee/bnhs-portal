<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

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
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'active_academic_year' => function () {
                return \Illuminate\Support\Facades\Cache::remember('active_academic_year_global', 3600, function () {
                    $year = \App\Modules\Academic\Models\AcademicYear::where('is_active', true)->first(['id', 'name', 'semester', 'is_enrollment_open', 'is_grading_open']);
                    return $year ? $year->toArray() : null;
                });
            },
            'all_academic_years' => function () {
                return \Illuminate\Support\Facades\Cache::remember('all_academic_years_global', 3600, function () {
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
                    if (!$request->user()) return null;

                    $activeYearId = \App\Modules\Academic\Models\AcademicYear::where('is_active', true)->value('id');

                    $enrollmentStatus = null;
                    if ($request->user()->role === \App\Modules\Identity\Enums\UserRole::STUDENT) {
                        $activeEnrollment = \App\Modules\Enrollment\Models\Enrollment::where('student_id', $request->user()->id)
                            ->when($activeYearId, fn($q) => $q->where('academic_year_id', $activeYearId))
                            ->first();

                        $enrollmentStatus = $activeEnrollment?->status?->value ?? 'NOT_ENROLLED';
                    }

                    return [
                        'id' => $request->user()->id,
                        'name' => $request->user()->name,
                        'email' => $request->user()->email,
                        'role' => $request->user()->role->value ?? (string) $request->user()->role,
                        'lrn' => $request->user()->lrn,
                        'employee_id' => $request->user()->employee_id,
                        'avatar_path' => $request->user()->avatar_path,
                        'enrollment_status' => $enrollmentStatus,
                    ];
                },
                'notifications' => $request->user() ? $request->user()->unreadNotifications()->take(10)->get() : [],
                'unread_notifications_count' => $request->user() ? $request->user()->unreadNotifications()->count() : 0,
            ],
            'status' => fn () => $request->session()->get('status'),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'status' => fn () => $request->session()->get('status'),
            ],
        ];
    }
}