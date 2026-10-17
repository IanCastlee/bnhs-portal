<?php

namespace App\Modules\Academic\Models;

use App\Modules\Identity\Models\User;
use App\Modules\Enrollment\Models\Enrollment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Section extends Model
{
    protected $fillable = [
        'academic_year_id',
        'grade_level_id',
        'strand_id',
        'adviser_id',
        'name',
        'capacity',
    ];

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

    public function adviser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'adviser_id', 'id');
    }

    public function enrollments(): HasMany
{
    return $this->hasMany(Enrollment::class, 'section_id', 'id');
}

    public function sectionSubjects(): HasMany
    {
        return $this->hasMany(SectionSubject::class, 'section_id', 'id');
    }

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'section_subjects', 'section_id', 'subject_id')
            ->withPivot('teacher_id', 'schedule_days', 'time_start', 'time_end', 'room')
            ->withTimestamps();
    }
}