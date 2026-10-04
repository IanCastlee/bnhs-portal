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
        'status',
        'reviewed_by',
        'remarks',
        'reviewed_at',
    ];

    protected $casts = [
        'birthdate' => 'date',
        'general_average' => 'decimal:2',
        'documents' => 'array',
        'status' => EnrollmentStatus::class,
        'reviewed_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function gradeLevel(): BelongsTo
    {
        return $this->belongsTo(GradeLevel::class);
    }

    public function strand(): BelongsTo
    {
        return $this->belongsTo(Strand::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}