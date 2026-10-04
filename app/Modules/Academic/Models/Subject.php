<?php

namespace App\Modules\Academic\Models;

use App\Modules\Grading\Models\Grade;
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
        return $this->belongsTo(GradeLevel::class);
    }

    public function strand(): BelongsTo
    {
        return $this->belongsTo(Strand::class);
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }
}