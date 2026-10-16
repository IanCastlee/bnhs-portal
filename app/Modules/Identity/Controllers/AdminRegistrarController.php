<?php

namespace App\Modules\Identity\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Academic\Models\GradeLevel;
use App\Modules\Identity\Enums\UserRole;
use App\Modules\Identity\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminRegistrarController extends Controller
{
    /**
     * Display a listing of registrar staff accounts with assigned Grade Levels.
     */
    public function index(): Response
    {
        $registrars = User::where('role', UserRole::REGISTRAR)
            ->with(['assignedGradeLevels:id,level,name,category'])
            ->orderBy('is_active', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get all grade levels with their currently assigned registrar
        $gradeLevels = GradeLevel::with(['assignedRegistrars:id,name,email,employee_id'])
            ->orderBy('level')
            ->get()
            ->map(function ($gl) {
                $assignedUser = $gl->assignedRegistrars->first();
                return [
                    'id' => $gl->id,
                    'level' => $gl->level,
                    'name' => $gl->name,
                    'category' => $gl->category,
                    'assigned_to_user_id' => $assignedUser?->id ?? null,
                    'assigned_to_name' => $assignedUser?->name ?? null,
                    'is_assigned' => !is_null($assignedUser),
                ];
            });

        return Inertia::render('Admin/Registrars/Index', [
            'registrars' => $registrars,
            'gradeLevels' => $gradeLevels,
            'stats' => [
                'totalRegistrars' => $registrars->count(),
                'activeRegistrars' => $registrars->where('is_active', true)->count(),
                'suspendedRegistrars' => $registrars->where('is_active', false)->count(),
            ],
        ]);
    }

    /**
     * Store a newly created registrar account with assigned grade level.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'employee_id' => ['nullable', 'string', 'max:50', 'unique:users,employee_id'],
            'phone_number' => ['nullable', 'string', 'regex:/^(09|\+639)\d{9}$/'],
            'password' => ['nullable', 'string', Password::min(8)],
            'grade_level_ids' => ['nullable', 'array'],
            'grade_level_ids.*' => ['exists:grade_levels,id'],
        ], [
            'phone_number.regex' => 'Please provide a valid 11-digit Philippine mobile number (e.g. 09123456789 or +639123456789).',
        ]);

        $gradeLevelIds = $validated['grade_level_ids'] ?? [];

        // Check if any of the selected grade levels are already assigned
        if (!empty($gradeLevelIds)) {
            $alreadyAssigned = DB::table('registrar_grade_levels')
                ->join('grade_levels', 'registrar_grade_levels.grade_level_id', '=', 'grade_levels.id')
                ->join('users', 'registrar_grade_levels.user_id', '=', 'users.id')
                ->whereIn('grade_level_id', $gradeLevelIds)
                ->select('grade_levels.name as grade_name', 'users.name as registrar_name')
                ->first();

            if ($alreadyAssigned) {
                throw ValidationException::withMessages([
                    'grade_level_ids' => "{$alreadyAssigned->grade_name} is already assigned to {$alreadyAssigned->registrar_name}.",
                ]);
            }
        }

        // Auto-generate employee ID if not provided: REG-YYYY-XXX
        $employeeId = $validated['employee_id'] ?? null;
        if (empty($employeeId)) {
            $year = date('Y');
            $count = User::where('role', UserRole::REGISTRAR)->count() + 1;
            $employeeId = sprintf('REG-%s-%03d', $year, $count);
        }

        // Default password if not provided
        $plainPassword = !empty($validated['password']) ? $validated['password'] : 'Registrar@' . date('Y');

        DB::transaction(function () use ($validated, $employeeId, $plainPassword, $gradeLevelIds, &$registrar) {
            $registrar = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'employee_id' => $employeeId,
                'phone_number' => $validated['phone_number'] ?? null,
                'password' => Hash::make($plainPassword),
                'role' => UserRole::REGISTRAR,
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            if (!empty($gradeLevelIds)) {
                $registrar->assignedGradeLevels()->sync($gradeLevelIds);
            }

            \App\Modules\Identity\Models\AuditLog::record(
                'REGISTRAR_CREATED',
                "Created new Registrar staff account: {$registrar->name} ({$registrar->email}, ID: {$employeeId})",
                $registrar,
                ['employee_id' => $employeeId, 'email' => $registrar->email],
                'IDENTITY'
            );
        });

        return redirect()->back()->with('success', "Registrar account for {$registrar->name} created successfully. Default password: {$plainPassword}");
    }

    /**
     * Update an existing registrar account and grade level assignments.
     */
    public function update(Request $request, User $user)
    {
        if ($user->role !== UserRole::REGISTRAR) {
            abort(403, 'Unauthorized action on non-registrar user.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'employee_id' => ['nullable', 'string', 'max:50', 'unique:users,employee_id,' . $user->id],
            'phone_number' => ['nullable', 'string', 'regex:/^(09|\+639)\d{9}$/'],
            'grade_level_ids' => ['nullable', 'array'],
            'grade_level_ids.*' => ['exists:grade_levels,id'],
        ], [
            'phone_number.regex' => 'Please provide a valid 11-digit Philippine mobile number (e.g. 09123456789 or +639123456789).',
        ]);

        $gradeLevelIds = $validated['grade_level_ids'] ?? [];

        // Check if any selected grade level is already assigned to ANOTHER registrar
        if (!empty($gradeLevelIds)) {
            $alreadyAssigned = DB::table('registrar_grade_levels')
                ->join('grade_levels', 'registrar_grade_levels.grade_level_id', '=', 'grade_levels.id')
                ->join('users', 'registrar_grade_levels.user_id', '=', 'users.id')
                ->whereIn('grade_level_id', $gradeLevelIds)
                ->where('registrar_grade_levels.user_id', '!=', $user->id)
                ->select('grade_levels.name as grade_name', 'users.name as registrar_name')
                ->first();

            if ($alreadyAssigned) {
                throw ValidationException::withMessages([
                    'grade_level_ids' => "{$alreadyAssigned->grade_name} is already assigned to {$alreadyAssigned->registrar_name}.",
                ]);
            }
        }

        DB::transaction(function () use ($user, $validated, $gradeLevelIds) {
            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'employee_id' => $validated['employee_id'] ?? null,
                'phone_number' => $validated['phone_number'] ?? null,
            ]);

            $user->assignedGradeLevels()->sync($gradeLevelIds);

            \App\Modules\Identity\Models\AuditLog::record(
                'REGISTRAR_UPDATED',
                "Updated Registrar profile for {$user->name} ({$user->email})",
                $user,
                ['employee_id' => $user->employee_id, 'assigned_grades' => $gradeLevelIds],
                'IDENTITY'
            );
        });

        return redirect()->back()->with('success', "Registrar {$user->name} profile updated successfully.");
    }

    /**
     * Toggle active / suspended status for a registrar account.
     */
    public function toggleActive(User $user)
    {
        if ($user->role !== UserRole::REGISTRAR) {
            abort(403, 'Unauthorized action on non-registrar user.');
        }

        $user->update([
            'is_active' => !$user->is_active,
        ]);

        $status = $user->is_active ? 'ACTIVATED' : 'SUSPENDED / DEACTIVATED';

        \App\Modules\Identity\Models\AuditLog::record(
            'REGISTRAR_STATUS_CHANGED',
            "Changed account access for Registrar {$user->name} to {$status}",
            $user,
            ['is_active' => $user->is_active],
            'IDENTITY'
        );

        return redirect()->back()->with('success', "Registrar {$user->name}'s account is now {$status}.");
    }

    /**
     * Reset registrar password.
     */
    public function resetPassword(Request $request, User $user)
    {
        if ($user->role !== UserRole::REGISTRAR) {
            abort(403, 'Unauthorized action on non-registrar user.');
        }

        $validated = $request->validate([
            'password' => ['required', 'string', Password::min(8)],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        \App\Modules\Identity\Models\AuditLog::record(
            'REGISTRAR_PASSWORD_RESET',
            "Reset credentials / password for Registrar officer {$user->name}",
            $user,
            [],
            'IDENTITY'
        );

        return redirect()->back()->with('success', "Password for {$user->name} has been successfully reset.");
    }

    /**
     * Delete a registrar account.
     */
    public function destroy(User $user)
    {
        if ($user->role !== UserRole::REGISTRAR) {
            abort(403, 'Unauthorized action on non-registrar user.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'Registrar account deleted successfully.');
    }
}
