<?php

namespace App\Modules\Grading\Models;

use App\Modules\Identity\Models\User;
use App\Modules\Academic\Models\AcademicYear;
use App\Modules\Academic\Models\Section;
use App\Modules\Academic\Models\Subject;
use App\Modules\Grading\Enums\GradeSubmissionStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    protected $fillable = [
        'academic_year_id',
        'section_id',
        'subject_id',
        'student_id',
        'teacher_id',
        'q1',
        'q2',
        'q3',
        'q4',
        'final_grade',
        'remarks',
        'status',
    ];

    protected $casts = [
        'q1' => 'decimal:2',
        'q2' => 'decimal:2',
        'q3' => 'decimal:2',
        'q4' => 'decimal:2',
        'final_grade' => 'decimal:2',
        'status' => GradeSubmissionStatus::class,
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }
}