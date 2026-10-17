<?php

namespace App\Modules\Enrollment\Models;

use App\Modules\Identity\Models\User;
use App\Modules\Academic\Models\AcademicYear;
use App\Modules\Academic\Models\GradeLevel;
use App\Modules\Academic\Models\Strand;
use App\Modules\Academic\Models\Section;
use App\Modules\Enrollment\Enums\EnrollmentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Enrollment extends Model
{
    protected $fillable = [
        'tracking_number',
        'student_id',
        'academic_year_id',
        'grade_level_id',
        'strand_id',
        'section_id',
        'student_type',
        'birthdate',
        'gender',
        'address',
        'guardian_name',
        'guardian_contact',
        'previous_school',
        'general_average',
        'documents',
        'is_complete',
        'status',
        'reviewed_by',
        'remarks',
        'reviewed_at',
    ];

    protected $casts = [
        'birthdate' => 'date',
        'general_average' => 'decimal:2',
        'documents' => 'array',
        'is_complete' => 'boolean',
        'status' => EnrollmentStatus::class,
        'reviewed_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::saving(function (Enrollment $enrollment) {
            $hasGuardian = !empty(trim((string) $enrollment->guardian_name));
            $hasAddress = !empty(trim((string) $enrollment->address));
            $enrollment->is_complete = $hasGuardian && $hasAddress;
        });
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id', 'id');
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id', 'id');
    }

    public function gradeLevel(): BelongsTo
    {
        return $this->belongsTo(GradeLevel::class, 'grade_level_id', 'id');
    }

    public function strand(): BelongsTo
    {
        return $this->belongsTo(Strand::class, 'strand_id', 'id');
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class, 'section_id', 'id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by', 'id');
    }
}