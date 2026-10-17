<?php

namespace App\Modules\Academic\Models;

use App\Modules\Grading\Models\Grade;
use App\Modules\Academic\Models\SectionSubject;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    protected $fillable = [
        'grade_level_id',
        'strand_id',
        'code',
        'name',
        'semester',
    ];

    public function gradeLevel(): BelongsTo
    {
        return $this->belongsTo(GradeLevel::class, 'grade_level_id', 'id');
    }

    public function strand(): BelongsTo
    {
        return $this->belongsTo(Strand::class, 'strand_id', 'id');
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    //ahh ang bawat section ay pwd at maaring gamitin ang subject na iyun, hnd lng sa iisa?
    public function sectionSubjects(): HasMany
    {
    return $this->hasMany(SectionSubject::class, 'subject_id', 'id');
    }
}