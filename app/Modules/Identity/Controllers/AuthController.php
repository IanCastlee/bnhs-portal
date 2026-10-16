<?php

namespace App\Modules\Identity\Controllers;

use App\Modules\Identity\Models\User;
use App\Modules\Enrollment\Models\Enrollment;
use App\Modules\Enrollment\Enums\EnrollmentStatus;
use App\Modules\Academic\Models\AcademicYear;
use App\Modules\Academic\Models\GradeLevel;
use App\Modules\Academic\Models\Strand;
use App\Http\Controllers\Controller;
use App\Modules\Identity\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Database\UniqueConstraintViolationException;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class AuthController extends Controller
{
    
    public function showLogin(): Response
    {
        return Inertia::render('Auth/Login');
    }

 
    public function showRegister(): Response
    {
        $gradeLevels = Cache::remember('public_grade_levels', 3600, fn () => 
            GradeLevel::orderBy('level')->get()->values()->toArray()
        );

        $strands = Cache::remember('public_active_strands', 3600, fn () => 
            Strand::where('is_active', true)->orderBy('track')->orderBy('name')->get()->values()->toArray()
        );

        return Inertia::render('Auth/Register', [
            'gradeLevels' => $gradeLevels,
            'strands' => $strands,
        ]);
    }

    
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $normalizedEmail = Str::lower(trim($credentials['email']));
        $throttleKey = 'login|' . $normalizedEmail;

        $user = User::where('email', $normalizedEmail)->first();

        // 🛡️ Timing Attack Mitigation: Constant-time Hash Check
        // If the user does not exist, compute a dummy hash verification so execution time remains identical
        $dummyHash = '$2y$12$eA8i4tJ1FzZJq5N0V1NMe.W8Wj1vD9XF9W7L5K4J3H2G1F0E9D8C7';
        $passwordValid = $user 
            ? Hash::check($credentials['password'], $user->password) 
            : Hash::check($credentials['password'], $dummyHash);

        // 🛡️ Anti-User Enumeration & Credential Verification
        // Do not leak whether the email exists or password was wrong
        if (!$user || !$passwordValid) {
            \Illuminate\Support\Facades\RateLimiter::hit($throttleKey, 60);

            return back()->withErrors([
                'email' => 'Invalid email or password. Please verify your credentials and try again.',
            ])->onlyInput('email');
        }

        // 🛡️ Account Status Check (Only verified AFTER password is confirmed)
        if (!$user->is_active) {
            \Illuminate\Support\Facades\RateLimiter::hit($throttleKey, 60);

            return back()->withErrors([
                'email' => 'This account is currently deactivated. Please contact the Bulusan NHS Administration.',
            ])->onlyInput('email');
        }

        // 🧼 Successful Authentication: Clear Rate Limiting attempts
        \Illuminate\Support\Facades\RateLimiter::clear($throttleKey);

        // 🔒 Authenticate User & Regenerate Session (Anti-Session Fixation)
        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        // 🚦 Role-Based Smart Redirection sa 4 Portals with Strict Same-Origin Sanitization
        $rawIntended = $request->session()->get('url.intended');
        $intendedPath = null;

        if ($rawIntended) {
            $parsed = parse_url($rawIntended);
            // Allow only relative internal paths (prevent open redirect attacks)
            if (empty($parsed['host']) || $parsed['host'] === $request->getHost()) {
                $intendedPath = $parsed['path'] ?? null;
            }
        }

        if ($user->role === UserRole::STUDENT) {
            if (!$user->hasVerifiedEmail()) {
                return redirect()->route('verification.notice');
            }

            // Ensure intended URL belongs exclusively to student routes
            if ($intendedPath && !str_starts_with($intendedPath, '/student')) {
                $request->session()->forget('url.intended');
                $intendedPath = null;
            }

            $enrollment = Enrollment::where('student_id', $user->id)->latest()->first();
            if (!$enrollment || $enrollment->status !== EnrollmentStatus::APPROVED) {
                return redirect()->intended('/student/admission');
            }
            return redirect()->intended('/student/dashboard');
        }

        // Staff (Admin, Registrar, Teacher) - Scoped Redirection
        $rolePrefix = match ($user->role) {
            UserRole::ADMIN => '/admin',
            UserRole::REGISTRAR => '/registrar',
            UserRole::TEACHER => '/teacher',
            default => null,
        };

        if ($rolePrefix && $intendedPath && !str_starts_with($intendedPath, $rolePrefix)) {
            $request->session()->forget('url.intended');
        }

        return match ($user->role) {
            UserRole::ADMIN => redirect()->intended('/admin/dashboard'),
            UserRole::REGISTRAR => redirect()->intended('/registrar/dashboard'),
            UserRole::TEACHER => redirect()->intended('/teacher/dashboard'),
            default => redirect()->intended('/login'),
        };
    }

    
    //Handle Student Pre-Admission / Registration Request (High Concurrency & DepEd BEEF Compliant).
    
    public function register(Request $request): RedirectResponse
    {
        $isForeignOrNoLrn = $request->boolean('is_foreign_or_no_lrn');

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'suffix' => ['nullable', 'string', 'max:20'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'lrn' => $isForeignOrNoLrn
                ? ['nullable', 'string', 'digits:12', 'unique:users,lrn']
                : ['required', 'string', 'digits:12', 'unique:users,lrn'],
            'phone_number' => ['nullable', 'string', 'regex:/^(09\d{9}|\+639\d{9})$/'],
            'applying_level' => ['nullable', 'integer', 'exists:grade_levels,level'],
            'strand_code' => ['nullable', 'string', Rule::exists('strands', 'code')->where('is_active', true)],
            'student_type' => ['nullable', 'string', Rule::in(['NEW', 'OLD', 'TRANSFEREE', 'BALIK_ARAL'])],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'lrn.required' => 'Kinakailangan ang 12-digit DepEd LRN para sa mga regular/local student. Kung ikaw ay Foreign student o walang LRN, paki-check ang Foreign/Transferee checkbox sa Step 1.',
            'lrn.digits' => 'Ang DepEd LRN ay dapat eksaktong 12 numero.',
            'lrn.unique' => 'Naka-rehistro na ang DepEd LRN na ito sa system.',
        ]);

        //  1. Verify Active Academic Year (Clear error if enrollment is closed)
        $activeSy = AcademicYear::where('is_active', true)->first();
        if (!$activeSy) {
            return back()->withErrors([
                'email' => 'Online pre-admission is currently closed. No active school year found. Please contact the BNHS Registrar.',
            ])->onlyInput('email');
        }

        $fullName = trim(
            $validated['first_name'] .
            ($request->filled('middle_name') ? ' ' . $validated['middle_name'] : '') .
            ' ' . $validated['last_name'] .
            ($request->filled('suffix') ? ' ' . $validated['suffix'] : '')
        );

        $targetLevel = (int) ($validated['applying_level'] ?? 7);
        $gradeLevel = GradeLevel::where('level', $targetLevel)->first() ?? GradeLevel::where('level', 7)->first();
        
        $strand = null;
        if (!empty($validated['strand_code'])) {
            $strand = Strand::where('code', $validated['strand_code'])->first();
        }

        //  2. Compute Bcrypt Password Hash OUTSIDE the database transaction
        $hashedPassword = Hash::make($validated['password']);

        // 🔒 3. ATOMIC DATABASE TRANSACTION
        try {
            $user = DB::transaction(function () use ($validated, $fullName, $hashedPassword, $activeSy, $gradeLevel, $strand) {
                // A. Create User Record
                $newUser = User::create([
                    'name' => $fullName,
                    'email' => Str::lower($validated['email']),
                    'lrn' => $validated['lrn'] ?? null,
                    'phone_number' => $validated['phone_number'] ?? null,
                    'password' => $hashedPassword,
                    'role' => UserRole::STUDENT,
                    'is_active' => true,
                ]);

                // B. Create Initial Enrollment record to acquire auto-incremented ID
                $syYear = explode('-', $activeSy->name)[0];
                
                $enrollment = Enrollment::create([
                    'tracking_number' => "BNHS-{$syYear}-TEMP-" . Str::random(6),
                    'student_id' => $newUser->id,
                    'academic_year_id' => $activeSy->id,
                    'grade_level_id' => $gradeLevel->id,
                    'strand_id' => $strand?->id,
                    'student_type' => $validated['student_type'] ?? 'NEW',
                    'status' => EnrollmentStatus::PENDING_REVIEW,
                    'section_id' => null,
                ]);

                // C. 🎯 ZERO-COLLISION QUEUE TICKET
                $finalTrackingNo = "BNHS-{$syYear}-Q" . str_pad($enrollment->id, 4, '0', STR_PAD_LEFT);
                $enrollment->update(['tracking_number' => $finalTrackingNo]);

                return $newUser;
            });
        } catch (UniqueConstraintViolationException $e) {
            return back()->withErrors([
                'email' => 'This email or DepEd LRN is already registered. Please login instead.',
            ])->onlyInput('email', 'lrn');
        }

        // 🛡️ 4. Authenticate & Regenerate Session
        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('verification.notice');
    }

    /**
     * Handle User Logout.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}