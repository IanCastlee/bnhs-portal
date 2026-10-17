<?php

namespace App\Modules\Identity\Models;

use App\Modules\Identity\Enums\UserRole;
use App\Modules\Enrollment\Models\Enrollment;
use App\Modules\Academic\Models\Section;
use App\Modules\Grading\Models\Grade;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'lrn',
        'employee_id',
        'phone_number',
        'avatar_path',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'is_active' => 'boolean',
        ];
    }

    public function isAdmin(): bool { return $this->role === UserRole::ADMIN; }
    public function isRegistrar(): bool { return $this->role === UserRole::REGISTRAR; }
    public function isTeacher(): bool { return $this->role === UserRole::TEACHER; }
    public function isStudent(): bool { return $this->role === UserRole::STUDENT; }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class, 'student_id');
    }

    public function latestEnrollment(): HasOne
    {
        return $this->hasOne(Enrollment::class, 'student_id')->latestOfMany();
    }

    public function advisedSections(): HasMany
    {
        return $this->hasMany(Section::class, 'adviser_id');
    }

    public function studentGrades(): HasMany
    {
        return $this->hasMany(Grade::class, 'student_id');
    }

    public function assignedGradeLevels(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(\App\Modules\Academic\Models\GradeLevel::class, 'registrar_grade_levels', 'user_id', 'grade_level_id')
            ->withTimestamps();
    }

    public function teachingLoads(): HasMany
    {
        return $this->hasMany(\App\Modules\Academic\Models\SectionSubject::class, 'teacher_id', 'id');
    }
}