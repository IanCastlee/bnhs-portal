<?php

namespace App\Modules\Identity\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Academic\Models\AcademicYear;
use App\Modules\Academic\Models\Section;
use App\Modules\Grading\Models\Grade;
use App\Modules\Identity\Enums\UserRole;
use App\Modules\Identity\Models\AuditLog;
use App\Modules\Identity\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AdminTeacherController extends Controller
{
    /**
     * Display a listing of faculty teacher accounts.
     */
    public function index(): Response
    {
        $activeYear = AcademicYear::where('is_active', true)->first();

        $teachers = User::where('role', UserRole::TEACHER)
            ->with([
                'advisedSections' => function ($q) use ($activeYear) {
                    if ($activeYear) {
                        $q->where('academic_year_id', $activeYear->id);
                    }
                    $q->select('id', 'name', 'grade_level_id', 'adviser_id', 'academic_year_id')
                      ->with('gradeLevel:id,level,name');
                },
            ])
            ->withCount('advisedSections')
            ->orderBy('is_active', 'desc')
            ->orderBy('name', 'asc')
            ->get()
            ->map(function ($teacher) {
                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'email' => $teacher->email,
                    'employee_id' => $teacher->employee_id,
                    'phone_number' => $teacher->phone_number,
                    'avatar_path' => $teacher->avatar_path,
                    'is_active' => (bool) $teacher->is_active,
                    'email_verified_at' => $teacher->email_verified_at,
                    'created_at' => $teacher->created_at?->format('M d, Y'),
                    'advised_sections_count' => $teacher->advised_sections_count,
                    'current_advisory_sections' => $teacher->advisedSections->map(fn ($s) => [
                        'id' => $s->id,
                        'name' => $s->name,
                        'grade_name' => $s->gradeLevel?->name ?? 'Grade',
                    ]),
                ];
            });

        $totalTeachers = $teachers->count();
        $activeTeachers = $teachers->where('is_active', true)->count();
        $suspendedTeachers = $teachers->where('is_active', false)->count();
        $assignedAdvisers = $teachers->filter(fn ($t) => count($t['current_advisory_sections']) > 0)->count();

        return Inertia::render('Admin/Teachers/Index', [
            'teachers' => $teachers,
            'activeSchoolYear' => $activeYear,
            'stats' => [
                'totalTeachers' => $totalTeachers,
                'activeTeachers' => $activeTeachers,
                'suspendedTeachers' => $suspendedTeachers,
                'assignedAdvisers' => $assignedAdvisers,
            ],
        ]);
    }

    /**
     * Store a newly created teacher account.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'employee_id' => ['nullable', 'string', 'max:50', 'unique:users,employee_id'],
            'phone_number' => ['nullable', 'string', 'regex:/^(09|\+639)\d{9}$/'],
            'password' => ['nullable', 'string', Password::min(8)],
        ], [
            'phone_number.regex' => 'Please provide a valid 11-digit Philippine mobile number (e.g. 09123456789 or +639123456789).',
        ]);

        $year = date('Y');
        $employeeId = $validated['employee_id'] ?? null;
        if (empty($employeeId)) {
            $count = User::where('role', UserRole::TEACHER)->count() + 1;
            $employeeId = sprintf('TCH-%s-%03d', $year, $count);
        }

        $plainPassword = !empty($validated['password']) ? $validated['password'] : 'Teacher@' . $year;

        DB::transaction(function () use ($validated, $employeeId, $plainPassword, &$teacher) {
            $teacher = User::create([
                'name' => $validated['name'],
                'email' => strtolower($validated['email']),
                'employee_id' => $employeeId,
                'phone_number' => $validated['phone_number'] ?? null,
                'password' => Hash::make($plainPassword),
                'role' => UserRole::TEACHER,
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            AuditLog::record(
                'TEACHER_CREATED',
                "Created new Faculty Teacher account: {$teacher->name} ({$teacher->email}, ID: {$employeeId})",
                $teacher,
                ['employee_id' => $employeeId, 'email' => $teacher->email],
                'IDENTITY'
            );
        });

        return redirect()->back()->with('success', "Faculty Teacher account for {$teacher->name} created successfully. Default password: {$plainPassword}");
    }

    /**
     * Update an existing teacher profile.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        if ($user->role !== UserRole::TEACHER) {
            abort(403, 'Unauthorized action on non-teacher user.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'employee_id' => ['nullable', 'string', 'max:50', 'unique:users,employee_id,' . $user->id],
            'phone_number' => ['nullable', 'string', 'regex:/^(09|\+639)\d{9}$/'],
        ], [
            'phone_number.regex' => 'Please provide a valid 11-digit Philippine mobile number (e.g. 09123456789 or +639123456789).',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'employee_id' => $validated['employee_id'] ?? null,
            'phone_number' => $validated['phone_number'] ?? null,
        ]);

        AuditLog::record(
            'TEACHER_UPDATED',
            "Updated Faculty Teacher profile for {$user->name} ({$user->email})",
            $user,
            ['employee_id' => $user->employee_id, 'email' => $user->email],
            'IDENTITY'
        );

        return redirect()->back()->with('success', "Faculty Teacher {$user->name} updated successfully.");
    }

    /**
     * Toggle active / suspended status for a teacher account.
     */
    public function toggleActive(User $user): RedirectResponse
    {
        if ($user->role !== UserRole::TEACHER) {
            abort(403, 'Unauthorized action on non-teacher user.');
        }

        $user->update([
            'is_active' => !$user->is_active,
        ]);

        $status = $user->is_active ? 'ACTIVATED' : 'SUSPENDED';

        AuditLog::record(
            'TEACHER_STATUS_CHANGED',
            "Changed account access status for Faculty Teacher {$user->name} to {$status}",
            $user,
            ['is_active' => $user->is_active],
            'IDENTITY'
        );

        return redirect()->back()->with('success', "Teacher {$user->name}'s account is now {$status}.");
    }

    /**
     * Reset teacher password.
     */
    public function resetPassword(Request $request, User $user): RedirectResponse
    {
        if ($user->role !== UserRole::TEACHER) {
            abort(403, 'Unauthorized action on non-teacher user.');
        }

        $validated = $request->validate([
            'password' => ['required', 'string', Password::min(8)],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        AuditLog::record(
            'TEACHER_PASSWORD_RESET',
            "Reset credentials for Faculty Teacher {$user->name}",
            $user,
            [],
            'IDENTITY'
        );

        return redirect()->back()->with('success', "Password for {$user->name} has been successfully reset.");
    }

    /**
     * Safely delete a teacher account if no records are bound.
     */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->role !== UserRole::TEACHER) {
            abort(403, 'Unauthorized action on non-teacher user.');
        }

        // Safety verification: Check if teacher is assigned to an advisory section
        if ($user->advisedSections()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete this faculty teacher because they are currently assigned as an Adviser to one or more Sections. Unassign the section adviser first or deactivate the account.');
        }

        // Safety verification: Check if teacher has submitted or encoded grades
        if (Grade::where('teacher_id', $user->id)->exists()) {
            return redirect()->back()->with('error', 'Cannot delete this faculty teacher because they have existing student grade records. You may deactivate the account instead to preserve academic grading records.');
        }

        $teacherName = $user->name;
        $user->delete();

        AuditLog::record(
            'TEACHER_DELETED',
            "Deleted Faculty Teacher account: {$teacherName}",
            null,
            ['deleted_user_name' => $teacherName],
            'IDENTITY'
        );

        return redirect()->back()->with('success', "Faculty Teacher {$teacherName} has been deleted successfully.");
    }
}
